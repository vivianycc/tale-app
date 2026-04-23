const admin = require("firebase-admin");
const path = require("path");
const foods = require("../src/data.json");

const serviceAccount = require(path.resolve(__dirname, "../service-account.json"));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const toNumber = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  if (typeof v === "number") return v;
  const n = parseFloat(String(v).replace("%", ""));
  return Number.isFinite(n) ? n : null;
};

const transform = (f) => ({
  brand: f.brand || "",
  product: f.product || "",
  flavor: f.flavor || "",
  calories: null,
  foodType: "",
  ingredient: [],
  origin: "",
  weight: toNumber(f.weight),
  water: toNumber(f.water),
  protein: toNumber(f.protein),
  fat: toNumber(f.fat),
  carbonhydrate: toNumber(f.carbonhydrate),
  ash: toNumber(f.ash),
  fibre: toNumber(f.fibre),
  calcium: toNumber(f.calcium),
  phosphorus: toNumber(f.phosphorus),
  vitd3: toNumber(f.vitd3),
  taurine: toNumber(f.taurine),
  zinc: toNumber(f.zinc),
  manganese: toNumber(f.manganese),
  iodine: toNumber(f.iodine),
  vite: toNumber(f.vite),
  nonMeatElement: f.nonMeatElement ? String(f.nonMeatElement).split(/[、,]/).map((s) => s.trim()).filter(Boolean) : [],
  createdBy: "seed",
});

async function run() {
  const col = db.collection("foods");
  const batch = db.batch();
  for (const f of foods) {
    batch.set(col.doc(), transform(f));
  }
  await batch.commit();
  console.log(`Seeded ${foods.length} foods.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
