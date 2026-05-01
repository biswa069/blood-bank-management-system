// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import Spinner from "../components/shared/Spinner";
// import Layout from "../components/shared/Layout/Layout";
// import LayoutNoSidebar from "../components/shared/Layout/LayoutNoSidebar";
// import Modal from "../components/shared/modal/Modal";
// import API from "../services/API";
// import moment from "moment";
// import { useNavigate } from "react-router-dom";

// const HomePage = () => {
//     const { loading, error, user } = useSelector((state) => state.auth);
//     const [data, setData] = useState([]);
//     const [donorData, setDonorData] = useState([]);
//     const navigate = useNavigate();

//     //get function for org/hospital/admin
//     const getBloodRecords = async () => {
//         try {
//             const { data } = await API.get("/inventory/get-inventory");
//             if (data?.success) {
//                 setData(data?.inventory);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     //get donor records for donation history
//     const getDonorRecords = async () => {
//         try {
//             const { data } = await API.post("/inventory/get-inventory-hospital", {
//                 filters: {
//                     inventoryType: "in",
//                     donor: user?._id,
//                 },
//             });
//             if (data?.success) {
//                 setDonorData(data?.inventory);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     useEffect(() => {
//         if (user?.role !== "donor") {
//             getBloodRecords();
//         }
//         if (user?.role === "donor") {
//             getDonorRecords();
//         }
//     }, [user]);

//     useEffect(() => {
//         if (user?.role === "admin") {
//             navigate("/admin");
//         }
//     }, [user, navigate]);

//     // For donors - show donation history directly on homepage (no sidebar)
//     if (user?.role === "donor") {
//         return (
//             <LayoutNoSidebar>
//                 {loading ? (
//                     <Spinner />
//                 ) : (
//                     <div className="container mt-4">
//                         <h4 className="mb-4">My Donation History</h4>
//                         <table className="table">
//                             <thead>
//                                 <tr>
//                                     <th scope="col">Blood Group</th>
//                                     <th scope="col">Quantity</th>
//                                     <th scope="col">Donated To</th>
//                                     <th scope="col">Date</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {donorData?.map((record) => (
//                                     <tr key={record._id}>
//                                         <td>{record.bloodGroup}</td>
//                                         <td>{record.quantity} ML</td>
//                                         <td>
//                                             {record.organisation?.hospitalName || record.organisation?.organisationName || "N/A"}
//                                         </td>
//                                         <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </LayoutNoSidebar>
//         );
//     }

//     // For org/hospital/admin - show inventory page with sidebar
//     return (
//         <Layout>
//             {error && <span>{alert(error)}</span>}
//             {loading ? (
//                 <Spinner />
//             ) : (
//                 <>
//                     <div className="container mt-4">
//                         <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
//                             <h2 style={{color: 'var(--text-main)', fontWeight: '600', margin: 0}}>Inventory Dashboard</h2>
//                             <button
//                                 className="add-inventory-btn m-0"
//                                 data-bs-toggle="modal"
//                                 data-bs-target="#staticBackdrop"
//                             >
//                                 <i className="fa-solid fa-plus py-1"></i> Add Inventory
//                             </button>
//                         </div>
                        
//                         <div className="table-container">
//                             <table className="table">
//                                 <thead>
//                                     <tr>
//                                         <th scope="col">Blood Group</th>
//                                         <th scope="col">Inventory Type</th>
//                                         <th scope="col">Quantity</th>
//                                         <th scope="col">Donor Email</th>
//                                         <th scope="col">Time & Date</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {data?.map((record) => (
//                                         <tr key={record._id}>
//                                             <td>
//                                                 <span className="badge bg-danger rounded-pill px-3 py-2">
//                                                     {record.bloodGroup}
//                                                 </span>
//                                             </td>
//                                             <td style={{textTransform: 'capitalize'}}>{record.inventoryType}</td>
//                                             <td><strong>{record.quantity}</strong> <span className="text-muted">(ML)</span></td>
//                                             <td>{record.email}</td>
//                                             <td>
//                                                 {moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                         <Modal />
//                     </div>
//                 </>
//             )}
//         </Layout>
//     );
// };

// export default HomePage;

// import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
// import Spinner from "../components/shared/Spinner";
// import Layout from "../components/shared/Layout/Layout";
// import LayoutNoSidebar from "../components/shared/Layout/LayoutNoSidebar";
// import Modal from "../components/shared/modal/Modal";
// import API from "../services/API";
// import moment from "moment";
// import { useNavigate } from "react-router-dom";

// const HomePage = () => {
//     const { loading, error, user } = useSelector((state) => state.auth);
//     const [data, setData] = useState([]);
//     const [donorData, setDonorData] = useState([]);
//     const navigate = useNavigate();

//     //get function for org/hospital/admin
//     const getBloodRecords = async () => {
//         try {
//             const { data } = await API.get("/inventory/get-inventory");
//             if (data?.success) {
//                 setData(data?.inventory);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     //get donor records for donation history
//     const getDonorRecords = async () => {
//         try {
//             const { data } = await API.post("/inventory/get-inventory-hospital", {
//                 filters: {
//                     inventoryType: "in",
//                     donor: user?._id,
//                 },
//             });
//             if (data?.success) {
//                 setDonorData(data?.inventory);
//             }
//         } catch (error) {
//             console.log(error);
//         }
//     };

//     useEffect(() => {
//         if (user?.role !== "donor") {
//             getBloodRecords();
//         }
//         if (user?.role === "donor") {
//             getDonorRecords();
//         }
//     }, [user]);

//     useEffect(() => {
//         if (user?.role === "admin") {
//             navigate("/admin");
//         }
//     }, [user, navigate]);

//     // For donors - show donation history directly on homepage (no sidebar)
//     if (user?.role === "donor") {
//         return (
//             <LayoutNoSidebar>
//                 {loading ? (
//                     <Spinner />
//                 ) : (
//                     <div className="container mt-4">
//                         <h4 className="mb-4">My Donation History</h4>
//                         <table className="table">
//                             <thead>
//                                 <tr>
//                                     <th scope="col">Blood Group</th>
//                                     <th scope="col">Quantity</th>
//                                     <th scope="col">Donated To</th>
//                                     <th scope="col">Date</th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {donorData?.map((record) => (
//                                     <tr key={record._id}>
//                                         <td>{record.bloodGroup}</td>
//                                         <td>{record.quantity} ML</td>
//                                         <td>
//                                             {record.organisation?.hospitalName || record.organisation?.organisationName || "N/A"}
//                                         </td>
//                                         <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>
//                     </div>
//                 )}
//             </LayoutNoSidebar>
//         );
//     }

//     // For org/hospital/admin - show inventory page with sidebar
//     return (
//         <Layout>
//             {error && <span>{alert(error)}</span>}
//             {loading ? (
//                 <Spinner />
//             ) : (
//                 <>
//                     <div className="container mt-4">
//                         <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
//                             <h2 style={{color: 'var(--text-main)', fontWeight: '600', margin: 0}}>Inventory Dashboard</h2>
//                             <button
//                                 className="add-inventory-btn m-0"
//                                 data-bs-toggle="modal"
//                                 data-bs-target="#staticBackdrop"
//                             >
//                                 <i className="fa-solid fa-plus py-1"></i> Add Inventory
//                             </button>
//                         </div>
                        
//                         <div className="table-container">
//                             <table className="table">
//                                 <thead>
//                                     <tr>
//                                         <th scope="col">Blood Group</th>
//                                         <th scope="col">Inventory Type</th>
//                                         <th scope="col">Quantity</th>
//                                         <th scope="col">Donor Email</th>
//                                         <th scope="col">Time & Date</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {data?.map((record) => (
//                                         <tr key={record._id}>
//                                             <td>
//                                                 <span className="badge bg-danger rounded-pill px-3 py-2">
//                                                     {record.bloodGroup}
//                                                 </span>
//                                             </td>
//                                             <td style={{textTransform: 'capitalize'}}>{record.inventoryType}</td>
//                                             <td><strong>{record.quantity}</strong> <span className="text-muted">(ML)</span></td>
//                                             <td>{record.email}</td>
//                                             <td>
//                                                 {moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                         {/* THIS LINE IS UPDATED SO THE TABLE REFRESHES WITHOUT PAGE RELOAD */}
//                         <Modal onRecordAdded={getBloodRecords} />
//                     </div>
//                 </>
//             )}
//         </Layout>
//     );
// };

// export default HomePage;

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify"; // Added toast import
import Spinner from "../components/shared/Spinner";
import Layout from "../components/shared/Layout/Layout";
import LayoutNoSidebar from "../components/shared/Layout/LayoutNoSidebar";
import Modal from "../components/shared/modal/Modal";
import API from "../services/API";
import moment from "moment";

const HomePage = () => {
    const { loading, error, user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);
    const [donorData, setDonorData] = useState([]);
    const navigate = useNavigate();

    // Handle Redux Errors properly without native alerts
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    //get function for org/hospital/admin
    const getBloodRecords = async () => {
        try {
            const { data } = await API.get("/inventory/get-inventory");
            if (data?.success) {
                setData(data?.inventory);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to fetch inventory");
        }
    };

    //get donor records for donation history
    const getDonorRecords = async () => {
        try {
            const { data } = await API.post("/inventory/get-inventory-hospital", {
                filters: {
                    inventoryType: "in",
                    donor: user?._id,
                },
            });
            if (data?.success) {
                setDonorData(data?.inventory);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch donor records");
        }
    };

    useEffect(() => {
        if (user?.role !== "donor") {
            getBloodRecords();
        }
        if (user?.role === "donor") {
            getDonorRecords();
        }
    }, [user]);

    useEffect(() => {
        if (user?.role === "admin") {
            navigate("/admin");
        }
    }, [user, navigate]);

    if (user?.role === "donor") {
        return (
            <LayoutNoSidebar>
                {loading ? (
                    <Spinner />
                ) : (
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
                                {donorData?.map((record) => (
                                    <tr key={record._id}>
                                        <td>{record.bloodGroup}</td>
                                        <td>{record.quantity} ML</td>
                                        <td>
                                            {record.organisation?.hospitalName || record.organisation?.organisationName || "N/A"}
                                        </td>
                                        <td>{moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </LayoutNoSidebar>
        );
    }

    return (
        <Layout>
            {loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="container mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                            <h2 style={{color: 'var(--text-main)', fontWeight: '600', margin: 0}}>Inventory Dashboard</h2>
                            <button
                                className="add-inventory-btn m-0"
                                data-bs-toggle="modal"
                                data-bs-target="#staticBackdrop"
                            >
                                <i className="fa-solid fa-plus py-1"></i> Add Inventory
                            </button>
                        </div>
                        
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th scope="col">Blood Group</th>
                                        <th scope="col">Inventory Type</th>
                                        <th scope="col">Quantity</th>
                                        <th scope="col">{user?.role === "hospital" ? "From" : "Donor Email"}</th>
                                        <th scope="col">Time & Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data?.map((record) => (
                                        <tr key={record._id}>
                                            <td>
                                                <span className="badge bg-danger rounded-pill px-3 py-2">
                                                    {record.bloodGroup}
                                                </span>
                                            </td>
                                            <td style={{textTransform: 'capitalize'}}>{record.inventoryType}</td>
                                            <td><strong>{record.quantity}</strong> <span className="text-muted">(ML)</span></td>
                                            <td>{record.email}</td>
                                            <td>
                                                {moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Modal onRecordAdded={getBloodRecords} />
                    </div>
                </>
            )}
        </Layout>
    );
};

export default HomePage;