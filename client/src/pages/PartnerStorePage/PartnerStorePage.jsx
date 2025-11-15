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

  useEffect(() => {
    if (!searchParams.get("sort")) {
      setSearchParams((prev) => {
        const sp = new URLSearchParams(prev);
        sp.set("sort", PARTNER_BOOK_SORT_OPTIONS[0].value);
        if (!sp.get("page")) {
          sp.set("page", "1");
        }
        return sp;
      });
    }
  }, [searchParams, setSearchParams]);

  const sortParam = searchParams.get("sort") || PARTNER_BOOK_SORT_OPTIONS[0].value;

  const currentSort = useMemo(() => {
    const found = PARTNER_BOOK_SORT_OPTIONS.find((option) => option.value === sortParam);
    return found || PARTNER_BOOK_SORT_OPTIONS[0];
  }, [sortParam]);

  // ✅ Правильний useEffect
  useEffect(() => {
    if (!user) return; // не фетчимо, доки немає юзера
    const pageFromUrl = Number(searchParams.get("page") || 1);

    dispatch(
      fetchPartnerBooks({
        page: Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1,
        limit: DEFAULT_LIMIT,
        sortBy: currentSort.sortBy,
        order: currentSort.order,
      })
    );
  }, [dispatch, user, searchParams, currentSort]);

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
          {typeof error === "string" ? error : error?.message || "Unknown error"}
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
