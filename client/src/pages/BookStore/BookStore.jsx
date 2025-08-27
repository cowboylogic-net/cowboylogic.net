// src/pages/BookStore/BookStore.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import BookList from "../../components/BookList/BookList";
import BaseButton from "../../components/BaseButton/BaseButton";
import styles from "./BookStore.module.css";
import { selectUser } from "../../store/selectors/authSelectors";
import { selectAllBooks } from "../../store/selectors/bookSelectors";
import { fetchBooks, deleteBook } from "../../store/thunks/bookThunks";
import { ROLES } from "../../constants/roles";

const BookStore = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const user = useSelector(selectUser);
  const books = useSelector(selectAllBooks);

  useEffect(() => {
    if (user?.role === ROLES.PARTNER) navigate("/partner-store"); // ⬅️ редирект партнера
  }, [user, navigate]);

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  const handleAddBook = () => navigate("/admin/books/new");

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteBook(id)).unwrap();
    } catch (err) {
      console.error("Failed to delete book:", err);
    }
  };

  const isAdmin = user?.role === "admin" || user?.role === "superAdmin" || user?.isSuperAdmin;

  return (
    <div className={styles.bookStore}>
      <h1>{t("bookstore.title")}</h1>

      {isAdmin && (
        <div className={styles.addButtonWrapper}>
          <BaseButton variant="outline" onClick={handleAddBook}>
            {t("bookstore.addBook")}
          </BaseButton>
        </div>
      )}

      {/* список для цієї сторінки ВСІМ показує user-ціни */}
      <BookList books={books} onDelete={handleDelete} disableAutoFetch variant="user" />
    </div>
  );
};

export default BookStore;
