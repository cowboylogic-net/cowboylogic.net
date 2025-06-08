// src/components/BookList/BookList.jsx
import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  selectAllBooks,
  selectLoadingFlags,
  selectUser,
  selectToken,
} from "../../store/selectors/";

import { fetchBooks } from "../../store/thunks/bookThunks";
import { fetchFavorites } from "../../store/thunks/favoritesThunks";
import { addToCartThunk } from "../../store/thunks/cartThunks";
import { deleteBook } from "../../store/thunks/bookThunks";

import styles from "./BookList.module.css";
import BookCard from "../BookCard/BookCard";
import DeleteConfirmModal from "../modals/DeleteConfirmModal/DeleteConfirmModal";
import Loader from "../Loader/Loader";

const BookList = ({ onDelete }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const books = useSelector(selectAllBooks);
  const user = useSelector(selectUser);
  const token = useSelector(selectToken);
  const { isFetching } = useSelector(selectLoadingFlags);

  const [bookToDelete, setBookToDelete] = useState(null);
  const hasFetchedFavorites = useRef(false);

  // 🧠 Фетчимо книги лише якщо ще не завантажені
  useEffect(() => {
    if (!books.length) {
      dispatch(fetchBooks());
    }
  }, [dispatch, books.length]);

  // ❤️ Фетчимо улюблені книги один раз
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
      {isFetching ? (
        <Loader />
      ) : (
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
      )}

      <DeleteConfirmModal
        isOpen={!!bookToDelete}
        onClose={() => setBookToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
};

export default BookList;

