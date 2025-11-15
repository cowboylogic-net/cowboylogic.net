import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import BookList from "../../components/BookList/BookList";
import BaseButton from "../../components/BaseButton/BaseButton";
import Pagination from "../../components/Pagination/Pagination";
import BaseSelect from "../../components/BaseSelect/BaseSelect";
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
import { BOOK_SORT_OPTIONS } from "../../constants/bookSortOptions";

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
  useEffect(() => {
    if (!searchParams.get("sort")) {
      setSearchParams((prev) => {
        const sp = new URLSearchParams(prev);
        sp.set("sort", BOOK_SORT_OPTIONS[0].value);
        if (!sp.get("page")) {
          sp.set("page", "1");
        }
        return sp;
      });
    }
  }, [searchParams, setSearchParams]);

  const sortParam = searchParams.get("sort") || BOOK_SORT_OPTIONS[0].value;

  const currentSort = useMemo(() => {
    const found = BOOK_SORT_OPTIONS.find(
      (option) => option.value === sortParam
    );
    return found || BOOK_SORT_OPTIONS[0];
  }, [sortParam]);

  // 1) зчитуємо page з URL і фетчимо
  useEffect(() => {
    const pageFromUrl = Number(searchParams.get("page") || 1);
    const resolvedPage =
      Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1;

    dispatch(
      fetchBooks({
        page: resolvedPage,
        limit: DEFAULT_LIMIT,
        sortBy: currentSort.sortBy,
        order: currentSort.order,
      })
    );
  }, [dispatch, searchParams, currentSort]);

  const onPageChange = (newPage) => {
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("page", String(newPage));
      if (!sp.get("sort")) {
        sp.set("sort", currentSort.value);
      }
      return sp;
    });
  };

  const onSortChange = (event) => {
    const nextSort = event.target.value;
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("sort", nextSort);
      sp.set("page", "1");
      return sp;
    });
  };

  const handleAddBook = () => navigate("/admin/books/new");

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteBook(id)).unwrap();
      const current = Number(searchParams.get("page") || 1);
      dispatch(
        fetchBooks({
          page: current,
          limit: DEFAULT_LIMIT,
          sortBy: currentSort.sortBy,
          order: currentSort.order,
        })
      );
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
      <div className={styles.controls}>
        <BaseSelect
          id="book-sort"
          name="book-sort"
          value={currentSort.value}
          onChange={onSortChange}
          options={BOOK_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
          placeholder={t("book.sort.label")}
          aria-label={t("book.sort.label")}
        />
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
