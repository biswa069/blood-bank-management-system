import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score
import joblib
import os
import matplotlib.pyplot as plt

# --- 1. Synthetic Data Generation (Same as XGBoost for fair comparison) ---
def create_dataset():
    """
    Generates the exact same high-signal dataset used for XGBoost
    to ensure a fair head-to-head comparison.
    """
    date_rng = pd.date_range(start='2022-01-01', end='2025-08-27', freq='D', name='ds')
    df = pd.DataFrame(date_rng)
    
    df['is_holiday'] = 0
    # Fixed random seed ensures we get the same "random" holidays every time we run it
    np.random.seed(42) 
    holiday_indices = np.random.choice(df.index, size=int(len(df)*0.05), replace=False)
    df.loc[holiday_indices, 'is_holiday'] = 1

    blood_groups = {'A_positive': 20, 'B_positive': 15, 'O_positive': 25, 'AB_positive': 5, 
                    'A_negative': 4, 'B_negative': 3, 'O_negative': 8, 'AB_negative': 2}
    
    for group, base in blood_groups.items():
        trend = np.linspace(0, 0.5 * base, num=len(df))
        weekly = -0.3 * base * np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
        yearly = 0.4 * base * np.sin(2 * np.pi * df['ds'].dt.dayofyear / 365.25)
        holiday_effect = df['is_holiday'] * (0.5 * base) 
        noise = np.random.normal(0, 0.05 * base, len(df))
        
        df[group] = base + trend + weekly + yearly + holiday_effect + noise
        df[group] = df[group].astype(int).clip(lower=0)
        
    return df

# --- 2. Feature Engineering (Crucial for Linear Regression) ---
def create_features(df, target_col):
    df = df.copy()
    
    # Linear Regression cannot handle dates directly.
    # It also struggles with 'Month=12' vs 'Month=1'.
    # So Cyclical Features (sin/cos) are REQUIRED for it to work well.
    
    df['day_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
    df['day_cos'] = np.cos(2 * np.pi * df['ds'].dt.dayofweek / 7)
    df['month_sin'] = np.sin(2 * np.pi * df['ds'].dt.month / 12)
    df['month_cos'] = np.cos(2 * np.pi * df['ds'].dt.month / 12)
    
    df['lag_1'] = df[target_col].shift(1)
    df['lag_7'] = df[target_col].shift(7)
    df['rolling_mean_7'] = df[target_col].shift(1).rolling(window=7).mean()
    
    # Simple Calendar features
    df['is_weekend'] = (df['ds'].dt.dayofweek >= 5).astype(int)
    
    return df.dropna()

# --- 3. Main Training Loop ---
if __name__ == "__main__":
    print("Generating dataset for Linear Regression Baseline...")
    full_df = create_dataset()
    
    blood_groups_list = [col for col in full_df.columns if col not in ['ds', 'is_holiday']]
    
    # Save models in a separate folder so they don't overwrite your XGBoost ones
    models_dir = 'models_linear' 
    os.makedirs(models_dir, exist_ok=True)
    
    print("\nStarting Linear Regression training...")
    
    for group in blood_groups_list:
        group_df = create_features(full_df[['ds', 'is_holiday', group]], target_col=group)
        
        # Define Features (X) and Target (y)
        FEATURES = ['day_sin', 'day_cos', 'month_sin', 'month_cos', 
                    'lag_1', 'lag_7', 'rolling_mean_7', 
                    'is_holiday', 'is_weekend']
        TARGET = group
        
        X = group_df[FEATURES]
        y = group_df[TARGET]
        
        # Split Data (Same split strategy)
        split_date = full_df['ds'].max() - pd.DateOffset(months=6)
        X_train = X[group_df['ds'] < split_date]
        X_test = X[group_df['ds'] >= split_date]
        y_train = y[group_df['ds'] < split_date]
        y_test = y[group_df['ds'] >= split_date]
        
        # --- Train Linear Regression Model ---
        model = LinearRegression()
        model.fit(X_train, y_train)
        
        # Predictions
        y_pred = model.predict(X_test)
        
        # Metrics
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"\n--- Baseline Report for: {group} ---")
        print(f"  MAE: {mae:.4f} units")
        print(f"  R-squared: {r2:.4f}")
        print("---------------------------------------------")
        
        # Visualization
        plt.figure(figsize=(15, 5))
        plt.plot(group_df['ds'][group_df['ds'] >= split_date], y_test, label='Actual', color='orange')
        plt.plot(group_df['ds'][group_df['ds'] >= split_date], y_pred, label='Linear Regression Prediction', color='blue', linestyle='--')
        plt.title(f'Linear Regression Baseline: {group}')
        plt.legend()
        plt.show()
        
        # Save Model
        joblib.dump(model, os.path.join(models_dir, f'{group}_linear.joblib'))

    print("\nAll Linear Regression baseline models trained.")

# import pandas as pd
# import numpy as np
# from sklearn.linear_model import LinearRegression
# from sklearn.metrics import mean_absolute_error, r2_score
# import matplotlib.pyplot as plt

# # --- Feature Engineering Function ---
# def create_features(df, target_col):
#     df = df.copy()
#     df['day_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
#     df['day_cos'] = np.cos(2 * np.pi * df['ds'].dt.dayofweek / 7)
#     df['month_sin'] = np.sin(2 * np.pi * df['ds'].dt.month / 12)
#     df['month_cos'] = np.cos(2 * np.pi * df['ds'].dt.month / 12)
#     df['lag_1'] = df[target_col].shift(1)
#     df['lag_7'] = df[target_col].shift(7)
#     df['rolling_mean_7'] = df[target_col].shift(1).rolling(window=7).mean()
#     df['is_weekend'] = (df['ds'].dt.dayofweek >= 5).astype(int)
#     return df.dropna()

# if __name__ == "__main__":
#     # 1. Load REAL Data
#     df = pd.read_csv('daily_blood_demand.csv')
#     df['ds'] = pd.to_datetime(df['ds'])
    
#     # Handle missing holiday column if necessary
#     if 'is_holiday' not in df.columns:
#         df['is_holiday'] = 0

#     blood_groups = ['A_positive', 'B_positive', 'O_positive', 'AB_positive', 
#                     'A_negative', 'B_negative', 'O_negative', 'AB_negative']

#     for group in blood_groups:
#         if group not in df.columns: continue
            
#         # 2. Create Features on the WHOLE dataset first
#         df_features = create_features(df[['ds', 'is_holiday', group]], target_col=group)
        
#         # 3. Split Time-Series (80% Train, 20% Test)
#         split_index = int(len(df_features) * 0.8)
        
#         X = df_features[['day_sin', 'day_cos', 'month_sin', 'month_cos', 
#                          'lag_1', 'lag_7', 'rolling_mean_7', 'is_holiday', 'is_weekend']]
#         y = df_features[group]

#         X_train, X_test = X.iloc[:split_index], X.iloc[split_index:]
#         y_train, y_test = y.iloc[:split_index], y.iloc[split_index:]

#         # 4. Train
#         model = LinearRegression()
#         model.fit(X_train, y_train)
        
#         # 5. Evaluate
#         y_pred = model.predict(X_test)
#         mae = mean_absolute_error(y_test, y_pred)
#         r2 = r2_score(y_test, y_pred)

#         print(f"--- {group} (Real Data Split) ---")
#         print(f"  MAE: {mae:.4f}")
#         print(f"  R2:  {r2:.4f}")