// import { toast } from "react-toastify";
// import { createAsyncThunk } from "@reduxjs/toolkit";
// import API from "../../../services/API";


// export const userLogin = createAsyncThunk(
//     "auth/login",
//     async ({ role, email, password }, { rejectWithValue }) => {
//         try {
//             const { data } = await API.post("/auth/login", { role, email, password });
//             //store token
//             if (data.success) {
//                 toast.success("Login Successful!");
//                 // alert(data.message);
//                 localStorage.setItem("token", data.token);
//                 // toast.success(data.message);
//                 window.location.replace("/");
//             }
//             return data;
//         } catch (error) {
//             if (error.response && error.response.data.message) {
//                 return rejectWithValue(error.response.data.message);
//             } else {
//                 return rejectWithValue(error.message);
//             }
//         }
//     }
// );

// //register
// export const userRegister = createAsyncThunk(
//     "auth/register",
//     async (
//         {
//             name,
//             role,
//             email,
//             password,
//             phone,
//             organisationName,
//             address,
//             hospitalName,
//             website,
//         },
//         { rejectWithValue }
//     ) => {
//         try {
//             const { data } = await API.post("/auth/register", {
//                 name,
//                 role,
//                 email,
//                 password,
//                 phone,
//                 organisationName,
//                 address,
//                 hospitalName,
//                 website,
//             });
//             if (data.success) {
//                 // alert("User Registerd Successfully");
//                 toast.success("User Registerd Successfully");
//                 window.location.replace("/login");
//             }
//         } catch (error) {
//             console.log(error);
//             if (error.response && error.response.data.message) {
//                 return rejectWithValue(error.response.data.message);
//             } else {
//                 return rejectWithValue(error.message);
//             }
//         }
//     }
// );

// //current user
// export const getCurrentUser = createAsyncThunk(
//     "auth/getCurrentUser",
//     async ({ rejectWithValue }) => {
//         try {
//             const res = await API.get("/auth/current-user");
//             if (res.data) {
//                 return res?.data;
//             }
//         } catch (error) {
//             console.log(error);
//             if (error.response && error.response.data.message) {
//                 return rejectWithValue(error.response.data.message);
//             } else {
//                 return rejectWithValue(error.message);
//             }
//         }
//     }
// );

import { createAsyncThunk } from "@reduxjs/toolkit";
import API from "../../../services/API";
import { toast } from "react-toastify";

// User Login Action
export const userLogin = createAsyncThunk(
  "auth/login",
  async ({ role, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/auth/login", { role, email, password });
      // store token
      if (data.success) {
        localStorage.setItem("token", data.token);
        toast.success(data.message || "Login Successful");
        setTimeout(() => {
          window.location.replace("/");
        }, 1000);
      }
      return data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data.message);
      } else {
        toast.error(error.message);
        return rejectWithValue(error.message);
      }
    }
  }
);

// User Register Action
export const userRegister = createAsyncThunk(
  "auth/register",
  async (
    { name, role, email, password, phone, organisationName, address, hospitalName, website, bloodGroup },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await API.post("/auth/register", {
        name, role, email, password, phone, organisationName, address, hospitalName, website, bloodGroup,
      });
      if (data.success) {
        toast.success(data.message || "Registered Successfully");
        setTimeout(() => {
          window.location.replace("/login");
        }, 1000);
      }
      return data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message);
        return rejectWithValue(error.response.data.message);
      } else {
        toast.error(error.message);
        return rejectWithValue(error.message);
      }
    }
  }
);

// Get Current User Action
export const getCurrentUser = createAsyncThunk(
  "auth/getCurrentUser",
  async ({ rejectWithValue }) => {
    try {
      const res = await API.get("/auth/current-user");
      if (res.data) {
        return res?.data;
      }
    } catch (error) {
      console.log(error);
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);