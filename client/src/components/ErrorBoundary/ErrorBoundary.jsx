import React from "react";
import styles from "./ErrorBoundary.module.css";
import { logger } from "../../utils/logger";
import {
  formatUiErrorMessage,
  mapApiErrorToUi,
  normalizeApiError,
} from "../../utils/apiError";
import { store } from "../../store/store";
import { showNotification } from "../../store/slices/notificationSlice";

const UNEXPECTED_TOAST_MESSAGE = "Something went wrong.";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.lastToastKey = null;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    const apiError = normalizeApiError(error);
    const uiError = mapApiErrorToUi(apiError);
    const requestIdSuffix = uiError.requestId
      ? ` (Request ID: ${uiError.requestId})`
      : "";
    const toastMessage = `${UNEXPECTED_TOAST_MESSAGE}${requestIdSuffix}`;
    const toastKey = `${apiError.code || "UNEXPECTED_ERROR"}:${uiError.requestId || "none"}`;

    if (this.lastToastKey !== toastKey) {
      this.lastToastKey = toastKey;
      store.dispatch(
        showNotification({
          id: `ui-error-${toastKey}`,
          type: "error",
          message: toastMessage,
        }),
      );
    }

    const isUnexpected =
      !apiError?.status || apiError?.code === "UNEXPECTED_ERROR";
    logger.error("[ui_error_boundary]", {
      code: apiError.code,
      requestId: apiError.requestId || null,
      name: error?.name,
      message: isUnexpected ? "Unexpected UI error" : apiError.message,
      componentStack: info?.componentStack
        ?.split("\n")
        .slice(0, 3)
        .join("\n"),
    });
  }

  render() {
    if (this.state.hasError) {
      const uiError = mapApiErrorToUi(normalizeApiError(this.state.error));
      const message = formatUiErrorMessage(uiError);
      return (
        <div className={styles.container}>
          <div className={styles.box}>
            <h2>{uiError.title}</h2>
            <p>{message}</p>
            <button type="button" onClick={() => window.location.reload()}>
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
