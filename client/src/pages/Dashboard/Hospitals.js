import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";
import { useSelector } from "react-redux";
import ManualBroadcastForm from "../../components/ManualBroadcastForm";

const Hospitals = () => {
    const { user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    //find hospital records
    const getHospitals = async (page = 1) => {
        try {
            const { data } = await API.get(`/inventory/get-hospitals?page=${page}&limit=${limit}`);
            if (data?.success) {
                setData(data?.hospitals);
                setTotalPages(data?.totalPages);
                setCurrentPage(data?.currentPage);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getHospitals(1);
    }, []);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        getHospitals(page);
    };

    return (
        <Layout>
            <div className="container mt-4">
                <h4 className="mb-4">Hospital List</h4>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Address</th>
                            <th scope="col">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((record) => (
                            <tr key={record._id}>
                                <td>{record.hospitalName}</td>
                                <td>{record.email}</td>
                                <td>{record.phone}</td>
                                <td>{record.address}</td>
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

                {user?.role === "hospital" && (
                    <div className="mt-5">
                        <ManualBroadcastForm />
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Hospitals;