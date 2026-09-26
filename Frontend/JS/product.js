/* =========================================================
   MUSKAN VASTRALOK
   PRODUCT DETAILS PAGE
   DATABASE CONNECTED VERSION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       API
    ===================================================== */

    const API_BASE_URL = "http://localhost:5000/api/products";


    /* =====================================================
       GET PRODUCT ID FROM URL
       Example:
       product.html?id=1
    ===================================================== */

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id");


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const mainImage = document.getElementById("mainProductImage");

    const productTitle =
        document.querySelector(".product-details h1");

    const productKicker =
        document.querySelector(".product-kicker");

    const productDescription =
        document.querySelector(".product-short-description");

    const productPrice =
        document.querySelector(".product-sale-price");

    const productOldPrice =
        document.querySelector(".product-old-price");

    const productDiscount =
        document.querySelector(".product-discount");

    const saveAmount =
        document.querySelector(".save-amount");

    const productBadge =
        document.querySelector(".product-detail-badge");

    const availabilityText =
        document.querySelector(".product-availability strong");

    const availabilityStatus =
        document.querySelector(".product-availability span:last-child");

    const quantityElement =
        document.getElementById("quantity");

    const decreaseQty =
        document.getElementById("decreaseQty");

    const increaseQty =
        document.getElementById("increaseQty");

    const addToCart =
        document.getElementById("addToCart");

    const buyNow =
        document.getElementById("buyNow");

    const wishlistButton =
        document.querySelector(".product-image-wishlist");

    const breadcrumbCurrent =
        document.querySelector(".product-breadcrumb span:last-child");

    const pincodeInput =
        document.getElementById("pincodeInput");

    const checkPincode =
        document.getElementById("checkPincode");

    const pincodeResult =
        document.getElementById("pincodeResult");

    const thumbnails =
        document.querySelectorAll(".thumbnail");


    /* =====================================================
       PRODUCT STATE
    ===================================================== */

    let currentProduct = null;
    let quantity = 1;


    /* =====================================================
       HELPER FUNCTIONS
    ===================================================== */

    function formatPrice(price) {
        return `₹${Number(price).toLocaleString("en-IN")}`;
    }


    function capitalize(value) {

        if (!value) {
            return "";
        }

        return value.charAt(0).toUpperCase() +
               value.slice(1);
    }


    function categoryName(category) {

        const categories = {
            silk: "Silk Collection",
            designer: "Designer Edit",
            party: "Party Collection",
            cotton: "Cotton Collection"
        };

        return categories[category] ||
               capitalize(category);
    }


    function fabricName(fabric) {

        const fabrics = {
            banarasi: "Banarasi Silk",
            kanjivaram: "Kanjivaram Silk",
            organza: "Organza",
            georgette: "Georgette",
            chiffon: "Chiffon",
            silk: "Silk"
        };

        return fabrics[fabric] ||
               capitalize(fabric);
    }


    function occasionName(occasion) {

        const occasions = {
            wedding: "Wedding",
            festive: "Festive",
            party: "Party Wear",
            daily: "Daily Wear"
        };

        return occasions[occasion] ||
               capitalize(occasion);
    }


    function getBadge(product) {

        if (product.is_trending) {
            return "TRENDING";
        }

        if (product.is_new_arrival) {
            return "NEW ARRIVAL";
        }

        if (product.is_gift_collection) {
            return "HANDPICKED";
        }

        return "COLLECTION";
    }


    function getStockText(product) {

        const stock = Number(product.stock);

        if (stock <= 0) {

            return {
                status: "Out of Stock",
                extra: "Currently unavailable",
                className: "out-of-stock"
            };
        }


        if (product.availability === "ready") {

            return {
                status: "Ready to Ship",
                extra: "Available for dispatch",
                className: "ready"
            };
        }


        return {
            status: "In Stock",
            extra: `${stock} pieces available`,
            className: "in-stock"
        };
    }


    /* =====================================================
       ERROR MESSAGE
    ===================================================== */

    function showError(message) {

        if (productTitle) {
            productTitle.textContent = "Product Not Found";
        }

        if (productDescription) {
            productDescription.textContent = message;
        }

        if (addToCart) {
            addToCart.disabled = true;
        }

        if (buyNow) {
            buyNow.disabled = true;
        }
    }


    /* =====================================================
       UPDATE PRODUCT PAGE
    ===================================================== */

    function renderProduct(product) {

        currentProduct = product;


        /* =================================================
           TITLE
        ================================================= */

        if (productTitle) {
            productTitle.textContent = product.name;
        }


        /* =================================================
           BREADCRUMB
        ================================================= */

        if (breadcrumbCurrent) {
            breadcrumbCurrent.textContent = product.name;
        }


        /* =================================================
           KICKER
        ================================================= */

        if (productKicker) {
            productKicker.textContent =
                categoryName(product.category)
                .toUpperCase();
        }


        /* =================================================
           DESCRIPTION
        ================================================= */

        if (productDescription) {

            productDescription.textContent =
                product.description ||
                `${product.name} selected from our ${categoryName(product.category)}.`;
        }


        /* =================================================
           MAIN IMAGE
        ================================================= */

        if (mainImage) {

            mainImage.src = product.image;

            mainImage.alt = product.name;
        }


        /* =================================================
           THUMBNAILS
        ================================================= */

        thumbnails.forEach((thumbnail, index) => {

            thumbnail.dataset.image = product.image;

            const image =
                thumbnail.querySelector("img");

            if (image) {

                image.src = product.image;

                image.alt =
                    `${product.name} thumbnail ${index + 1}`;
            }

        });


        /* =================================================
           BADGE
        ================================================= */

        if (productBadge) {

            productBadge.textContent =
                getBadge(product);
        }


        /* =================================================
           PRICE
        ================================================= */

        if (productPrice) {

            productPrice.textContent =
                formatPrice(product.price);
        }


        /*
          Database currently has only one price field.
          So we should NOT show fake MRP/discount values.
        */

        if (productOldPrice) {
            productOldPrice.style.display = "none";
        }

        if (productDiscount) {
            productDiscount.style.display = "none";
        }

        if (saveAmount) {
            saveAmount.style.display = "none";
        }


        /* =================================================
           AVAILABILITY
        ================================================= */

        const stockInfo =
            getStockText(product);


        if (availabilityText) {

            availabilityText.textContent =
                stockInfo.status;

            availabilityText.className =
                stockInfo.className;
        }


        if (availabilityStatus) {

            availabilityStatus.textContent =
                `• ${stockInfo.extra}`;
        }


        /* =================================================
           QUANTITY
        ================================================= */

        quantity = 1;

        if (quantityElement) {
            quantityElement.textContent = quantity;
        }


        /* =================================================
           STOCK CONTROL
        ================================================= */

        const stock =
            Number(product.stock);


        if (stock <= 0) {

            if (addToCart) {
                addToCart.disabled = true;
                addToCart.textContent =
                    "Out of Stock";
            }

            if (buyNow) {
                buyNow.disabled = true;
                buyNow.textContent =
                    "Out of Stock";
            }

            if (increaseQty) {
                increaseQty.disabled = true;
            }

            if (decreaseQty) {
                decreaseQty.disabled = true;
            }
        }


        /* =================================================
           PRODUCT SPECIFICATIONS
        ================================================= */

        updateSpecifications(product);


        /* =================================================
           PAGE TITLE
        ================================================= */

        document.title =
            `${product.name} | Muskan Vastralok`;
    }


    /* =====================================================
       UPDATE SPECIFICATIONS
    ===================================================== */

    function updateSpecifications(product) {

        const specItems =
            document.querySelectorAll(".spec-item");


        specItems.forEach(item => {

            const label =
                item.querySelector("span");

            const value =
                item.querySelector("strong");


            if (!label || !value) {
                return;
            }


            const labelText =
                label.textContent.trim();


            if (labelText === "Fabric") {

                value.textContent =
                    fabricName(product.fabric);
            }


            else if (labelText === "Weave") {

                value.textContent =
                    product.fabric === "banarasi"
                        ? "Banarasi Weave"
                        : "Traditional Indian Weave";
            }


            else if (labelText === "Craft") {

                value.textContent =
                    categoryName(product.category);
            }


            else if (labelText === "Colour") {

                value.textContent =
                    "As shown in product image";
            }


            else if (labelText === "Blouse Included") {

                value.textContent =
                    "Product specific";
            }


            else if (labelText === "Saree Length") {

                value.textContent =
                    "Product specific";
            }


            else if (labelText === "Blouse Length") {

                value.textContent =
                    "Product specific";
            }


            else if (labelText === "Zari Type") {

                value.textContent =
                    product.fabric === "banarasi"
                        ? "Traditional Zari"
                        : "Product specific";
            }

        });
    }


    /* =====================================================
       LOAD SINGLE PRODUCT
    ===================================================== */

    async function loadProduct() {

        try {

            console.log(
                `Loading product ID: ${productId}`
            );


            if (!productId) {

                throw new Error(
                    "Product ID is missing from URL."
                );
            }


            const response =
                await fetch(
                    `${API_BASE_URL}/${productId}`
                );


            if (!response.ok) {

                throw new Error(
                    `HTTP ${response.status}`
                );
            }


            const result =
                await response.json();


            console.log(
                "Single product API response:",
                result
            );


            if (
                !result.success ||
                !result.product
            ) {

                throw new Error(
                    "Product not found."
                );
            }


            renderProduct(result.product);


            console.log(
                "✅ Product loaded successfully:",
                result.product
            );

        }


        catch (error) {

            console.error(
                "❌ Product loading error:",
                error
            );


            showError(
                "This product could not be loaded. Please return to Shop All and try again."
            );

        }

    }


    /* =====================================================
       QUANTITY
    ===================================================== */

    decreaseQty?.addEventListener(
        "click",
        () => {

            if (quantity > 1) {

                quantity--;

                quantityElement.textContent =
                    quantity;
            }

        }
    );


    increaseQty?.addEventListener(
        "click",
        () => {

            if (!currentProduct) {
                return;
            }


            const stock =
                Number(currentProduct.stock);


            if (quantity < stock) {

                quantity++;

                quantityElement.textContent =
                    quantity;

            }
            else {

                showToast(
                    `Only ${stock} pieces available.`
                );
            }

        }
    );


    /* =====================================================
       WISHLIST
    ===================================================== */

    wishlistButton?.addEventListener(
        "click",
        () => {

            wishlistButton.classList.toggle(
                "active"
            );


            if (
                wishlistButton.classList.contains("active")
            ) {

                wishlistButton.textContent = "♥";

            }
            else {

                wishlistButton.textContent = "♡";
            }

        }
    );


    /* =====================================================
       THUMBNAIL IMAGE SWITCHING
    ===================================================== */

    thumbnails.forEach(thumbnail => {

        thumbnail.addEventListener(
            "click",
            () => {

                const imagePath =
                    thumbnail.dataset.image;


                if (mainImage && imagePath) {

                    mainImage.src =
                        imagePath;
                }


                thumbnails.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                thumbnail.classList.add(
                    "active"
                );

            }
        );

    });


    /* =====================================================
       ADD TO CART
       Temporary localStorage version
    ===================================================== */

    addToCart?.addEventListener(
        "click",
        () => {

            if (!currentProduct) {
                return;
            }


            if (
                Number(currentProduct.stock) <= 0
            ) {

                showToast(
                    "This product is currently out of stock."
                );

                return;
            }


            const cart =
                JSON.parse(
                    localStorage.getItem("cart") || "[]"
                );


            const existingProduct =
                cart.find(
                    item =>
                        Number(item.id) ===
                        Number(currentProduct.id)
                );


            if (existingProduct) {

                existingProduct.quantity +=
                    quantity;

            }
            else {

                cart.push({

                    id: currentProduct.id,

                    name: currentProduct.name,

                    price: Number(currentProduct.price),

                    image: currentProduct.image,

                    quantity: quantity,

                    stock: Number(currentProduct.stock)

                });

            }


            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );


            showToast(
                `${currentProduct.name} added to cart.`
            );


            console.log(
                "Cart:",
                cart
            );

        }
    );


    /* =====================================================
       BUY NOW
    ===================================================== */

    buyNow?.addEventListener(
        "click",
        () => {

            if (!currentProduct) {
                return;
            }


            if (
                Number(currentProduct.stock) <= 0
            ) {

                showToast(
                    "This product is currently out of stock."
                );

                return;
            }


            const cart =
                JSON.parse(
                    localStorage.getItem("cart") || "[]"
                );


            const existingProduct =
                cart.find(
                    item =>
                        Number(item.id) ===
                        Number(currentProduct.id)
                );


            if (existingProduct) {

                existingProduct.quantity +=
                    quantity;

            }
            else {

                cart.push({

                    id: currentProduct.id,

                    name: currentProduct.name,

                    price: Number(currentProduct.price),

                    image: currentProduct.image,

                    quantity: quantity,

                    stock: Number(currentProduct.stock)

                });

            }


            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );


            window.location.href =
                "cart.html";

        }
    );


    /* =====================================================
       PINCODE CHECK
       Validation only for now.
       Real serviceability will be connected later.
    ===================================================== */

    checkPincode?.addEventListener(
        "click",
        () => {

            const pincode =
                pincodeInput.value.trim();


            if (!/^[0-9]{6}$/.test(pincode)) {

                pincodeResult.textContent =
                    "Please enter a valid 6-digit PIN code.";

                return;
            }


            pincodeResult.textContent =
                "PIN accepted. Delivery serviceability will be confirmed at checkout.";

        }
    );


    /* =====================================================
       TOAST
    ===================================================== */

    function showToast(message) {

        let toast =
            document.querySelector(".product-toast");


        if (!toast) {

            toast =
                document.createElement("div");

            toast.className =
                "product-toast";

            document.body.appendChild(
                toast
            );
        }


        toast.textContent =
            message;


        toast.classList.add(
            "show"
        );


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
       PRODUCT INFORMATION TABS
    ===================================================== */

    const tabs =
        document.querySelectorAll(".info-tab");

    const panels =
        document.querySelectorAll(".info-panel");


    tabs.forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                const target =
                    tab.dataset.tab;


                tabs.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                panels.forEach(panel => {

                    panel.classList.remove(
                        "active"
                    );

                });


                tab.classList.add(
                    "active"
                );


                const targetPanel =
                    document.getElementById(
                        target
                    );


                if (targetPanel) {

                    targetPanel.classList.add(
                        "active"
                    );
                }

            }
        );

    });


    /* =====================================================
       START
    ===================================================== */

    loadProduct();

});