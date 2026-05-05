import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Layout from "../components/shared/Layout/Layout";
import LayoutNoSidebar from "../components/shared/Layout/LayoutNoSidebar";
import API from "../services/API";
import { getCurrentUser } from "../redux/features/auth/authActions";
import { CITIES } from "../constants/cities";

const SettingsPage = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();

    // Profile fields
    const [name, setName] = useState(user?.name || "");
    const [organisationName, setOrganisationName] = useState(user?.organisationName || "");
    const [hospitalName, setHospitalName] = useState(user?.hospitalName || "");
    const [email, setEmail] = useState(user?.email || "");
    const [phone, setPhone] = useState(user?.phone || "");
    const [address, setAddress] = useState(user?.address || "");
    const [city, setCity] = useState(user?.city || "");

    // Password fields
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loadingProfile, setLoadingProfile] = useState(false);
    const [loadingPassword, setLoadingPassword] = useState(false);

    const getDisplayName = () => {
        if (user?.role === "organisation") return organisationName;
        if (user?.role === "hospital") return hospitalName;
        return name;
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        try {
            setLoadingProfile(true);
            const payload = { email, phone, address, city };
            if (user?.role === "donor" || user?.role === "admin") payload.name = name;
            if (user?.role === "organisation") payload.organisationName = organisationName;
            if (user?.role === "hospital") payload.hospitalName = hospitalName;

            const { data } = await API.put("/auth/update-profile", payload);
            if (data?.success) {
                toast.success(data.message);
                dispatch(getCurrentUser());
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile.");
        } finally {
            setLoadingProfile(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return toast.error("New passwords do not match.");
        }
        if (newPassword.length < 6) {
            return toast.error("Password must be at least 6 characters.");
        }
        try {
            setLoadingPassword(true);
            const { data } = await API.put("/auth/update-password", {
                currentPassword,
                newPassword,
            });
            if (data?.success) {
                toast.success("Password changed successfully! Logging out...");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                // Auto-logout after password change
                setTimeout(() => {
                    localStorage.removeItem("token");
                    window.location.replace("/login");
                }, 1500);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to change password.");
        } finally {
            setLoadingPassword(false);
        }
    };

    // Choose layout based on role: donors use LayoutNoSidebar, others use Layout
    const PageLayout = user?.role === "donor" ? LayoutNoSidebar : Layout;

    return (
        <PageLayout>
            <div className="container" style={{ maxWidth: "800px" }}>
                {/* Profile Header */}
                <div className="settings-header mb-4">
                    <div className="settings-avatar">
                        <i className="fa-solid fa-user"></i>
                    </div>
                    <div>
                        <h2 style={{ color: "var(--text-main)", fontWeight: 700, margin: 0 }}>
                            {getDisplayName()}
                        </h2>
                        <p style={{ color: "var(--text-muted)", margin: 0 }}>
                            <span className="badge bg-danger me-2" style={{ textTransform: "capitalize" }}>{user?.role}</span>
                            {user?.email}
                        </p>
                    </div>
                </div>

                {/* General Information Card */}
                <div className="card shadow-sm mb-4" style={{ borderRadius: "1rem", border: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
                    <div className="card-header" style={{ background: "transparent", borderBottom: "1px solid var(--border-color)", padding: "1.2rem 1.5rem" }}>
                        <h5 className="mb-0" style={{ color: "var(--text-main)", fontWeight: 600 }}>
                            <i className="fa-solid fa-user-pen me-2" style={{ color: "var(--primary)" }}></i>
                            General Information
                        </h5>
                    </div>
                    <div className="card-body" style={{ padding: "1.5rem" }}>
                        <form onSubmit={handleProfileUpdate}>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold" style={{ color: "var(--text-muted)" }}>
                                        {user?.role === "organisation" ? "Organisation Name" : user?.role === "hospital" ? "Hospital Name" : "Full Name"}
                                    </label>
                                    {user?.role === "organisation" ? (
                                        <input type="text" className="form-control" value={organisationName} onChange={(e) => setOrganisationName(e.target.value)} />
                                    ) : user?.role === "hospital" ? (
                                        <input type="text" className="form-control" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} />
                                    ) : (
                                        <input type="text" className="form-control" value={name} onChange={(e) => setName(e.target.value)} />
                                    )}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold" style={{ color: "var(--text-muted)" }}>Email</label>
                                    <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold" style={{ color: "var(--text-muted)" }}>Phone</label>
                                    <input type="text" className="form-control" value={phone} onChange={(e) => setPhone(e.target.value)} />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label fw-bold" style={{ color: "var(--text-muted)" }}>City</label>
                                    <select className="form-control" value={city} onChange={(e) => setCity(e.target.value)}>
                                        <option value="">Select your city</option>
                                        {CITIES.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold" style={{ color: "var(--text-muted)" }}>Address</label>
                                    <input type="text" className="form-control" value={address} onChange={(e) => setAddress(e.target.value)} />
                                </div>
                            </div>

                            {/* Read-only info */}
                            <div className="row mb-3">
                                <div className="col-md-6">
                                    <label className="form-label fw-bold" style={{ color: "var(--text-muted)" }}>Role</label>
                                    <input type="text" className="form-control" value={user?.role} disabled style={{ textTransform: "capitalize", opacity: 0.7 }} />
                                </div>
                                {user?.role === "donor" && (
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold" style={{ color: "var(--text-muted)" }}>Blood Group</label>
                                        <input type="text" className="form-control" value={user?.bloodGroup || "N/A"} disabled style={{ opacity: 0.7 }} />
                                    </div>
                                )}
                            </div>

                            <div className="d-flex justify-content-end">
                                <button type="submit" className="btn btn-primary px-4" disabled={loadingProfile}>
                                    {loadingProfile ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span> Saving...</>
                                    ) : (
                                        <><i className="fa-solid fa-check me-2"></i> Save Changes</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Security & Password Card */}
                <div className="card shadow-sm mb-4" style={{ borderRadius: "1rem", border: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
                    <div className="card-header" style={{ background: "transparent", borderBottom: "1px solid var(--border-color)", padding: "1.2rem 1.5rem" }}>
                        <h5 className="mb-0" style={{ color: "var(--text-main)", fontWeight: 600 }}>
                            <i className="fa-solid fa-lock me-2" style={{ color: "var(--primary)" }}></i>
                            Security & Password
                        </h5>
                    </div>
                    <div className="card-body" style={{ padding: "1.5rem" }}>
                        <form onSubmit={handlePasswordChange}>
                            <div className="row mb-3">
                                <div className="col-md-4">
                                    <label className="form-label fw-bold" style={{ color: "var(--text-muted)" }}>Current Password</label>
                                    <input type="password" className="form-control" placeholder="••••••••" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold" style={{ color: "var(--text-muted)" }}>New Password</label>
                                    <input type="password" className="form-control" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label fw-bold" style={{ color: "var(--text-muted)" }}>Confirm Password</label>
                                    <input type="password" className="form-control" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                                </div>
                            </div>
                            <div className="d-flex justify-content-end">
                                <button type="submit" className="btn px-4" disabled={loadingPassword}
                                    style={{ background: "var(--bg-darker)", color: "var(--text-main)", border: "1px solid var(--border-color)", fontWeight: 600, borderRadius: "0.6rem" }}>
                                    {loadingPassword ? (
                                        <><span className="spinner-border spinner-border-sm me-2"></span> Updating...</>
                                    ) : (
                                        <><i className="fa-solid fa-key me-2"></i> Update Password</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </PageLayout>
    );
};

export default SettingsPage;
