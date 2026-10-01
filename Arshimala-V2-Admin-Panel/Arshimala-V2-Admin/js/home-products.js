// ======================================================
// ARSHIMALA - HOMEPAGE PRODUCTS
// Firebase Featured Products
// ======================================================

import { getProducts } from "./products.js";

const featuredProducts =
    document.getElementById("featuredProducts");


// ======================================================
// LOAD PRODUCTS
// ======================================================

async function loadFeaturedProducts() {

    if (!featuredProducts) return;


    try {

        const products =
            await getProducts();


        // Only available + featured products

        let featured =
            products.filter(
                product =>
                    product.available !== false &&
                    product.featured === true
            );


        // If there are no featured products,
        // show latest available products instead.

        if (featured.length === 0) {

            featured =
                products.filter(
                    product =>
                        product.available !== false
                ).slice(0, 4);

        }


        // Show maximum 4 products

        featured =
            featured.slice(0, 4);


        // Nothing found

        if (featured.length === 0) {

            featuredProducts.innerHTML = `

                <div class="product-empty">

                    <h3>
                        Collection Coming Soon
                    </h3>

                    <p>
                        Beautiful Arshimala pieces
                        will appear here soon.
                    </p>

                </div>

            `;

            return;
        }


        // Render products

        featuredProducts.innerHTML =
            featured.map(
                product => createProductCard(product)
            ).join("");


    } catch (error) {

        console.error(
            "Homepage products error:",
            error
        );


        featuredProducts.innerHTML = `

            <div class="product-empty">

                <h3>
                    Unable to load collection
                </h3>

                <p>
                    Please refresh the page and try again.
                </p>

            </div>

        `;

    }

}


// ======================================================
// PRODUCT CARD
// ======================================================

function createProductCard(product) {

    const image =
        product.image ||
        "https://via.placeholder.com/500x650?text=Arshimala";


    const name =
        escapeHTML(product.name || "Arshimala Product");


    const category =
        escapeHTML(
            product.category ||
            "Three-Piece"
        );


    const price =
        Number(product.price || 0);


    const featuredBadge =
        product.featured === true
            ? `
                <span class="product-badge">
                    Featured
                </span>
              `
            : "";


    return `

        <article class="product-card">

            <a
                href="product.html?id=${encodeURIComponent(product.id)}"
                class="product-image"
            >

                <img
                    src="${image}"
                    alt="${name}"
                    loading="lazy"
                >

                ${featuredBadge}

            </a>


            <div class="product-info">

                <p class="product-category">
                    ${category}
                </p>


                <h3 class="product-name">

                    <a
                        href="product.html?id=${encodeURIComponent(product.id)}"
                    >
                        ${name}
                    </a>

                </h3>


                <div class="product-bottom">

                    <strong class="product-price">

                        ৳${price.toLocaleString("en-BD")}

                    </strong>


                    <a
                        href="product.html?id=${encodeURIComponent(product.id)}"
                        class="product-view"
                    >
                        View →
                    </a>

                </div>

            </div>

        </article>

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

loadFeaturedProducts();