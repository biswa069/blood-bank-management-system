import pandas as pd
import numpy as np

def generate_hospital_data(filename="local_dataset.csv", is_trauma_center=False):
    """
    Generates a highly realistic synthetic 5-year daily blood demand dataset for a hospital node.
    """
    print(f"Generating synthetic dataset: {filename}")
    print(f"Configuration: is_trauma_center = {is_trauma_center}")

    # 1. Generate Date Range (2022-01-01 to 2027-12-31)
    dates = pd.date_range(start='2022-01-01', end='2027-12-31', freq='D')
    num_days = len(dates)
    
    df = pd.DataFrame({'ds': dates})
    
    # 2. Add Holidays
    holidays_list = [
        '2022-01-26', '2022-08-15', '2022-10-02', '2022-12-25',
        '2023-01-26', '2023-08-15', '2023-10-02', '2023-12-25',
        '2024-01-26', '2024-08-15', '2024-10-02', '2024-12-25',
        '2025-01-26', '2025-08-15', '2025-10-02', '2025-12-25',
        '2026-01-26', '2026-08-15', '2026-10-02', '2026-12-25',
        '2027-01-26', '2027-08-15', '2027-10-02', '2027-12-25'
    ]
    holidays_dates = pd.to_datetime(holidays_list)
    df['is_holiday'] = df['ds'].isin(holidays_dates).astype(int)

    # 3. Define Baseline Blood Group Distributions
    # Dictionary format: 'Blood Group': (baseline_mean, baseline_std)
    baselines = {
        'O_positive': (12.0, 3.0),
        'A_positive': (10.0, 2.5),
        'B_positive': (9.0, 2.5),
        'AB_positive': (3.0, 1.0),
        'O_negative': (4.0, 1.5), # Universal donor (trauma)
        'A_negative': (2.0, 1.0),
        'B_negative': (1.5, 0.8),
        'AB_negative': (1.0, 0.5)
    }

    # Adjust O- baseline if Trauma Center
    if is_trauma_center:
        baselines['O_negative'] = (8.0, 3.5)
        print("Trauma Center logic activated: O- baseline and volatility doubled.")

    # 4. Generate Mathematical Curves per Blood Group
    for group, (mean, std) in baselines.items():
        # A. Base Gaussian Noise
        base_demand = np.random.normal(mean, std, num_days)
        
        # B. Weekly Seasonality (sine wave)
        # Weekends (days 5, 6) drop in routine demand
        day_of_week = df['ds'].dt.dayofweek
        weekly_wave = np.cos(2 * np.pi * day_of_week / 7) * (mean * 0.2) # 20% fluctuation
        
        # C. Holiday Effect
        # Routine surgeries drop on holidays, causing general demand to drop
        # But O- (trauma blood) spikes because accidents happen on holidays.
        holiday_effect = np.zeros(num_days)
        if group == 'O_negative':
            holiday_effect = df['is_holiday'] * (mean * 0.8) # 80% spike on holidays
        else:
            holiday_effect = df['is_holiday'] * (-mean * 0.4) # 40% drop on holidays
            
        # D. Combine logic mathematically
        total_demand = base_demand + weekly_wave + holiday_effect
        
        # E. Ensure physical realism (No negative blood, round to integer units)
        total_demand = np.clip(np.round(total_demand), a_min=0, a_max=None)
        
        # Assign to dataframe
        df[group] = total_demand.astype(int)

    # 5. Save output
    df.to_csv(filename, index=False)
    print(f"Generated {num_days} records with {len(baselines)} blood groups.")
    print(f"Saved successfully to {filename}")

if __name__ == "__main__":
    # Generate standard hospital data
    generate_hospital_data("hospital_a_data.csv", is_trauma_center=False)
    
    # Generate trauma center data for Hospital B to create realistic variance in the FL network
    generate_hospital_data("hospital_b_trauma_data.csv", is_trauma_center=True)
