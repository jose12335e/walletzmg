// firebase-config.js

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCXTo_xBkNm4Z5IZM_cgjZH9K087yrlSIE",
    authDomain: "walletzmg.firebaseapp.com",
    projectId: "walletzmg",
    storageBucket: "walletzmg.firebasestorage.app",
    messagingSenderId: "398503820849",
    appId: "1:398503820849:web:7b2ca626f5d4ca95245f10",
    measurementId: "G-645P1NCTRY"
};

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Inicializa servicios comunes
const db = firebase.firestore();
const auth = firebase.auth();

console.log("Firebase inicializado correctamente");