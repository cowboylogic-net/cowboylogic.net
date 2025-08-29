// client/src/pages/SearchResults/SearchResults.jsx
import { useLocation, Link } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import styles from "./SearchResult.module.css";
import { apiService } from "../../services/axiosService";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  const { t } = useTranslation();

  const isPartner = useSelector((s) => s.auth.user?.role === "partner");
  const [results, setResults] = useState([]);

  const fmtUSD = useMemo(
    () => (n) =>
      typeof n === "number" || typeof n === "string"
        ? new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: "USD",
          }).format(Number(n))
        : null,
    []
  );

  useEffect(() => {
    if (!query) return;
    (async () => {
      try {
        // secured=true → підставить Bearer-токен
        const res = await apiService.get(
          `/search?q=${encodeURIComponent(query)}`,
          true
        );
        setResults(res.data?.data || []);
      } catch (error) {
        console.error("Error fetching search results:", error);
        setResults([]);
      }
    })();
  }, [query]);

  const getDisplayPrice = (item) => {
    const partnerP =
      item.partnerPrice ?? item.partner_price ?? item.partner_price_cents;
    const userP = item.price ?? item.price_cents;
    const p = isPartner && partnerP != null ? partnerP : userP;
    return p != null ? fmtUSD(p) : null;
  };

  return (
    <div className="layoutContainer">
      <h2>{t("search.resultsFor", { query })}</h2>
      {results.length > 0 ? (
        <div className={styles.grid}>
          {results.map((item) => {
            const priceStr = getDisplayPrice(item);
            return (
              <Link
                to={`/bookstore/book/${item.id}`}
                key={item.id}
                className={styles.card}
              >
                <img
                  src={item.imageUrl || "/images/placeholder-book.png"}
                  alt={item.title}
                  className={styles.image}
                  loading="lazy"
                />
                <h3>{item.title}</h3>
                {item.author && <p>{item.author}</p>}
                {priceStr && <p>{priceStr}</p>}
              </Link>
            );
          })}
        </div>
      ) : (
        <p>{t("search.noResults")}</p>
      )}
    </div>
  );
};

export default SearchResults;
