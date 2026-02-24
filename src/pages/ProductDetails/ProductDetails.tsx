import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  Check,
  ArrowLeft,
  ArrowRight,
  Star,
  CreditCard,
  Banknote,
  Package,
  Truck,
  Shield,
  Clock,
  Heart,
  Share2,
  Minus,
  Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { addToCartAsync } from "../../store/slices/cartSlice";
import { getPublicProduct, getPublicProducts, toggleProductFavorite, type PublicProduct } from "../../services/productService";
import type { InstallmentTier } from "../../types/product";
import SEO from "../../components/SEO";
import test1 from "../../assets/images/test1.png";

const ProductDetails = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isRTL = i18n.language === "ar";
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  // State for API data
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<PublicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quantity, setQuantity] = useState(1);
  const [quantityInput, setQuantityInput] = useState("1");
  const [selectedInstallment, setSelectedInstallment] =
    useState<InstallmentTier | null>(null);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const response = await getPublicProduct(Number(id));
        setProduct(response.data);
        // Initialize favorite status from API response
        setIsWishlisted(response.data.is_favorited ?? false);

        // Fetch related products (same category)
        if (response.data.category) {
          const relatedResponse = await getPublicProducts({
            category: response.data.category,
            per_page: 5,
          });
          // Filter out current product
          setRelatedProducts(
            relatedResponse.data.filter((p) => p.id !== Number(id)).slice(0, 4)
          );
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(isRTL ? "فشل في تحميل المنتج" : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, isRTL]);

  // Calculate prices
  const baseTotal = product ? product.price * quantity : 0;
  const installmentTotal = selectedInstallment
    ? baseTotal * (1 + selectedInstallment.percentage / 100)
    : baseTotal;

  const handleAddToCart = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    const productName = isRTL ? product.nameAr : product.name;

    try {
      await dispatch(addToCartAsync({ productId: product.id, quantity })).unwrap();
      setIsAddedToCart(true);
      toast.success(t("products.addedToCart", { name: productName }), {
        position: isRTL ? "top-left" : "top-right",
        autoClose: 2000,
      });

      setTimeout(() => {
        setIsAddedToCart(false);
      }, 2000);
    } catch (error) {
      toast.error(String(error));
    }
  };

  const handleShare = async () => {
    if (!product) return;

    const shareData = {
      title: isRTL ? product.nameAr : product.name,
      text: isRTL ? product.descriptionAr : product.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(t("productDetails.linkCopied"));
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    setIsFavoriteLoading(true);
    try {
      const response = await toggleProductFavorite(product.id);
      setIsWishlisted(response.data.is_favorited);

      if (response.data.is_favorited) {
        toast.success(isRTL ? "تمت الإضافة للمفضلة" : "Added to favorites");
      } else {
        toast.success(isRTL ? "تمت الإزالة من المفضلة" : "Removed from favorites");
      }
    } catch {
      toast.error(isRTL ? "حدث خطأ" : "Something went wrong");
    } finally {
      setIsFavoriteLoading(false);
    }
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
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-[#c4886a] text-white rounded-lg font-bold"
          >
            {t("productDetails.backToProducts")}
          </motion.button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            {t("productDetails.productNotFound")}
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/products")}
            className="px-6 py-3 bg-[#c4886a] text-white rounded-lg font-bold"
          >
            {t("productDetails.backToProducts")}
          </motion.button>
        </div>
      </div>
    );
  }

  // Build product images array from API response
  const productImages: string[] = [];

  // Add main image first
  if (product.main_image_base64) {
    productImages.push(product.main_image_base64);
  } else if (product.image) {
    productImages.push(product.image);
  } else {
    // Fallback to test image if no main image
    productImages.push(test1);
  }

  // Add sub-images from the images array
  if (product.images && product.images.length > 0) {
    product.images.forEach((img) => {
      // Prefer base64 for better performance, fallback to URL
      if (img.base64) {
        productImages.push(img.base64);
      } else if (img.url) {
        productImages.push(img.url);
      }
    });
  }

  // If no images at all, ensure we have at least one fallback
  if (productImages.length === 0) {
    productImages.push(test1);
  }

  return (
    <>
      <SEO
        title={isRTL ? product.nameAr : product.name}
        description={isRTL ? product.descriptionAr : product.description}
        keywords={`${product.name}, ${product.category}, makanizm`}
      />

      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-sm text-gray-600 mb-6"
          >
            <button
              onClick={() => navigate("/")}
              className="hover:text-[#3a4b95] transition-colors"
            >
              {t("nav.home")}
            </button>
            <span>/</span>
            <button
              onClick={() => navigate("/products")}
              className="hover:text-[#3a4b95] transition-colors"
            >
              {t("nav.products")}
            </button>
            <span>/</span>
            <span className="text-[#3a4b95] font-semibold">
              {isRTL ? product.nameAr : product.name}
            </span>
          </motion.div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* Left Side - Images */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Main Image */}
              <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden aspect-square">
                {/* Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                  {product.isFeatured && (
                    <span className="bg-[#c4886a] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                      <Star className="w-3 h-3" />
                      {t("productDetails.featured")}
                    </span>
                  )}
                  {product.allowInstallment && (
                    <span className="bg-[#3a4b95] text-white text-xs px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                      <CreditCard className="w-3 h-3" />
                      {t("productDetails.installmentAvailable")}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleToggleFavorite}
                    disabled={isFavoriteLoading}
                    className={`p-2.5 rounded-full shadow-md transition-all ${isWishlisted
                      ? "bg-red-500 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                      } ${isFavoriteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <Heart
                      className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
                    />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleShare}
                    className="p-2.5 bg-white text-gray-600 rounded-full shadow-md hover:bg-gray-100 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                </div>

                {/* Image */}
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={productImages[activeImageIndex]}
                    alt={isRTL ? product.nameAr : product.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-contain p-8"
                  />
                </AnimatePresence>
              </div>

              {/* Thumbnail Gallery */}
              <div className="flex gap-3 justify-center">
                {productImages.map((img, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImageIndex(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${activeImageIndex === index
                      ? "border-[#3a4b95] shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-contain p-2"
                    />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Right Side - Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              {/* Category */}
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
                {product.category === "meat" &&
                  t("productDetails.categories.meat")}
                {product.category === "chicken" &&
                  t("productDetails.categories.chicken")}
                {product.category === "fish" &&
                  t("productDetails.categories.fish")}
                {product.category === "other" &&
                  t("productDetails.categories.other")}
              </span>

              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
                {isRTL ? product.nameAr : product.name}
              </h1>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-[#3a4b95]">
                    {baseTotal}
                  </span>
                  <span className="text-xl text-gray-500">
                    {t("common.currency")}
                  </span>
                </div>
                {selectedInstallment && (
                  <div className="space-y-1">
                    <p className="text-[#c4886a] font-semibold">
                      {isRTL ? 'الربح المتوقع: ' : 'Expected Profit: '}
                      {Math.round(installmentTotal - baseTotal)} {t("common.currency")}
                    </p>
                    <p className="text-gray-600 text-sm">
                      ({selectedInstallment.months} {t("productDetails.months")} - {selectedInstallment.percentage}%)
                    </p>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed text-lg">
                {isRTL ? product.descriptionAr : product.description}
              </p>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${product.stock > 10
                    ? "bg-green-500"
                    : product.stock > 0
                      ? "bg-yellow-500"
                      : "bg-red-500"
                    }`}
                />
                <span
                  className={`font-semibold ${product.stock > 10
                    ? "text-green-600"
                    : product.stock > 0
                      ? "text-yellow-600"
                      : "text-red-600"
                    }`}
                >
                  {product.stock > 10
                    ? `${t("productDetails.inStock")} (${product.stock} ${t("productDetails.items")})`
                    : product.stock > 0
                      ? `${t("productDetails.limitedStock")} (${product.stock} ${t("productDetails.items")})`
                      : t("productDetails.outOfStock")}
                </span>
              </div>

              {/* Payment Options */}
              <div className="bg-white rounded-xl p-5 shadow-md space-y-4">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#3a4b95]" />
                  {t("productDetails.paymentOptions")}
                </h3>
                <div className="flex flex-wrap gap-3">
                  {/* Wallet Option */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedInstallment(null)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${!selectedInstallment
                      ? "bg-[#3a4b95] text-white shadow-md"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                  >
                    <Banknote className="w-5 h-5" />
                    {t("productDetails.wallet")}
                  </motion.button>

                  {/* Installment Options */}
                  {product.allowInstallment && product.installmentOptions.map((tier) => (
                    <motion.button
                      key={tier.months}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedInstallment(tier)}
                      className={`flex flex-col items-center px-4 py-3 rounded-lg font-semibold transition-all ${selectedInstallment?.months === tier.months
                        ? "bg-[#c4886a] text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      <span className="flex items-center gap-1">
                        <CreditCard className="w-4 h-4" />
                        {tier.months} {t("productDetails.months")}
                      </span>
                      <span className="text-xs opacity-80">
                        +{tier.percentage}%
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4">
                <span className="font-semibold text-gray-700">
                  {t("productDetails.quantity")}
                </span>
                <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (!isAuthenticated) {
                        setShowLoginModal(true);
                        return;
                      }
                      setQuantity((q) => {
                        const newVal = Math.max(1, q - 1);
                        setQuantityInput(String(newVal));
                        return newVal;
                      });
                    }}
                    className="w-8 h-8 bg-white rounded-md flex items-center justify-center hover:bg-gray-200 transition-all"
                  >
                    <Minus className="w-4 h-4" />
                  </motion.button>
                  <input
                    type="number"
                    min={1}
                    value={quantityInput}
                    onChange={(e) => {
                      if (!isAuthenticated) {
                        setShowLoginModal(true);
                        return;
                      }
                      const raw = e.target.value;
                      setQuantityInput(raw);
                      const val = parseInt(raw, 10);
                      if (!isNaN(val) && val >= 1) {
                        setQuantity(val);
                      }
                    }}
                    onBlur={() => {
                      if (!quantityInput || parseInt(quantityInput, 10) < 1) {
                        setQuantity(1);
                        setQuantityInput("1");
                      } else {
                        setQuantityInput(String(quantity));
                      }
                    }}
                    className="text-xl font-bold w-16 text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      if (!isAuthenticated) {
                        setShowLoginModal(true);
                        return;
                      }
                      setQuantity((q) => {
                        const newVal = q + 1;
                        setQuantityInput(String(newVal));
                        return newVal;
                      });
                    }}
                    className="w-8 h-8 bg-white rounded-md flex items-center justify-center hover:bg-gray-200 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${product.stock === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#c4886a] text-white hover:bg-[#b47858] shadow-lg hover:shadow-xl"
                    }`}
                >
                  <AnimatePresence mode="wait">
                    {isAddedToCart ? (
                      <motion.div
                        key="added"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Check className="w-6 h-6" />
                        {t("productDetails.added")}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="add"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-2"
                      >
                        <ShoppingCart className="w-6 h-6" />
                        {t("productDetails.addToCart")}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/cart")}
                  className="px-6 py-4 border-2 border-[#3a4b95] text-[#3a4b95] rounded-xl font-bold hover:bg-[#3a4b95] hover:text-white transition-all"
                >
                  {t("productDetails.viewCart")}
                </motion.button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t">
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 text-[#3a4b95]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {t("productDetails.features.fastShipping")}
                    </p>
                    <p className="text-xs">
                      {t("productDetails.features.shippingDays")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {t("productDetails.features.qualityGuarantee")}
                    </p>
                    <p className="text-xs">
                      {t("productDetails.features.authentic")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 bg-[#c4886a20] rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-[#c4886a]" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {t("productDetails.features.support")}
                    </p>
                    <p className="text-xs">
                      {t("productDetails.features.alwaysAvailable")}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {t("productDetails.features.securePayment")}
                    </p>
                    <p className="text-xs">
                      {t("productDetails.features.multipleMethods")}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-8">
                {t("productDetails.relatedProducts")}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <motion.div
                    key={relatedProduct.id}
                    whileHover={{ scale: 1.02, y: -5 }}
                    onClick={() => navigate(`/products/${relatedProduct.id}`)}
                    className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square bg-gray-50 p-4">
                      <img
                        src={relatedProduct.image || test1}
                        alt={
                          isRTL ? relatedProduct.nameAr : relatedProduct.name
                        }
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-2 line-clamp-1">
                        {isRTL ? relatedProduct.nameAr : relatedProduct.name}
                      </h3>
                      <p className="text-[#3a4b95] font-bold">
                        {relatedProduct.price} {t("common.currency")}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate(-1)}
            className="fixed bottom-8 left-8 z-50 flex items-center gap-2 px-5 py-3 bg-white shadow-lg rounded-full text-gray-700 hover:bg-gray-50 transition-all"
          >
            {isRTL ? (
              <>
                <span className="font-semibold">{t("common.back")}</span>
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                <ArrowLeft className="w-5 h-5" />
                <span className="font-semibold">{t("common.back")}</span>
              </>
            )}
          </motion.button>
        </div>

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
                      ? "يجب تسجيل الدخول أولاً للتفاعل مع المنتجات"
                      : "Please login first to interact with products"}
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
      </div>
    </>
  );
};

export default ProductDetails;
