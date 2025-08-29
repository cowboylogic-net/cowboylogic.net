import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import styles from "./Navbar.module.css";
import searchIcon from "/assets/svg/search-icon.svg";
import { ROLES } from "../../constants/roles";
import { selectUser } from "../../store/selectors/authSelectors";

const buildLinkClass = ({ isActive }) =>
  clsx(styles.navLink, isActive && styles.active);

const Navbar = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const clStrategiesRef = useRef(null);
  const clPublishingRef = useRef(null);
  const navbarRef = useRef(null);
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  // const isAuth = useSelector(selectIsAuth);

  const isAdminOrSuper =
    user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN;

  const isPartnerOnly = user?.role === ROLES.PARTNER;

  const handleSearch = (event) => {
    event.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setSearchQuery("");
    setSearchVisible(false);
  };

  const toggleDropdown = (menuName, event) => {
    event.preventDefault();
    setOpenDropdown(openDropdown === menuName ? null : menuName);
  };

  const handleCloseDropdown = () => {
    setOpenDropdown(null);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!navbarRef.current?.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="layoutContainer" ref={navbarRef}>
      <div className={styles.navbar}>
        <nav className={styles.navLeft}>
          <NavLink
            to="/"
            className={buildLinkClass}
            onClick={handleCloseDropdown}
          >
            {t("navbar.home")}
          </NavLink>

          <div className={styles.dropdown} ref={clStrategiesRef}>
            <NavLink
              to="/clstrategies"
              className={clsx(styles.navLink, styles.dropdownButton)}
              onClick={(e) => toggleDropdown("clstrategies", e)}
            >
              {t("navbar.clStrategies")}
            </NavLink>
            {openDropdown === "clstrategies" && (
              <div className={styles.dropdownMenu}>
                <NavLink
                  to="/clstrategies"
                  className={styles.dropdownItem}
                  onClick={handleCloseDropdown}
                >
                  {t("navbar.clStrategiesHome")}
                </NavLink>
                <NavLink
                  to="/clstrategies/cowboy-college-consulting"
                  className={styles.dropdownItem}
                  onClick={handleCloseDropdown}
                >
                  {t("navbar.ccConsulting")}
                </NavLink>
                <NavLink
                  to="/clstrategies/cowboy-college-start-up"
                  className={styles.dropdownItem}
                  onClick={handleCloseDropdown}
                >
                  {t("navbar.ccStartup")}
                </NavLink>
                <NavLink
                  to="/clstrategies/cowboy-college-leadership"
                  className={styles.dropdownItem}
                  onClick={handleCloseDropdown}
                >
                  {t("navbar.ccLeadership")}
                </NavLink>
              </div>
            )}
          </div>

          <div className={styles.dropdown} ref={clPublishingRef}>
            <NavLink
              to="/clpublishing"
              className={clsx(styles.navLink, styles.dropdownButton)}
              onClick={(e) => toggleDropdown("clpublishing", e)}
            >
              {t("navbar.clPublishing")}
            </NavLink>
            {openDropdown === "clpublishing" && (
              <div className={styles.dropdownMenu}>
                <NavLink
                  to="/clpublishing"
                  className={styles.dropdownItem}
                  onClick={handleCloseDropdown}
                >
                  {t("navbar.clPublishingHome")}
                </NavLink>
                <NavLink
                  to="/clpublishing/cowboy-college-pub-author"
                  className={styles.dropdownItem}
                  onClick={handleCloseDropdown}
                >
                  {t("navbar.ccPubAuthor")}
                </NavLink>
                <NavLink
                  to="/clpublishing/Books"
                  className={styles.dropdownItem}
                  onClick={handleCloseDropdown}
                >
                  {t("navbar.Books")}
                </NavLink>
              </div>
            )}
          </div>

          {user?.role &&
            [ROLES.ADMIN, ROLES.SUPERADMIN].includes(user.role) && (
              <NavLink
                to="/admin"
                className={buildLinkClass}
                onClick={handleCloseDropdown}
              >
                {t("navbar.adminDashboard")}
              </NavLink>
            )}

          {isPartnerOnly ? (
            <NavLink
              to="/partner-store"
              className={buildLinkClass}
              onClick={handleCloseDropdown}
            >
              {t("navbar.partnerStore")}
            </NavLink>
          ) : (
            <>
              <NavLink
                to="/bookstore"
                className={buildLinkClass}
                onClick={handleCloseDropdown}
              >
                {t("navbar.bookStore")}
              </NavLink>
              {isAdminOrSuper && (
                <NavLink
                  to="/partner-store"
                  className={buildLinkClass}
                  onClick={handleCloseDropdown}
                >
                  {t("navbar.partnerStore")}
                </NavLink>
              )}
            </>
          )}
        </nav>

        <div className={styles.navRight}>
          {/* {isAuth && (
            <NavLink to="/profile" className={buildLinkClass}>
              👤
            </NavLink>
          )} */}
          {/* <NavLink to="/favorites" className={buildLinkClass}>
            ❤️
          </NavLink> */}

          <button
            className={styles.searchButton}
            onClick={() => setSearchVisible(!isSearchVisible)}
          >
            <img
              src={searchIcon}
              alt="Search"
              height={20}
              width={20}
              className={styles.searchIcon}
            />
          </button>

          {isSearchVisible && (
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <input
                type="text"
                placeholder={t("navbar.searchPlaceholder")}
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
