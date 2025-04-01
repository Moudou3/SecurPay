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

    // 🎥 Capture biométrique
    biometricsBtn.addEventListener("click", async () => {
        preview.style.display = "flex";

        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;

        // Chargement des modèles face-api.js
        await faceapi.nets.tinyFaceDetector.loadFromUri("/static/models");

        const canvas = faceapi.createCanvasFromMedia(video);
        preview.append(canvas);
        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);

        let captureCount = 0;
        const MAX_CAPTURE = 50;
        const START_TIME = Date.now();
        const MAX_TIME = 60000;

        const ctx = canvas.getContext("2d");

        const interval = setInterval(async () => {
            const elapsed = Date.now() - START_TIME;
            if (elapsed > MAX_TIME) {
                clearInterval(interval);
                stream.getTracks().forEach(track => track.stop());
                canvas.remove();
                video.srcObject = null;
                preview.style.display = "none";

                // Demande au backend de supprimer les images
                await fetch("/cancel-face-capture", { method: "POST" });
                alert("Temps dépassé. Veuillez repositionner votre tête et réessayer.");
                return;
            }

            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions());
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (detection) {
                const { x, y, width, height } = detection.box;
                ctx.strokeStyle = "green";
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, width, height);

                const centerX = x + width / 2;
                const centerY = y + height / 2;
                const isCentered = centerX > 100 && centerX < 220 && centerY > 60 && centerY < 180;
                const isLargeEnough = width > 120 && height > 120;

                if (isCentered && isLargeEnough) {
                    const canvasTemp = document.createElement("canvas");
                    canvasTemp.width = 320;
                    canvasTemp.height = 240;
                    canvasTemp.getContext("2d").drawImage(video, 0, 0, 320, 240);
                    const imageData = canvasTemp.toDataURL("image/png");

                    await fetch("/register-face", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ image: imageData })
                    });

                    captureCount++;
                    status.textContent = `Capture ${captureCount}/${MAX_CAPTURE}`;

                    if (captureCount >= MAX_CAPTURE) {
                        clearInterval(interval);
                        stream.getTracks().forEach(track => track.stop());
                        canvas.remove();
                        video.srcObject = null;
                        preview.style.display = "none";
                        biometricDone = true;
                        alert("Captures biométriques terminées !");
                    }
                } else {
                    status.textContent = "Positionnez bien votre tête (face caméra)";
                }
            } else {
                status.textContent = "Aucun visage détecté...";
            }
        }, 300);
    });
}
