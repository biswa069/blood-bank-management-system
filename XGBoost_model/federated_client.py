import flwr as fl
import xgboost as xgb
import pandas as pd
import numpy as np
from sklearn.metrics import mean_absolute_error

# ==========================================
# ⚠️ LIVE DEMO CONFIGURATION ⚠️
# Type Laptop 1's IPv4 Address here!
# (Find it by running 'ipconfig' on Laptop 1 Command Prompt)
SERVER_IP = "127.0.0.1:8080" # Use this for testing on 1 laptop
# SERVER_IP = "192.168.137.5:8080" # Example for the Wi-Fi Hotspot during presentation
# ==========================================

class BloodBankClient(fl.client.NumPyClient):
    def __init__(self, X_train, y_train, X_test, y_test):
        self.X_train = X_train
        self.y_train = y_train
        self.X_test = X_test
        self.y_test = y_test
        
        # Initialize the XGBoost model for local hospital training
        self.model = xgb.XGBRegressor(
            objective='reg:squarederror',
            n_estimators=50,
            learning_rate=0.1,
            max_depth=5
        )

    def get_parameters(self, config):
        """Extracts the XGBoost model as bytes to transmit to the server."""
        try:
            booster = self.model.get_booster()
        except:
            # Train a minimal tree if get_parameters is called before fit
            self.model.fit(self.X_train[:10], self.y_train[:10])
            booster = self.model.get_booster()
            
        # Serialize the tree architecture to JSON bytes
        model_bytes = booster.save_raw('json')
        
        # Wrap bytes in a NumPy array to satisfy Flower's gRPC transmission protocol
        return [np.array(bytearray(model_bytes))]

    def fit(self, parameters, config):
        """Trains the model on the local hospital's isolated dataset."""
        print("\n[Hospital Node] Received start signal from Central Server.")
        print(f"[Hospital Node] Training on local dataset ({len(self.X_train)} records)...")
        
        self.model.fit(self.X_train, self.y_train)
        
        print("[Hospital Node] Local training complete. Transmitting model parameters over Wi-Fi.")
        
        # Return serialized parameters, the dataset size (for weighting), and custom metrics
        return self.get_parameters(config=None), len(self.X_train), {}

    def evaluate(self, parameters, config):
        """Evaluates the model against local testing data."""
        print("\n[Hospital Node] Evaluating Global Model against Local Demographics...")
        predictions = self.model.predict(self.X_test)
        mae = mean_absolute_error(self.y_test, predictions)
        
        print(f"[Hospital Node] Evaluation MAE: {mae:.2f}")
        return float(mae), len(self.X_test), {"mae": float(mae)}

def load_local_data():
    """Loads the local dataset chunk."""
    print("[Hospital Node] Loading local_dataset.csv...")
    try:
        # Load the isolated local dataset uploaded by the user via the React UI
        df = pd.read_csv('local_dataset.csv')
        print(f"✅ Successfully loaded {len(df)} records from local_dataset.csv!")
    except FileNotFoundError:
        print("⚠️ local_dataset.csv not found. Did you upload a file in the React UI? Falling back to daily_blood_demand.csv...")
        df = pd.read_csv('daily_blood_demand.csv')

    df['ds'] = pd.to_datetime(df['ds'])
    
    # Feature Engineering for the FL Demo
    df['day'] = df['ds'].dt.day
    df['month'] = df['ds'].dt.month
    df['day_of_week'] = df['ds'].dt.dayofweek
    
    # We will predict O_positive demand for the presentation
    target = 'O_positive'
    if target not in df.columns:
        target = df.columns[-1] 
        
    features = ['day', 'month', 'day_of_week']
    
    X = df[features]
    y = df[target]
    
    # 80/20 Train-Test split
    split_idx = int(len(X) * 0.8)
    X_train, X_test = X.iloc[:split_idx], X.iloc[split_idx:]
    y_train, y_test = y.iloc[:split_idx], y.iloc[split_idx:]
    
    return X_train, y_train, X_test, y_test

if __name__ == "__main__":
    print("=========================================================")
    print("🏥 Starting Blood Bank Hospital Node (Laptop 2/3) 🏥")
    print(f"📡 Connecting to Central Server at {SERVER_IP}...")
    print("=========================================================")

    # 1. Load Data
    X_train, y_train, X_test, y_test = load_local_data()

    # 2. Start Flower Client Loop
    fl.client.start_client(
        server_address=SERVER_IP,
        client=BloodBankClient(X_train, y_train, X_test, y_test).to_client(),
    )
