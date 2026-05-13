import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import HospitalNodeTracker from '../../components/FederatedLearning/HospitalNodeTracker';

const HospitalNodeUI = () => {
    const navigate = useNavigate();
    // The hospital node connects to the exact same WS to listen to global status!
    const { status, isConnected, sendMessage } = useWebSocket("ws://127.0.0.1:8000/ws/federated");
    const [datasetLoaded, setDatasetLoaded] = useState(false);
    const fileInputRef = useRef(null);

    // Dynamic UI states based on the WebSocket broadcast string
    const isTraining = status === "Training Local Models...";
    const isAggregating = status === "Aggregating Weights (Bagging)...";
    const isIdle = status === "Idle" || status.includes("Connected") || status === "Round Complete";

    const handleButtonClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!file.name.endsWith('.csv')) {
            alert("Please upload a valid CSV file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://127.0.0.1:8001/upload-dataset", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setDatasetLoaded(true);
                // Bi-directional WebSocket! Tell the Central Server we are ready.
                sendMessage({ action: "node_ready", node: `Hospital Node` });
            } else {
                alert("Failed to upload dataset to the Local Edge Agent.");
            }
        } catch (error) {
            console.error(error);
            alert("Error: Could not reach the Local Edge Agent. Is hospital_agent.py running on port 8001?");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "800px" }}>
            {/* Navigation Breadcrumb */}
            <button 
                onClick={() => navigate(-1)} 
                className="btn btn-link text-decoration-none text-secondary p-0 mb-4 d-flex align-items-center fw-bold transition-all"
                style={{ fontSize: "0.9rem" }}
                onMouseOver={(e) => e.currentTarget.classList.replace('text-secondary', 'text-dark')}
                onMouseOut={(e) => e.currentTarget.classList.replace('text-dark', 'text-secondary')}
            >
                <i className="fa-solid fa-arrow-left me-2"></i> Back to Navigation
            </button>

            <div className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h1 className="fw-bold text-dark">Hospital Node Interface</h1>
                    <p className="text-muted mb-0">Laptop 2/3: Local Isolated Training</p>
                </div>
                <div>
                    <span className={`badge rounded-pill p-2 px-3 border ${isConnected ? 'bg-success-subtle text-success border-success' : 'bg-danger-subtle text-danger border-danger'}`}>
                        <i className={`fa-solid fa-wifi me-2`}></i>
                        {isConnected ? "Connected to Server" : "Searching for Server..."}
                    </span>
                </div>
            </div>

            <div className="card shadow-lg border-0 text-center p-5">
                
                {/* Dataset Simulation Area */}
                <div className="mb-5">
                    <div 
                        className={`mx-auto rounded-circle d-flex align-items-center justify-content-center shadow-sm mb-4 transition-all`}
                        style={{ 
                            width: "100px", height: "100px", fontSize: "2.5rem",
                            backgroundColor: datasetLoaded ? "#e0f2fe" : "#f8f9fa",
                            color: datasetLoaded ? "#0ea5e9" : "#adb5bd",
                            border: `4px solid ${datasetLoaded ? '#bae6fd' : '#dee2e6'}`,
                            transition: "all 0.4s ease"
                        }}
                    >
                        <i className="fa-solid fa-database"></i>
                    </div>
                    
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleUpload} 
                        style={{ display: 'none' }} 
                        accept=".csv" 
                    />
                    
                    <button 
                        onClick={handleButtonClick}
                        disabled={datasetLoaded}
                        className={`btn fw-bold px-5 py-3 rounded-3 shadow-sm ${datasetLoaded ? 'btn-success text-white' : 'btn-dark text-white'}`}
                        style={{ transition: "all 0.3s ease" }}
                    >
                        {datasetLoaded ? <><i className="fa-solid fa-check me-2"></i> Dataset Loaded</> : <><i className="fa-solid fa-upload me-2"></i> Upload Local Dataset</>}
                    </button>
                    {datasetLoaded && <p className="text-muted small mt-3 fw-medium">Local patient records secured. Awaiting FL Round.</p>}
                </div>

                {/* --- ADVANCED VISUAL TRACKER --- */}
                {datasetLoaded && <HospitalNodeTracker status={status} />}

                {/* Event-Driven Status Bar */}
                <div className="pt-4 mt-4 border-top">
                    <h6 className="text-secondary fw-bold text-uppercase mb-4" style={{ letterSpacing: "2px", fontSize: "0.8rem" }}>Live Network Status</h6>
                    
                    <div 
                        className="p-5 rounded-4 border transition-all"
                        style={{
                            backgroundColor: isTraining ? "#fff7ed" : isAggregating ? "#faf5ff" : "#f8f9fa",
                            borderColor: isTraining ? "#fdba74" : isAggregating ? "#d8b4fe" : "#dee2e6",
                            transition: "all 0.5s ease"
                        }}
                    >
                        <div className="d-flex flex-column align-items-center">
                            
                            {/* State 1: Training */}
                            {isTraining && (
                                <>
                                    <i className="fa-solid fa-gears text-warning mb-3" style={{ fontSize: "4rem", animation: "spin 3s linear infinite" }}></i>
                                    <h3 className="fw-bold text-dark mb-2">Training Local Model...</h3>
                                    <p className="text-warning fw-medium mb-4">Computing XGBoost Trees based on local dataset</p>
                                    <div className="progress w-100" style={{ height: "10px" }}>
                                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-warning" role="progressbar" style={{ width: "100%" }}></div>
                                    </div>
                                </>
                            )}

                            {/* State 2: Transmitting/Aggregating */}
                            {isAggregating && (
                                <>
                                    <i className="fa-solid fa-cloud-arrow-up text-primary mb-3" style={{ fontSize: "4rem", animation: "bounce 2s infinite" }}></i>
                                    <h3 className="fw-bold text-dark mb-2">Transmitting Parameters...</h3>
                                    <p className="text-primary fw-medium mb-4">Sending XGBoost Booster to Central Server</p>
                                    <div className="progress w-100" style={{ height: "10px" }}>
                                        <div className="progress-bar progress-bar-striped progress-bar-animated bg-primary" role="progressbar" style={{ width: "100%" }}></div>
                                    </div>
                                </>
                            )}

                            {/* State 3: Idle/Waiting */}
                            {isIdle && (
                                <>
                                    <i className="fa-regular fa-clock text-secondary mb-3" style={{ fontSize: "4rem" }}></i>
                                    <h3 className="fw-bold text-secondary mb-2">{status}</h3>
                                    <p className="text-muted mb-0">Waiting for Central Server to initiate the training round.</p>
                                </>
                            )}

                        </div>
                    </div>
                </div>

            </div>

            <style>
                {`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
                .bg-success-subtle { background-color: #d1e7dd !important; }
                .bg-danger-subtle { background-color: #f8d7da !important; }
                `}
            </style>
        </div>
    );
};

export default HospitalNodeUI;
