import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { ShoppingCart, Eye, CreditCard, Star, Heart } from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { getPublicProducts, toggleProductFavorite, type PublicProduct } from "../../services/productService";
import SEO from "../../components/SEO";
import { pageSEO } from "../../types/seo";
import test1 from "../../assets/images/test1.png";
import type { InstallmentTier } from "../../types/product";

// Currency SVG Component
const CurrencyIcon = ({
  color = "black",
  size = 28,
}: {
  color?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 35 35"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.0415 24.7917H18.9582V27.7084H16.0415V24.7917ZM20.4165 24.7917H23.3332V27.7084H20.4165V24.7917ZM13.1248 5.83337H16.0415V21.875C16.0415 23.4221 15.4269 24.9059 14.333 25.9998C13.239 27.0938 11.7553 27.7084 10.2082 27.7084H7.2915C6.13118 27.7084 5.01838 27.2474 4.19791 26.427C3.37744 25.6065 2.9165 24.4937 2.9165 23.3334V17.5H5.83317V23.3334C5.83317 23.7201 5.98682 24.0911 6.26031 24.3646C6.5338 24.6381 6.90473 24.7917 7.2915 24.7917H10.2082C11.8269 24.7917 13.1248 23.4938 13.1248 21.875V5.83337ZM17.4998 5.83337H20.4165V18.9584H24.7915V11.6667H27.7082V18.9584C27.7082 20.5771 26.4103 21.875 24.7915 21.875H20.4165C18.7978 21.875 17.4998 20.5771 17.4998 18.9584V5.83337ZM29.1665 14.5834H32.0832V24.7917C32.0832 25.952 31.6222 27.0648 30.8018 27.8853C29.9813 28.7058 28.8685 29.1667 27.7082 29.1667H24.7915V26.25H27.7082C28.0949 26.25 28.4659 26.0964 28.7394 25.8229C29.0129 25.5494 29.1665 25.1785 29.1665 24.7917V14.5834Z"
      fill={color}
    />
  </svg>
);

const Products = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const navigate = useNavigate();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("");

  // State for API data
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State for favorites
  const [favoritedProducts, setFavoritedProducts] = useState<Set<number>>(new Set());

  // State for login modal
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getPublicProducts({
          per_page: 10,
          page: currentPage,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        });
        setProducts(response.data);
        setTotalPages(response.meta.last_page);

        // Initialize favorited products from API response
        const favorited = new Set<number>();
        response.data.forEach(product => {
          if (product.is_favorited) {
            favorited.add(product.id);
          }
        });
        setFavoritedProducts(favorited);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(isRTL ? "فشل في تحميل المنتجات" : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, selectedCategory, isRTL]);

  // Filter and sort products (already sorted by API, apply local sort if needed)
  const availableProducts = useMemo(() => {
    let filtered = [...products];

    // Sort products
    if (sortBy === "price-low") {
      filtered = filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      filtered = filtered.sort((a, b) => b.price - a.price);
    }
    // Default sorting (featured first, then displayOrder) is handled by API

    return filtered;
  }, [products, sortBy]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "price-low" || value === "price-high") {
      setSortBy(value);
    } else {
      setSelectedCategory(value === "" ? "all" : value);
      setCurrentPage(1); // Reset to first page on category change
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    // Check authentication first
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    // Optimistic update: Toggle immediately
    const isCurrentlyFavorited = favoritedProducts.has(productId);

    setFavoritedProducts(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyFavorited) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });

    try {
      const response = await toggleProductFavorite(productId);

      // Sync with server response
      setFavoritedProducts(prev => {
        const newSet = new Set(prev);
        if (response.data.is_favorited) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });

      if (response.data.is_favorited) {
        toast.success(isRTL ? "تمت الإضافة للمفضلة" : "Added to favorites", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        toast.success(isRTL ? "تمت الإزالة من المفضلة" : "Removed from favorites", {
          position: "top-right",
          autoClose: 2000,
        });
      }
    } catch {
      // Revert on error
      setFavoritedProducts(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyFavorited) {
          newSet.add(productId);
        } else {
          newSet.delete(productId);
        }
        return newSet;
      });

      toast.error(isRTL ? "حدث خطأ" : "Something went wrong", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  };

  // Calculate installment price
  const getInstallmentPrice = (basePrice: number, tier: InstallmentTier) => {
    return basePrice * (1 + tier.percentage / 100);
  };

  // Get the lowest installment option for display
  const getLowestInstallment = (product: PublicProduct) => {
    if (!product.allowInstallment || !product.installmentOptions?.length)
      return null;
    return product.installmentOptions.reduce(
      (min, tier) => (tier.months < min.months ? tier : min),
      product.installmentOptions[0]
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#3a4b95] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-[#3a4b95] text-white rounded-lg font-bold hover:bg-[#2a3a75]"
          >
            {isRTL ? "إعادة المحاولة" : "Try Again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={pageSEO.products.title}
        description={pageSEO.products.description}
        keywords={pageSEO.products.keywords}
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto px-4 py-12 w-[95%]"
      >
        {/* Cover Image with Animation - REMOVED */}
        
        {/* Header with Title and Filter - Animated */}
        <motion.div
          className="flex justify-between items-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          {/* Title - Right Side */}
          <motion.h1
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="text-4xl font-bold text-[#3a4b95]"
          >
            {t("products.title")}
          </motion.h1>

          {/* Filter Dropdown - Left Side */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <select
              onChange={handleCategoryChange}
              value={sortBy || selectedCategory}
              className="px-6 py-3 rounded-lg border-2 border-gray-200 text-[#3a4b95] font-semibold bg-white cursor-pointer hover:border-[#c4886a] transition-all appearance-none pr-12"
            >
              <option value="">{t("products.filter.label")}</option>
              <option value="meat">{t("products.filter.meat")}</option>
              <option value="chicken">{t("products.filter.chicken")}</option>
              <option value="fish">{t("products.filter.fish")}</option>
              <option value="price-low">{t("products.filter.priceLow")}</option>
              <option value="price-high">
                {t("products.filter.priceHigh")}
              </option>
            </select>
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="#c4886a"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Products Grid - Flip Card Animation */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          {availableProducts.map((product, index) => {
            const lowestInstallment = getLowestInstallment(product);
            const monthlyPrice = lowestInstallment
              ? getInstallmentPrice(product.price, lowestInstallment)
              : null;
            const isFlipped = flippedCards.includes(product.id);
            const isFavorited = favoritedProducts.has(product.id);

            return (
              <motion.div
                key={`${product.id}-${index}`}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.4,
                  delay: 0.7 + index * 0.1,
                  ease: "easeOut",
                }}
                className="perspective-1000"
                onMouseEnter={() =>
                  setFlippedCards((prev) => [...prev, product.id])
                }
                onMouseLeave={() =>
                  setFlippedCards((prev) =>
                    prev.filter((id) => id !== product.id)
                  )
                }
              >
                {/* Flip Card Container */}
                <div
                  className="relative w-full h-[420px] transition-transform duration-700"
                  style={{
                    transformStyle: "preserve-3d",
                    transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  {/* Front Side */}
                  <div
                    className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 cursor-pointer"
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    {/* Badges */}
                    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-none">
                      {product.isFeatured && (
                        <span className="bg-[#c4886a] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {isRTL ? "مميز" : "Featured"}
                        </span>
                      )}
                      {product.allowInstallment && (
                        <span className="bg-[#3a4b95] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {isRTL ? "تقسيط" : "Installment"}
                        </span>
                      )}
                    </div>

                    {/* Favorite Button */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleFavorite(product.id, e);
                      }}
                      className={`absolute top-3 right-3 z-50 p-2 rounded-full transition-all pointer-events-auto ${isFavorited
                        ? "bg-[#c4886a] text-white"
                        : "bg-white/90 text-gray-400 hover:text-[#c4886a]"
                        } shadow-md backdrop-blur-sm`}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isFavorited ? "favorited" : "not-favorited"}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Heart
                            className="w-5 h-5"
                            fill={isFavorited ? "currentColor" : "none"}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </motion.button>

                    {/* Product Image */}
                    <div className="h-48 flex items-center justify-center bg-gray-50 p-4">
                      <img
                        src={product.image || test1}
                        alt={isRTL ? product.nameAr : product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-bold text-gray-800">
                          {isRTL ? product.nameAr : product.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-bold text-gray-800">
                            {product.price}
                          </span>
                          <CurrencyIcon size={24} />
                        </div>
                      </div>

                      {/* Installment price hint */}
                      {monthlyPrice && lowestInstallment && (
                        <p className="text-xs text-[#3a4b95] mb-3">
                          {isRTL
                            ? `عائد متوقع ${Math.round(monthlyPrice)} ريال بعد ${lowestInstallment.months} شهور (+${lowestInstallment.percentage}%)`
                            : `Expected return ${Math.round(monthlyPrice)} SAR after ${lowestInstallment.months} months (+${lowestInstallment.percentage}%)`}
                        </p>
                      )}

                      {/* Stock Indicator */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-semibold text-[#3a4b95]">
                            {product.stock > 0
                              ? isRTL
                                ? `متوفر`
                                : `Available`
                              : isRTL
                                ? "غير متوفر"
                                : "Out of Stock"}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${product.stock_status === 'high'
                            ? 'bg-green-100 text-green-700'
                            : product.stock_status === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : product.stock_status === 'low'
                                ? 'bg-[#e5d4c8] text-[#8a5a3a]'
                                : 'bg-red-100 text-red-700'
                            }`}>
                            {product.stock_status === 'high'
                              ? (isRTL ? 'متوفر' : 'In Stock')
                              : product.stock_status === 'medium'
                                ? (isRTL ? 'متاح' : 'Available')
                                : product.stock_status === 'low'
                                  ? (isRTL ? 'كمية محدودة' : 'Limited')
                                  : (isRTL ? 'نفذ' : 'Out')}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                          <motion.div
                            className={`h-2 rounded-full ${product.stock_status === 'high'
                              ? "bg-green-500"
                              : product.stock_status === 'medium'
                                ? "bg-yellow-500"
                                : product.stock_status === 'low'
                                  ? "bg-[#c4886a]"
                                  : "bg-red-500"
                              }`}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${product.stock_percentage}%`,
                            }}
                            transition={{
                              duration: 1,
                              delay: 0.8 + index * 0.1,
                            }}
                          />
                        </div>
                      </div>

                      {/* Flip Hint */}
                      <div className="text-center">
                        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                          <Eye className="w-3 h-3" />
                          {isRTL ? "مرر للمزيد" : "Hover for more"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Back Side */}
                  <div
                    className="absolute inset-0 w-full h-full bg-linear-to-br from-[#3a4b95] to-[#2a3a75] rounded-2xl shadow-lg overflow-hidden flex flex-col items-center justify-center p-6 cursor-pointer"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {/* Badges on back */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2 pointer-events-none">
                      {product.isFeatured && (
                        <span className="bg-[#c4886a] text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          {isRTL ? "مميز" : "Featured"}
                        </span>
                      )}
                      {product.allowInstallment && (
                        <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                          <CreditCard className="w-3 h-3" />
                          {isRTL ? "تقسيط" : "Installment"}
                        </span>
                      )}
                    </div>

                    {/* Favorite Button on back */}
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleToggleFavorite(product.id, e);
                      }}
                      className={`absolute top-3 right-3 z-50 p-2 rounded-full transition-all pointer-events-auto ${isFavorited
                        ? "bg-[#c4886a] text-white"
                        : "bg-white/20 text-white hover:bg-white/30"
                        } shadow-md backdrop-blur-sm`}
                    >
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={isFavorited ? "favorited" : "not-favorited"}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                        >
                          <Heart
                            className="w-5 h-5"
                            fill={isFavorited ? "currentColor" : "none"}
                          />
                        </motion.div>
                      </AnimatePresence>
                    </motion.button>

                    {/* Product Name */}
                    <h3 className="text-2xl font-bold text-white mb-3 text-center">
                      {isRTL ? product.nameAr : product.name}
                    </h3>

                    {/* Description */}
                    <p className="text-white/90 text-center text-sm mb-4 leading-relaxed">
                      {isRTL ? product.descriptionAr : product.description}
                    </p>

                    {/* Price Box */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4 w-full">
                      <div className="flex items-center justify-center gap-2 text-white">
                        <span className="text-3xl font-bold">
                          {product.price}
                        </span>
                        <CurrencyIcon color="white" size={30} />
                      </div>
                      {monthlyPrice && lowestInstallment && (
                        <p className="text-white/80 text-center text-xs mt-2">
                          {isRTL
                            ? `عائد متوقع ${Math.round(monthlyPrice)} ريال خلال ${lowestInstallment.months} شهور (ربح +${Math.round(monthlyPrice - product.price)} ريال)`
                            : `Expected return ${Math.round(monthlyPrice)} SAR in ${lowestInstallment.months} months (profit +${Math.round(monthlyPrice - product.price)} SAR)`}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 w-full pointer-events-auto">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navigate(`/products/${product.id}`);
                        }}
                        className="flex items-center justify-center gap-2 bg-[#c4886a] text-white px-5 py-3 rounded-full font-bold shadow-lg hover:bg-[#b47858] transition-all"
                      >
                        <Eye className="w-5 h-5" />
                        {isRTL ? "إتمام الصفقة" : "Complete Deal"}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex justify-center items-center gap-4 mt-12"
          >
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#3a4b95] text-white hover:bg-[#2a3a75]"
                }`}
            >
              {isRTL ? "السابق" : "Previous"}
            </button>

            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all ${currentPage === page
                    ? "bg-[#c4886a] text-white"
                    : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                >
                  {page}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-[#3a4b95] text-white hover:bg-[#2a3a75]"
                }`}
            >
              {isRTL ? "التالي" : "Next"}
            </button>
          </motion.div>
        )}

        {/* Empty state */}
        {availableProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">
              {isRTL ? "لا توجد منتجات متاحة" : "No products available"}
            </p>
          </div>
        )}
      </motion.div>

      {/* Login Required Modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowLoginModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-20 h-20 bg-gradient-to-br from-[#c4886a] to-[#b47858] rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <ShoppingCart className="w-10 h-10 text-white" />
                </motion.div>

                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                  {isRTL ? "تسجيل الدخول مطلوب" : "Login Required"}
                </h3>
                <p className="text-gray-600 mb-8">
                  {isRTL
                    ? "يجب تسجيل الدخول أولاً لإضافة المنتجات إلى السلة"
                    : "Please login first to add products to your cart"}
                </p>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLoginModal(false)}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
                  >
                    {isRTL ? "إلغاء" : "Cancel"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/login")}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-[#c4886a] to-[#b47858] text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    {isRTL ? "تسجيل الدخول" : "Login"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Products;
