/* =========================================================
   MUSKAN VASTRALOK
   CART PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const cartItemsContainer =
        document.getElementById("cartItems");

    const cartLayout =
        document.getElementById("cartLayout");

    const emptyCart =
        document.getElementById("emptyCart");

    const summaryItems =
        document.getElementById("summaryItems");

    const summarySubtotal =
        document.getElementById("summarySubtotal");

    const summaryTotal =
        document.getElementById("summaryTotal");

    const checkoutBtn =
        document.getElementById("checkoutBtn");


    /* =====================================================
       LOAD CART
    ===================================================== */

    let cart = getCart();


    /* =====================================================
       GET CART FROM LOCAL STORAGE
    ===================================================== */

    function getCart() {

        try {

            const storedCart =
                localStorage.getItem("cart");

            if (!storedCart) {
                return [];
            }


            const parsedCart =
                JSON.parse(storedCart);


            if (!Array.isArray(parsedCart)) {
                return [];
            }


            return parsedCart;

        }

        catch (error) {

            console.error(
                "❌ Cart data error:",
                error
            );

            return [];
        }

    }


    /* =====================================================
       SAVE CART
    ===================================================== */

    function saveCart() {

        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );

    }


    /* =====================================================
       PRICE FORMAT
    ===================================================== */

    function formatPrice(price) {

        return `₹${Number(price).toLocaleString("en-IN")}`;

    }


    /* =====================================================
       RENDER CART
    ===================================================== */

    function renderCart() {


        /* =========================
           EMPTY CART
        ========================= */

        if (cart.length === 0) {

            cartItemsContainer.innerHTML = "";

            cartLayout.style.display =
                "none";

            emptyCart.classList.add(
                "show"
            );

            updateSummary();

            return;
        }


        /* =========================
           SHOW CART
        ========================= */

        cartLayout.style.display =
            "grid";

        emptyCart.classList.remove(
            "show"
        );


        cartItemsContainer.innerHTML =
            "";


        cart.forEach((item, index) => {

            const cartItem =
                document.createElement("article");


            cartItem.className =
                "cart-item";


            const itemTotal =
                Number(item.price) *
                Number(item.quantity);


            cartItem.innerHTML = `

                <div class="cart-item-image">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                        loading="lazy"
                        onerror="this.style.display='none'"
                    >

                </div>


                <div class="cart-item-info">

                    <span class="cart-item-label">
                        Saree
                    </span>


                    <h2>
                        ${item.name}
                    </h2>


                    <div class="cart-item-price">
                        ${formatPrice(item.price)}
                    </div>


                    <div class="cart-item-stock">
                        ✓ Available
                    </div>


                    <div class="cart-item-actions">

                        <div class="cart-quantity">

                            <button
                                type="button"
                                class="qty-minus"
                                data-index="${index}"
                            >
                                −
                            </button>


                            <span>
                                ${item.quantity}
                            </span>


                            <button
                                type="button"
                                class="qty-plus"
                                data-index="${index}"
                            >
                                +
                            </button>

                        </div>


                        <button
                            type="button"
                            class="remove-item"
                            data-index="${index}"
                        >
                            Remove
                        </button>

                    </div>

                </div>


                <div class="cart-item-total">
                    ${formatPrice(itemTotal)}
                </div>

            `;


            cartItemsContainer.appendChild(
                cartItem
            );

        });


        attachCartEvents();

        updateSummary();

    }


    /* =====================================================
       QUANTITY + REMOVE EVENTS
    ===================================================== */

    function attachCartEvents() {


        /* =========================
           MINUS
        ========================= */

        document
            .querySelectorAll(".qty-minus")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        if (
                            cart[index] &&
                            cart[index].quantity > 1
                        ) {

                            cart[index].quantity--;

                            saveCart();

                            renderCart();
                        }

                    }
                );

            });


        /* =========================
           PLUS
        ========================= */

        document
            .querySelectorAll(".qty-plus")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        const item =
                            cart[index];


                        if (!item) {
                            return;
                        }


                        const stock =
                            Number(item.stock);


                        if (
                            stock > 0 &&
                            item.quantity >= stock
                        ) {

                            showToast(
                                `Only ${stock} pieces available.`
                            );

                            return;
                        }


                        item.quantity++;

                        saveCart();

                        renderCart();

                    }
                );

            });


        /* =========================
           REMOVE
        ========================= */

        document
            .querySelectorAll(".remove-item")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const index =
                            Number(
                                button.dataset.index
                            );


                        cart.splice(
                            index,
                            1
                        );


                        saveCart();

                        renderCart();

                    }
                );

            });

    }


    /* =====================================================
       UPDATE SUMMARY
    ===================================================== */

    function updateSummary() {

        let totalQuantity = 0;

        let subtotal = 0;


        cart.forEach(item => {

            const quantity =
                Number(item.quantity) || 0;

            const price =
                Number(item.price) || 0;


            totalQuantity +=
                quantity;


            subtotal +=
                price * quantity;

        });


        summaryItems.textContent =
            totalQuantity;


        summarySubtotal.textContent =
            formatPrice(subtotal);


        summaryTotal.textContent =
            formatPrice(subtotal);

    }


    /* =====================================================
       CHECKOUT
    ===================================================== */

    checkoutBtn?.addEventListener(
        "click",
        () => {

            if (cart.length === 0) {

                showToast(
                    "Your cart is empty."
                );

                return;
            }


            /*
              Checkout page will be connected later.
            */

            window.location.href =
                "checkout.html";

        }
    );


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        let toast =
            document.querySelector(
                ".cart-toast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );

            toast.className =
                "cart-toast";


            toast.style.cssText = `
                position:fixed;
                right:22px;
                bottom:22px;
                z-index:9999;
                padding:12px 17px;
                border-radius:7px;
                background:#3B0C17;
                color:#F6EBDD;
                font:11px "Lora",serif;
                box-shadow:0 12px 30px rgba(0,0,0,.18);
                opacity:0;
                transform:translateY(12px);
                transition:.3s;
            `;


            document.body.appendChild(
                toast
            );

        }


        toast.textContent =
            message;


        toast.style.opacity =
            "1";

        toast.style.transform =
            "translateY(0)";


        setTimeout(
            () => {

                toast.style.opacity =
                    "0";

                toast.style.transform =
                    "translateY(12px)";

            },
            2200
        );

    }


    /* =====================================================
       START
    ===================================================== */

    renderCart();

});