import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
    return (
        <div className="layout-page">
            <div className="layout-header">
                <Header />
            </div>
            <div className="layout-main">
                <div className="layout-sidebar">
                    <Sidebar />
                </div>
                <div className="layout-content">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Layout;