import React, { useEffect, useState } from "react";
import Layout from "./../../components/shared/Layout/Layout";
import moment from "moment";
import API from "../../services/API";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const DonorList = () => {
    const [data, setData] = useState([]);
    //find donar records
    const getDonors = async () => {
        try {
            const { data } = await API.get("/admin/donor-list");
            //   console.log(data);
            if (data?.success) {
                setData(data?.donorData);
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
                text: "You won't be able to revert this! The donor will be permanently deleted.",
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
                            <td>{record.name || record.organisationName + " (ORG)"}</td>
                            <td>{record.email}</td>
                            <td>{record.phone}</td>
                            <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                            <td>
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

export default DonorList;