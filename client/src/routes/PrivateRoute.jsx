// routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";

const PrivateRoute = ({ children }) => {
  const { user, token, isLoading } = useSelector((state) => state.auth);

  if (token && user === null && isLoading) return <Loader />;
  if (isLoading) return <Loader />;

  if (!user && token) return <Loader />; // 🔄 захист від раннього редиректу
  if (!user) return <Navigate to="/login" replace />;

  return children;
};


export default PrivateRoute;
