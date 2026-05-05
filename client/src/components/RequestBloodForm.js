import React, { useState } from "react";
import { toast } from "react-toastify";
import API from "../services/API";

const RequestBloodForm = () => {
    const [bloodGroup, setBloodGroup] = useState("");
    const [unitsNeeded, setUnitsNeeded] = useState("");
    const [urgency, setUrgency] = useState("normal");
    const [additionalNote, setAdditionalNote] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!bloodGroup || !unitsNeeded) {
            return toast.error("Please select a blood group and specify units needed.");
        }

        const urgencyLabel = urgency === "critical" ? "🔴 CRITICAL" : urgency === "urgent" ? "🟠 URGENT" : "🟢 Normal";
        const subject = `${urgencyLabel} — Blood Request: ${unitsNeeded} units of ${bloodGroup} needed`;
        const message = `A hospital has submitted a blood request:\n\n• Blood Group: ${bloodGroup}\n• Units Required: ${unitsNeeded}\n• Priority: ${urgencyLabel}\n${additionalNote ? `• Note: ${additionalNote}` : ""}\n\nPlease check your inventory and arrange supply at the earliest.`;

        try {
            setLoading(true);
            const { data } = await API.post("/notifications/dispatch-manual", {
                targetRole: "organisation",
                targetBloodGroup: "All",
                subject,
                message,
            });

            if (data?.success) {
                toast.success(data.message);
                setBloodGroup("");
                setUnitsNeeded("");
                setUrgency("normal");
                setAdditionalNote("");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Failed to send request.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm mb-4" style={{ borderLeft: "4px solid #3b82f6" }}>
            <div className="card-header" style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff" }}>
                <h5 className="mb-0">
                    <i className="fa-solid fa-hand-holding-medical me-2"></i>
                    Request Blood from Organisations
                </h5>
            </div>
            <div className="card-body">
                <p className="text-muted mb-3" style={{ fontSize: "0.85rem" }}>
                    Send an email blast to all registered organisations requesting specific blood units.
                </p>
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-4">
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
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Units Needed <span className="text-danger">*</span></label>
                            <input
                                type="number"
                                className="form-control"
                                placeholder="e.g. 5"
                                min="1"
                                value={unitsNeeded}
                                onChange={(e) => setUnitsNeeded(e.target.value)}
                                required
                            />
                        </div>
                        <div className="col-md-4">
                            <label className="form-label fw-bold">Priority</label>
                            <select
                                className="form-control"
                                value={urgency}
                                onChange={(e) => setUrgency(e.target.value)}
                            >
                                <option value="normal">Normal</option>
                                <option value="urgent">Urgent</option>
                                <option value="critical">Critical</option>
                            </select>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="form-label fw-bold">Additional Note</label>
                        <textarea
                            className="form-control"
                            rows="2"
                            placeholder="Optional: patient details, special instructions..."
                            value={additionalNote}
                            onChange={(e) => setAdditionalNote(e.target.value)}
                        ></textarea>
                    </div>
                    <div className="d-flex justify-content-end">
                        <button type="submit" className="btn px-4" disabled={loading}
                            style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)", color: "#fff", fontWeight: 600, border: "none", borderRadius: "0.6rem" }}>
                            {loading ? (
                                <><span className="spinner-border spinner-border-sm me-2" role="status"></span> Sending...</>
                            ) : (
                                <><i className="fa-solid fa-paper-plane me-2"></i> Send Request</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestBloodForm;
