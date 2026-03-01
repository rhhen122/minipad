/**
 * Share current note to social platforms and copy to clipboard.
 */

const TWITTER_MAX = 280;
const BLUESKY_MAX = 300;

function encodeUri(text) {
    return encodeURIComponent(text);
}

function truncate(text, max) {
    if (!text || text.length <= max) return text;
    return text.slice(0, max - 3) + "...";
}

export function createShare(getText) {
    function getShareText() {
        const t = typeof getText === "function" ? getText() : "";
        return (t && t.trim()) || "";
    }

    function copyToClipboard(text) {
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
            const ta = document.createElement("textarea");
            ta.value = text;
            ta.style.position = "fixed";
            ta.style.opacity = "0";
            document.body.appendChild(ta);
            ta.select();
            try {
                document.execCommand("copy");
            } finally {
                document.body.removeChild(ta);
            }
            return Promise.resolve();
        }
        return navigator.clipboard.writeText(text);
    }

    function copyNote() {
        const text = getShareText();
        return copyToClipboard(text).then(() => "Note copied to clipboard");
    }

    function copyLink() {
        const url = window.location.href;
        return copyToClipboard(url).then(() => "Link copied to clipboard");
    }

    function shareToTwitter() {
        const text = truncate(getShareText(), TWITTER_MAX);
        const url = "https://twitter.com/intent/tweet?text=" + encodeUri(text);
        window.open(url, "_blank", "noopener,noreferrer,width=550,height=420");
    }

    function shareToBluesky() {
        const text = truncate(getShareText(), BLUESKY_MAX);
        const url = "https://bsky.app/intent/compose?text=" + encodeUri(text);
        window.open(url, "_blank", "noopener,noreferrer");
    }

    function shareToReddit() {
        const url = encodeUri(window.location.href);
        const title = encodeUri("minipad – lightweight note-taking");
        window.open("https://www.reddit.com/submit?url=" + url + "&title=" + title, "_blank", "noopener,noreferrer");
    }

    function shareToLinkedIn() {
        const url = encodeUri(window.location.href);
        window.open("https://www.linkedin.com/sharing/share-offsite/?url=" + url, "_blank", "noopener,noreferrer");
    }

    function shareToMastodon() {
        const text = getShareText();
        const url = "https://mastodonshare.com/?text=" + encodeUri(text);
        window.open(url, "_blank", "noopener,noreferrer");
    }

    function showToast(message) {
        const existing = document.getElementById("share-toast");
        if (existing) existing.remove();
        const toast = document.createElement("div");
        toast.id = "share-toast";
        toast.className = "share-toast";
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add("show"));
        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 200);
        }, 1800);
    }

    const actionMap = {
        copyNote: () => copyNote().then(showToast),
        copyLink: () => copyLink().then(showToast),
        twitter: () => { shareToTwitter(); closeAllShareDropdowns(); },
        bluesky: () => { shareToBluesky(); closeAllShareDropdowns(); },
        reddit: () => { shareToReddit(); closeAllShareDropdowns(); },
        linkedin: () => { shareToLinkedIn(); closeAllShareDropdowns(); },
        mastodon: () => { shareToMastodon(); closeAllShareDropdowns(); },
    };

    function closeAllShareDropdowns() {
        document.querySelectorAll(".share-dropdown.active").forEach((el) => el.classList.remove("active"));
    }

    function initShareUI() {
        const shareBtn = document.getElementById("shareBtn");
        const shareDropdown = document.getElementById("shareDropdown");
        if (shareBtn && shareDropdown) {
            shareBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                shareDropdown.classList.toggle("active");
            });
            shareDropdown.addEventListener("click", function (e) {
                e.stopPropagation();
            });
            const barIds = ["shareCopyNote", "shareCopyLink", "shareTwitter", "shareBluesky", "shareReddit", "shareLinkedIn", "shareMastodon"];
            const barActions = { shareCopyNote: "copyNote", shareCopyLink: "copyLink", shareTwitter: "twitter", shareBluesky: "bluesky", shareReddit: "reddit", shareLinkedIn: "linkedin", shareMastodon: "mastodon" };
            barIds.forEach((id) => {
                const el = document.getElementById(id);
                const action = barActions[id];
                if (el && action && actionMap[action]) el.addEventListener("click", () => { actionMap[action](); shareDropdown.classList.remove("active"); });
            });
        }

        const sharePanelBtn = document.getElementById("sharePanelBtn");
        const sharePanelDropdown = document.getElementById("sharePanelDropdown");
        if (sharePanelBtn && sharePanelDropdown) {
            sharePanelBtn.addEventListener("click", function (e) {
                e.stopPropagation();
                sharePanelDropdown.classList.toggle("active");
            });
            sharePanelDropdown.addEventListener("click", function (e) {
                e.stopPropagation();
            });
            sharePanelDropdown.querySelectorAll("button[data-share]").forEach((btn) => {
                const key = btn.getAttribute("data-share");
                if (actionMap[key]) {
                    btn.addEventListener("click", () => {
                        actionMap[key]();
                        sharePanelDropdown.classList.remove("active");
                    });
                }
            });
        }

        document.addEventListener("click", closeAllShareDropdowns);
    }

    return { initShareUI };
}
