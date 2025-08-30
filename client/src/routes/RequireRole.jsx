// routes/RequireRole.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";

const RequireRole = ({ roles = [], redirectTo = "/403", children }) => {
  const { user, token, isLoading } = useSelector((s) => s.auth);

  const isAuthBooting = isLoading || (!!token && !user);
  if (isAuthBooting) return <Loader />;

  if (!user) return <Navigate to="/login" replace />;

  if (roles.length) {
    const isSA = user.role === "superAdmin" || user.isSuperAdmin === true;
    const allowed = isSA || roles.includes(user.role);
    if (!allowed) return <Navigate to={redirectTo} replace />;
  }

  return children;
};

export default RequireRole;
