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

    let lastUserInteractionTime = 0;
    const handledVideos = new WeakSet(); 

    function updateInteractionTime() {
        lastUserInteractionTime = Date.now();
    }

    window.addEventListener('mousedown', updateInteractionTime, { capture: true });
    window.addEventListener('keydown', updateInteractionTime, { capture: true });
    window.addEventListener('touchstart', updateInteractionTime, { capture: true });

    function clickPlayButton() {
        const playButton = document.querySelector('.ytp-play-button');
        if (playButton) {
            playButton.click();
        } else {
            // Fallback: try standard DOM play if button not found
            const video = document.querySelector('video');
            if(video) video.play();
        }
    }

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

    function checkAdEndScreen() {
        // The Skip button is no longer clickable, but does appear at the end screen
        const skipButton = document.querySelector(skipButtonSelectors.join(', '));

        // Reload page at end screen
        if (skipButton) {
            skipButton.remove();
            
            window.location.reload();
        }
    }

    function setupKeepAlive(videoElement) {
        if (handledVideos.has(videoElement)) return;
        handledVideos.add(videoElement);
        let readyTime = Date.now();

        function checkAndResume() {
            // If ad playing, let ad logic deal with it
            if (document.querySelector('.ad-showing')) return;

            // 3-second start-up window
            const now = Date.now();
            const isStartupWindow = (now - readyTime) < 3000;

            // Human interaction
            const isHumanInteraction = (now - lastUserInteractionTime) < 500;

            // Else
            if (isStartupWindow && videoElement.paused && !isHumanInteraction) {
                console.log("Extension: Video paused on load/startup. Unpausing.");
                clickPlayButton();
            }
        }

        // Check immediately (in case it loaded paused)
        checkAndResume();
        
        // Check again after 1s (in case browser auto-paused it slightly later)
        setTimeout(checkAndResume, 1000);

        // Listen for pause events (e.g., auto-pause triggers)
        videoElement.addEventListener('pause', checkAndResume);

        // Reset the "Ready Time" if the video wasn't actually ready yet
        videoElement.addEventListener('canplay', () => {
            readyTime = Date.now();
            setTimeout(checkAndResume, 1000); 
        }, { once: true });
    }

    // Checks for ads and manipulates the video or uses skip button if present
    function handleVideoAd() {
        // Deal with ad blocker elements first
        checkAdBlockerPopup();
        checkEnforcementMessage();

        const mainVideo = document.querySelector('video');
        if (mainVideo) {
            setupKeepAlive(mainVideo);
        }
        
        const adContainer = document.querySelector('.ad-showing');
        if (!adContainer) {
            return; // No ad is showing, so we do nothing
        }
        
        // Check if is at end screen
        checkAdEndScreen();

        // Else, skip the ad
        const adVideo = adContainer.querySelector('video');
        if (adVideo && adVideo.duration) {
            muteAndSpeedUp(adVideo, 8.0);
            try {
                adVideo.currentTime = adVideo.duration;
            } catch (e) {
                // Uncaught TypeError for ad duration, doesn't affect anything
            }
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

    initializeAdHandling();
})();