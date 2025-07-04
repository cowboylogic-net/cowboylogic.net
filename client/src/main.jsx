import "./styles/index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./styles/globals.css";
import "./styles/components.css";
import "./styles/media.css";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "./store/store";

import Loader from "./components/Loader/Loader";
import { fetchCurrentUser } from "./store/thunks/authThunks"; // ✅ правильний імпорт
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";

import "./i18n";

const root = ReactDOM.createRoot(document.getElementById("root"));

const renderApp = async () => {
  const token = localStorage.getItem("token");

  if (token) {
    await store.dispatch(fetchCurrentUser(token));
  }

  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <Provider store={store}>
          <BrowserRouter>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </BrowserRouter>
        </Provider>
      </GoogleOAuthProvider>
    </React.StrictMode>
  );
};

root.render(<Loader />);
renderApp();
