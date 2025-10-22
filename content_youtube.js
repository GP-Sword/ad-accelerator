(function () {
    const skipButtonSelectors = [
        // Original version
        '.ytp-ad-skip-button',
        '.ytp-ad-skip-button-modern',
        '.ytp-skip-ad-button',
        // Observed May 2024
        '.ytp-skip-ad button',
        '[id^="skip-ad"] button',
        '[id^="skip-button"]',
    ];

    function checkAdBlockerPopup() {
        // Adblocker popup container
        const blockerPopup = document.querySelector("ytd-popup-container");

        // Check and remove ad blocker popup
        if (blockerPopup) {
            blockerPopup.remove();
        }
    }

    function checkEnforcementMessage() {
        // Enforcement element that block video playback
        const enforcementMessageElement = document.querySelector(
            ".ytd-enforcement-message-view-model",
        );
        const playabilityErrorElement = document.querySelector(
            ".yt-playability-error-supported-renderers",
        );

        // Reload page if video playback is blocked
        if (enforcementMessageElement && playabilityErrorElement) {
            enforcementMessageElement.remove();
            playabilityErrorElement.remove();

            window.location.reload();
        }
    }

    // Checks for ads and manipulates the video or uses skip button if present
    function handleVideoAd() {
        // Deal with ad blocker elements first
        checkAdBlockerPopup();
        checkEnforcementMessage();

        const adContainer = document.querySelector('.ad-showing');
        if (!adContainer) {
            return; // No ad is showing, so we do nothing
        }

        const adVideo = adContainer.querySelector('video');
        if (adVideo && adVideo.duration) {
            muteAndSpeedUp(adVideo, 8.0);
            try {
                adVideo.currentTime = adVideo.duration;
            } catch (e) {
                // Uncaught TypeError for ad duration, doesn't affect anything
            }
        }

        // The Skip button is no longer clickable
        const skipButton = document.querySelector(skipButtonSelectors.join(', '));
        if (skipButton) {
            // There is a skip button at the ad end screen, speed up the timer
            adContainer.playbackRate = 16.0;
        }
    }

    function muteAndSpeedUp(videoElement, playbackRate) {
        videoElement.muted = true;
        videoElement.playbackRate = playbackRate;
    }

    function initializeAdHandling() {
        handleVideoAd();

        const observer = new MutationObserver(handleVideoAd);
        observer.observe(document.body, { childList: true, subtree: true });
    }
    initializeAdHandling()
})();