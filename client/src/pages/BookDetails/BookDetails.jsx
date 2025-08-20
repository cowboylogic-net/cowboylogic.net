import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { ROLES } from "../../constants/roles";

import { fetchBookById } from "../../store/thunks/bookThunks";
import { addToCartThunk } from "../../store/thunks/cartThunks";
import { fetchFavorites } from "../../store/thunks/favoritesThunks";
import {
  selectSelectedBook,
  selectLoadingFlags,
} from "../../store/selectors/bookSelectors";
import { apiService } from "../../services/axiosService";

import FavoriteButton from "../../components/FavoriteButton/FavoriteButton";
import BaseButton from "../../components/BaseButton/BaseButton";
import styles from "./BookDetails.module.css";
import { toast } from "react-toastify";

const BookDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const hasFetchedFavorites = useRef(false);
  const { isFetchingById } = useSelector(selectLoadingFlags);
  const error = useSelector((state) => state.books.error);
  const book = useSelector(selectSelectedBook);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);

  const isPartner = user?.role === ROLES.PARTNER;
  const displayPrice =
    isPartner && book?.partnerPrice
      ? Number(book.partnerPrice).toFixed(2)
      : Number(book?.price ?? 0).toFixed(2);

  useEffect(() => {
    if (id) dispatch(fetchBookById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (user && !hasFetchedFavorites.current) {
      dispatch(fetchFavorites());
      hasFetchedFavorites.current = true;
    }
  }, [user, dispatch]);

  const handleAddToCart = async () => {
    if (!book) return;
    const quantity = isPartner ? 5 : 1;

    try {
      await dispatch(addToCartThunk({ bookId: book.id, quantity })).unwrap();
      toast.success(
        isPartner
          ? t("book.partnerCartSuccess", { count: quantity })
          : t("book.addedToCart")
      );
    } catch (err) {
      console.error("Add to cart failed", err);
      toast.error(t("book.addToCartError"));
    }
  };

  const handleSquareCheckout = async () => {
    if (!book || !user || !token) {
      toast.error(t("cart.checkoutError"));
      return;
    }

    const quantity = isPartner ? 5 : 1;
    const pricePerUnit =
      isPartner && book.partnerPrice
        ? Number(book.partnerPrice)
        : Number(book.price);

    if (book.stock < quantity) {
      toast.error(t("cart.outOfStockGeneric"));
      return;
    }

    try {
      const res = await apiService.post(
        "/square/create-payment",
        [
          {
            bookId: book.id,
            title: book.title,
            price: pricePerUnit,
            quantity,
          },
        ],
        token
      );

      if (res?.data?.data?.checkoutUrl) {
        window.location.href = res.data.data.checkoutUrl;
      } else {
        toast.error(t("cart.checkoutError"));
      }
    } catch (err) {
      console.error("Checkout failed", err);
      toast.error(t("cart.checkoutError"));
    }
  };

  if (isFetchingById || !book)
    return <h2 className={styles.loading}>{t("book.loading")}</h2>;
  if (error) return <h2 className={styles.error}>{error}</h2>;

  return (
    <div className="layoutContainer">
      <div className={styles.bookDetails}>
        <div className={styles.imageContainer}>
          <img src={book.imageUrl} alt={book.title} />
        </div>

        <div className={styles.info}>
          <div className={styles.favoriteTopRight}>
            <FavoriteButton bookId={book.id} small />
          </div>

          <h1 className={styles.title}>{book.title}</h1>
          <p className={styles.author}>
            {t("book.byAuthor", { author: book.author })}
          </p>
          <p className={styles.description}>{book.description}</p>

          <p className={styles.price}>
            ${displayPrice}
            {isPartner && book.partnerPrice && (
              <span className={styles.cardNote}>— {t("book.partnerNote")}</span>
            )}
          </p>

          <p className={styles.stock}>
            {book.stock > 0
              ? t("book.inStock", { count: book.stock })
              : t("book.outOfStock")}
          </p>

          {user && (
            <div className={styles.actions}>
              <BaseButton
                onClick={handleAddToCart}
                size="lg"
                variant="outline"
                disabled={book.stock === 0}
              >
                {book.stock === 0 ? t("book.outOfStock") : t("book.addToCart")}
              </BaseButton>
              <BaseButton
                onClick={handleSquareCheckout}
                size="lg"
                variant="outline"
              >
                {t("book.buyNow")}
              </BaseButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
