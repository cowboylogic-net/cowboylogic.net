import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ROLES } from "../../constants/roles";
import styles from "./BurgerNavbar.module.css";
import LanguageSwitcher from "../LanguageSwitcher/LanguageSwitcher";
import { logout } from "../../store/slices/authSlice";

const BurgerNavbar = () => {
  const [open, setOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const wrapperRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  const handleLogout = () => {
    dispatch(logout());
    setOpen(false);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setOpen(false);
        setOpenSubmenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button className="btn btn-outline" onClick={() => setOpen(!open)}>
        ☰
      </button>

      {open && (
        <nav className={styles.menu}>
          <NavLink to="/" onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/about" onClick={() => setOpen(false)}>About</NavLink>
          <NavLink to="/bookstore" onClick={() => setOpen(false)}>Bookstore</NavLink>
          <NavLink to="/favorites" onClick={() => setOpen(false)}>Favorites</NavLink>

          {/* Submenu: CL Strategies */}
          <button onClick={() => toggleSubmenu("clstrategies")}>CL Strategies ▾</button>
          {openSubmenu === "clstrategies" && (
            <div className={styles.submenu}>
              <NavLink to="/clstrategies" onClick={() => setOpen(false)}>Overview</NavLink>
              <NavLink to="/clstrategies/cowboy-college-consulting" onClick={() => setOpen(false)}>Consulting</NavLink>
              <NavLink to="/clstrategies/cowboy-college-start-up" onClick={() => setOpen(false)}>Start-up</NavLink>
              <NavLink to="/clstrategies/cowboy-college-leadership" onClick={() => setOpen(false)}>Leadership</NavLink>
            </div>
          )}

          {/* Submenu: CL Publishing */}
          <button onClick={() => toggleSubmenu("clpublishing")}>CL Publishing ▾</button>
          {openSubmenu === "clpublishing" && (
            <div className={styles.submenu}>
              <NavLink to="/clpublishing" onClick={() => setOpen(false)}>Overview</NavLink>
              <NavLink to="/clpublishing/cowboy-college-pub/author" onClick={() => setOpen(false)}>Author</NavLink>
              <NavLink to="/clpublishing/b2b-bookstores" onClick={() => setOpen(false)}>B2B Bookstores</NavLink>
            </div>
          )}

          {user && (
            <>
              <NavLink to="/profile" onClick={() => setOpen(false)}>Profile</NavLink>
              <NavLink to="/orders" onClick={() => setOpen(false)}>Orders</NavLink>
              <NavLink to="/cart" onClick={() => setOpen(false)}>Cart</NavLink>
              <button onClick={handleLogout} className="btn btn-outline">Logout</button>
            </>
          )}

          {user?.role === ROLES.ADMIN || user?.role === ROLES.SUPERADMIN ? (
            <>
              <NavLink to="/admin" onClick={() => setOpen(false)}>Dashboard</NavLink>
              <NavLink to="/admin/newsletter" onClick={() => setOpen(false)}>Newsletter</NavLink>
              <NavLink to="/admin/users" onClick={() => setOpen(false)}>Users</NavLink>
            </>
          ) : null}

          {!user && (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Login</NavLink>
              <NavLink to="/register" onClick={() => setOpen(false)}>Register</NavLink>
            </>
          )}

          <LanguageSwitcher />
        </nav>
      )}
    </div>
  );
};

export default BurgerNavbar;
