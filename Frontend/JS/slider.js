// Hero slider JavaScript

/* =========================================================
   HERO AUTO SLIDER
========================================================= */


/* Get all slides */

const heroSlides = document.querySelectorAll(".hero-slide");


/* Get all dots */

const heroDots = document.querySelectorAll(".hero-dot");


/* Current slide */

let currentHeroSlide = 0;


/* Timer */

let heroTimer;


/* =========================================================
   SHOW SLIDE
========================================================= */

function showHeroSlide(index) {

    /* Remove active class from all slides */

    heroSlides.forEach(function (slide) {

        slide.classList.remove("active");

    });


    /* Remove active class from all dots */

    heroDots.forEach(function (dot) {

        dot.classList.remove("active");

    });


    /* Add active class to selected slide */

    heroSlides[index].classList.add("active");


    /* Add active class to selected dot */

    heroDots[index].classList.add("active");


    /* Update current slide */

    currentHeroSlide = index;

}


/* =========================================================
   NEXT SLIDE
========================================================= */

function nextSlide() {

    let nextIndex = currentHeroSlide + 1;


    /* If last slide, go to first */

    if (nextIndex >= heroSlides.length) {

        nextIndex = 0;

    }


    showHeroSlide(nextIndex);

}


/* =========================================================
   PREVIOUS SLIDE
========================================================= */

function previousSlide() {

    let previousIndex = currentHeroSlide - 1;


    /* If first slide, go to last */

    if (previousIndex < 0) {

        previousIndex = heroSlides.length - 1;

    }


    showHeroSlide(previousIndex);

}


/* =========================================================
   GO TO SPECIFIC SLIDE
========================================================= */

function goToSlide(index) {

    showHeroSlide(index);

    restartHeroTimer();

}


/* =========================================================
   START TIMER
========================================================= */

function startHeroTimer() {

    heroTimer = setInterval(function () {

        nextSlide();

    }, 5500);   // 5.5 seconds

}


/* =========================================================
   STOP TIMER
========================================================= */

function stopHeroTimer() {

    clearInterval(heroTimer);

}


/* =========================================================
   RESTART TIMER
========================================================= */

function restartHeroTimer() {

    stopHeroTimer();

    startHeroTimer();

}


/* =========================================================
   OPEN PRODUCT
========================================================= */

function openHeroProduct() {

    alert("Product details will be connected here.");

}


/* =========================================================
   PAUSE ON MOUSE HOVER
========================================================= */

const heroSection = document.querySelector(".hero-section");


heroSection.addEventListener("mouseenter", function () {

    stopHeroTimer();

});


heroSection.addEventListener("mouseleave", function () {

    startHeroTimer();

});


/* =========================================================
   START SLIDER
========================================================= */

startHeroTimer();