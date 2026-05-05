import moment from "moment";
import React, { useEffect, useState } from "react";
import Layout from "../components/shared/Layout/Layout";
import LayoutNoSidebar from "../components/shared/Layout/LayoutNoSidebar";
import API from "../services/API";
import { useSelector } from "react-redux";

const Donation = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    //find donor/hospital records
    const getRecords = async (page = 1) => {
        try {
            if (user?.role === "donor") {
                const { data } = await API.post("/inventory/get-inventory-hospital", {
                    filters: {
                        inventoryType: "in",
                        donor: user?._id,
                    },
                    page,
                    limit
                });
                if (data?.success) {
                    setData(data?.inventory);
                    setTotalPages(data?.totalPages);
                    setCurrentPage(data?.currentPage);
                }
            } else if (user?.role === "hospital") {
                const { data } = await API.get(`/inventory/get-inventory-received?page=${page}&limit=${limit}`);
                if (data?.success) {
                    setData(data?.inventory);
                    setTotalPages(data?.totalPages);
                    setCurrentPage(data?.currentPage);
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getRecords(1);
    }, [user]);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        getRecords(page);
    };

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
                    {/* Pagination for Donor */}
                    {totalPages > 1 && (
                        <nav className="d-flex justify-content-center align-items-center mt-4 gap-3">
                            <button 
                                className="btn btn-outline-danger px-4" 
                                disabled={currentPage === 1}
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                <i className="fa-solid fa-arrow-left me-2"></i> Previous
                            </button>
                            <span className="fw-bold text-muted">Page {currentPage} of {totalPages}</span>
                            <button 
                                className="btn btn-outline-danger px-4" 
                                disabled={currentPage === totalPages}
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                Next <i className="fa-solid fa-arrow-right ms-2"></i>
                            </button>
                        </nav>
                    )}
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
                {/* Pagination for Hospital */}
                {totalPages > 1 && (
                    <nav className="d-flex justify-content-center align-items-center mt-4 mb-4 gap-3">
                        <button 
                            className="btn btn-outline-danger px-4" 
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                        >
                            <i className="fa-solid fa-arrow-left me-2"></i> Previous
                        </button>
                        <span className="fw-bold text-muted">Page {currentPage} of {totalPages}</span>
                        <button 
                            className="btn btn-outline-danger px-4" 
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                        >
                            Next <i className="fa-solid fa-arrow-right ms-2"></i>
                        </button>
                    </nav>
                )}
            </div>
        </Layout>
    );
};

export default Donation;