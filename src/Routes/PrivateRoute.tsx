import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  // Check if the authentication token exists in local storage
  const isAuthenticated = !!localStorage.getItem("authToken");

  // If authenticated, render the child component (e.g., Dashboard)
  // <Outlet /> is a placeholder for whatever child route is nested inside
  if (isAuthenticated) {
    return <Outlet />;
  }

  // If not authenticated, redirect to the sign-in page
  return <Navigate to="/" replace />;
};

export default PrivateRoute;
