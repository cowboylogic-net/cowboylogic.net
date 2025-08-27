import { useState, useEffect, useMemo } from "react";
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
  onEdit,
  onAddToCart,
  disableAutoFetch = false,
  showAdminActions = true,
  showDeleteModal = true,
  variant = "default",
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxBooks = useSelector(selectAllBooks);
  const books = useMemo(() => externalBooks ?? reduxBooks, [externalBooks, reduxBooks]);

  const user = useSelector(selectUser);
  const { isFetching } = useSelector(selectLoadingFlags);

  const [bookToDelete, setBookToDelete] = useState(null);

  const isAdmin =
    user?.role === "admin" || user?.role === "superAdmin" || user?.isSuperAdmin;
  const isLoggedIn = !!user;

  const isPrivileged =
    !!user && (user.role === "partner" || user.role === "admin" || user.role === "superAdmin" || user.isSuperAdmin);
  const isPartnerView = variant === "partner" || (variant === "default" && isPrivileged);

  useEffect(() => {
    if (!disableAutoFetch && !externalBooks && books.length === 0) {
      dispatch(fetchBooks());
    }
  }, [dispatch, externalBooks, books.length, disableAutoFetch]);

  const handleEdit = (id) => navigate(`/admin/books/edit/${id}`);

  const handleDelete = async () => {
    try {
      if (!bookToDelete) return;
      await dispatch(deleteBook(bookToDelete)).unwrap();
      dispatch(fetchBooks());
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

  const handlePartnerAdd = async (book, quantity) => {
    try {
      await dispatch(addToCartThunk({ bookId: book.id, quantity })).unwrap();
    } catch (err) {
      console.error("Partner add to cart error:", err);
    }
  };

  if (!externalBooks && isFetching && (!books || books.length === 0)) {
    return <Loader />;
  }

  return (
    <div className="layoutContainer">
      <div className={styles.bookList}>
        {Array.isArray(books) && books.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            isAdmin={showAdminActions && isAdmin}
            isLoggedIn={isLoggedIn}
            onEdit={onEdit ?? handleEdit}
            onDeleteClick={showAdminActions ? (id) => setBookToDelete(id) : undefined}
            onAddToCart={onAddToCart ?? handleAddToCart}
            isPartnerView={isPartnerView}
            onPartnerAdd={handlePartnerAdd}
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
