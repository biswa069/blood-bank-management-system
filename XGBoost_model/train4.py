# import pandas as pd
# import numpy as np
# import xgboost as xgb
# from sklearn.linear_model import LinearRegression, Ridge
# from sklearn.metrics import mean_absolute_error, r2_score
# import holidays
# import joblib
# import os
# import warnings

# warnings.filterwarnings('ignore')

# # --- 1. Feature Engineering (Optimized for Hybrid) ---
# def create_features(df, target_col):
#     df = df.copy()
    
#     # A. Mathematical Transformations (Helps Linear Model)
#     # We use sin/cos with high frequency for "Fourier Terms"
#     df['day_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
#     df['day_cos'] = np.cos(2 * np.pi * df['ds'].dt.dayofweek / 7)
#     df['month_sin'] = np.sin(2 * np.pi * df['ds'].dt.month / 12)
#     df['month_cos'] = np.cos(2 * np.pi * df['ds'].dt.month / 12)
#     df['year_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofyear / 365.25) # Yearly seasonality
    
#     # B. History Lags (Helps XGBoost)
#     df['lag_1'] = df[target_col].shift(1)
#     df['lag_2'] = df[target_col].shift(2) # Added Lag 2
#     df['lag_7'] = df[target_col].shift(7)
#     df['lag_30'] = df[target_col].shift(30)
    
#     # C. Rolling Trends
#     df['rolling_mean_7'] = df[target_col].shift(1).rolling(window=7).mean()
#     df['rolling_std_7']  = df[target_col].shift(1).rolling(window=7).std()
    
#     # D. Calendar
#     df['is_weekend'] = (df['ds'].dt.dayofweek >= 5).astype(int)
    
#     return df.dropna()

# # --- 2. Outlier Clipping (Crucial for Stability) ---
# def remove_outliers(df, col):
#     df[col] = df[col].astype(float)
#     # Cap outliers at 99th percentile (removes extreme donation camps)
#     threshold = df[col].quantile(0.99)
#     df.loc[df[col] > threshold, col] = threshold
#     return df

# if __name__ == "__main__":
#     save_folder = 'models_hybrid'
#     os.makedirs(save_folder, exist_ok=True)
    
#     try:
#         df = pd.read_csv('daily_blood_demand1.csv')
#         df['ds'] = pd.to_datetime(df['ds'])
#     except FileNotFoundError:
#         print("Error: CSV not found.")
#         exit()
    
#     in_holidays = holidays.India()
#     df['is_holiday'] = df['ds'].apply(lambda x: 1 if x in in_holidays else 0)

#     blood_groups = ['A_positive', 'B_positive', 'O_positive', 'AB_positive', 
#                     'A_negative', 'B_negative', 'O_negative', 'AB_negative']

#     print(f"{'Group':<15} | {'MAE':<10} | {'R2':<10} | Status")
#     print("-" * 60)

#     for group in blood_groups:
#         if group not in df.columns: continue
        
#         # 1. Prep
#         df_clean = remove_outliers(df.copy(), group)
#         df_features = create_features(df_clean[['ds', 'is_holiday', group]], target_col=group)
        
#         # Split 85/15
#         split_index = int(len(df_features) * 0.85)
        
#         # Define Feature Sets
#         # Linear Model likes Sine/Cos waves
#         linear_features = ['day_sin', 'day_cos', 'month_sin', 'month_cos', 'year_sin', 'is_holiday', 'is_weekend']
        
#         # XGBoost likes Lags and Rolling stats
#         xgb_features = ['lag_1', 'lag_2', 'lag_7', 'lag_30', 'rolling_mean_7', 'rolling_std_7', 'day_sin', 'is_holiday']
        
#         # Targets
#         y = df_features[group]
        
#         # --- STEP 1: Train Linear Model (The Trend Setter) ---
#         X_lin = df_features[linear_features]
#         X_lin_train, X_lin_test = X_lin.iloc[:split_index], X_lin.iloc[split_index:]
#         y_train, y_test = y.iloc[:split_index], y.iloc[split_index:]
        
#         # Using Ridge (Linear Regression with regularization) to prevent overfitting
#         linear_model = Ridge(alpha=1.0)
#         linear_model.fit(X_lin_train, y_train)
        
#         # Get Linear Predictions
#         y_pred_train_lin = linear_model.predict(X_lin_train)
#         y_pred_test_lin = linear_model.predict(X_lin_test)
        
#         # --- STEP 2: Calculate Residuals (The "Mistakes") ---
#         # Residual = Actual - Linear_Prediction
#         y_resid_train = y_train - y_pred_train_lin
#         y_resid_test = y_test - y_pred_test_lin
        
#         # --- STEP 3: Train XGBoost on Residuals (The Fixer) ---
#         X_xgb = df_features[xgb_features]
#         X_xgb_train, X_xgb_test = X_xgb.iloc[:split_index], X_xgb.iloc[split_index:]
        
#         xgb_model = xgb.XGBRegressor(
#             objective='reg:squarederror', # Standard error works best for residuals
#             n_estimators=1000,
#             learning_rate=0.01,
#             max_depth=4,
#             subsample=0.7,
#             colsample_bytree=0.7,
#             reg_alpha=0.5,
#             early_stopping_rounds=50,
#             n_jobs=-1
#         )
        
#         xgb_model.fit(
#             X_xgb_train, y_resid_train,
#             eval_set=[(X_xgb_test, y_resid_test)],
#             verbose=False
#         )
        
#         # --- STEP 4: Combine Predictions ---
#         xgb_correction = xgb_model.predict(X_xgb_test)
#         final_prediction = y_pred_test_lin + xgb_correction
        
#         # Enforce non-negative predictions (Blood demand can't be -5)
#         final_prediction = np.maximum(final_prediction, 0)
        
#         # Metrics
#         mae = mean_absolute_error(y_test, final_prediction)
#         r2 = r2_score(y_test, final_prediction)
        
#         print(f"{group:<15} | {mae:.4f}     | {r2:.4f}     | Hybrid Saved")
        
#         # Save BOTH models (You need both to make a prediction later)
#         joblib.dump(linear_model, os.path.join(save_folder, f'{group}_linear.joblib'))
#         joblib.dump(xgb_model, os.path.join(save_folder, f'{group}_xgb_resid.joblib'))

#     print("\nHybrid Training Complete.")

import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.linear_model import Ridge
# Added mean_absolute_percentage_error to the imports
from sklearn.metrics import mean_absolute_error, r2_score, mean_absolute_percentage_error
from sklearn.model_selection import TimeSeriesSplit
import holidays
import joblib
import os
import warnings
import optuna

warnings.filterwarnings('ignore')
optuna.logging.set_verbosity(optuna.logging.WARNING) # Keeps the terminal clean during tuning

# --- 1. Feature Engineering (Unchanged) ---
def create_features(df, target_col):
    df = df.copy()
    df['day_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
    df['day_cos'] = np.cos(2 * np.pi * df['ds'].dt.dayofweek / 7)
    df['month_sin'] = np.sin(2 * np.pi * df['ds'].dt.month / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['ds'].dt.month / 12)
    df['year_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofyear / 365.25)
    
    df['lag_1'] = df[target_col].shift(1)
    df['lag_2'] = df[target_col].shift(2)
    df['lag_7'] = df[target_col].shift(7)
    df['lag_30'] = df[target_col].shift(30)
    
    df['rolling_mean_7'] = df[target_col].shift(1).rolling(window=7).mean()
    df['rolling_std_7']  = df[target_col].shift(1).rolling(window=7).std()
    
    df['is_weekend'] = (df['ds'].dt.dayofweek >= 5).astype(int)
    
    return df.dropna()

# --- 2. Outlier Clipping (Unchanged) ---
def remove_outliers(df, col):
    df[col] = df[col].astype(float)
    threshold = df[col].quantile(0.99)
    df.loc[df[col] > threshold, col] = threshold
    return df

if __name__ == "__main__":
    save_folder = 'models_hybrid_optimized'
    os.makedirs(save_folder, exist_ok=True)
    
    try:
        df = pd.read_csv('daily_blood_demand1.csv')
        df['ds'] = pd.to_datetime(df['ds'])
    except FileNotFoundError:
        print("Error: CSV not found.")
        exit()
    
    in_holidays = holidays.India()
    df['is_holiday'] = df['ds'].apply(lambda x: 1 if x in in_holidays else 0)

    blood_groups = ['A_positive', 'B_positive', 'O_positive', 'AB_positive', 
                    'A_negative', 'B_negative', 'O_negative', 'AB_negative']

    # Updated the print header to include MAPE
    print(f"{'Group':<15} | {'CV MAE':<8} | {'Test MAE':<8} | {'Test R2':<8} | {'MAPE':<8} | Status")
    print("-" * 75)

    for group in blood_groups:
        if group not in df.columns: continue
        
        # Prep Data
        df_clean = remove_outliers(df.copy(), group)
        df_features = create_features(df_clean[['ds', 'is_holiday', group]], target_col=group)
        
        linear_features = ['day_sin', 'day_cos', 'month_sin', 'month_cos', 'year_sin', 'is_holiday', 'is_weekend']
        xgb_features = ['lag_1', 'lag_2', 'lag_7', 'lag_30', 'rolling_mean_7', 'rolling_std_7', 'day_sin', 'is_holiday']
        
        X_lin = df_features[linear_features]
        X_xgb = df_features[xgb_features]
        
        # STRATEGY 1: Log Transformation (Handles extreme spikes)
        y_raw = df_features[group]
        y_log = np.log1p(y_raw) 
        
        # --- STRATEGY 2 & 3: Optuna Hyperparameter Tuning + Time Series CV ---
        def objective(trial):
            # Evaluate using 3 expanding windows (Time Series Cross Validation)
            tscv = TimeSeriesSplit(n_splits=3) 
            cv_mae = []

            # Let Optuna find the best parameters for THIS specific blood group
            param = {
                'objective': 'reg:squarederror',
                'n_estimators': trial.suggest_int('n_estimators', 50, 400),
                'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.2, log=True),
                'max_depth': trial.suggest_int('max_depth', 2, 7),
                'subsample': trial.suggest_float('subsample', 0.6, 1.0),
                'colsample_bytree': trial.suggest_float('colsample_bytree', 0.6, 1.0),
                'n_jobs': -1
            }

            for train_idx, val_idx in tscv.split(df_features):
                # Split Data
                X_lin_tr, X_lin_val = X_lin.iloc[train_idx], X_lin.iloc[val_idx]
                X_xgb_tr, X_xgb_val = X_xgb.iloc[train_idx], X_xgb.iloc[val_idx]
                y_log_tr = y_log.iloc[train_idx]
                y_raw_tr, y_raw_val = y_raw.iloc[train_idx], y_raw.iloc[val_idx]

                # Train Ridge on LOG data
                ridge = Ridge(alpha=1.0)
                ridge.fit(X_lin_tr, y_log_tr)

                # Predict and convert back to RAW scale using expm1
                pred_lin_tr = np.expm1(ridge.predict(X_lin_tr))
                pred_lin_val = np.expm1(ridge.predict(X_lin_val))

                # Calculate Residuals (Mistakes) on RAW scale
                resid_tr = y_raw_tr - pred_lin_tr
                
                # Train XGBoost on Residuals
                xgb_m = xgb.XGBRegressor(**param)
                xgb_m.fit(X_xgb_tr, resid_tr, verbose=False)

                # Final Combined Prediction
                xgb_pred = xgb_m.predict(X_xgb_val)
                final_pred = np.maximum(pred_lin_val + xgb_pred, 0) # Enforce >= 0

                cv_mae.append(mean_absolute_error(y_raw_val, final_pred))

            return np.mean(cv_mae)

        # Run Optuna Study (20 trials per group)
        study = optuna.create_study(direction='minimize')
        study.optimize(objective, n_trials=20)
        best_xgb_params = study.best_params
        best_cv_mae = study.best_value

        # --- FINAL TRAINING (85/15 Split with Best Parameters) ---
        split_index = int(len(df_features) * 0.85)
        
        X_lin_train, X_lin_test = X_lin.iloc[:split_index], X_lin.iloc[split_index:]
        X_xgb_train, X_xgb_test = X_xgb.iloc[:split_index], X_xgb.iloc[split_index:]
        y_log_train = y_log.iloc[:split_index]
        y_raw_train, y_raw_test = y_raw.iloc[:split_index], y_raw.iloc[split_index:]

        # 1. Final Linear Model
        final_linear = Ridge(alpha=1.0)
        final_linear.fit(X_lin_train, y_log_train)
        
        pred_lin_train = np.expm1(final_linear.predict(X_lin_train))
        pred_lin_test = np.expm1(final_linear.predict(X_lin_test))
        
        # 2. Final XGBoost Model
        resid_train = y_raw_train - pred_lin_train
        final_xgb = xgb.XGBRegressor(**best_xgb_params, objective='reg:squarederror', n_jobs=-1)
        final_xgb.fit(X_xgb_train, resid_train, verbose=False)
        
        # 3. Final Evaluation
        xgb_correction = final_xgb.predict(X_xgb_test)
        final_test_prediction = np.maximum(pred_lin_test + xgb_correction, 0)
        
        test_mae = mean_absolute_error(y_raw_test, final_test_prediction)
        test_r2 = r2_score(y_raw_test, final_test_prediction)
        
        # --- NEW: Calculate MAPE ---
        # Adding 1e-10 to the true values prevents ZeroDivisionError if a day had 0 demand
        mape = mean_absolute_percentage_error(y_raw_test + 1e-10, final_test_prediction) * 100

        # Updated print statement to include the MAPE result
        print(f"{group:<15} | {best_cv_mae:.4f} | {test_mae:.4f} | {test_r2:.4f} | {mape:>5.2f}% | Optimized & Saved")
        
        # Save Models
        joblib.dump(final_linear, os.path.join(save_folder, f'{group}_linear.joblib'))
        joblib.dump(final_xgb, os.path.join(save_folder, f'{group}_xgb_resid.joblib'))

    print("\nFully Optimized Hybrid Training Complete.")