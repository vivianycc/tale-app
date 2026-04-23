const admin = require("firebase-admin");
const path = require("path");
const foods = require("./foods-generated.json");

const serviceAccount = require(path.resolve(__dirname, "../service-account.json"));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const toArray = (v) => (Array.isArray(v) ? v : []);

const transform = (f) => ({
  brand: f.brand || "",
  product: f.product || "",
  flavor: f.flavor || "",
  foodType: f.foodType || "",
  origin: f.origin || "",
  weight: Number(f.weight) || null,
  calories: Number(f.calories) || null,
  water: Number(f.water) || null,
  protein: Number(f.protein) || null,
  fat: Number(f.fat) || null,
  carbonhydrate: Number(f.carbonhydrate) || null,
  ash: Number(f.ash) || null,
  fibre: Number(f.fibre) || null,
  calcium: Number(f.calcium) || null,
  phosphorus: Number(f.phosphorus) || null,
  vitd3: Number(f.vitd3) || null,
  taurine: Number(f.taurine) || null,
  zinc: Number(f.zinc) || null,
  manganese: Number(f.manganese) || null,
  iodine: Number(f.iodine) || null,
  vite: Number(f.vite) || null,
  ingredient: toArray(f.ingredient),
  nonMeatElement: toArray(f.nonMeatElement),
  createdBy: "seed",
});

async function run() {
  const col = db.collection("foods");
  const batch = db.batch();
  for (const f of foods) batch.set(col.doc(), transform(f));
  await batch.commit();
  console.log(`Seeded ${foods.length} generated foods.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
