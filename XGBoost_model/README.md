# XGBoost Model Microservice

This directory contains the Python microservice for the Blood Bank Management System, utilizing XGBoost, Prophet, and FastAPI for demand forecasting and federated learning.

## Setup Instructions

### 1. Create a Virtual Environment
It is recommended to use a virtual environment to manage dependencies. Run the following command in this directory:
```bash
python -m venv venv
```

### 2. Activate the Virtual Environment
Activate the virtual environment using the appropriate command for your operating system:

**On Windows:**
```cmd
venv\Scripts\activate
```

**On macOS and Linux:**
```bash
source venv/bin/activate
```

### 3. Install Dependencies
Once the virtual environment is activated, install the required packages using the `requirements.txt` file:
```bash
pip install -r requirements.txt
```

### 4. Run the FastAPI Server
To start the FastAPI microservice, run the following command:
```bash
uvicorn main:app --reload
```

The API will be available at `http://127.0.0.1:8000`. You can access the interactive API documentation (Swagger UI) at `http://127.0.0.1:8000/docs`.
