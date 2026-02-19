import styles from "./Cart.module.css";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  fetchCartItems,
  updateCartItemQuantity,
  deleteCartItemThunk,
} from "../../store/thunks/cartThunks";
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
import { replaceCart } from "../../store/slices/cartSlice";

const hasBlockingIssues = (issues = {}) =>
  Boolean(
    issues.invalidId?.length ||
    issues.missingProducts?.length,
  );

const formatValidationBannerMessage = (validation) => {
  if (!validation) return null;
  const { issues = {} } = validation;
  if (
    validation.ok === true &&
    (issues.qtyAdjusted?.length || issues.removedOutOfStock?.length)
  ) {
    return "Cart updated due to stock changes.";
  }
  if (validation.ok !== false) return null;

  if (validation.code === "CART_CORRUPTED" || issues.invalidId?.length) {
    return "Your cart is corrupted. Reset cart and add items again.";
  }

  const messages = [];

  if (issues.invalidId?.length) {
    messages.push(
      "Cart contains invalid product IDs. Please remove invalid items.",
    );
  }
  if (issues.missingProducts?.length) {
    messages.push("Some cart items are no longer available.");
  }
  if (issues.outOfStock?.length) {
    messages.push("Some cart quantities exceed available stock.");
  }
  if (issues.priceChanged?.length) {
    messages.push("Some item prices changed.");
  }

  if (!messages.length) {
    return "Cart validation failed. Please review your cart.";
  }

  return messages.join(" ");
};

const Cart = () => {
  const dispatch = useDispatch();
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [isCartValidating, setIsCartValidating] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [validationBanner, setValidationBanner] = useState(null);
  const [lastValidationCode, setLastValidationCode] = useState(null);
  const [lastBlocking, setLastBlocking] = useState(false);
  const [lastIssues, setLastIssues] = useState(null);

  const { t } = useTranslation();

  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  const items = useSelector(selectCartItems);
  const totalPrice = useSelector(selectCartTotal);
  const { isFetching, isAdding, isUpdating, isDeleting, error } = useSelector(
    (state) => state.cart,
  );

  const isPartner = user?.role === ROLES.PARTNER;
  const isCorruptedCart =
    lastValidationCode === "CART_CORRUPTED" ||
    Boolean(lastIssues?.invalidId?.length);
  const isCheckoutDisabled =
    isAdding ||
    isCheckoutLoading ||
    isUpdating ||
    isDeleting ||
    isCartValidating ||
    isResetting ||
    lastBlocking;

  const validateCart = async (fallbackItems = items) => {
    if (!token) {
      return { ok: true, blocking: false, itemsForCheckout: fallbackItems };
    }

    setIsCartValidating(true);

    try {
      const res = await apiService.post("/cart/validate", {});
      const validation = res?.data?.data || {};
      const normalizedItems = Array.isArray(validation.normalizedItems)
        ? validation.normalizedItems
        : fallbackItems;

      if (Array.isArray(validation.normalizedItems)) {
        dispatch(replaceCart(validation.normalizedItems));
      }

      if (validation.ok === false) {
        const blocking = hasBlockingIssues(validation.issues);
        setLastBlocking(blocking);
        setLastValidationCode(validation.code || null);
        setLastIssues(validation.issues || null);
        setValidationBanner(formatValidationBannerMessage(validation));
        return {
          ok: false,
          blocking,
          itemsForCheckout: normalizedItems,
        };
      }

      setValidationBanner(formatValidationBannerMessage(validation));
      setLastBlocking(false);
      setLastValidationCode(null);
      setLastIssues(validation.issues || null);
      return { ok: true, blocking: false, itemsForCheckout: normalizedItems };
    } catch (err) {
      setValidationBanner(
        err?.response?.data?.message ||
          "Cart validation failed. Please try again.",
      );
      setLastBlocking(true);
      setLastValidationCode(err?.response?.data?.code || null);
      setLastIssues(null);
      return { ok: false, blocking: true, itemsForCheckout: fallbackItems };
    } finally {
      setIsCartValidating(false);
    }
  };

  useEffect(() => {
    if (!token) {
      if (!items.length) {
        dispatch(fetchCartItems());
      }
      setValidationBanner(null);
      setLastBlocking(false);
      setLastValidationCode(null);
      setLastIssues(null);
      return;
    }

    validateCart(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, token]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (isCartValidating || isResetting) return;

    const isPartnerRole = user?.role === ROLES.PARTNER;

    if (newQuantity < 1) return;

    if (isPartnerRole && newQuantity < 5) {
      toast.warning(t("cart.minPartnerQuantity", { min: 5 }));
      return;
    }

    const resultAction = await dispatch(
      updateCartItemQuantity({ itemId, quantity: newQuantity }),
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
    if (isCartValidating || isResetting) return;

    const resultAction = await dispatch(deleteCartItemThunk(itemId));
    if (deleteCartItemThunk.fulfilled.match(resultAction)) {
      toast.success(t("cart.itemRemoved"));
    } else {
      toast.error(resultAction.payload || t("cart.itemRemoveError"));
    }
  };

  const handleResetCart = async () => {
    if (isCartValidating || isResetting) return;

    setIsResetting(true);
    try {
      const res = await apiService.delete("/cart");
      dispatch(replaceCart([]));
      setValidationBanner(null);
      setLastBlocking(false);
      setLastValidationCode(null);
      setLastIssues(null);
      toast.success(res?.data?.message || "Cart reset");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset cart");
    } finally {
      setIsResetting(false);
    }
  };

  const handleSquareCheckout = async () => {
    setIsCheckoutLoading(true);

    try {
      if (!token) {
        return;
      }

      const validationResult = await validateCart(items);
      if (validationResult.blocking) {
        return;
      }

      const itemsForCheckout = validationResult.itemsForCheckout || items;

      const payload = itemsForCheckout.map((item, index) => {
        const bookId = item.Book?.id;

        if (!bookId || typeof bookId !== "string") {
          console.error(`Invalid bookId at index ${index}`, item);
          throw new Error("Invalid cart structure: bookId missing or invalid");
        }

        return {
          bookId,
          title: item.Book?.title || "Unknown Title",
          price: Number(
            user?.role === ROLES.PARTNER && item.Book?.partnerPrice
              ? item.Book.partnerPrice
              : (item.Book?.price ?? 0),
          ),
          quantity: item.quantity,
        };
      });

      const checkoutRes = await apiService.post(
        "/square/create-payment",
        payload,
        token,
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
          {validationBanner && (
            <div
              role="alert"
              style={{
                marginBottom: "12px",
                padding: "10px",
                border: "1px solid #b00020",
                color: "#b00020",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
              }}
            >
              <span>{validationBanner}</span>
              <div style={{ display: "flex", gap: "8px" }}>
                {isCorruptedCart && (
                  <button
                    type="button"
                    onClick={handleResetCart}
                    disabled={isCartValidating || isResetting}
                    style={{
                      border: "1px solid currentColor",
                      background: "transparent",
                      color: "inherit",
                      cursor: "pointer",
                      padding: "2px 8px",
                    }}
                  >
                    Reset cart
                  </button>
                )}
                {!lastBlocking && (
                  <button
                    type="button"
                    onClick={() => setValidationBanner(null)}
                    style={{
                      border: "1px solid currentColor",
                      background: "transparent",
                      color: "inherit",
                      cursor: "pointer",
                      padding: "2px 8px",
                    }}
                  >
                    Dismiss
                  </button>
                )}
              </div>
            </div>
          )}

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
                    isUpdating={isUpdating || isCartValidating || isResetting}
                    isRemoving={isDeleting || isCartValidating || isResetting}
                    minQty={isPartner ? 5 : 1}
                    isPartner={isPartner}
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
                    disabled={isCheckoutDisabled}
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
