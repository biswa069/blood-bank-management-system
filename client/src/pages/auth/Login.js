import { toast } from "react-toastify";
import React from "react";
import Form from "../../components/shared/Form/Form";
import { useSelector } from "react-redux";
import Spinner from "./../../components/shared/Spinner";

const Login = () => {
    const { loading, error } = useSelector((state) => state.auth);
    return (
        <>
            {error && <span>{toast.error(error)}</span>}
            {loading ? (
                <Spinner />
            ) : (
                <div className="auth-page">
                    <div className="auth-banner">
                        <img src="./assets/images/banner1.jpg" alt="loginImage" />
                        <div className="auth-banner-overlay">
                            <h1>Welcome Back</h1>
                            <p>Sign in to manage your blood bank operations efficiently.</p>
                        </div>
                    </div>
                    <div className="auth-form-section">
                        <Form
                            formTitle={"Sign In"}
                            submitBtn={"Login"}
                            formType={"login"}
                        />
                    </div>
                </div>
            )}
        </>
    );
};

export default Login;