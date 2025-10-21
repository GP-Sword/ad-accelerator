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
    const blockerPopup = document.querySelector("ytd-popup-container");

    // Checks for ads and manipulates the video or uses skip button if present
    function handleVideoAd() {
        const adContainer = document.querySelector('.ad-showing');
        if (!adContainer) {
            return; // No ad is showing, so we do nothing.
        }

        const adVideo = adContainer.querySelector('video'); 
        if (adVideo && adVideo.duration) {
            muteAndSpeedUp(adVideo, 8.0);
            try {
                adVideo.currentTime = adVideo.duration;
            } catch (e) {
                // Uncaught TypeError, doesn't really change anything.
            }
        }

        // const skipButton = document.querySelector(skipButtonSelectors.join(', '));
        // if (skipButton) {
        //     skipButton.click();
        //     // console.log('Used Button to Skip Ad');
        // }

        // Check and remove ad blocker popup
        if (blockerPopup) {
            blockerPopup.remove();
        }
    }

    function getRandomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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