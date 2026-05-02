import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";

const AdminEntityAnalytics = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { state } = location;
    const { entity, role } = state || {};

    const [data, setData] = useState([]);
    const [recentRecords, setRecentRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    const colors = [
        "#884A39",
        "#C38154",
        "#FFC26F",
        "#4F709C",
        "#4942E4",
        "#0079FF",
        "#FF0060",
        "#22A699",
    ];

    const getAnalytics = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/admin/entity-analytics", {
                params: { id: entity?._id, role },
            });
            if (data?.success) {
                setData(data?.bloodGroupData);
            }

            // Fetch recent records for this entity
            const recordsRes = await API.post("/inventory/get-inventory-hospital", {
                filters: role === "organisation"
                    ? { organisation: entity?._id }
                    : { hospital: entity?._id },
            });
            if (recordsRes.data?.success) {
                setRecentRecords(recordsRes.data?.inventory || []);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (entity?._id && role) {
            getAnalytics();
        }
    }, [entity, role]);

    if (!entity) {
        return (
            <Layout>
                <div className="container mt-4 text-center">
                    <p className="text-danger">No entity selected. Please go back and select an entity.</p>
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</button>
                </div>
            </Layout>
        );
    }

    const entityName = role === "organisation"
        ? entity?.organisationName
        : entity?.hospitalName;
    const entityEmail = entity?.email;
    const entityPhone = entity?.phone;
    const entityAddress = entity?.address;

    return (
        <Layout>
            <div className="container mt-4">
                {/* Back Button */}
                <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>
                    &larr; Back
                </button>

                {/* Entity Info Header */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h3 className="text-primary mb-1">
                            {role === "organisation" ? "Organisation" : "Hospital"}: {entityName}
                        </h3>
                        <p className="mb-1"><strong>Email:</strong> {entityEmail}</p>
                        <p className="mb-1"><strong>Phone:</strong> {entityPhone}</p>
                        <p className="mb-0"><strong>Address:</strong> {entityAddress}</p>
                    </div>
                </div>

                <h4 className="mb-3">Blood Inventory Analytics</h4>

                {loading ? (
                    <p>Loading analytics...</p>
                ) : (
                    <>
                        {/* Blood Group Cards */}
                        <div className="d-flex flex-row flex-wrap">
                            {data?.map((record, i) => (
                                <div
                                    className="card m-2 p-1"
                                    key={i}
                                    style={{ width: "18rem", backgroundColor: `${colors[i]}` }}
                                >
                                    <div className="card-body">
                                        <h1 className="card-title bg-light text-dark text-center mb-3">
                                            {record.bloodGroup}
                                        </h1>
                                        <p className="card-text">
                                            Total In : <b>{record.totalIn}</b> (Units)
                                        </p>
                                        <p className="card-text">
                                            Total Out : <b>{record.totalOut}</b> (Units)
                                        </p>
                                    </div>
                                    <div className="card-footer text-light bg-dark text-center">
                                        Total Available : <b>{record.availabeBlood}</b> (Units)
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Transactions Table */}
                        <h4 className="mt-5 mb-3 text-primary border-bottom pb-2">Recent Blood Transactions</h4>
                        {recentRecords.length === 0 ? (
                            <p className="text-muted">No transactions found.</p>
                        ) : (
                            <div className="table-responsive">
                                <table className="table table-hover table-bordered table-striped shadow-sm">
                                    <thead className="table-dark text-center">
                                        <tr>
                                            <th>Blood Group</th>
                                            <th>Type</th>
                                            <th>Quantity</th>
                                            <th>{role === "organisation" ? "Donor Email" : "From/To"}</th>
                                            <th>Time & Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-center align-middle">
                                        {recentRecords?.map((record) => (
                                            <tr key={record._id}>
                                                <td><b>{record.bloodGroup}</b></td>
                                                <td>
                                                    <span className={`badge ${record.inventoryType === "in" ? "bg-success" : "bg-danger"}`}>
                                                        {record.inventoryType.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td>{record.quantity} (Units)</td>
                                                <td>{record.email || "N/A"}</td>
                                                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
};

export default AdminEntityAnalytics;
