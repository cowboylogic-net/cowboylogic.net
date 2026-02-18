// routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";

const PrivateRoute = ({ children, roles }) => {
  const { user, bootstrapStatus } = useSelector((s) => s.auth);
  const isInitializing = bootstrapStatus !== "done";

  if (isInitializing) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  if (Array.isArray(roles) && roles.length) {
    const isSA = user.role === "superAdmin" || user.isSuperAdmin === true;
    const allowed = isSA || roles.includes(user.role);
    if (!allowed) return <Navigate to="/403" replace />;
  }

  return children;
};

export default PrivateRoute;
