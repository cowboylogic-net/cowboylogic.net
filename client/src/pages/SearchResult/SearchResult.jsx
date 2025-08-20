import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./SearchResult.module.css";
import { Link } from "react-router-dom";

const SearchResults = () => {
  const location = useLocation();
  const query = new URLSearchParams(location.search).get("q");
  const [results, setResults] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!query) return;

    fetch(`http://localhost:5000/api/search?q=${query}`)
      .then((res) => res.json())
      .then((data) => setResults(data.data))
      .catch((error) => console.error("Error fetching search results:", error));
  }, [query]);

  return (
    <div className={styles.resultsPage}>
      <h2>{t("search.resultsFor", { query })}</h2>
      {results.length > 0 ? (
        <div className={styles.grid}>
          {results.map((item) => (
            <Link to={`/bookstore/book/${item.id}`} key={item.id} className={styles.card}>
              <img src={item.imageUrl} alt={item.title} className={styles.image} />
              <h3>{item.title}</h3>
              <p>{item.author}</p>
              <p>${item.price}</p>
            </Link>
          ))}
        </div>
      ) : (
        <p>{t("search.noResults")}</p>
      )}
    </div>
  );
};

export default SearchResults;
