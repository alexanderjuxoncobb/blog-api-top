import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../contexts/AdminAuthContext";

function AdminPrivateRoute({ children }) {
  const { currentAdmin, loading } = useAdminAuth();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-admin-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated as admin
  if (!currentAdmin || currentAdmin.role !== "ADMIN") {
    return <Navigate to="/login" />;
  }

  // Render children if authenticated as admin
  return children;
}

export default AdminPrivateRoute;
