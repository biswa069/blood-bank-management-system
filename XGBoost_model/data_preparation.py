import pandas as pd
import numpy as np
import os

def create_dataset():
    """
    Generates a synthetic high-signal dataset representing daily blood demand.
    Includes trends, seasonality (weekly/yearly), and holiday effects.
    """
    print("Generating synthetic data...")
    
    # 1. Create Date Range
    date_rng = pd.date_range(start='2022-01-01', end='2025-08-27', freq='D', name='ds')
    df = pd.DataFrame(date_rng)
    
    # 2. Simulate Holidays (5% of days)
    df['is_holiday'] = 0
    np.random.seed(42)  # Fixed seed for reproducibility
    holiday_indices = np.random.choice(df.index, size=int(len(df)*0.05), replace=False)
    df.loc[holiday_indices, 'is_holiday'] = 1

    # 3. Define Base Demand for each Blood Group
    blood_groups = {
        'A_positive': 20, 'B_positive': 15, 'O_positive': 25, 'AB_positive': 5, 
        'A_negative': 4,  'B_negative': 3,  'O_negative': 8,  'AB_negative': 2
    }
    
    # 4. Generate Demand with Signal + Noise
    for group, base in blood_groups.items():
        # A slow upward trend over the years (population growth)
        trend = np.linspace(0, 0.5 * base, num=len(df))
        
        # Weekly pattern (e.g., fewer surgeries on weekends)
        weekly = -0.3 * base * np.sin(2 * np.pi * df['ds'].dt.dayofweek / 7)
        
        # Yearly pattern (seasonality, e.g., Dengue season)
        yearly = 0.4 * base * np.sin(2 * np.pi * df['ds'].dt.dayofyear / 365.25)
        
        # Holidays cause a spike in demand (accidents)
        holiday_effect = df['is_holiday'] * (0.5 * base) 
        
        # Random daily noise
        noise = np.random.normal(0, 0.05 * base, len(df))
        
        # Combine all components
        total_demand = base + trend + weekly + yearly + holiday_effect + noise
        
        # Ensure values are non-negative integers
        df[group] = total_demand.astype(int).clip(lower=0)
        
    return df

if __name__ == "__main__":
    # Define output filename
    output_file = 'daily_blood_demand1.csv'
    
    # Generate the dataframe
    df = create_dataset()
    
    # Save to CSV
    # index=False ensures we don't save the row numbers as a column
    df.to_csv(output_file, index=False)
    
    print("-" * 40)
    print(f"SUCCESS: Data saved to '{output_file}'")
    print(f"Total Rows: {len(df)}")
    print(f"Date Range: {df['ds'].min().date()} to {df['ds'].max().date()}")
    print("-" * 40)
    
    # Optional: Preview the first few rows
    print("\nFirst 5 rows:")
    print(df.head())