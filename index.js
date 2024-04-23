const admin = require("firebase-admin");
const serviceAccount = require("./evang9-combo-4cb8e-firebase-adminsdk-waxp2-e97f4422d8.json");
const databaseUrl = require("./databaseUrl.json")
const termine = require("./mysql/3022790db11_table_termine.json");
const liedAuswahl = require("./mysql/3022790db11_table_lied_auswahl.json");
const lieder = require("./mysql/3022790db11_table_lieder.json");
const mitarbeiter = require("./mysql/3022790db11_table_mitarbeiter.json")

console.log("DatabaseUrl: ", databaseUrl.databaseURL);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: databaseUrl.databaseURL    
});

// importAlleLieder();
// importLieder();
// importTermine();
// readTermine();

// importMitarbeiterCombo();
importMitarbeiterKirchenservice();

console.log("End");

async function importAlleLieder() {
  const db = admin.firestore();

  const comboLieder = convertArrayToObjectSingle(lieder.filter( l => l.Aktiv == 1), "ID", "Titel");

  const andereLieder = convertArrayToObjectSingle(lieder.filter( l => l.Aktiv == 0), "ID", "Titel");


  await db.collection('allelieder').doc('gesungen').set(comboLieder);
  await db.collection('allelieder').doc('nichtgesungen').set(andereLieder);

  console.log("End");
}

async function importMitarbeiterCombo() {
  const db = admin.firestore();

  let ma = mitarbeiter.filter(m => m.Job.includes("Combo") && m.Active == "1");

  let maObj =  convertArrayToObject2Key(ma, "FName", "VName");

  const res = await db.collection('mitarbeiter').doc('combo').set(maObj);

  console.log(ma);
}

async function importMitarbeiterKirchenservice() {
  const db = admin.firestore();

  let ma = mitarbeiter.filter(m => m.Job.includes("Kirchenservice") && m.Active == "1");

  let maObj =  convertArrayToObject2Key(ma, "FName", "VName");

  const res = await db.collection('mitarbeiter').doc('kirchenservice').set(maObj);

  console.log(ma);
}

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

function convertArrayToObject2Key(array, key, key2) {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key] + '_' + item[key2]]: item,
    };
  }, initialValue);
}

function convertArrayToObjectSingle(array, key, key2) {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item[key2],
    };
  }, initialValue);
}