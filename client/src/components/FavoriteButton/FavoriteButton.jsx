import { useDispatch, useSelector } from "react-redux";
import { addFavorite, removeFavorite } from "../../store/thunks/favoritesThunks";
import { selectFavorites } from "../../store/selectors/favoritesSelectors";
import { Heart, HeartPulse } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./FavoriteButton.module.css";

const FavoriteButton = ({ bookId, small = false }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const favorites = useSelector(selectFavorites);
  const isFavorite = favorites.some((b) => String(b.id) === String(bookId));

  const toggleFavorite = async () => {
    if (!token) return;
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
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isFavorite ? "filled" : "empty"}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {isFavorite ? <HeartPulse size={18} /> : <Heart size={18} />}
        </motion.div>
      </AnimatePresence>
      {!small && <span>{isFavorite ? "Remove" : "Add to Favorites"}</span>}
    </button>
  );
};

export default FavoriteButton;
