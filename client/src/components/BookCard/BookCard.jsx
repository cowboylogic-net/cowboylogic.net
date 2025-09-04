import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";

import styles from "./BookCard.module.css";
import FavoriteButton from "../FavoriteButton/FavoriteButton";
import BaseButton from "../BaseButton/BaseButton";
import SmartImage from "../SmartImage/SmartImage";

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

  const mode = isPartnerView ? "partner" : "user";

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {Array.isArray(book.imageVariants) && book.imageVariants.length > 0 ? (
          <SmartImage
            variants={book.imageVariants}
            alt={`Cover of ${book.title}`}
            className={styles.image}
          />
        ) : (
          <img
            src={book.imageUrl || "/fallback-image.png"}
            alt={`Cover of ${book.title}`}
            className={styles.image}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>

      <div className={styles.info}>
        {/* Заголовок + улюблене в одному рядку */}
        <div className={styles.headerRow}>
          <Link
            to={`/bookstore/book/${book.id}?mode=${mode}`}
            state={{ view: mode }}
            className={styles.titleLink}
          >
            <h3 className={styles.cardTitle}>{book.title}</h3>
          </Link>

          {isLoggedIn && (
            <div className={styles.favWrap}>
              <FavoriteButton bookId={book.id} small />
            </div>
          )}
        </div>

        <p className={styles.cardText}>{book.author}</p>

        {!isPartnerView ? (
          <p className={styles.cardText}>
            {t("book.price", { price: book.price })}
          </p>
        ) : (
          <p className={styles.cardText}>
            {t("book.partnerPrice", { price: book.partnerPrice })}
            <span className={styles.cardNoteInline}>
              · {t("book.wholesaleNote")}
            </span>
          </p>
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

        {isAdmin && (
          <div className={styles.adminButtons}>
            <BaseButton
              onClick={() => onEdit(book.id)}
              size="small"
              variant="card"
            >
              {t("book.edit")}
            </BaseButton>
            <BaseButton
              onClick={() => onDeleteClick(book.id)}
              size="small"
              variant="card"
            >
              {t("book.delete")}
            </BaseButton>
          </div>
        )}

        {/* CTA-зона внизу, без absolute */}
        <div className={styles.ctaRow}>
          {!isPartnerView ? (
            <BaseButton
              onClick={() => onAddToCart(book.id)}
              size="small"
              variant="outline"
              disabled={book.stock === 0}
            >
              {book.stock === 0 ? t("book.outOfStock") : t("book.addToCart")}
            </BaseButton>
          ) : (
            isLoggedIn && (
              <div className={styles.partnerControls}>
                <input
                  type="number"
                  value={quantity}
                  min={5}
                  max={book.stock}
                  step={1}
                  inputMode="numeric"
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!Number.isNaN(val) && val >= 5 && val <= book.stock)
                      setQuantity(val);
                    else if (val < 5) setQuantity(5);
                  }}
                  className={styles.partnerInput}
                />
                <BaseButton
                  onClick={() =>
                    quantity >= 5 && onPartnerAdd?.(book, quantity)
                  }
                  size="small"
                  variant="outline"
                  disabled={quantity < 5 || book.stock === 0}
                >
                  {t("book.addToCart")}
                </BaseButton>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default BookCard;
