//import { initializeApp } from 'firebase/app';
//import {
//    initializeAuth,
//    getReactNativePersistence,
//} from 'firebase/auth';
//import AsyncStorage from '@react-native-async-storage/async-storage';
//
//const firebaseConfig = {
//    apiKey: "AIzaSyBPK_lz60RY2WYyVvzolb_2j92_7RjVsZo",
//    authDomain: "continental-mobile-565a4.firebaseapp.com",
//    projectId: "continental-mobile-565a4",
//    storageBucket: "continental-mobile-565a4.firebasestorage.app",
//    messagingSenderId: "157841085387",
//    appId: "1:157841085387:web:d700b19aee7cd68e6c1c4e"
//};
//
//const app = initializeApp(firebaseConfig);
//const auth = initializeAuth(app, {
//    persistence: getReactNativePersistence(AsyncStorage),
//});
//
//export { auth };


import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore'; // ✅ eklenen satır

const firebaseConfig = {
    apiKey: "AIzaSyBPK_lz60RY2WYyVvzolb_2j92_7RjVsZo",
    authDomain: "continental-mobile-565a4.firebaseapp.com",
    projectId: "continental-mobile-565a4",
    storageBucket: "continental-mobile-565a4.firebasestorage.app",
    messagingSenderId: "157841085387",
    appId: "1:157841085387:web:d700b19aee7cd68e6c1c4e"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);
export { auth, db };