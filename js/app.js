(() => {
    "use strict";
    function addLoadedClass() {
        if (!document.documentElement.classList.contains("loading")) window.addEventListener("load", (function() {
            setTimeout((function() {
                document.documentElement.classList.add("loaded");
            }), 0);
        }));
    }
    let addWindowScrollEvent = false;
    setTimeout((() => {
        if (addWindowScrollEvent) {
            let windowScroll = new Event("windowScroll");
            window.addEventListener("scroll", (function(e) {
                document.dispatchEvent(windowScroll);
            }));
        }
    }), 0);
    const imagePaths = {
        "type-one": {
            logo: "./img/type-one/logo.png",
            die: "./img/type-one/die.jpg",
            fright: "./img/type-one/fright.jpg",
            default: "./img/type-one/default.jpg"
        },
        "type-two": {
            logo: "./img/type-two/logo.png",
            die: "./img/type-two/die.jpg",
            fright: "./img/type-two/fright.jpg",
            default: "./img/type-two/default.jpg"
        },
        "type-three": {
            logo: "./img/type-three/logo.png",
            die: "./img/type-three/die.jpg",
            fright: "./img/type-three/fright.jpg",
            default: "./img/type-three/default.jpg"
        }
    };
    function getRandomType() {
        const keys = Object.keys(imagePaths);
        return keys[Math.floor(Math.random() * keys.length)];
    }
    function updateHeaderImages() {
        const headerLogo = document.querySelector(".header-app__logo img");
        const headerTradeImage = document.querySelector(".header-app__trade-image img");
        const randomType = getRandomType();
        if (headerLogo) headerLogo.src = imagePaths[randomType].logo;
        if (headerTradeImage) headerTradeImage.src = imagePaths[randomType].logo;
        return randomType;
    }
    function updatePictureImage(randomType) {
        const pictureImage = document.querySelector(".picture__image img");
        if (pictureImage) pictureImage.src = imagePaths[randomType].default;
    }
    function initializeImages() {
        const randomType = updateHeaderImages();
        updatePictureImage(randomType);
        return randomType;
    }
    function setupPictureImageEvents() {
        const picture = document.querySelector(".picture");
        const pictureImage = document.querySelector(".picture__image img");
        const cursor = document.querySelector(".picture__cursor");
        let isClicked = false;
        let randomType = initializeImages();
        if (picture && cursor) {
            picture.addEventListener("mouseenter", (() => {
                if (!isClicked) {
                    cursor.style.display = "block";
                    picture.style.cursor = "none";
                    if (pictureImage) pictureImage.src = imagePaths[randomType].fright;
                }
            }));
            picture.addEventListener("mouseleave", (() => {
                if (!isClicked) {
                    cursor.style.display = "none";
                    if (pictureImage) pictureImage.src = imagePaths[randomType].default;
                }
            }));
            picture.addEventListener("mousemove", (e => {
                if (!isClicked) {
                    const rect = picture.getBoundingClientRect();
                    const cursorX = e.clientX - rect.left - cursor.offsetWidth / 2;
                    const cursorY = e.clientY - rect.top - cursor.offsetHeight / 2;
                    cursor.style.left = `${cursorX}px`;
                    cursor.style.top = `${cursorY}px`;
                }
            }));
            picture.addEventListener("click", (e => {
                isClicked = true;
                const rect = picture.getBoundingClientRect();
                const cursorX = e.clientX - rect.left - cursor.offsetWidth / 2;
                const cursorY = e.clientY - rect.top - cursor.offsetHeight / 2;
                cursor.style.left = `${cursorX}px`;
                cursor.style.top = `${cursorY}px`;
                if (pictureImage) pictureImage.src = imagePaths[randomType].die;
                setTimeout((() => {
                    isClicked = false;
                    randomType = initializeImages();
                }), 5e3);
            }));
        }
    }
    window.onload = function() {
        setupPictureImageEvents();
    };
    window["FLS"] = true;
    addLoadedClass();
})();