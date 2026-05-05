import React, { useState } from "react";
import InputType from "./InputType";
import { Link } from "react-router-dom";
import { handleLogin, handleRegister } from "../../../services/authService";
import { CITIES } from "../../../constants/cities";

const Form = ({ formType, submitBtn, formTitle }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("donor");
    const [name, setName] = useState("");
    const [organisationName, setOrganisationName] = useState("");
    const [hospitalName, setHospitalName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [bloodGroup, setBloodGroup] = useState("");
    return (
        <div className="auth-card">
            <form
                onSubmit={(e) => {
                    if (formType === "login")
                        return handleLogin(e, email, password, role);
                    else if (formType === "register")
                        return handleRegister(
                            e,
                            name,
                            role,
                            email,
                            password,
                            phone,
                            organisationName,
                            address,
                            hospitalName,
                            "",
                            bloodGroup
                        );
                }}
            >
                <h2 className="auth-title">{formTitle}</h2>
                <p className="auth-subtitle">
                    {formType === "login"
                        ? "Welcome back! Sign in to continue."
                        : "Create your account to get started."}
                </p>

                {formType === "register" && (
                    <div className="role-selector">
                        {[
                            { id: "donor", label: "Donor", icon: "fa-hand-holding-droplet" },
                            { id: "admin", label: "Admin", icon: "fa-user-shield" },
                            { id: "hospital", label: "Hospital", icon: "fa-hospital" },
                            { id: "organisation", label: "Organisation", icon: "fa-building-ngo" },
                        ].map((r) => (
                            <label
                                key={r.id}
                                className={`role-option ${role === r.id ? "role-active" : ""}`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={r.id}
                                    checked={role === r.id}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                <i className={`fa-solid ${r.icon}`}></i>
                                <span>{r.label}</span>
                            </label>
                        ))}
                    </div>
                )}

                {formType === "login" && (
                    <div className="role-selector">
                        {[
                            { id: "donor", label: "Donor", icon: "fa-hand-holding-droplet" },
                            { id: "admin", label: "Admin", icon: "fa-user-shield" },
                            { id: "hospital", label: "Hospital", icon: "fa-hospital" },
                            { id: "organisation", label: "Organisation", icon: "fa-building-ngo" },
                        ].map((r) => (
                            <label
                                key={r.id}
                                className={`role-option ${role === r.id ? "role-active" : ""}`}
                            >
                                <input
                                    type="radio"
                                    name="role"
                                    value={r.id}
                                    checked={role === r.id}
                                    onChange={(e) => setRole(e.target.value)}
                                />
                                <i className={`fa-solid ${r.icon}`}></i>
                                <span>{r.label}</span>
                            </label>
                        ))}
                    </div>
                )}

                {/* switch statement */}
                {(() => {
                    //eslint-disable-next-line
                    switch (true) {
                        case formType === "login": {
                            return (
                                <>
                                    <InputType
                                        labelText={"Email"}
                                        labelFor={"forEmail"}
                                        inputType={"email"}
                                        name={"email"}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <InputType
                                        labelText={"Password"}
                                        labelFor={"forPassword"}
                                        inputType={"password"}
                                        name={"password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </>
                            );
                        }
                        case formType === "register": {
                            return (
                                <>
                                    {(role === "admin" || role === "donor") && (
                                        <InputType
                                            labelText={"Full Name"}
                                            labelFor={"forName"}
                                            inputType={"text"}
                                            name={"name"}
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    )}
                                    {role === "organisation" && (
                                        <InputType
                                            labelText={"Organisation Name"}
                                            labelFor={"forOrganisationName"}
                                            inputType={"text"}
                                            name={"organisationName"}
                                            value={organisationName}
                                            onChange={(e) => setOrganisationName(e.target.value)}
                                        />
                                    )}
                                    {role === "hospital" && (
                                        <InputType
                                            labelText={"Hospital Name"}
                                            labelFor={"forHospitalName"}
                                            inputType={"text"}
                                            name={"hospitalName"}
                                            value={hospitalName}
                                            onChange={(e) => setHospitalName(e.target.value)}
                                        />
                                    )}

                                    <InputType
                                        labelText={"Email"}
                                        labelFor={"forEmail"}
                                        inputType={"email"}
                                        name={"email"}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                    <InputType
                                        labelText={"Password"}
                                        labelFor={"forPassword"}
                                        inputType={"password"}
                                        name={"password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />

                                    <div className="row">
                                        <div className="col-md-6">
                                            <InputType
                                                labelText={"Phone"}
                                                labelFor={"forPhone"}
                                                inputType={"text"}
                                                name={"phone"}
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <div className="mb-1">
                                                <label htmlFor="forCity" className="form-label">
                                                    City
                                                </label>
                                                <select
                                                    className="form-control"
                                                    name="address"
                                                    value={address}
                                                    onChange={(e) => setAddress(e.target.value)}
                                                    required
                                                >
                                                    <option value="" disabled>Select your city</option>
                                                    {CITIES.map((city) => (
                                                        <option key={city} value={city}>{city}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {role === "donor" && (
                                        <div className="mb-1">
                                            <label htmlFor="forBloodGroup" className="form-label">
                                                Blood Group
                                            </label>
                                            <select
                                                className="form-control"
                                                name="bloodGroup"
                                                value={bloodGroup}
                                                onChange={(e) => setBloodGroup(e.target.value)}
                                            >
                                                <option value="">Select Blood Group</option>
                                                <option value="A+">A+</option>
                                                <option value="A-">A-</option>
                                                <option value="B+">B+</option>
                                                <option value="B-">B-</option>
                                                <option value="AB+">AB+</option>
                                                <option value="AB-">AB-</option>
                                                <option value="O+">O+</option>
                                                <option value="O-">O-</option>
                                            </select>
                                        </div>
                                    )}
                                </>
                            );
                        }
                    }
                })()}

                <div className="d-flex flex-column mt-3">
                    <button className="btn btn-primary w-100 mb-3" type="submit">
                        {submitBtn}
                    </button>
                    {formType === "login" ? (
                        <p className="text-center text-muted" style={{ fontSize: '0.9rem' }}>
                            Not registered yet?
                            <Link to="/register" className="ms-1 fw-semibold">Register Here!</Link>
                        </p>
                    ) : (
                        <p className="text-center text-muted" style={{ fontSize: '0.9rem' }}>
                            Already registered?
                            <Link to="/login" className="ms-1 fw-semibold">Login!</Link>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Form;