/* =========================================================
   MUSKAN VASTRALOK
   ADMIN DASHBOARD
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* =====================================================
           API
        ===================================================== */

        const API =
            "http://localhost:5000";


        /* =====================================================
           ELEMENTS
        ===================================================== */

        const loginPage =
            document.getElementById(
                "loginPage"
            );


        const adminPage =
            document.getElementById(
                "adminPage"
            );


        const loginButton =
            document.getElementById(
                "loginButton"
            );


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        const emailInput =
            document.getElementById(
                "adminEmail"
            );


        const passwordInput =
            document.getElementById(
                "adminPassword"
            );


        const loginError =
            document.getElementById(
                "loginError"
            );


        const statsGrid =
            document.getElementById(
                "statsGrid"
            );


        const ordersTable =
            document.getElementById(
                "ordersTable"
            );


        const productsTable =
            document.getElementById(
                "productsTable"
            );


        /* =====================================================
           TOAST
        ===================================================== */

        function showToast(
            message
        ) {

            const toast =
                document.getElementById(
                    "toast"
                );


            if (!toast) {

                return;

            }


            toast.textContent =
                message;


            toast.classList.add(
                "show"
            );


            clearTimeout(
                toast._timer
            );


            toast._timer =
                setTimeout(
                    () => {

                        toast.classList.remove(
                            "show"
                        );

                    },
                    2500
                );

        }


        /* =====================================================
           API HELPER
        ===================================================== */

        async function api(
            url,
            options = {}
        ) {

            const token =
                sessionStorage.getItem(
                    "adminToken"
                );


            const headers = {

                "Content-Type":
                    "application/json",

                ...(options.headers || {})

            };


            /* =================================================
               ADD BEARER TOKEN
            ================================================= */

            if (token) {

                headers.Authorization =
                    `Bearer ${token}`;

            }


            const response =
                await fetch(

                    `${API}${url}`,

                    {

                        ...options,

                        credentials:
                            "include",

                        headers:
                            headers

                    }

                );


            let result;


            try {

                result =
                    await response.json();

            }

            catch {

                throw new Error(
                    "Server returned an invalid response."
                );

            }


            /* =================================================
               AUTH FAILURE
            ================================================= */

            if (
                response.status ===
                401
            ) {

                sessionStorage.removeItem(
                    "adminToken"
                );


                showLoginPage();


                throw new Error(
                    "Admin session expired. Please login again."
                );

            }


            if (
                !response.ok ||
                !result.success
            ) {

                throw new Error(
                    result.message ||
                    "Something went wrong."
                );

            }


            return result;

        }


        /* =====================================================
           SHOW LOGIN
        ===================================================== */

        function showLoginPage() {

            if (adminPage) {

                adminPage.style.display =
                    "none";

            }


            if (loginPage) {

                loginPage.style.display =
                    "grid";

            }

        }


        /* =====================================================
           SHOW ADMIN
        ===================================================== */

        function showAdminPage() {

            if (loginPage) {

                loginPage.style.display =
                    "none";

            }


            if (adminPage) {

                adminPage.style.display =
                    "block";

            }

        }


        /* =====================================================
           LOGIN
        ===================================================== */

        async function login() {

            if (!emailInput || !passwordInput) {

                return;

            }


            loginError.textContent =
                "";


            const email =
                emailInput.value.trim();


            const password =
                passwordInput.value;


            if (
                !email ||
                !password
            ) {

                loginError.textContent =
                    "Enter email and password.";

                return;

            }


            loginButton.disabled =
                true;


            loginButton.textContent =
                "LOGGING IN...";


            try {

                /* =================================================
                   LOGIN REQUEST
                ================================================= */

                const result =
                    await fetch(

                        `${API}/api/admin/login`,

                        {

                            method:
                                "POST",

                            credentials:
                                "include",

                            headers: {

                                "Content-Type":
                                    "application/json"

                            },

                            body:
                                JSON.stringify({

                                    email:
                                        email,

                                    password:
                                        password

                                })

                        }

                    );


                let data;


                try {

                    data =
                        await result.json();

                }

                catch {

                    throw new Error(
                        "Invalid server response."
                    );

                }


                if (
                    !result.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Invalid admin credentials."
                    );

                }


                /* =================================================
                   SAVE TOKEN
                ================================================= */

                if (
                    !data.token
                ) {

                    throw new Error(
                        "Login succeeded but admin token was not received."
                    );

                }


                sessionStorage.setItem(
                    "adminToken",
                    data.token
                );


                /* =================================================
                   VERIFY SESSION
                ================================================= */

                await api(
                    "/api/admin/me"
                );


                /* =================================================
                   DASHBOARD
                ================================================= */

                showAdminPage();


                await loadDashboard();

            }

            catch (error) {

                console.error(
                    "❌ Admin Login Error:",
                    error
                );


                loginError.textContent =
                    error.message;

                sessionStorage.removeItem(
                    "adminToken"
                );

            }

            finally {

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "LOGIN TO DASHBOARD";

            }

        }


        /* =====================================================
           CHECK EXISTING SESSION
        ===================================================== */

        async function checkSession() {

            const token =
                sessionStorage.getItem(
                    "adminToken"
                );


            if (!token) {

                showLoginPage();

                return;

            }


            try {

                await api(
                    "/api/admin/me"
                );


                showAdminPage();


                await loadDashboard();

            }

            catch (error) {

                console.log(
                    "No valid admin session."
                );


                sessionStorage.removeItem(
                    "adminToken"
                );


                showLoginPage();

            }

        }


        /* =====================================================
           LOAD DASHBOARD
        ===================================================== */

        async function loadDashboard() {

            try {

                const [

                    statsResult,

                    ordersResult,

                    productsResult

                ] = await Promise.all([

                    api(
                        "/api/admin/stats"
                    ),

                    api(
                        "/api/admin/orders"
                    ),

                    api(
                        "/api/admin/products"
                    )

                ]);


                renderStats(
                    statsResult.stats
                );


                renderOrders(
                    ordersResult.orders
                );


                renderProducts(
                    productsResult.products
                );

            }

            catch (error) {

                console.error(
                    "❌ Dashboard Error:",
                    error
                );


                showToast(
                    error.message
                );

            }

        }


        /* =====================================================
           STATS
        ===================================================== */

        function renderStats(
            stats
        ) {

            if (!statsGrid) {

                return;

            }


            statsGrid.innerHTML = `

                <div class="stat-card">

                    <div class="stat-label">
                        Products
                    </div>

                    <div class="stat-value">
                        ${Number(
                            stats.totalProducts ||
                            0
                        )}
                    </div>

                </div>


                <div class="stat-card">

                    <div class="stat-label">
                        Total Orders
                    </div>

                    <div class="stat-value">
                        ${Number(
                            stats.totalOrders ||
                            0
                        )}
                    </div>

                </div>


                <div class="stat-card">

                    <div class="stat-label">
                        Pending Orders
                    </div>

                    <div class="stat-value">
                        ${Number(
                            stats.pendingOrders ||
                            0
                        )}
                    </div>

                </div>


                <div class="stat-card">

                    <div class="stat-label">
                        Low Stock
                    </div>

                    <div class="stat-value">
                        ${Number(
                            stats.lowStock ||
                            0
                        )}
                    </div>

                </div>

            `;

        }


        /* =====================================================
           ORDER STATUS OPTIONS
        ===================================================== */

        function statusOptions(
            current
        ) {

            const statuses = [

                [
                    "placed",
                    "Placed"
                ],

                [
                    "confirmed",
                    "Confirmed"
                ],

                [
                    "packed",
                    "Packed"
                ],

                [
                    "shipped",
                    "Shipped"
                ],

                [
                    "out_for_delivery",
                    "Out for Delivery"
                ],

                [
                    "delivered",
                    "Delivered"
                ],

                [
                    "cancelled",
                    "Cancelled"
                ]

            ];


            return statuses

                .map(
                    ([value, label]) => `

                        <option
                            value="${value}"
                            ${
                                value ===
                                String(
                                    current ||
                                    "placed"
                                ).toLowerCase()

                                    ? "selected"

                                    : ""
                            }
                        >
                            ${label}
                        </option>

                    `
                )

                .join("");

        }


        /* =====================================================
           RENDER ORDERS
        ===================================================== */

        function renderOrders(
            orders
        ) {

            if (!ordersTable) {

                return;

            }


            ordersTable.innerHTML =
                "";


            if (
                !Array.isArray(
                    orders
                ) ||
                orders.length === 0
            ) {

                ordersTable.innerHTML = `

                    <tr>

                        <td colspan="6">
                            No orders yet.
                        </td>

                    </tr>

                `;

                return;

            }


            orders.forEach(
                order => {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>

                            <strong>
                                #${Number(
                                    order.id
                                )}
                            </strong>

                        </td>


                        <td>

                            ${escapeHTML(
                                order.customer_name
                            )}

                            <br>

                            ${escapeHTML(
                                order.customer_phone
                            )}

                        </td>


                        <td>

                            ₹${Number(
                                order.total_amount ||
                                0
                            ).toLocaleString(
                                "en-IN"
                            )}

                        </td>


                        <td>

                            ${escapeHTML(
                                order.payment_method
                            )}

                        </td>


                        <td>

                            <select
                                class="status-select"
                                data-order-id="${order.id}"
                            >

                                ${statusOptions(
                                    order.order_status
                                )}

                            </select>

                        </td>


                        <td>

                            <button
                                class="save-button order-save"
                                data-order-id="${order.id}"
                            >
                                SAVE
                            </button>

                        </td>

                    `;


                    ordersTable.appendChild(
                        row
                    );

                }
            );


            document
                .querySelectorAll(
                    ".order-save"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                updateOrderStatus(

                                    Number(
                                        button.dataset.orderId
                                    ),

                                    button

                                );

                            }
                        );

                    }
                );

        }


        /* =====================================================
           UPDATE ORDER STATUS
        ===================================================== */

        async function updateOrderStatus(
            orderId,
            button
        ) {

            const select =
                document.querySelector(

                    `.status-select[data-order-id="${orderId}"]`

                );


            if (!select) {

                return;

            }


            const status =
                select.value;


            button.disabled =
                true;


            button.textContent =
                "SAVING...";


            try {

                await api(

                    `/api/admin/orders/${orderId}/status`,

                    {

                        method:
                            "PATCH",

                        body:
                            JSON.stringify({

                                status:
                                    status

                            })

                    }

                );


                showToast(
                    "Order status updated."
                );


                await loadDashboard();

            }

            catch (error) {

                showToast(
                    error.message
                );

            }

            finally {

                button.disabled =
                    false;

                button.textContent =
                    "SAVE";

            }

        }


        /* =====================================================
           RENDER PRODUCTS
        ===================================================== */

        function renderProducts(
            products
        ) {

            if (!productsTable) {

                return;

            }


            productsTable.innerHTML =
                "";


            if (
                !Array.isArray(
                    products
                ) ||
                products.length === 0
            ) {

                productsTable.innerHTML = `

                    <tr>

                        <td colspan="6">
                            No products found.
                        </td>

                    </tr>

                `;

                return;

            }


            products.forEach(
                product => {

                    const row =
                        document.createElement(
                            "tr"
                        );


                    row.innerHTML = `

                        <td>

                            <strong>
                                ${escapeHTML(
                                    product.name
                                )}
                            </strong>

                        </td>


                        <td>

                            <input
                                class="product-input"
                                type="number"
                                min="0"
                                step="0.01"
                                value="${Number(
                                    product.price ||
                                    0
                                )}"
                                data-product-id="${product.id}"
                                data-field="price"
                            >

                        </td>


                        <td>

                            <input
                                class="product-input"
                                type="number"
                                min="0"
                                step="1"
                                value="${Number(
                                    product.stock ||
                                    0
                                )}"
                                data-product-id="${product.id}"
                                data-field="stock"
                            >

                        </td>


                        <td>

                            <select
                                class="product-input"
                                data-product-id="${product.id}"
                                data-field="availability"
                            >

                                <option
                                    value="in-stock"
                                    ${
                                        product.availability ===
                                        "in-stock"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    In Stock
                                </option>


                                <option
                                    value="ready"
                                    ${
                                        product.availability ===
                                        "ready"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Ready to Ship
                                </option>


                                <option
                                    value="out-of-stock"
                                    ${
                                        product.availability ===
                                        "out-of-stock"
                                            ? "selected"
                                            : ""
                                    }
                                >
                                    Out of Stock
                                </option>

                            </select>

                        </td>


                        <td>

                            <input
                                type="checkbox"
                                ${
                                    product.cod_enabled
                                        ? "checked"
                                        : ""
                                }
                                data-product-id="${product.id}"
                                data-field="cod_enabled"
                            >

                        </td>


                        <td>

                            <button
                                class="save-button product-save"
                                data-product-id="${product.id}"
                            >
                                SAVE
                            </button>

                        </td>

                    `;


                    productsTable.appendChild(
                        row
                    );

                }
            );


            document
                .querySelectorAll(
                    ".product-save"
                )
                .forEach(
                    button => {

                        button.addEventListener(
                            "click",
                            () => {

                                updateProduct(

                                    Number(
                                        button.dataset.productId
                                    ),

                                    button

                                );

                            }
                        );

                    }
                );

        }


        /* =====================================================
           UPDATE PRODUCT
        ===================================================== */

        async function updateProduct(
            productId,
            button
        ) {

            const priceInput =
                document.querySelector(

                    `.product-input[data-product-id="${productId}"][data-field="price"]`

                );


            const stockInput =
                document.querySelector(

                    `.product-input[data-product-id="${productId}"][data-field="stock"]`

                );


            const availabilityInput =
                document.querySelector(

                    `.product-input[data-product-id="${productId}"][data-field="availability"]`

                );


            const codInput =
                document.querySelector(

                    `.product-input[data-product-id="${productId}"][data-field="cod_enabled"]`

                );


            if (
                !priceInput ||
                !stockInput ||
                !availabilityInput ||
                !codInput
            ) {

                return;

            }


            const payload = {

                price:
                    Number(
                        priceInput.value
                    ),

                stock:
                    Number(
                        stockInput.value
                    ),

                availability:
                    availabilityInput.value,

                cod_enabled:
                    codInput.checked

            };


            button.disabled =
                true;


            button.textContent =
                "SAVING...";


            try {

                await api(

                    `/api/admin/products/${productId}`,

                    {

                        method:
                            "PATCH",

                        body:
                            JSON.stringify(
                                payload
                            )

                    }

                );


                showToast(
                    "Product updated successfully."
                );


                await loadDashboard();

            }

            catch (error) {

                showToast(
                    error.message
                );

            }

            finally {

                button.disabled =
                    false;

                button.textContent =
                    "SAVE";

            }

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
           LOGIN BUTTON
        ===================================================== */

        if (loginButton) {

            loginButton.addEventListener(
                "click",
                login
            );

        }


        /* =====================================================
           ENTER KEY
        ===================================================== */

        if (passwordInput) {

            passwordInput.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key ===
                        "Enter"
                    ) {

                        login();

                    }

                }
            );

        }


        /* =====================================================
           LOGOUT
        ===================================================== */

        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async () => {

                    try {

                        await fetch(

                            `${API}/api/admin/logout`,

                            {

                                method:
                                    "POST",

                                credentials:
                                    "include"

                            }

                        );

                    }

                    catch (error) {

                        console.error(
                            "Logout error:",
                            error
                        );

                    }


                    sessionStorage.removeItem(
                        "adminToken"
                    );


                    showLoginPage();


                    if (emailInput) {

                        emailInput.value =
                            "";

                    }


                    if (passwordInput) {

                        passwordInput.value =
                            "";

                    }


                    if (loginError) {

                        loginError.textContent =
                            "";

                    }

                }
            );

        }


        /* =====================================================
           START
        ===================================================== */

        checkSession();

    }
);