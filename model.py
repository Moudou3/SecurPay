import cv2
import os
from mtcnn import MTCNN

# Initialisation
cap = cv2.VideoCapture(0)
detector = MTCNN()

# Créer un dossier pour stocker les images
save_path = "captured_faces"
os.makedirs(save_path, exist_ok=True)

user_id = input("Entrez l'ID de l'utilisateur : ")
image_count = 0
max_images = 50  # Nombre d'images à capturer

while cap.isOpened() and image_count < max_images:
    ret, frame = cap.read()
    if not ret:
        print("Erreur lors de l'accès à la webcam.")
        break

    faces = detector.detect_faces(frame)
    
    for face in faces:
        x, y, width, height = face['box']
        x2, y2 = x + width, y + height

        # Extraction du visage détecté
        face_crop = frame[y:y2, x:x2]

        # Enregistrement du visage
        file_name = f"{save_path}/{user_id}_{image_count}.jpg"
        cv2.imwrite(file_name, face_crop)
        print(f"Image enregistrée : {file_name}")

        image_count += 1

        # Dessiner un rectangle autour du visage détecté
        cv2.rectangle(frame, (x, y), (x2, y2), (0, 255, 0), 2)

    cv2.imshow("Capture des visages", frame)

    if cv2.waitKey(10) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
print("Capture terminée !")
