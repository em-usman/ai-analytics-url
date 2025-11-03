import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  // Check if the authentication token exists in local storage
  const isAuthenticated = !!localStorage.getItem("authToken");

  // If authenticated, REDIRECT to the dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // If not authenticated, show the child component (e.g., SigninForm)
  return <Outlet />;
};

export default PublicRoute;
