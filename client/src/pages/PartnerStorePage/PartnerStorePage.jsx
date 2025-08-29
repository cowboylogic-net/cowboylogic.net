// client/src/pages/PartnerStorePage/PartnerStorePage.jsx
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import styles from "./PartnerStorePage.module.css";
import Loader from "../../components/Loader/Loader";
import BookList from "../../components/BookList/BookList";
import Pagination from "../../components/Pagination/Pagination";

import { fetchPartnerBooks } from "../../store/thunks/bookThunks";
import {
  selectPartnerBooks,
  selectIsFetchingPartnerBooks,
  selectBooksError,
  selectPartnerMeta,
} from "../../store/selectors/bookSelectors";

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

  // ✅ Правильний useEffect
  useEffect(() => {
    if (!user) return; // не фетчимо, доки немає юзера
    const pageFromUrl = Number(searchParams.get("page") || 1);

    dispatch(
      fetchPartnerBooks({
        page: Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1,
        limit: DEFAULT_LIMIT,
        sortBy: "createdAt",
        order: "desc",
      })
    );
  }, [dispatch, user, searchParams]);

  const onPageChange = (newPage) => {
    setSearchParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set("page", String(newPage));
      return sp;
    });
  };

  return (
    <div className={styles.partnerStore}>
      <h1>{t("partnerStore.title")}</h1>

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
