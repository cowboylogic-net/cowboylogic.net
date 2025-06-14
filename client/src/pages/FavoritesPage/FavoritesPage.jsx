import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import { fetchFavorites } from "../../store/thunks/favoritesThunks";
import {
  selectFavorites,
  selectFavoritesLoading,
  selectFavoritesError,
} from "../../store/selectors/favoritesSelectors";

import Loader from "../../components/Loader/Loader";
import BookCard from "../../components/BookCard/BookCard"; // ✅
import styles from "./FavoritesPage.module.css";

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const favorites = useSelector(selectFavorites);
  const loading = useSelector(selectFavoritesLoading);
  const error = useSelector(selectFavoritesError);
  const user = useSelector((state) => state.auth.user); // ✅

  useEffect(() => {
    dispatch(fetchFavorites());
  }, [dispatch]);

  if (loading) return <Loader />;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>❤️ {t("favorites.heading")}</h2>
      {favorites.length === 0 ? (
        <p>{t("favorites.empty")}</p>
      ) : (
        <div className={styles.bookList}>
          {favorites.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              isLoggedIn={!!user}
              // ❌ admin-only props are left undefined
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
