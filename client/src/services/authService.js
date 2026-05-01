import { toast } from "react-toastify";
import { userLogin, userRegister } from "../redux/features/auth/authActions";
import store from "../redux/store";

export const handleLogin = (e, email, password, role) => {
    e.preventDefault();
    try {
        if (!role || !email || !password) {
            return toast.error("Please Provide All Fields");
        }
        store.dispatch(userLogin({ email, password, role }));
    } catch (error) {
        console.log(error);
    }
};

export const handleRegister = (
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
) => {
    e.preventDefault();
    try {
        store.dispatch(
            userRegister({
                name,
                role,
                email,
                password,
                phone,
                organisationName,
                address,
                hospitalName,
                website,
                bloodGroup,
            })
        );
    } catch (error) {
        console.log(error);
    }
};