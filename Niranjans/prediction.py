#!/usr/bin/env python
"""
Flask API for Earthquake Prediction Models
- Integrated with CORS to allow cross-origin requests
- Predicts magnitude and magnitude category
"""
import os
import joblib
import pandas as pd
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS

# Suppress scikit-learn user warnings to keep the console clean
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")

# -----------------------------
# App Initialization
# -----------------------------
app = Flask(__name__)

# This enables Cross-Origin Resource Sharing for the entire Flask app.
# It's the simplest and most reliable setup for this use case.
CORS(app)

# -----------------------------
# Define paths relative to the script's location
# This assumes your directory structure is:
# /your_project_folder
#   - app.py (this file)
#   /Niranjans
#     /Regression Models
#     /Classification Models
#     /etc...
# -----------------------------
try:
    # This structure is more robust for finding the 'Niranjans' directory
    # relative to the script's location.
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    BASE_DIR = os.path.join(SCRIPT_DIR, "Niranjans")
    
    if not os.path.isdir(BASE_DIR):
        # If 'Niranjans' is not a subdirectory, assume it's the current directory.
        # This handles both potential project structures.
        BASE_DIR = SCRIPT_DIR

    REG_DIR = os.path.join(BASE_DIR, "Regression Models")
    CLF_DIR = os.path.join(BASE_DIR, "Classification Models")
    PRE_DIR = os.path.join(BASE_DIR, "Preprocessing Objects")
    
    print(f"Attempting to load models from: {BASE_DIR}")

    # -----------------------------
    # Load all models and objects on startup
    # -----------------------------
    scaler = joblib.load(os.path.join(PRE_DIR, 'scaler.pkl'))
    label_encoder = joblib.load(os.path.join(PRE_DIR, 'label_encoder.pkl'))
    feature_columns = joblib.load(os.path.join(PRE_DIR, 'feature_columns.pkl'))

    lr_model = joblib.load(os.path.join(REG_DIR, 'regression_linear_regression.pkl'))
    svr_model = joblib.load(os.path.join(REG_DIR, 'regression_support_vector_regression.pkl'))
    rf_reg_model = joblib.load(os.path.join(REG_DIR, 'regression_random_forest_regression.pkl'))
    xgb_reg_model = joblib.load(os.path.join(REG_DIR, 'regression_xgboost_regression.pkl'))
    voting_reg = joblib.load(os.path.join(REG_DIR, 'regression_voting_regressor.pkl'))

    nb_model = joblib.load(os.path.join(CLF_DIR, 'classification_naive_bayes.pkl'))
    log_reg_model = joblib.load(os.path.join(CLF_DIR, 'classification_logistic_regression.pkl'))
    svm_clf_model = joblib.load(os.path.join(CLF_DIR, 'classification_svm_classification.pkl'))
    xgb_clf_model = joblib.load(os.path.join(CLF_DIR, 'classification_xgboost_classification.pkl'))
    voting_clf = joblib.load(os.path.join(CLF_DIR, 'classification_voting_classifier.pkl'))
    
    print("All models and preprocessing objects loaded successfully.")

except FileNotFoundError as e:
    print(f"FATAL ERROR: Could not load a required model or file.")
    print(f"Details: {e}")
    print("Please ensure the directory structure is correct and all .pkl files are present.")
    exit(1)


def predict_earthquake_magnitude(latitude, longitude, depth, stations):
    """Predicts earthquake magnitude using the pre-loaded models."""
    input_data = pd.DataFrame([[latitude, longitude, depth, stations]], columns=feature_columns)
    input_scaled = scaler.transform(input_data)

    regression_preds = {
        'Linear Regression': float(lr_model.predict(input_scaled)[0]),
        'SVR': float(svr_model.predict(input_scaled)[0]),
        'Random Forest': float(rf_reg_model.predict(input_scaled)[0]),
        'XGBoost': float(xgb_reg_model.predict(input_scaled)[0]),
        'Voting Regressor': float(voting_reg.predict(input_scaled)[0])
    }

    classification_preds = {
        'Naive Bayes': label_encoder.inverse_transform(nb_model.predict(input_scaled))[0],
        'Logistic Regression': label_encoder.inverse_transform(log_reg_model.predict(input_scaled))[0],
        'SVM': label_encoder.inverse_transform(svm_clf_model.predict(input_scaled))[0],
        'XGBoost': label_encoder.inverse_transform(xgb_clf_model.predict(input_scaled))[0],
        'Voting Classifier': label_encoder.inverse_transform(voting_clf.predict(input_scaled))[0]
    }

    return {
        'Regression': regression_preds,
        'Classification': classification_preds
    }

# -----------------------------
# API Endpoint
# -----------------------------
@app.route("/predict", methods=['POST'])
def handle_predict():
    """Handles incoming prediction requests."""
    if not request.json:
        return jsonify({"error": "Request content-type must be application/json"}), 400

    data = request.json
    required_fields = ['latitude', 'longitude', 'depth', 'stations']
    if not all(field in data for field in required_fields):
        missing = [f for f in required_fields if f not in data]
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    try:
        latitude = float(data['latitude'])
        longitude = float(data['longitude'])
        depth = float(data['depth'])
        stations = int(data['stations'])
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid data type for one or more fields. Ensure latitude, longitude, and depth are numbers, and stations is an integer."}), 400

    try:
        predictions = predict_earthquake_magnitude(latitude, longitude, depth, stations)
        return jsonify(predictions)
    except Exception as e:
        print(f"An error occurred during prediction: {e}")
        return jsonify({"error": "An internal error occurred during model prediction."}), 500


# -----------------------------
# Server Startup
# -----------------------------
if __name__ == "__main__":
    # Use a different port like 5001 to avoid conflicts
    app.run(host='0.0.0.0', port=5001, debug=False)

