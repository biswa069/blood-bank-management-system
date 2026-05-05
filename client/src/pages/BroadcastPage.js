import React from "react";
import { useSelector } from "react-redux";
import Layout from "../components/shared/Layout/Layout";
import ManualBroadcastForm from "../components/ManualBroadcastForm";
import RequestBloodForm from "../components/RequestBloodForm";
import OfferExpiringBloodForm from "../components/OfferExpiringBloodForm";

const BroadcastPage = () => {
    const { user } = useSelector((state) => state.auth);

    return (
        <Layout>
            <div className="container mt-4">
                <h2 className="mb-2" style={{ color: 'var(--text-main)', fontWeight: '600' }}>
                    <i className="fa-solid fa-envelope me-2"></i>Email & Notifications
                </h2>
                <p className="text-muted mb-4">
                    Send targeted emails to donors, request blood from organisations, or notify hospitals about expiring stock.
                </p>

                {/* Organisation: Offer Expiring Blood to Hospitals */}
                {user?.role === "organisation" && (
                    <OfferExpiringBloodForm />
                )}

                {/* Hospital: Request Blood from Organisations */}
                {user?.role === "hospital" && (
                    <RequestBloodForm />
                )}

                {/* Both: Broadcast to Donors */}
                <ManualBroadcastForm />
            </div>
        </Layout>
    );
};

export default BroadcastPage;
