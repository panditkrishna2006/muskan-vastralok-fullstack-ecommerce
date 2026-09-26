// Main website JavaScript

// =========================================================
// TRENDING SAREES - ADD TO CART
// =========================================================

function addToCart() {

    const cartCount =
        document.querySelector('.nav-icon[title="Cart"] .count');

    if (!cartCount) {
        return;
    }

    let currentCount =
        parseInt(cartCount.textContent) || 0;

    currentCount++;

    cartCount.textContent = currentCount;

}

/* =========================================================
   PREMIUM PAGE TRANSITION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const pageLinks =
        document.querySelectorAll(
            'a[href]:not([target="_blank"]):not([href^="#"]):not([href^="http"]):not([href^="mailto:"]):not([href^="tel:"])'
        );


    pageLinks.forEach(link => {

        link.addEventListener("click", event => {

            const target =
                link.getAttribute("href");

            if (
                !target ||
                target === "#" ||
                target.startsWith("javascript:")
            ) {
                return;
            }


            event.preventDefault();


            document.body.classList.add("page-leaving");


            setTimeout(() => {

                window.location.href = target;

            }, 280);

        });

    });

});