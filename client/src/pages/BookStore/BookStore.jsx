import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import BookList from "../../components/BookList/BookList";
import BaseButton from "../../components/BaseButton/BaseButton";
import Pagination from "../../components/Pagination/Pagination";
import BaseSelect from "../../components/BaseSelect/BaseSelect";
import Loader from "../../components/Loader/Loader";
import styles from "./BookStore.module.css";
import { fetchBooks, deleteBook } from "../../store/thunks/bookThunks";
import {
  selectAllBooks,
  selectBooksMeta,
  selectLoadingFlags,
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
  const { isFetching } = useSelector(selectLoadingFlags);
  const { page, totalPages } = useSelector(selectBooksMeta);

  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get("sort");
  const pageParam = searchParams.get("page");

  useEffect(() => {
    if (!sortParam) {
      setSearchParams((prev) => {
        const sp = new URLSearchParams(prev);
        sp.set("sort", BOOK_SORT_OPTIONS[0].value);
        if (!pageParam) {
          sp.set("page", "1");
        }
        return sp;
      });
    }
  }, [sortParam, pageParam, setSearchParams]);

  const activeSort = sortParam || BOOK_SORT_OPTIONS[0].value;

  const currentSort = useMemo(() => {
    const found = BOOK_SORT_OPTIONS.find(
      (option) => option.value === activeSort,
    );
    return found || BOOK_SORT_OPTIONS[0];
  }, [activeSort]);

  const resolvedPage = useMemo(() => {
    const parsedPage = Number(pageParam || 1);
    return Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  }, [pageParam]);

  useEffect(() => {
    dispatch(
      fetchBooks({
        page: resolvedPage,
        limit: DEFAULT_LIMIT,
        sortBy: currentSort.sortBy,
        order: currentSort.order,
      }),
    );
  }, [dispatch, resolvedPage, currentSort.sortBy, currentSort.order]);

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
        }),
      );
    } catch (err) {
      console.error("Failed to delete book:", err);
    }
  };

  if (isFetching && books.length === 0) {
    return (
      <div className={styles.loadingState}>
        <Loader />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>{t("bookStore.title")}</h1>
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
