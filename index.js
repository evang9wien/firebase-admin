var admin = require("firebase-admin");

var serviceAccount = require("./combo-8e814-firebase-adminsdk-8k5uw-99d0bd3a7f.json");

const termine = require("./3022790db11.json/3022790db11_table_termine.json");

const liedAuswahl = require("./3022790db11.json/3022790db11_table_lied_auswahl.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://combo-8e814-default-rtdb.europe-west1.firebasedatabase.app"
});

var db = admin.database();

const convertArrayToObject = (array, key) => {
  const initialValue = {};
  return array.reduce((obj, item) => {
    return {
      ...obj,
      [item[key]]: item,
    };
  }, initialValue);
};


// importTermine();

readTermine();

console.log("End");

function readTermine() {
  const ref = db.ref('combo');
  const usersRef = ref.child('termine');

  usersRef.orderByKey().startAt('2024-02-01').endAt(new Date().toISOString().substring(0, 10)).on('value', (snapshot) => {
    // usersRef.orderByKey().limitToLast(2).on('child_added', (snapshot) => {

    console.log(snapshot.val());
  }, (errorObject) => {
    console.log('The read failed: ' + errorObject.name);
  });

}

function importTermine() {
  const t0 = termine.map(t => { 
    const liedAuswahlSel =  liedAuswahl.filter( l => l.Termin_Liedliste == t.Termin);
    return { ...t, LiedAuswahl: liedAuswahlSel}
  });

  const t1 = convertArrayToObject(t0, "Termin");



  const ref = db.ref('combo');

  const usersRef = ref.child('termine');
  usersRef.set(t1);
}
