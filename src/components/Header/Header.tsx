import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  User,
  Globe,
  LogOut,
  UserCircle,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import logo from "../../assets/images/logo.png";
// import MarqueeBanner from "../MarqueeBanner";
import { logoutUser } from "../../services/authService";

const Header = () => {
  const { i18n, t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentLang = i18n.language;
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Get auth state
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  // Dropdown state
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if on login page
  const isLoginPage = location.pathname === "/login";

  const toggleLanguage = () => {
    const newLang = currentLang === "ar" ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // Ignore logout API errors - still logout locally
    }
    dispatch(logout());
    setShowDropdown(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    setShowDropdown(false);
    navigate("/dashboard");
  };

  const handlePayoutsClick = () => {
    setShowDropdown(false);
    navigate("/dashboard?tab=payouts");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* <MarqueeBanner /> */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-[#E2E1DD]  shadow-sm "
      >
        <div className="w-[95%] mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center shrink-0">
              <Link to="/" className="flex items-center">
                <img
                  src={logo}
                  alt="MeKanizm Logo"
                  className="w-50 sm:w-55 md:w-60 lg:w-[90%] h-auto object-contain"
                />
              </Link>
            </div>

            {/* Icons */}
            <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
              {/* User/Login with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                {isAuthenticated ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowDropdown(!showDropdown)}
                      className={`flex items-center gap-2 transition-all rounded-full ${
                        isLoginPage
                          ? "text-white hover:text-primary  p-2"
                          : "text-white hover:text-primary "
                      }`}
                      title={user?.name || user?.email}
                    >
                      <User
                        className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          !isLoginPage ? "fill-white" : ""
                        }`}
                      />
                      <ChevronDown className="w-4 h-4" />
                    </motion.button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50"
                        >
                          {/* User Info */}
                          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                            <p className="text-sm font-bold text-gray-800 truncate">
                              {user?.name || "User"}
                            </p>
                            <p className="text-xs text-gray-600 truncate">
                              {user?.email}
                            </p>
                          </div>

                          {/* Menu Items */}
                          <button
                            onClick={handleProfileClick}
                            className="w-full px-4 py-3 text-right flex items-center gap-3 hover:bg-gray-50 transition-all"
                          >
                            <UserCircle className="w-5 h-5 text-[#3a4b95]" />
                            <span className="font-semibold text-gray-800">
                              {t("common.profile")}
                            </span>
                          </button>

                          {/* Investment Payouts - Admin Only */}
                          {user?.role === "ADMIN" && (
                            <button
                              onClick={handlePayoutsClick}
                              className="w-full px-4 py-3 text-right flex items-center gap-3 hover:bg-amber-50 transition-all border-t border-gray-100"
                            >
                              <DollarSign className="w-5 h-5 text-amber-600" />
                              <span className="font-semibold text-amber-700">
                                {t("dashboard.tabs.payouts")}
                              </span>
                            </button>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full px-4 py-3 text-right flex items-center gap-3 hover:bg-red-50 transition-all border-t border-gray-100"
                          >
                            <LogOut className="w-5 h-5 text-red-600" />
                            <span className="font-semibold text-red-600">
                              {t("common.logout")}
                            </span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                ) : (
                  <Link to="/login">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="transition-all rounded-full text-blue-900 hover:text-primary"
                      title={t("common.login")}
                    >
                      <User className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.div>
                  </Link>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative text-blue-900 hover:text-primary transition-all"
                >
                  <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </motion.div>
              </Link>

              {/* Language Toggle */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleLanguage}
                className="flex items-center gap-1 sm:gap-2 text-blue-900 hover:text-primary transition-all"
                title={currentLang === "ar" ? "English" : "العربية"}
              >
                <Globe className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm font-bold hidden sm:inline">
                  {currentLang === "ar" ? "EN" : "ع"}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default Header;
