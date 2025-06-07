import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchFavorites
} from "../../store/thunks/favoritesThunks";
import {
  selectFavorites,
  selectFavoritesLoading,
  selectFavoritesError,
} from "../../store/selectors/favoritesSelectors";
import { useNavigate } from "react-router-dom";
import FavoriteButton from "../../components/FavoriteButton/FavoriteButton";
import styles from "./FavoritesPage.module.css";

const FavoritesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const favorites = useSelector(selectFavorites);
  const loading = useSelector(selectFavoritesLoading);
  const error = useSelector(selectFavoritesError);

  useEffect(() => {
    if (favorites.length === 0) {
      dispatch(fetchFavorites());
    }
  }, [dispatch, favorites.length]);

  if (loading) return <h2>Loading favorites...</h2>;
  if (error) return <h2 style={{ color: "red" }}>{error}</h2>;

  return (
    <div className={styles.page}>
      <h2 className={styles.heading}>❤️ My Favorite Books</h2>
      {favorites.length === 0 ? (
        <p>You do not have any favorites yet.</p>
      ) : (
        <div className={styles.bookList}>
          {favorites.map((book) => (
            <div key={book.id} className={styles.card}>
              <img
                src={book.imageUrl}
                alt={book.title}
                className={styles.image}
                onClick={() => navigate(`/bookstore/book/${book.id}`)}
              />
              <div className={styles.info}>
                <div className={styles.actions}>
                  <FavoriteButton bookId={book.id} />
                </div>
                <h3>{book.title}</h3>
                <p>{book.author}</p>
                <p>${book.price}</p>
                <p>{book.inStock ? "In Stock" : "Out of Stock"}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
