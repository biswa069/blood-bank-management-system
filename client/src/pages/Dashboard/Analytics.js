import React, { useState, useEffect, useMemo } from "react";
import Header from "../../components/shared/Layout/Header";
import API from "./../../services/API";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

import Spinner from "../../components/shared/Spinner";
import moment from "moment";
import ForecastAnalyticsChart from "../../components/ForecastAnalyticsChart";
import CommandCenterKPI from "../../components/CommandCenterKPI";
import WastageRiskChart from "../../components/WastageRiskChart";

const Analytics = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [selectedBloodGroup, setSelectedBloodGroup] = useState("All Groups");
    const [selectedTimeSpan, setSelectedTimeSpan] = useState(7);
    const [forecastData, setForecastData] = useState(null);
    const [isForecasting, setIsForecasting] = useState(false);

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardAnalytics = async () => {
        try {
            setLoading(true);
            const { data } = await API.get(`/analytics/dashboard?bloodGroup=${encodeURIComponent(selectedBloodGroup)}&days=${selectedTimeSpan}`);
            if (data?.success) {
                setDashboardData(data);
            }
        } catch (error) {
            console.log("Error fetching dashboard data:", error);
            toast.error("Failed to load real-time analytics.");
            setDashboardData(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardAnalytics();
    }, [selectedBloodGroup, selectedTimeSpan]);

    // Fallback if data is missing or empty
    const activeTimeWindowData = useMemo(() => {
        return dashboardData || {
            currentStock: 0,
            wastageData: Array(selectedTimeSpan).fill().map((_, i) => ({ date: `Day ${i + 1}`, predictedDemand: 0, expiringUnits: 0 })),
            accuracyData: Array(selectedTimeSpan).fill().map((_, i) => ({ date: `Day ${i + 1}`, actualDemand: 0, predictedDemand: 0 })),
        };
    }, [dashboardData, selectedTimeSpan]);

    // Calculate KPIs
    const kpiMetrics = useMemo(() => {
        const currentStock = activeTimeWindowData.currentStock;
        
        return activeTimeWindowData.wastageData.reduce((acc, curr) => {
            acc.predictedDemand += curr.predictedDemand;
            acc.expiringUnits += curr.expiringUnits;
            return acc;
        }, { currentStock, predictedDemand: 0, expiringUnits: 0 });
    }, [activeTimeWindowData]);
    
    const colors = [
        "#EF4444", // Red
        "#3B82F6", // Blue
        "#10B981", // Emerald
        "#F59E0B", // Amber
        "#8B5CF6", // Violet
        "#EC4899", // Pink
        "#06B6D4", // Cyan
        "#6366F1", // Indigo
    ];
    //GET BLOOD GROUP DATA
    const getBloodGroupData = async () => {
        try {
            if (user?.role === "hospital") {
                const { data } = await API.get("/analytics/bloodGroups-data-hospital");
                if (data?.success) {
                    setData(data?.bloodGroupData);
                }
            } else {
                const { data } = await API.get("/analytics/bloodGroups-data");
                if (data?.success) {
                    setData(data?.bloodGroupData);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    //lifrecycle method
    useEffect(() => {
        getBloodGroupData();
    }, [user]);

    //get function
    const getBloodRecords = async () => {
        try {
            if (user?.role === "hospital") {
                const { data } = await API.post("/inventory/get-inventory-hospital", {
                    filters: {
                        hospital: user?._id,
                        inventoryType: "out",
                    },
                });
                if (data?.success) {
                    setInventoryData(data?.inventory);
                }
            } else {
                const { data } = await API.get("/inventory/get-recent-inventory");
                if (data?.success) {
                    setInventoryData(data?.inventory);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getBloodRecords();
    }, [user]);

    // AI Forecast Function
    const handleAIForecast = async () => {
        try {
            setIsForecasting(true);
            setForecastData(null);
            const { data } = await API.post("/analytics/ai-forecast", { bloodGroup: selectedBloodGroup });
            if (data?.success) {
                setForecastData(data.forecast);
                toast.success("AI Forecast generated successfully!");
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to connect to AI Microservice.");
        } finally {
            setIsForecasting(false);
        }
    };

    return (
        <>
            <Header />
            <div className="container mt-4">
                <div className="mb-4 d-flex justify-content-between align-items-center">
                    <div>
                        <h1 style={{color: 'var(--text-main)', fontWeight: '700', fontSize: '32px'}}>Supply Chain Command Center</h1>
                        <p className="text-muted mb-0">Real-time data visualization and AI-driven decision support.</p>
                    </div>
                    <div className="d-flex gap-3">
                        <select 
                            className="form-select shadow-sm fw-medium text-gray-700" 
                            style={{ width: "200px", borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "pointer" }}
                            value={selectedTimeSpan}
                            onChange={(e) => setSelectedTimeSpan(Number(e.target.value))}
                        >
                            <option value={3}>Next 3 Days</option>
                            <option value={7}>Next 7 Days</option>
                            <option value={14}>Next 14 Days</option>
                            <option value={30}>Next 30 Days</option>
                        </select>
                        <select 
                            className="form-select shadow-sm fw-medium text-gray-700" 
                            style={{ width: "200px", borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "pointer" }}
                            value={selectedBloodGroup}
                            onChange={(e) => setSelectedBloodGroup(e.target.value)}
                        >
                            <option value="All Groups">All Groups</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                                <option key={bg} value={bg}>{bg}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* 1. Top Row KPI */}
                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: "150px" }}>
                        <Spinner />
                    </div>
                ) : (
                    <CommandCenterKPI 
                        currentStock={kpiMetrics.currentStock}
                        predictedDemand={kpiMetrics.predictedDemand}
                        expiringUnits={kpiMetrics.expiringUnits}
                        timeSpan={selectedTimeSpan}
                    />
                )}
                {/* AI Forecast Section */}
                <div className="table-container p-4 mb-5 mt-4" style={{ borderTop: "4px solid #8B5CF6" }}>
                    <h3 className="fw-bold mb-3" style={{ color: "#8B5CF6" }}><i className="fa-solid fa-robot me-2"></i> XGBoost AI Demand Forecast</h3>
                    <p className="text-muted">Select a blood group to generate a 24-hour demand prediction using our machine learning model.</p>
                    
                    <div className="d-flex gap-3 align-items-center mb-4">
                        <select 
                            className="form-select shadow-sm fw-medium text-gray-700" 
                            style={{ width: "200px", borderRadius: "8px", border: "1px solid #e5e7eb", cursor: "pointer" }}
                            value={selectedBloodGroup}
                            onChange={(e) => setSelectedBloodGroup(e.target.value)}
                        >
                            {["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"].map((bg) => (
                                <option key={bg} value={bg}>{bg}</option>
                            ))}
                        </select>
                        <button 
                            className="btn text-white fw-bold d-flex align-items-center gap-2"
                            style={{ backgroundColor: "#8B5CF6", borderRadius: "8px", padding: "8px 24px" }}
                            onClick={handleAIForecast}
                            disabled={isForecasting || selectedBloodGroup === "All Groups"}
                        >
                            {isForecasting ? (
                                <><span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Processing...</>
                            ) : (
                                <><i className="fa-solid fa-wand-magic-sparkles"></i> Predict Demand</>
                            )}
                        </button>
                    </div>

                    {forecastData && !isForecasting && (
                        <div className="bg-light p-4 rounded-xl border border-gray-100" style={{ borderRadius: "12px" }}>
                            <div className="d-flex align-items-start justify-content-between">
                                <div>
                                    <h4 className="fw-bold text-gray-800 mb-1">{forecastData.blood_group} Forecast</h4>
                                    <p className="text-muted mb-0"><i className="fa-solid fa-clock-rotate-left me-1"></i> Based on 7-day rolling window.</p>
                                </div>
                                <div className="text-end">
                                    <p className="text-muted mb-1 fw-medium" style={{ fontSize: "14px" }}>Tomorrow's Demand</p>
                                    <h2 className="mb-0 fw-bold" style={{ color: "#8B5CF6" }}>{forecastData.predicted_demand_tomorrow} <span className="fs-6 text-muted fw-normal">Units</span></h2>
                                </div>
                            </div>
                            
                            <hr className="my-3 border-gray-200" />
                            
                            <div className="row">
                                <div className="col-md-6">
                                    <h5 className="text-muted small">Current Stock Level</h5>
                                    <h3 className={`fw-bold ${forecastData.current_stock < forecastData.predicted_demand_tomorrow ? "text-danger" : "text-success"}`}>
                                        {forecastData.current_stock} Units
                                    </h3>
                                </div>
                                <div className="col-md-6">
                                    <h5 className="text-muted small">AI Suggestion</h5>
                                    <p className="fw-medium mb-0">{forecastData.inventory_suggestion}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="d-flex justify-content-center align-items-center" style={{ height: "300px" }}>
                        <Spinner />
                    </div>
                ) : (
                    <>
                        <ForecastAnalyticsChart data={activeTimeWindowData.accuracyData} />
                        <WastageRiskChart data={activeTimeWindowData.wastageData} />
                    </>
                )}

                <div className="mb-3 mt-5">
                    <h2 style={{color: 'var(--text-main)', fontWeight: '600', margin: 0}}>Current Stock Levels</h2>
                </div>
                <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
                    {data?.map((record, i) => (
                        <div
                            className="table-container p-4 d-flex flex-column"
                            key={i}
                            style={{ width: "20rem", borderTop: `4px solid ${colors[i % colors.length]}` }}
                        >
                            <h2 className="text-center mb-4 fw-bold" style={{ color: colors[i % colors.length] }}>
                                {record.bloodGroup}
                            </h2>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Total In:</span>
                                <span><b>{record.totalIn}</b> Units</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="text-muted">Total Out:</span>
                                <span><b>{record.totalOut}</b> Units</span>
                            </div>
                            <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                                <span className="text-muted fw-medium">Available</span>
                                <b className="fs-5" style={{ color: 'var(--text-main)' }}>{record.availabeBlood} Units</b>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mb-3">
                    <h2 style={{color: 'var(--text-main)', fontWeight: '600', margin: 0}}>Recent Blood Transactions</h2>
                </div>
                
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Blood Group</th>
                                <th scope="col">Inventory Type</th>
                                <th scope="col">Quantity</th>
                                <th scope="col">{user?.role === "hospital" ? "From" : "Donor Email"}</th>
                                <th scope="col">Time & Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryData?.map((record) => (
                                <tr key={record._id}>
                                    <td>
                                        <span className="badge bg-danger rounded-pill px-3 py-2">
                                            {record.bloodGroup}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`badge ${record.inventoryType === "in" ? "bg-success" : "bg-danger"}`}>
                                            {record.inventoryType.toUpperCase()}
                                        </span>
                                    </td>
                                    <td><strong>{record.quantity}</strong> <span className="text-muted">(Units)</span></td>
                                    <td>{record.email || <i className="text-muted">N/A</i>}</td>
                                    <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </>
    );
};

export default Analytics;