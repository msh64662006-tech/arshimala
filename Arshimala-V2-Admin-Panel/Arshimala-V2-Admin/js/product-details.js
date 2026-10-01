// ======================================================
// ARSHIMALA - PRODUCT DETAILS
// ======================================================

import { getProducts } from "./products.js";

const CART_KEY = "arshimalaCart";
const WHATSAPP_NUMBER = "8801577747159";

const params = new URLSearchParams(window.location.search);
const productId = params.get("id");

const productDetails = document.getElementById("productDetails");
const relatedProducts = document.getElementById("relatedProducts");
const cartCount = document.getElementById("cartCount");


// ======================================================
// CART
// ======================================================

function getCart() {
    try {
        const cart = JSON.parse(
            localStorage.getItem(CART_KEY) || "[]"
        );

        return Array.isArray(cart) ? cart : [];

    } catch {
        return [];
    }
}


function saveCart(cart) {
    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );
}


function updateCartCount() {

    if (!cartCount) return;

    const cart = getCart();

    const count = cart.reduce(
        (total, item) =>
            total + (Number(item.quantity) || 1),
        0
    );

    cartCount.textContent = count;
}


// ======================================================
// LOAD PRODUCT
// ======================================================

async function loadProduct() {

    if (!productId) {

        showError("Product ID is missing.");

        return;
    }


    try {

        const products = await getProducts();

        const product = products.find(
            item => item.id === productId
        );


        if (!product) {

            showError("Product not found.");

            return;
        }


        renderProduct(product);

        renderRelatedProducts(
            products,
            product
        );


    } catch (error) {

        console.error(
            "Product details error:",
            error
        );

        showError(
            "Could not load product."
        );

    }

}


// ======================================================
// RENDER PRODUCT
// ======================================================

function renderProduct(product) {

    if (!productDetails) return;


    const name =
        escapeHTML(
            product.name ||
            "Arshimala Product"
        );


    const category =
        escapeHTML(
            product.category ||
            "Fashion"
        );


    const description =
        escapeHTML(
            product.description ||
            "Beautiful Arshimala fashion collection."
        );


    const price =
        Number(product.price) || 0;


    const image =
        product.image ||
        "https://via.placeholder.com/600x750?text=Arshimala";


    const available =
        product.available !== false;


    productDetails.innerHTML = `

        <div class="product-details-image">

            <div class="product-detail-badges">

                ${
                    product.featured
                        ? `
                            <span class="product-badge">
                                Featured
                            </span>
                          `
                        : ""
                }

            </div>

            <img
                src="${image}"
                alt="${name}"
            >

        </div>


        <div class="product-details-info">

            <p class="eyebrow">
                ${category}
            </p>


            <h1>
                ${name}
            </h1>


            <div class="product-detail-price">
                ৳${price.toLocaleString("en-BD")}
            </div>


            <div class="product-detail-divider"></div>


            <p class="product-detail-description">
                ${description}
            </p>


            <div class="product-availability">

                ${
                    available
                        ? `
                            <span class="available-dot"></span>
                            In Stock
                          `
                        : `
                            <span class="unavailable-dot"></span>
                            Currently Unavailable
                          `
                }

            </div>


            ${
                available
                    ? `

                        <div class="quantity-section">

                            <label>
                                Quantity
                            </label>

                            <div class="quantity-selector">

                                <button
                                    type="button"
                                    id="minusBtn"
                                >
                                    −
                                </button>

                                <span id="quantity">
                                    1
                                </span>

                                <button
                                    type="button"
                                    id="plusBtn"
                                >
                                    +
                                </button>

                            </div>

                        </div>


                        <div class="product-detail-actions">

                            <button
                                type="button"
                                class="detail-cart-btn"
                                id="addToCartBtn"
                            >
                                Add to Cart
                            </button>


                            <button
                                type="button"
                                class="detail-whatsapp-btn"
                                id="buyWhatsappBtn"
                            >
                                Order on WhatsApp
                            </button>

                        </div>

                      `
                    : `

                        <button
                            type="button"
                            class="detail-disabled-btn"
                            disabled
                        >
                            Currently Unavailable
                        </button>

                      `
            }


            <div class="product-info-note">

                <div>

                    🚚

                    <strong>
                        Delivery
                    </strong>

                    <span>
                        Delivery available across Bangladesh
                    </span>

                </div>


                <div>

                    🛍️

                    <strong>
                        Easy Ordering
                    </strong>

                    <span>
                        Order directly through WhatsApp
                    </span>

                </div>

            </div>

        </div>

    `;


    if (!available) return;


    setupQuantity(product);

}


// ======================================================
// RELATED PRODUCTS
// ======================================================

function renderRelatedProducts(products, currentProduct) {

    if (!relatedProducts) return;


    const currentCategory =
        String(
            currentProduct.category || ""
        ).toLowerCase();


    let related = products.filter(product => {

        if (product.id === currentProduct.id) {
            return false;
        }

        if (product.available === false) {
            return false;
        }

        const category =
            String(
                product.category || ""
            ).toLowerCase();

        return category === currentCategory;

    });


    // If same category products are not enough,
    // use other available products.
    if (related.length < 4) {

        const others = products.filter(product => {

            if (product.id === currentProduct.id) {
                return false;
            }

            if (product.available === false) {
                return false;
            }

            if (
                related.some(
                    item => item.id === product.id
                )
            ) {
                return false;
            }

            return true;

        });


        related = [
            ...related,
            ...others
        ];

    }


    // Maximum 4 products
    related = related.slice(0, 4);


    if (related.length === 0) {

        relatedProducts.innerHTML = "";

        return;

    }


    relatedProducts.innerHTML =
        related.map(product => {

            const image =
                product.image ||
                "https://via.placeholder.com/400x500?text=Arshimala";


            const name =
                escapeHTML(
                    product.name ||
                    "Arshimala Product"
                );


            const category =
                escapeHTML(
                    product.category ||
                    "Fashion"
                );


            const price =
                Number(product.price) || 0;


            return `

                <article class="product-card">

                    <a
                        href="product.html?id=${encodeURIComponent(product.id)}"
                        class="product-card-image"
                    >

                        <img
                            src="${image}"
                            alt="${name}"
                            loading="lazy"
                        >

                        ${
                            product.featured
                                ? `
                                    <span class="product-badge">
                                        Featured
                                    </span>
                                  `
                                : ""
                        }

                    </a>


                    <div class="product-card-content">

                        <p class="product-category">
                            ${category}
                        </p>


                        <h3>
                            ${name}
                        </h3>


                        <div class="product-card-bottom">

                            <strong>
                                ৳${price.toLocaleString("en-BD")}
                            </strong>


                            <a
                                href="product.html?id=${encodeURIComponent(product.id)}"
                                class="product-view-btn"
                            >
                                View
                            </a>

                        </div>

                    </div>

                </article>

            `;

        }).join("");

}


// ======================================================
// QUANTITY
// ======================================================

function setupQuantity(product) {

    let quantity = 1;


    const quantityElement =
        document.getElementById("quantity");


    const minusBtn =
        document.getElementById("minusBtn");


    const plusBtn =
        document.getElementById("plusBtn");


    const addToCartBtn =
        document.getElementById("addToCartBtn");


    const buyWhatsappBtn =
        document.getElementById("buyWhatsappBtn");


    function updateQuantity() {

        if (quantityElement) {
            quantityElement.textContent =
                quantity;
        }

    }


    minusBtn?.addEventListener(
        "click",
        () => {

            if (quantity > 1) {

                quantity--;

                updateQuantity();

            }

        }
    );


    plusBtn?.addEventListener(
        "click",
        () => {

            quantity++;

            updateQuantity();

        }
    );


    // ==================================================
    // ADD TO CART
    // ==================================================

    addToCartBtn?.addEventListener(
        "click",
        () => {

            const cart = getCart();


            const existingProduct =
                cart.find(
                    item => item.id === product.id
                );


            if (existingProduct) {

                existingProduct.quantity =
                    (Number(existingProduct.quantity) || 1)
                    + quantity;

            } else {

                cart.push({

                    id: product.id,

                    name: product.name,

                    price: Number(product.price) || 0,

                    image: product.image || "",

                    category: product.category || "",

                    quantity: quantity

                });

            }


            saveCart(cart);

            updateCartCount();


            addToCartBtn.textContent =
                "✓ Added to Cart";


            setTimeout(() => {

                addToCartBtn.textContent =
                    "Add to Cart";

            }, 1500);

        }
    );


    // ==================================================
    // WHATSAPP
    // ==================================================

    buyWhatsappBtn?.addEventListener(
        "click",
        () => {

            const name =
                product.name || "Product";


            const price =
                Number(product.price) || 0;


            const total =
                price * quantity;


            let message =
                "Hello Arshimala!\n\n";


            message +=
                "I want to order:\n\n";


            message +=
                `Product: ${name}\n`;


            message +=
                `Price: ৳${price.toLocaleString("en-BD")}\n`;


            message +=
                `Quantity: ${quantity}\n`;


            message +=
                `Total: ৳${total.toLocaleString("en-BD")}\n\n`;


            message +=
                "Please provide delivery details.";


            const whatsappURL =
                `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;


            window.open(
                whatsappURL,
                "_blank"
            );

        }
    );

}


// ======================================================
// ERROR
// ======================================================

function showError(message) {

    if (!productDetails) return;


    productDetails.innerHTML = `

        <div style="
            width:100%;
            text-align:center;
            padding:60px 20px;
        ">

            <h2>
                ${escapeHTML(message)}
            </h2>

            <a
                href="products.html"
                class="primary-btn"
                style="
                    display:inline-block;
                    margin-top:20px;
                "
            >
                Browse Products
            </a>

        </div>

    `;

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    return String(value || "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


// ======================================================
// START
// ======================================================

updateCartCount();

loadProduct();