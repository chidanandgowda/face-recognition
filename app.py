from flask import Flask, render_template, request
from deepface import DeepFace
import os
import cv2
import base64
from datetime import datetime

app = Flask(__name__)

# Get absolute path to current script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define folders using absolute paths
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
KNOWN_USERS_FOLDER = os.path.join(BASE_DIR, 'static', 'user_images')

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(KNOWN_USERS_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if 'image' not in data:
        return {"status": "fail", "message": "No image provided"}, 400

    data_url = data['image']
    
    try:
        # Decode base64 image
        header, encoded = data_url.split(",", 1)
        img_data = base64.b64decode(encoded)
        filename = f"captured_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        img_path = os.path.join(UPLOAD_FOLDER, filename)

        with open(img_path, "wb") as f:
            f.write(img_data)

        # Verify face against each registered user
        for user_img in os.listdir(KNOWN_USERS_FOLDER):
            user_img_path = os.path.join(KNOWN_USERS_FOLDER, user_img)
            try:
                result = DeepFace.verify(img_path, user_img_path, enforce_detection=False)
                if result["verified"]:
                    return {"status": "success", "user": os.path.splitext(user_img)[0]}
            except Exception as e:
                print(f"Error comparing with {user_img}: {str(e)}")

        return {"status": "fail", "message": "Face not recognized"}

    except Exception as e:
        print("Login error:", str(e))
        return {"status": "fail", "message": "Internal error"}, 500

if __name__ == '__main__':
    print(f"Known users folder: {KNOWN_USERS_FOLDER}")
    app.run(debug=True)
