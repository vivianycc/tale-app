const admin = require("firebase-admin");
const path = require("path");
const serviceAccount = require(path.resolve(__dirname, "../service-account.json"));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const uid = process.argv[2];
if (!uid) {
  console.error("usage: node scripts/seed-user-data.js <uid>");
  process.exit(1);
}

const PETS = [
  { name: "Mochi", species: "cat", breed: "米克斯", sex: "female", birthday: "2022-03-14", neutered: true, chipNumber: "900123456789001", photoUrl: "" },
  { name: "Biscuit", species: "cat", breed: "英國短毛貓", sex: "male", birthday: "2020-08-02", neutered: true, chipNumber: "900123456789002", photoUrl: "" },
];

const FOODS_PER_PET = 5;
const DIARY_DAYS = 30;
const RECORDS_PER_DAY = [1, 2, 3]; // randomly pick one
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmt = (d) => d.toISOString().slice(0, 10);

async function run() {
  const foodsSnap = await db.collection("foods").get();
  const allFoods = foodsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (allFoods.length === 0) throw new Error("no foods in /foods — seed those first");

  const batch = db.batch();

  // user doc
  batch.set(db.doc(`users/${uid}`), { email: "demo@example.com" }, { merge: true });

  for (const pet of PETS) {
    const petRef = db.doc(`users/${uid}/pets/${pet.name}`);
    batch.set(petRef, pet);

    // pick N distinct favorite foods
    const shuffled = [...allFoods].sort(() => Math.random() - 0.5);
    const favFoods = shuffled.slice(0, FOODS_PER_PET);
    for (const food of favFoods) {
      batch.set(petRef.collection("foods").doc(food.id), {
        food,
        rating: 3 + Math.floor(Math.random() * 3), // 3-5
        comment: pick(["很愛吃", "一下就吃完", "挑食，但會吃", "偶爾吃"]),
      });
    }

    // diary: last N days
    const today = new Date();
    for (let i = 0; i < DIARY_DAYS; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = fmt(d);
      const count = pick(RECORDS_PER_DAY);
      const foodRecord = Array.from({ length: count }, () => {
        const f = pick(favFoods);
        const hour = 6 + Math.floor(Math.random() * 16);
        const min = Math.floor(Math.random() * 60);
        return {
          foodBrand: f.brand,
          foodProduct: f.product || "",
          foodFlavor: f.flavor,
          foodId: f.id,
          calories: f.calories || 80,
          portion: 20 + Math.floor(Math.random() * 60),
          time: `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
        };
      }).sort((a, b) => a.time.localeCompare(b.time));

      batch.set(petRef.collection("diaries").doc(dateStr), { foodRecord });
    }
  }

  await batch.commit();
  console.log(`Seeded user ${uid}: ${PETS.length} pets, ${FOODS_PER_PET} foods each, ${DIARY_DAYS} days of diary.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
