document.addEventListener("DOMContentLoaded", () => {
    const openLink = document.getElementById("open-features-link");
    const popup = document.getElementById("features-popup");
    const overlay = document.getElementById("blur-overlay");
    const closeBtn = document.querySelector(".features-close");

    if (openLink && popup && overlay && closeBtn) {
        openLink.addEventListener("click", (e) => {
            e.preventDefault();
            popup.classList.remove("hidden");
            overlay.classList.remove("hidden");
        });

        closeBtn.addEventListener("click", () => {
            popup.classList.add("hidden");
            overlay.classList.add("hidden");
        });

        overlay.addEventListener("click", () => {
            popup.classList.add("hidden");
            overlay.classList.add("hidden");
        });
    }
});
