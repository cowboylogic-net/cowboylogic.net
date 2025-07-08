import styles from "./Cart.module.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchCartItems } from "../../store/thunks/cartThunks";
import {
  updateItemQuantity,
  removeItemById,
} from "../../store/slices/cartSlice";
import {
  selectCartItems,
  selectCartTotal,
} from "../../store/selectors/cartSelectors";
import { toast } from "react-toastify";
import { apiService } from "../../services/axiosService";
import CartItem from "../../components/CartItem/CartItem";
import BaseButton from "../../components/BaseButton/BaseButton";
import InlineLoader from "../../components/InlineLoader/InlineLoader";
import Loader from "../../components/Loader/Loader";
import { ROLES } from "../../constants/roles";

const Cart = () => {
  const dispatch = useDispatch();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const { t } = useTranslation();

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const items = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotal);
  const { isFetching, isAdding, error } = useSelector((state) => state.cart);

  useEffect(() => {
    if (!items.length) {
      dispatch(fetchCartItems());
    }
  }, [dispatch, items.length]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    const isPartner = user?.role === ROLES.PARTNER;

    if (newQuantity < 1) return;

    // 💥 Обмеження для партнера: мінімум 5 книжок
    if (isPartner && newQuantity < 5) {
      toast.warning(t("cart.minPartnerQuantity", { min: 5 }));
      return;
    }

    try {
      await apiService.patch(
        `/cart/${itemId}`,
        { quantity: newQuantity },
        token
      );
      dispatch(updateItemQuantity({ itemId, quantity: newQuantity }));
      toast.success(t("cart.quantityUpdated"));
    } catch {
      toast.error(t("cart.quantityUpdateError"));
    }
  };

  const formatPrice = (price) =>
    typeof price === "number" && !isNaN(price) ? price.toFixed(2) : "0.00";

  const handleRemove = async (itemId) => {
    try {
      await apiService.delete(`/cart/${itemId}`, token);
      dispatch(removeItemById(itemId));
      toast.success(t("cart.itemRemoved"));
    } catch {
      toast.error(t("cart.itemRemoveError"));
    }
  };

  const handleSquareCheckout = async () => {
    setIsCheckoutLoading(true);

    try {
      const res = await apiService.post("/books/check-stock", { items }, token);

      if (!res.data.success) {
        toast.error(t("cart.outOfStockGeneric"));
        if (res.data.message) toast.error(res.data.message);
        return;
      }

      const payload = items.map((item, index) => {
        const bookId = item.Book?.id;

        if (!bookId || typeof bookId !== "string") {
          console.error(`❌ Invalid bookId at index ${index}`, item);
          throw new Error("Invalid cart structure: bookId missing or invalid");
        }

        return {
          bookId,
          title: item.Book?.title || "Unknown Title",
          price: Number(
            user?.role === ROLES.PARTNER && item.Book?.partnerPrice
              ? item.Book.partnerPrice
              : item.Book?.price ?? 0
          ),
          quantity: item.quantity,
        };
      });

      const checkoutRes = await apiService.post(
        "/square/create-payment",
        payload,
        token
      );

      window.location.href = checkoutRes.data.checkoutUrl;
    } catch (err) {
      toast.error(t("cart.checkoutError"));
      console.error(err);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="layoutContainer">
      {isFetching ? (
        <Loader />
      ) : (
        <div className={styles.cartPage}>
          <h2>{t("cart.title")}</h2>
          {error && <p style={{ color: "red" }}>{error}</p>}

          {items.length === 0 ? (
            <p>{t("cart.empty")}</p>
          ) : (
            <>
              <ul className={styles.cartList}>
                {items.map((item) => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemove}
                  />
                ))}
              </ul>

              <div className={styles.cartFooter}>
                <h3 className={styles.total}>
                  {t("cart.total")}: ${formatPrice(totalPrice)}
                </h3>
                <BaseButton
                  onClick={handleSquareCheckout}
                  disabled={isAdding || isCheckoutLoading}
                  variant="outline"
                >
                  {isCheckoutLoading ? (
  <>
    <InlineLoader />
    <span className="visually-hidden">
      {t("cart.processing")}
    </span>
  </>
) : (
  t("cart.checkout")
)}
                </BaseButton>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
