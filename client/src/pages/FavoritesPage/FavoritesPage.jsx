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
import BookList from "../../components/BookList/BookList";
import styles from "./FavoritesPage.module.css";

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const favorites = useSelector(selectFavorites);
  const loading = useSelector(selectFavoritesLoading);
  const error = useSelector(selectFavoritesError);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (user) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, user]);

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
        />
      )}
    </div>
  );
};

export default FavoritesPage;
