# import pandas as pd
# import numpy as np
# import xgboost as xgb
# import joblib
# import os
# from sklearn.metrics import mean_absolute_error, r2_score
# import matplotlib.pyplot as plt

# # --- Synthetic Data Generation (Commented out for future use) ---
# # def create_dataset():
# #     date_rng = pd.date_range(start='2022-08-28', end='2025-08-27', freq='D', name='ds')
# #     df = pd.DataFrame(date_rng)
# #     blood_groups = {'A_positive': 20, 'B_positive': 15, 'O_positive': 25, 'AB_positive': 5, 
# #                     'A_negative': 4, 'B_negative': 3, 'O_negative': 8, 'AB_negative': 2}
# #     for group, base in blood_groups.items():
# #         trend = np.linspace(0, 0.25 * base, num=len(df))
# #         weekly = -0.2 * base * np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
# #         yearly = 0.3 * base * np.sin(2 * np.pi * df['ds'].dt.dayofyear / 365.25)
# #         noise_level = max(1, 0.1 * base)
# #         noise = np.random.normal(0, noise_level, len(df))
# #         df[group] = base + trend + weekly + yearly + noise
# #         df[group] = df[group].astype(int).clip(lower=0)
# #     return df

# # --- Feature Engineering Function ---
# def create_features(df, target_col):
#     df = df.copy()
#     df['day_of_week'] = df['ds'].dt.dayofweek
#     df['month'] = df['ds'].dt.month
#     df['year'] = df['ds'].dt.year
#     df['quarter'] = df['ds'].dt.quarter
#     df['day_of_year'] = df['ds'].dt.dayofyear
#     df['week_of_year'] = df['ds'].dt.isocalendar().week
#     df['lag_7'] = df[target_col].shift(7)
#     df['rolling_mean_7'] = df[target_col].shift(1).rolling(window=7).mean()
#     return df.dropna()

# # --- Main Training & Evaluation Block ---
# if __name__ == "__main__":
#     print("Loading pre-processed real-world dataset...")
#     full_df = pd.read_csv('daily_blood_demand.csv')
#     full_df['ds'] = pd.to_datetime(full_df['ds'])
    
#     blood_groups_list = list(full_df.columns[1:])
#     models_dir = 'models'
#     os.makedirs(models_dir, exist_ok=True)
    
#     print("\nStarting model training and evaluation...")
#     for group in blood_groups_list:
#         group_df = create_features(full_df[['ds', group]], target_col=group)
#         group_df = group_df.set_index('ds')
        
#         FEATURES = ['day_of_week', 'month', 'year', 'quarter', 'day_of_year', 'week_of_year', 'lag_7', 'rolling_mean_7']
#         TARGET = group
        
#         X, y = group_df[FEATURES], group_df[TARGET]
        
#         split_date = y.index.max() - pd.DateOffset(months=3)
#         X_train, X_test = X[X.index < split_date], X[X.index >= split_date]
#         y_train, y_test = y[y.index < split_date], y[y.index >= split_date]
        
#         eval_model = xgb.XGBRegressor(n_estimators=1000, learning_rate=0.05, early_stopping_rounds=10)
#         eval_model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
#         y_pred = eval_model.predict(X_test)
        
#         mae = mean_absolute_error(y_test, y_pred)
#         r2 = r2_score(y_test, y_pred)
        
#         print(f"\n--- Performance Report for: {group} ---")
#         print(f"  MAE (Mean Absolute Error): {mae:.2f} units")
#         print(f"  R-squared (R²): {r2:.2f}")
#         print("---------------------------------------------")

#         plt.figure(figsize=(15, 5))
#         plt.plot(y_test.index, y_test, label='Actual Data', color='orange')
#         plt.plot(y_test.index, y_pred, label='Predictions', color='green', linestyle='--')
#         plt.title(f'Forecast vs. Actuals for {group}')
#         plt.legend()
#         plt.show()

#         prod_model = xgb.XGBRegressor(n_estimators=1000, learning_rate=0.05)
#         prod_model.fit(X, y, verbose=False)
#         model_path = os.path.join(models_dir, f'{group}.joblib')
#         joblib.dump(prod_model, model_path)

#     print("\nAll models have been trained, evaluated, and saved for production.")

# import pandas as pd
# import numpy as np
# import xgboost as xgb
# import joblib
# import os
# from sklearn.metrics import mean_absolute_error, r2_score
# import matplotlib.pyplot as plt

# # --- Define holidays for your region (Odisha) ---
# holidays_list = [
#     '2023-01-26', '2023-06-20', '2023-08-15', '2023-10-02', '2023-11-12', # Rath Yatra, Diwali etc.
#     '2024-01-26', '2024-07-07', '2024-08-15', '2024-10-02', '2024-11-01',
#     '2025-01-26', '2025-06-27', '2025-08-15', '2025-10-02'
# ]
# holidays_dates = pd.to_datetime(holidays_list)


# # --- 1. Updated Feature Engineering Function ---
# def create_features(df, target_col):
#     """
#     Creates time-series features from a date column.
#     """
#     df = df.copy()
#     df['day_of_week'] = df['ds'].dt.dayofweek
#     df['month'] = df['ds'].dt.month
#     df['year'] = df['ds'].dt.year
#     df['quarter'] = df['ds'].dt.quarter
#     df['day_of_year'] = df['ds'].dt.dayofyear
#     df['week_of_year'] = df['ds'].dt.isocalendar().week
    
#     # --- NEW ADVANCED FEATURES ---
#     df['is_month_end'] = df['ds'].dt.is_month_end.astype(int)
#     df['is_holiday'] = df['ds'].isin(holidays_dates).astype(int)
    
#     # Expanded Lag features
#     df['lag_7'] = df[target_col].shift(7)
#     df['lag_14'] = df[target_col].shift(14)
#     df['lag_28'] = df[target_col].shift(28)
    
#     # Expanded Rolling features
#     df['rolling_mean_7'] = df[target_col].shift(1).rolling(window=7).mean()
#     df['rolling_std_7'] = df[target_col].shift(1).rolling(window=7).std()
#     df['rolling_mean_14'] = df[target_col].shift(1).rolling(window=14).mean()
    
#     return df.dropna()


# # --- 2. Main Training & Evaluation Block ---
# if __name__ == "__main__":
#     print("Loading pre-processed real-world dataset...")
#     full_df = pd.read_csv('daily_blood_demand.csv')
#     full_df['ds'] = pd.to_datetime(full_df['ds'])
    
#     blood_groups_list = list(full_df.columns[1:])
#     models_dir = 'models'
#     os.makedirs(models_dir, exist_ok=True)
    
#     print("\nStarting model training and evaluation with advanced features...")
#     for group in blood_groups_list:
#         group_df = create_features(full_df[['ds', group]], target_col=group)
#         group_df = group_df.set_index('ds')
        
#         # --- ADD NEW FEATURES TO THE LIST ---
#         FEATURES = ['day_of_week', 'month', 'year', 'quarter', 'day_of_year', 'week_of_year', 
#                     'is_month_end', 'is_holiday', 'lag_7', 'lag_14', 'lag_28', 
#                     'rolling_mean_7', 'rolling_std_7', 'rolling_mean_14']
#         TARGET = group
        
#         X, y = group_df[FEATURES], group_df[TARGET]
        
#         split_date = y.index.max() - pd.DateOffset(months=3)
#         X_train, X_test = X[X.index < split_date], X[X.index >= split_date]
#         y_train, y_test = y[y.index < split_date], y[y.index >= split_date]
        
#         eval_model = xgb.XGBRegressor(n_estimators=1000, learning_rate=0.05, early_stopping_rounds=10)
#         eval_model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
#         y_pred = eval_model.predict(X_test)
        
#         mae = mean_absolute_error(y_test, y_pred)
#         r2 = r2_score(y_test, y_pred)
        
#         print(f"\n--- Performance Report for: {group} ---")
#         print(f"  MAE (Mean Absolute Error): {mae:.2f} units")
#         print(f"  R-squared (R²): {r2:.2f}")
#         print("---------------------------------------------")

#         plt.figure(figsize=(15, 5))
#         plt.plot(y_test.index, y_test, label='Actual Data', color='orange')
#         plt.plot(y_test.index, y_pred, label='Predictions', color='green', linestyle='--')
#         plt.title(f'Forecast vs. Actuals for {group}')
#         plt.legend()
#         plt.show()

#         # Retrain on the FULL dataset for production
#         prod_model = xgb.XGBRegressor(n_estimators=1000, learning_rate=0.05)
#         prod_model.fit(X, y, verbose=False)
#         model_path = os.path.join(models_dir, f'{group}.joblib')
#         joblib.dump(prod_model, model_path)

#     print("\nAll models have been trained, evaluated, and saved for production.")

# import pandas as pd
# import numpy as np
# import xgboost as xgb
# import joblib
# import os
# from sklearn.metrics import mean_absolute_error, r2_score
# from sklearn.model_selection import GridSearchCV
# import matplotlib.pyplot as plt

# # --- Define holidays for your region ---
# holidays_list = [
#     '2023-01-26', '2023-06-20', '2023-08-15', '2023-10-02', '2023-11-12',
#     '2024-01-26', '2024-07-07', '2024-08-15', '2024-10-02', '2024-11-01',
#     '2025-01-26', '2025-06-27', '2025-08-15', '2025-10-02'
# ]
# holidays_dates = pd.to_datetime(holidays_list)

# # --- 1. Feature Engineering Function ---
# def create_features(df, target_col):
#     df = df.copy()
#     df['day_of_week'] = df['ds'].dt.dayofweek
#     df['month'] = df['ds'].dt.month
#     df['year'] = df['ds'].dt.year
#     df['quarter'] = df['ds'].dt.quarter
#     df['day_of_year'] = df['ds'].dt.dayofyear
#     df['week_of_year'] = df['ds'].dt.isocalendar().week
#     df['is_month_end'] = df['ds'].dt.is_month_end.astype(int)
#     df['is_holiday'] = df['ds'].isin(holidays_dates).astype(int)
#     df['lag_7'] = df[target_col].shift(7)
#     df['lag_14'] = df[target_col].shift(14)
#     df['rolling_mean_7'] = df[target_col].shift(1).rolling(window=7).mean()
#     df['rolling_std_7'] = df[target_col].shift(1).rolling(window=7).std()
#     return df.dropna()

# # --- 2. Main Training & Evaluation Block ---
# if __name__ == "__main__":
#     print("Loading pre-processed real-world dataset...")
#     full_df = pd.read_csv('daily_blood_demand.csv')
#     full_df['ds'] = pd.to_datetime(full_df['ds'])
    
#     blood_groups_list = list(full_df.columns[1:])
#     models_dir = 'models'
#     os.makedirs(models_dir, exist_ok=True)
    
#     print("\nStarting model training and hyperparameter tuning...")
#     for group in blood_groups_list:
#         group_df = create_features(full_df[['ds', group]], target_col=group)
#         group_df = group_df.set_index('ds')
        
#         FEATURES = ['day_of_week', 'month', 'year', 'quarter', 'day_of_year', 'week_of_year',
#                     'is_month_end', 'is_holiday', 'lag_7', 'lag_14', 
#                     'rolling_mean_7', 'rolling_std_7']
#         TARGET = group
        
#         X, y = group_df[FEATURES], group_df[TARGET]
        
#         split_date = y.index.max() - pd.DateOffset(months=3)
#         X_train, X_test = X[X.index < split_date], X[X.index >= split_date]
#         y_train, y_test = y[y.index < split_date], y[y.index >= split_date]
        
#         # --- Hyperparameter Tuning with GridSearchCV ---
#         print(f"\n--- Running GridSearchCV for: {group} ---")

#         param_grid = {
#             'n_estimators': [500, 1000],
#             'learning_rate': [0.01, 0.05, 0.1],
#             'max_depth': [3, 5]
#         }
        
#         grid_search = GridSearchCV(
#             estimator=xgb.XGBRegressor(objective='reg:squarederror', eval_metric='rmse', early_stopping_rounds=10),
#             param_grid=param_grid,
#             scoring='neg_mean_absolute_error',
#             cv=3,
#             verbose=1
#         )
        
#         grid_search.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
        
#         best_model = grid_search.best_estimator_
#         y_pred = best_model.predict(X_test)
        
#         mae = mean_absolute_error(y_test, y_pred)
#         r2 = r2_score(y_test, y_pred)
        
#         print(f"\n--- Performance Report for: {group} (Tuned) ---")
#         print(f"  Best Parameters: {grid_search.best_params_}")
#         print(f"  MAE (Mean Absolute Error): {mae:.2f} units")
#         print(f"  R-squared (R²): {r2:.2f}")
#         print("--------------------------------------------------")

#         plt.figure(figsize=(15, 5))
#         plt.plot(y_test.index, y_test, label='Actual Data', color='orange')
#         plt.plot(y_test.index, y_pred, label='Predictions', color='green', linestyle='--')
#         plt.title(f'Forecast vs. Actuals for {group} (Tuned)')
#         plt.legend()
#         plt.show()

#         # --- Retrain the best model on the FULL dataset for production ---
#         print(f"Retraining final model for {group} with best parameters...")
#         final_model = xgb.XGBRegressor(objective='reg:squarederror', **grid_search.best_params_)
#         final_model.fit(X, y, verbose=False)
        
#         model_path = os.path.join(models_dir, f'{group}.joblib')
#         joblib.dump(final_model, model_path)

#     print("\nAll models have been tuned, evaluated, and saved for production.")

import pandas as pd
import numpy as np
import xgboost as xgb
import joblib
import os
from sklearn.metrics import mean_absolute_error, r2_score
import matplotlib.pyplot as plt

# --- Define holidays for your region ---
holidays_list = [
    '2023-01-26', '2023-06-20', '2023-08-15', '2023-10-02', '2023-11-12',
    '2024-01-26', '2024-07-07', '2024-08-15', '2024-10-02', '2024-11-01',
    '2025-01-26', '2025-06-27', '2025-08-15', '2025-10-02'
]
holidays_dates = pd.to_datetime(holidays_list)

# --- 1. Updated Feature Engineering Function with Cyclical Features ---
def create_features(df, target_col):
    df = df.copy()
    
    # Standard date features
    df['year'] = df['ds'].dt.year
    df['quarter'] = df['ds'].dt.quarter
    df['day_of_year'] = df['ds'].dt.dayofyear
    df['week_of_year'] = df['ds'].dt.isocalendar().week
    df['is_month_end'] = df['ds'].dt.is_month_end.astype(int)
    df['is_holiday'] = df['ds'].isin(holidays_dates).astype(int)
    
    # --- NEW: Cyclical features for month and day of week ---
    df['month_sin'] = np.sin(2 * np.pi * df['ds'].dt.month/12)
    df['month_cos'] = np.cos(2 * np.pi * df['ds'].dt.month/12)
    df['day_of_week_sin'] = np.sin(2 * np.pi * df['ds'].dt.dayofweek/7)
    df['day_of_week_cos'] = np.cos(2 * np.pi * df['ds'].dt.dayofweek/7)
    
    # Lag and Rolling features
    df['lag_7'] = df[target_col].shift(7)
    df['lag_14'] = df[target_col].shift(14)
    df['rolling_mean_7'] = df[target_col].shift(1).rolling(window=7).mean()
    df['rolling_std_7'] = df[target_col].shift(1).rolling(window=7).std()
    
    return df.dropna()

# --- 2. Main Training & Evaluation Block ---
if __name__ == "__main__":
    print("Loading pre-processed real-world dataset...")
    full_df = pd.read_csv('daily_blood_demand.csv')
    full_df['ds'] = pd.to_datetime(full_df['ds'])
    
    blood_groups_list = list(full_df.columns[1:])
    models_dir = 'models'
    os.makedirs(models_dir, exist_ok=True)
    
    print("\nStarting model training with advanced cyclical features...")
    for group in blood_groups_list:
        group_df = create_features(full_df[['ds', group]], target_col=group)
        group_df = group_df.set_index('ds')
        
        # --- UPDATE THE FEATURES LIST ---
        FEATURES = ['year', 'quarter', 'day_of_year', 'week_of_year', 'is_month_end', 'is_holiday',
                    'month_sin', 'month_cos', 'day_of_week_sin', 'day_of_week_cos', # Use new cyclical features
                    'lag_7', 'lag_14', 'rolling_mean_7', 'rolling_std_7']
        TARGET = group
        
        X, y = group_df[FEATURES], group_df[TARGET]
        
        split_date = y.index.max() - pd.DateOffset(months=3)
        X_train, X_test = X[X.index < split_date], X[X.index >= split_date]
        y_train, y_test = y[y.index < split_date], y[y.index >= split_date]
        
        # Using the best parameters found from GridSearchCV previously
        best_params = {'learning_rate': 0.01, 'max_depth': 5, 'n_estimators': 2000}
        
        eval_model = xgb.XGBRegressor(**best_params, early_stopping_rounds=10)
        eval_model.fit(X_train, y_train, eval_set=[(X_test, y_test)], verbose=False)
        y_pred = eval_model.predict(X_test)
        
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"\n--- Performance Report for: {group} ---")
        print(f"  MAE (Mean Absolute Error): {mae:.2f} units")
        print(f"  R-squared (R²): {r2:.2f}")
        print("---------------------------------------------")

        plt.figure(figsize=(15, 5))
        plt.plot(y_test.index, y_test, label='Actual Data', color='orange')
        plt.plot(y_test.index, y_pred, label='Predictions', color='green', linestyle='--')
        plt.title(f'Forecast vs. Actuals for {group}')
        plt.legend()
        plt.show()

        # Retrain on the FULL dataset for production
        prod_model = xgb.XGBRegressor(**best_params)
        prod_model.fit(X, y, verbose=False)
        model_path = os.path.join(models_dir, f'{group}.joblib')
        joblib.dump(prod_model, model_path)

    print("\nAll models have been trained, evaluated, and saved for production.")