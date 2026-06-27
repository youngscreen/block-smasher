/**
 * src/YouTubePlayables.js
 * Helper wrapper module for the YouTube Playables SDK v1.
 * Provides easy-to-use hooks with fallback mock implementations for local testing and HMR protection.
 */

let cachedLanguage = 'en-US';

/**
 * Checks if a string contains lone UTF-16 surrogates and returns a well-formed string.
 * This is a requirement for the YouTube Playables saveData SDK method.
 * @param {string} str - The string to check.
 * @returns {string} - Cleaned string with replacement characters for any lone surrogates.
 */
function cleanLoneSurrogates(str) {
    if (typeof str.toWellFormed === 'function') {
        return str.toWellFormed();
    }
    // Polyfill regex to replace lone high surrogates not followed by low surrogates,
    // and lone low surrogates not preceded by high surrogates.
    return str.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|([^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g, (match, p1) => {
        return p1 ? p1 + '\uFFFD' : '\uFFFD';
    });
}

/**
 * Wraps a promise with a timeout. If the promise takes longer than the specified time,
 * it resolves with a fallback value (null) to prevent HMR and startup lockups.
 * @param {Promise} promise - The promise to wrap.
 * @param {number} ms - Timeout in milliseconds.
 * @returns {Promise}
 */
function withTimeout(promise, ms = 1000) {
    return Promise.race([
        promise,
        new Promise((resolve) => setTimeout(() => {
            console.warn(`[YT SDK] loadData timed out after ${ms}ms. Proceeding with fallback.`);
            resolve(null);
        }, ms))
    ]);
}

/**
 * Get the underlying SDK instance (either native ytgame, YTPlayables mock or a custom wrapper).
 */
function getSDK() {
    return window.ytgame || window.YTPlayables;
}

/**
 * 1. boot(callback)
 * Waits for both DOMContentLoaded and the global YTPlayables / ytgame SDK to be ready.
 * Supports hot reloads and standard load lifecycles.
 */
export function boot(callback) {
    const handleBoot = () => {
        console.log("[YT SDK Wrapper] Booting system...");
        // Ensure SDK mocks or bindings are ready
        callback();
    };

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        // Already loaded, boot immediately
        handleBoot();
    } else {
        window.addEventListener('DOMContentLoaded', handleBoot);
    }
}

/**
 * 2. firstFrameReady()
 * Calls the native SDK's firstFrameReady() method to dismiss the initial loading screen.
 */
let firstFrameCalled = false;
export function firstFrameReady() {
    if (firstFrameCalled) return;
    try {
        const sdk = getSDK();
        if (sdk && sdk.game && typeof sdk.game.firstFrameReady === 'function') {
            sdk.game.firstFrameReady();
            firstFrameCalled = true;
            console.log("[YT SDK Wrapper] SDK firstFrameReady() invoked.");
        } else {
            console.log("[Mock YT SDK] firstFrameReady() invoked.");
            firstFrameCalled = true;
        }
    } catch (error) {
        console.error("[YT SDK Wrapper] Error calling firstFrameReady:", error);
    }
}

/**
 * 3. setOnPause(callback) & setOnResume(callback)
 * Subscribes to YouTube's system pause/resume events.
 */
export function setOnPause(callback) {
    try {
        const sdk = getSDK();
        if (sdk && sdk.system && typeof sdk.system.onPause === 'function') {
            sdk.system.onPause(callback);
            console.log("[YT SDK Wrapper] Registered SDK onPause handler.");
        } else {
            console.log("[Mock YT SDK] Registered onPause handler.");
        }
    } catch (error) {
        console.error("[YT SDK Wrapper] Error setting onPause:", error);
    }
}

export function setOnResume(callback) {
    try {
        const sdk = getSDK();
        if (sdk && sdk.system && typeof sdk.system.onResume === 'function') {
            sdk.system.onResume(callback);
            console.log("[YT SDK Wrapper] Registered SDK onResume handler.");
        } else {
            console.log("[Mock YT SDK] Registered onResume handler.");
        }
    } catch (error) {
        console.error("[YT SDK Wrapper] Error setting onResume:", error);
    }
}

/**
 * 4. isAudioEnabled()
 * Queries the SDK for initial system audio mute status.
 * @returns {boolean} - true if audio is enabled, false if muted.
 */
export function isAudioEnabled() {
    try {
        const sdk = getSDK();
        if (sdk && sdk.system && typeof sdk.system.isAudioEnabled === 'function') {
            return sdk.system.isAudioEnabled();
        }
    } catch (error) {
        console.error("[YT SDK Wrapper] Error calling isAudioEnabled:", error);
    }
    return true; // Fallback to enabled in local dev
}

/**
 * 5. setAudioChangeCallback(callback)
 * Subscribes to system mute/unmute events from YouTube UI.
 */
export function setAudioChangeCallback(callback) {
    try {
        const sdk = getSDK();
        if (sdk && sdk.system && typeof sdk.system.onAudioEnabledChange === 'function') {
            sdk.system.onAudioEnabledChange(callback);
            console.log("[YT SDK Wrapper] Registered SDK onAudioEnabledChange callback.");
        } else {
            console.log("[Mock YT SDK] Registered onAudioEnabledChange callback.");
        }
    } catch (error) {
        console.error("[YT SDK Wrapper] Error setting audio change callback:", error);
    }
}

/**
 * 6. gameReady()
 * Signals YouTube that the game loading is complete and is now fully interactive.
 */
export function gameReady() {
    try {
        const sdk = getSDK();
        if (sdk && sdk.game && typeof sdk.game.gameReady === 'function') {
            sdk.game.gameReady();
            console.log("[YT SDK Wrapper] SDK gameReady() invoked.");
        } else {
            console.log("[Mock YT SDK] gameReady() invoked.");
        }
    } catch (error) {
        console.error("[YT SDK Wrapper] Error calling gameReady:", error);
    }
}

/**
 * 7. loadLanguage()
 * Asynchronously fetches and caches the player's system language in BCP 47 format.
 * @returns {Promise<string>}
 */
export async function loadLanguage() {
    try {
        const sdk = getSDK();
        if (sdk && sdk.system && typeof sdk.system.getLanguage === 'function') {
            cachedLanguage = sdk.system.getLanguage();
        } else if (navigator.language) {
            cachedLanguage = navigator.language;
        }
    } catch (error) {
        console.error("[YT SDK Wrapper] Error retrieving system language:", error);
    }
    console.log(`[YT SDK Wrapper] Language loaded: ${cachedLanguage}`);
    return cachedLanguage;
}

/**
 * 8. loadData() & saveData(data)
 * Handles loading and saving game state with safety wrappers.
 */
export async function loadData() {
    const loadPromise = (async () => {
        try {
            const sdk = getSDK();
            if (sdk && sdk.game && typeof sdk.game.loadData === 'function') {
                const rawString = await sdk.game.loadData();
                if (rawString) {
                    return JSON.parse(rawString);
                }
            } else {
                // Local Storage fallback for local testing
                const data = localStorage.getItem('block_smasher_save');
                return data ? JSON.parse(data) : null;
            }
        } catch (error) {
            console.error("[YT SDK Wrapper] Error loading data:", error);
        }
        return null;
    })();

    // Safety timeout of 1000ms to prevent game hang in development/HMR
    return withTimeout(loadPromise, 1000);
}

export async function saveData(data) {
    try {
        let serialized = JSON.stringify(data);
        serialized = cleanLoneSurrogates(serialized);

        const sdk = getSDK();
        if (sdk && sdk.game && typeof sdk.game.saveData === 'function') {
            await sdk.game.saveData(serialized);
            console.log("[YT SDK Wrapper] SDK saveData successful.");
        } else {
            // Local Storage fallback for local testing
            localStorage.setItem('block_smasher_save', serialized);
            console.log("[Mock YT SDK] saveData stored locally:", serialized);
        }
    } catch (error) {
        console.error("[YT SDK Wrapper] Error in saveData:", error);
    }
}

/**
 * 9. sendScore(score)
 * Submits the score value to YouTube engagement services.
 * @param {number} score - The score integer to submit.
 */
export function sendScore(score) {
    try {
        const scoreInt = parseInt(score, 10);
        if (isNaN(scoreInt)) {
            throw new Error("Score must be a valid integer");
        }

        const sdk = getSDK();
        if (sdk && sdk.engagement && typeof sdk.engagement.sendScore === 'function') {
            sdk.engagement.sendScore({ value: scoreInt });
            console.log(`[YT SDK Wrapper] SDK sendScore successful: ${scoreInt}`);
        } else {
            console.log(`[Mock YT SDK] sendScore simulated: ${scoreInt}`);
        }
    } catch (error) {
        console.error("[YT SDK Wrapper] Error sending score:", error);
    }
}
