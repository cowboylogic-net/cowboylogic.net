// src/routes/RequireRole.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";

const RequireRole = ({ role, roles, redirectTo = "/403", children }) => {
  const { user, isLoading } = useSelector((state) => state.auth);

  if (isLoading || !user) return <Loader />;

  const hasRole = role
    ? user.role === role
    : roles
    ? roles.includes(user.role)
    : true;

  if (!hasRole) return <Navigate to={redirectTo} replace />;

  return children;
};

export default RequireRole;
