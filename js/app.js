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
    const getRandomType = () => {
        const keys = Object.keys(imagePaths);
        return keys[Math.floor(Math.random() * keys.length)];
    };
    const SHOTS_LIMIT = 10;
    const IMAGE_RESET_DELAY = 500;
    const FADE_DURATION = 300;
    const RESET_TIME = "00:00";
    let shotsRemaining = parseInt(localStorage.getItem("shotsRemaining"), 10) || SHOTS_LIMIT;
    let lastResetDate = localStorage.getItem("lastResetDate") || (new Date).toDateString();
    let lastType = getRandomType();
    let isClicked = false;
    let soundMuted = false;
    const saveStateToLocalStorage = () => {
        localStorage.setItem("shotsRemaining", shotsRemaining);
        localStorage.setItem("lastResetDate", lastResetDate);
        localStorage.setItem("lastType", lastType);
    };
    const checkAndResetShots = () => {
        const currentDate = new Date;
        const currentDateString = currentDate.toDateString();
        const currentTime = currentDate.toTimeString().slice(0, 5);
        if (lastResetDate !== currentDateString && currentTime >= RESET_TIME) {
            shotsRemaining = SHOTS_LIMIT;
            lastResetDate = currentDateString;
            saveStateToLocalStorage();
        }
    };
    const createOrUpdateImage = (src, parentSelector) => {
        const parent = document.querySelector(parentSelector);
        if (!parent) return null;
        let img = parent.querySelector("img");
        if (!img) {
            img = document.createElement("img");
            parent.appendChild(img);
        }
        img.src = src;
        return img;
    };
    const updateHeaderImages = () => {
        createOrUpdateImage(imagePaths[lastType].logo, ".header-app__logo");
        createOrUpdateImage(imagePaths[lastType].logo, ".header-app__trade-image");
    };
    const updatePictureImage = () => {
        const parent = document.querySelector(".picture__image");
        if (!parent) return;
        let img = parent.querySelector("img");
        if (!img) {
            img = document.createElement("img");
            parent.appendChild(img);
        }
        img.style.opacity = "0";
        setTimeout((() => {
            img.src = imagePaths[lastType].default;
            img.style.transition = `opacity ${FADE_DURATION}ms`;
            img.style.opacity = "1";
        }), 100);
    };
    const updateShotsInfo = () => {
        const tokensInfo = document.querySelector(".tokens-info b");
        if (tokensInfo) tokensInfo.textContent = `${shotsRemaining} kill${shotsRemaining !== 1 ? "s" : ""}/day`;
    };
    const initializeImages = () => {
        updateHeaderImages();
        updatePictureImage();
    };
    const setupSoundButtonEvents = () => {
        const soundButton = document.querySelector(".sound-button");
        if (soundButton) soundButton.addEventListener("click", (() => {
            soundMuted = !soundMuted;
            const soundIcon = soundMuted ? "charm_sound-mute.svg" : "charm_sound-down.svg";
            createOrUpdateImage(`../img/${soundIcon}`, ".sound-button");
        }));
    };
    const playSound = soundPath => {
        if (!soundMuted) {
            const audio = new Audio(soundPath);
            audio.play().catch((error => {
                console.error("Sound playback failed:", error);
            }));
        }
    };
    const setupPictureImageEvents = () => {
        const picture = document.querySelector(".picture");
        const cursor = document.querySelector(".picture__cursor");
        initializeImages();
        const isMobileOrSmallScreen = () => window.innerWidth <= 600 || "ontouchstart" in document.documentElement;
        if (picture) {
            const handleCursorVisibility = (show, x = 0, y = 0) => {
                if (cursor) if (show) {
                    const rect = picture.getBoundingClientRect();
                    const cursorX = x - rect.left - cursor.offsetWidth / 2;
                    const cursorY = y - rect.top - cursor.offsetHeight / 2;
                    cursor.style.display = "block";
                    cursor.style.left = `${cursorX}px`;
                    cursor.style.top = `${cursorY}px`;
                } else cursor.style.display = "none";
            };
            const handlePictureClick = event => {
                if (shotsRemaining > 0 && !isClicked) {
                    isClicked = true;
                    if (isMobileOrSmallScreen()) {
                        const touch = event.touches ? event.touches[0] : event;
                        const rect = picture.getBoundingClientRect();
                        const x = touch.clientX - rect.left;
                        const y = touch.clientY - rect.top;
                        handleCursorVisibility(true, touch.clientX, touch.clientY);
                        cursor.style.left = `${x - cursor.offsetWidth / 2}px`;
                        cursor.style.top = `${y - cursor.offsetHeight / 2}px`;
                    }
                    playSound("../img/sounds/shot.mp3");
                    const img = picture.querySelector(".picture__image img");
                    if (img) img.src = imagePaths[lastType].die;
                    shotsRemaining -= 1;
                    saveStateToLocalStorage();
                    updateShotsInfo();
                    setTimeout((() => {
                        const img = picture.querySelector(".picture__image img");
                        if (img) img.src = imagePaths[lastType].default;
                        isClicked = false;
                        handleCursorVisibility(false);
                    }), IMAGE_RESET_DELAY);
                } else if (shotsRemaining <= 0) alert("You have no shots remaining today!");
            };
            if (isMobileOrSmallScreen()) picture.addEventListener("touchstart", handlePictureClick); else {
                picture.addEventListener("mouseenter", (e => {
                    if (!isClicked) {
                        handleCursorVisibility(true, e.clientX, e.clientY);
                        picture.style.cursor = "none";
                        const img = picture.querySelector(".picture__image img");
                        if (img) img.src = imagePaths[lastType].fright;
                        playSound("../img/sounds/ispugannoe-dyihanie.mp3");
                    }
                }));
                picture.addEventListener("mouseleave", (() => {
                    if (!isClicked) {
                        handleCursorVisibility(false);
                        const img = picture.querySelector(".picture__image img");
                        if (img) img.src = imagePaths[lastType].default;
                    }
                }));
                picture.addEventListener("mousemove", (e => {
                    if (!isClicked && cursor) handleCursorVisibility(true, e.clientX, e.clientY);
                }));
                picture.addEventListener("click", handlePictureClick);
            }
        }
    };
    window.onload = () => {
        checkAndResetShots();
        updateShotsInfo();
        setupPictureImageEvents();
        setupSoundButtonEvents();
    };
    window["FLS"] = true;
    addLoadedClass();
})();