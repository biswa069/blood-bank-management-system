import React, { useState, useEffect } from "react";
import Header from "../../components/shared/Layout/Header";
import API from "./../../services/API";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import ExpiringAlerts from "../../components/shared/ExpiringAlerts";
import Spinner from "../../components/shared/Spinner";
import moment from "moment";

const Analytics = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
    const [selectedBloodGroup, setSelectedBloodGroup] = useState("O+");
    const [forecastData, setForecastData] = useState(null);
    const [isForecasting, setIsForecasting] = useState(false);
    
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
            <div className="container mt-4 mb-5">
                <ExpiringAlerts />
                
                {/* AI Forecast Section */}
                <div className="table-container p-4 mb-5 mt-4" style={{ borderTop: "4px solid #8B5CF6" }}>
                    <h3 className="fw-bold mb-3" style={{ color: "#8B5CF6" }}><i className="fa-solid fa-robot me-2"></i> XGBoost AI Demand Forecast</h3>
                    <p className="text-muted">Select a blood group to generate a 24-hour demand prediction using our machine learning model.</p>
                    
                    <div className="d-flex gap-3 align-items-center mb-4">
                        <select 
                            className="form-select" 
                            style={{ width: "200px" }}
                            value={selectedBloodGroup}
                            onChange={(e) => setSelectedBloodGroup(e.target.value)}
                        >
                            {["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"].map((bg) => (
                                <option key={bg} value={bg}>{bg}</option>
                            ))}
                        </select>
                        <button 
                            className="btn btn-primary" 
                            style={{ backgroundColor: "#8B5CF6", borderColor: "#8B5CF6" }}
                            onClick={handleAIForecast}
                            disabled={isForecasting}
                        >
                            {isForecasting ? (
                                <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing...</>
                            ) : (
                                <><i className="fa-solid fa-wand-magic-sparkles me-2"></i> Generate Forecast</>
                            )}
                        </button>
                    </div>

                    {forecastData && (
                        <div className="alert alert-info border-info bg-white shadow-sm mt-3">
                            <h4 className="alert-heading text-info fw-bold mb-3">Prediction Results for {forecastData.blood_group}</h4>
                            <div className="row">
                                <div className="col-md-4 border-end">
                                    <h5 className="text-muted small">Predicted Demand (Tomorrow)</h5>
                                    <h2 className="text-primary">{forecastData.predicted_demand_tomorrow} Units</h2>
                                </div>
                                <div className="col-md-4 border-end">
                                    <h5 className="text-muted small">Current Stock Level</h5>
                                    <h2 className={forecastData.current_stock < forecastData.predicted_demand_tomorrow ? "text-danger" : "text-success"}>
                                        {forecastData.current_stock} Units
                                    </h2>
                                </div>
                                <div className="col-md-4">
                                    <h5 className="text-muted small">AI Suggestion</h5>
                                    <p className="fw-medium m-0">{forecastData.inventory_suggestion}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-3">
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