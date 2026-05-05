import React from 'react';

const CommandCenterKPI = ({ currentStock = 85, predictedDemand = 145, expiringUnits = 30, timeSpan = 7 }) => {
    
    // Logic for AI Status & Action
    let statusText = "Stock Stable";
    let statusColor = "text-emerald-600";
    let bgPulse = "bg-emerald-100";
    let icon = "fa-shield-check";
    let hexColor = "#059669";
    let bgHex = "#d1fae5";
    let actionButton = null;

    if (currentStock < predictedDemand) {
        statusText = "Deficit Risk";
        statusColor = "text-red-600";
        bgPulse = "bg-red-100";
        icon = "fa-triangle-exclamation";
        hexColor = "#dc2626";
        bgHex = "#fee2e2";
        actionButton = (
            <button className="btn btn-sm text-white mt-2" style={{ backgroundColor: hexColor, borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                <i className="fa-solid fa-plus me-1"></i> Host Blood Drive
            </button>
        );
    } else if (expiringUnits > predictedDemand) {
        statusText = "Wastage Risk";
        statusColor = "text-amber-500";
        bgPulse = "bg-amber-100";
        icon = "fa-truck-fast";
        hexColor = "#f59e0b";
        bgHex = "#fef3c7";
        actionButton = (
            <button className="btn btn-sm text-white mt-2" style={{ backgroundColor: hexColor, borderRadius: '6px', fontSize: '12px', fontWeight: '600' }}>
                <i className="fa-solid fa-paper-plane me-1"></i> Initiate Transfers
            </button>
        );
    }

    return (
        <div className="row g-3 mb-5">
            {/* Card 1: Current Usable Stock */}
            <div className="col-xl-3 col-md-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 d-flex align-items-center h-100" style={{ transition: 'transform 0.2s', cursor: 'pointer', borderRadius: '12px' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: '56px', height: '56px', backgroundColor: '#e0e7ff', flexShrink: 0 }}>
                        <i className="fa-solid fa-droplet fs-4" style={{ color: '#4f46e5' }}></i>
                    </div>
                    <div>
                        <p className="text-muted mb-1 fw-medium" style={{ fontSize: '13px' }}>Current Usable Stock</p>
                        <h2 className="mb-0 fw-bold text-gray-800">{currentStock} <span className="fs-6 text-muted fw-normal">Units</span></h2>
                    </div>
                </div>
            </div>

            {/* Card 2: Dynamic Predicted Demand */}
            <div className="col-xl-3 col-md-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 d-flex align-items-center h-100" style={{ transition: 'transform 0.2s', cursor: 'pointer', borderRadius: '12px' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: '56px', height: '56px', backgroundColor: '#dbeafe', flexShrink: 0 }}>
                        <i className="fa-solid fa-arrow-trend-up fs-4" style={{ color: '#2563eb' }}></i>
                    </div>
                    <div>
                        <p className="text-muted mb-1 fw-medium" style={{ fontSize: '13px' }}>{timeSpan}-Day Predicted Demand</p>
                        <h2 className="mb-0 fw-bold text-gray-800">{predictedDemand} <span className="fs-6 text-muted fw-normal">Units</span></h2>
                    </div>
                </div>
            </div>

            {/* Card 3: Dynamic Expiring Stock */}
            <div className="col-xl-3 col-md-6">
                <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 d-flex align-items-center h-100" style={{ transition: 'transform 0.2s', cursor: 'pointer', borderRadius: '12px' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="rounded-circle d-flex justify-content-center align-items-center me-3" style={{ width: '56px', height: '56px', backgroundColor: '#ffedd5', flexShrink: 0 }}>
                        <i className="fa-solid fa-hourglass-half fs-4" style={{ color: '#ea580c' }}></i>
                    </div>
                    <div>
                        <p className="text-muted mb-1 fw-medium" style={{ fontSize: '13px' }}>{timeSpan}-Day Expiring Stock</p>
                        <h2 className="mb-0 fw-bold text-gray-800">{expiringUnits} <span className="fs-6 text-muted fw-normal">Units</span></h2>
                    </div>
                </div>
            </div>

            {/* Card 4: AI Status & Action */}
            <div className="col-xl-3 col-md-6">
                <div className="bg-white shadow-sm p-4 h-100" style={{ transition: 'transform 0.2s', cursor: 'pointer', borderRadius: '12px', border: `2px solid ${bgHex}` }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div className="d-flex align-items-start">
                        <div className={`rounded-circle d-flex justify-content-center align-items-center me-3`} style={{ width: '56px', height: '56px', backgroundColor: bgHex, flexShrink: 0 }}>
                            <i className={`fa-solid ${icon} fs-4`} style={{ color: hexColor }}></i>
                        </div>
                        <div>
                            <p className="text-muted mb-1 fw-medium" style={{ fontSize: '13px' }}>AI Recommendation</p>
                            <h4 className={`mb-0 fw-bold`} style={{ fontSize: '18px', color: hexColor }}>{statusText}</h4>
                            {actionButton}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommandCenterKPI;
