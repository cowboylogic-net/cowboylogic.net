import { useTranslation } from "react-i18next";
import BaseButton from "../BaseButton/BaseButton";
import BaseInput from "../BaseInput/BaseInput";
import styles from "./CartItem.module.css";

const CartItem = ({
  item,
  onQuantityChange,
  onRemove,
  isUpdating = false,
  isRemoving = false,
}) => {
  const { t } = useTranslation();

  const handleQuantityChange = (e) => {
    const newQty = Number(e.target.value);
    if (newQty >= 1) {
      onQuantityChange(item.id, newQty);
    }
  };

  if (!item?.Book) return null;

  const rawPrice =
  item.Book.partnerPrice !== undefined &&
  item.Book.partnerPrice !== null &&
  item.Book.partnerPrice !== ""
    ? item.Book.partnerPrice
    : item.Book.price;

  const price = Number(rawPrice);

  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <strong>{item.Book.title}</strong>
        <span className={styles.price}> — {isNaN(price) ? "N/A" : `$${price.toFixed(2)}`}</span>
      </div>

      <div className={styles.controls}>
        <BaseInput
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          disabled={isUpdating}
          aria-label={t("cart.quantity")}
          inline
        />

        <BaseButton
          variant="outline"
          onClick={() => onRemove(item.id)}
          disabled={isRemoving}
        >
          {isRemoving ? t("cart.removing") : t("cart.remove")}
        </BaseButton>
      </div>
    </li>
  );
};

export default CartItem;
