// src/components/CartItem/CartItem.jsx
import styles from "./CartItem.module.css";

const CartItem = ({
  item,
  onQuantityChange,
  onRemove,
  isUpdating = false,
  isRemoving = false,
}) => {
  const handleQuantityChange = (e) => {
    const newQty = Number(e.target.value);
    if (newQty >= 1) {
      onQuantityChange(item.id, newQty);
    }
  };

  if (!item?.Book) return null;

  return (
    <li className={styles.item}>
      <div className={styles.info}>
        <strong>{item.Book.title}</strong>
        <span className={styles.price}> — ${item.Book.price.toFixed(2)}</span>
      </div>

      <div className={styles.controls}>
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={handleQuantityChange}
          disabled={isUpdating}
        />
        <button
          onClick={() => onRemove(item.id)}
          disabled={isRemoving}
          className="btn btn-outline"
        >
          {isRemoving ? "Removing..." : "Remove"}
        </button>
      </div>
    </li>
  );
};

export default CartItem;
