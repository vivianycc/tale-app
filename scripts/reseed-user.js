const admin = require("firebase-admin");
const path = require("path");
const serviceAccount = require(path.resolve(__dirname, "../service-account.json"));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const uid = process.argv[2];
if (!uid) {
  console.error("usage: node scripts/reseed-user.js <uid>");
  process.exit(1);
}

const PETS = [
  { name: "可麗露", species: "cat", breed: "米克斯", sex: "female", birthday: "2022-03-14", neutered: true, chipNumber: "900123456789001", photoUrl: "" },
  { name: "小餅乾", species: "cat", breed: "英國短毛貓", sex: "male", birthday: "2020-08-02", neutered: true, chipNumber: "900123456789002", photoUrl: "" },
];

const FOODS_PER_PET = 5;
const STATS_ENTRIES = 7;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const fmtDate = (d) => d.toISOString().slice(0, 10);
const fmtTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
const randBetween = (min, max) => Math.round(Math.random() * (max - min) + min);

const DIARY_COMMENTS = [
  "今天很開心地吃完了",
  "胃口不錯，一下就吃光光",
  "挑食了一陣子才開動",
  "吃一半就跑去玩",
  "舔得盤子乾乾淨淨",
  "需要多哄一下才肯吃",
  "",
  "",
];
const FAV_COMMENTS_TC = [
  "很愛吃，每次都秒殺",
  "剛開始有點猶豫，現在變主食",
  "偶爾換換口味會吃",
  "罐頭醬汁他最愛",
  "換新包裝後接受度變高",
  "當零食很剛好",
  "不會過敏，腸胃適應良好",
];

const PET_PROFILES = {
  "可麗露": { weightBase: 4.2, weightDrift: 0.25, hrBase: 175, hrJitter: 20, brBase: 24, brJitter: 4 },
  "小餅乾": { weightBase: 5.0, weightDrift: 0.3, hrBase: 165, hrJitter: 18, brBase: 26, brJitter: 5 },
};

async function deleteCollection(colRef) {
  const snap = await colRef.get();
  if (snap.empty) return 0;
  const batch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

async function deleteAllPets() {
  const petsSnap = await db.collection(`users/${uid}/pets`).get();
  for (const petDoc of petsSnap.docs) {
    for (const sub of ["foods", "diaries", "stats"]) {
      await deleteCollection(petDoc.ref.collection(sub));
    }
    await petDoc.ref.delete();
    console.log(`  deleted pet: ${petDoc.id}`);
  }
  console.log(`Removed ${petsSnap.size} existing pets`);
}

async function seedPet(pet, allFoods) {
  const petRef = db.doc(`users/${uid}/pets/${pet.name}`);
  await petRef.set(pet);

  // 5 favorites
  const shuffled = [...allFoods].sort(() => Math.random() - 0.5);
  const favs = shuffled.slice(0, FOODS_PER_PET);
  const favBatch = db.batch();
  for (const f of favs) {
    favBatch.set(petRef.collection("foods").doc(f.id), {
      food: f,
      rating: 3 + Math.floor(Math.random() * 3),
      comment: pick(FAV_COMMENTS_TC),
    });
  }
  await favBatch.commit();

  // April 2026 diary (30 days)
  const diaryBatch = db.batch();
  for (let day = 1; day <= 30; day++) {
    const dateStr = `2026-04-${String(day).padStart(2, "0")}`;
    const count = pick([2, 2, 3, 3, 4]);
    const hours = [];
    const records = [];
    for (let j = 0; j < count; j++) {
      let h;
      do {
        h = 6 + Math.floor(Math.random() * 16);
      } while (hours.includes(h));
      hours.push(h);
      const m = Math.floor(Math.random() * 60);
      const f = pick(favs);
      records.push({
        foodBrand: f.brand,
        foodProduct: f.product || "",
        foodFlavor: f.flavor,
        foodId: f.id,
        calories: f.calories || 80,
        portion: randBetween(20, 80),
        time: fmtTime(h, m),
        note: pick(DIARY_COMMENTS),
      });
    }
    records.sort((a, b) => a.time.localeCompare(b.time));
    diaryBatch.set(petRef.collection("diaries").doc(dateStr), { foodRecord: records });
  }
  await diaryBatch.commit();

  // Stats: every 4 days
  const profile = PET_PROFILES[pet.name];
  const statsBatch = db.batch();
  for (let i = 0; i < STATS_ENTRIES; i++) {
    const dayNum = 30 - i * 4;
    if (dayNum < 1) break;
    const dateStr = `2026-04-${String(dayNum).padStart(2, "0")}`;
    statsBatch.set(petRef.collection("stats").doc(dateStr), {
      date: dateStr,
      weight: +(profile.weightBase + (Math.random() - 0.5) * profile.weightDrift * 2).toFixed(2),
      heartRate: Math.round(profile.hrBase + (Math.random() - 0.5) * profile.hrJitter * 2),
      breathRate: Math.round(profile.brBase + (Math.random() - 0.5) * profile.brJitter * 2),
    });
  }
  await statsBatch.commit();

  console.log(`Seeded ${pet.name}: ${FOODS_PER_PET} foods, 30 diary days, ${STATS_ENTRIES} stats`);
}

async function run() {
  const foodsSnap = await db.collection("foods").get();
  const allFoods = foodsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (allFoods.length === 0) throw new Error("no foods in /foods");

  console.log("Deleting existing pets...");
  await deleteAllPets();

  console.log("Seeding new pets...");
  for (const pet of PETS) await seedPet(pet, allFoods);

  await db.doc(`users/${uid}`).set({}, { merge: true });
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
