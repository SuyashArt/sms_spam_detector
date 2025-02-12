from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Load the saved model
try:
    model = tf.keras.models.load_model('spam_sms_detector.keras')
except Exception as e:
    print(f"Error loading model: {e}")
    exit(1)

@app.route('/api/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        if not data or 'sms' not in data:
            return jsonify({'error': 'No sms content provided'}), 400
            
        sms = data['sms']
        
        if not isinstance(sms, str) or not sms.strip():
            return jsonify({'error': 'Invalid sms content'}), 400

        # Preprocess the sms
        new_smss_dataset = tf.data.Dataset.from_tensor_slices([sms]).batch(1)

        # Make prediction
        raw_prediction = model.predict(new_smss_dataset, verbose=0)[0][0]
        
        # Calculate probabilities
        spam_prob = float(raw_prediction)
        not_spam_prob = 1 - spam_prob
        
        result = {
            'prediction': 'Spam' if spam_prob > 0.5 else 'Not Spam',
            'confidence': float(max(spam_prob, not_spam_prob)),
            'probability': {
                'spam': spam_prob,
                'not_spam': not_spam_prob
            }
        }
        
        return jsonify(result)

    except Exception as e:
        return jsonify({'error': f'Prediction error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)