import React, { useState, useEffect } from "react";
import Header from "../../components/shared/Layout/Header";
import API from "./../../services/API";
import { useSelector } from "react-redux";
import moment from "moment";

const Analytics = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);
    const [inventoryData, setInventoryData] = useState([]);
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
    return (
        <>
            <Header />
            <div className="container mt-4 mb-5">
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
                                <span><b>{record.totalIn}</b> ML</span>
                            </div>
                            <div className="d-flex justify-content-between mb-4">
                                <span className="text-muted">Total Out:</span>
                                <span><b>{record.totalOut}</b> ML</span>
                            </div>
                            <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                                <span className="text-muted fw-medium">Available</span>
                                <b className="fs-5" style={{ color: 'var(--text-main)' }}>{record.availabeBlood} ML</b>
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
                                    <td><strong>{record.quantity}</strong> <span className="text-muted">(ML)</span></td>
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