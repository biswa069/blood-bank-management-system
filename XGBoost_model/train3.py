import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import TimeSeriesSplit, RandomizedSearchCV
import holidays
import joblib
import os
import warnings
import shap  # <--- NEW: SHAP library
import matplotlib.pyplot as plt # <--- NEW: For saving plots

# Suppress warnings for cleaner output
warnings.filterwarnings('ignore')

def create_features(df, target_col):
    df = df.copy()
    # Time Features
    df['day_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
    df['day_cos'] = np.cos(2 * np.pi * df['ds'].dt.dayofweek / 7)
    df['month_sin'] = np.sin(2 * np.pi * df['ds'].dt.month / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['ds'].dt.month / 12)
    
    # History Features
    df['lag_1'] = df[target_col].shift(1)
    df['lag_7'] = df[target_col].shift(7)
    df['lag_30'] = df[target_col].shift(30)
    
    # Rolling Stats
    df['rolling_mean_7'] = df[target_col].shift(1).rolling(window=7).mean()
    df['rolling_std_7']  = df[target_col].shift(1).rolling(window=7).std()
    df['rolling_mean_30'] = df[target_col].shift(1).rolling(window=30).mean()
    
    df['is_weekend'] = (df['ds'].dt.dayofweek >= 5).astype(int)
    df['quarter'] = df['ds'].dt.quarter
    
    return df.dropna()

def remove_outliers(df, col):
    # Convert to float first to accept decimal thresholds
    df[col] = df[col].astype(float)
    
    threshold = df[col].quantile(0.995) 
    df.loc[df[col] > threshold, col] = threshold
    return df

if __name__ == "__main__":
    # Setup Folders
    save_folder = 'models_final_tuned'
    shap_folder = 'shap_plots' # <--- NEW: Folder for SHAP images
    os.makedirs(save_folder, exist_ok=True)
    os.makedirs(shap_folder, exist_ok=True)
    
    try:
        df = pd.read_csv('daily_blood_demand.csv')
        df['ds'] = pd.to_datetime(df['ds'])
    except FileNotFoundError:
        print("Error: CSV not found.")
        exit()
    
    in_holidays = holidays.India()
    df['is_holiday'] = df['ds'].apply(lambda x: 1 if x in in_holidays else 0)

    blood_groups = ['A_positive', 'B_positive', 'O_positive', 'AB_positive', 
                    'A_negative', 'B_negative', 'O_negative', 'AB_negative']

    print(f"Starting Automated Hyperparameter Tuning & SHAP Analysis...")
    print(f"{'Group':<15} | {'MAE':<10} | {'R2':<10} | {'Best Config'}")
    print("-" * 80)

    param_grid = {
        'n_estimators': [500, 1000, 2000],
        'learning_rate': [0.01, 0.05, 0.1],
        'max_depth': [3, 5, 7],
        'subsample': [0.7, 0.8],
        'colsample_bytree': [0.7, 0.8],
        'reg_alpha': [0.1, 1.0], 
        'reg_lambda': [1.0, 2.0] 
    }

    for group in blood_groups:
        if group not in df.columns: continue
        
        # 1. Prep Data
        df_clean = remove_outliers(df.copy(), group)
        df_features = create_features(df_clean[['ds', 'is_holiday', group]], target_col=group)
        
        split_index = int(len(df_features) * 0.85) 
        
        features_list = [
            'day_sin', 'day_cos', 'month_sin', 'month_cos', 
            'lag_1', 'lag_7', 'lag_30', 
            'rolling_mean_7', 'rolling_std_7', 
            'rolling_mean_30', 
            'is_holiday', 'is_weekend', 'quarter'
        ]
        
        X = df_features[features_list]
        y = df_features[group]

        X_train, X_test = X.iloc[:split_index], X.iloc[split_index:]
        y_train, y_test = y.iloc[:split_index], y.iloc[split_index:]

        # 2. Setup & Tune Model
        xgb_model = xgb.XGBRegressor(objective='count:poisson', n_jobs=-1)
        tscv = TimeSeriesSplit(n_splits=3)
        
        search = RandomizedSearchCV(
            estimator=xgb_model,
            param_distributions=param_grid,
            n_iter=15,
            scoring='neg_mean_absolute_error',
            cv=tscv,
            verbose=0,
            random_state=42,
            n_jobs=-1
        )
        
        search.fit(X_train, y_train)
        
        # 3. Get Best Model & Evaluate
        best_model = search.best_estimator_
        y_pred = best_model.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        config = f"LR:{search.best_params_['learning_rate']} D:{search.best_params_['max_depth']} Est:{search.best_params_['n_estimators']}"
        print(f"{group:<15} | {mae:.4f}     | {r2:.4f}     | {config}")
        
        # Save Model
        joblib.dump(best_model, os.path.join(save_folder, f'{group}_tuned.joblib'))

        # --- 4. SHAP EXPLAINABILITY ---
        # Initialize the explainer with the best tuned model
        explainer = shap.TreeExplainer(best_model)
        
        # Calculate SHAP values for the test dataset
        shap_values = explainer(X_test)
        
        # Plot A: Global Explainability (Summary Plot)
        plt.figure(figsize=(10, 6))
        shap.summary_plot(shap_values, X_test, show=False)
        plt.title(f"Global Feature Importance: {group}")
        plt.tight_layout()
        plt.savefig(os.path.join(shap_folder, f"{group}_global_summary.png"))
        plt.close() # Close to free up memory
        
        # Plot B: Local Explainability (Waterfall Plot for the 1st day of the test set)
        plt.figure(figsize=(10, 6))
        # shap_values[0] looks at the exact prediction logic for the first row in X_test
        shap.plots.waterfall(shap_values[0], show=False)
        plt.title(f"Local Explanation (Day 1 of Test Set): {group}")
        plt.tight_layout()
        plt.savefig(os.path.join(shap_folder, f"{group}_local_waterfall.png"))
        plt.close()

    print(f"\nAll models saved to '{save_folder}'")
    print(f"All SHAP explanation images saved to '{shap_folder}'")