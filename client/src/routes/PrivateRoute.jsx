// routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";

const PrivateRoute = ({ children, role, roles }) => {
  const { user, token, isLoading } = useSelector((state) => state.auth);

  if (token && user === null && isLoading) return <Loader />;
  if (isLoading) return <Loader />;
  if (!user && token) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;

  // ✅ Підтримка одного role або масиву roles
  if (role && user.role !== role) return <Navigate to="/" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return children;
};




export default PrivateRoute;
