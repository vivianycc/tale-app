const admin = require("firebase-admin");
const path = require("path");
const serviceAccount = require(path.resolve(__dirname, "../service-account.json"));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const uid = process.argv[2];
if (!uid) {
  console.error("usage: node scripts/seed-demo-polish.js <uid>");
  process.exit(1);
}

const PETS = ["Mochi", "Biscuit"];
const DIARY_DAYS = 7;
const STATS_ENTRIES = 7;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randBetween = (min, max, decimals = 0) => {
  const n = Math.random() * (max - min) + min;
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
};
const fmtDate = (d) => d.toISOString().slice(0, 10);
const fmtTime = (h, m) => `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

const DIARY_COMMENTS = [
  "今天很開心地吃完了",
  "胃口不錯，一下就吃光光",
  "挑食了一陣子才開動",
  "吃一半就跑去玩",
  "舔得盤子乾乾淨淨",
  "",
  "",
];
const FOOD_COMMENTS_TC = [
  "很愛吃，每次都秒殺",
  "剛開始有點猶豫，現在變主食",
  "偶爾換換口味會吃",
  "罐頭醬汁他最愛",
  "換新包裝後接受度變高",
  "當零食很剛好",
  "不會過敏，腸胃適應良好",
];

async function redistributeFoodTypes() {
  const snap = await db.collection("foods").get();
  const batch = db.batch();
  let complementary = 0;
  let supplement = 0;
  const targetComplementary = 15;
  const targetSupplement = 6;
  for (const d of snap.docs) {
    const data = d.data();
    if (data.foodType !== "complete") continue;
    if (complementary < targetComplementary) {
      batch.update(d.ref, { foodType: "complementary" });
      complementary++;
    } else if (supplement < targetSupplement) {
      batch.update(d.ref, { foodType: "supplement" });
      supplement++;
    }
  }
  await batch.commit();
  console.log(`Reassigned ${complementary} → complementary, ${supplement} → supplement`);

  const favs = (await db.collectionGroup("foods").get()).docs.filter((d) =>
    d.ref.path.startsWith("users/")
  );
  const byId = new Map(snap.docs.map((d) => [d.id, d.data().foodType]));
  for (let i = 0; i < favs.length; i += 400) {
    const b = db.batch();
    for (const d of favs.slice(i, i + 400)) {
      const id = d.data().food?.id;
      if (id && byId.has(id)) b.update(d.ref, { "food.foodType": byId.get(id) });
    }
    await b.commit();
  }
  console.log(`Synced ${favs.length} favorited snapshots`);
}

async function seedDiary() {
  const today = new Date();
  for (const pet of PETS) {
    const favSnap = await db.collection(`users/${uid}/pets/${pet}/foods`).get();
    const favs = favSnap.docs.map((d) => d.data().food);
    if (favs.length === 0) {
      console.warn(`no favorited foods for ${pet}, skipping diary`);
      continue;
    }
    const batch = db.batch();
    for (let i = 0; i < DIARY_DAYS; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = fmtDate(d);
      const count = pick([2, 2, 3, 3, 4]);
      const records = [];
      const hours = [];
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
      batch.set(
        db.doc(`users/${uid}/pets/${pet}/diaries/${dateStr}`),
        { foodRecord: records }
      );
    }
    await batch.commit();
    console.log(`Seeded ${DIARY_DAYS} diary days for ${pet}`);
  }
}

async function refreshFavComments() {
  for (const pet of PETS) {
    const favSnap = await db.collection(`users/${uid}/pets/${pet}/foods`).get();
    const batch = db.batch();
    for (const d of favSnap.docs) {
      batch.update(d.ref, { comment: pick(FOOD_COMMENTS_TC) });
    }
    await batch.commit();
    console.log(`Updated comments on ${favSnap.size} favorited foods for ${pet}`);
  }
}

async function seedStats() {
  // Realistic adult indoor cat values:
  //   weight: 3.5-5.5 kg
  //   heart rate (resting): 140-200 bpm
  //   breathing rate (resting): 20-30 bpm
  const PET_PROFILES = {
    Mochi: { weightBase: 4.2, weightDrift: 0.25, hrBase: 175, hrJitter: 20, brBase: 24, brJitter: 4 },
    Biscuit: { weightBase: 5.0, weightDrift: 0.3, hrBase: 165, hrJitter: 18, brBase: 26, brJitter: 5 },
  };
  const today = new Date();
  for (const pet of PETS) {
    const p = PET_PROFILES[pet];
    const batch = db.batch();
    for (let i = 0; i < STATS_ENTRIES; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i * 4);
      const dateStr = fmtDate(d);
      const data = {
        date: dateStr,
        weight: +(p.weightBase + (Math.random() - 0.5) * p.weightDrift * 2).toFixed(2),
        heartRate: Math.round(p.hrBase + (Math.random() - 0.5) * p.hrJitter * 2),
        breathRate: Math.round(p.brBase + (Math.random() - 0.5) * p.brJitter * 2),
      };
      batch.set(db.doc(`users/${uid}/pets/${pet}/stats/${dateStr}`), data);
    }
    await batch.commit();
    console.log(`Seeded ${STATS_ENTRIES} stats entries for ${pet}`);
  }
}

async function run() {
  await redistributeFoodTypes();
  await refreshFavComments();
  await seedDiary();
  await seedStats();
  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
