import React, { useState, useEffect } from "react";
import API from "../../services/API";

const ExpiringAlerts = () => {
    const [expiringData, setExpiringData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchExpiringInventory = async () => {
        try {
            const { data } = await API.get("/inventory/expiring-soon");
            if (data?.success) {
                setExpiringData(data.data);
            }
        } catch (error) {
            console.error("Error fetching expiring inventory", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExpiringInventory();
    }, []);

    if (loading) {
        return (
            <div className="card shadow-sm p-4 text-center mt-4">
                <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Checking blood expiry status...</p>
            </div>
        );
    }

    if (expiringData.length === 0) {
        return (
            <div className="alert alert-success mt-4 d-flex align-items-center" role="alert">
                <i className="fa-solid fa-circle-check fs-4 me-3"></i>
                <div>
                    <strong>All stock is healthy!</strong> No blood units are expiring within the next 5 days.
                </div>
            </div>
        );
    }

    return (
        <div className="alert alert-danger mt-4" role="alert">
            <div className="d-flex align-items-center mb-2">
                <i className="fa-solid fa-triangle-exclamation fs-3 me-3"></i>
                <h5 className="alert-heading mb-0">Action Required: Blood Expiring Soon!</h5>
            </div>
            <p className="mb-0">
                The following blood units will expire within the next <strong>5 days</strong>. Please prioritize issuing these units immediately (FEFO protocol enforced).
            </p>
            <hr />
            <div className="d-flex flex-wrap gap-3">
                {expiringData.map((item) => (
                    <div key={item._id} className="badge bg-danger fs-6 p-2 shadow-sm">
                        {item._id} : {item.totalExpiring} Units
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ExpiringAlerts;
