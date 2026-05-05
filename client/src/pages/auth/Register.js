import { toast } from "react-toastify";
import React from "react";
import Form from "../../components/shared/Form/Form";
import { useSelector } from "react-redux";
import Spinner from "../../components/shared/Spinner";

const Register = () => {
    const { loading, error } = useSelector((state) => state.auth);
    return (
        <>
            {error && <span>{toast.error(error)}</span>}
            {loading ? (
                <Spinner />
            ) : (
                <div className="auth-page">
                    <div className="auth-banner">
                        <img src="./assets/images/banner2.jpg" alt="registerImage" />
                        <div className="auth-banner-overlay">
                            <h1>Join Us Today</h1>
                            <p>Register to save lives by managing blood donations efficiently.</p>
                        </div>
                    </div>
                    <div className="auth-form-section">
                        <Form
                            formTitle={"Create Account"}
                            submitBtn={"Register"}
                            formType={"register"}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Register;