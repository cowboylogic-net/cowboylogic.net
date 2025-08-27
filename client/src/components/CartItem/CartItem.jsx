// src/components/CartItem/CartItem.jsx
import { useEffect, useState } from "react";
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
  minQty = 1, // ⬅️ нове
  isPartner = false, // ⬅️ нове (для підказки)
}) => {
  const { t } = useTranslation();

  const stock = Number(item?.Book?.stock ?? 0);
  const clamp = (v) => {
  const n = Math.floor(Number(v) || 0); // ← правильно конвертує string->number
  const lower = Math.max(minQty, n);
  return stock > 0 ? Math.min(lower, stock) : lower;
};


  const [localQty, setLocalQty] = useState(clamp(item.quantity));

  // синхронізуємо при рефетчі кошика або зміні minQty
  useEffect(() => {
    setLocalQty(clamp(item.quantity));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item.quantity, minQty, stock]);

  const handleChange = (e) => {
    const next = clamp(e.target.value);
    setLocalQty(next);
  };

  const handleBlur = () => {
    const next = clamp(localQty);
    if (next !== localQty) setLocalQty(next);
    if (next !== item.quantity) onQuantityChange(item.id, next);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  if (!item?.Book) return null;

  const showPrice =
    isPartner && item.Book?.partnerPrice != null
      ? Number(item.Book.partnerPrice)
      : Number(item.Book?.price ?? 0);

  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <strong>{item.Book.title}</strong>
        <span className={styles.price}>
          {" — "}
          {Number.isFinite(showPrice) ? `$${showPrice.toFixed(2)}` : "N/A"}
        </span>
      </div>

      <div className={styles.controls}>
        <BaseInput
          type="number"
          min={minQty} // ⬅️ ключове
          step={1}
          inputMode="numeric"
          pattern="[0-9]*"
          value={localQty}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={isUpdating}
          aria-busy={isUpdating}
          aria-label={t("cart.quantity")}
          inline
        />

        {isPartner && (
          <small className={styles.note}>
            {t("cart.minPartnerQuantity", { min: minQty })}
          </small>
        )}

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
