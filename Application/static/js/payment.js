document.addEventListener("DOMContentLoaded", () => {
    const trigger = document.querySelector(".feature-item:nth-child(4)"); // "Make a payment"
    const popup = document.getElementById("payment-popup");
    const overlay = document.getElementById("payment-overlay");
    const closeBtn = document.querySelector(".payment-close");

    // Fermer la popup features si elle est ouverte
    const featuresPopup = document.getElementById("features-popup");
    const featuresOverlay = document.getElementById("blur-overlay");

    if (trigger && popup && overlay && closeBtn) {
        trigger.addEventListener("click", () => {
            // Ferme la popup features
            featuresPopup?.classList.add("hidden");
            featuresOverlay?.classList.add("hidden");

            // Affiche la popup paiement
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
