// routes/PrivateRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Loader from "../components/Loader/Loader";

const PrivateRoute = ({ children, roles }) => {
  const { user, token, isLoading } = useSelector((s) => s.auth);

  // 1) Поки триває авторизаційний бутстреп або є токен, але user ще не підтягнувся — показуємо лоадер
  const isAuthBooting = isLoading || (!!token && !user);
  if (isAuthBooting) return <Loader />;

  // 2) Нема користувача — на /login (без будь-яких логаутів/нотифікацій)
  if (!user) return <Navigate to="/login" replace />;

  // 3) Ролі: superAdmin проходить туди, де потрібен admin/superAdmin
  if (Array.isArray(roles) && roles.length) {
    const isSA = user.role === "superAdmin" || user.isSuperAdmin === true;
    const allowed = isSA || roles.includes(user.role);
    if (!allowed) return <Navigate to="/403" replace />;
  }

  // 4) Все ок — рендеримо дітей
  return children;
};

export default PrivateRoute;
