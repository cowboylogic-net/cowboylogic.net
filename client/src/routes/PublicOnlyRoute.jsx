import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";

const PublicOnlyRoute = ({ redirectTo = "/" }) => {
  const location = useLocation();
  const { user, bootstrapStatus } = useSelector((s) => s.auth);

  if (bootstrapStatus !== "done") return <Loader />;
  if (user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default PublicOnlyRoute;
