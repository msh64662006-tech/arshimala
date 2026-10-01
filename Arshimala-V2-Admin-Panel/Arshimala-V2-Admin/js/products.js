// ======================================================
// ARSHIMALA - FIREBASE PRODUCTS
// ======================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import { firebaseConfig } from "../firebase-config.js";


// Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productsRef = collection(db, "products");


// ======================================================
// GET PRODUCTS FROM FIREBASE
// ======================================================

export async function getProducts() {

    try {

        const snapshot = await getDocs(productsRef);

        const products = [];

        snapshot.forEach((document) => {

            products.push({
                id: document.id,
                ...document.data()
            });

        });


        // Newest products first
        products.sort((a, b) => {

            const aTime =
                a.createdAt?.seconds || 0;

            const bTime =
                b.createdAt?.seconds || 0;

            return bTime - aTime;

        });


        console.log(
            "Arshimala Firebase Products:",
            products
        );


        return products;

    } catch (error) {

        console.error(
            "Firebase Products Error:",
            error
        );

        return [];

    }

}