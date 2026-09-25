/* =========================================================
   MUSKAN VASTRALOK
   ORDER SUCCESS PAGE
   DATABASE CONNECTED VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const successContent =
        document.getElementById("successContent");

    const missingOrder =
        document.getElementById("missingOrder");

    const orderIdElement =
        document.getElementById("orderId");

    const orderItems =
        document.getElementById("orderItems");

    const customerDetails =
        document.getElementById("customerDetails");

    const addressDetails =
        document.getElementById("addressDetails");

    const paymentDetails =
        document.getElementById("paymentDetails");

    const summaryQuantity =
        document.getElementById("summaryQuantity");

    const summarySubtotal =
        document.getElementById("summarySubtotal");

    const summaryShipping =
        document.getElementById("summaryShipping");

    const summaryTotal =
        document.getElementById("summaryTotal");

    const orderStatus =
        document.getElementById("orderStatus");


    /* =====================================================
       GET ORDER ID FROM URL
       Example:
       order-success.html?orderId=12
    ===================================================== */

    const params =
        new URLSearchParams(
            window.location.search
        );

    const orderId =
        Number(params.get("orderId"));


    /* =====================================================
       VALIDATE ORDER ID
    ===================================================== */

    if (!Number.isInteger(orderId) || orderId <= 0) {

        showMissingOrder();

        return;
    }


    /* =====================================================
       FORMAT PRICE
    ===================================================== */

    function formatPrice(price) {

        return `₹${Number(price || 0)
            .toLocaleString("en-IN")}`;

    }


    /* =====================================================
       PAYMENT LABEL
    ===================================================== */

    function paymentLabel(method) {

        if (method === "cod") {
            return "Cash on Delivery";
        }

        return "Online Payment";

    }


    /* =====================================================
       STATUS LABEL
    ===================================================== */

    function formatStatus(status) {

        if (!status) {
            return "Order Placed";
        }

        return status
            .replaceAll("_", " ")
            .replace(/\b\w/g, letter =>
                letter.toUpperCase()
            );

    }


    /* =====================================================
       SHOW ERROR
    ===================================================== */

    function showMissingOrder() {

        if (successContent) {
            successContent.style.display = "none";
        }

        if (missingOrder) {
            missingOrder.classList.add("show");
        }

    }


    /* =====================================================
       RENDER ITEMS
    ===================================================== */

    function renderItems(items) {

        orderItems.innerHTML = "";

        let totalQuantity = 0;


        items.forEach(item => {

            const quantity =
                Number(item.quantity) || 0;

            const price =
                Number(item.price) || 0;

            const itemTotal =
                price * quantity;


            totalQuantity += quantity;


            const element =
                document.createElement("div");


            element.className =
                "order-item";


            /*
              Product image is not currently
              returned by order_items.

              So we don't invent an image here.
            */

            element.innerHTML = `

                <div
                    class="order-item-image"
                    style="
                        display:grid;
                        place-items:center;
                        color:#C6A15B;
                        font-size:20px;
                    "
                >
                    ✦
                </div>


                <div>

                    <div class="order-item-name">
                        ${item.product_name}
                    </div>

                    <div class="order-item-meta">
                        ${formatPrice(price)}
                        ×
                        ${quantity}
                    </div>

                </div>


                <div class="order-item-total">
                    ${formatPrice(itemTotal)}
                </div>

            `;


            orderItems.appendChild(element);

        });


        summaryQuantity.textContent =
            totalQuantity;

    }


    /* =====================================================
       LOAD ORDER
    ===================================================== */

    async function loadOrder() {

        try {

            console.log(
                `Loading order ID: ${orderId}`
            );


            const response =
                await fetch(
                    `http://localhost:5000/api/orders/${orderId}`
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }


            const result =
                await response.json();


            console.log(
                "Order API response:",
                result
            );


            if (
                !result.success ||
                !result.order
            ) {

                throw new Error(
                    "Order not found."
                );

            }


            const order =
                result.order;


            /* =========================
               ORDER ID
            ========================= */

            orderIdElement.textContent =
                `#${order.id}`;


            /* =========================
               ITEMS
            ========================= */

            const items =
                Array.isArray(order.order_items)
                    ? order.order_items
                    : [];


            if (items.length === 0) {

                throw new Error(
                    "Order items not found."
                );

            }


            renderItems(items);


            /* =========================
               CUSTOMER
            ========================= */

            customerDetails.innerHTML = `

                <strong>
                    ${order.customer_name}
                </strong>

                <br>

                ${order.customer_phone}

            `;


            /* =========================
               ADDRESS
            ========================= */

            addressDetails.innerHTML = `

                ${order.address_line}

                <br>

                ${order.city},
                ${order.state}

                <br>

                PIN:
                ${order.pincode}

            `;


            /* =========================
               PAYMENT
            ========================= */

            paymentDetails.textContent =
                paymentLabel(
                    order.payment_method
                );


            /* =========================
               SUMMARY
            ========================= */

            summarySubtotal.textContent =
                formatPrice(
                    order.subtotal
                );


            summaryShipping.textContent =
                formatPrice(
                    order.shipping_charge
                );


            summaryTotal.textContent =
                formatPrice(
                    order.total_amount
                );


            /* =========================
               STATUS
            ========================= */

            orderStatus.textContent =
                formatStatus(
                    order.order_status
                );


            /* =========================
               TITLE
            ========================= */

            document.title =
                `Order #${order.id} | Muskan Vastralok`;


            console.log(
                "✅ Order loaded successfully."
            );

        }

        catch (error) {

            console.error(
                "❌ Order loading error:",
                error
            );

            showMissingOrder();

        }

    }


    /* =====================================================
       START
    ===================================================== */

    await loadOrder();

});