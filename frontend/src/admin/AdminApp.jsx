import { Outlet } from "react-router-dom";
import { AdminAuthProvider } from "./hooks/useAdminAuth.jsx";
import { ErrorBoundary } from "@/components/ErrorBoundary.jsx";

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <ErrorBoundary>
        <div style={{ minHeight: "100vh", backgroundColor: "#f9f9f9" }}>
          <Outlet />
        </div>
      </ErrorBoundary>
    </AdminAuthProvider>
  );
}
