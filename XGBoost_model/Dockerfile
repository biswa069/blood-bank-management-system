# Use a lightweight Python image
FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies required for XGBoost and Flower
RUN apt-get update && apt-get install -y \
    build-essential \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy only the execution scripts (NOT the data)
COPY federated_client.py .
COPY hospital_agent.py .

# Expose port for local CSV uploads (if using the edge agent API)
EXPOSE 8001

# Start the federated client script
CMD ["python", "federated_client.py"]
