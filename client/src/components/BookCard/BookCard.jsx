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
  return `${baseUrl}${url}`; // не додаємо додатковий слеш!
};


  return (
    <div className={styles.card}>
      <div className={styles.topRight}>
        {isLoggedIn && <FavoriteButton bookId={book.id} small />}
      </div>

      <img
        src={getImageUrl(book.imageUrl)}
        alt={book.title}
        className={styles.image}
      />

      <div className={styles.info}>
        <Link to={`/bookstore/book/${book.id}`} className={styles.titleLink}>
          <h3 className={styles.cardTitle}>{book.title}</h3>
        </Link>

        <p className={styles.cardText}>{book.author}</p>
        <p className={styles.cardText}>
          {t("book.price", { price: book.price })}
        </p>
        <p className={styles.cardText}>
          {book.inStock ? t("book.inStock") : t("book.outOfStock")}
        </p>

        <div className={styles.actionRow}>
          {isAdmin && (
            <div className={styles.adminButtons}>
              <BaseButton
                onClick={() => onEdit(book.id)}
                size="sm"
                variant="card"
              >
                {t("book.edit")}
              </BaseButton>
              <BaseButton
                onClick={() => onDeleteClick(book.id)}
                size="sm"
                variant="card"
              >
                {t("book.delete")}
              </BaseButton>
            </div>
          )}
        </div>

        {isLoggedIn && (
          <div className={styles.bottomRight}>
            <BaseButton
              onClick={() => onAddToCart(book.id)}
              size="sm"
              variant="outline"
            >
              {t("book.addToCart")}
            </BaseButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookCard;
