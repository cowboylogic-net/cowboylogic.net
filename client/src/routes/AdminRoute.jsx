// routes/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROLES } from "../constants/roles";
import Loader from "../components/Loader/Loader";

const AdminRoute = ({ children }) => {
  const { user, token, isLoading } = useSelector((state) => state.auth);

  if (token && user === null && isLoading) return <Loader />;
  if (isLoading) return <Loader />;

  if (!user && token) return <Loader />; // 🔄 без редиректу
  if (!user) return <Navigate to="/login" replace />;

  if (![ROLES.ADMIN, ROLES.SUPERADMIN].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
