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
            die: "./img/type-two/die.svg",
            fright: "./img/type-two/fright.jpg",
            default: "./img/type-two/default.png"
        },
        "type-three": {
            logo: "./img/type-three/logo.png",
            die: "./img/type-three/die.svg",
            fright: "./img/type-three/fright.svg",
            default: "./img/type-three/default.svg"
        }
    };
    const config = {
        SHOTS_LIMIT: 10,
        IMAGE_RESET_DELAY: 700,
        FADE_DURATION: 500,
        RESET_TIME: "00:00",
        SOUND_DELAY: 500,
        FALLBACK_IMAGE: "./img/default-placeholder.png",
        SHOT_SOUND: "./img/sounds/shot.mp3",
        RELOAD_SOUND: "./img/sounds/reload.mp3",
        SCARE_SOUND_INTERVAL: 1e3,
        MAX_MOUSE_WIDTH: 300
    };
    let currentType = Object.keys(imagePaths)[Math.floor(Math.random() * Object.keys(imagePaths).length)];
    let state = {
        shotsRemaining: parseInt(localStorage.getItem("shotsRemaining"), 10) || config.SHOTS_LIMIT,
        lastResetDate: localStorage.getItem("lastResetDate") || (new Date).toDateString(),
        isClicked: false,
        soundMuted: true,
        scareSoundPlaying: false,
        scareAudio: null,
        shotAudio: new Audio(config.SHOT_SOUND),
        lastScareSoundTime: 0,
        clickProcessing: false,
        isClickedOnce: false,
        temporaryShakeDisabled: false
    };
    const script_elements = {
        soundButton: document.querySelector(".sound-button"),
        picture: document.querySelector(".picture"),
        pictureImage: document.querySelector(".picture__image img"),
        blood: document.querySelector(".picture__blood"),
        tokensInfo: document.querySelector(".tokens-info b"),
        cursor: document.querySelector(".picture__cursor"),
        headerLogo: document.querySelector(".header-app__logo img"),
        headerTradeImage: document.querySelector(".header-app__trade-image img")
    };
    const preloadImages = () => {
        Object.values(imagePaths).forEach((type => {
            Object.values(type).forEach((src => {
                if (src) {
                    const img = new Image;
                    img.src = src;
                }
            }));
        }));
    };
    const setImagesForType = (type, immediate = false) => {
        if (immediate) setImageImmediately(imagePaths[type].default); else changeImageSmoothly(imagePaths[type].default);
        script_elements.headerLogo.src = imagePaths[type].logo;
        script_elements.headerTradeImage.src = imagePaths[type].logo;
    };
    const getRandomType = excludeType => {
        const types = Object.keys(imagePaths).filter((type => type !== excludeType));
        return types[Math.floor(Math.random() * types.length)];
    };
    const saveStateToLocalStorage = () => {
        localStorage.setItem("shotsRemaining", state.shotsRemaining);
        localStorage.setItem("lastResetDate", state.lastResetDate);
    };
    const checkAndResetShots = () => {
        const currentDate = (new Date).toDateString();
        if (state.lastResetDate !== currentDate) {
            state.shotsRemaining = config.SHOTS_LIMIT;
            state.lastResetDate = currentDate;
            saveStateToLocalStorage();
        }
    };
    const updateSoundButtonIcon = () => {
        const soundIcon = state.soundMuted ? "charm_sound-mute.svg" : "charm_sound-down.svg";
        script_elements.soundButton.querySelector("img").src = `./img/${soundIcon}`;
    };
    const isTouchScreen = () => "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const playScareSound = () => {
        const currentTime = Date.now();
        if (currentTime - state.lastScareSoundTime < config.SCARE_SOUND_INTERVAL || isMobileScreen() || isTouchScreen()) return;
        state.lastScareSoundTime = currentTime;
        if (state.soundMuted || state.scareSoundPlaying) return;
        state.scareAudio = new Audio("./img/sounds/ispugannoe-dyihanie.mp3");
        state.scareSoundPlaying = true;
        state.scareAudio.play().catch((err => console.error("Sound playback failed:", err)));
        state.scareAudio.onended = () => {
            state.scareSoundPlaying = false;
        };
    };
    const stopScareSound = () => {
        if (state.scareAudio) {
            state.scareAudio.pause();
            state.scareAudio.currentTime = 0;
            state.scareSoundPlaying = false;
        }
    };
    const playShotSound = () => {
        if (!state.soundMuted) state.shotAudio.play().catch((err => console.error("Shot sound playback failed:", err)));
    };
    const updateTokensInfo = () => {
        script_elements.tokensInfo.textContent = `${state.shotsRemaining} kill${state.shotsRemaining !== 1 ? "s" : ""}/day`;
    };
    const positionBloodAndCursor = event => {
        const rect = script_elements.picture.getBoundingClientRect();
        const x = (event.clientX || event.touches[0].clientX) - rect.left;
        const y = (event.clientY || event.touches[0].clientY) - rect.top;
        script_elements.blood.style.left = `${x - script_elements.blood.offsetWidth / 2}px`;
        script_elements.blood.style.top = `${y - script_elements.blood.offsetHeight / 2}px`;
        script_elements.blood.style.opacity = "1";
        if (!isMobileScreen()) {
            script_elements.cursor.style.left = `${x - script_elements.cursor.offsetWidth / 2}px`;
            script_elements.cursor.style.top = `${y - script_elements.cursor.offsetHeight / 2}px`;
            script_elements.cursor.style.opacity = "1";
        }
    };
    const resetBloodAndCursor = () => {
        setTimeout((() => {
            script_elements.blood.style.opacity = "0";
            script_elements.cursor.style.opacity = "0";
        }), 0);
    };
    const addShakeEffect = () => {
        script_elements.pictureImage.classList.add("shake");
    };
    const removeShakeEffect = () => {
        script_elements.pictureImage.classList.remove("shake");
    };
    const handleSoundButtonClick = () => {
        state.soundMuted = !state.soundMuted;
        updateSoundButtonIcon();
    };
    const handlePictureMouseMove = () => {
        if (state.temporaryShakeDisabled) return;
        if (!state.isClicked) {
            script_elements.pictureImage.src = imagePaths[currentType].fright;
            addShakeEffect();
            playScareSound();
        }
    };
    const handlePictureMouseLeave = () => {
        if (state.isClickedOnce) return;
        script_elements.pictureImage.src = imagePaths[currentType].default;
        stopScareSound();
        resetBloodAndCursor();
        removeShakeEffect();
        const rect = script_elements.picture.getBoundingClientRect();
        script_elements.cursor.style.left = `${rect.width - script_elements.cursor.offsetWidth}px`;
        script_elements.cursor.style.top = `${rect.height - script_elements.cursor.offsetHeight}px`;
        script_elements.cursor.style.opacity = "1";
    };
    const changeImageSmoothly = newSrc => {
        state.clickProcessing = true;
        fadeOutImage((() => {
            fullReset();
            fadeInImage(newSrc);
            setTimeout((() => {
                state.clickProcessing = false;
            }), config.FADE_DURATION);
        }));
    };
    const fadeOutImage = callback => {
        script_elements.pictureImage.style.opacity = "0";
        setTimeout(callback, config.FADE_DURATION);
    };
    const fadeInImage = newSrc => {
        script_elements.pictureImage.src = newSrc;
        setTimeout((() => {
            script_elements.pictureImage.style.opacity = "1";
        }), 50);
    };
    const fullReset = () => {
        stopScareSound();
        resetBloodAndCursor();
        removeShakeEffect();
    };
    const setImageImmediately = src => {
        script_elements.pictureImage.style.transition = "none";
        script_elements.pictureImage.src = src;
        script_elements.pictureImage.style.opacity = "1";
        setTimeout((() => {
            script_elements.pictureImage.style.transition = `opacity ${config.FADE_DURATION}ms ease`;
        }), 50);
    };
    const handlePictureClick = event => {
        if (state.clickProcessing) return;
        state.clickProcessing = true;
        if (state.shotsRemaining > 0) {
            playShotSound();
            positionBloodAndCursor(event);
            script_elements.pictureImage.src = imagePaths[currentType].fright;
            state.isClickedOnce = true;
            state.shotsRemaining -= 1;
            updateTokensInfo();
            saveStateToLocalStorage();
            state.temporaryShakeDisabled = true;
            removeShakeEffect();
            state.shotAudio.onended = () => {
                const reloadAudio = new Audio(config.RELOAD_SOUND);
                reloadAudio.play().then((() => {
                    reloadAudio.onended = () => {
                        resetBloodAndCursor();
                        const newType = getRandomType(currentType);
                        currentType = newType;
                        setImagesForType(newType);
                        setTimeout((() => {
                            state.temporaryShakeDisabled = false;
                            state.clickProcessing = false;
                        }), config.IMAGE_RESET_DELAY);
                    };
                })).catch((err => {
                    console.error("Error playing reload sound:", err);
                    state.clickProcessing = false;
                }));
            };
        } else {
            alert("Выстрелы закончились на сегодня!");
            state.clickProcessing = false;
        }
    };
    const handleMouseMove = event => {
        const rect = script_elements.picture.getBoundingClientRect();
        const x = (event.clientX || event.touches?.[0]?.clientX || 0) - rect.left - script_elements.cursor.offsetWidth / 2;
        const y = (event.clientY || event.touches?.[0]?.clientY || 0) - rect.top - script_elements.cursor.offsetHeight / 2;
        script_elements.cursor.style.left = `${x}px`;
        script_elements.cursor.style.top = `${y}px`;
        script_elements.cursor.style.opacity = "1";
    };
    const isMobileScreen = () => window.innerWidth <= config.MAX_MOUSE_WIDTH;
    const initialize = () => {
        if (script_elements.headerLogo && script_elements.headerTradeImage) {
            script_elements.headerLogo.src = imagePaths[currentType].logo;
            script_elements.headerTradeImage.src = imagePaths[currentType].logo;
        }
        if (script_elements.picture) {
            preloadImages();
            checkAndResetShots();
            updateTokensInfo();
            updateSoundButtonIcon();
            setImagesForType(currentType, true);
            if (isMobileScreen()) script_elements.picture.addEventListener("touchstart", handlePictureClick); else {
                script_elements.picture.addEventListener("mousemove", handlePictureMouseMove);
                script_elements.picture.addEventListener("mouseleave", handlePictureMouseLeave);
                script_elements.picture.addEventListener("mousemove", handleMouseMove);
                script_elements.picture.addEventListener("click", handlePictureClick);
            }
            script_elements.pictureImage.style.transition = `opacity ${config.FADE_DURATION}ms ease`;
            script_elements.soundButton.addEventListener("click", handleSoundButtonClick);
        } else console.warn("Element '.picture' not found. Skipping related logic.");
    };
    initialize();
    window["FLS"] = true;
    addLoadedClass();
})();