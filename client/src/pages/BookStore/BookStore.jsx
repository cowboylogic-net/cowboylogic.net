import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import BookList from "../../components/BookList/BookList";
import axios from "../../store/axios";
import styles from "./BookStore.module.css";

const BookStore = () => {
  const [books, setBooks] = useState([]);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const { t } = useTranslation();

  useEffect(() => {
    axios
      .get("/books")
      .then((res) => setBooks(res.data))
      .catch((err) => console.error("Failed to fetch books:", err));
  }, []);

  const handleAddBook = () => {
    navigate("/admin/books/new");
  };

  // 🗑️ Remove book from local list (after deletion)
  const handleDelete = (id) => {
    setBooks((prev) => prev.filter((book) => book.id !== id));
  };

  return (
    <div className={styles.bookStore}>
      <h1>{t("bookstore.title")}</h1>

      {user?.role === "admin" && (
        <button onClick={handleAddBook} className={styles.addButton}>
          {t("bookstore.addBook")}
        </button>
      )}

      <BookList books={books} onDelete={handleDelete} />
    </div>
  );
};

export default BookStore;
