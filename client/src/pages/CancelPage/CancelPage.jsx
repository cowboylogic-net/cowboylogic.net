import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { showNotification } from "../../store/slices/notificationSlice";
import styles from "./CancelPage.module.css";
import BaseButton from "../../components/BaseButton/BaseButton";

const CancelPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const progressRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    console.warn("Payment canceled:", location?.state || "No additional data");

    dispatch(
      showNotification({
        type: "warning",
        message: t("cancel.notification"),
      })
    );

    if (progressRef.current) {
      progressRef.current.style.transition = "width 5s linear";
      progressRef.current.style.width = "100%";
    }

    const timer = setTimeout(() => {
      navigate("/cart");
    }, 5000);

    return () => clearTimeout(timer);
  }, [dispatch, location, navigate, t]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.progressBarContainer}>
        <div ref={progressRef} className={styles.progressBar} />
      </div>

      <div className={styles.centered}>
        <h2>❌ {t("cancel.title")}</h2>
        <p>
          {t("cancel.description")}
          <br />
          <strong>{t("cancel.redirectInfo")}</strong>
        </p>

        <Link to="/cart">
          <BaseButton variant="outline">{t("cancel.button")}</BaseButton>
        </Link>
      </div>
    </div>
  );
};

export default CancelPage;
