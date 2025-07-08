import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";

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
  isPartnerView = false,
  onPartnerAdd,
}) => {
  const { t } = useTranslation();

  const [quantity, setQuantity] = useState(5);

  const getImageUrl = (url) => {
    if (!url) return "/fallback-image.png";
    if (url.startsWith("http")) return url;

    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return `${baseUrl}${url}`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.topRight}>
        {isLoggedIn && <FavoriteButton bookId={book.id} small />}
      </div>

      <div className={styles.imageWrapper}>
        <img
          src={getImageUrl(book.imageUrl)}
          alt={`Cover of ${book.title}`}
          className={styles.image}
        />
      </div>

      <div className={styles.info}>
        <Link to={`/bookstore/book/${book.id}`} className={styles.titleLink}>
          <h3 className={styles.cardTitle}>{book.title}</h3>
        </Link>

        <p className={styles.cardText}>{book.author}</p>
        {!isPartnerView ? (
          <p className={styles.cardText}>
            {t("book.price", { price: book.price })}
          </p>
        ) : (
          <>
            <p className={styles.cardText}>
              {t("book.partnerPrice", { price: book.partnerPrice })}
            </p>
            <p className={styles.cardNote}>{t("book.wholesaleNote")}</p>
          </>
        )}

        <p
          className={`${styles.cardText} ${
            book.stock === 0 ? styles.outOfStock : ""
          }`}
        >
          {book.stock > 0
            ? t("book.inStock", { count: book.stock })
            : t("book.outOfStock")}
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

        <div className={styles.bottomRight}>
          {isLoggedIn &&
            (!isPartnerView ? (
              <BaseButton
                onClick={() => onAddToCart(book.id)}
                size="sm"
                variant="outline"
                disabled={book.stock === 0}
              >
                {book.stock === 0 ? t("book.outOfStock") : t("book.addToCart")}
              </BaseButton>
            ) : (
              <div className={styles.partnerControls}>
                <input
                  type="number"
                  value={quantity}
                  min={5}
                  max={book.stock}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val >= 5 && val <= book.stock) {
                      setQuantity(val);
                    } else if (val < 5) {
                      setQuantity(5);
                    }
                  }}
                  className={styles.partnerInput}
                />
                <BaseButton
                  onClick={() =>
                    quantity >= 5 && onPartnerAdd?.(book, quantity)
                  }
                  size="sm"
                  variant="outline"
                  disabled={quantity < 5 || book.stock === 0}
                >
                  {t("book.addToCart")}
                </BaseButton>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
