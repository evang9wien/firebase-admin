const admin = require("firebase-admin");
const serviceAccount = require("./evang9-combo-4cb8e-firebase-adminsdk-waxp2-e97f4422d8.json");
const termine = require("./mysql/3022790db11_table_termine.json");
const liedAuswahl = require("./mysql/3022790db11_table_lied_auswahl.json");
const lieder = require("./mysql/3022790db11_table_lieder.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://evang9-combo-4cb8e-default-rtdb.europe-west1.firebasedatabase.app",
});


importLieder();
// importTermine();

// readTermine();

console.log("End");

function importLieder() {
  const db = admin.firestore();

  const batch = db.batch();
  
  lieder.forEach((doc) => {
      var docRef = db.collection("lieder").doc(doc.ID); //automatically generate unique id
      batch.set(docRef, doc);
    });
  
  batch.commit()  
  
}

function readTermine() {
  const db = admin.database();
  const ref = db.ref("combo");
  const usersRef = ref.child("termine");

  usersRef
    .orderByKey()
    .startAt("2024-02-01")
    .endAt(new Date().toISOString().substring(0, 10))
    .on(
      "value",
      (snapshot) => {
        // usersRef.orderByKey().limitToLast(2).on('child_added', (snapshot) => {

        console.log(snapshot.val());
      },
      (errorObject) => {
        console.log("The read failed: " + errorObject.name);
      }
    );
}

function importTermine() {
  const db = admin.database();
  const t0 = termine.map((t) => {
    const liedAuswahlSel = liedAuswahl.filter(
      (l) => l.Termin_Liedliste == t.Termin
    );
    return { ...t, LiedAuswahl: liedAuswahlSel };
  });

  const t1 = convertArrayToObject(t0, "Termin");

  const ref = db.ref("combo");

  const usersRef = ref.child("termine");
  usersRef.set(t1);
}

function convertArrayToObject(array, key) {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
}
