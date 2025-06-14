import { useDispatch, useSelector } from "react-redux";
import {
  addFavorite,
  removeFavorite,
} from "../../store/thunks/favoritesThunks";
import {
  selectFavorites,
  selectFavoritesLoading,
} from "../../store/selectors/favoritesSelectors";
import { Heart, HeartPulse, LoaderCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import styles from "./FavoriteButton.module.css";

const FavoriteButton = ({ bookId, small = false }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const favorites = useSelector(selectFavorites);
  const isLoading = useSelector(selectFavoritesLoading);
  const isFavorite = favorites.some((b) => String(b.id) === String(bookId));

  const toggleFavorite = async () => {
    if (!token || isLoading) return;
    try {
      if (isFavorite) {
        await dispatch(removeFavorite(bookId)).unwrap();
      } else {
        await dispatch(addFavorite(bookId)).unwrap();
      }
    } catch (err) {
      console.error("Favorite toggle failed", err);
    }
  };

  return (
    <button
      onClick={toggleFavorite}
      className={
        small
          ? styles.favoriteIconOnly
          : `${styles.favoriteButton} ${isFavorite ? styles.filled : ""}`
      }
      title={
        isFavorite ? t("book.unfavorite") : t("book.favorite")
      }
      disabled={isLoading}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isLoading ? "loading" : isFavorite ? "filled" : "empty"}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? (
            <LoaderCircle size={18} className={styles.spinner} />
          ) : isFavorite ? (
            <HeartPulse size={18} />
          ) : (
            <Heart size={18} />
          )}
        </motion.div>
      </AnimatePresence>
      {!small && <span>{isFavorite ? t("book.unfavorite") : t("book.favorite")}</span>}
    </button>
  );
};

export default FavoriteButton;
