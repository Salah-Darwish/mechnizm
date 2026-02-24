import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { AnimatePresence } from "framer-motion";
import { lazy, Suspense } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./store";
import Layout from "./components/Layout";
import TopLoader from "./components/TopLoader";
import ScrollToTop from "./components/ScrollToTop";
import AuthInitializer from "./components/AuthInitializer";
import "./i18n";

// Lazy load pages for better performance
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetails"));
const About = lazy(() => import("./pages/About"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Cart = lazy(() => import("./pages/Cart"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PaymentResult = lazy(() => import("./pages/PaymentResult"));
const VerifyEmail = lazy(() => import("./pages/VerifyEmail"));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <AuthInitializer />
      <Router>
        <TopLoader />
        <ScrollToTop />
        <AnimatePresence mode="wait">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="about" element={<About />} />
                <Route path="faq" element={<FAQ />} />
                <Route path="privacy" element={<Privacy />} />
                <Route path="contact" element={<Contact />} />
                <Route path="login" element={<Login />} />
                <Route path="verify-email" element={<VerifyEmail />} />
                <Route path="cart" element={<Cart />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="payment/result" element={<PaymentResult />} />
              </Route>
            </Routes>
          </Suspense>
        </AnimatePresence>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </Router>
    </Provider>
  );
}

export default App;
