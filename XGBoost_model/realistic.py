import pandas as pd
import numpy as np
import datetime

def generate_realistic_dataset(output_filepath='realistic_donor_dataset.csv'):
    """
    Generates a realistic raw dataset of individual donation events where multiple
    donations of different blood groups can occur on the same day.
    """
    print("Starting generation of realistic donation data...")
    
    # --- 1. Define Date Range ---
    start_date = '2022-01-01'
    end_date = datetime.date.today().strftime('%Y-%m-%d') # Use today's date
    date_rng = pd.date_range(start=start_date, end=end_date, freq='D')
    
    # --- 2. Define Blood Group Distribution (real-world probabilities) ---
    blood_groups_dist = {
        'O_positive': 0.38, 'A_positive': 0.34, 'B_positive': 0.09, 'O_negative': 0.07,
        'A_negative': 0.06, 'AB_positive': 0.03, 'B_negative': 0.02, 'AB_negative': 0.01
    }
    groups = list(blood_groups_dist.keys())
    probabilities = list(blood_groups_dist.values())
    
    all_donations = []
    
    # --- 3. Simulate Daily Donations ---
    for date in date_rng:
        # Simulate more donations on weekends (Saturday=5, Sunday=6)
        if date.dayofweek >= 5:
            num_donations = np.random.randint(40, 80) # Higher traffic on weekends
        else:
            num_donations = np.random.randint(15, 40) # Normal weekday traffic
            
        # For each donation event on that day, assign a blood group
        for _ in range(num_donations):
            donated_group = np.random.choice(groups, p=probabilities)
            all_donations.append([date, donated_group])

    # --- 4. Create and Save the DataFrame ---
    final_df = pd.DataFrame(all_donations, columns=['donation_dates', 'blood_groups'])
    
    # Convert blood group format to match your app (e.g., 'O_positive' -> 'O+')
    final_df['blood_groups'] = final_df['blood_groups'].str.replace('-', '+').str.replace('-', '-')
    
    final_df.to_csv(output_filepath, index=False)
    
    print(f"\nSuccessfully generated {len(final_df)} realistic donation records.")
    print(f"Dataset saved to '{output_filepath}'")
    print("Here are the first 5 rows:")
    print(final_df.head())
    print("\nExample of multiple donations on the same day:")
    print(final_df[final_df['donation_dates'] == final_df['donation_dates'].iloc[0]])

if __name__ == "__main__":
    generate_realistic_dataset()