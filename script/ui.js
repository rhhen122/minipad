/**
 * About popup, loading overlay, GitHub commit info.
 */

export function initUI(elements) {
    const { logoBtn, popup, closePopup, loading } = elements;

    logoBtn.addEventListener("click", function () {
        popup.classList.add("active");
    });

    closePopup.addEventListener("click", function () {
        popup.classList.remove("active");
    });

    popup.addEventListener("click", function (e) {
        if (e.target === popup) popup.classList.remove("active");
    });

    function hideLoadingAnimation() {
        if (loading) loading.classList.add("hidden");
    }

    window.addEventListener("load", hideLoadingAnimation);

    const commitEl = document.getElementById("commit-message");
    if (commitEl) {
        fetch("https://api.github.com/repos/rhhen122/minipad/commits?per_page=1")
            .then((res) => res.json())
            .then((data) => {
                if (data[0] && data[0].commit) {
                    commitEl.textContent = data[0].commit.message;
                }
            })
            .catch(() => {});
    }
}
