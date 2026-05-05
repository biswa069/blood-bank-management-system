import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import API from "../../services/API";
import moment from "moment";

const Donor = () => {
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    //find donor records
    const getDonors = async (page = 1) => {
        try {
            const { data } = await API.get(`/inventory/get-donors?page=${page}&limit=${limit}`);
            if (data?.success) {
                setData(data?.donors);
                setTotalPages(data?.totalPages);
                setCurrentPage(data?.currentPage);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getDonors(1);
    }, []);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        getDonors(page);
    };

    return (
        <Layout>
            <div className="container mt-4">
                <h4 className="mb-4">Donor List</h4>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((record) => (
                            <tr key={record._id}>
                                <td>{record.name || record.organisationName + " (ORG)"}</td>
                                <td>{record.email}</td>
                                <td>{record.phone}</td>
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

export default Donor;