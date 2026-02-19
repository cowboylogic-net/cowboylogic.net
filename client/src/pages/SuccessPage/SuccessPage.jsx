import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "../../store/axios";
import { clearCart } from "../../store/slices/cartSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import Loader from "../../components/Loader/Loader";
import styles from "./SuccessPage.module.css";

const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000];
const MAX_POLL_ATTEMPTS = RETRY_DELAYS_MS.length + 1;
const REDIRECT_DELAY_MS = 5000;
const TRANSIENT_POLL_STATUSES = new Set([202, 204, 404]);

const safeString = (value) => (typeof value === "string" ? value.trim() : "");

const looksLikeI18nKey = (value) => {
  if (!value || value.length > 80) return false;
  if (value.includes(" ")) return false;
  return /^[A-Za-z0-9_.-]+$/.test(value) && value.includes(".");
};

const readOrderId = (payload) => {
  const raw = payload?.data?.id;
  if (raw === null || raw === undefined) return null;
  const value = String(raw).trim();
  return value || null;
};

const SuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();

  const progressRef = useRef(null);
  const pollTimerRef = useRef(null);
  const redirectTimerRef = useRef(null);
  const flowRunIdRef = useRef(0);
  const hasShownSuccessToastRef = useRef(false);

  const token = useSelector((state) => state.auth.token);
  const bootstrapStatus = useSelector((state) => state.auth.bootstrapStatus);

  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );

  const paymentId =
    queryParams.get("paymentId") ||
    queryParams.get("payment_id") ||
    queryParams.get("payment-id");

  const orderHintId =
    queryParams.get("orderId") ||
    queryParams.get("order_id") ||
    queryParams.get("checkoutId") ||
    queryParams.get("checkout_id");
  const urlToken = safeString(queryParams.get("token"));
  const authToken = token || urlToken || null;

  const [orderId, setOrderId] = useState(null);
  const [status, setStatus] = useState("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [canRefresh, setCanRefresh] = useState(false);

  const clearPollTimer = useCallback(() => {
    if (!pollTimerRef.current) return;
    clearTimeout(pollTimerRef.current);
    pollTimerRef.current = null;
  }, []);

  const clearRedirectTimer = useCallback(() => {
    if (!redirectTimerRef.current) return;
    clearTimeout(redirectTimerRef.current);
    redirectTimerRef.current = null;
  }, []);

  const resolveApiMessage = useCallback(
    (err) => {
      const apiMessage = safeString(err?.response?.data?.message);
      if (apiMessage && i18n.exists(apiMessage)) return t(apiMessage);
      if (apiMessage && !looksLikeI18nKey(apiMessage)) return apiMessage;
      return t("success.errorDefault");
    },
    [i18n, t],
  );

  const fetchLatestOrder = useCallback(async () => {
    try {
      const res = await axios.get("/orders/latest", {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const latestOrderId = readOrderId(res?.data);
      if (latestOrderId) {
        return { state: "found", orderId: latestOrderId };
      }

      return { state: "pending" };
    } catch (err) {
      const statusCode = Number(err?.response?.status);
      if (
        TRANSIENT_POLL_STATUSES.has(statusCode) ||
        statusCode >= 500 ||
        !statusCode
      ) {
        return { state: "pending" };
      }

      return { state: "error", message: resolveApiMessage(err) };
    }
  }, [authToken, resolveApiMessage]);

  const runFlow = useCallback(async () => {
    if (!authToken) return;

    const runId = flowRunIdRef.current + 1;
    flowRunIdRef.current = runId;
    clearPollTimer();
    clearRedirectTimer();

    setStatus("processing");
    setErrorMessage("");
    setCanRefresh(false);
    setAttempt(0);

    const confirmPayload = {};
    if (paymentId) confirmPayload.paymentId = paymentId;
    if (orderHintId) confirmPayload.orderId = orderHintId;

    try {
      await axios.post("/orders/confirm", confirmPayload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
    } catch {
      // Confirm can fail while webhook materialization is in-flight.
    }

    for (let idx = 0; idx < MAX_POLL_ATTEMPTS; idx += 1) {
      if (flowRunIdRef.current !== runId) return;

      setAttempt(idx + 1);
      const latestOrderResult = await fetchLatestOrder();

      if (flowRunIdRef.current !== runId) return;

      if (latestOrderResult.state === "found") {
        setOrderId(latestOrderResult.orderId);
        setStatus("success");
        return;
      }

      if (latestOrderResult.state === "error") {
        setStatus("error");
        setErrorMessage(latestOrderResult.message);
        dispatch(
          showNotification({
            type: "error",
            message: latestOrderResult.message,
          }),
        );
        return;
      }

      if (idx === MAX_POLL_ATTEMPTS - 1) {
        setCanRefresh(true);
        return;
      }

      await new Promise((resolve) => {
        pollTimerRef.current = setTimeout(resolve, RETRY_DELAYS_MS[idx]);
      });
    }
  }, [
    clearPollTimer,
    clearRedirectTimer,
    dispatch,
    fetchLatestOrder,
    orderHintId,
    paymentId,
    authToken,
  ]);

  useEffect(() => {
    const canStartFlow =
      Boolean(authToken) && (bootstrapStatus === "done" || Boolean(urlToken));
    if (!canStartFlow || orderId) return;
    void runFlow();

    return () => {
      flowRunIdRef.current += 1;
      clearPollTimer();
    };
  }, [authToken, bootstrapStatus, clearPollTimer, orderId, runFlow, urlToken]);

  useEffect(() => {
    if (!orderId) return;

    dispatch(clearCart());
    if (!hasShownSuccessToastRef.current) {
      hasShownSuccessToastRef.current = true;
      dispatch(
        showNotification({
          type: "success",
          message: t("success.confirmed", { orderId }),
        }),
      );
    }

    if (progressRef.current) {
      progressRef.current.style.transition = `width ${REDIRECT_DELAY_MS}ms linear`;
      progressRef.current.style.width = "100%";
    }

    clearRedirectTimer();
    redirectTimerRef.current = setTimeout(() => {
      navigate("/orders");
    }, REDIRECT_DELAY_MS);

    return () => clearRedirectTimer();
  }, [clearRedirectTimer, dispatch, navigate, orderId, t]);

  useEffect(
    () => () => {
      flowRunIdRef.current += 1;
      clearPollTimer();
      clearRedirectTimer();
    },
    [clearPollTimer, clearRedirectTimer],
  );

  const handleManualRefresh = useCallback(() => {
    void runFlow();
  }, [runFlow]);

  if (!authToken && bootstrapStatus !== "done") {
    return <Loader />;
  }

  if (!authToken) {
    return (
      <div className={styles.centered}>
        <h2>{t("success.missingTokenTitle")}</h2>
        <p>{t("success.missingTokenText")}</p>
        <button className="btn btn-outline" onClick={() => navigate("/login")}>
          {t("success.goToLogin")}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.progressBarContainer}>
        <div ref={progressRef} className={styles.progressBar} />
      </div>

      <div className={styles.centered}>
        {status === "error" ? (
          <>
            <h2>{t("success.errorTitle")}</h2>
            <p>{errorMessage}</p>
            <button className="btn btn-outline" onClick={handleManualRefresh}>
              {t("success.tryAgain")}
            </button>
          </>
        ) : status === "success" ? (
          <>
            <h2>{t("success.title")}</h2>
            <p>{t("success.confirmed", { orderId })}</p>
            <p className={styles.muted}>{t("success.redirect")}</p>
            <button
              className="btn btn-outline"
              onClick={() => navigate("/orders")}
            >
              {t("success.viewOrders")}
            </button>
          </>
        ) : (
          <>
            <h2>{t("success.processingTitle")}</h2>
            <p>{t("success.processingText")}</p>
            <p className={styles.muted}>
              {t("success.processingAttempts", {
                attempt,
                max: MAX_POLL_ATTEMPTS,
              })}
            </p>
            {canRefresh ? (
              <button className="btn btn-outline" onClick={handleManualRefresh}>
                {t("success.refreshStatus")}
              </button>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
