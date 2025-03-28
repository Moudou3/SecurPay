from flask import Flask, render_template, request, jsonify, session, redirect
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', os.urandom(24)) # Obligatoire pour gérer les erreur de clé secret
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Modèle utilisateur
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    last_name = db.Column(db.String(100))
    first_name = db.Column(db.String(100))
    birthday = db.Column(db.String(20))
    email = db.Column(db.String(120), unique=True)
    phone = db.Column(db.String(20))
    username = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    biometrics = db.Column(db.Text)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/home2')
def home2():
    if 'username' not in session:
        return redirect('/')
    return render_template('home2.html', username=session['username'], first_name=session['first_name'])

@app.route('/about')
def about():
    return render_template('about.html')

from flask import make_response, request, render_template, json

@app.route('/signup-modal', methods=['GET', 'POST'])
def signup_modal():
    if request.method == 'POST':
        data = request.form

        # ❌ Si email déjà utilisé
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Cet email est déjà utilisé."}), 400

        # ❌ Si username déjà utilisé
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"message": "Ce nom d'utilisateur est déjà utilisé."}), 400

        # ✅ Sinon, création du compte
        user = User(
            last_name=data['last_name'],
            first_name=data['first_name'],
            birthday=data['birthday'],
            email=data['email'],
            phone=data['phone'],
            username=data['username'],
            password=data['password'],
            biometrics="SampleData"
        )

        try:
            db.session.add(user)
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"message": "Erreur serveur."}), 500


        session['username'] = user.username
        session['first_name'] = user.first_name

        return jsonify({
            "message": "Inscription réussie !",
            "redirect": "/home2"
        })

    return render_template('signup_modal.html')



# Sauvegarde des images capturées
import base64
import os
from flask import request, jsonify

import os
import base64
from flask import request, jsonify

@app.route('/register-face', methods=['POST'])
def register_face():
    data = request.get_json()
    image_data = data.get('image')

    if not image_data:
        return jsonify({'message': 'Aucune image reçue'}), 400

    try:
        # Décoder l’image base64
        header, encoded = image_data.split(',', 1)
        img_bytes = base64.b64decode(encoded)

        #  Créer le dossier de stockage s’il n’existe pas
        save_dir = os.path.join('static', 'faces', 'user_temp')
        os.makedirs(save_dir, exist_ok=True)

        #  Générer un nom de fichier unique
        file_count = len(os.listdir(save_dir))
        filename = f"face_{file_count + 1:03}.png"
        file_path = os.path.join(save_dir, filename)

        #  Enregistrer l’image
        with open(file_path, 'wb') as f:
            f.write(img_bytes)

        return jsonify({'message': f"Image enregistrée sous {filename}"})

    except Exception as e:
        print("Erreur d'enregistrement image :", str(e))
        return jsonify({'message': 'Erreur serveur'}), 500



if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
