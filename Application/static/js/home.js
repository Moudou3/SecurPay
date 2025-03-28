// home.js

document.addEventListener("DOMContentLoaded", function () {
    const openBtn = document.getElementById("open-signup");
    const modal = document.getElementById("modal");
    const modalContent = document.getElementById("modal-content");

    openBtn.addEventListener("click", () => {
        fetch("/signup-modal")
            .then(res => res.text())
            .then(html => {
                modalContent.innerHTML = html;
                modal.style.display = "flex";

                // Charger dynamiquement le script
                const script = document.createElement("script");
                script.src = "/static/js/signup_modal.js";
                script.onload = () => {
                    // Appeler la fonction d’init après chargement du script
                    if (typeof setupBiometricsCapture === "function") {
                        setupBiometricsCapture();
                    }
                };
                document.body.appendChild(script);
            });
    });

    // Fermer la modal si on clique à l'extérieur
    window.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.style.display = "none";
            modalContent.innerHTML = "";
        }
    });
});
