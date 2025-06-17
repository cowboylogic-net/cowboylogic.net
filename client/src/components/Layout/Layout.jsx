// src/components/Layout/Layout.jsx

import Header from "../Header/Header";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";
import Notification from "../Notification/Notification";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <>
      <Header />
      <Navbar />
      <Notification />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default Layout;
