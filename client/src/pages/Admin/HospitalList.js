import React, { useEffect, useState } from "react";
import Layout from "../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const HospitalList = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    //find donar records
    const getDonors = async () => {
        try {
            const { data } = await API.get("/admin/hospital-list");
            console.log(data);
            if (data?.success) {
                setData(data?.hospitalData);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getDonors();
    }, []);

    //DELETE FUNCTION
    const handleDelete = async (id) => {
        try {
            const result = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this! The hospital will be permanently deleted.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Yes, delete it!'
            });

            if (result.isConfirmed) {
                const { data } = await API.delete(`/admin/delete/${id}`);
                toast.success(data?.message);
                // Remove the item from local state so we don't have to reload the page
                setData((prevData) => prevData.filter((record) => record._id !== id));
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to delete the record");
        }
    };

    return (
        <Layout>
            <table className="table ">
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
                            <td>{record.hospitalName}</td>
                            <td>{record.email}</td>
                            <td>{record.phone}</td>
                            <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                            <td>
                                <button
                                    className="btn btn-primary me-2"
                                    onClick={() => navigate("/admin/entity-analytics", { state: { entity: record, role: "hospital" } })}
                                >
                                    View Analytics
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(record._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </Layout>
    );
};

export default HospitalList;