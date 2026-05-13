import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from '../../hooks/useWebSocket';
import AdminGlobalStatus from '../../components/FederatedLearning/AdminGlobalStatus';

const AdminFLDashboard = () => {
    const navigate = useNavigate();
    const { messages, status, isConnected, mape, accuracy } = useWebSocket("ws://127.0.0.1:8000/ws/federated");
    const [isTriggering, setIsTriggering] = useState(false);

    const handleStartFLRound = async () => {
        setIsTriggering(true);
        try {
            await fetch("http://127.0.0.1:8000/api/fl/trigger", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "start" })
            });
        } catch (error) {
            console.error("Failed to trigger FL round:", error);
        }
        setIsTriggering(false);
    };

    const isIdle = status === "Idle" || status.includes("Connected") || status === "Round Complete";

    return (
        <div className="container mt-5" style={{ maxWidth: "900px" }}>
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

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="fw-bold text-dark">Central Server Command Center</h1>
                    <p className="text-muted mb-0">Laptop 1: Global Model Aggregation (No Local Data)</p>
                </div>
                <div>
                    <span className={`badge rounded-pill p-2 px-3 border ${isConnected ? 'bg-success-subtle text-success border-success' : 'bg-danger-subtle text-danger border-danger'}`}>
                        {isConnected ? (
                            <><i className="fa-solid fa-circle text-success me-2" style={{animation: "pulse 2s infinite"}}></i> Network Online</>
                        ) : (
                            <><i className="fa-solid fa-circle text-danger me-2"></i> Network Offline</>
                        )}
                    </span>
                </div>
            </div>

            <div className="card shadow-sm border-0 mb-4">
                <div className="card-body p-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h4 className="fw-bold text-dark mb-1">Global Training Round</h4>
                        <div className="d-flex align-items-center mt-2">
                            <span className="text-muted me-2">Network Status:</span>
                            <span className="badge bg-primary-subtle text-primary border border-primary px-2 py-1">{status}</span>
                        </div>
                    </div>
                    <button 
                        onClick={handleStartFLRound}
                        disabled={!isConnected || isTriggering || !isIdle}
                        className="btn btn-dark fw-bold px-4 py-2 shadow"
                    >
                        <i className="fa-solid fa-play me-2"></i> Start Global FL Round
                    </button>
                </div>
            </div>

            {/* --- ADVANCED VISUAL STATUS CARD --- */}
            <AdminGlobalStatus status={status} mape={mape} accuracy={accuracy} />

            <div className="card shadow border-0 bg-dark text-success" style={{ height: "400px" }}>
                <div className="card-header bg-dark border-secondary d-flex justify-content-between align-items-center">
                    <div>
                        <i className="fa-solid fa-terminal text-secondary me-2"></i>
                        <span className="text-light fw-bold text-uppercase" style={{fontSize: "0.8rem", letterSpacing: "1px"}}>Live Server Terminal</span>
                    </div>
                    <span className="text-secondary" style={{fontSize: "0.8rem"}}>Listening on 0.0.0.0:8080...</span>
                </div>
                <div className="card-body overflow-auto" style={{ fontFamily: "monospace", fontSize: "0.9rem" }}>
                    {messages.length === 0 ? (
                        <p className="text-secondary fst-italic">Waiting for node events...</p>
                    ) : (
                        messages.map((msg, idx) => (
                            <div key={idx} className="d-flex mb-1">
                                <span className="text-secondary me-3">[{msg.time}]</span>
                                <span className={msg.text.includes("Successfully") ? "text-info fw-bold" : ""}>
                                    {msg.text}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Simple CSS animation for the pulse effect */}
            <style>
                {`
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.5; }
                    100% { opacity: 1; }
                }
                .bg-success-subtle { background-color: #d1e7dd !important; }
                .text-success { color: #198754 !important; }
                .bg-danger-subtle { background-color: #f8d7da !important; }
                .text-danger { color: #dc3545 !important; }
                .bg-primary-subtle { background-color: #cfe2ff !important; }
                .text-primary { color: #0d6efd !important; }
                `}
            </style>
        </div>
    );
};

export default AdminFLDashboard;
