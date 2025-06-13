import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import axios from "../../store/axios";
import { clearCart } from "../../store/slices/cartSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import Loader from "../../components/Loader/Loader";
import styles from "./SuccessPage.module.css";

const SuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const progressRef = useRef(null);

  const token = useSelector((state) => state.auth.token);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const confirmOrder = async () => {
      try {
        await axios.post("/orders/confirm", {}, {
          headers: { Authorization: `Bearer ${token}` },
        });

        dispatch(clearCart());

        const res = await axios.get("/orders/latest", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setOrderId(res.data.id);

        dispatch(
          showNotification({
            type: "success",
            message: t("success.confirmed", { orderId: res.data.id }),
          })
        );
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          t("success.errorDefault");
        setError(msg);
        dispatch(showNotification({ type: "error", message: msg }));
      } finally {
        setIsLoading(false);
      }
    };

    if (token) confirmOrder();
  }, [token, dispatch, t]);

  useEffect(() => {
    if (orderId && progressRef.current) {
      progressRef.current.style.transition = "width 5s linear";
      progressRef.current.style.width = "100%";
    }

    if (orderId) {
      const timer = setTimeout(() => {
        navigate("/orders");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [orderId, navigate]);

  if (!token) {
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

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.progressBarContainer}>
        <div ref={progressRef} className={styles.progressBar} />
      </div>

      <div className={styles.centered}>
        {error ? (
          <>
            <h2>{t("success.errorTitle")}</h2>
            <p>{error}</p>
            <button className="btn btn-outline" onClick={() => navigate("/")}>
              {t("success.tryAgain")}
            </button>
          </>
        ) : (
          <>
            <h2>{t("success.title")}</h2>
            <p>{t("success.confirmed", { orderId })}</p>
            <p className={styles.muted}>
              {t("success.redirect")}
            </p>
            <button className="btn btn-outline" onClick={() => navigate("/orders")}>
              {t("success.viewOrders")}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
