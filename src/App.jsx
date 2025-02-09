import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Home from "./pages/Home";
import SignIn from "./pages/authentication/SignIn";
import SignUp from "./pages/authentication/SignUp";
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import ProtectedRoute from "./components/protectedRoutes/ProtectedRoute";
import RoleProtectedRoute from "./components/protectedRoutes/RoleProtectedRoute";
import Feedback from "./components/users/Feedback";
import Help from "./components/users/Help";
import Interaction from "./pages/interaction/Interaction";
import Plan from "./components/admin/plans/Plan";
import Resources from "./components/admin/profileManagement/Resources";
import EditProfile from "./components/users/EditProfile";
import Roadmap from "./components/common/Roadmap";
import UserDetail from "./components/admin/profileManagement/UserDetail";
import NotFound from "./pages/NotFound";
import MyProfile from "./components/common/MyProfile";
import Milestones from "./components/admin/plans/Milestones";
import Dashboard from "./pages/dashboard/Dashboard";
import AdminUpdate from "./components/admin/dailyUpdate/AdminUpdate";
import DailyUpdates from "./components/admin/dailyUpdate/DailyUpdates";
import InternUpdate from "./components/users/dailyUpdate/InternUpdate";
import DailyUpdate from "./components/users/dailyUpdate/DailyUpdate";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Forbidden from "./pages/Forbidden";

const App = () => {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />

          <Route path="feedback" element={<Feedback />} />
          <Route path="help" element={<Help />} />
          <Route path="interactions" element={<Interaction />} />
          <Route path="my-profile" element={<MyProfile />} />
          <Route path="edit-profile" element={<EditProfile />} />
          <Route path="roadmap" element={<Roadmap />} />
        </Route>

        <Route
          path="/intern/*"
          element={<RoleProtectedRoute allowedRoles={["Interns"]} />}
        >
          <Route path="daily-update" element={<DailyUpdate />} />
          <Route path="daily-update/:date" element={<InternUpdate />} />
        </Route>

        {/* /* Mentor Routes (Only Mentors can access) */}
        <Route
          path="/mentor/*"
          element={<RoleProtectedRoute allowedRoles={["Mentors"]} />}
        >
          <Route path="feedback" element={<Feedback />} />
        </Route>

        {/* Admin Routes (Only Admins can access) */}
        <Route
          path="/admin/*"
          element={<RoleProtectedRoute allowedRoles={["Admins"]} />}
        >
          <Route path="plans" element={<Plan />} />
          <Route path="plans/:planId" element={<Milestones />} />
          <Route path="resources" element={<Resources />} />
          <Route path="resources/:id" element={<UserDetail />} />
          <Route path="daily-update" element={<DailyUpdates />} />
          <Route path="daily-update/:date" element={<AdminUpdate />} />
          <Route path="feedback" element={<Feedback />} />
        </Route>
        {/* Redirect to NotFound for unknown routes */}
        <Route path="*" element={<Navigate to="/not-found" replace />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="/403" element={<Forbidden />} />
      </Routes>
    </Router>
  );
};

export default App;
