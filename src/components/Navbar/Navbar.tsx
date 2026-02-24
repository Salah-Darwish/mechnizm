import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  // Search,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  // const [searchQuery, setSearchQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isRTL = i18n.language === "ar";



  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Disable body scroll
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    // Cleanup function
    return () => {
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const navLinks = [
    { key: "home", path: "/" },
    { key: "products", path: "/products" },
    { key: "about", path: "/about" },
    { key: "faq", path: "/faq" },
    { key: "privacy", path: "/privacy" },
    { key: "contact", path: "/contact" },
  ];

  // const handleSearch = (e: React.FormEvent) => {
  //   e.preventDefault();
  //   console.log("Searching for:", searchQuery);
  //   // Implement search logic
  // };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-[#3a4b95] text-white shadow-md "
      >
        <div className="w-[95%] mx-auto px-4">
          <div className="flex items-center justify-between py-4 gap-6">
            {/* Search Bar - Hidden on mobile */}
            {/* <form onSubmit={handleSearch} className="hidden md:flex shrink-0">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("nav.search")}
                  className="bg-white text-gray-800 rounded-full px-6 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-secondary transition-all w-64"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-secondary text-white rounded-full p-2 hover:bg-opacity-90 transition-all"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form> */}

            {/* Navigation Links - Hidden on mobile */}
            <div className="hidden lg:flex items-center gap-8 flex-wrap justify-center flex-1">
              {navLinks.map((link, index) => {
                const isActive = location.pathname === link.path;
                return (
                  <motion.div
                    key={link.key}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      to={link.path}
                      className={`relative font-medium text-base transition-colors hover:text-secondary group ${
                        isActive ? "text-secondary" : "text-white"
                      }`}
                    >
                      {t(`nav.${link.key}`)}
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Burger Menu Button - Visible on mobile/tablet */}
            <motion.button
              onClick={toggleMenu}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden text-white hover:text-secondary transition-colors p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={closeMenu}
            />

            {/* Slide-in Menu */}
            <motion.div
              initial={{ x: isRTL ? "-100%" : "100%" }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? "-100%" : "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`fixed top-0 h-full w-80 max-w-[85vw] bg-primary text-white shadow-2xl z-50 lg:hidden overflow-y-auto ${
                isRTL ? "left-0" : "right-0"
              }`}
            >
              <div className="flex flex-col h-full">
                {/* Menu Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/20">
                  <h2 className="text-xl font-bold text-white">Menu</h2>
                  <motion.button
                    onClick={closeMenu}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-white hover:text-secondary transition-colors p-2"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                {/* Search Bar in Mobile Menu */}
                {/* <div className="p-6 border-b border-white/20">
                  <form onSubmit={handleSearch}>
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("nav.search")}
                        className="bg-white text-gray-800 rounded-full px-6 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-secondary transition-all w-full"
                      />
                      <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-secondary text-white rounded-full p-2 hover:bg-opacity-90 transition-all"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </div> */}

                {/* Navigation Links in Mobile Menu */}
                <div className="flex flex-col p-6 flex-1">
                  {navLinks.map((link, index) => {
                    const isActive = location.pathname === link.path;
                    return (
                      <motion.div
                        key={link.key}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        onClick={closeMenu}
                      >
                        <Link
                          to={link.path}
                          className={`block py-4 px-4 rounded-lg font-medium text-base transition-all mb-2 ${
                            isActive
                              ? "bg-secondary text-white shadow-lg"
                              : "text-white hover:bg-white/10 hover:text-secondary"
                          }`}
                        >
                          {t(`nav.${link.key}`)}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
