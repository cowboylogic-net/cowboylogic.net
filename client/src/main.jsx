import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "./store/store";
import App from "./App";
import Loader from "./components/Loader/Loader"; // 👈 додамо
import { fetchCurrentUser } from "./store/slices/authSlice";

import './i18n';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById("root"));

// 🧠 Глобальний fetch перед рендером App
const renderApp = async () => {
  const token = localStorage.getItem("token");

  if (token) {
    // спробуємо отримати користувача
    await store.dispatch(fetchCurrentUser(token));
  }

  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <Provider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </Provider>
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
};

// Поки не підтягнемо токен — Loader
root.render(<Loader />);
renderApp();
