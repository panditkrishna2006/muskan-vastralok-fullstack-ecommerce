/* =========================================================
   MUSKAN VASTRALOK
   CHECKOUT PAGE
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       API
    ===================================================== */

    const API_BASE =
        "http://localhost:5000";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const checkoutLayout =
        document.getElementById("checkoutLayout");

    const checkoutEmpty =
        document.getElementById("checkoutEmpty");

    const summaryItemsContainer =
        document.getElementById("summaryItems");

    const summaryQuantity =
        document.getElementById("summaryQuantity");

    const summarySubtotal =
        document.getElementById("summarySubtotal");

    const summaryTotal =
        document.getElementById("summaryTotal");

    const placeOrderBtn =
        document.getElementById("placeOrderBtn");

    const codMessage =
        document.getElementById("codMessage");


    /* =====================================================
       CUSTOMER INPUTS
    ===================================================== */

    const customerName =
        document.getElementById("customerName");

    const customerPhone =
        document.getElementById("customerPhone");

    const addressLine =
        document.getElementById("addressLine");

    const city =
        document.getElementById("city");

    const state =
        document.getElementById("state");

    const pincode =
        document.getElementById("pincode");


    /* =====================================================
       ERROR ELEMENTS
    ===================================================== */

    const nameError =
        document.getElementById("nameError");

    const phoneError =
        document.getElementById("phoneError");

    const addressError =
        document.getElementById("addressError");

    const pincodeError =
        document.getElementById("pincodeError");


    /* =====================================================
       CART
    ===================================================== */

    let cart =
        getCart();


    /* =====================================================
       SHIPPING STATE
    ===================================================== */

    let shippingChecked = false;

    let shippingServiceable = false;

    let shippingCharge = 0;

    let shippingMessage = "";


    /* =====================================================
       COD STATE
    ===================================================== */

    let codEligible = false;


    /* =====================================================
       GET CART
    ===================================================== */

    function getCart() {

        try {

            const savedCart =
                localStorage.getItem("cart");


            if (!savedCart) {

                return [];

            }


            const parsedCart =
                JSON.parse(savedCart);


            return Array.isArray(parsedCart)
                ? parsedCart
                : [];

        }

        catch (error) {

            console.error(
                "❌ Cart loading error:",
                error
            );

            return [];

        }

    }


    /* =====================================================
       PRICE
    ===================================================== */

    function formatPrice(price) {

        return `₹${Number(price).toLocaleString("en-IN")}`;

    }


    /* =====================================================
       SUBTOTAL
    ===================================================== */

    function getSubtotal() {

        return cart.reduce(

            (total, item) => {

                return total +
                    (
                        Number(item.price) *
                        Number(item.quantity)
                    );

            },

            0

        );

    }


    /* =====================================================
       SHIPPING SUMMARY ROW
    ===================================================== */

    function createShippingSummaryRow() {

        if (
            document.getElementById(
                "summaryShipping"
            )
        ) {

            return;

        }


        if (
            !summarySubtotal ||
            !summarySubtotal.parentElement
        ) {

            return;

        }


        const row =
            document.createElement("div");


        row.id =
            "summaryShipping";


        row.style.cssText = `
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:15px;
            margin-top:10px;
            padding-top:10px;
            border-top:1px solid rgba(59,12,23,.10);
            font-family:"Lora",serif;
            font-size:11px;
        `;


        row.innerHTML = `

            <span
                style="
                    color:#75666A;
                "
            >
                Shipping
            </span>

            <strong
                id="summaryShippingAmount"
                style="
                    color:#3B0C17;
                    font-weight:700;
                "
            >
                —
            </strong>

        `;


        summarySubtotal.parentElement
            .insertAdjacentElement(
                "afterend",
                row
            );

    }


    /* =====================================================
       SHIPPING UI
    ===================================================== */

    function createPincodeUI() {

        if (!pincode) {

            return;

        }


        if (
            document.getElementById(
                "checkPincodeBtn"
            )
        ) {

            return;

        }


        const button =
            document.createElement("button");


        button.type =
            "button";


        button.id =
            "checkPincodeBtn";


        button.textContent =
            "Check Delivery";


        button.style.cssText = `
            margin-top:9px;
            height:39px;
            padding:0 17px;
            border:1px solid #3B0C17;
            border-radius:6px;
            background:#3B0C17;
            color:#F6EBDD;
            font:700 10px "Lora",serif;
            letter-spacing:.4px;
            cursor:pointer;
            transition:.25s ease;
        `;


        button.addEventListener(
            "mouseenter",
            () => {

                button.style.background =
                    "#5A1623";

            }
        );


        button.addEventListener(
            "mouseleave",
            () => {

                button.style.background =
                    "#3B0C17";

            }
        );


        const actionRow =
            document.createElement("div");


        actionRow.id =
            "pincodeActionRow";


        actionRow.style.cssText = `
            display:flex;
            justify-content:flex-start;
            align-items:center;
        `;


        pincode.insertAdjacentElement(
            "afterend",
            actionRow
        );


        actionRow.appendChild(
            button
        );


        const status =
            document.createElement("div");


        status.id =
            "shippingStatus";


        status.setAttribute(
            "aria-live",
            "polite"
        );


        status.style.cssText = `
            min-height:18px;
            margin-top:7px;
            font:10px/1.55 "Lora",serif;
            color:#75666A;
        `;


        actionRow.insertAdjacentElement(
            "afterend",
            status
        );


        button.addEventListener(
            "click",
            checkPincode
        );


        pincode.addEventListener(
            "input",
            () => {

                shippingChecked =
                    false;

                shippingServiceable =
                    false;

                shippingCharge =
                    0;

                shippingMessage =
                    "";

                updateShippingUI();

                renderSummary();

            }
        );

    }


    /* =====================================================
       SHIPPING STATUS UI
    ===================================================== */

    function updateShippingUI() {

        const button =
            document.getElementById(
                "checkPincodeBtn"
            );


        const status =
            document.getElementById(
                "shippingStatus"
            );


        if (status) {

            if (!shippingChecked) {

                status.textContent =
                    "Enter your 6-digit PIN code and check delivery.";

                status.style.color =
                    "#75666A";

            }

            else if (shippingServiceable) {

                status.textContent =
                    shippingMessage ||
                    "Delivery available.";

                status.style.color =
                    "#486A4A";

            }

            else {

                status.textContent =
                    shippingMessage ||
                    "Delivery unavailable.";

                status.style.color =
                    "#8A3D3D";

            }

        }


        if (button) {

            button.disabled =
                false;

            button.textContent =
                "Check Delivery";

        }

    }


    /* =====================================================
       CHECK PINCODE
    ===================================================== */

    async function checkPincode() {

        if (!pincode) {

            return;

        }


        const value =
            pincode.value.trim();


        if (!/^[1-9][0-9]{5}$/.test(value)) {

            showFieldError(
                pincode,
                pincodeError,
                true
            );


            const status =
                document.getElementById(
                    "shippingStatus"
                );


            if (status) {

                status.textContent =
                    "Please enter a valid 6-digit PIN code.";

                status.style.color =
                    "#8A3D3D";

            }


            shippingChecked =
                false;

            shippingServiceable =
                false;

            shippingCharge =
                0;

            renderSummary();

            return;

        }


        showFieldError(
            pincode,
            pincodeError,
            false
        );


        const button =
            document.getElementById(
                "checkPincodeBtn"
            );


        const status =
            document.getElementById(
                "shippingStatus"
            );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "Checking...";

        }


        if (status) {

            status.textContent =
                "Checking delivery availability...";

            status.style.color =
                "#75666A";

        }


        try {

            const response =
                await fetch(
                    `${API_BASE}/api/shipping?pincode=${encodeURIComponent(value)}`
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Unable to check delivery."
                );

            }


            shippingChecked =
                true;


            shippingServiceable =
                result.serviceable === true;


            shippingCharge =
                shippingServiceable
                    ? Number(result.shippingCharge) || 0
                    : 0;


            shippingMessage =
                result.serviceable

                    ? `✓ Delivery available to ${result.city || "your area"}${result.state ? `, ${result.state}` : ""}.`

                    : (
                        result.message ||
                        "Delivery is not available at this PIN code."
                    );


            /* =================================================
               OPTIONAL CITY / STATE AUTO FILL
            ================================================= */

            if (
                shippingServiceable &&
                city &&
                !city.value.trim() &&
                result.city
            ) {

                city.value =
                    result.city;

            }


            if (
                shippingServiceable &&
                state &&
                !state.value.trim() &&
                result.state
            ) {

                state.value =
                    result.state;

            }


            updateShippingUI();

            renderSummary();

        }

        catch (error) {

            console.error(
                "❌ Pincode check error:",
                error
            );


            shippingChecked =
                false;

            shippingServiceable =
                false;

            shippingCharge =
                0;


            shippingMessage =
                error.message ||
                "Unable to check delivery.";


            if (status) {

                status.textContent =
                    shippingMessage;

                status.style.color =
                    "#8A3D3D";

            }


            renderSummary();

        }

        finally {

            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "Check Delivery";

            }

        }

    }


    /* =====================================================
       SUMMARY
    ===================================================== */

    function renderSummary() {

        if (!checkoutLayout) {

            return;

        }


        if (cart.length === 0) {

            checkoutLayout.style.display =
                "none";


            checkoutEmpty?.classList.add(
                "show"
            );


            return;

        }


        checkoutLayout.style.display =
            "grid";


        checkoutEmpty?.classList.remove(
            "show"
        );


        if (
            summaryItemsContainer
        ) {

            summaryItemsContainer.innerHTML =
                "";

        }


        let totalQuantity = 0;

        let subtotal = 0;


        cart.forEach(item => {

            const quantity =
                Number(item.quantity) || 0;


            const price =
                Number(item.price) || 0;


            const itemTotal =
                quantity * price;


            totalQuantity +=
                quantity;


            subtotal +=
                itemTotal;


            const summaryItem =
                document.createElement("div");


            summaryItem.className =
                "summary-item";


            summaryItem.innerHTML = `

                <div class="summary-item-image">

                    <img
                        src="${item.image}"
                        alt="${item.name}"
                        loading="lazy"
                    >

                </div>


                <div>

                    <div class="summary-item-name">
                        ${item.name}
                    </div>

                    <div class="summary-item-meta">
                        ${formatPrice(price)} × ${quantity}
                    </div>

                </div>


                <div class="summary-item-total">
                    ${formatPrice(itemTotal)}
                </div>

            `;


            summaryItemsContainer?.appendChild(
                summaryItem
            );

        });


        if (summaryQuantity) {

            summaryQuantity.textContent =
                totalQuantity;

        }


        if (summarySubtotal) {

            summarySubtotal.textContent =
                formatPrice(subtotal);

        }


        createShippingSummaryRow();


        const shippingAmount =
            document.getElementById(
                "summaryShippingAmount"
            );


        if (shippingAmount) {

            if (
                shippingChecked &&
                shippingServiceable
            ) {

                shippingAmount.textContent =
                    formatPrice(
                        shippingCharge
                    );

            }

            else {

                shippingAmount.textContent =
                    "Enter PIN";

            }

        }


        const total =
            subtotal +
            (
                shippingChecked &&
                shippingServiceable
                    ? shippingCharge
                    : 0
            );


        if (summaryTotal) {

            summaryTotal.textContent =
                formatPrice(total);

        }

    }


    /* =====================================================
       PAYMENT OPTIONS
    ===================================================== */

    const paymentOptions =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );


    paymentOptions.forEach(
        option => {

            option.addEventListener(
                "change",
                () => {

                    if (
                        option.value === "cod" &&
                        !codEligible
                    ) {

                        option.checked =
                            false;

                        const onlineInput =
                            document.querySelector(
                                'input[name="paymentMethod"][value="online"]'
                            );


                        if (onlineInput) {

                            onlineInput.checked =
                                true;

                        }


                        if (codMessage) {

                            codMessage.textContent =
                                "Cash on Delivery is not available for this order.";

                            codMessage.classList.add(
                                "show"
                            );

                        }


                        return;

                    }


                    if (
                        option.value === "cod"
                    ) {

                        codMessage?.classList.add(
                            "show"
                        );

                    }

                    else {

                        codMessage?.classList.remove(
                            "show"
                        );

                    }

                }
            );

        }
    );


    /* =====================================================
       COD ELIGIBILITY
    ===================================================== */

    const codInput =
        document.querySelector(
            'input[name="paymentMethod"][value="cod"]'
        );


    const codOption =
        codInput?.closest(
            ".payment-option"
        );


    async function checkCodEligibility() {

        if (!codInput) {

            return;

        }


        codEligible =
            false;


        codInput.disabled =
            true;


        const subtotal =
            getSubtotal();


        /* =================================================
           ₹5,000 LIMIT
        ================================================= */

        if (subtotal > 5000) {

            showCodUnavailable(
                "Cash on Delivery is available only for orders up to ₹5,000."
            );

            return;

        }


        try {

            const response =
                await fetch(
                    `${API_BASE}/api/products`
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success ||
                !Array.isArray(
                    result.products
                )
            ) {

                throw new Error(
                    "Unable to check COD eligibility."
                );

            }


            const productMap =
                new Map(

                    result.products.map(
                        product => [

                            Number(
                                product.id
                            ),

                            product

                        ]
                    )

                );


            codEligible =
                cart.every(
                    item => {

                        const product =
                            productMap.get(
                                Number(
                                    item.id
                                )
                            );


                        return (

                            product &&

                            product.cod_enabled === true &&

                            Number(
                                product.stock
                            ) >= Number(
                                item.quantity
                            )

                        );

                    }
                );


            if (!codEligible) {

                showCodUnavailable(
                    "Cash on Delivery is not available for one or more products in your cart."
                );

                return;

            }


            /* =================================================
               ENABLE COD
            ================================================= */

            codInput.disabled =
                false;


            if (codOption) {

                codOption.style.opacity =
                    "1";

                codOption.style.cursor =
                    "pointer";

            }


            codMessage?.classList.remove(
                "show"
            );

        }

        catch (error) {

            console.error(
                "❌ COD eligibility error:",
                error
            );


            showCodUnavailable(
                "COD availability could not be verified. Please use Online Payment."
            );

        }

    }


    /* =====================================================
       COD UNAVAILABLE
    ===================================================== */

    function showCodUnavailable(
        message
    ) {

        codEligible =
            false;


        if (codInput) {

            codInput.checked =
                false;

            codInput.disabled =
                true;

        }


        if (codOption) {

            codOption.style.opacity =
                "0.5";

            codOption.style.cursor =
                "not-allowed";

        }


        if (codMessage) {

            codMessage.textContent =
                message;

            codMessage.classList.add(
                "show"
            );

        }


        const onlineInput =
            document.querySelector(
                'input[name="paymentMethod"][value="online"]'
            );


        if (onlineInput) {

            onlineInput.checked =
                true;

        }

    }


    /* =====================================================
       FIELD ERROR
    ===================================================== */

    function showFieldError(
        input,
        errorElement,
        show
    ) {

        if (!input) {

            return false;

        }


        if (show) {

            if (errorElement) {

                errorElement.style.display =
                    "block";

            }


            input.style.borderColor =
                "#8A3D3D";


            return false;

        }


        if (errorElement) {

            errorElement.style.display =
                "none";

        }


        input.style.borderColor =
            "";


        return true;

    }


    /* =====================================================
       FORM VALIDATION
    ===================================================== */

    function validateForm() {

        let valid = true;


        /* NAME */

        const nameValue =
            customerName?.value.trim() || "";


        if (nameValue.length < 2) {

            showFieldError(
                customerName,
                nameError,
                true
            );

            valid =
                false;

        }

        else {

            showFieldError(
                customerName,
                nameError,
                false
            );

        }


        /* PHONE */

        const phoneValue =
            customerPhone?.value.trim() || "";


        if (!/^[0-9]{10}$/.test(
            phoneValue
        )) {

            showFieldError(
                customerPhone,
                phoneError,
                true
            );

            valid =
                false;

        }

        else {

            showFieldError(
                customerPhone,
                phoneError,
                false
            );

        }


        /* ADDRESS */

        const addressValue =
            addressLine?.value.trim() || "";


        if (addressValue.length < 5) {

            showFieldError(
                addressLine,
                addressError,
                true
            );

            valid =
                false;

        }

        else {

            showFieldError(
                addressLine,
                addressError,
                false
            );

        }


        /* PINCODE */

        const pincodeValue =
            pincode?.value.trim() || "";


        if (!/^[1-9][0-9]{5}$/.test(
            pincodeValue
        )) {

            showFieldError(
                pincode,
                pincodeError,
                true
            );

            valid =
                false;

        }

        else {

            showFieldError(
                pincode,
                pincodeError,
                false
            );

        }


        return valid;

    }


    /* =====================================================
       SAVE CHECKOUT DATA
    ===================================================== */

    function saveCheckoutData() {

        const selectedPayment =
            document.querySelector(
                'input[name="paymentMethod"]:checked'
            );


        const subtotal =
            getSubtotal();


        const total =
            subtotal +
            (
                shippingChecked &&
                shippingServiceable
                    ? shippingCharge
                    : 0
            );


        const checkoutData = {

            customer: {

                name:
                    customerName.value.trim(),

                phone:
                    customerPhone.value.trim()

            },


            address: {

                addressLine:
                    addressLine.value.trim(),

                city:
                    city.value.trim(),

                state:
                    state.value.trim(),

                pincode:
                    pincode.value.trim()

            },


            paymentMethod:
                selectedPayment
                    ? selectedPayment.value
                    : "online",


            cart:
                cart,


            subtotal:
                subtotal,


            shippingCharge:
                shippingCharge,


            total:
                total

        };


        localStorage.setItem(
            "checkoutData",
            JSON.stringify(
                checkoutData
            )
        );


        return checkoutData;

    }


    /* =====================================================
       PLACE ORDER
    ===================================================== */

    placeOrderBtn?.addEventListener(
        "click",
        async () => {

            /* EMPTY CART */

            if (
                cart.length === 0
            ) {

                showToast(
                    "Your cart is empty."
                );

                return;

            }


            /* FORM */

            if (
                !validateForm()
            ) {

                showToast(
                    "Please complete the required details."
                );

                return;

            }


            /* PINCODE CHECK */

            if (
                !shippingChecked ||
                !shippingServiceable
            ) {

                showToast(
                    "Please check delivery for your PIN code first."
                );

                return;

            }


            /* COD CHECK */

            const selectedPayment =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                );


            if (!selectedPayment) {

                showToast(
                    "Please select a payment method."
                );

                return;

            }


            if (
                selectedPayment.value === "cod" &&
                !codEligible
            ) {

                showToast(
                    "Cash on Delivery is not available for this order."
                );

                return;

            }


            const checkoutData =
                saveCheckoutData();


            /* DISABLE BUTTON */

            placeOrderBtn.disabled =
                true;


            placeOrderBtn.textContent =
                "Placing Order...";


            try {

                const response =
                    await fetch(
                        `${API_BASE}/api/orders`,
                        {

                            method:
                                "POST",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify(
                                    checkoutData
                                )

                        }
                    );


                const result =
                    await response.json();


                console.log(
                    "Order API response:",
                    result
                );


                if (
                    !response.ok ||
                    !result.success
                ) {

                    throw new Error(
                        result.message ||
                        "Failed to create order."
                    );

                }


                /* SAVE LAST ORDER */

                localStorage.setItem(
                    "lastOrder",
                    JSON.stringify(
                        result.order
                    )
                );

                /* =====================================================
   SAVE ORDER ID TO ORDER HISTORY
===================================================== */

let orderHistory = [];

try {

    const savedHistory =
        localStorage.getItem(
            "orderHistory"
        );


    if (savedHistory) {

        const parsedHistory =
            JSON.parse(
                savedHistory
            );


        if (
            Array.isArray(
                parsedHistory
            )
        ) {

            orderHistory =
                parsedHistory;

        }

    }

}

catch (error) {

    console.error(
        "❌ Order history load error:",
        error
    );

}


/* Remove duplicate order ID */

orderHistory =
    orderHistory.filter(
        id =>
            Number(id) !==
            Number(
                result.order.id
            )
    );


/* Add newest order first */

orderHistory.unshift(
    Number(
        result.order.id
    )
);


/* Keep last 20 orders locally */

orderHistory =
    orderHistory.slice(
        0,
        20
    );


localStorage.setItem(
    "orderHistory",
    JSON.stringify(
        orderHistory
    )
);


                /* CLEAR CART */

                localStorage.removeItem(
                    "cart"
                );


                showToast(
                    "Order placed successfully!"
                );


                /* SUCCESS PAGE */

                setTimeout(
                    () => {

                        window.location.href =
                            `order-success.html?orderId=${result.order.id}`;

                    },

                    1000
                );

            }

            catch (error) {

                console.error(
                    "❌ Order creation error:",
                    error
                );


                showToast(
                    error.message ||
                    "Unable to place order. Please try again."
                );


                placeOrderBtn.disabled =
                    false;


                placeOrderBtn.textContent =
                    "Place Order";

            }

        }
    );


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        let toast =
            document.querySelector(
                ".checkout-toast"
            );


        if (!toast) {

            toast =
                document.createElement(
                    "div"
                );


            toast.className =
                "checkout-toast";


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


        clearTimeout(
            toast._hideTimer
        );


        toast._hideTimer =
            setTimeout(
                () => {

                    toast.style.opacity =
                        "0";

                    toast.style.transform =
                        "translateY(12px)";

                },

                2600
            );

    }


    /* =====================================================
       START
    ===================================================== */

    createPincodeUI();

    createShippingSummaryRow();

    renderSummary();

    updateShippingUI();

    checkCodEligibility();

});