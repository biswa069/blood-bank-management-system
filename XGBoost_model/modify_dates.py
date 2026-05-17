import pandas as pd
import numpy as np

def create_new_date_column(input_filepath='blood_donor_dataset.csv.xlsm', 
                           output_filepath='blood_donor_dataset_new_dates.csv'):
    """
    Reads the original Excel donor dataset and replaces the 'Donation Date'
    column with a new, continuous date range.
    """
    try:
        df = pd.read_excel(input_filepath, engine='openpyxl')
        print(f"Original dataset loaded with {len(df)} rows.")

        start_date = '2022-08-28'
        new_dates = pd.date_range(start=start_date, periods=len(df), freq='D')

        date_col = 'donation_dates'
        if date_col not in df.columns:
            raise ValueError(f"'{date_col}' column not found in the dataset.")
        
        df[date_col] = new_dates
        
        df.to_csv(output_filepath, index=False)
        
        print(f"\nSuccessfully created new date column and saved to '{output_filepath}'")
        print("Here are the first 5 rows of the updated dataset:")
        print(df.head())
        
    except Exception as e:
        print(f"\nAn error occurred: {e}")

if __name__ == "__main__":
    create_new_date_column()