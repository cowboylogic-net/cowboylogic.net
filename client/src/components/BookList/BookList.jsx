import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import {
  selectAllBooks,
  selectLoadingFlags,
  selectUser,
} from "../../store/selectors";

import { fetchBooks } from "../../store/thunks/bookThunks";
import { addToCartThunk } from "../../store/thunks/cartThunks";
import { deleteBook } from "../../store/thunks/bookThunks";

import styles from "./BookList.module.css";
import BookCard from "../BookCard/BookCard";
import DeleteConfirmModal from "../modals/DeleteConfirmModal/DeleteConfirmModal";
import Loader from "../Loader/Loader";

const BookList = ({
  books: externalBooks,
  onDelete,
  onEdit,
  onAddToCart,
  disableAutoFetch = false,
  showAdminActions = true,
  showDeleteModal = true,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxBooks = useSelector(selectAllBooks);
  const books = externalBooks ?? reduxBooks;
  const user = useSelector(selectUser);
  const { isFetching } = useSelector(selectLoadingFlags);

  const [bookToDelete, setBookToDelete] = useState(null);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";
  const isLoggedIn = !!user;

  useEffect(() => {
    if (!disableAutoFetch && !externalBooks && books.length === 0) {
      dispatch(fetchBooks());
    }
  }, [dispatch, externalBooks, books.length, disableAutoFetch]);

  const handleEdit = (id) => {
    navigate(`/admin/books/edit/${id}`);
  };

  const handleDelete = async () => {
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

  // 💡 Показувати лоадер лише якщо дані відсутні + loading=true
  if (!books || (books.length === 0 && !externalBooks && isFetching)) {
    return <Loader />;
  }

  return (
    <div className="layoutContainer">
      <div className={styles.bookList}>
        {books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            isAdmin={showAdminActions && isAdmin}
            isLoggedIn={isLoggedIn}
            onEdit={onEdit ?? handleEdit}
            onDeleteClick={
              showAdminActions ? (id) => setBookToDelete(id) : undefined
            }
            onAddToCart={onAddToCart ?? handleAddToCart}
          />
        ))}
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal
          isOpen={!!bookToDelete}
          onClose={() => setBookToDelete(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default BookList;
