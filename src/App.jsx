import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
import Landing from "@/pages/marketing/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Dashboard from "@/pages/dashboard/Dashboard";
import Apply from "@/pages/applications/Apply";
import Applications from "@/pages/applications/Applications";
import ApplicationDetails from "@/pages/applications/ApplicationDetails";
import FollowUps from "@/pages/applications/FollowUps";
import Profile from "@/pages/profile/Profile";
import Settings from "@/pages/profile/Settings";
import AppLayout from "@/layouts/AppLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        offset={20}
        gap={10}
        duration={3500}
        closeButton
        icons={{
          success: <CheckCircle2 size={19} strokeWidth={2.25} />,
          error: <XCircle size={19} strokeWidth={2.25} />,
          warning: <AlertTriangle size={19} strokeWidth={2.25} />,
          info: <Info size={19} strokeWidth={2.25} />,
          loading: (
            <Loader2 size={19} strokeWidth={2.25} className="jp-toast-spin" />
          ),
        }}
        toastOptions={{
          unstyled: true,
          duration: 3500,
          classNames: {
            toast: "jp-toast",
            title: "jp-toast-title",
            description: "jp-toast-desc",
            icon: "jp-toast-icon",
            closeButton: "jp-toast-close",
            actionButton: "jp-toast-action",
            cancelButton: "jp-toast-cancel",
            success: "jp-toast--success",
            error: "jp-toast--error",
            warning: "jp-toast--warning",
            info: "jp-toast--info",
            loading: "jp-toast--loading",
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <AppLayoutWithTitle />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/applications/:id" element={<ApplicationDetails />} />
          <Route path="/follow-ups" element={<FollowUps />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </>
  );
}

const titles = {
  "/dashboard": "Dashboard",
  "/apply": "Apply for a Job",
  "/applications": "Applications",
  "/follow-ups": "Follow-ups",
  "/profile": "Profile",
  "/settings": "Settings",
};

function AppLayoutWithTitle() {
  const location = useLocation();
  const path = location.pathname;
  const title =
    titles[path] ||
    (path.startsWith("/applications/") ? "Application Details" : "JobPilot AI");
  return <AppLayout title={title} />;
}

export default App;
