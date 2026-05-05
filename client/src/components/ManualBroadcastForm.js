import React, { useState } from "react";
import { toast } from "react-toastify";
import API from "../services/API";

const ManualBroadcastForm = () => {
    const [targetBloodGroup, setTargetBloodGroup] = useState("All");
    const [targetCity, setTargetCity] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [availableCities] = useState(["All Cities", "Bhubaneswar", "Cuttack", "Rourkela"]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!targetBloodGroup || targetBloodGroup === "All" || targetBloodGroup === "Select Blood Group") {
            console.error("Validation Failed:", { targetCity, targetBloodGroup, subject, message });
            return toast.error("Please select a specific Target Blood Group.");
        }
        
        if (!targetCity || targetCity === "" || targetCity === "Select Target City" || targetCity === "All Cities") {
            console.error("Validation Failed:", { targetCity, targetBloodGroup, subject, message });
            return toast.error("Please select a specific Target City.");
        }

        if (!subject || !message) {
            console.error("Validation Failed:", { targetCity, targetBloodGroup, subject, message });
            return toast.error("Please fill in all required fields.");
        }

        try {
            setIsSending(true);
            // Construct specific JSON payload designed for the backend controller
            const payload = { 
                targetRole: "donor",
                targetBloodGroup: targetBloodGroup,
                targetCity: targetCity,
                subject: subject,
                message: message
            };
            
            console.log("Sending Payload:", payload);
            console.log("🌐 FRONTEND FIRING TO URL:", "/notifications/dispatch-manual");

            const { data } = await API.post("/notifications/dispatch-manual", payload);

            if (data?.success) {
                toast.success(`Successfully sent ${data.successfullySent} emails!`);
                setTargetBloodGroup("All");
                setTargetCity("");
                setSubject("");
                setMessage("");
            }
        } catch (error) {
            if (error.response) {
                // The request was made and the server responded with a status code
                console.error("Backend Error Response:", error.response.data);
            } else {
                // Something happened in setting up the request
                console.error("Axios/Network Error:", error.message);
            }
            toast.error(error.response?.data?.message || "Failed to send broadcast");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="card shadow-sm mb-4">
            <div className="card-header bg-primary text-white">
                <h5 className="mb-0"><i className="fa-solid fa-bullhorn me-2"></i>Broadcast Email to Donors</h5>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Target Blood Group</label>
                            <select
                                className="form-control"
                                value={targetBloodGroup}
                                onChange={(e) => setTargetBloodGroup(e.target.value)}
                            >
                                <option value="All" disabled>Select Blood Group</option>
                                <option value="O+">O+</option>
                                <option value="O-">O-</option>
                                <option value="AB+">AB+</option>
                                <option value="AB-">AB-</option>
                                <option value="A+">A+</option>
                                <option value="A-">A-</option>
                                <option value="B+">B+</option>
                                <option value="B-">B-</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-bold">Target City</label>
                            <select
                                className="form-control"
                                value={targetCity}
                                onChange={(e) => setTargetCity(e.target.value)}
                            >
                                <option value="" disabled>Select Target City</option>
                                {availableCities.filter(c => c !== "All Cities").map((city) => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Email Subject <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Urgent Blood Requirement"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label fw-bold">Message Body <span className="text-danger">*</span></label>
                        <textarea
                            className="form-control"
                            rows="4"
                            placeholder="Type your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-primary px-4" disabled={isSending}>
                            {isSending ? (
                                <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Sending...</>
                            ) : (
                                <><i className="fa-solid fa-paper-plane me-2"></i> Send to Donors</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualBroadcastForm;
