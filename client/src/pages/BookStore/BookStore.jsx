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

const BookStore = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const user = useSelector(selectUser);
  const books = useSelector(selectAllBooks);

  useEffect(() => {
    dispatch(fetchBooks());
  }, [dispatch]);

  const handleAddBook = () => {
    navigate("/admin/books/new");
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteBook(id)).unwrap();
    } catch (err) {
      console.error("Failed to delete book:", err);
    }
  };

  return (
    <div className={styles.bookStore}>
      <h1>{t("bookstore.title")}</h1>

      {user?.role === "admin" && (
        <div className={styles.addButtonWrapper}>
          <BaseButton variant="outline" onClick={handleAddBook}>
            {t("bookstore.addBook")}
          </BaseButton>
        </div>
      )}

      <BookList books={books} onDelete={handleDelete} disableAutoFetch/>
    </div>
  );
};

export default BookStore;
