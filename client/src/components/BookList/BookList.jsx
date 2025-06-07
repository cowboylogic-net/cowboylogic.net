import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { fetchFavorites } from "../../store/thunks/favoritesThunks";
import { addToCartThunk } from "../../store/thunks/cartThunks";
import { deleteBook } from "../../store/thunks/bookThunks";

import styles from "./BookList.module.css";
import BookCard from "../BookCard/BookCard";
import DeleteConfirmModal from "../modals/DeleteConfirmModal/DeleteConfirmModal";

const BookList = ({ books = [], onDelete }) => {
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [bookToDelete, setBookToDelete] = useState(null);
  const hasFetchedFavorites = useRef(false); // ✅

  useEffect(() => {
    if (token && !hasFetchedFavorites.current) {
      dispatch(fetchFavorites());
      hasFetchedFavorites.current = true;
    }
  }, [dispatch, token]);

  const handleEdit = (id) => {
    navigate(`/admin/books/edit/${id}`);
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteBook(bookToDelete)).unwrap();
      onDelete?.(bookToDelete);
    } catch (err) {
      console.error("Delete failed", err);
    } finally {
      setBookToDelete(null);
    }
  };

  const handleAddToCart = async (bookId) => {
    try {
      await dispatch(addToCartThunk({ bookId, quantity: 1 })).unwrap();
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  return (
    <>
      <div className={styles.bookList}>
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            isAdmin={user?.role === "admin" || user?.role === "superadmin"}
            isLoggedIn={!!user}
            onEdit={handleEdit}
            onDeleteClick={(id) => setBookToDelete(id)}
            onAddToCart={handleAddToCart}
          />
        ))}
      </div>

      <DeleteConfirmModal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default BookList;
