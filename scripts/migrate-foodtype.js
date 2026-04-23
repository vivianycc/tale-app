const admin = require("firebase-admin");
const path = require("path");
const serviceAccount = require(path.resolve(__dirname, "../service-account.json"));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const CANONICAL = ["complete", "complementary", "treat", "supplement"];

const inferFoodType = (food) => {
  if (CANONICAL.includes(food.foodType)) return food.foodType;
  if (food.foodType === "treat") return "treat";
  if (food.foodType === "supplement") return "supplement";
  if (food.foodType === "" || !food.foodType) return "complete";
  return "complete"; // dry/wet/air-dried/freeze-dried → main food
};

async function run() {
  const foodsSnap = await db.collection("foods").get();
  const updates = new Map(); // id → new foodType

  const foodsBatch = db.batch();
  for (const d of foodsSnap.docs) {
    const newType = inferFoodType(d.data());
    updates.set(d.id, newType);
    foodsBatch.update(d.ref, { foodType: newType });
  }
  await foodsBatch.commit();
  console.log(`Updated ${updates.size} foods in /foods`);

  const favFoodsGroup = await db.collectionGroup("foods").get();
  const petFavs = favFoodsGroup.docs.filter(
    (d) => d.ref.path.startsWith("users/")
  );
  let favUpdated = 0;
  for (let i = 0; i < petFavs.length; i += 400) {
    const batch = db.batch();
    for (const d of petFavs.slice(i, i + 400)) {
      const data = d.data();
      const id = data.food?.id;
      if (!id || !updates.has(id)) continue;
      batch.update(d.ref, { "food.foodType": updates.get(id) });
      favUpdated++;
    }
    await batch.commit();
  }
  console.log(`Updated ${favUpdated} favorited food snapshots`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
