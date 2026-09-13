
import { Navigate, Outlet, useLocation } from "react-router-dom";

function ProtectRoutes({ allowedRoles }) {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const userData = localStorage.getItem("user");

  // User is not logged in
  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  let user;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch {
    user = null;
  }

  // Token exists but user data is missing or invalid
  if (!user) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    return <Navigate to="/login" replace />;
  }

  // Check user's role
  if (
    allowedRoles &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and authorized
  return <Outlet />;
}

export default ProtectRoutes;
