import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import BookList from "../../components/BookList/BookList";
import BaseButton from "../../components/BaseButton/BaseButton";
import Pagination from "../../components/Pagination/Pagination";
import styles from "./BookStore.module.css";
import { fetchBooks, deleteBook } from "../../store/thunks/bookThunks";
import {
  selectAllBooks,
  selectBooksMeta,
} from "../../store/selectors/bookSelectors";
import {
  selectIsAdmin,
  selectAuthBooting,
} from "../../store/selectors/authSelectors";

const DEFAULT_LIMIT = 12;

const BookStore = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();

  
  const isAdmin = useSelector(selectIsAdmin);
  const authBooting = useSelector(selectAuthBooting);
  const books = useSelector(selectAllBooks);
  const { page, totalPages } = useSelector(selectBooksMeta);
  
  const [searchParams, setSearchParams] = useSearchParams();

  // 1) зчитуємо page з URL і фетчимо
  useEffect(() => {
    const pageFromUrl = Number(searchParams.get("page") || 1);
    dispatch(
      fetchBooks({
        page: Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1,
        limit: DEFAULT_LIMIT,
        sortBy: "createdAt",
        order: "desc",
      })
    );
  }, [dispatch, searchParams]);

  const onPageChange = (newPage) => {
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("page", String(newPage));
      return sp;
    });
  };

  const handleAddBook = () => navigate("/admin/books/new");

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteBook(id)).unwrap();
      const current = Number(searchParams.get("page") || 1);
      dispatch(fetchBooks({ page: current, limit: DEFAULT_LIMIT }));
    } catch (err) {
      console.error("Failed to delete book:", err);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{t("bookStore.title", "Book Store")}</h1>
        {!authBooting && isAdmin && (
          <BaseButton onClick={handleAddBook} variant="outline">
            {t("bookStore.addBook", "Add book")}
          </BaseButton>
        )}
      </div>

      <BookList
        books={books}
        onDelete={isAdmin ? handleDelete : undefined}
        showAdminActions={!!isAdmin}
        disableAutoFetch={true}
        variant="user"
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        isDisabled={false}
      />
    </div>
  );
};

export default BookStore;
