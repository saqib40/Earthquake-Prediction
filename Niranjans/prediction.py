#!/usr/bin/env python
"""
Flask API for Earthquake Prediction Models
- Integrated with CORS (though backend-to-backend calls don't strictly need it)
- Predicts using original models (/predict) and LSTM model (/predict-lstm)
"""
import os
import joblib
import pandas as pd
import numpy as np
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
from tensorflow.keras.metrics import MeanSquaredError
from datetime import datetime
from sklearn.preprocessing import MinMaxScaler

# Suppress warnings
warnings.filterwarnings("ignore", category=UserWarning, module="sklearn")
warnings.filterwarnings("ignore", category=FutureWarning)

# -----------------------------
# App Initialization
# -----------------------------
app = Flask(__name__)
# Keep CORS for potential direct browser testing or future use
CORS(app)

# -----------------------------
# Define paths relative to the script's location (Original Logic)
# -----------------------------
try:
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
    # Assuming script runs from within Niranjans or project root containing Niranjans
    BASE_DIR = SCRIPT_DIR
    if not os.path.exists(os.path.join(BASE_DIR, "Regression Models")):
         # If not found in current dir, maybe it's one level up
         potential_base_dir = os.path.join(SCRIPT_DIR, "Niranjans")
         if os.path.isdir(potential_base_dir):
             BASE_DIR = potential_base_dir
         else:
             # Fallback if structure is unexpected, assume models are subdirs of script loc
             BASE_DIR = SCRIPT_DIR

    print(f"Base directory for models determined as: {BASE_DIR}")

    REG_DIR = os.path.join(BASE_DIR, "Regression Models")
    CLF_DIR = os.path.join(BASE_DIR, "Classification Models")
    PRE_DIR = os.path.join(BASE_DIR, "Preprocessing Objects")
    # --- Paths for LSTM components ---
    LSTM_MODEL_DIR = os.path.join(BASE_DIR, "models") # Expects 'models' folder
    LSTM_SCALER_DIR = os.path.join(BASE_DIR, "picklel_objects") # Expects 'picklel_objects' folder
    CSV_PATH = os.path.join(BASE_DIR, "earthquake_data.csv")
    OUTPUT_DIR = os.path.join(BASE_DIR, "model_outputs") # Output dir relative to base

    print(f"Attempting to load original models...")

    # -----------------------------
    # Load Original Models
    # -----------------------------
    scaler_orig = joblib.load(os.path.join(PRE_DIR, 'scaler.pkl'))
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
    print("Original models loaded successfully.")

    # -----------------------------
    # Load LSTM Model and Scaler
    # -----------------------------
    print("Attempting to load LSTM model...")
    WINDOW_SIZE = 10
    LSTM_MODEL_PATH = os.path.join(LSTM_MODEL_DIR, 'earthquake_lstm_stacked_model.h5')
    # --- Corrected filename based on your confirmation ---
    LSTM_SCALER_PATH = os.path.join(LSTM_SCALER_DIR, 'mag_scaler.pkl')

    lstm_model = load_model(LSTM_MODEL_PATH, custom_objects={'mse': MeanSquaredError()})
    lstm_scaler = joblib.load(LSTM_SCALER_PATH)
    print("LSTM model and scaler loaded successfully.")

    # Ensure output directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    print(f"Ensured output directory exists: {OUTPUT_DIR}")

except FileNotFoundError as e:
    print(f"FATAL ERROR: Could not load a required model, scaler, or CSV file.")
    print(f"Details: {e}")
    print(f"Please ensure all required files/folders exist relative to: {BASE_DIR}")
    exit(1)
except Exception as e:
    print(f"FATAL ERROR during model loading: {e}")
    exit(1)


# --- Prediction Functions ---

def predict_earthquake_magnitude_orig(latitude, longitude, depth, stations):
    """Original prediction function."""
    input_data = pd.DataFrame([[latitude, longitude, depth, stations]], columns=feature_columns)
    input_scaled = scaler_orig.transform(input_data)
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
    return {'Regression': regression_preds, 'Classification': classification_preds}


def predict_lstm_magnitude(current_depth, future_steps):
    """
    Predicts using the LSTM model. Reads historical data, appends first
    prediction, and saves the full forecast to a separate CSV.
    Uses CSV_PATH defined globally.
    """
    try:
        df = pd.read_csv(CSV_PATH)
        df['mag'] = df['mag'].astype(float)
    except FileNotFoundError:
        raise Exception(f"Historical data file not found at {CSV_PATH}")
    except Exception as e:
         raise Exception(f"Error reading or processing CSV ({CSV_PATH}): {e}")

    if len(df) < WINDOW_SIZE:
        raise Exception(f"Not enough historical data in CSV (need {WINDOW_SIZE}, found {len(df)})")

    # Prepare input
    last_sequence = df['mag'].values[-WINDOW_SIZE:]
    X_mag_input = np.array(last_sequence).reshape(1, WINDOW_SIZE, 1)

    # Multi-step prediction
    current_batch = X_mag_input.copy()
    future_preds_norm = []
    for _ in range(future_steps):
        # Added verbose=0 to silence TensorFlow's prediction progress bars in logs
        pred = lstm_model.predict([current_batch, np.array([[current_depth]])], verbose=0)[0][0]
        future_preds_norm.append(pred)
        current_batch = np.roll(current_batch, -1, axis=1)
        current_batch[0, -1, 0] = pred

    # Inverse transform
    future_preds = lstm_scaler.inverse_transform(np.array(future_preds_norm).reshape(-1, 1)).flatten()
    next_mag = future_preds[0]

    # --- Append first prediction to main CSV ---
    try:
        now = pd.Timestamp.now()
        # Create a new row compatible with the existing CSV structure
        new_row = {col: np.nan for col in df.columns} # Initialize with NaNs
        new_row.update({
            'date_time': now.strftime('%Y-%m-%d %H:%M:%S'),
            'mag': next_mag,
            'depth': current_depth,
            # Add 'created_at' if it exists in your CSV, otherwise remove
            'created_at': int(now.timestamp()) if 'created_at' in df.columns else np.nan,
            # Add 'date' if it exists
            'date': now.strftime('%Y.%m.%d %H:%M:%S') if 'date' in df.columns else np.nan,
        })
        # Only include columns that actually exist in the original DataFrame
        new_row_filtered = {k: v for k, v in new_row.items() if k in df.columns}
        df_append = pd.DataFrame([new_row_filtered])

        df_append.to_csv(CSV_PATH, mode='a', header=not os.path.exists(CSV_PATH), index=False)
        print(f"Appended predicted magnitude {next_mag:.2f} to {CSV_PATH}")
    except Exception as e:
        print(f"Warning: Failed to append prediction to main CSV: {e}")

    # --- Save multi-step forecast to model_outputs ---
    try:
        timestamp_str = datetime.now().strftime('%Y%m%d_%H%M%S')
        output_csv_name = f'predicted_magnitudes_{timestamp_str}.csv'
        output_csv_path = os.path.join(OUTPUT_DIR, output_csv_name)

        df_pred = pd.DataFrame({
            'step': range(1, future_steps + 1),
            'predicted_magnitude': future_preds
        })
        df_pred.to_csv(output_csv_path, index=False)
        print(f"Multi-step predictions saved to {output_csv_path}")
    except Exception as e:
        print(f"Warning: Failed to save multi-step prediction CSV: {e}")

    return {
        'next_magnitude': float(next_mag),
        'future_magnitudes': [float(p) for p in future_preds]
    }

# --- API Endpoints ---

@app.route("/predict", methods=['POST'])
def handle_predict_orig():
    """Handles original prediction requests."""
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
        return jsonify({"error": "Invalid data type for one or more fields."}), 400

    try:
        predictions = predict_earthquake_magnitude_orig(latitude, longitude, depth, stations)
        return jsonify(predictions)
    except Exception as e:
        print(f"An error occurred during original prediction: {e}")
        return jsonify({"error": "An internal error occurred during model prediction."}), 500


@app.route("/predict-lstm", methods=['POST'])
def handle_predict_lstm():
    """Handles LSTM prediction requests."""
    if not request.json:
        return jsonify({"error": "Request content-type must be application/json"}), 400

    data = request.json
    if 'depth' not in data:
        return jsonify({"error": "Missing required field: 'depth'"}), 400

    try:
        current_depth = float(data['depth'])
        future_steps = int(data.get('future_steps', 5)) # Default to 5 steps
        if future_steps <= 0:
            return jsonify({"error": "'future_steps' must be positive."}), 400
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid data type for 'depth' or 'future_steps'."}), 400

    try:
        lstm_predictions = predict_lstm_magnitude(current_depth, future_steps)
        return jsonify(lstm_predictions)
    except Exception as e:
        error_message = str(e)
        print(f"An error occurred during LSTM prediction: {error_message}")
        status_code = 500 # Default to internal server error
        if "Historical data" in error_message or "Not enough historical data" in error_message or "Error reading" in error_message:
             status_code = 400 # Bad request if it's a data file issue
        # Return the specific error message from the prediction function
        return jsonify({"error": f"LSTM Prediction failed: {error_message}"}), status_code

# --- Server Startup ---
if __name__ == "__main__":
    # Use port 5001 consistently
    app.run(host='0.0.0.0', port=5001, debug=False)

