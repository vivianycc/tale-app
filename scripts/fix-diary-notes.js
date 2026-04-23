const admin = require("firebase-admin");
const path = require("path");
const serviceAccount = require(path.resolve(__dirname, "../service-account.json"));

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const uid = process.argv[2];
if (!uid) {
  console.error("usage: node scripts/fix-diary-notes.js <uid>");
  process.exit(1);
}

const PETS = ["可麗露", "小餅乾"];

const DAY_NOTES = [
  "今天活動力旺盛，上午追了半小時的雷射筆",
  "下雨天窩在貓跳台睡了一整天",
  "換了新的玩具，興趣缺缺",
  "今天主動來討抱，心情很好",
  "早上吐了一次毛球，下午食慾恢復正常",
  "跟另一隻有點小拉扯，但很快就和好了",
  "剪指甲日，有稍微抗議但還算配合",
  "窗邊看鳥看了一整個下午",
  "新罐頭試吃成功，應該會再回購",
  "水喝得比平常少，要多觀察",
  "今天洗澡，乾了之後蓬鬆得像顆毛球",
  "半夜又跑酷，把桌上東西弄掉了",
  "去動物醫院打疫苗，有點悶悶的",
  "曬了好久的太陽，肚子熱熱的",
  "終於願意進外出籠，進步很多",
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function run() {
  for (const pet of PETS) {
    const snap = await db.collection(`users/${uid}/pets/${pet}/diaries`).get();
    const batch = db.batch();
    const days = snap.docs.sort(() => Math.random() - 0.5);
    const daysWithNotes = new Set(days.slice(0, 10).map((d) => d.id));

    for (const d of snap.docs) {
      const data = d.data();
      const cleanedRecords = (data.foodRecord || []).map(({ note, ...rest }) => rest);
      const update = { foodRecord: cleanedRecords };
      if (daysWithNotes.has(d.id)) {
        update.note = pick(DAY_NOTES);
      } else {
        update.note = admin.firestore.FieldValue.delete();
      }
      batch.set(d.ref, update, { merge: true });
    }
    await batch.commit();
    console.log(`${pet}: cleaned ${snap.size} days, added day-level note on ${daysWithNotes.size}`);
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
