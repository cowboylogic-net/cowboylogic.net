import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import BaseButton from "../BaseButton/BaseButton";
import BaseInput from "../BaseInput/BaseInput";
import styles from "./CartItem.module.css";
import { useSelector } from "react-redux";

const CartItem = ({
  item,
  onQuantityChange,
  onRemove,
  isUpdating = false,
  isRemoving = false,
}) => {
  const { t } = useTranslation();
  const [localQty, setLocalQty] = useState(item.quantity);
  const isPartner = useSelector((s) => s.auth.user?.role === "partner");

  // Синхронізуємо після refetch кошика
  useEffect(() => {
    setLocalQty(item.quantity);
  }, [item.quantity]);

  const handleChange = (e) => {
    const raw = e.target.value;
    const next = Math.max(1, Math.floor(Number(raw) || 0));
    setLocalQty(next);
  };

  const handleBlur = () => {
    if (localQty !== item.quantity) {
      onQuantityChange(item.id, localQty);
    }
  };

  if (!item?.Book) return null;
  

  const rawPrice = isPartner && item.Book?.partnerPrice != null
   ? item.Book.partnerPrice
   : item.Book?.price;

  const price = Number(rawPrice);

  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <strong>{item.Book.title}</strong>
        <span className={styles.price}>
          {" "}
          — {isNaN(price) ? "N/A" : `$${price.toFixed(2)}`}
        </span>
      </div>

      <div className={styles.controls}>
        <BaseInput
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          pattern="[0-9]*"
          value={localQty}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={isUpdating}
          aria-busy={isUpdating}
          aria-label={t("cart.quantity")}
          inline
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        />

        <BaseButton
          variant="outline"
          onClick={() => onRemove(item.id)}
          disabled={isRemoving || isUpdating}
          aria-busy={isRemoving}
        >
          {isRemoving ? t("cart.removing") : t("cart.remove")}
        </BaseButton>
      </div>
    </li>
  );
};

export default CartItem;
