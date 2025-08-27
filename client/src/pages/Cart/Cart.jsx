// src/pages/Cart/Cart.jsx
import styles from "./Cart.module.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { fetchCartItems } from "../../store/thunks/cartThunks";
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
import { Link } from "react-router-dom";

// ⬅️ INSERT (санки для кількості/видалення)
import {
  updateCartItemQuantity,
  deleteCartItemThunk,
} from "../../store/thunks/cartThunks";

// ⬅️ INSERT (санка перевірки складу з блоку books)
import { checkStock } from "../../store/thunks/bookThunks";

const Cart = () => {
  const dispatch = useDispatch();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const { t } = useTranslation();

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const items = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotal);
  const { isFetching, isAdding, isUpdating, isDeleting, error } = useSelector(
    (state) => state.cart
  );

  const isPartner = user?.role === ROLES.PARTNER;

  useEffect(() => {
    if (!items.length) {
      dispatch(fetchCartItems());
    }
  }, [dispatch, items.length]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    const isPartner = user?.role === ROLES.PARTNER;

    if (newQuantity < 1) return;

    // 💥 локальна перевірка для UX; бек все одно валідує
    if (isPartner && newQuantity < 5) {
      toast.warning(t("cart.minPartnerQuantity", { min: 5 }));
      return;
    }

    // ⬅️ REPLACE: замість прямих запитів + локального редʼюсера — санка
    const resultAction = await dispatch(
      updateCartItemQuantity({ itemId, quantity: newQuantity }) // ⬅️ INSERT
    );

    if (updateCartItemQuantity.fulfilled.match(resultAction)) {
      toast.success(t("cart.quantityUpdated"));
    } else {
      toast.error(resultAction.payload || t("cart.quantityUpdateError"));
    }
  };

  const formatPrice = (price) =>
    typeof price === "number" && !isNaN(price) ? price.toFixed(2) : "0.00";

  const handleRemove = async (itemId) => {
    // ⬅️ REPLACE: замість apiService + removeItemById — санка
    const resultAction = await dispatch(deleteCartItemThunk(itemId)); // ⬅️ INSERT
    if (deleteCartItemThunk.fulfilled.match(resultAction)) {
      toast.success(t("cart.itemRemoved"));
    } else {
      toast.error(resultAction.payload || t("cart.itemRemoveError"));
    }
  };

  const handleSquareCheckout = async () => {
    setIsCheckoutLoading(true);

    try {
      if (!token) {
        // Захист від випадкових кліків у гостя
        return;
      }
      // ⬅️ REPLACE: перевірку складу робимо через санку checkStock
      const stockPayload = items.map(({ Book, quantity }) => ({
        bookId: Book?.id,
        quantity,
      }));
      const checkAction = await dispatch(checkStock(stockPayload));
      if (checkStock.fulfilled.match(checkAction)) {
        const ok = Boolean(checkAction.payload?.success);
        if (!ok) {
          toast.error(t("cart.outOfStockGeneric"));
          if (checkAction.payload?.message)
            toast.error(checkAction.payload.message);
          return;
        }
      } else {
        toast.error(checkAction.payload || t("cart.outOfStockGeneric"));
        return;
      }

      // формуємо payload для Square
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

      // оплата як і раніше — напряму
      const checkoutRes = await apiService.post(
        "/square/create-payment",
        payload,
        token
      );

      window.location.href = checkoutRes.data.data.checkoutUrl;
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
                    isUpdating={isUpdating}
                    isRemoving={isDeleting}
                    minQty={isPartner ? 5 : 1} // ⬅️ нове
                    isPartner={isPartner} // ⬅️ (опційно для підказок у UI)
                  />
                ))}
              </ul>

              <div className={styles.cartFooter}>
                <h3 className={styles.total}>
                  {t("cart.total")}: ${formatPrice(totalPrice)}
                </h3>
                {token ? (
                  <BaseButton
                    onClick={handleSquareCheckout}
                    disabled={
                      isAdding || isCheckoutLoading || isUpdating || isDeleting
                    }
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
                ) : (
                  <div className={styles.guestCtas}>
                    <Link to="/login">
                      <BaseButton variant="outline">Login to buy</BaseButton>
                    </Link>
                    <Link to="/register">
                      <BaseButton variant="outline">Register to buy</BaseButton>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;
