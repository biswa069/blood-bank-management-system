import React from "react";
// import { userMenu } from "./Menus/userMenu";
import { useLocation, Link } from "react-router-dom";
import "../../../styles/Layout.css";
import { useSelector } from "react-redux";

const Sidebar = () => {
    //GET USER STATE
    const { user } = useSelector((state) => state.auth);

    const location = useLocation();

    return (
        <div className="sidebar">
            <div className="menu">
                {user?.role === "organisation" && (
                    <>
                        <div
                            className={`menu-item ${location.pathname === "/" && "active"}`}
                        >
                            <i className="fa-solid fa-warehouse"></i>
                            <Link to="/">Inventory</Link>
                        </div>
                        <div
                            className={`menu-item ${location.pathname === "/analytics" && "active"}`}
                        >
                            <i className="fa-solid fa-chart-bar"></i>
                            <Link to="/analytics">Analytics</Link>
                        </div>
                        <div
                            className={`menu-item ${location.pathname === "/donor" && "active"
                                }`}
                        >
                            <i className="fa-solid fa-hand-holding-medical"></i>
                            <Link to="/donor">Donor</Link>
                        </div>
                        <div
                            className={`menu-item ${location.pathname === "/hospital" && "active"
                                }`}
                        >
                            <i className="fa-solid fa-hospital"></i>
                            <Link to="/hospital">Hospital</Link>
                        </div>
                        <div
                            className={`menu-item ${location.pathname === "/broadcast" && "active"
                                }`}
                        >
                            <i className="fa-solid fa-envelope"></i>
                            <Link to="/broadcast">Email Centre</Link>
                        </div>
                        <div
                            className={`menu-item ${location.pathname === "/hospital-fl" && "active"
                                }`}
                        >
                            <i className="fa-solid fa-network-wired"></i>
                            <Link to="/hospital-fl">Local AI Node Interface</Link>
                        </div>
                    </>
                )}
                {user?.role === "admin" && (
                    <>
                        <div
                            className={`menu-item ${location.pathname === "/donor-list" && "active"
                                }`}
                        >
                            <i className="fa-solid fa-warehouse"></i>
                            <Link to="/donor-list">Donor List</Link>
                        </div>
                        <div
                            className={`menu-item ${location.pathname === "/hospital-list" && "active"
                                }`}
                        >
                            <i className="fa-solid fa-hand-holding-medical"></i>
                            <Link to="/hospital-list">Hospital List</Link>
                        </div>
                        <div
                            className={`menu-item ${location.pathname === "/org-list" && "active"
                                }`}
                        >
                            <i className="fa-solid fa-hospital"></i>
                            <Link to="/org-list">Organisation List</Link>
                        </div>
                        <div
                            className={`menu-item ${location.pathname === "/notification-logs" && "active"
                                }`}
                        >
                            <i className="fa-solid fa-bell"></i>
                            <Link to="/notification-logs">Notification Logs</Link>
                        </div>
                        <div
                            className={`menu-item ${location.pathname === "/admin-fl" && "active"
                                }`}
                        >
                            <i className="fa-solid fa-globe"></i>
                            <Link to="/admin-fl">Global Federated Network</Link>
                        </div>
                    </>
                )}
                {user?.role === "hospital" && (
                    <div
                        className={`menu-item ${location.pathname === "/donation" && "active"
                            }`}
                    >
                        <i className="fa-sharp fa-solid fa-building-ngo"></i>
                        <Link to="/donation">Blood Received</Link>
                    </div>
                )}
                {user?.role === "hospital" && (
                    <div
                        className={`menu-item ${location.pathname === "/consumer" && "active"
                            }`}
                    >
                        <i className="fa-sharp fa-solid fa-building-ngo"></i>
                        <Link to="/consumer">Consumer</Link>
                    </div>
                )}
                {user?.role === "hospital" && (
                    <div
                        className={`menu-item ${location.pathname === "/broadcast" && "active"
                            }`}
                    >
                        <i className="fa-solid fa-envelope"></i>
                        <Link to="/broadcast">Email Centre</Link>
                    </div>
                )}
                {user?.role === "hospital" && (
                    <div
                        className={`menu-item ${location.pathname === "/analytics" && "active"}`}
                    >
                        <i className="fa-solid fa-chart-bar"></i>
                        <Link to="/analytics">Analytics</Link>
                    </div>
                )}
                {user?.role === "hospital" && (
                    <div
                        className={`menu-item ${location.pathname === "/hospital-fl" && "active"
                            }`}
                    >
                        <i className="fa-solid fa-network-wired"></i>
                        <Link to="/hospital-fl">Local AI Node Interface</Link>
                    </div>
                )}
                {user?.role === "donor" && (
                    <div
                        className={`menu-item ${location.pathname === "/donation" && "active"
                            }`}
                    >
                        <i className="fa-sharp fa-solid fa-building-ngo"></i>
                        <Link to="/donation">Blood Received</Link>
                    </div>
                )}

                {/* {userMenu.map((menu) => {
        const isActive = location.pathname === menu.path;
        return (
          <div
            className={`menu-item ${isActive && "active"}`}
            key={menu.name}
          >
            <i className={menu.icon}></i>
            <Link to={menu.path}>{menu.name}</Link>
          </div>
        );
      })} */}

                {/* Settings — visible for all roles */}
                <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-color)", paddingTop: "0.5rem" }}>
                    <div
                        className={`menu-item ${location.pathname === "/settings" && "active"}`}
                    >
                        <i className="fa-solid fa-gear"></i>
                        <Link to="/settings">Settings</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;