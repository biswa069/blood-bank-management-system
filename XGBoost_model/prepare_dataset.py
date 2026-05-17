import pandas as pd

def prepare_real_dataset(input_filepath='realistic_donor_dataset.csv', 
                         output_filepath='daily_blood_demand.csv'):
    """
    Reads the processed donor dataset, calculates daily demand for each blood group,
    and saves it in a model-ready time-series format.
    """
    try:
        df = pd.read_csv(input_filepath)
        print("Processed dataset with new dates loaded successfully.")

        date_col = 'donation_dates'
        blood_group_col = 'blood_groups'
        
        df['ds'] = pd.to_datetime(df[date_col])

        daily_demand = df.groupby([df['ds'].dt.date, blood_group_col]).size().reset_index(name='demand')
        daily_demand['ds'] = pd.to_datetime(daily_demand['ds'])

        demand_pivot = daily_demand.pivot_table(index='ds', columns=blood_group_col, values='demand')

        full_date_range = pd.date_range(start=demand_pivot.index.min(), end=demand_pivot.index.max(), freq='D')
        model_ready_df = demand_pivot.reindex(full_date_range).fillna(0).astype(int)
        
        model_ready_df.reset_index(inplace=True)
        model_ready_df.rename(columns={'index': 'ds'}, inplace=True)
        
        model_ready_df.to_csv(output_filepath, index=False)
        
        print(f"\nSuccessfully created model-ready data and saved it to '{output_filepath}'")
        
    except Exception as e:
        print(f"\nAn error occurred: {e}")

if __name__ == "__main__":
    prepare_real_dataset()