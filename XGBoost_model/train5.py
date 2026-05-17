import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, r2_score, mean_absolute_percentage_error
from sklearn.model_selection import TimeSeriesSplit
import holidays
import joblib
import os
import warnings
import optuna
import shap
import matplotlib.pyplot as plt

warnings.filterwarnings('ignore')
optuna.logging.set_verbosity(optuna.logging.WARNING) # Keeps the terminal clean during tuning

# --- 1. Feature Engineering (Upgraded for Human Behavior & EMA) ---
def create_features(df, target_col):
    df = df.copy()
    
    # A. Mathematical Transformations
    df['day_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
    df['day_cos'] = np.cos(2 * np.pi * df['ds'].dt.dayofweek / 7)
    df['month_sin'] = np.sin(2 * np.pi * df['ds'].dt.month / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['ds'].dt.month / 12)
    df['year_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofyear / 365.25)
    
    # Explicit categorical features for XGBoost
    df['day_of_week'] = df['ds'].dt.dayofweek 
    df['is_weekend'] = (df['ds'].dt.dayofweek >= 5).astype(int)
    
    # B. Lags
    df['lag_1'] = df[target_col].shift(1)
    df['lag_2'] = df[target_col].shift(2)
    df['lag_7'] = df[target_col].shift(7)
    df['lag_30'] = df[target_col].shift(30)
    
    # C. Exponential Moving Averages (More responsive to sudden spikes)
    df['ema_3'] = df[target_col].shift(1).ewm(span=3, adjust=False).mean()
    df['ema_7'] = df[target_col].shift(1).ewm(span=7, adjust=False).mean()
    
    # Keep rolling std for volatility context
    df['rolling_std_7']  = df[target_col].shift(1).rolling(window=7).std()

    # D. The "Holiday Halo" Effect (Stockpiling / Catch-up surgeries)
    if 'is_holiday' in df.columns:
        # Days since last holiday
        df['days_since_hol'] = df.groupby(df['is_holiday'].cumsum()).cumcount()
        
        # Days until next holiday (reverse cumsum trick)
        df_reversed = df.iloc[::-1].copy()
        df_reversed['days_until_hol'] = df_reversed.groupby(df_reversed['is_holiday'].cumsum()).cumcount()
        df['days_until_hol'] = df_reversed['days_until_hol'].iloc[::-1]
        
        # Cap at 7 days to prevent model confusion from long gaps
        df['days_since_hol'] = df['days_since_hol'].clip(upper=7)
        df['days_until_hol'] = df['days_until_hol'].clip(upper=7)
        
    # E. Weather Context
    if 'max_temp_c' in df.columns and 'rainfall_mm' in df.columns:
        df['is_heavy_rain'] = (df['rainfall_mm'] > 15).astype(int)
    
    return df.dropna()

# --- 2. Outlier Clipping ---
def remove_outliers(df, col):
    df[col] = df[col].astype(float)
    threshold = df[col].quantile(0.99)
    df.loc[df[col] > threshold, col] = threshold
    return df

if __name__ == "__main__":
    save_folder = 'models_hybrid_optimized'
    os.makedirs(save_folder, exist_ok=True)
    
    try:
        df = pd.read_csv('daily_blood_demand_weather.csv')
        df['ds'] = pd.to_datetime(df['ds'])
        
        # Rename columns to match Mongoose standards
        column_mapping = {
            'A_positive': 'A+', 'B_positive': 'B+', 'O_positive': 'O+', 'AB_positive': 'AB+',
            'A_negative': 'A-', 'B_negative': 'B-', 'O_negative': 'O-', 'AB_negative': 'AB-'
        }
        df.rename(columns=column_mapping, inplace=True)
    except FileNotFoundError:
        print("Error: CSV not found.")
        exit()
    
    in_holidays = holidays.India()
    df['is_holiday'] = df['ds'].apply(lambda x: 1 if x in in_holidays else 0)

    blood_groups = ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-']

    print(f"{'Group':<15} | {'CV MAE':<8} | {'Test MAE':<8} | {'Test R2':<8} | {'Test MAPE':<9} | Status")
    print("-" * 80)

    for group in blood_groups:
        if group not in df.columns: continue
        
        # Prep Data (Ensure we include weather columns)
        df_clean = remove_outliers(df.copy(), group)
        df_features = create_features(df_clean[['ds', 'is_holiday', group, 'max_temp_c', 'rainfall_mm']], target_col=group)
        
        # Linear handles the broad seasonal strokes
        linear_features = ['day_sin', 'day_cos', 'month_sin', 'month_cos', 'year_sin', 'is_holiday', 'is_weekend']
        
        # XGBoost handles the rapid operational shifts, holidays, and weather!
        xgb_features = ['lag_1', 'lag_2', 'lag_7', 'ema_3', 'ema_7', 'rolling_std_7', 
                        'day_of_week', 'is_holiday', 'days_since_hol', 'days_until_hol',
                        'max_temp_c', 'rainfall_mm', 'is_heavy_rain']
        
        X_lin = df_features[linear_features]
        X_xgb = df_features[xgb_features]
        
        # STRATEGY 1: Log Transformation
        y_raw = df_features[group]
        y_log = np.log1p(y_raw) 
        
        # --- STRATEGY 2: Optuna Optimization (Targeted safely at MAE) ---
        def objective(trial):
            tscv = TimeSeriesSplit(n_splits=3) 
            cv_mae = [] # MAE protects against division by zero in rare groups

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
                X_lin_tr, X_lin_val = X_lin.iloc[train_idx], X_lin.iloc[val_idx]
                X_xgb_tr, X_xgb_val = X_xgb.iloc[train_idx], X_xgb.iloc[val_idx]
                y_log_tr = y_log.iloc[train_idx]
                y_raw_tr, y_raw_val = y_raw.iloc[train_idx], y_raw.iloc[val_idx]

                # Train Ridge on LOG data
                ridge = Ridge(alpha=1.0)
                ridge.fit(X_lin_tr, y_log_tr)

                pred_lin_tr = np.expm1(ridge.predict(X_lin_tr))
                pred_lin_val = np.expm1(ridge.predict(X_lin_val))

                resid_tr = y_raw_tr - pred_lin_tr
                
                xgb_m = xgb.XGBRegressor(**param)
                xgb_m.fit(X_xgb_tr, resid_tr, verbose=False)

                xgb_pred = xgb_m.predict(X_xgb_val)
                final_pred = np.maximum(pred_lin_val + xgb_pred, 0) 

                # Evaluate using absolute units (MAE)
                mae_score = mean_absolute_error(y_raw_val, final_pred)
                cv_mae.append(mae_score)

            return np.mean(cv_mae)

        # DEEP OPTIMIZATION: Running 100 trials to ensure peak performance
        study = optuna.create_study(direction='minimize')
        study.optimize(objective, n_trials=100)
        best_xgb_params = study.best_params
        best_cv_mae = study.best_value 

        # --- FINAL TRAINING (85/15 Split with Best Parameters) ---
        split_index = int(len(df_features) * 0.85)
        
        X_lin_train, X_lin_test = X_lin.iloc[:split_index], X_lin.iloc[split_index:]
        X_xgb_train, X_xgb_test = X_xgb.iloc[:split_index], X_xgb.iloc[split_index:]
        y_log_train = y_log.iloc[:split_index]
        y_raw_train, y_raw_test = y_raw.iloc[:split_index], y_raw.iloc[split_index:]

        final_linear = Ridge(alpha=1.0)
        final_linear.fit(X_lin_train, y_log_train)
        
        pred_lin_train = np.expm1(final_linear.predict(X_lin_train))
        pred_lin_test = np.expm1(final_linear.predict(X_lin_test))
        
        resid_train = y_raw_train - pred_lin_train
        final_xgb = xgb.XGBRegressor(**best_xgb_params, objective='reg:squarederror', n_jobs=-1)
        final_xgb.fit(X_xgb_train, resid_train, verbose=False)
        
        xgb_correction = final_xgb.predict(X_xgb_test)
        final_test_prediction = np.maximum(pred_lin_test + xgb_correction, 0)
        
        # --- CALCULATE FINAL METRICS ---
        test_mae = mean_absolute_error(y_raw_test, final_test_prediction)
        test_r2 = r2_score(y_raw_test, final_test_prediction)
        test_mape = mean_absolute_percentage_error(y_raw_test + 1e-10, final_test_prediction) * 100

        print(f"{group:<15} | {best_cv_mae:>6.4f}   | {test_mae:<8.4f} | {test_r2:<8.4f} | {test_mape:>8.2f}% | Optimized & Saved")
        
        # --- FEATURE IMPORTANCE & SHAP EXTRACTION ---
        if group == 'O+': # Just print feature importances for O+ to save terminal space
            importance = final_xgb.feature_importances_
            feature_imp_df = pd.DataFrame({'Feature': xgb_features, 'Importance': importance})
            feature_imp_df = feature_imp_df.sort_values(by='Importance', ascending=False)
            print("\n" + "="*65)
            print(f"--- Feature Importance for {group} (Residuals) ---")
            print(feature_imp_df.to_string(index=False))
            print("="*65 + "\n")

        # Save SHAP plots
        shap_dir = 'shap_plots'
        os.makedirs(shap_dir, exist_ok=True)
        
        explainer = shap.TreeExplainer(final_xgb)
        shap_values = explainer(X_xgb_test)

        plt.figure(figsize=(10, 6))
        shap.summary_plot(shap_values, X_xgb_test, show=False)
        plt.savefig(os.path.join(shap_dir, f'{group}_global_summary.png'), bbox_inches='tight')
        plt.close()

        plt.figure(figsize=(10, 6))
        shap.plots.waterfall(shap_values[0], show=False)
        plt.savefig(os.path.join(shap_dir, f'{group}_local_waterfall.png'), bbox_inches='tight')
        plt.close()

        # Save Models
        joblib.dump(final_linear, os.path.join(save_folder, f'{group}_linear.joblib'))
        joblib.dump(final_xgb, os.path.join(save_folder, f'{group}_xgb_resid.joblib'))

    print("\nFully Optimized Hybrid Training Complete.")