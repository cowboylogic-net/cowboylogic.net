import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import styles from "./PartnerStorePage.module.css";
import Loader from "../../components/Loader/Loader";
import BookList from "../../components/BookList/BookList";

import { fetchPartnerBooks } from "../../store/thunks/bookThunks";
import {
  selectPartnerBooks,
  selectIsFetchingPartnerBooks,
  selectBooksError,
} from "../../store/selectors/bookSelectors";

const PartnerStorePage = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const books = useSelector(selectPartnerBooks);
  const isLoading = useSelector(selectIsFetchingPartnerBooks);
  const error = useSelector(selectBooksError);
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
  if (user) {
    console.log("👥 User detected, fetching partner books...");
    dispatch(fetchPartnerBooks());
  }
}, [dispatch, user]);


  return (
    <div className={styles.partnerStore}>
      <h1>{t("partnerStore.title")}</h1>

      {isLoading && <Loader />}

      {error && (
        <p>
          {typeof error === "string"
            ? error
            : error?.message || "Unknown error"}
          {t("partnerStore.loadError")}
        </p>
      )}

      {!isLoading && !error && <BookList books={books} variant="partner" />}
    </div>
  );
};

export default PartnerStorePage;
