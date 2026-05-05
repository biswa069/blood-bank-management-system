import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";
import { useSelector } from "react-redux";

const Consumer = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    //find consumer records (blood OUT from hospital)
    const getConsumerRecords = async (page = 1) => {
        try {
            const { data } = await API.post("/inventory/get-inventory-hospital", {
                filters: {
                    organisation: user?._id,
                    inventoryType: "out",
                },
                page,
                limit
            });
            if (data?.success) {
                setData(data?.inventory);
                setTotalPages(data?.totalPages);
                setCurrentPage(data?.currentPage);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getConsumerRecords(1);
    }, [user]);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        getConsumerRecords(page);
    };

    return (
        <Layout>
            <div className="container mt-4">
                <h4 className="mb-4">Blood Sent to Consumer</h4>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Blood Group</th>
                            <th scope="col">Quantity</th>
                            <th scope="col">Email</th>
                            <th scope="col">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((record) => (
                            <tr key={record._id}>
                                <td>{record.bloodGroup}</td>
                                <td>{record.quantity} Units</td>
                                <td>{record.email}</td>
                                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {/* Pagination */}
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

export default Consumer;