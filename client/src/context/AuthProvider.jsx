// src/context/AuthProvider.jsx
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { jwtDecode } from "jwt-decode";

import {
  loginUser as loginThunk,
  logoutUser as logoutThunk,
  bootstrapAuth,
} from "../store/thunks/authThunks";
import { AuthContext } from "./AuthContext";

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const isLoading = useSelector((state) => state.auth.isLoading);
  const bootstrapStatus = useSelector((state) => state.auth.bootstrapStatus);
  const bootstrapStartedRef = useRef(false);

  useEffect(() => {
    if (bootstrapStatus !== "idle" || bootstrapStartedRef.current) return;

    bootstrapStartedRef.current = true;
    let aborted = false;

    const runBootstrap = async () => {
      if (aborted) return;
      await dispatch(bootstrapAuth());
    };
    runBootstrap();

    return () => {
      aborted = true;
    };
  }, [bootstrapStatus, dispatch]);

  const isLoggedIn = Boolean(user);
  const isAdmin = user?.role === "admin" || user?.role === "superAdmin";
  const isPartner = user?.role === "partner";
  const isInitializing = bootstrapStatus !== "done";
  const authKnown = bootstrapStatus === "done";

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
    } catch {
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
    isInitializing,
    authKnown,
    bootstrapStatus,
    loading: isLoading,
    decodedToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
