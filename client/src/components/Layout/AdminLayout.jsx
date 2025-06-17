// src/components/Layout/AdminLayout.jsx

import Header from "../Header/Header";
import Notification from "../Notification/Notification";
import { Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  return (
    <div className={styles.adminContainer}>
      <Header />
      <Notification />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;