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
import BulkImportModal from "../components/shared/modal/BulkImportModal";
import EligibilityCard from "../components/EligibilityCard";
import LiveCityRadar from "../components/LiveCityRadar";
import DisasterSimulator from "../components/DisasterSimulator";
import API from "../services/API";
import moment from "moment";

const HomePage = () => {
    const { loading, error, user } = useSelector((state) => state.auth);
    const [data, setData] = useState([]);
    const [donorData, setDonorData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [bloodGroupFilter, setBloodGroupFilter] = useState("");
    const [kpiStats, setKpiStats] = useState({ totalUnits: 0, oNegStock: 0, expiringSoon: 0, donationsToday: 0 });
    const [activeTab, setActiveTab] = useState("inventory");
    const navigate = useNavigate();

    // Handle Redux Errors properly without native alerts
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    //get function for org/hospital/admin
    const getBloodRecords = async (page = 1) => {
        try {
            const { data } = await API.get(`/inventory/get-inventory?page=${page}&limit=${limit}`);
            if (data?.success) {
                setData(data?.inventory);
                setTotalPages(data?.totalPages);
                setCurrentPage(data?.currentPage);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.response?.data?.message || "Failed to fetch inventory");
        }
    };

    // Fetch real KPI stats from the dedicated aggregation endpoint
    const fetchKpiStats = async () => {
        try {
            const { data } = await API.get("/inventory/kpi-stats");
            if (data?.success) setKpiStats(data.stats);
        } catch (error) {
            console.log("KPI fetch error:", error);
        }
    };

    //get donor records for donation history
    const getDonorRecords = async (page = 1) => {
        try {
            const { data } = await API.post("/inventory/get-inventory-hospital", {
                filters: {
                    inventoryType: "in",
                    donor: user?._id,
                },
                page,
                limit
            });
            if (data?.success) {
                setDonorData(data?.inventory);
                setTotalPages(data?.totalPages);
                setCurrentPage(data?.currentPage);
            }
        } catch (error) {
            console.log(error);
            toast.error("Failed to fetch donor records");
        }
    };

    useEffect(() => {
        if (user?.role !== "donor") {
            getBloodRecords(1);
            fetchKpiStats(); // Fetch real KPI data from backend aggregations
        }
        if (user?.role === "donor") {
            getDonorRecords(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => {
        if (user?.role === "admin") {
            navigate("/admin");
        }
    }, [user, navigate]);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        if (user?.role === "donor") {
            getDonorRecords(page);
        } else {
            getBloodRecords(page);
        }
    };

    if (user?.role === "donor") {
        return (
            <LayoutNoSidebar>
                {loading ? (
                    <Spinner />
                ) : (
                    <div className="container mt-4">
                        {/* Biological Eligibility Card */}
                        <EligibilityCard
                            lastDonationDate={user?.lastDonationDate}
                            bloodGroup={user?.bloodGroup}
                        />

                        {/* Live City Radar */}
                        <LiveCityRadar />
                        
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
                )}
            </LayoutNoSidebar>
        );
    }

    // KPI values from backend (accurate, full-dataset aggregation)
    const totalUnits = kpiStats.totalUnits;
    const criticalShortages = kpiStats.oNegStock;
    const donationsToday = kpiStats.donationsToday;
    const expiringSoon = kpiStats.expiringSoon;

    // Client-side filtered view
    const filteredData = data.filter(record => {
        const matchesSearch = searchTerm === "" || (record.email || "").toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGroup = bloodGroupFilter === "" || record.bloodGroup === bloodGroupFilter;
        return matchesSearch && matchesGroup;
    });

    return (
        <Layout>
            {loading ? (
                <Spinner />
            ) : (
                <>
                    <div className="container mt-4">

                        {/* --- Tabs for Hospital/Organisation --- */}
                        {(user?.role === "hospital" || user?.role === "organisation") && (
                            <ul className="nav nav-tabs mb-4">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${activeTab === 'inventory' ? 'active fw-bold' : 'text-dark'}`} 
                                        onClick={() => setActiveTab('inventory')}
                                        style={activeTab === 'inventory' ? { color: 'var(--text-main)' } : {}}
                                    >
                                        Inventory Dashboard
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link text-danger ${activeTab === 'war_room' ? 'active fw-bold' : ''}`} 
                                        onClick={() => setActiveTab('war_room')}
                                    >
                                        <i className="fa-solid fa-triangle-exclamation me-2"></i> War Room: Disaster Simulation
                                    </button>
                                </li>
                            </ul>
                        )}

                        {activeTab === 'inventory' ? (
                            <>
                                {/* --- Page Header --- */}
                                <div className="d-flex justify-content-between align-items-center mb-4 mt-2">
                            <div>
                                <h2 style={{color: 'var(--text-main)', fontWeight: '700', margin: 0}}>Inventory Dashboard</h2>
                                <p className="text-muted mb-0" style={{fontSize: '0.9rem'}}>Real-time blood unit tracking and management</p>
                            </div>
                            <div className="d-flex gap-2">
                                {user?.role === "organisation" && (
                                    <button
                                        className="btn fw-bold px-4 py-2"
                                        data-bs-toggle="modal"
                                        data-bs-target="#bulkImportModal"
                                        style={{ border: '2px solid #c8102e', color: '#c8102e', background: 'transparent', borderRadius: '8px' }}
                                    >
                                        <i className="fa-solid fa-file-csv me-2"></i> Bulk Import
                                    </button>
                                )}
                                <button
                                    className="btn fw-bold px-4 py-2 text-white"
                                    data-bs-toggle="modal"
                                    data-bs-target="#staticBackdrop"
                                    style={{ backgroundColor: '#c8102e', borderColor: '#c8102e', borderRadius: '8px' }}
                                >
                                    <i className="fa-solid fa-plus me-2"></i> Add Inventory
                                </button>
                            </div>
                        </div>

                        {/* --- KPI Summary Cards --- */}
                        <div className="row g-3 mb-4">
                            <div className="col-6 col-md-3">
                                <div className="card border-0 shadow-sm h-100" style={{borderRadius: '12px'}}>
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:'40px',height:'40px',backgroundColor:'#dbeafe'}}>
                                                <i className="fa-solid fa-droplet" style={{color:'#2563eb'}}></i>
                                            </div>
                                            <span className="text-muted fw-semibold" style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Total Units</span>
                                        </div>
                                        <h3 className="fw-bolder mb-0" style={{color:'#1e293b'}}>{Math.max(0, totalUnits)}</h3>
                                        <p className="text-muted mb-0" style={{fontSize:'0.78rem'}}>Available in stock</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="card border-0 shadow-sm h-100" style={{borderRadius: '12px'}}>
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:'40px',height:'40px',backgroundColor:'#fee2e2'}}>
                                                <i className="fa-solid fa-triangle-exclamation" style={{color:'#dc2626'}}></i>
                                            </div>
                                            <span className="text-muted fw-semibold" style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Critical (O-)</span>
                                        </div>
                                        <h3 className="fw-bolder mb-0" style={{color:'#dc2626'}}>{criticalShortages}</h3>
                                        <p className="text-muted mb-0" style={{fontSize:'0.78rem'}}>Low stock alerts</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="card border-0 shadow-sm h-100" style={{borderRadius: '12px'}}>
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:'40px',height:'40px',backgroundColor:'#fef3c7'}}>
                                                <i className="fa-solid fa-clock" style={{color:'#d97706'}}></i>
                                            </div>
                                            <span className="text-muted fw-semibold" style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Expiring Soon</span>
                                        </div>
                                        <h3 className="fw-bolder mb-0" style={{color:'#d97706'}}>{expiringSoon}</h3>
                                        <p className="text-muted mb-0" style={{fontSize:'0.78rem'}}>Within 7 days</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-6 col-md-3">
                                <div className="card border-0 shadow-sm h-100" style={{borderRadius: '12px'}}>
                                    <div className="card-body p-3">
                                        <div className="d-flex align-items-center mb-2">
                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:'40px',height:'40px',backgroundColor:'#dcfce7'}}>
                                                <i className="fa-solid fa-heart-pulse" style={{color:'#16a34a'}}></i>
                                            </div>
                                            <span className="text-muted fw-semibold" style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Donations Today</span>
                                        </div>
                                        <h3 className="fw-bolder mb-0" style={{color:'#16a34a'}}>{donationsToday}</h3>
                                        <p className="text-muted mb-0" style={{fontSize:'0.78rem'}}>New inflows</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* --- Table Controls: Search & Filter --- */}
                        <div className="card border-0 shadow-sm mb-0" style={{borderRadius:'12px 12px 0 0'}}>
                            <div className="card-body p-3 d-flex flex-wrap gap-3 align-items-center justify-content-between border-bottom">
                                <div className="d-flex gap-2 flex-wrap">
                                    <div className="input-group" style={{maxWidth:'280px'}}>
                                        <span className="input-group-text bg-white border-end-0">
                                            <i className="fa-solid fa-magnifying-glass text-muted"></i>
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control border-start-0 ps-0"
                                            placeholder="Search by email..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <select
                                        className="form-select"
                                        style={{maxWidth:'180px'}}
                                        value={bloodGroupFilter}
                                        onChange={(e) => setBloodGroupFilter(e.target.value)}
                                    >
                                        <option value="">All Blood Groups</option>
                                        {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(bg => (
                                            <option key={bg} value={bg}>{bg}</option>
                                        ))}
                                    </select>
                                </div>
                                <span className="text-muted" style={{fontSize:'0.85rem'}}>
                                    Showing <strong>{filteredData.length}</strong> of <strong>{data.length}</strong> records
                                </span>
                            </div>

                            {/* --- Enhanced Table --- */}
                            <div className="table-responsive" style={{borderRadius:'0 0 12px 12px'}}>
                                <table className="table table-hover mb-0">
                                    <thead style={{backgroundColor:'#f8fafc'}}>
                                        <tr>
                                            <th scope="col" className="text-muted fw-semibold" style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em',paddingLeft:'20px'}}>Blood Group</th>
                                            <th scope="col" className="text-muted fw-semibold" style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Type</th>
                                            <th scope="col" className="text-muted fw-semibold" style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Quantity</th>
                                            <th scope="col" className="text-muted fw-semibold" style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>{user?.role === "hospital" ? "From" : "Donor Email"}</th>
                                            <th scope="col" className="text-muted fw-semibold" style={{fontSize:'0.8rem',textTransform:'uppercase',letterSpacing:'0.05em'}}>Time & Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredData.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="text-center text-muted py-5">
                                                    <i className="fa-solid fa-box-open fa-2x mb-2 d-block"></i>
                                                    No records match your search criteria.
                                                </td>
                                            </tr>
                                        ) : filteredData.map((record) => (
                                            <tr key={record._id}>
                                                <td style={{paddingLeft:'20px'}}>
                                                    <span className="badge bg-danger rounded-pill px-3 py-2">
                                                        {record.bloodGroup}
                                                    </span>
                                                </td>
                                                <td>
                                                    {record.inventoryType === 'in' ? (
                                                        <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{backgroundColor:'#dcfce7',color:'#166534',fontSize:'0.8rem'}}>
                                                            &#8595; In
                                                        </span>
                                                    ) : (
                                                        <span className="badge rounded-pill px-3 py-2 fw-semibold" style={{backgroundColor:'#fef3c7',color:'#92400e',fontSize:'0.8rem'}}>
                                                            &#8593; Out
                                                        </span>
                                                    )}
                                                </td>
                                                <td><strong>{record.quantity}</strong> <span className="text-muted" style={{fontSize:'0.85rem'}}>units</span></td>
                                                <td className="text-muted" style={{fontSize:'0.9rem'}}>{record.email}</td>
                                                <td className="text-muted" style={{fontSize:'0.85rem'}}>
                                                    {moment(record.createdAt).format("DD/MM/YYYY hh:mm A")}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* --- Pagination --- */}
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

                        <Modal onRecordAdded={() => { getBloodRecords(1); fetchKpiStats(); }} />
                                <BulkImportModal onImportComplete={() => { getBloodRecords(1); fetchKpiStats(); }} />
                            </>
                        ) : (
                            <DisasterSimulator hospitalId={user?._id} />
                        )}
                    </div>
                </>
            )}
        </Layout>
    );
};

export default HomePage;