# import pandas as pd
# import numpy as np
# import xgboost as xgb
# import joblib
# import os
# from sklearn.metrics import mean_absolute_error, r2_score
# import matplotlib.pyplot as plt

# # --- 1. Synthetic Data Generation (High Signal, Low Noise) ---
# def create_dataset():
#     """
#     Generates a realistic but LEARNABLE dataset.
#     Key changes:
#     - Reduced random noise so patterns are clearer.
#     - Added explicit 'holiday' spikes that the model can learn.
#     """
#     # Create dates
#     date_rng = pd.date_range(start='2022-01-01', end='2025-08-27', freq='D', name='ds')
#     df = pd.DataFrame(date_rng)
    
#     # Create a 'Holiday' pattern (e.g., every 100 days approx + random dates)
#     # In a real app, you would load a real holiday calendar.
#     df['is_holiday'] = 0
#     holiday_indices = np.random.choice(df.index, size=int(len(df)*0.05), replace=False) # 5% days are holidays
#     df.loc[holiday_indices, 'is_holiday'] = 1

#     blood_groups = {'A_positive': 20, 'B_positive': 15, 'O_positive': 25, 'AB_positive': 5, 
#                     'A_negative': 4, 'B_negative': 3, 'O_negative': 8, 'AB_negative': 2}
    
#     for group, base in blood_groups.items():
#         # 1. Trend: Slow, steady growth
#         trend = np.linspace(0, 0.5 * base, num=len(df))
        
#         # 2. Seasonality: Strong weekly pattern (more donations/demand on weekdays)
#         weekly = -0.3 * base * np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
        
#         # 3. Yearly Seasonality: Higher demand in summer/dengue season
#         yearly = 0.4 * base * np.sin(2 * np.pi * df['ds'].dt.dayofyear / 365.25)
        
#         # 4. Holiday Effect: Demand spikes or drops on holidays
#         holiday_effect = df['is_holiday'] * (0.5 * base) 
        
#         # 5. Noise: REDUCED significantly to allow high R2
#         # We use 5% of base as noise (previously it was much higher)
#         noise = np.random.normal(0, 0.05 * base, len(df))
        
#         df[group] = base + trend + weekly + yearly + holiday_effect + noise
#         df[group] = df[group].astype(int).clip(lower=0)
        
#     return df

# # --- 2. Advanced Feature Engineering ---
# def create_features(df, target_col):
#     df = df.copy()
    
#     # --- A. Cyclical Time Features (The "Smart Clock") ---
#     # Helps model understand Dec is close to Jan, and Sun is close to Mon
#     df['day_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
#     df['day_cos'] = np.cos(2 * np.pi * df['ds'].dt.dayofweek / 7)
#     df['month_sin'] = np.sin(2 * np.pi * df['ds'].dt.month / 12)
#     df['month_cos'] = np.cos(2 * np.pi * df['ds'].dt.month / 12)
    
#     # --- B. Lag Features (The "Memory") ---
#     # "What was the demand 1 day ago? 7 days ago?"
#     df['lag_1'] = df[target_col].shift(1)
#     df['lag_2'] = df[target_col].shift(2)
#     df['lag_7'] = df[target_col].shift(7)   # Same day last week
#     df['lag_30'] = df[target_col].shift(30) # Same day last month
    
#     # --- C. Rolling Features (The "Trend") ---
#     # "What was the average demand over the last week?"
#     df['rolling_mean_7'] = df[target_col].shift(1).rolling(window=7).mean()
#     df['rolling_std_7'] = df[target_col].shift(1).rolling(window=7).std()
    
#     # --- D. Calendar Features ---
#     df['is_weekend'] = (df['ds'].dt.dayofweek >= 5).astype(int)
#     # We already have 'is_holiday' in the dataset from the generator
    
#     return df.dropna()

# # --- 3. Main Training Block ---
# if __name__ == "__main__":
#     print("Generating optimized synthetic dataset...")
#     full_df = create_dataset()
    
#     blood_groups_list = [col for col in full_df.columns if col not in ['ds', 'is_holiday']]
#     models_dir = 'models'
#     os.makedirs(models_dir, exist_ok=True)
    
#     print("\nStarting Advanced XGBoost training...")
    
#     for group in blood_groups_list:
#         group_df = create_features(full_df[['ds', 'is_holiday', group]], target_col=group)
#         group_df = group_df.set_index('ds')
        
#         # Define Features (X) and Target (y)
#         FEATURES = ['day_sin', 'day_cos', 'month_sin', 'month_cos', 
#                     'lag_1', 'lag_2', 'lag_7', 'lag_30', 
#                     'rolling_mean_7', 'rolling_std_7', 
#                     'is_holiday', 'is_weekend']
#         TARGET = group
        
#         X = group_df[FEATURES]
#         y = group_df[TARGET]
        
#         # Split Data (Use last 6 months for testing to be robust)
#         split_date = y.index.max() - pd.DateOffset(months=6)
#         X_train, X_test = X[X.index < split_date], X[X.index >= split_date]
#         y_train, y_test = y[y.index < split_date], y[y.index >= split_date]
        
#         # --- XGBoost Regressor with Tuned Hyperparameters ---
#         # Lower learning rate + more estimators = usually better accuracy
#         model = xgb.XGBRegressor(
#             n_estimators=2000,
#             learning_rate=0.01,
#             max_depth=5,
#             subsample=0.8,
#             colsample_bytree=0.8,
#             early_stopping_rounds=50,
#             n_jobs=-1
#         )
        
#         model.fit(
#             X_train, y_train,
#             eval_set=[(X_train, y_train), (X_test, y_test)],
#             verbose=False
#         )
        
#         # Predictions & Metrics
#         y_pred = model.predict(X_test)
        
#         mae = mean_absolute_error(y_test, y_pred)
#         r2 = r2_score(y_test, y_pred)
        
#         print(f"\n--- Performance Report for: {group} ---")
#         print(f"  MAE (Mean Absolute Error): {mae:.4f} units") # 4 decimal places
#         print(f"  R-squared (R²): {r2:.4f}")
#         print("---------------------------------------------")
        
#         # Save Production Model (Retrained on ALL data)
#         prod_model = xgb.XGBRegressor(n_estimators=2000, learning_rate=0.01, max_depth=5)
#         prod_model.fit(X, y, verbose=False)
#         joblib.dump(prod_model, os.path.join(models_dir, f'{group}.joblib'))

#     print("\nAll models successfully trained and saved.")

import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import os
from sklearn.metrics import mean_absolute_error, r2_score
import matplotlib.pyplot as plt
import shap # <--- Added SHAP

# --- 1. Synthetic Data Generation (High Signal, Low Noise) ---
# --- 1. Synthetic Data Generation (High Signal, Low Noise) ---
def create_dataset():
    """
    Generates a realistic but LEARNABLE dataset using real-world holiday dates.
    """
    # 1. Update timeline to end in 2027
    date_rng = pd.date_range(start='2022-01-01', end='2027-12-31', freq='D', name='ds')
    df = pd.DataFrame(date_rng)
    
    # 2. Use the EXACT same list you put in main.py
    holidays_list = [
        # Past years
        '2023-01-26', '2023-06-20', '2023-08-15', '2023-10-02', '2023-11-12',
        '2024-01-26', '2024-07-07', '2024-08-15', '2024-10-02', '2024-11-01',
        '2025-01-26', '2025-06-27', '2025-08-15', '2025-10-02',
        # Current year (2026)
        '2026-01-26', '2026-03-03', '2026-08-15', '2026-10-02', '2026-11-08',
        # Next year (2027)
        '2027-01-26', '2027-03-22', '2027-08-15', '2027-10-02', '2027-10-29'
    ]
    holidays_dates = pd.to_datetime(holidays_list)
    
    # 3. Apply the real holidays instead of random ones
    df['is_holiday'] = df['ds'].isin(holidays_dates).astype(int)

    # 4. Keys perfectly match the Mongoose schema
    blood_groups = {'A+': 20, 'B+': 15, 'O+': 25, 'AB+': 5, 
                    'A-': 4, 'B-': 3, 'O-': 8, 'AB-': 2}
    
    for group, base in blood_groups.items():
        trend = np.linspace(0, 0.5 * base, num=len(df))
        weekly = -0.3 * base * np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
        yearly = 0.4 * base * np.sin(2 * np.pi * df['ds'].dt.dayofyear / 365.25)
        holiday_effect = df['is_holiday'] * (0.5 * base) 
        noise = np.random.normal(0, 0.05 * base, len(df))
        
        df[group] = base + trend + weekly + yearly + holiday_effect + noise
        df[group] = df[group].astype(int).clip(lower=0)
        
    return df
# --- 2. Advanced Feature Engineering ---
def create_features(df, target_col):
    df = df.copy()
    
    df['day_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
    df['day_cos'] = np.cos(2 * np.pi * df['ds'].dt.dayofweek / 7)
    df['month_sin'] = np.sin(2 * np.pi * df['ds'].dt.month / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['ds'].dt.month / 12)
    
    df['lag_1'] = df[target_col].shift(1)
    df['lag_2'] = df[target_col].shift(2)
    df['lag_7'] = df[target_col].shift(7)  
    df['lag_30'] = df[target_col].shift(30) 
    
    df['rolling_mean_7'] = df[target_col].shift(1).rolling(window=7).mean()
    df['rolling_std_7'] = df[target_col].shift(1).rolling(window=7).std()
    
    df['is_weekend'] = (df['ds'].dt.dayofweek >= 5).astype(int)
    
    return df.dropna()

# --- 3. Main Training Block ---
if __name__ == "__main__":
    print("Generating optimized synthetic dataset...")
    full_df = create_dataset()
    
    blood_groups_list = [col for col in full_df.columns if col not in ['ds', 'is_holiday']]
    
    # Setup directories
    models_dir = 'models'
    shap_dir = 'shap_plots' # <--- Directory for SHAP plots
    os.makedirs(models_dir, exist_ok=True)
    os.makedirs(shap_dir, exist_ok=True)
    
    print("\nStarting Advanced XGBoost training & SHAP Analysis...")
    
    for group in blood_groups_list:
        group_df = create_features(full_df[['ds', 'is_holiday', group]], target_col=group)
        group_df = group_df.set_index('ds')
        
        # Define Features (X) and Target (y)
        FEATURES = ['day_sin', 'day_cos', 'month_sin', 'month_cos', 
                    'lag_1', 'lag_2', 'lag_7', 'lag_30', 
                    'rolling_mean_7', 'rolling_std_7', 
                    'is_holiday', 'is_weekend']
        TARGET = group
        
        X = group_df[FEATURES]
        y = group_df[TARGET]
        
        # Split Data (Use last 6 months for testing to be robust)
        split_date = y.index.max() - pd.DateOffset(months=6)
        X_train, X_test = X[X.index < split_date], X[X.index >= split_date]
        y_train, y_test = y[y.index < split_date], y[y.index >= split_date]
        
        # --- XGBoost Regressor with Tuned Hyperparameters ---
        model = xgb.XGBRegressor(
            n_estimators=2000,
            learning_rate=0.01,
            max_depth=5,
            subsample=0.8,
            colsample_bytree=0.8,
            early_stopping_rounds=50, 
            n_jobs=-1
        )
        
        model.fit(
            X_train, y_train,
            eval_set=[(X_train, y_train), (X_test, y_test)],
            verbose=False
        )
        
        # Predictions & Metrics
        y_pred = model.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"\n--- Performance Report for: {group} ---")
        print(f"  MAE: {mae:.4f} units") 
        print(f"  R-squared (R²): {r2:.4f}")
        print("---------------------------------------------")

        # --- 4. SHAP EXPLAINABILITY --- [NEW SECTION]
        
        # A. Create the explainer using the trained model
        explainer = shap.TreeExplainer(model)
        
        # Calculate SHAP values for the test set
        shap_values = explainer(X_test)
        
        # B. Global Explainability (Summary Plot)
        plt.figure(figsize=(10, 6))
        shap.summary_plot(shap_values, X_test, show=False)
        plt.title(f"Global Feature Importance: {group}")
        plt.tight_layout()
        plt.savefig(os.path.join(shap_dir, f"{group}_global_summary.png"))
        plt.close() # Close plot to prevent memory leaks
        
        # C. Local Explainability (Waterfall Plot)
        plt.figure(figsize=(10, 6))
        # shap_values[0] explains the first row of X_test
        shap.plots.waterfall(shap_values[0], show=False)
        plt.title(f"Local Explanation (First Test Day): {group}")
        plt.tight_layout()
        plt.savefig(os.path.join(shap_dir, f"{group}_local_waterfall.png"))
        plt.close()
        
        # --- End SHAP Section ---
        
        # Save Production Model (Retrained on ALL data)
        prod_model = xgb.XGBRegressor(n_estimators=2000, learning_rate=0.01, max_depth=5)
        prod_model.fit(X, y, verbose=False)
        joblib.dump(prod_model, os.path.join(models_dir, f'{group}.joblib'))

    print("\n✅ All models successfully trained and saved with correct formatting.")
    print(f"SHAP explanation plots saved to '{shap_dir}' folder.")