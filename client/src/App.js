// import { Routes, Route } from "react-router-dom";
// import { useSelector } from "react-redux";
// import HomePage from "./pages/HomePage";
// import Login from "./pages/auth/Login";
// import Register from "./pages/auth/Register";
// import { ToastContainer } from "react-toastify";
// import ProtectedRoute from "./components/Routes/ProtectedRoute";
// import PublicRoute from "./components/Routes/PublicRoute";
// import Donor from "./pages/Dashboard/Donor";
// import Hospitals from "./pages/Dashboard/Hospitals";
// import OrganisationPage from "./pages/Dashboard/OrganisationPage";
// import Consumer from "./pages/Dashboard/Consumer";
// import Donation from "./pages/Donation";
// import Analytics from "./pages/Dashboard/Analytics";
// import DonorList from "./pages/Admin/DonorList";
// import HospitalList from "./pages/Admin/HospitalList";
// import OrgList from "./pages/Admin/OrgList";
// import AdminHome from "./pages/Admin/AdminHome";

// function App() {
//   const { user } = useSelector((state) => state.auth);
//   return (
//     <>
//       <ToastContainer />
//       <Routes>
//         <Route
//           path="/admin"
//           element={
//             <ProtectedRoute>
//               <AdminHome />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/donor-list"
//           element={
//             <ProtectedRoute>
//               <DonorList />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/hospital-list"
//           element={
//             <ProtectedRoute>
//               <HospitalList />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/org-list"
//           element={
//             <ProtectedRoute>
//               <OrgList />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/hospital"
//           element={
//             <ProtectedRoute>
//               <Hospitals />
//             </ProtectedRoute>
//           }
//         />
//         {user?.role !== "donor" && (
//           <Route
//             path="/analytics"
//             element={
//               <ProtectedRoute>
//                 <Analytics />
//               </ProtectedRoute>
//             }
//           />
//         )}
//         <Route
//           path="/consumer"
//           element={
//             <ProtectedRoute>
//               <Consumer />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/donation"
//           element={
//             <ProtectedRoute>
//               <Donation />
//             </ProtectedRoute>
//           }
//         />
//         {user?.role !== "donor" && (
//           <Route
//             path="/donor"
//             element={
//               <ProtectedRoute>
//                 <Donor />
//               </ProtectedRoute>
//             }
//           />
//         )}
//         {user?.role !== "donor" && (
//           <Route
//             path="/organisation"
//             element={
//               <ProtectedRoute>
//                 <OrganisationPage />
//               </ProtectedRoute>
//             }
//           />
//         )}
//         <Route
//           path="/"
//           element={
//             <ProtectedRoute>
//               <HomePage />
//             </ProtectedRoute>
//           }
//         />
//         <Route
//           path="/login"
//           element={
//             <PublicRoute>
//               <Login />
//             </PublicRoute>
//           }
//         />
//         <Route
//           path="/register"
//           element={
//             <PublicRoute>
//               <Register />
//             </PublicRoute>
//           }
//         />
//       </Routes>
//     </>
//   );
// }

// export default App;

import { Routes, Route } from "react-router-dom";
import { useSelector } from "react-redux";
import HomePage from "./pages/HomePage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // IMPORTANT: Added the required CSS for the toasts
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import PublicRoute from "./components/Routes/PublicRoute";
import Donor from "./pages/Dashboard/Donor";
import Hospitals from "./pages/Dashboard/Hospitals";
import OrganisationPage from "./pages/Dashboard/OrganisationPage";
import Consumer from "./pages/Dashboard/Consumer";
import Donation from "./pages/Donation";
import Analytics from "./pages/Dashboard/Analytics";
import DonorList from "./pages/Admin/DonorList";
import HospitalList from "./pages/Admin/HospitalList";
import OrgList from "./pages/Admin/OrgList";
import AdminHome from "./pages/Admin/AdminHome";
import AdminEntityAnalytics from "./pages/Admin/AdminEntityAnalytics";

function App() {
  const { user } = useSelector((state) => state.auth);
  
  return (
    <>
      {/* Updated ToastContainer with professional configuration */}
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Routes>
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor-list"
          element={
            <ProtectedRoute>
              <DonorList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital-list"
          element={
            <ProtectedRoute>
              <HospitalList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/org-list"
          element={
            <ProtectedRoute>
              <OrgList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/entity-analytics"
          element={
            <ProtectedRoute>
              <AdminEntityAnalytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/hospital"
          element={
            <ProtectedRoute>
              <Hospitals />
            </ProtectedRoute>
          }
        />
        {user?.role !== "donor" && (
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
        )}
        <Route
          path="/consumer"
          element={
            <ProtectedRoute>
              <Consumer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donation"
          element={
            <ProtectedRoute>
              <Donation />
            </ProtectedRoute>
          }
        />
        {user?.role !== "donor" && (
          <Route
            path="/donor"
            element={
              <ProtectedRoute>
                <Donor />
              </ProtectedRoute>
            }
          />
        )}
        {user?.role !== "donor" && (
          <Route
            path="/organisation"
            element={
              <ProtectedRoute>
                <OrganisationPage />
              </ProtectedRoute>
            }
          />
        )}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;