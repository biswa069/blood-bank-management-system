import React, { useEffect, useState } from 'react';

const HospitalNodeTracker = ({ status }) => {
    const [localLoss, setLocalLoss] = useState(1.0);
    
    let currentStep = 0;
    if (status.includes("Downloading")) currentStep = 1;
    if (status.includes("Training")) currentStep = 2;
    if (status.includes("Transmitting")) currentStep = 3;
    if (status.includes("Aggregating") || status.includes("Complete")) currentStep = 4;

    // Simulate loss curve mathematically during step 2
    useEffect(() => {
        let interval;
        if (currentStep === 2) {
            setLocalLoss(1.0); // Reset
            let current = 1.0;
            interval = setInterval(() => {
                current = current * 0.85; // Exponential decay
                if (current < 0.1) current = 0.12;
                setLocalLoss(current);
            }, 500);
        } else if (currentStep > 2) {
            setLocalLoss(0.12);
        }
        return () => clearInterval(interval);
    }, [currentStep]);

    const steps = [
        { id: 1, name: "Download Global Weights", icon: "fa-cloud-arrow-down" },
        { id: 2, name: "Train Local Epochs", icon: "fa-brain" },
        { id: 3, name: "Transmit Gradients", icon: "fa-paper-plane" }
    ];

    return (
        <div className="card shadow-sm border-0 bg-light p-4 rounded-4 mt-4">
            <h6 className="text-secondary fw-bold text-uppercase mb-4 text-center" style={{ letterSpacing: "1px", fontSize: "0.8rem" }}>Mathematical Proof Pipeline</h6>
            
            <div className="position-relative d-flex justify-content-between align-items-center mb-5 px-3">
                {/* Connecting Line */}
                <div className="position-absolute" style={{ top: "50%", left: "10%", right: "10%", height: "3px", backgroundColor: "#e9ecef", zIndex: 1, transform: "translateY(-50%)" }}>
                    <div 
                        className="bg-primary" 
                        style={{ 
                            height: "100%", 
                            width: currentStep === 0 ? "0%" : currentStep === 1 ? "0%" : currentStep === 2 ? "50%" : "100%",
                            transition: "width 1s ease-in-out" 
                        }}
                    ></div>
                </div>

                {steps.map((step, idx) => {
                    const isActive = currentStep === step.id;
                    const isCompleted = currentStep > step.id;
                    
                    let bgColor = "#f8f9fa";
                    let textColor = "#adb5bd";
                    let borderColor = "#dee2e6";
                    let icon = step.icon;
                    let animation = "";

                    if (isCompleted) {
                        bgColor = "#d1e7dd";
                        textColor = "#198754";
                        borderColor = "#198754";
                        icon = "fa-check"; // Replace with checkmark
                    } else if (isActive) {
                        bgColor = "#cfe2ff";
                        textColor = "#0d6efd";
                        borderColor = "#0d6efd";
                        animation = "pulse-ring 2s infinite";
                    }

                    return (
                        <div key={step.id} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 2 }}>
                            <div 
                                className="rounded-circle d-flex justify-content-center align-items-center bg-white"
                                style={{
                                    width: "60px", height: "60px", fontSize: "1.5rem",
                                    backgroundColor: bgColor, color: textColor,
                                    border: `3px solid ${borderColor}`,
                                    animation: animation,
                                    transition: "all 0.3s ease",
                                    boxShadow: isActive ? "0 0 0 5px rgba(13, 110, 253, 0.2)" : "none"
                                }}
                            >
                                <i className={`fa-solid ${icon}`}></i>
                            </div>
                            <span className={`mt-3 fw-bold text-center ${isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-muted'}`} style={{ fontSize: "0.85rem", width: "100px" }}>
                                {step.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Local Loss Simulator */}
            <div className={`transition-all overflow-hidden ${currentStep >= 2 ? 'opacity-100' : 'opacity-0'}`} style={{ height: currentStep >= 2 ? 'auto' : '0' }}>
                <div className="bg-dark rounded-3 p-3 text-light font-monospace">
                    <div className="d-flex justify-content-between mb-2" style={{ fontSize: "0.85rem" }}>
                        <span>XGBoost Objective: reg:squarederror</span>
                        <span className={localLoss < 0.2 ? "text-success" : "text-warning"}>Loss: {localLoss.toFixed(4)}</span>
                    </div>
                    <div className="progress" style={{ height: "6px", backgroundColor: "#343a40" }}>
                        <div 
                            className={`progress-bar ${localLoss < 0.2 ? 'bg-success' : 'bg-warning'}`} 
                            role="progressbar" 
                            style={{ width: `${Math.max(10, localLoss * 100)}%`, transition: "width 0.5s ease" }}
                        ></div>
                    </div>
                </div>
            </div>

            <style>
                {`
                @keyframes pulse-ring {
                    0% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(13, 110, 253, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(13, 110, 253, 0); }
                }
                .opacity-100 { opacity: 1; transition: opacity 0.5s ease; }
                .opacity-0 { opacity: 0; transition: opacity 0.5s ease; }
                `}
            </style>
        </div>
    );
};

export default HospitalNodeTracker;
