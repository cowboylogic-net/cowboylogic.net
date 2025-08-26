import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  selectFavorites,
  selectFavoritesLoading,
  selectFavoritesError,
} from "../../store/selectors/favoritesSelectors";

import Loader from "../../components/Loader/Loader";
import BookList from "../../components/BookList/BookList";
import styles from "./FavoritesPage.module.css";

const FavoritesPage = () => {
  const { t } = useTranslation();

  const favorites = useSelector(selectFavorites);
  const loading = useSelector(selectFavoritesLoading);
  const error = useSelector(selectFavoritesError);
  const user = useSelector((state) => state.auth.user);

  if (!user) return <p>{t("favorites.unauthorized")}</p>;
  if (loading) return <Loader />;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>❤️ {t("favorites.heading")}</h1>
      {favorites.length === 0 ? (
        <p>{t("favorites.empty")}</p>
      ) : (
        <BookList
          books={favorites}
          disableAutoFetch
          showAdminActions={false}
          showDeleteModal={false}
          variant={
            user?.role === "partner" ||
            user?.role === "admin" ||
            user?.isSuperAdmin
              ? "partner"
              : "default"
          }
          // (опц.) якщо BookList потребує — можна також передати:
          // isLoggedIn={!!user}
        />
      )}
    </div>
  );
};

export default FavoritesPage;
