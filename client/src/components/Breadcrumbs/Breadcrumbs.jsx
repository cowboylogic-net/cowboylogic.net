import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import styles from "./Breadcrumbs.module.css";

// якщо у тебе вже є селектор:
import { selectBookById } from "../../store/selectors";

const uuidRe =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const titleize = (s) =>
  s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export default function Breadcrumbs({ hideOnHome = true, className }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const segments = pathname.split("/").filter(Boolean);
  const lastSeg = segments[segments.length - 1] || "";

  // Підтримка деталей книги: якщо останній сегмент — UUID, спробуємо взяти title з Redux
  const book = useSelector((s) =>
    uuidRe.test(lastSeg) ? selectBookById(s, lastSeg) : null
  );

  if (hideOnHome && segments.length === 0) return null;

  const items = [];
  items.push({ to: "/", label: t("routes.home", { defaultValue: "Home" }) });

  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    acc += `/${segments[i]}`;
    const isLast = i === segments.length - 1;

    let label;
    switch (segments[i]) {
      case "about":
        label = t("routes.about", { defaultValue: "About" });
        break;
      case "contact":
        label = t("routes.contact", { defaultValue: "Contact" });
        break;
      case "bookstore":
        label = t("routes.bookstore", { defaultValue: "Book Store" });
        break;
      case "favorites":
        label = t("routes.favorites", { defaultValue: "Favorites" });
        break;
      case "partner-store":
        label = t("routes.partnerStore", { defaultValue: "Partner Store" });
        break;
      case "cl-publishing":
        label = t("routes.clPublishing", { defaultValue: "CL Publishing" });
        break;
      case "cl-strategies":
        label = t("routes.clStrategies", { defaultValue: "CL Strategies" });
        break;
      case "search":
        label = t("routes.search", { defaultValue: "Search" });
        break;
      default:
        if (isLast && book?.title) {
          label = book.title;
        } else {
          label = titleize(decodeURIComponent(segments[i]));
        }
    }

    items.push({ to: acc, label, isLast });
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={`${styles.wrapper} ${className || ""}`}
    >
      {items.map((item, idx) => (
        <span key={item.to} className={styles.item}>
          {idx > 0 && <span className={styles.sep}>/</span>}
          {item.isLast ? (
            <span className={styles.current} aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link to={item.to} className={styles.link}>
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
