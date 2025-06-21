import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./BookCard.module.css";
import FavoriteButton from "../FavoriteButton/FavoriteButton";
import BaseButton from "../BaseButton/BaseButton";

const BookCard = ({
  book,
  onEdit,
  onDeleteClick,
  onAddToCart,
  isAdmin,
  isLoggedIn,
}) => {
  const { t } = useTranslation();

  const getImageUrl = (url) => {
    if (!url) return "/fallback-image.png";
    if (url.startsWith("http")) return url;
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${baseUrl}${url}`;
  };

  return (
    <div className={styles.card}>
      <img
        src={getImageUrl(book.imageUrl)}
        alt={book.title}
        className={styles.image}
      />

      <div className={styles.info}>
        <Link to={`/bookstore/book/${book.id}`} className={styles.titleLink}>
          <h3>{book.title}</h3>
        </Link>

        <p>{book.author}</p>
        <p>${book.price}</p>
        <p>
          {book.inStock ? t("book.inStock") : t("book.outOfStock")}
        </p>

        <div className={styles.actionRow}>
          {isLoggedIn && (
            <>
              <BaseButton
                onClick={() => onAddToCart(book.id)}
                size="sm"
                variant="card"
              >
                {t("book.addToCart")}
              </BaseButton>
              <FavoriteButton bookId={book.id} small />
            </>
          )}

          {isAdmin && (
            <div className={styles.adminButtons}>
              <BaseButton onClick={() => onEdit(book.id)} size="sm" variant="card">
                {t("book.edit")}
              </BaseButton>
              <BaseButton onClick={() => onDeleteClick(book.id)} size="sm" variant="card">
                {t("book.delete")}
              </BaseButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
