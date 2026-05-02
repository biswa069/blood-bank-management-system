import moment from "moment";
import React, { useEffect, useState } from "react";
import Layout from "../components/shared/Layout/Layout";
import LayoutNoSidebar from "../components/shared/Layout/LayoutNoSidebar";
import API from "../services/API";
import { useSelector } from "react-redux";

const Donation = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);
    //find donor/hospital records
    const getRecords = async () => {
        try {
            if (user?.role === "donor") {
                const { data } = await API.post("/inventory/get-inventory-hospital", {
                    filters: {
                        inventoryType: "in",
                        donor: user?._id,
                    },
                });
                if (data?.success) {
                    setData(data?.inventory);
                }
            } else if (user?.role === "hospital") {
                const { data } = await API.get("/inventory/get-inventory-received");
                if (data?.success) {
                    setData(data?.inventory);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getRecords();
    }, [user]);

    // Donor sees history without sidebar
    if (user?.role === "donor") {
        return (
            <LayoutNoSidebar>
                <div className="container mt-4">
                    <h4 className="mb-4">My Donation History</h4>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">Blood Group</th>
                                <th scope="col">Quantity</th>
                                <th scope="col">Donated To</th>
                                <th scope="col">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data?.map((record) => (
                                <tr key={record._id}>
                                    <td>{record.bloodGroup}</td>
                                    <td>{record.quantity} Units</td>
                                    <td>
                                        {record.organisation?.hospitalName || record.organisation?.organisationName || "N/A"}
                                    </td>
                                    <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </LayoutNoSidebar>
        );
    }

    // Hospital sees history with sidebar
    return (
        <Layout>
            <div className="container mt-4">
                <h4 className="mb-4">Blood Received</h4>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Blood Group</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">From</th>
                            <th scope="col">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((record) => (
                            <tr key={record._id}>
                                <td>{record.bloodGroup}</td>
                                <td>{record.quantity} Units</td>
                                <td>{record.fromEmail || record.email || "N/A"}</td>
                                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Layout>
    );
};

export default Donation;