// src/context/AuthProvider.jsx
import { useSelector, useDispatch } from "react-redux";

import {
  
  loginUser as loginThunk,
  logoutUser as logoutThunk,
  
} from "../store/thunks/authThunks";
import { AuthContext } from "./AuthContext";
import { jwtDecode } from "jwt-decode";

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isLoading = useSelector((state) => state.auth.isLoading);

  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === "admin" || user?.role === "superAdmin";
  const isPartner = user?.role === "partner";

//   useEffect(() => {

//   if (!token) {
//     dispatch(refreshSession())
//       .unwrap()
//       .then(() => dispatch(fetchCurrentUser()))
//       .catch(() => {/* лишаємось без сесії */});
//   } else if (token && !user) {
//     dispatch(fetchCurrentUser());
//   }
// }, [token, user, dispatch]);

  const login = ({ email, code }) => {
    dispatch(loginThunk({ email, code }));
  };

  const logout = () => {
    dispatch(logoutThunk());
  };

  let decodedToken = null;

  if (typeof token === "string" && token.split(".").length === 3) {
    try {
      decodedToken = jwtDecode(token);
    } catch (err) {
      console.error("❌ Failed to decode token", err);
      decodedToken = null;
    }
  }

  const value = {
    user,
    token,
    login,
    logout,
    isLoggedIn,
    isAdmin,
    isPartner,
    loading: isLoading,
    decodedToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
