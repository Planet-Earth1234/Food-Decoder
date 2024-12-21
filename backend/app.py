import os
import torch
from torch import nn
from modell import CustomEfficientNet, li
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import io
from torchvision import transforms
import google.generativeai as genai

# Configure the Gemini API
genai.configure(api_key="yourapi key")  # Load API key from environment variable
model = genai.GenerativeModel("gemini-1.5-flash")  # Load the Gemini model

# Initialize Flask app
app = Flask(__name__)
cors = CORS(app, origins="*")

# Load the pre-trained EfficientNet model for image classification
model_img = CustomEfficientNet()
model_weights_path = r"C:\Users\Yash\Downloads\model_weights.pth"
model_img.load_state_dict(torch.load(model_weights_path, map_location=torch.device('cpu')))
model_img.eval()

# Preprocessing for images
transform = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

# Function to interact with Gemini API
def query_gemini_api(prompt):
    # Call the Gemini model with the user's prompt
    response = model.generate_content(prompt)
    return response.text

# Image classification API endpoint
@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No selected file'})

    try:
        # Load the image
        image = Image.open(io.BytesIO(file.read()))
        image_tensor = transform(image).unsqueeze(0)  # Add batch dimension

        # Make prediction
        with torch.no_grad():
            output = model_img(image_tensor)
        _, predicted_class = torch.max(output, 1)

        # Return the predicted class
        nums = predicted_class.item()
        return jsonify({'predicted_class': li[nums]})

    except Exception as e:
        return jsonify({'error': str(e)})

# Chatbot endpoint for interacting with Gemini API
@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get("query")
    if not user_input:
        return jsonify({'error': 'No query provided'}), 400

    try:
        # Send the user's input to the Gemini API for a response
        gemini_response = query_gemini_api(user_input)

        # Return the response from Gemini
        return jsonify({'response': gemini_response})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True, port=5173)
