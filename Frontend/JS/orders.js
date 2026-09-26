/* =========================================================
   MUSKAN VASTRALOK
   MY ORDERS
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* =====================================================
           API
        ===================================================== */

        const API_BASE =
            "http://localhost:5000";


        /* =====================================================
           ELEMENTS
        ===================================================== */

        const ordersGrid =
            document.getElementById(
                "ordersGrid"
            );


        const ordersEmpty =
            document.getElementById(
                "ordersEmpty"
            );


        const ordersLoading =
            document.getElementById(
                "ordersLoading"
            );


        /* =====================================================
           GET ORDER HISTORY
        ===================================================== */

        function getOrderHistory() {

            try {

                const saved =
                    localStorage.getItem(
                        "orderHistory"
                    );


                if (!saved) {

                    return [];

                }


                const parsed =
                    JSON.parse(saved);


                if (
                    !Array.isArray(
                        parsed
                    )
                ) {

                    return [];

                }


                return parsed
                    .map(
                        id => Number(id)
                    )
                    .filter(
                        id =>
                            Number.isInteger(id) &&
                            id > 0
                    );

            }

            catch (error) {

                console.error(
                    "❌ Order history error:",
                    error
                );

                return [];

            }

        }


        /* =====================================================
           FORMAT PRICE
        ===================================================== */

        function formatPrice(
            price
        ) {

            return `₹${Number(
                price || 0
            ).toLocaleString("en-IN")}`;

        }


        /* =====================================================
           FORMAT DATE
        ===================================================== */

        function formatDate(
            date
        ) {

            if (!date) {

                return "Date unavailable";

            }


            const parsed =
                new Date(date);


            if (
                Number.isNaN(
                    parsed.getTime()
                )
            ) {

                return "Date unavailable";

            }


            return parsed.toLocaleDateString(
                "en-IN",
                {
                    day:
                        "2-digit",

                    month:
                        "short",

                    year:
                        "numeric"
                }
            );

        }


        /* =====================================================
           STATUS
        ===================================================== */

        function formatStatus(
            status
        ) {

            const value =
                String(
                    status || "placed"
                )
                .toLowerCase();


            const labels = {

                placed:
                    "Order Placed",

                confirmed:
                    "Confirmed",

                packed:
                    "Packed",

                shipped:
                    "Shipped",

                out_for_delivery:
                    "Out for Delivery",

                delivered:
                    "Delivered",

                cancelled:
                    "Cancelled"

            };


            return (
                labels[value] ||
                "Order Placed"
            );

        }


        /* =====================================================
           FETCH SINGLE ORDER
        ===================================================== */

        async function fetchOrder(
            orderId
        ) {

            const response =
                await fetch(
                    `${API_BASE}/api/orders/${orderId}`
                );


            const result =
                await response.json();


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Unable to load order."
                );

            }


            return result.order;

        }


        /* =====================================================
           ORDER CARD
        ===================================================== */

        function createOrderCard(
            order
        ) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "order-card";


            const items =
                Array.isArray(
                    order.order_items
                )
                    ? order.order_items
                    : [];


            const itemsHTML =
                items.length > 0

                    ? items.map(
                        item => `

                            <div class="order-item">

                                <div>

                                    <div class="item-name">
                                        ${escapeHTML(
                                            item.product_name
                                        )}
                                    </div>

                                </div>


                                <div class="item-qty">

                                    × ${Number(
                                        item.quantity
                                    )}

                                </div>


                                <div class="item-price">

                                    ${formatPrice(
                                        Number(item.price) *
                                        Number(item.quantity)
                                    )}

                                </div>

                            </div>

                        `
                    ).join("")

                    : `

                        <div
                            class="item-name"
                        >
                            Order items unavailable.
                        </div>

                    `;


            card.innerHTML = `

                <div class="order-top">

                    <div>

                        <div class="order-number">
                            ORDER
                        </div>

                        <div class="order-id">
                            #${order.id}
                        </div>

                        <div class="order-date">
                            ${formatDate(
                                order.created_at
                            )}
                        </div>

                    </div>


                    <div class="status-badge">

                        ${formatStatus(
                            order.order_status
                        )}

                    </div>

                </div>


                <div class="order-items">

                    ${itemsHTML}

                </div>


                <div class="order-bottom">

                    <div>

                        <div class="order-total-label">
                            Total Amount
                        </div>

                        <div class="order-total">
                            ${formatPrice(
                                order.total_amount
                            )}
                        </div>

                    </div>


                    <a
                        href="order-success.html?orderId=${order.id}"
                        class="view-order-btn"
                    >
                        VIEW ORDER →
                    </a>

                </div>

            `;


            return card;

        }


        /* =====================================================
           ESCAPE HTML
        ===================================================== */

        function escapeHTML(
            value
        ) {

            return String(
                value ?? ""
            )
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

        }


        /* =====================================================
           LOAD ORDERS
        ===================================================== */

        async function loadOrders() {

            const history =
                getOrderHistory();


            ordersGrid.innerHTML =
                "";


            ordersEmpty.style.display =
                "none";


            /* =================================================
               NO ORDERS
            ================================================= */

            if (
                history.length === 0
            ) {

                ordersLoading.style.display =
                    "none";

                ordersEmpty.style.display =
                    "block";

                return;

            }


            try {

                const orders =
                    await Promise.all(

                        history.map(
                            id =>
                                fetchOrder(id)
                                    .catch(
                                        error => {

                                            console.error(
                                                `Order ${id} error:`,
                                                error
                                            );

                                            return null;

                                        }
                                    )
                        )

                    );


                const validOrders =
                    orders.filter(
                        order =>
                            order !== null
                    );


                /* =================================================
                   NO VALID ORDERS
                ================================================= */

                if (
                    validOrders.length === 0
                ) {

                    ordersLoading.style.display =
                        "none";

                    ordersEmpty.style.display =
                        "block";

                    return;

                }


                /* =================================================
                   RENDER
                ================================================= */

                validOrders.forEach(
                    order => {

                        ordersGrid.appendChild(
                            createOrderCard(
                                order
                            )
                        );

                    }
                );


                ordersLoading.style.display =
                    "none";

            }

            catch (error) {

                console.error(
                    "❌ Orders loading error:",
                    error
                );


                ordersLoading.textContent =
                    "Unable to load your orders. Please try again.";

            }

        }


        /* =====================================================
           START
        ===================================================== */

        loadOrders();

    }
);