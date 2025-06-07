import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showNotification } from "../../store/slices/notificationSlice";
import styles from "./CancelPage.module.css";

const CancelPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const progressRef = useRef(null);

  useEffect(() => {
    console.warn("Payment canceled:", location?.state || "No additional data");

    dispatch(
      showNotification({
        type: "warning",
        message: "Payment was canceled. Redirecting to your cart...",
      })
    );

    // 🔁 Анімація прогрес-бару
    if (progressRef.current) {
      progressRef.current.style.transition = "width 5s linear";
      progressRef.current.style.width = "100%";
    }

    const timer = setTimeout(() => {
      navigate("/cart");
    }, 5000);

    return () => clearTimeout(timer);
  }, [dispatch, location, navigate]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.progressBarContainer}>
        <div ref={progressRef} className={styles.progressBar} />
      </div>

      <div className={styles.centered}>
        <h2>❌ Payment Canceled</h2>
        <p>
          Something went wrong or you canceled the payment process.
          <br />
          You’ll be redirected to your cart in <strong>5 seconds</strong>.
        </p>

        <Link to="/cart" className="btn btn-outline">
          Return to Cart Now
        </Link>
      </div>
    </div>
  );
};

export default CancelPage;


