// import React, { useState } from "react";
// import { useSelector } from "react-redux";
// import InputType from "./../Form/InputType";
// import API from "./../../../services/API";

// const Modal = () => {
//     const [inventoryType, setInventoryType] = useState("in");
//     const [bloodGroup, setBloodGroup] = useState("");
//     const [quantity, setQuantity] = useState(0);
//     const [email, setEmail] = useState("");
//     const { user } = useSelector((state) => state.auth);

//     const handleModalSubmit = async () => {
//         try {
//             if (!bloodGroup || !quantity) {
//                 return alert("Please Provide All Fields");
//             }
//             const { data } = await API.post("/inventory/create-inventory", {
//                 email,
//                 organisation: user?._id,
//                 inventoryType,
//                 bloodGroup,
//                 quantity,
//             });
//             if (data?.success) {
//                 alert("New Record Created");
//                 window.location.reload();
//             }
//         } catch (error) {
//             alert(error.response.data.message);
//             console.log(error);
//             window.location.reload();
//         }
//     };
//     return (
//         <>
//             {/* Modal */}
//             <div
//                 className="modal fade"
//                 id="staticBackdrop"
//                 data-bs-backdrop="static"
//                 data-bs-keyboard="false"
//                 tabIndex={-1}
//                 aria-labelledby="staticBackdropLabel"
//                 aria-hidden="true"
//             >
//                 <div className="modal-dialog">
//                     <div className="modal-content">
//                         <div className="modal-header">
//                             <h1 className="modal-title fs-5" id="staticBackdropLabel">
//                                 Manage Blood Record
//                             </h1>
//                             <button
//                                 type="button"
//                                 className="btn-close"
//                                 data-bs-dismiss="modal"
//                                 aria-label="Close"
//                             />
//                         </div>
//                         <div className="modal-body">
//                             <div className="d-flex mb-3">
//                                 Blood Type: &nbsp;
//                                 <div className="form-check ms-3">
//                                     <input
//                                         type="radio"
//                                         name="inRadio"
//                                         defaultChecked
//                                         value={"in"}
//                                         onChange={(e) => setInventoryType(e.target.value)}
//                                         className="form-check-input"
//                                     />
//                                     <label htmlFor="in" className="form-check-label">
//                                         IN
//                                     </label>
//                                 </div>
//                                 <div className="form-check ms-3">
//                                     <input
//                                         type="radio"
//                                         name="inRadio"
//                                         value={"out"}
//                                         onChange={(e) => setInventoryType(e.target.value)}
//                                         className="form-check-input"
//                                     />
//                                     <label htmlFor="out" className="form-check-label">
//                                         OUT
//                                     </label>
//                                 </div>
//                             </div>
//                             <select
//                                 className="form-select"
//                                 aria-label="Default select example"
//                                 onChange={(e) => setBloodGroup(e.target.value)}
//                             >
//                                 <option defaultValue={"Open this select menu"}>
//                                     Open this select menu
//                                 </option>
//                                 <option value={"O+"}>O+</option>
//                                 <option value={"O-"}>O-</option>
//                                 <option value={"AB+"}>AB+</option>
//                                 <option value={"AB-"}>AB-</option>
//                                 <option value={"A+"}>A+</option>
//                                 <option value={"A-"}>A-</option>
//                                 <option value={"B+"}>B+</option>
//                                 <option value={"B-"}>B-</option>
//                             </select>
//                             {inventoryType === "in" ? (
//                                 <InputType
//                                     labelText={"Donor Email"}
//                                     labelFor={"donorEmail"}
//                                     inputType={"email"}
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                 />
//                             ) : (
//                                 <InputType
//                                     labelText={"Hospital Email"}
//                                     labelFor={"donorEmail"}
//                                     inputType={"email"}
//                                     value={email}
//                                     onChange={(e) => setEmail(e.target.value)}
//                                 />
//                             )}

//                             <InputType
//                                 labelText={"Quanitity (ML)"}
//                                 labelFor={"quantity"}
//                                 inputType={"Number"}
//                                 value={quantity}
//                                 onChange={(e) => setQuantity(e.target.value)}
//                             />
//                         </div>
//                         <div className="modal-footer">
//                             <button
//                                 type="button"
//                                 className="btn btn-secondary"
//                                 data-bs-dismiss="modal"
//                             >
//                                 Close
//                             </button>
//                             <button
//                                 type="button"
//                                 className="btn btn-primary"
//                                 onClick={handleModalSubmit}
//                             >
//                                 Submit
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }

// export default Modal

import React, { useState } from "react";
import { useSelector } from "react-redux";
import InputType from "./../Form/InputType";
import API from "./../../../services/API";

const Modal = ({ onRecordAdded }) => {
    const [inventoryType, setInventoryType] = useState("in");
    const [bloodGroup, setBloodGroup] = useState("");
    const [quantity, setQuantity] = useState(0);
    const [email, setEmail] = useState("");
    
    // UI States
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    
    const { user } = useSelector((state) => state.auth);

    const handleModalSubmit = async () => {
        try {
            setErrorMsg("");
            setSuccessMsg("");
            
            // Force quantity to 1 if it's a donation, otherwise parse the typed quantity
            const finalQuantity = inventoryType === "in" ? 1 : Number(quantity);

            if (!bloodGroup || bloodGroup === "Open this select menu" || !finalQuantity || !email) {
                return setErrorMsg("Please provide all fields correctly.");
            }
            
            setLoading(true);
            const { data } = await API.post("/inventory/create-inventory", {
                email,
                organisation: user?._id,
                inventoryType,
                bloodGroup,
                quantity: finalQuantity,
            });
            
            if (data?.success) {
                setSuccessMsg(data.message);
                // Reset form
                setBloodGroup("");
                setQuantity(0);
                setEmail("");
                
                // Tell parent to refresh data without reloading the whole page
                if(onRecordAdded) onRecordAdded();
                
                // Automatically hide modal after 1.5s
                setTimeout(() => {
                    document.getElementById("close-modal-btn").click();
                    setSuccessMsg("");
                }, 1500);
            }
        } catch (error) {
            // Displays exact error from backend
            setErrorMsg(error.response?.data?.message || "Something went wrong!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="modal fade"
            id="staticBackdrop"
            data-bs-backdrop="static"
            data-bs-keyboard="false"
            tabIndex={-1}
            aria-labelledby="staticBackdropLabel"
            aria-hidden="true"
        >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header bg-danger text-white">
                        <h1 className="modal-title fs-5" id="staticBackdropLabel">
                            <i className="fa-solid fa-droplet me-2"></i> Manage Blood Record
                        </h1>
                        <button
                            type="button"
                            className="btn-close btn-close-white"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                            id="close-modal-btn"
                            onClick={() => { setErrorMsg(""); setSuccessMsg(""); }}
                        />
                    </div>
                    <div className="modal-body">
                        {/* Status Messages */}
                        {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
                        {successMsg && <div className="alert alert-success py-2">{successMsg}</div>}

                        <div className="d-flex mb-4 p-2 bg-light rounded border">
                            <span className="fw-bold me-3">Record Type:</span>
                            <div className="form-check ms-3">
                                <input
                                    type="radio"
                                    name="inRadio"
                                    defaultChecked
                                    value={"in"}
                                    onChange={(e) => setInventoryType(e.target.value)}
                                    className="form-check-input text-danger"
                                />
                                <label htmlFor="in" className="form-check-label fw-semibold">
                                    IN (Donation)
                                </label>
                            </div>
                            <div className="form-check ms-3">
                                <input
                                    type="radio"
                                    name="inRadio"
                                    value={"out"}
                                    onChange={(e) => setInventoryType(e.target.value)}
                                    className="form-check-input"
                                />
                                <label htmlFor="out" className="form-check-label fw-semibold">
                                    OUT (Consumer)
                                </label>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label fw-semibold">Blood Group</label>
                            <select
                                className="form-select"
                                onChange={(e) => setBloodGroup(e.target.value)}
                                value={bloodGroup}
                            >
                                <option value="">Select Blood Group</option>
                                <option value={"O+"}>O+</option>
                                <option value={"O-"}>O-</option>
                                <option value={"AB+"}>AB+</option>
                                <option value={"AB-"}>AB-</option>
                                <option value={"A+"}>A+</option>
                                <option value={"A-"}>A-</option>
                                <option value={"B+"}>B+</option>
                                <option value={"B-"}>B-</option>
                            </select>
                        </div>

                        <InputType
                            labelText={inventoryType === "in" ? "Donor Email" : "Hospital Email"}
                            labelFor={"email"}
                            inputType={"email"}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        {/* Quantity Input Field */}
                        <div className="mb-3">
                            <label className="form-label fw-semibold">
                                Quantity (Units) 
                                {inventoryType === "in" && <span className="text-muted fw-normal ms-2" style={{fontSize: "0.8rem"}}>*Standard donation is 1 Unit</span>}
                            </label>
                            <input
                                type="number"
                                className="form-control"
                                value={inventoryType === "in" ? 1 : quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                disabled={inventoryType === "in"} // Locks the field for donations!
                                min={1}
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            data-bs-dismiss="modal"
                            onClick={() => { setErrorMsg(""); setSuccessMsg(""); }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className="btn btn-danger"
                            onClick={handleModalSubmit}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Submit Record"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;