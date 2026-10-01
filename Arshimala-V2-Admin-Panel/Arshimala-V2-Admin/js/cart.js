// ======================================================
// ARSHIMALA - CART + CHECKOUT
// ======================================================

const CART_KEY = "arshimalaCart";

// Your WhatsApp number
const WHATSAPP_NUMBER = "8801577747159";


// ======================================================
// ELEMENTS
// ======================================================

const cartContainer =
    document.getElementById("cartContainer");

const emptyCart =
    document.getElementById("emptyCart");

const cartSummary =
    document.getElementById("cartSummary");

const cartTotal =
    document.getElementById("cartTotal");

const cartCount =
    document.getElementById("cartCount");

const whatsappOrderBtn =
    document.getElementById("whatsappOrderBtn");

const clearCartBtn =
    document.getElementById("clearCartBtn");

const checkoutForm =
    document.getElementById("checkoutForm");

const orderForm =
    document.getElementById("orderForm");


// ======================================================
// GET CART
// ======================================================

function getCart() {

    try {

        const savedCart =
            localStorage.getItem(CART_KEY);

        if (!savedCart) {
            return [];
        }

        const cart =
            JSON.parse(savedCart);

        return Array.isArray(cart)
            ? cart
            : [];

    } catch (error) {

        console.error(
            "Cart loading error:",
            error
        );

        return [];

    }

}


// ======================================================
// SAVE CART
// ======================================================

function saveCart(cart) {

    localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart)
    );

}


// ======================================================
// UPDATE CART COUNT
// ======================================================

function updateCartCount() {

    const cart = getCart();

    const count = cart.reduce(
        (total, item) => {

            const quantity =
                Number(item.quantity);

            return total +
                (Number.isFinite(quantity) && quantity > 0
                    ? quantity
                    : 1);

        },
        0
    );


    if (cartCount) {

        cartCount.textContent =
            String(count);

    }

}


// ======================================================
// RENDER CART
// ======================================================

function renderCart() {

    const cart = getCart();

    updateCartCount();


    // -----------------------------------------------
    // EMPTY CART
    // -----------------------------------------------

    if (cart.length === 0) {

        if (cartContainer) {

            cartContainer.innerHTML = "";

        }

        if (emptyCart) {

            emptyCart.style.display = "block";

        }

        if (cartSummary) {

            cartSummary.style.display = "none";

        }

        if (checkoutForm) {

            checkoutForm.style.display = "none";

        }

        return;

    }


    // -----------------------------------------------
    // CART HAS PRODUCTS
    // -----------------------------------------------

    if (emptyCart) {

        emptyCart.style.display = "none";

    }

    if (cartSummary) {

        cartSummary.style.display = "block";

    }


    let total = 0;


    cart.forEach(item => {

        const price =
            Number(item.price) || 0;

        const quantity =
            Number(item.quantity) || 1;

        total +=
            price * quantity;

    });


    // -----------------------------------------------
    // RENDER PRODUCTS
    // -----------------------------------------------

    if (cartContainer) {

        cartContainer.innerHTML =
            cart.map(
                (item, index) =>
                    createCartItem(item, index)
            ).join("");

    }


    // -----------------------------------------------
    // TOTAL
    // -----------------------------------------------

    if (cartTotal) {

        cartTotal.textContent =
            `৳${total.toLocaleString("en-BD")}`;

    }

}


// ======================================================
// CREATE CART ITEM
// ======================================================

function createCartItem(item, index) {

    const price =
        Number(item.price) || 0;

    const quantity =
        Number(item.quantity) || 1;

    const subtotal =
        price * quantity;

    const image =
        item.image ||
        "https://via.placeholder.com/180x220?text=Arshimala";

    const productName =
        escapeHTML(
            item.name ||
            "Arshimala Product"
        );


    return `

        <div class="cart-item">

            <div class="cart-item-image">

                <img
                    src="${image}"
                    alt="${productName}"
                >

            </div>


            <div class="cart-item-info">

                <p class="eyebrow">
                    ARSHIMALA
                </p>


                <h3>
                    ${productName}
                </h3>


                <p class="cart-item-price">
                    ৳${price.toLocaleString("en-BD")}
                </p>


                <div class="quantity-controls">

                    <button
                        type="button"
                        onclick="changeQuantity(${index}, -1)"
                        aria-label="Decrease quantity"
                    >
                        −
                    </button>


                    <span>
                        ${quantity}
                    </span>


                    <button
                        type="button"
                        onclick="changeQuantity(${index}, 1)"
                        aria-label="Increase quantity"
                    >
                        +
                    </button>

                </div>


                <p class="cart-subtotal">

                    Subtotal:

                    <strong>
                        ৳${subtotal.toLocaleString("en-BD")}
                    </strong>

                </p>


                <button
                    type="button"
                    class="remove-cart-btn"
                    onclick="removeItem(${index})"
                >
                    Remove
                </button>

            </div>

        </div>

    `;

}


// ======================================================
// CHANGE QUANTITY
// ======================================================

function changeQuantity(index, change) {

    const cart = getCart();

    if (!cart[index]) {
        return;
    }


    let quantity =
        Number(cart[index].quantity) || 1;


    quantity += change;


    // Minimum quantity = 1

    if (quantity < 1) {

        quantity = 1;

    }


    cart[index].quantity =
        quantity;


    saveCart(cart);

    renderCart();

}


// ======================================================
// REMOVE ITEM
// ======================================================

function removeItem(index) {

    const cart = getCart();

    if (!cart[index]) {
        return;
    }


    cart.splice(index, 1);

    saveCart(cart);

    renderCart();

}


// ======================================================
// CLEAR CART
// ======================================================

if (clearCartBtn) {

    clearCartBtn.addEventListener(
        "click",
        () => {

            const cart =
                getCart();

            if (cart.length === 0) {
                return;
            }


            const confirmed =
                confirm(
                    "Are you sure you want to clear your cart?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(
                CART_KEY
            );


            renderCart();

        }
    );

}


// ======================================================
// SHOW CHECKOUT FORM
// ======================================================

if (whatsappOrderBtn) {

    whatsappOrderBtn.addEventListener(
        "click",
        () => {

            const cart =
                getCart();


            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            if (checkoutForm) {

                checkoutForm.style.display =
                    "block";


                checkoutForm.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );

}


// ======================================================
// PLACE WHATSAPP ORDER
// ======================================================

if (orderForm) {

    orderForm.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const cart =
                getCart();


            if (cart.length === 0) {

                alert(
                    "Your cart is empty."
                );

                return;

            }


            // -----------------------------------------
            // CUSTOMER DETAILS
            // -----------------------------------------

            const customerName =
                document
                    .getElementById("customerName")
                    ?.value
                    .trim();


            const customerPhone =
                document
                    .getElementById("customerPhone")
                    ?.value
                    .trim();


            const customerAddress =
                document
                    .getElementById("customerAddress")
                    ?.value
                    .trim();


            const customerNote =
                document
                    .getElementById("customerNote")
                    ?.value
                    .trim();


            // -----------------------------------------
            // BASIC VALIDATION
            // -----------------------------------------

            if (
                !customerName ||
                !customerPhone ||
                !customerAddress
            ) {

                alert(
                    "Please fill in your name, phone number and delivery address."
                );

                return;

            }


            // -----------------------------------------
            // CREATE MESSAGE
            // -----------------------------------------

            let total = 0;


            let message =
                "Hello Arshimala!\n\n";


            message +=
                "NEW ORDER\n\n";


            message +=
                `Customer Name: ${customerName}\n`;


            message +=
                `Phone: ${customerPhone}\n`;


            message +=
                `Address: ${customerAddress}\n`;


            if (customerNote) {

                message +=
                    `Note: ${customerNote}\n`;

            }


            message +=
                "\nORDER DETAILS\n\n";


            cart.forEach(
                (item, index) => {

                    const price =
                        Number(item.price) || 0;

                    const quantity =
                        Number(item.quantity) || 1;

                    const subtotal =
                        price * quantity;


                    total +=
                        subtotal;


                    message +=
                        `${index + 1}. ${item.name || "Product"}\n`;

                    message +=
                        `Price: ৳${price.toLocaleString("en-BD")}\n`;

                    message +=
                        `Quantity: ${quantity}\n`;

                    message +=
                        `Subtotal: ৳${subtotal.toLocaleString("en-BD")}\n\n`;

                }
            );


            message +=
                `TOTAL: ৳${total.toLocaleString("en-BD")}\n\n`;


            message +=
                "Thank you!";


            // -----------------------------------------
            // OPEN WHATSAPP
            // -----------------------------------------

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
// MAKE FUNCTIONS AVAILABLE TO HTML
// ======================================================

window.changeQuantity =
    changeQuantity;

window.removeItem =
    removeItem;


// ======================================================
// START CART
// ======================================================

renderCart();