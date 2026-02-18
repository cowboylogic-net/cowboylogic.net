import styles from "./App.module.css";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { lazy, Suspense, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import clsx from "clsx";

import Loader from "./components/Loader/Loader";
import Layout from "./components/Layout/Layout";
import AdminLayout from "./components/Layout/AdminLayout";
import PrivateRoute from "./routes/PrivateRoute";
import PublicOnlyRoute from "./routes/PublicOnlyRoute";

const Home = lazy(() => import("./pages/Home/Home"));
const About = lazy(() => import("./pages/About/About"));
const Contact = lazy(() => import("./pages/Contact/Contact"));
const BookStore = lazy(() => import("./pages/BookStore/BookStore"));
const PartnerStorePage = lazy(
  () => import("./pages/PartnerStorePage/PartnerStorePage"),
);
const BookDetails = lazy(() => import("./pages/BookDetails/BookDetails"));
const CLStrategies = lazy(() => import("./pages/CLStrategies/CLStrategies"));
const CLPublishing = lazy(() => import("./pages/CLPublishing/CLPublishing"));
const FavoritesPage = lazy(() => import("./pages/FavoritesPage/FavoritesPage"));
const SearchResults = lazy(() => import("./pages/SearchResult/SearchResult"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const Forbidden = lazy(() => import("./pages/Forbidden/Forbidden"));
const Privacy = lazy(() => import("./pages/Privacy/Privacy"));
const Terms = lazy(() => import("./pages/Terms/Terms"));

const CowboyCollegeConsulting = lazy(
  () => import("./pages/CowboyCollegeConsulting/CowboyCollegeConsulting"),
);
const CowboyCollegeStartup = lazy(
  () => import("./pages/CowboyCollegeStartup/CowboyCollegeStartup"),
);
const CowboyCollegeLeadership = lazy(
  () => import("./pages/CowboyCollegeLeadership/CowboyCollegeLeadership"),
);

const CowboyCollegePubAuthor = lazy(
  () => import("./pages/CowboyCollegePubAuthor/CowboyCollegePubAuthor"),
);
const Books = lazy(() => import("./pages/Books/Books"));

const Register = lazy(() => import("./pages/Register/Register"));
const Login = lazy(() => import("./pages/Login/Login"));
const SuccessPage = lazy(() => import("./pages/SuccessPage/SuccessPage"));
const CancelPage = lazy(() => import("./pages/CancelPage/CancelPage"));
const VerifyEmailPage = lazy(
  () => import("./pages/VerifyEmailPage/VerifyEmailPage"),
);

const Orders = lazy(() => import("./pages/Orders/Orders"));
const Cart = lazy(() => import("./pages/Cart/Cart"));
const ProfilePage = lazy(() => import("./pages/ProfilePage/ProfilePage"));

const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const AddBook = lazy(() => import("./pages/Admin/AddBook"));
const EditBook = lazy(() => import("./pages/Admin/EditBook"));
const UserManagement = lazy(() => import("./pages/Admin/UserManagement"));
const Newsletter = lazy(() => import("./pages/Admin/Newsletter"));

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, bootstrapStatus } = useSelector((s) => s.auth);
  const sessionExpiredNonce = useSelector(
    (s) => s.auth.sessionExpiredNonce || 0,
  );
  const lastHandledRef = useRef(0);

  useEffect(() => {
    if (!sessionExpiredNonce) return;
    if (bootstrapStatus !== "done") return;
    if (user) return;
    if (lastHandledRef.current === sessionExpiredNonce) return;
    lastHandledRef.current = sessionExpiredNonce;

    if (location.pathname !== "/login") {
      navigate("/login", {
        replace: true,
        state: { reason: "session-expired" },
      });
    }
  }, [
    sessionExpiredNonce,
    bootstrapStatus,
    user,
    location.pathname,
    navigate,
  ]);
  return (
    <div className={clsx(styles.container, "app-layout")}>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />
            <Route path="bookstore" element={<BookStore />} />
            <Route
              path="partner-store"
              element={
                <PrivateRoute roles={["partner", "admin", "superAdmin"]}>
                  <PartnerStorePage />
                </PrivateRoute>
              }
            />

            <Route path="bookstore/book/:id" element={<BookDetails />} />
            <Route path="clstrategies" element={<CLStrategies />} />
            <Route
              path="clstrategies/cowboy-college-consulting"
              element={<CowboyCollegeConsulting />}
            />
            <Route
              path="clstrategies/cowboy-college-start-up"
              element={<CowboyCollegeStartup />}
            />
            <Route
              path="clstrategies/cowboy-college-leadership"
              element={<CowboyCollegeLeadership />}
            />
            <Route path="clpublishing" element={<CLPublishing />} />
            <Route
              path="clpublishing/cowboy-college-pub-author"
              element={<CowboyCollegePubAuthor />}
            />

            <Route path="clpublishing/Books" element={<Books />} />
            <Route path="search" element={<SearchResults />} />
            <Route element={<PublicOnlyRoute redirectTo="/" />}>
              <Route path="login" element={<Login />} />
            </Route>
            <Route path="register" element={<Register />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="success" element={<SuccessPage />} />
            <Route path="cancel" element={<CancelPage />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="terms" element={<Terms />} />
            <Route
              path="favorites"
              element={
                <PrivateRoute>
                  <FavoritesPage />
                </PrivateRoute>
              }
            />
            <Route
              path="orders"
              element={
                <PrivateRoute>
                  <Orders />
                </PrivateRoute>
              }
            />
            <Route path="cart" element={<Cart />} />
            <Route
              path="profile"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
          </Route>

          <Route
            path="/admin"
            element={
              <PrivateRoute roles={["admin", "superAdmin"]}>
                <AdminLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="books/new" element={<AddBook />} />
            <Route path="books/edit/:id" element={<EditBook />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="newsletter" element={<Newsletter />} />
          </Route>

          <Route path="*" element={<NotFound />} />
          <Route path="/403" element={<Forbidden />} />
        </Routes>
      </Suspense>
    </div>
  );
};

export default App;
