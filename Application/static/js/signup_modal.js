// signup_modal.js
let biometricDone = false;

function setupBiometricsCapture() {
    const preview = document.getElementById("camera-preview");
    const video = document.getElementById("video");
    const status = document.getElementById("capture-status");
    const biometricsBtn = document.getElementById("biometrics-btn");
    const form = document.getElementById("signup-form");

    if (!biometricsBtn || !preview || !video || !status || !form) {
        console.warn("Certains éléments du DOM sont manquants pour la biométrie.");
        return;
    }

    // 📩 Soumission du formulaire
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        if (!biometricDone) {
            showPopup("Veuillez compléter la capture biométrique avant de vous inscrire.", "error");
            return;
        }

        const formData = new FormData(form);

        fetch("/signup-modal", {
            method: "POST",
            body: formData
        })
        .then(res => {
            if (!res.ok) return res.text().then(text => { throw new Error(text); });
            return res.json();
        })
        .then(data => {
            showPopup(data.message, "success");

            // Message intermédiaire
            setTimeout(() => {
                showPopup("Vous allez être redirigé vers votre espace...", "success", true);
            }, 2500);

            // Redirection
            setTimeout(() => {
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
            }, 5000);

            form.reset();
        })
        .catch(err => {
            console.error("Erreur : ", err);
            showPopup("Erreur : " + err.message, "error");
        });
    });

    // 🎥 Capture biométrique
    biometricsBtn.addEventListener("click", async () => {
        preview.style.display = "flex";

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;

            const canvas = document.createElement("canvas");
            canvas.width = 320;
            canvas.height = 240;

            for (let i = 1; i <= 50; i++) {
                status.textContent = `Capture ${i}/50 en cours...`;
                await new Promise(res => setTimeout(res, 300));
                canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL("image/png");

                await fetch("/register-face", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: imageData })
                });
            }

            stream.getTracks().forEach(track => track.stop());
            video.srcObject = null;
            preview.style.display = "none";
            alert("Captures biométriques terminées !");
            biometricDone = true;
        } catch (err) {
            alert("Erreur d'accès à la caméra !");
            preview.style.display = "none";
        }
    });
}

// ✅ Fonction popup stylé avec Bootstrap Icons
function showPopup(message, type = "success", withSpinner = false) {
    const overlay = document.createElement("div");
    overlay.className = "popup-overlay";
    document.body.appendChild(overlay);

    const popup = document.createElement("div");
    popup.className = `popup ${type}`;
    popup.innerHTML = `
        <span class="icon">
            <i class="bi ${type === "error" ? "bi-x-circle-fill" : "bi-check-circle-fill"}"></i>
        </span>
        <span class="message">${message}</span>
        <span class="close-btn"><i class="bi bi-x-lg"></i></span>
        ${withSpinner ? '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>' : ''}
    `;

    document.body.appendChild(popup);

    popup.querySelector(".close-btn").addEventListener("click", () => {
        popup.remove();
        overlay.remove();
    });

    setTimeout(() => {
        if (document.body.contains(popup)) popup.remove();
        if (document.body.contains(overlay)) overlay.remove();
    }, 10000);
}

// 🔄 Rendre accessible depuis home.js
window.setupBiometricsCapture = setupBiometricsCapture;
