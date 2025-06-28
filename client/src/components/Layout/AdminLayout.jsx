// src/components/Layout/AdminLayout.jsx

import Header from "../Header/Header";
import Navbar from "../Navbar/Navbar"; // 👈 Додаємо Navbar
import Notification from "../Notification/Notification";
import { Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
  return (
    <div className={styles.adminLayout}>
      <Header />
      <Navbar /> {/* 👈 Вставляємо сюди */}
      <Notification />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
