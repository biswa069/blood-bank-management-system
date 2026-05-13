import React from 'react';

const AdminGlobalStatus = ({ status, mape, accuracy }) => {
    // Determine the state of the round
    const isRoundComplete = status === "Round Complete";
    const isTraining = status !== "Idle" && !isRoundComplete;

    // Simulate Node Statuses based on Global Status
    let nodeAStatus = "Awaiting Ping...";
    let nodeBStatus = "Awaiting Ping...";
    let nodeABadge = "bg-secondary";
    let nodeBBadge = "bg-secondary";

    if (status.includes("Downloading")) {
        nodeAStatus = "Downloading Params"; nodeABadge = "bg-info";
        nodeBStatus = "Downloading Params"; nodeBBadge = "bg-info";
    } else if (status.includes("Training")) {
        nodeAStatus = "Computing Gradients..."; nodeABadge = "bg-warning text-dark";
        nodeBStatus = "Computing Gradients..."; nodeBBadge = "bg-warning text-dark";
    } else if (status.includes("Transmitting")) {
        nodeAStatus = "Uploading (1.2 MB)"; nodeABadge = "bg-primary";
        nodeBStatus = "Uploading (1.2 MB)"; nodeBBadge = "bg-primary";
    } else if (status.includes("Aggregating") || isRoundComplete) {
        nodeAStatus = "Synced"; nodeABadge = "bg-success";
        nodeBStatus = "Synced"; nodeBBadge = "bg-success";
    }

    // Determine Metrics Display
    const displayMape = mape ? mape.toFixed(1) : "88.0";
    const displayAccuracy = accuracy ? accuracy.toFixed(1) : "12.0";
    
    // We want MAPE to drop and be green, so lower is better.
    // If it's the 88% baseline, it's red. If it dropped dynamically, it's green.
    const metricColor = isRoundComplete ? "text-success" : "text-danger";

    return (
        <div className="card shadow-lg border-0 mb-4 rounded-4 overflow-hidden">
            <div className="card-header bg-dark text-white p-3 border-0 d-flex justify-content-between align-items-center">
                <h6 className="mb-0 fw-bold"><i className="fa-solid fa-chart-line me-2"></i> Real-Time Global Performance</h6>
                {isTraining && <span className="badge bg-danger pulse-badge">LIVE DEMO RUNNING</span>}
            </div>
            
            <div className="card-body p-4 bg-light">
                <div className="row">
                    {/* Accuracy Metrics Redesigned for MAPE */}
                    <div className="col-md-5 border-end border-2 border-white d-flex flex-column justify-content-center align-items-center text-center">
                        <h6 className="text-muted fw-bold text-uppercase" style={{ letterSpacing: "1px", fontSize: "0.75rem" }}>Global Model Error (MAPE)</h6>
                        <h1 className={`display-3 fw-bolder ${metricColor} mb-0`} style={{ transition: "color 1s ease" }}>
                            {displayMape}%
                        </h1>
                        <p className="text-muted small mt-1 fw-bold">
                            Forecast Accuracy: {displayAccuracy}%
                        </p>
                        
                        {isRoundComplete ? (
                            <div className="badge bg-success-subtle text-success p-2 px-3 rounded-pill mt-2 fade-in">
                                <i className="fa-solid fa-arrow-trend-down me-2"></i>
                                Error Significantly Reduced
                            </div>
                        ) : (
                            <div className="badge bg-danger-subtle text-danger p-2 px-3 rounded-pill mt-2">
                                Baseline Out-of-Sync
                            </div>
                        )}
                    </div>

                    {/* Node Tracking List */}
                    <div className="col-md-7 ps-4">
                        <h6 className="text-muted fw-bold text-uppercase mb-3" style={{ letterSpacing: "1px", fontSize: "0.75rem" }}>Active Federated Nodes</h6>
                        
                        <div className="bg-white rounded-3 shadow-sm p-3 mb-3 border border-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
                                        <i className="fa-solid fa-laptop-medical text-primary"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold text-dark">Hospital Node A</h6>
                                        <small className="text-muted font-monospace">192.168.1.101</small>
                                    </div>
                                </div>
                                <span className={`badge ${nodeABadge} rounded-pill px-3 py-2 transition-all`}>
                                    {nodeAStatus}
                                </span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3 shadow-sm p-3 border border-light">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center">
                                    <div className="bg-light rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: "40px", height: "40px" }}>
                                        <i className="fa-solid fa-laptop-medical text-primary"></i>
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold text-dark">Hospital Node B</h6>
                                        <small className="text-muted font-monospace">192.168.1.102</small>
                                    </div>
                                </div>
                                <span className={`badge ${nodeBBadge} rounded-pill px-3 py-2 transition-all`}>
                                    {nodeBStatus}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>
                {`
                .pulse-badge { animation: pulse-red 2s infinite; }
                @keyframes pulse-red {
                    0% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(220, 53, 69, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(220, 53, 69, 0); }
                }
                .fade-in { animation: fadeIn 1s; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                .transition-all { transition: all 0.3s ease; }
                `}
            </style>
        </div>
    );
};

export default AdminGlobalStatus;
