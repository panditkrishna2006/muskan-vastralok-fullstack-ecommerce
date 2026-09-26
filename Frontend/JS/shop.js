/* =========================================================
   MUSKAN VASTRALOK
   SHOP PAGE
   DATABASE CONNECTED VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       API
    ===================================================== */

    const API_URL = "http://localhost:5000/api/products";

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const productsGrid = document.getElementById("productsGrid");
    const resultCount = document.getElementById("resultCount");

    const searchInput = document.getElementById("productSearch");
    const searchButton = document.getElementById("searchProductButton");

    const sortSelect = document.getElementById("sortSelect");

    const clearFiltersButton =
        document.getElementById("clearFilters");

    const emptyClearFilters =
        document.getElementById("emptyClearFilters");

    const emptyState =
        document.getElementById("shopEmptyState");

    let allProducts = [];

    /* =====================================================
       LABELS
    ===================================================== */

    const categoryLabels = {
        silk: "Silk Collection",
        designer: "Designer Edit",
        party: "Party Collection",
        cotton: "Cotton Collection"
    };

    const fabricLabels = {
        banarasi: "Banarasi",
        kanjivaram: "Kanjivaram",
        organza: "Organza",
        georgette: "Georgette",
        chiffon: "Chiffon",
        silk: "Silk"
    };

    const occasionLabels = {
        wedding: "Wedding Edit",
        festive: "Festive Edit",
        party: "Party Wear",
        daily: "Daily Wear"
    };

    /* =====================================================
       HELPERS
    ===================================================== */

    function formatPrice(price) {

        return `₹${Number(price).toLocaleString("en-IN")}`;

    }

    function capitalize(value) {

        if (!value) return "";

        return value.charAt(0).toUpperCase() + value.slice(1);

    }

    function categoryName(value) {

        return categoryLabels[value] || capitalize(value);

    }

    function fabricName(value) {

        return fabricLabels[value] || capitalize(value);

    }

    function occasionName(value) {

        return occasionLabels[value] || capitalize(value);

    }

    /* =====================================================
       BADGE
    ===================================================== */

    function getBadge(product) {

        if (product.is_trending) {
            return "TRENDING";
        }

        if (product.is_new_arrival) {
            return "NEW";
        }

        if (product.is_gift_collection) {
            return "HANDPICKED";
        }

        return "COLLECTION";

    }

    /* =====================================================
       STOCK
    ===================================================== */

    function getStock(product) {

        if (Number(product.stock) <= 0) {

            return {
                className: "out-of-stock",
                text: "● Out of Stock"
            };

        }

        if (product.availability === "ready") {

            return {
                className: "ready",
                text: "● Ready to Ship"
            };

        }

        return {
            className: "in-stock",
            text: "● In Stock"
        };

    }

    /* =====================================================
       CREATE PRODUCT CARD
    ===================================================== */

    function createProductCard(product) {

        const card = document.createElement("article");

        card.className = "shop-product-card";

        card.dataset.productId = product.id;
        card.dataset.category = product.category || "";
        card.dataset.fabric = product.fabric || "";
        card.dataset.occasion = product.occasion || "";
        card.dataset.price = product.price || 0;
        card.dataset.availability = product.availability || "";

        const badge = getBadge(product);
        const stock = getStock(product);

        card.innerHTML = `
            
            <div class="shop-product-image">

                <span class="shop-product-badge">
                    ${badge}
                </span>

                <button
                    class="shop-wishlist"
                    type="button"
                    aria-label="Add to wishlist"
                >
                    ♡
                </button>

                <img
                    src="${product.image}"
                    alt="${product.name}"
                    loading="lazy"
                >

            </div>


            <div class="shop-product-info">

                <span class="shop-product-category">
                    ${categoryName(product.category)}
                </span>


                <h3>
                    ${product.name}
                </h3>


                <p class="shop-product-meta">
                    ${fabricName(product.fabric)}
                    •
                    ${occasionName(product.occasion)}
                </p>


                <div class="shop-product-price">

                    <strong>
                        ${formatPrice(product.price)}
                    </strong>

                </div>


                <div class="shop-stock ${stock.className}">
                    ${stock.text}
                </div>


                <a
                    href="product.html?id=${product.id}"
                    class="shop-view-btn"
                >
                    View Details →
                </a>

            </div>

        `;

        return card;

    }

    /* =====================================================
       RENDER PRODUCTS
    ===================================================== */

    function renderProducts(products) {

        if (!productsGrid) return;

        /*
         * IMPORTANT:
         * Remove everything that was previously inside
         * productsGrid before adding database products.
         */

        productsGrid.innerHTML = "";

        products.forEach(product => {

            const card = createProductCard(product);

            productsGrid.appendChild(card);

        });

        updateCount(products.length);

        attachWishlist();

        if (emptyState) {

            emptyState.style.display =
                products.length === 0 ? "block" : "none";

        }

    }

    /* =====================================================
       COUNT
    ===================================================== */

    function updateCount(count) {

        if (!resultCount) return;

        resultCount.textContent = `${count} Sarees`;

    }

    /* =====================================================
       SEARCH
    ===================================================== */

    function filterSearch(products) {

        const query =
            searchInput?.value.trim().toLowerCase() || "";

        if (!query) {

            return products;

        }

        return products.filter(product => {

            const text = [

                product.name,

                product.description,

                product.category,

                product.fabric,

                product.occasion

            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return text.includes(query);

        });

    }

    /* =====================================================
       CHECKBOX FILTER
    ===================================================== */

    function filterCheckboxes(products) {

        const groups = [
            "category",
            "fabric",
            "occasion",
            "availability"
        ];

        let result = products;

        groups.forEach(group => {

            const selected = Array.from(
                document.querySelectorAll(
                    `.filter-source-groups
                     .filter-group[data-filter-group="${group}"]
                     input:checked`
                )
            ).map(input => input.value);

            if (selected.length === 0) {
                return;
            }

            result = result.filter(product => {

                return selected.includes(
                    String(product[group])
                );

            });

        });


        /* PRICE FILTER */

        const selectedPrices = Array.from(
            document.querySelectorAll(
                '.filter-source-groups .filter-group[data-filter-group="price"] input:checked'
            )
        ).map(input => input.value);


        if (selectedPrices.length > 0) {

            result = result.filter(product => {

                const price = Number(product.price);

                return selectedPrices.some(range => {

                    if (range === "under-1500") {
                        return price < 1500;
                    }

                    if (range === "1500-3000") {
                        return price >= 1500 &&
                               price <= 3000;
                    }

                    if (range === "3000-5000") {
                        return price > 3000 &&
                               price <= 5000;
                    }

                    if (range === "5000-plus") {
                        return price > 5000;
                    }

                    return false;

                });

            });

        }

        return result;

    }

    /* =====================================================
       SORT
    ===================================================== */

    function sortProducts(products) {

        const sortValue =
            sortSelect?.value || "featured";

        const sorted = [...products];

        if (sortValue === "price-low") {

            sorted.sort(
                (a, b) =>
                    Number(a.price) - Number(b.price)
            );

        }

        else if (sortValue === "price-high") {

            sorted.sort(
                (a, b) =>
                    Number(b.price) - Number(a.price)
            );

        }

        else if (sortValue === "newest") {

            sorted.sort(
                (a, b) =>
                    new Date(b.created_at) -
                    new Date(a.created_at)
            );

        }

        else if (sortValue === "discount") {

            /*
             * Discount will be properly stored in the
             * database later.
             *
             * For now new/trending products get priority.
             */

            sorted.sort((a, b) => {

                const scoreA =
                    (a.is_new_arrival ? 2 : 0) +
                    (a.is_trending ? 1 : 0);

                const scoreB =
                    (b.is_new_arrival ? 2 : 0) +
                    (b.is_trending ? 1 : 0);

                return scoreB - scoreA;

            });

        }

        else {

            /* FEATURED */

            sorted.sort((a, b) => {

                const scoreA =
                    (a.is_trending ? 3 : 0) +
                    (a.is_new_arrival ? 2 : 0) +
                    (a.is_gift_collection ? 1 : 0);

                const scoreB =
                    (b.is_trending ? 3 : 0) +
                    (b.is_new_arrival ? 2 : 0) +
                    (b.is_gift_collection ? 1 : 0);

                return scoreB - scoreA;

            });

        }

        return sorted;

    }

    /* =====================================================
       APPLY ALL FILTERS
    ===================================================== */

    function applyFilters() {

        let products = [...allProducts];

        products = filterSearch(products);

        products = filterCheckboxes(products);

        products = sortProducts(products);

        renderProducts(products);

    }

    /* =====================================================
       WISHLIST
    ===================================================== */

    function attachWishlist() {

        document
            .querySelectorAll(".shop-wishlist")
            .forEach(button => {

                button.onclick = () => {

                    button.classList.toggle("active");

                    if (
                        button.classList.contains("active")
                    ) {

                        button.textContent = "♥";

                    }
                    else {

                        button.textContent = "♡";

                    }

                };

            });

    }

    /* =====================================================
       CLEAR FILTERS
    ===================================================== */

    function clearAllFilters() {

        document
            .querySelectorAll(
                '.filter-source-groups input[type="checkbox"]'
            )
            .forEach(input => {

                input.checked = false;

            });


        if (searchInput) {

            searchInput.value = "";

        }


        if (sortSelect) {

            sortSelect.value = "featured";

        }


        applyFilters();

    }

    /* =====================================================
       LOAD PRODUCTS FROM BACKEND
    ===================================================== */

    async function loadProducts() {

        try {

            console.log("Loading products...");

            const response =
                await fetch(API_URL);

            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );

            }

            const result =
                await response.json();

            console.log(
                "API response:",
                result
            );

            if (
                !result.success ||
                !Array.isArray(result.products)
            ) {

                throw new Error(
                    "Invalid products response"
                );

            }

            /*
             * VERY IMPORTANT
             * Database becomes the ONLY source.
             */

            allProducts = result.products;

            console.log(
                `Products received from database: ${allProducts.length}`
            );

            applyFilters();

        }

        catch (error) {

            console.error(
                "❌ Product loading error:",
                error
            );

            allProducts = [];

            updateCount(0);

            if (productsGrid) {

                productsGrid.innerHTML = `
                    <div
                        style="
                            grid-column: 1 / -1;
                            text-align: center;
                            padding: 70px 20px;
                        "
                    >
                        <h2>
                            Unable to Load Sarees
                        </h2>

                        <p>
                            Please make sure the backend
                            server is running.
                        </p>
                    </div>
                `;

            }

        }

    }

    /* =====================================================
       EVENTS
    ===================================================== */

    searchInput?.addEventListener(
        "input",
        applyFilters
    );


    searchButton?.addEventListener(
        "click",
        () => {

            applyFilters();

            searchInput?.focus();

        }
    );


    searchInput?.addEventListener(
        "keydown",
        event => {

            if (event.key === "Enter") {

                event.preventDefault();

                applyFilters();

            }

        }
    );


    sortSelect?.addEventListener(
        "change",
        applyFilters
    );


    document
        .querySelectorAll(
            '.filter-source-groups input[type="checkbox"]'
        )
        .forEach(input => {

            input.addEventListener(
                "change",
                applyFilters
            );

        });


    clearFiltersButton?.addEventListener(
        "click",
        clearAllFilters
    );


    emptyClearFilters?.addEventListener(
        "click",
        clearAllFilters
    );


    /* =====================================================
       START
    ===================================================== */

    loadProducts();

});