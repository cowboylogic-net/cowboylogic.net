import { useEffect, useState, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  selectBooksMeta,
  selectPartnerMeta,
  selectPartnerBooks,
  selectIsFetchingPartnerBooks,
} from "../../store/selectors/bookSelectors";
import { fetchPartnerBooks } from "../../store/thunks/bookThunks";

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
  variant = "user",
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isPartnerView = variant === "partner";

  const reduxBooks = useSelector(
    isPartnerView ? selectPartnerBooks : selectAllBooks,
  );

  const books = useMemo(
    () => externalBooks ?? reduxBooks,
    [externalBooks, reduxBooks],
  );

  const user = useSelector(selectUser);
  const { isFetching } = useSelector(selectLoadingFlags);
  const isFetchingPartnerBooks = useSelector(selectIsFetchingPartnerBooks);

  const [bookToDelete, setBookToDelete] = useState(null);

  const isAdmin =
    user?.role === "admin" || user?.role === "superAdmin" || user?.isSuperAdmin;
  const isLoggedIn = !!user;

  const meta = useSelector(isPartnerView ? selectPartnerMeta : selectBooksMeta);
  const currentPage = meta?.page ?? 1;
  const currentLimit = meta?.limit ?? 12;
  const booksCount = Array.isArray(books) ? books.length : 0;
  const hasExternalBooks = externalBooks != null;

  const isListFetching = isPartnerView ? isFetchingPartnerBooks : isFetching;

  useEffect(() => {
    if (disableAutoFetch) return;
    if (hasExternalBooks) return;
    if (isListFetching) return;
    if (booksCount > 0) return;

    if (isPartnerView) {
      dispatch(fetchPartnerBooks({ page: currentPage, limit: currentLimit }));
    } else {
      dispatch(fetchBooks({ page: currentPage, limit: currentLimit }));
    }
  }, [
    disableAutoFetch,
    hasExternalBooks,
    isListFetching,
    booksCount,
    isPartnerView,
    dispatch,
    currentPage,
    currentLimit,
  ]);

  const handleEdit = (id) => navigate(`/admin/books/edit/${id}`);

  const handleDelete = async () => {
    try {
      if (!bookToDelete) return;
      await dispatch(deleteBook(bookToDelete)).unwrap();
      if (isPartnerView) {
        dispatch(fetchPartnerBooks({ page: currentPage, limit: currentLimit }));
      } else {
        dispatch(fetchBooks({ page: currentPage, limit: currentLimit }));
      }
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

  if (!hasExternalBooks && isListFetching && booksCount === 0) {
    return <Loader />;
  }

  return (
    <div className="layoutContainer">
      <div className={styles.bookList}>
        {Array.isArray(books) &&
          books.map((book) => (
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
