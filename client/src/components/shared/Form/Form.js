import React, { useState } from "react";
import InputType from "./InputType";
import { Link } from "react-router-dom";
import { handleLogin, handleRegister } from "../../../services/authService";

const Form = ({ formType, submitBtn, formTitle }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("donor");
    const [name, setName] = useState("");
    const [organisationName, setOrganisationName] = useState("");
    const [hospitalName, setHospitalName] = useState("");
    const [website, setWebsite] = useState("");
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
                            website,
                            bloodGroup
                        );
                }}
            >
                <h2 className="text-center mb-4 font-weight-bold" style={{color: 'var(--text-main)', letterSpacing: '1px'}}>{formTitle}</h2>
                <div className="d-flex mb-4 gap-3 justify-content-center flex-wrap">
                    <div className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name="role"
                            id="donorRadio"
                            value={"donor"}
                            onChange={(e) => setRole(e.target.value)}
                            defaultChecked
                        />
                        <label htmlFor="donorRadio" className="form-check-label">
                            Donor
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name="role"
                            id="adminRadio"
                            value={"admin"}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label htmlFor="adminRadio" className="form-check-label">
                            Admin
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name="role"
                            id="hospitalRadio"
                            value={"hospital"}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label htmlFor="hospitalRadio" className="form-check-label">
                            Hospital
                        </label>
                    </div>
                    <div className="form-check">
                        <input
                            type="radio"
                            className="form-check-input"
                            name="role"
                            id="organisationRadio"
                            value={"organisation"}
                            onChange={(e) => setRole(e.target.value)}
                        />
                        <label htmlFor="organisationRadio" className="form-check-label">
                            Organisation
                        </label>
                    </div>
                </div>
                {/* switch statement */}
                {(() => {
                    //eslint-disable-next-line
                    switch (true) {
                        case formType === "login": {
                            return (
                                <>
                                    <InputType
                                        labelText={"email"}
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
                                            labelText={"Name"}
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
                                        labelText={"email"}
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
                                    <InputType
                                        labelText={"website"}
                                        labelFor={"forWebsite"}
                                        inputType={"text"}
                                        name={"website"}
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                    />
                                    <InputType
                                        labelText={"Address"}
                                        labelFor={"forAddress"}
                                        inputType={"text"}
                                        name={"address"}
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                    />
                                    <InputType
                                        labelText={"Phone"}
                                        labelFor={"forPhone"}
                                        inputType={"text"}
                                        name={"phone"}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                    />
                                    {role === "donor" && (
                                        <div className="mb-3">
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

                <div className="d-flex flex-column mt-4">
                    <button className="btn btn-primary w-100 mb-3" type="submit">
                        {submitBtn}
                    </button>
                    {formType === "login" ? (
                        <p className="text-center text-muted">
                            Not registered yet?
                            <Link to="/register" className="ms-1 font-weight-bold">Register Here!</Link>
                        </p>
                    ) : (
                        <p className="text-center text-muted">
                            Already registered?
                            <Link to="/login" className="ms-1 font-weight-bold">Login!</Link>
                        </p>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Form;