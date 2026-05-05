import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";

const NotificationLogs = () => {
    const [logs, setLogs] = useState([]);

    // Get notification logs
    const getLogs = async () => {
        try {
            const { data } = await API.get("/notifications/logs");
            if (data?.success) {
                setLogs(data?.logs);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getLogs();
    }, []);

    return (
        <Layout>
            <div className="container mt-4">
                <h2 className="mb-4">Notification Logs</h2>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th scope="col">Type</th>
                            <th scope="col">Target Blood Group</th>
                            <th scope="col">Message</th>
                            <th scope="col">Status</th>
                            <th scope="col">Channels</th>
                            <th scope="col">Date & Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs?.map((log) => (
                            <tr key={log._id}>
                                <td>
                                    <span
                                        className={`badge ${
                                            log.type === "urgent"
                                                ? "bg-danger"
                                                : log.type === "wastage"
                                                ? "bg-warning text-dark"
                                                : "bg-info text-dark"
                                        }`}
                                    >
                                        {log.type.toUpperCase()}
                                    </span>
                                </td>
                                <td>{log.targetBloodGroup}</td>
                                <td>{log.message}</td>
                                <td>
                                    <span
                                        className={`badge ${
                                            log.status === "success"
                                                ? "bg-success"
                                                : log.status === "failed"
                                                ? "bg-danger"
                                                : "bg-secondary"
                                        }`}
                                    >
                                        {log.status.toUpperCase()}
                                    </span>
                                </td>
                                <td>{log.deliveryChannels.join(", ")}</td>
                                <td>{moment(log.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default NotificationLogs;
