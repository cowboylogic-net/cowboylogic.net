import React from "react";
import styles from "./ErrorBoundary.module.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ui_error_boundary]", {
      name: error?.name,
      message: error?.message,
      componentStack: info?.componentStack
        ?.split("\n")
        .slice(0, 3)
        .join("\n"),
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.container}>
          <div className={styles.box}>
            <h2>Something went wrong.</h2>
            <p>Please reload the page and try again.</p>
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
