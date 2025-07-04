import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { fetchBookById } from "../../store/thunks/bookThunks";
import { addToCartThunk } from "../../store/thunks/cartThunks";
import { fetchFavorites } from "../../store/thunks/favoritesThunks";
import {
  selectSelectedBook,
  selectLoadingFlags,
} from "../../store/selectors/bookSelectors";

import styles from "./BookDetails.module.css";
import FavoriteButton from "../../components/FavoriteButton/FavoriteButton";
import BaseButton from "../../components/BaseButton/BaseButton";
import { toast } from "react-toastify";
import { apiService } from "../../services/axiosService";

const BookDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const hasFetchedFavorites = useRef(false);
  const { isFetchingById } = useSelector(selectLoadingFlags);
  const error = useSelector((state) => state.books.error);
  const book = useSelector(selectSelectedBook);
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token); // 👈 отримай токен

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
    try {
      await dispatch(addToCartThunk({ bookId: book.id, quantity: 1 })).unwrap();
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  };

  const handleSquareCheckout = async () => {
    if (!book || !user || !token) {
      toast.error(t("cart.checkoutError"));
      return;
    }

    try {
      const res = await apiService.post(
        "/square/create-payment",
        {
          title: book.title,
          price: book.price,
          bookId: book.id,
          userId: user.id,
        },
        token // 👈 передаємо токен
      );

      if (res?.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        toast.error(t("cart.checkoutError"));
      }
    } catch (err) {
      toast.error(t("cart.checkoutError"));
      console.error(err);
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
          <p className={styles.price}>${book.price.toFixed(2)}</p>
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
