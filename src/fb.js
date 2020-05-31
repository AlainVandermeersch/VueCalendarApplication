import firebase from 'firebase/app'
import 'firebase/firestore'
var firebaseConfig = {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore()
export default db
