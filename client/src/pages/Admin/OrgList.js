import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const OrgList = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);

    //find donor records
    const getOrgs = async (page = 1) => {
        try {
            const { data } = await API.get(`/admin/org-list?page=${page}&limit=${limit}`);
            if (data?.success) {
                setData(data?.orgData);
                setTotalPages(data?.totalPages);
                setCurrentPage(data?.currentPage);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getOrgs(1);
    }, []);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        getOrgs(page);
    };

    //DELETE FUNCTION
    const handleDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this! The organisation will be permanently deleted.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const { data: deleteRes } = await API.delete(`/admin/delete/${id}`);
                toast.success(deleteRes?.message);
                // Refresh current page
                getOrgs(currentPage);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete the record");
        }
    };

    return (
        <Layout>
            <div className="container mt-4">
                <h4 className="mb-4">Organisation List (Admin)</h4>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Email</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Date</th>
                            <th scope="col">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((record) => (
                            <tr key={record._id}>
                                <td>{record.organisationName}</td>
                                <td>{record.email}</td>
                                <td>{record.phone}</td>
                                <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                                <td>
                                    <button
                                        className="btn btn-primary btn-sm me-2"
                                        onClick={() => navigate("/admin/entity-analytics", { state: { entity: record, role: "organisation" } })}
                                    >
                                        View Analytics
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(record._id)}
                                    >
                                        Delete
                                    </button>
                                </td>
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

export default OrgList;