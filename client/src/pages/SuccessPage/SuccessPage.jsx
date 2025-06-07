import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../store/axios";
import { useSelector, useDispatch } from "react-redux";
import { clearCart } from "../../store/slices/cartSlice";
import { showNotification } from "../../store/slices/notificationSlice";
import Loader from "../../components/Loader/Loader";
import styles from "./SuccessPage.module.css";

const SuccessPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
            message: `Order #${res.data.id} confirmed successfully`,
          })
        );
      } catch (err) {
        const msg =
          err.response?.data?.message ||
          "Could not confirm or fetch the order.";
        setError(msg);
        dispatch(showNotification({ type: "error", message: msg }));
      } finally {
        setIsLoading(false);
      }
    };

    if (token) confirmOrder();
  }, [token, dispatch]);

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
        <h2>⚠️ Missing token</h2>
        <p>You must be logged in to confirm your order.</p>
        <button className="btn btn-outline" onClick={() => navigate("/login")}>
          Go to Login
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
            <h2>⚠️ Error</h2>
            <p>{error}</p>
            <button className="btn btn-outline" onClick={() => navigate("/")}>
              Try Again
            </button>
          </>
        ) : (
          <>
            <h2>🎉 Payment Successful!</h2>
            <p>
              Your order <strong>#{orderId}</strong> has been confirmed.
              <br /> Thank you for your purchase!
            </p>
            <p className={styles.muted}>
              You will be redirected to your orders shortly...
            </p>
            <button className="btn btn-outline" onClick={() => navigate("/orders")}>
              View Orders Now
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SuccessPage;
