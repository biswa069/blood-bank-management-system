import { toast } from "react-toastify";
import React from "react";
import { BiDonateBlood, BiUserCircle, BiMoon, BiSun } from "react-icons/bi";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
const Header = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Theme toggle state
    const [theme, setTheme] = useState(
        localStorage.getItem("theme") || "light"
    );

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    // logout handler
    const handleLogout = () => {
        localStorage.clear();
        toast.success("Logged out successfully");
        navigate("/login");
    };

    return (
        <>
            <nav className="navbar">
                <div className="container-fluid ">
                    <div className="navbar-brand h1 ">
                        <BiDonateBlood color="red" /> Blood Bank App
                    </div>
                    <ul className="navbar-nav flex-row">
                        <li className="nav-item mx-3">
                            <p className="nav-link">
                                <BiUserCircle /> Welcome{" "}
                                {user?.name || user?.hospitalName || user?.organisationName}
                                &nbsp;
                                <span className="badge bg-secondary">{user?.role}</span>
                            </p>
                        </li>
                        {location.pathname !== "/" && (
                            <li className="nav-item mx-3">
                                <Link to="/" className="nav-link">
                                    Home
                                </Link>
                            </li>
                        )}
                        {location.pathname === "/" && user?.role !== "donor" && (
                            <li className="nav-item mx-3">
                                <Link to="/analytics" className="nav-link">
                                    Analytics
                                </Link>
                            </li>
                        )}
                        <li className="nav-item mx-3 d-flex align-items-center">
                            <button
                                className="btn btn-outline-secondary border-0 p-2 d-flex align-items-center justify-content-center"
                                onClick={toggleTheme}
                                style={{ borderRadius: "50%", width: "40px", height: "40px" }}
                                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                            >
                                {theme === "light" ? <BiMoon size={22} /> : <BiSun size={22} color="white" />}
                            </button>
                        </li>
                        <li className="nav-item mx-3">
                            <button className="btn btn-danger" onClick={handleLogout}>
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        </>
    );
};

export default Header;