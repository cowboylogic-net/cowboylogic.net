import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { fetchBookById } from "../../store/thunks/bookThunks";
import { addToCartThunk } from "../../store/thunks/cartThunks";
import { selectSelectedBook } from "../../store/selectors/bookSelectors";

import styles from "./BookDetails.module.css";
import FavoriteButton from "../../components/FavoriteButton/FavoriteButton";
import { createSquarePayment } from "../../services/paymentService";

const BookDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.auth.user);
  const book = useSelector(selectSelectedBook);
  const { isFetchingById, error } = useSelector((state) => state.books);

  useEffect(() => {
    if (id) dispatch(fetchBookById(id));
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    if (!book) return;
    try {
      await dispatch(addToCartThunk({ bookId: book.id, quantity: 1 })).unwrap();
    } catch (err) {
      console.error("Add to cart failed", err);
    }
  };

  const handleBuyNow = async () => {
    if (!book || !user) return;
    try {
      const checkoutUrl = await createSquarePayment({
        title: book.title,
        price: book.price,
        bookId: book.id,
        userId: user.id,
      });
      window.location.href = checkoutUrl;
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  if (isFetchingById || !book) return <h2 className={styles.loading}>Loading...</h2>;
  if (error) return <h2 className={styles.error}>{error}</h2>;

  return (
    <div className={styles.bookDetails}>
      <div className={styles.imageContainer}>
        <img src={book.imageUrl} alt={book.title} />
      </div>

      <div className={styles.info}>
        <h1 className={styles.title}>{book.title}</h1>
        <p className={styles.author}>By {book.author}</p>
        <p className={styles.description}>{book.description}</p>
        <p className={styles.price}>${book.price.toFixed(2)}</p>

        {user && (
          <div className={styles.actions}>
            <button onClick={handleAddToCart} className="btn btn-outline">
              Add to Cart
            </button>
            <button onClick={handleBuyNow} className="btn btn-outline">
              Buy Now 💳
            </button>
            <FavoriteButton bookId={book.id} />
          </div>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
