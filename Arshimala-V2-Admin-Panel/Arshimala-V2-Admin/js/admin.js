// ======================================================
// ARSHIMALA - ADMIN PANEL
// Firebase Authentication + Firestore
// Search + Category Filter + Availability Filter
// Image Compression + Size Protection
// ======================================================


// ======================================================
// FIREBASE IMPORTS
// ======================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

import {
    firebaseConfig
} from "../firebase-config.js";


// ======================================================
// FIREBASE INITIALIZE
// ======================================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

const productsRef = collection(
    db,
    "products"
);


// ======================================================
// CATEGORY LIST
// ======================================================

const CATEGORIES = [
    "Three Pis",
    "Tops",
    "Kaftan",
    "Gaon",
    "Semi Long Gaon",
    "Kurti"
];


// ======================================================
// OLD CATEGORY MAPPING
// ======================================================
//
// Old products may still have these categories.
// When editing an old product, it will be treated as
// "Three Pis" so the new category system stays clean.
//

const OLD_CATEGORY_MAP = {
    "Printed Three-Piece": "Three Pis",
    "Premium Three-Piece": "Three Pis",
    "Casual Three-Piece": "Three Pis"
};


// ======================================================
// ELEMENTS
// ======================================================

const loginScreen =
    document.getElementById("loginScreen");

const adminApp =
    document.getElementById("adminApp");

const adminEmail =
    document.getElementById("adminEmail");

const adminPassword =
    document.getElementById("adminPassword");

const loginError =
    document.getElementById("loginError");

const adminProductList =
    document.getElementById("adminProductList");

const productForm =
    document.getElementById("productForm");

const editId =
    document.getElementById("editId");

const pName =
    document.getElementById("pName");

const pCategory =
    document.getElementById("pCategory");

const pPrice =
    document.getElementById("pPrice");

const pDescription =
    document.getElementById("pDescription");

const pImageFile =
    document.getElementById("pImageFile");

const pFeatured =
    document.getElementById("pFeatured");

const pAvailable =
    document.getElementById("pAvailable");

const imagePreview =
    document.getElementById("imagePreview");

const formTitle =
    document.getElementById("formTitle");

const totalProducts =
    document.getElementById("totalProducts");

const featuredProducts =
    document.getElementById("featuredProducts");

const availableProducts =
    document.getElementById("availableProducts");

const adminSearch =
    document.getElementById("adminSearch");

const adminCategoryFilter =
    document.getElementById("adminCategoryFilter");

const availabilityFilter =
    document.getElementById("availabilityFilter");


// ======================================================
// DATA
// ======================================================

let allProducts = [];


// ======================================================
// LOGIN
// ======================================================

window.login = async function () {

    const email =
        adminEmail?.value.trim();

    const password =
        adminPassword?.value;


    if (!email || !password) {

        if (loginError) {

            loginError.textContent =
                "Please enter your email and password.";

        }

        return;
    }


    if (loginError) {

        loginError.textContent = "";

    }


    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            password
        );


    } catch (error) {

        console.error(
            "Login Error:",
            error
        );


        if (loginError) {

            loginError.textContent =
                "Invalid email or password.";

        }

    }

};


// ======================================================
// LOGOUT
// ======================================================

window.logout = async function () {

    try {

        await signOut(auth);

    } catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }

};


// ======================================================
// AUTH STATE
// ======================================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (user) {

            loginScreen.hidden = true;

            adminApp.hidden = false;

            await loadProducts();

        } else {

            loginScreen.hidden = false;

            adminApp.hidden = true;

        }

    }
);


// ======================================================
// LOAD PRODUCTS
// ======================================================

async function loadProducts() {

    if (!adminProductList) return;


    adminProductList.innerHTML = `
        <div class="admin-loading">
            Loading products...
        </div>
    `;


    try {

        const snapshot =
            await getDocs(productsRef);


        allProducts = [];


        snapshot.forEach((document) => {

            allProducts.push({

                id: document.id,

                ...document.data()

            });

        });


        // Newest first

        allProducts.sort(
            (a, b) => {

                const aTime =
                    a.createdAt?.seconds || 0;

                const bTime =
                    b.createdAt?.seconds || 0;

                return bTime - aTime;

            }
        );


        updateDashboard();

        renderProducts();


        console.log(
            "Arshimala Admin Products:",
            allProducts
        );


    } catch (error) {

        console.error(
            "Load Products Error:",
            error
        );


        adminProductList.innerHTML = `
            <div class="admin-error">

                <h3>
                    Failed to load products
                </h3>

                <p>
                    ${escapeHTML(error.message)}
                </p>

            </div>
        `;

    }

}


// ======================================================
// DASHBOARD
// ======================================================

function updateDashboard() {

    const total =
        allProducts.length;


    const featured =
        allProducts.filter(
            product =>
                product.featured === true
        ).length;


    const available =
        allProducts.filter(
            product =>
                product.available !== false
        ).length;


    if (totalProducts) {

        totalProducts.textContent =
            total;

    }


    if (featuredProducts) {

        featuredProducts.textContent =
            featured;

    }


    if (availableProducts) {

        availableProducts.textContent =
            available;

    }

}


// ======================================================
// SEARCH + CATEGORY + AVAILABILITY FILTER
// ======================================================

function filterProducts() {

    const searchText =
        adminSearch?.value
            .trim()
            .toLowerCase() || "";


    const selectedCategory =
        adminCategoryFilter?.value || "all";


    const selectedAvailability =
        availabilityFilter?.value || "";


    const filtered =
        allProducts.filter(
            product => {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();


                const category =
                    String(
                        product.category || ""
                    ).toLowerCase();


                const description =
                    String(
                        product.description || ""
                    ).toLowerCase();


                // Search

                const matchesSearch =
                    !searchText ||
                    name.includes(searchText) ||
                    category.includes(searchText) ||
                    description.includes(searchText);


                // Category

                const matchesCategory =
                    selectedCategory === "all" ||
                    String(
                        product.category || ""
                    ) === selectedCategory;


                // Availability

                let matchesAvailability =
                    true;


                if (
                    selectedAvailability ===
                    "available"
                ) {

                    matchesAvailability =
                        product.available !== false;

                }


                if (
                    selectedAvailability ===
                    "unavailable"
                ) {

                    matchesAvailability =
                        product.available === false;

                }


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesAvailability
                );

            }
        );


    renderProducts(filtered);

}


// ======================================================
// SEARCH EVENT
// ======================================================

if (adminSearch) {

    adminSearch.addEventListener(
        "input",
        filterProducts
    );

}


// ======================================================
// CATEGORY FILTER EVENT
// ======================================================

if (adminCategoryFilter) {

    adminCategoryFilter.addEventListener(
        "change",
        filterProducts
    );

}


// ======================================================
// AVAILABILITY FILTER EVENT
// ======================================================

if (availabilityFilter) {

    availabilityFilter.addEventListener(
        "change",
        filterProducts
    );

}


// ======================================================
// RENDER PRODUCTS
// ======================================================

function renderProducts(
    products = allProducts
) {

    if (!adminProductList) return;


    if (products.length === 0) {

        adminProductList.innerHTML = `
            <div class="admin-empty">

                <h3>
                    No products found
                </h3>

                <p>
                    Try another search or category.
                </p>

            </div>
        `;

        return;
    }


    adminProductList.innerHTML =
        products.map(
            product => {

                const image =
                    product.image ||
                    "https://via.placeholder.com/300x360?text=Arshimala";


                const name =
                    escapeHTML(
                        product.name ||
                        "Untitled Product"
                    );


                const category =
                    escapeHTML(
                        product.category ||
                        "Uncategorized"
                    );


                const description =
                    escapeHTML(
                        product.description ||
                        ""
                    );


                const price =
                    Number(product.price) || 0;


                const available =
                    product.available !== false;


                const featured =
                    product.featured === true;


                return `
                    <div class="admin-product-card">

                        <div class="admin-product-image">

                            <img
                                src="${image}"
                                alt="${name}"
                                loading="lazy"
                            >


                            ${
                                featured
                                ? `
                                    <span class="product-badge">
                                        Featured
                                    </span>
                                `
                                : ""
                            }

                        </div>


                        <div class="admin-product-content">


                            <p class="admin-product-category">
                                ${category}
                            </p>


                            <h3>
                                ${name}
                            </h3>


                            ${
                                description
                                ? `
                                    <p class="admin-product-description">
                                        ${description}
                                    </p>
                                `
                                : ""
                            }


                            <div class="admin-product-meta">


                                <strong>
                                    ৳${price.toLocaleString("en-BD")}
                                </strong>


                                <span class="${
                                    available
                                    ? "available"
                                    : "unavailable"
                                }">

                                    ${
                                        available
                                        ? "Available"
                                        : "Unavailable"
                                    }

                                </span>


                            </div>


                            <div class="admin-product-actions">


                                <button
                                    type="button"
                                    onclick="editProduct('${product.id}')"
                                >
                                    Edit
                                </button>


                                <button
                                    type="button"
                                    class="delete-btn"
                                    onclick="deleteProduct('${product.id}')"
                                >
                                    Delete
                                </button>


                            </div>

                        </div>

                    </div>
                `;

            }
        ).join("");

}


// ======================================================
// IMAGE COMPRESSION
// Firestore Size Protection
// ======================================================

function compressImage(file) {

    return new Promise(
        (resolve, reject) => {

            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    const image =
                        new Image();


                    image.onload =
                        function () {

                            const MAX_WIDTH =
                                1000;

                            const MAX_HEIGHT =
                                1000;


                            let width =
                                image.width;

                            let height =
                                image.height;


                            // Resize large image

                            if (
                                width > MAX_WIDTH ||
                                height > MAX_HEIGHT
                            ) {

                                const ratio =
                                    Math.min(
                                        MAX_WIDTH / width,
                                        MAX_HEIGHT / height
                                    );


                                width =
                                    Math.round(
                                        width * ratio
                                    );


                                height =
                                    Math.round(
                                        height * ratio
                                    );

                            }


                            const canvas =
                                document.createElement(
                                    "canvas"
                                );


                            canvas.width =
                                width;

                            canvas.height =
                                height;


                            const context =
                                canvas.getContext(
                                    "2d"
                                );


                            context.drawImage(
                                image,
                                0,
                                0,
                                width,
                                height
                            );


                            let quality =
                                0.65;


                            let compressedImage =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    quality
                                );


                            while (
                                compressedImage.length > 900000 &&
                                quality > 0.35
                            ) {

                                quality -= 0.05;


                                compressedImage =
                                    canvas.toDataURL(
                                        "image/jpeg",
                                        quality
                                    );

                            }


                            if (
                                compressedImage.length >
                                950000
                            ) {

                                reject(
                                    new Error(
                                        "Image is still too large. Please choose a smaller image."
                                    )
                                );

                                return;
                            }


                            resolve(
                                compressedImage
                            );

                        };


                    image.onerror =
                        function () {

                            reject(
                                new Error(
                                    "Image processing failed."
                                )
                            );

                        };


                    image.src =
                        event.target.result;

                };


            reader.onerror =
                function () {

                    reject(
                        new Error(
                            "Image reading failed."
                        )
                    );

                };


            reader.readAsDataURL(
                file
            );

        }
    );

}


// ======================================================
// IMAGE PREVIEW
// ======================================================

if (pImageFile) {

    pImageFile.addEventListener(
        "change",
        async function () {

            const file =
                this.files?.[0];


            if (!file) {

                if (imagePreview) {

                    imagePreview.innerHTML =
                        "";

                }

                return;
            }


            try {

                if (imagePreview) {

                    imagePreview.innerHTML = `
                        <p>
                            Preparing image...
                        </p>
                    `;

                }


                const image =
                    await compressImage(
                        file
                    );


                if (imagePreview) {

                    imagePreview.innerHTML = `
                        <img
                            src="${image}"
                            alt="Preview"
                        >
                    `;

                }


            } catch (error) {

                console.error(
                    "Preview Error:",
                    error
                );


                if (imagePreview) {

                    imagePreview.innerHTML = `
                        <p>
                            ${escapeHTML(error.message)}
                        </p>
                    `;

                }

            }

        }
    );

}


// ======================================================
// ADD / UPDATE PRODUCT
// ======================================================

if (productForm) {

    productForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                alert(
                    "Please login first."
                );

                return;
            }


            const name =
                pName.value.trim();


            const category =
                pCategory.value;


            const price =
                Number(pPrice.value);


            const description =
                pDescription.value.trim();


            const featured =
                pFeatured.checked;


            const available =
                pAvailable.checked;


            const imageFile =
                pImageFile.files?.[0];


            // Validate name

            if (!name) {

                alert(
                    "Please enter product name."
                );

                return;
            }


            // Validate category

            if (
                !CATEGORIES.includes(category)
            ) {

                alert(
                    "Please select a valid product category."
                );

                return;
            }


            // Validate price

            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                alert(
                    "Please enter a valid price."
                );

                return;
            }


            const submitButton =
                productForm.querySelector(
                    'button[type="submit"]'
                );


            if (submitButton) {

                submitButton.disabled =
                    true;


                submitButton.textContent =
                    editId.value
                    ? "Updating..."
                    : "Saving...";

            }


            try {

                let image = "";


                // ==========================================
                // EDITING EXISTING PRODUCT
                // ==========================================

                if (editId.value) {

                    const oldProduct =
                        allProducts.find(
                            product =>
                                product.id ===
                                editId.value
                        );


                    image =
                        oldProduct?.image || "";

                }


                // ==========================================
                // NEW IMAGE
                // ==========================================

                if (imageFile) {

                    image =
                        await compressImage(
                            imageFile
                        );

                }


                // ==========================================
                // PRODUCT DATA
                // ==========================================

                const productData = {

                    name: name,

                    category: category,

                    price: price,

                    description: description,

                    image: image,

                    featured: featured,

                    available: available,

                    updatedAt:
                        serverTimestamp()

                };


                // ==========================================
                // UPDATE
                // ==========================================

                if (editId.value) {

                    const productRef =
                        doc(
                            db,
                            "products",
                            editId.value
                        );


                    await updateDoc(
                        productRef,
                        productData
                    );


                    alert(
                        "Product updated successfully!"
                    );

                }


                // ==========================================
                // ADD
                // ==========================================

                else {

                    await addDoc(
                        productsRef,
                        {
                            ...productData,

                            createdAt:
                                serverTimestamp()
                        }
                    );


                    alert(
                        "Product added successfully!"
                    );

                }


                // Reset

                resetForm();


                // Reload

                await loadProducts();


                // Go products

                showSection(
                    "products"
                );


            } catch (error) {

                console.error(
                    "Save Product Error:",
                    error
                );


                alert(
                    "Failed to save product.\n\n" +
                    error.message
                );


            } finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;


                    submitButton.textContent =
                        "Save Product";

                }

            }

        }
    );

}


// ======================================================
// EDIT PRODUCT
// ======================================================

window.editProduct =
    function (id) {

        const product =
            allProducts.find(
                item =>
                    item.id === id
            );


        if (!product) {

            alert(
                "Product not found."
            );

            return;
        }


        // Product ID

        editId.value =
            product.id;


        // Name

        pName.value =
            product.name || "";


        // Category
        //
        // New categories are used directly.
        // Old categories are converted to Three Pis.

        const savedCategory =
            String(
                product.category || ""
            );


        const convertedCategory =
            OLD_CATEGORY_MAP[
                savedCategory
            ] || savedCategory;


        if (
            CATEGORIES.includes(
                convertedCategory
            )
        ) {

            pCategory.value =
                convertedCategory;

        } else {

            pCategory.value =
                "Three Pis";

        }


        // Price

        pPrice.value =
            product.price || "";


        // Description

        pDescription.value =
            product.description || "";


        // Featured

        pFeatured.checked =
            product.featured === true;


        // Available

        pAvailable.checked =
            product.available !== false;


        // Existing image

        if (imagePreview) {

            if (product.image) {

                imagePreview.innerHTML = `
                    <img
                        src="${product.image}"
                        alt="Product Preview"
                    >
                `;

            } else {

                imagePreview.innerHTML =
                    "";

            }

        }


        // Change title

        if (formTitle) {

            formTitle.textContent =
                "Edit Product";

        }


        // Open section

        showSection(
            "add"
        );

    };


// ======================================================
// DELETE PRODUCT
// ======================================================

window.deleteProduct =
    async function (id) {

        const product =
            allProducts.find(
                item =>
                    item.id === id
            );


        if (!product) {

            return;

        }


        const confirmed =
            confirm(
                `Delete "${product.name || "this product"}"?`
            );


        if (!confirmed) {

            return;

        }


        try {

            await deleteDoc(
                doc(
                    db,
                    "products",
                    id
                )
            );


            alert(
                "Product deleted successfully!"
            );


            await loadProducts();


        } catch (error) {

            console.error(
                "Delete Product Error:",
                error
            );


            alert(
                "Failed to delete product.\n\n" +
                error.message
            );

        }

    };


// ======================================================
// RESET FORM
// ======================================================

window.resetForm =
    function () {

        if (productForm) {

            productForm.reset();

        }


        if (editId) {

            editId.value =
                "";

        }


        if (pCategory) {

            pCategory.value =
                "Three Pis";

        }


        if (pAvailable) {

            pAvailable.checked =
                true;

        }


        if (pFeatured) {

            pFeatured.checked =
                false;

        }


        if (imagePreview) {

            imagePreview.innerHTML =
                "";

        }


        if (formTitle) {

            formTitle.textContent =
                "Add Product";

        }

    };


// ======================================================
// SECTION NAVIGATION
// ======================================================

window.showSection =
    function (section) {

        const dashboardSection =
            document.getElementById(
                "dashboardSection"
            );


        const productsSection =
            document.getElementById(
                "productsSection"
            );


        const addSection =
            document.getElementById(
                "addSection"
            );


        // Dashboard

        if (dashboardSection) {

            dashboardSection.hidden =
                section !== "dashboard";

        }


        // Products

        if (productsSection) {

            productsSection.hidden =
                section !== "products";

        }


        // Add/Edit

        if (addSection) {

            addSection.hidden =
                section !== "add";

        }


        // Sidebar

        const sideLinks =
            document.querySelectorAll(
                ".side-link"
            );


        sideLinks.forEach(
            button => {

                button.classList.remove(
                    "active"
                );

            }
        );


        // Dashboard

        if (
            section ===
            "dashboard"
        ) {

            sideLinks[0]?.classList.add(
                "active"
            );

        }


        // Products

        if (
            section ===
            "products"
        ) {

            sideLinks[1]?.classList.add(
                "active"
            );


            filterProducts();

        }


        // Add

        if (
            section ===
            "add"
        ) {

            sideLinks[2]?.classList.add(
                "active"
            );

        }

    };


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(
        value || ""
    )

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ======================================================
// INITIAL
// ======================================================

console.log(
    "Arshimala Admin Panel Loaded"
);