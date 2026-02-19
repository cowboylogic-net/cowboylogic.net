// client/src/pages/PartnerStorePage/PartnerStorePage.jsx
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import styles from "./PartnerStorePage.module.css";
import Loader from "../../components/Loader/Loader";
import BookList from "../../components/BookList/BookList";
import Pagination from "../../components/Pagination/Pagination";
import BaseSelect from "../../components/BaseSelect/BaseSelect";
import { fetchPartnerBooks } from "../../store/thunks/bookThunks";
import {
  selectPartnerBooks,
  selectIsFetchingPartnerBooks,
  selectBooksError,
  selectPartnerMeta,
} from "../../store/selectors/bookSelectors";
import { PARTNER_BOOK_SORT_OPTIONS } from "../../constants/bookSortOptions";

const DEFAULT_LIMIT = 12;

const PartnerStorePage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const books = useSelector(selectPartnerBooks);
  const isLoading = useSelector(selectIsFetchingPartnerBooks);
  const error = useSelector(selectBooksError);
  const user = useSelector((state) => state.auth.user);
  const { page, totalPages } = useSelector(selectPartnerMeta);

  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get("sort");
  const pageParam = searchParams.get("page");

  useEffect(() => {
    if (sortParam && pageParam) return;

    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);

      if (!sp.get("sort")) {
        sp.set("sort", PARTNER_BOOK_SORT_OPTIONS[0].value);
      }
      if (!sp.get("page")) {
        sp.set("page", "1");
      }

      return sp;
    });
  }, [sortParam, pageParam, setSearchParams]);

  const activeSort = sortParam || PARTNER_BOOK_SORT_OPTIONS[0].value;

  const currentSort = useMemo(() => {
    const found = PARTNER_BOOK_SORT_OPTIONS.find(
      (option) => option.value === activeSort,
    );
    return found || PARTNER_BOOK_SORT_OPTIONS[0];
  }, [activeSort]);

  const resolvedPage = useMemo(() => {
    const parsed = Number(pageParam || 1);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [pageParam]);

  useEffect(() => {
    if (!user) return;

    dispatch(
      fetchPartnerBooks({
        page: resolvedPage,
        limit: DEFAULT_LIMIT,
        sortBy: currentSort.sortBy,
        order: currentSort.order,
      }),
    );
  }, [dispatch, user, resolvedPage, currentSort.sortBy, currentSort.order]);

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

  return (
    <div className={styles.partnerStore}>
      <h1>{t("partnerStore.title")}</h1>

      <div className={styles.controls}>
        <BaseSelect
          id="partner-book-sort"
          name="partner-book-sort"
          value={currentSort.value}
          onChange={onSortChange}
          options={PARTNER_BOOK_SORT_OPTIONS.map((option) => ({
            value: option.value,
            label: t(option.labelKey),
          }))}
          placeholder={t("book.sort.label")}
          aria-label={t("book.sort.label")}
        />
      </div>

      {isLoading && <Loader />}

      {error && (
        <p>
          {typeof error === "string"
            ? error
            : error?.message || "Unknown error"}
          {t("partnerStore.loadError")}
        </p>
      )}

      {!isLoading && !error && (
        <>
          {/* щоб список НЕ фетчив сам заново */}
          <BookList books={books} variant="partner" disableAutoFetch />
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            isDisabled={false}
          />
        </>
      )}
    </div>
  );
};

export default PartnerStorePage;
