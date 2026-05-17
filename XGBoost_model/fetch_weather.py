import pandas as pd
import requests

def fetch_weather_data(start_date, end_date):
    # Bhubaneswar/Gothapatna coordinates
    lat = 20.2961
    lon = 85.8245
    
    # Open-Meteo Historical Weather API
    url = (
        f"https://archive-api.open-meteo.com/v1/archive"
        f"?latitude={lat}&longitude={lon}"
        f"&start_date={start_date}&end_date={end_date}"
        f"&daily=temperature_2m_max,precipitation_sum"
        f"&timezone=Asia%2FKolkata"
    )
    
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    
    daily = data['daily']
    df_weather = pd.DataFrame({
        'ds': daily['time'],
        'max_temp_c': daily['temperature_2m_max'],
        'rainfall_mm': daily['precipitation_sum']
    })
    
    # Clean up missing values (if any)
    df_weather['rainfall_mm'] = df_weather['rainfall_mm'].fillna(0)
    df_weather['max_temp_c'] = df_weather['max_temp_c'].ffill().bfill()
    
    return df_weather

if __name__ == "__main__":
    input_file = 'daily_blood_demand1.csv'
    output_file = 'daily_blood_demand_weather.csv'
    
    print(f"Loading {input_file}...")
    df_blood = pd.read_csv(input_file)
    
    start_date = df_blood['ds'].min()
    end_date = df_blood['ds'].max()
    
    print(f"Fetching historical weather data for Bhubaneswar from {start_date} to {end_date}...")
    df_weather = fetch_weather_data(start_date, end_date)
    
    print("Merging datasets...")
    df_merged = pd.merge(df_blood, df_weather, on='ds', how='left')
    
    # Fallback for dates beyond the archive API availability
    df_merged['rainfall_mm'] = df_merged['rainfall_mm'].fillna(0)
    df_merged['max_temp_c'] = df_merged['max_temp_c'].ffill().bfill()
    
    df_merged.to_csv(output_file, index=False)
    print(f"Success! Data saved to {output_file}")
