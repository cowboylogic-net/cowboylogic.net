import Header from "../Header/Header";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import Notification from "../Notification/Notification";
import { Outlet } from "react-router-dom";
import styles from "./Layout.module.css";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavorites } from "../../store/thunks/favoritesThunks";

const Layout = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const hasFetchedFavorites = useRef(false);

  useEffect(() => {
    if (token && !hasFetchedFavorites.current) {
      dispatch(fetchFavorites());
      hasFetchedFavorites.current = true;
    }
  }, [token, dispatch]);

  return (
    <div className={styles.layout}>
      <Header />
      <Navbar />
      <Notification />
      <main className={styles.main}>
        <div className="layoutContainer">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};
export default Layout;
