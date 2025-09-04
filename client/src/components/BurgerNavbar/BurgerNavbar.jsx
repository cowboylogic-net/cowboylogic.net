import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ROLES } from "../../constants/roles";
import styles from "./BurgerNavbar.module.css";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { logoutUser } from "../../store/thunks/authThunks";
import BaseButton from "../BaseButton/BaseButton";

const BurgerNavbar = () => {
  const [open, setOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const wrapperRef = useRef(null);

  const user = useSelector((state) => state.auth.user);
  const role = user?.role;

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    setOpen(false);
    navigate("/");
  };

  const isAdminOrSuper = role === ROLES.ADMIN || role === ROLES.SUPERADMIN;
  const isPartner = role === ROLES.PARTNER;
  const isUser = role === ROLES.USER;

  // Магазини за ролями
  const showUserStore = isUser || isAdminOrSuper; // User + Admin/Super
  const showPartnerStore = isPartner || isAdminOrSuper; // Partner + Admin/Super

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setOpenSubmenu(null);
      }
    };
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setOpenSubmenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <BaseButton
        variant="outline"
        size="small"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        ☰
      </BaseButton>

      {open && (
        <>
          {/* бекдроп для кліку поза меню */}
          <div
            className={styles.backdrop}
            onClick={() => {
              setOpen(false);
              setOpenSubmenu(null);
            }}
          />

          <nav
            className={styles.menu}
            role="menu"
            aria-label="Mobile navigation"
          >
            <NavLink to="/" onClick={() => setOpen(false)}>
              Home
            </NavLink>
            <NavLink to="/about" onClick={() => setOpen(false)}>
              About
            </NavLink>

            {/* Cart доступний завжди */}
            <NavLink to="/cart" onClick={() => setOpen(false)}>
              Cart
            </NavLink>

            {/* Favorites — тільки для залогінених */}
            {user && (
              <NavLink to="/favorites" onClick={() => setOpen(false)}>
                Favorites
              </NavLink>
            )}

            <button
              type="button"
              onClick={() => toggleSubmenu("clstrategies")}
              aria-expanded={openSubmenu === "clstrategies"}
              aria-controls="submenu-clstrategies"
            >
              CL Strategies ▾
            </button>
            {openSubmenu === "clstrategies" && (
              <div id="submenu-clstrategies" className={styles.submenu}>
                <NavLink to="/clstrategies" onClick={() => setOpen(false)}>
                  Overview
                </NavLink>
                <NavLink
                  to="/clstrategies/cowboy-college-consulting"
                  onClick={() => setOpen(false)}
                >
                  Consulting
                </NavLink>
                <NavLink
                  to="/clstrategies/cowboy-college-start-up"
                  onClick={() => setOpen(false)}
                >
                  Start-up
                </NavLink>
                <NavLink
                  to="/clstrategies/cowboy-college-leadership"
                  onClick={() => setOpen(false)}
                >
                  Leadership
                </NavLink>
              </div>
            )}

            <button
              type="button"
              onClick={() => toggleSubmenu("clpublishing")}
              aria-expanded={openSubmenu === "clpublishing"}
              aria-controls="submenu-clpublishing"
            >
              CL Publishing ▾
            </button>
            {openSubmenu === "clpublishing" && (
              <div id="submenu-clpublishing" className={styles.submenu}>
                <NavLink to="/clpublishing" onClick={() => setOpen(false)}>
                  Overview
                </NavLink>
                <NavLink
                  to="/clpublishing/cowboy-college-pub-author"
                  onClick={() => setOpen(false)}
                >
                  Author
                </NavLink>
                <NavLink
                  to="/clpublishing/books"
                  onClick={() => setOpen(false)}
                >
                  Books
                </NavLink>
              </div>
            )}

            {user ? (
              <>
                <NavLink to="/profile" onClick={() => setOpen(false)}>
                  Profile
                </NavLink>
                <NavLink to="/orders" onClick={() => setOpen(false)}>
                  Orders
                </NavLink>

                {/* Магазини за ролями */}
                {showUserStore && (
                  <NavLink to="/bookstore" onClick={() => setOpen(false)}>
                    Bookstore
                  </NavLink>
                )}
                {showPartnerStore && (
                  <NavLink to="/partner-store" onClick={() => setOpen(false)}>
                    Partner Store
                  </NavLink>
                )}

                {/* Адмін-секція */}
                {isAdminOrSuper && (
                  <>
                    <NavLink to="/admin" onClick={() => setOpen(false)}>
                      Dashboard
                    </NavLink>
                    <NavLink
                      to="/admin/newsletter"
                      onClick={() => setOpen(false)}
                    >
                      Newsletter
                    </NavLink>
                    <NavLink to="/admin/users" onClick={() => setOpen(false)}>
                      Users
                    </NavLink>
                  </>
                )}

                <BaseButton
                  variant="outline"
                  size="small"
                  onClick={handleLogout}
                >
                  Logout
                </BaseButton>
              </>
            ) : (
              <>
                {/* Гість бачить Bookstore */}
                <NavLink to="/bookstore" onClick={() => setOpen(false)}>
                  Bookstore
                </NavLink>
                <NavLink to="/login" onClick={() => setOpen(false)}>
                  Login
                </NavLink>
                <NavLink to="/register" onClick={() => setOpen(false)}>
                  Register
                </NavLink>
              </>
            )}

            <LanguageSwitcher />
          </nav>
        </>
      )}
    </div>
  );
};

export default BurgerNavbar;
