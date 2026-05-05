import React, { useEffect, useState } from "react";
import API from "../services/API";
import Spinner from "./shared/Spinner";

const LiveCityRadar = () => {
    const [loading, setLoading] = useState(true);
    const [radarData, setRadarData] = useState([]);
    const [city, setCity] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        const fetchRadarData = async () => {
            try {
                setLoading(true);
                const { data } = await API.get("/inventory/city-radar");
                if (data?.success) {
                    setRadarData(data.radarData || []);
                    setCity(data.city);
                    setBloodGroup(data.bloodGroup);
                    if (data.message) {
                        setMessage(data.message);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch city radar:", error);
                setMessage("Failed to load radar data.");
            } finally {
                setLoading(false);
            }
        };

        fetchRadarData();
    }, []);

    if (loading) {
        return (
            <div style={styles.card} className="d-flex justify-content-center align-items-center p-5">
                <Spinner />
            </div>
        );
    }

    // If profile is incomplete
    if (!city || !bloodGroup || message === "Please update your profile with your city and blood group to use the radar.") {
        return (
            <div style={styles.card}>
                <div style={styles.header}>
                    <h5 style={styles.title}>📡 Live City Radar</h5>
                </div>
                <div style={{ ...styles.alertBox, ...styles.infoAlert }}>
                    <i className="fa-solid fa-circle-info me-2"></i>
                    Update your profile with your <strong>City</strong> and <strong>Blood Group</strong> to see urgent local demands.
                </div>
            </div>
        );
    }

    return (
        <div style={styles.card}>
            {/* Header */}
            <div style={styles.header}>
                <div className="d-flex align-items-center gap-2">
                    <span style={styles.radarIcon}>📡</span>
                    <h5 style={styles.title}>Live City Radar ({city})</h5>
                </div>
                <span style={styles.bloodBadge}>{bloodGroup}</span>
            </div>

            {/* Content */}
            {radarData.length === 0 ? (
                <div style={{ ...styles.alertBox, ...styles.successAlert }}>
                    <div className="d-flex align-items-start gap-3">
                        <i className="fa-solid fa-shield-heart" style={{ fontSize: '24px', marginTop: '2px' }}></i>
                        <div>
                            <h6 className="mb-1" style={{ fontWeight: '700' }}>Stock Stable</h6>
                            <p className="mb-0" style={{ fontSize: '14px' }}>
                                Stock levels for <strong>{bloodGroup}</strong> are currently stable in <strong>{city}</strong>. Thank you for checking! We will alert you if an urgent need arises.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={styles.radarList}>
                    {radarData.map((org) => (
                        <div key={org._id} style={{ ...styles.alertBox, ...styles.urgentAlert }}>
                            <div className="d-flex align-items-start gap-3">
                                <i className="fa-solid fa-triangle-exclamation" style={{ fontSize: '24px', marginTop: '2px' }}></i>
                                <div style={{ flex: 1 }}>
                                    <h6 className="mb-1" style={{ fontWeight: '800', fontSize: '15px' }}>
                                        URGENT: {org.organisationName} needs your help!
                                    </h6>
                                    <p className="mb-2" style={{ fontSize: '14px', lineHeight: '1.5' }}>
                                        They have critically low stock (<strong>{org.availableStock} units left</strong>) of {bloodGroup} blood. Walk in today to help save lives!
                                    </p>
                                    <div className="d-flex flex-wrap gap-3 mt-2 pt-2 border-top border-danger border-opacity-25" style={{ fontSize: '13px' }}>
                                        {org.phone && (
                                            <span><i className="fa-solid fa-phone me-1"></i> {org.phone}</span>
                                        )}
                                        {org.address && (
                                            <span><i className="fa-solid fa-location-dot me-1"></i> {org.address}</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const styles = {
    card: {
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '24px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        border: '1px solid #f1f5f9',
        transition: 'box-shadow 0.3s ease',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
    },
    radarIcon: {
        fontSize: '22px',
        animation: 'pulse 2s infinite',
    },
    title: {
        margin: 0,
        fontWeight: '700',
        fontSize: '18px',
        color: '#1e293b',
        letterSpacing: '-0.3px',
    },
    bloodBadge: {
        background: 'var(--bg-darker)',
        color: 'var(--text-main)',
        border: '1px solid var(--border-color)',
        padding: '4px 12px',
        borderRadius: '20px',
        fontWeight: '700',
        fontSize: '14px',
    },
    alertBox: {
        borderRadius: '12px',
        padding: '16px 20px',
        border: '1px solid',
    },
    infoAlert: {
        background: '#f8fafc',
        borderColor: '#e2e8f0',
        color: '#475569',
        fontSize: '14px',
    },
    successAlert: {
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        borderColor: '#bbf7d0',
        color: '#166534',
    },
    urgentAlert: {
        background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
        borderColor: '#fca5a5',
        color: '#991b1b',
        marginBottom: '12px',
    },
    radarList: {
        maxHeight: '400px',
        overflowY: 'auto',
        paddingRight: '4px',
    }
};

export default LiveCityRadar;
