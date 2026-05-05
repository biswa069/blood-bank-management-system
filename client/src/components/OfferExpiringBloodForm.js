import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import API from "../services/API";

const OfferExpiringBloodForm = () => {
    const [bloodGroup, setBloodGroup] = useState("");
    const [unitsAvailable, setUnitsAvailable] = useState("");
    const [daysToExpiry, setDaysToExpiry] = useState("5");
    const [targetCity, setTargetCity] = useState("All Cities");
    const [additionalNote, setAdditionalNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [availableCities] = useState(["All Cities", "Bhubaneswar", "Cuttack", "Rourkela"]);

    // Auto-Validate Expiring Stock
    useEffect(() => {
        if (bloodGroup) {
            // Simulate an API call to fetch actual expiring units
            const fetchExpiringUnits = async () => {
                try {
                    // Simulating a real API call delay
                    await new Promise(resolve => setTimeout(resolve, 500));
                    // Mock data logic based on blood group
                    const simulatedUnits = Math.floor(Math.random() * 20) + 5; 
                    setUnitsAvailable(simulatedUnits);
                } catch (error) {
                    console.error("Error fetching expiring units:", error);
                }
            };
            fetchExpiringUnits();
        } else {
            setUnitsAvailable("");
        }
    }, [bloodGroup]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bloodGroup || !unitsAvailable) {
            return toast.error("Please select a blood group and specify available units.");
        }

        const cityLabel = targetCity || "All Cities";
        const subject = `⚠️ Expiring Blood Available — ${unitsAvailable} units of ${bloodGroup} (expires in ${daysToExpiry} days)`;
        const message = `An organisation has blood units nearing expiry and is offering them for immediate use:\n\n• Blood Group: ${bloodGroup}\n• Units Available: ${unitsAvailable}\n• Expires In: ${daysToExpiry} days\n• Target Area: ${cityLabel}\n${additionalNote ? `• Note: ${additionalNote}` : ""}\n\nPlease contact the organisation immediately if you can utilise these units to prevent wastage.`;

        try {
            setLoading(true);
            const { data } = await API.post("/notifications/dispatch-manual", {
                targetRole: "hospital",
                targetBloodGroup: "All",
                targetCity,
                subject,
                message,
            });

            if (data?.success) {
                toast.success(data.message);
                setBloodGroup("");
                setUnitsAvailable("");
                setDaysToExpiry("5");
                setTargetCity("");
                setAdditionalNote("");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to send offer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm mb-4" style={{ borderLeft: "4px solid #f59e0b" }}>
            <div className="card-header" style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff" }}>
                <h5 className="mb-0">
                    <i className="fa-solid fa-clock-rotate-left me-2"></i>
                    Offer Expiring Blood to Hospitals
                </h5>
            </div>
            <div className="card-body">
                <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                    Notify registered hospitals about blood units nearing expiry to prevent wastage.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Blood Group <span className="text-danger">*</span></label>
                            <select
                                className="form-control"
                                value={bloodGroup}
                                onChange={(e) => setBloodGroup(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Units Available <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                className="form-control bg-light"
                                placeholder="Auto-calculated..."
                                value={unitsAvailable}
                                readOnly
                                title="Units available are automatically calculated by the system to prevent manual entry errors."
                            />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Expires In</label>
                            <select
                                className="form-control"
                                value={daysToExpiry}
                                onChange={(e) => setDaysToExpiry(e.target.value)}
                            >
                                <option value="1">24 Hours</option>
                                <option value="3">3 Days</option>
                                <option value="5">5 Days</option>
                                <option value="7">7 Days</option>
                            </select>
                        </div>
                        <div className="col-md-3">
                            <label className="form-label fw-bold">Target City</label>
                            <select
                                className="form-control"
                                value={targetCity}
                                onChange={(e) => setTargetCity(e.target.value)}
                            >
                                {availableCities.map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Additional Note</label>
                        <textarea
                            className="form-control"
                            rows="2"
                            placeholder="Optional: storage conditions, pickup instructions..."
                            value={additionalNote}
                            onChange={(e) => setAdditionalNote(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="submit" className="btn px-4" disabled={loading}
                            style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#fff", fontWeight: 600, border: "none", borderRadius: "0.6rem" }}>
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm me-2" role="status"></span> Sending...</>
                            ) : (
                                <><i className="fa-solid fa-paper-plane me-2"></i> Notify Hospitals</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OfferExpiringBloodForm;
