# 🩸 AI-Enabled Federated Learning Blood Bank Management System
**Enterprise-grade, privacy-first healthcare logistics powered by MERN and Edge XGBoost.**

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## Overview

Managing blood bank inventory is fundamentally a perishable asset routing problem. Platelets expire in five days, and red blood cells degrade after 42. Current healthcare supply chains operate on reactive, threshold-based alerts that guarantee temporary shortages due to the lag time in donor recruitment. We eliminated this latency by shifting the entire supply chain from a reactive model to a predictive one.

We built a Hybrid Edge-Cloud platform to solve this. We decoupled the management plane (MERN stack in the cloud) from the machine learning execution plane (Python/FastAPI running on local hospital hardware). This architecture allows global visibility for administrators while ensuring raw, sensitive patient datasets never leave the physical hospital premises, fully satisfying HIPAA data compliance requirements.

## System Architecture & Data Flow

Our architecture strictly isolates web traffic from CPU-bound mathematical operations to prevent API thread blocking. 

1. **The Cloud Plane (Azure & Vercel):** Hosts the React.js dashboard and Node.js/Express API. Handles JWT authentication, real-time MongoDB aggregations, and CRUD operations.
2. **The Secure Tunnel (Ngrok):** Bridges the public cloud to the local network via a persistent TCP tunnel.
3. **The Edge Plane (Dockerized Laptops):** Physical hospital nodes run FastAPI and Flower frameworks natively. They execute XGBoost training loops against local CSV files mounted as read-only Docker volumes. 
4. **Data Flow:** The React UI triggers a "Start FL Round" command via the Azure Node.js proxy, which routes down the Ngrok tunnel to the local FastAPI server. Local nodes train their models, aggregate the gradients, and push the updated accuracy metrics back up to the React dashboard instantly via WebSockets.

## Machine Learning Implementation

### XGBoost Time-Series Architecture
Time-series forecasting typically fails in healthcare due to non-linear environmental factors. To map weekend trauma surges and holiday donation drops, we utilized XGBoost. We engineered the features by converting standard chronological timestamps into continuous cyclical values (sine and cosine transformations). This forces the model to understand the temporal proximity of December 31st to January 1st, a critical feature for mapping annual disease cycles that standard integers fail to capture.

### Solving for Zero-Inflated Data (Rare Blood Groups)
Predicting high-volume blood types (O+) is trivial; mapping rare groups (AB-) is mathematically unstable. During evaluation, standard Mean Absolute Percentage Error (MAPE) calculations crashed our pipeline with divide-by-zero errors because the actual daily demand for rare groups frequently hits zero. We mathematically stabilized the evaluation loop by injecting a small epsilon (`1e-8`) into the denominator, allowing us to successfully tune the model and achieve an $R^2$ variance capture above 0.90 across all groups.

### Federated Learning Privacy Protocols
Raw transaction data is a massive liability. We containerized the ML pipeline and mounted `local_dataset.csv` exclusively as a read-only volume inside the local edge containers. The XGBoost model trains entirely on-premise. The nodes only communicate mathematical gradients—the learned intelligence—back to the central aggregator. Raw data never touches the network interface.

## Key Features

* **The Digital Twin Disaster Simulator:** An interactive sandbox built into the Admin UI. Hospital directors can manually inject exogenous stress variables (e.g., Highway Closures, Extreme Weather) into the XGBoost model to proactively stress-test their supply chain and observe the simulated deficit cascade in real-time.
* **Targeted Email Broadcasting:** We replaced generic mass spam with algorithmic targeting. The FastAPI prediction engine alerts the Node API to dispatch highly targeted emails *only* to eligible donors matching the specific blood group forecasted to hit a critical deficit within a 7-day window.
* **Real-Time Analytics Dashboard:** Bypasses standard pagination limits by utilizing concurrent MongoDB aggregation pipelines. We display exact, full-collection calculations for "Total Units" and "Expiring Soon" with sub-millisecond database response times.
* **FEFO Routing Logic:** We implemented strict First-Expired, First-Out deduction logic. During hospital-to-hospital transfers, the database dynamically sorts and zeroes out the oldest available blood bags first, actively eliminating biological waste.

## Local Setup & Deployment Guide

Follow these sequential steps to boot the entire Hybrid Edge-Cloud network locally.

### 1. Boot the Cloud Services (Node.js & React)
```bash
# Install root and client dependencies
npm install
cd client && npm install && cd ..

# Boot both the Node API and React Dashboard concurrently
npm run dev
```

### 2. Boot the Central FL Server (Laptop 1)
```bash
# Navigate to the ML directory and install dependencies
cd XGBoost_model
pip install -r requirements.txt

# Start the FastAPI Hub
uvicorn main:app --reload --port 8000
```

### 3. Establish the Cloud-to-Edge Bridge
```bash
# In a new terminal, open a secure tunnel to your local FastAPI server
ngrok http 8000
```
*Note: Copy the generated `https://<id>.ngrok.app` URL and update your Node.js `.env` file (`NGROK_FL_SERVER_URL=<url>`) and React `.env` file (`REACT_APP_FL_WEBSOCKET_URL=wss://<id>.ngrok.app/ws`). Restart `npm run dev`.*

### 4. Ignite the Edge Nodes (Laptops 2 & 3)
```bash
cd XGBoost_model

# Ensure local_dataset.csv is present in this directory
# Start the Dockerized hospital node
docker-compose up -d

# View the training logs in real-time
docker logs -f hospital_edge_node
```

## Project Structure

```text
blood-bank-management-system/
├── client/                     # React.js Frontend (Redux, Bootstrap)
│   ├── src/
│   │   ├── components/         # Reusable UI cards, tables, and forms
│   │   ├── pages/              # Admin, Hospital, and Donor Dashboard views
│   │   ├── redux/              # Centralized state management
│   │   └── services/           # Axios API routing instances
├── controllers/                # Node.js route logic (Inventory, Auth, Analytics)
├── models/                     # Mongoose Schemas (FEFO logic integrated)
├── routes/                     # Express.js API endpoints
├── XGBoost_model/              # Python ML Execution Plane
│   ├── federated_client.py     # Local Flower client logic
│   ├── federated_server.py     # Aggregation algorithms
│   ├── main.py                 # FastAPI Hub & WebSocket broadcaster
│   ├── Dockerfile              # Container spec for edge deployment
│   └── docker-compose.yml      # Orchestrates read-only dataset mounting
└── server.js                   # Node.js Entry Point
```
