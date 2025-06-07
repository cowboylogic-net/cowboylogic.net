import { useDispatch, useSelector } from "react-redux";
import {
  addFavorite,
  removeFavorite,
} from "../../store/thunks/favoritesThunks";
import { selectFavorites } from "../../store/selectors/favoritesSelectors";
import styles from "./FavoriteButton.module.css";

const FavoriteButton = ({ bookId, small = false }) => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const favorites = useSelector(selectFavorites); // ✅ беремо список прямо

  const isFavorite = favorites.some((b) => String(b.id) === String(bookId)); // 🛡️ надійна перевірка

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
      className={small ? styles.favoriteIconOnly : "btn btn-outline"}
      title={isFavorite ? "Remove from favorites" : "Add to favorites"}
    >
      {small
        ? isFavorite
          ? "💔"
          : "❤️"
        : isFavorite
        ? "💔 Remove"
        : "❤️ Add to Favorites"}
    </button>
  );
};

export default FavoriteButton;
