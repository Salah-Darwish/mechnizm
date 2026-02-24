import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  ShoppingCart,
  Wallet,
  TrendingUp,
  Loader2,
  Trash2,
  Truck,
  PiggyBank,
  CheckCircle,
  AlertCircle,
  XCircle,
  Building2,
  CreditCard,
} from "lucide-react";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import NumberStepper from "../../components/NumberStepper";
import {
  removeFromCart,
  updateQuantity,
  setItemPurchaseType,
  setItemCompany,
  fetchCart,
  addToCartAsync,
  increaseQuantityAsync,
  decreaseQuantityAsync,
  removeFromCartAsync,
  updateCartOptionsAsync,
  updateQuantityAsync,
} from "../../store/slices/cartSlice";
import {
  initiatePayment,
  type PaymentPayload,
} from "../../services/paymentService";
import {
  getActiveCompanies,
  type Company,
} from "../../services/companyService";
import { validateDiscountCode } from "../../services/discountService";
import SEO from "../../components/SEO";
import { pageSEO } from "../../types/seo";
import test1 from "../../assets/images/test1.png";

const Cart = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const cartItems = useAppSelector((state) => state.cart.items);
  const total = useAppSelector((state) => state.cart.total);
  const cartLoading = useAppSelector((state) => state.cart.loading);
  const cartSynced = useAppSelector((state) => state.cart.synced);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const [discountCode, setDiscountCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [discountLoading, setDiscountLoading] = useState(false);

  // Global cart options - applies to all items
  const [globalPurchaseType] = useState<"wallet" | "resale">("wallet");
  const [globalCompanyId, setGlobalCompanyId] = useState<number | null>(null);

  // Fetch cart from backend if authenticated and not yet synced
  // Also sync local cart items to backend after login
  useEffect(() => {
    const syncCartAfterLogin = async () => {
      if (isAuthenticated && !cartSynced) {
        // If there are local cart items before login, add them to backend first
        if (cartItems.length > 0) {
          try {
            // Add each local item to backend cart
            for (const item of cartItems) {
              await dispatch(
                addToCartAsync({ productId: item.id, quantity: item.quantity })
              ).unwrap();

              // If item has specific options (purchase type, company, resale plan), update them
              if (
                item.purchaseType ||
                item.companyId ||
                item.selectedResalePlan
              ) {
                await dispatch(
                  updateCartOptionsAsync({
                    productId: item.id,
                    options: {
                      purchase_type: item.purchaseType,
                      company_id: item.companyId,
                      resale_plan_id: item.selectedResalePlan?.id,
                    },
                  })
                ).unwrap();
              }
            }
          } catch (error) {
            console.error("Failed to sync local cart to backend:", error);
          }
        }

        // Then fetch the complete cart from backend (which now includes local items)
        dispatch(fetchCart());
      }
    };

    syncCartAfterLogin();
  }, [isAuthenticated, cartSynced, dispatch, cartItems]);

  // Check if any item has resale plans available
  const hasAnyResalePlans = cartItems.some(
    (item) => item.resalePlans && item.resalePlans.length > 0
  );

  // Check if global resale is selected
  const hasResaleItems = globalPurchaseType === "resale" && hasAnyResalePlans;

  // Calculate expected profit from resale items (use selected plan or first plan for each item)
  const calculateExpectedProfit = () => {
    if (!hasResaleItems) return 0;
    return cartItems.reduce((profit, item) => {
      if (item.resalePlans && item.resalePlans.length > 0) {
        // Use item's selected resale plan if available, otherwise use first plan
        const plan = item.selectedResalePlan || item.resalePlans[0];
        const itemTotal = item.price * item.quantity;
        const expectedReturn = plan.expected_return * item.quantity;
        return profit + (expectedReturn - itemTotal);
      }
      return profit;
    }, 0);
  };
  const expectedProfit = calculateExpectedProfit();

  const handleRemoveItem = async (id: number, name: string) => {
    if (isAuthenticated) {
      try {
        await dispatch(removeFromCartAsync(id)).unwrap();
        toast.info(t("cart.removedFromCart", { name }));
      } catch (error) {
        toast.error(String(error));
      }
    } else {
      dispatch(removeFromCart(id));
      toast.info(t("cart.removedFromCart", { name }));
    }
  };

  const handleUpdateQuantity = async (
    id: number,
    currentQuantity: number,
    delta: number
  ) => {
    const newQuantity = currentQuantity + delta;

    if (isAuthenticated) {
      try {
        if (delta > 0) {
          await dispatch(increaseQuantityAsync(id)).unwrap();
        } else if (delta < 0) {
          if (newQuantity <= 0) {
            const item = cartItems.find((item) => item.id === id);
            if (item) {
              await handleRemoveItem(id, item.name);
            }
          } else {
            await dispatch(decreaseQuantityAsync(id)).unwrap();
          }
        }
      } catch (error) {
        toast.error(String(error));
      }
    } else {
      if (newQuantity > 0) {
        dispatch(updateQuantity({ id, quantity: newQuantity }));
      } else {
        // Remove item if quantity becomes 0
        const item = cartItems.find((item) => item.id === id);
        if (item) {
          handleRemoveItem(id, item.name);
        }
      }
    }
  };

  const handleApplyDiscount = async () => {
    const code = discountCode.trim().toUpperCase();

    if (!code) {
      return;
    }

    try {
      setDiscountLoading(true);
      const response = await validateDiscountCode(code);

      if (response.valid && response.data?.discount_percent) {
        setDiscountPercent(response.data.discount_percent);
        toast.success(
          t("cart.discountApplied", { percent: response.data.discount_percent })
        );
      } else {
        toast.error(response.message || t("cart.invalidCode"));
      }
    } catch {
      toast.error(t("cart.invalidCode"));
    } finally {
      setDiscountLoading(false);
    }
  };

  // Calculate final amounts
  // For wallet purchases: pay base price
  // For resale: pay base price, expect to receive more later
  const effectiveTotal = total; // Always pay base price
  const discountAmount = (effectiveTotal * discountPercent) / 100;
  const finalTotal = effectiveTotal - discountAmount;

  // Check if cart has wallet items (requires shipping)
  const hasWalletItems = globalPurchaseType === "wallet";
  // Check if cart has only investment items (no shipping needed)
  const isPureInvestment = globalPurchaseType === "resale" && hasAnyResalePlans;

  // Modal states
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Shipping form state (phone and address required - name and city come from user profile)
  const [shippingPhone, setShippingPhone] = useState("");
  const [additionalPhones, setAdditionalPhones] = useState<string[]>([]);
  const [shippingAddress, setShippingAddress] = useState("");

  // Company selection state - load from companies API
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);

  // Fetch companies on page load for cart item selection
  useEffect(() => {
    if (companies.length === 0) {
      const fetchCompanies = async () => {
        setCompaniesLoading(true);
        try {
          const response = await getActiveCompanies();
          setCompanies(response.data.companies || []);
        } catch (error) {
          console.error("Failed to fetch companies:", error);
          toast.error(
            t("checkout.companiesFetchError") || "Failed to load companies"
          );
        } finally {
          setCompaniesLoading(false);
        }
      };
      fetchCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle global company change
  const handleGlobalCompanyChange = (companyId: number) => {
    setGlobalCompanyId(companyId);
    // Update all items with the selected company
    cartItems.forEach((item) => {
      dispatch(setItemCompany({ id: item.id, companyId }));
    });

    // Save to backend if authenticated
    if (isAuthenticated) {
      cartItems.forEach(async (item) => {
        try {
          await dispatch(
            updateCartOptionsAsync({
              productId: item.id,
              options: { company_id: companyId },
            })
          ).unwrap();
        } catch (error) {
          console.error("Failed to save company selection:", error);
        }
      });
    }
  };


  // Handle per-item resale plan selection (when global is resale)
  const handleItemResalePlanChange = async (
    productId: number,
    planId: number
  ) => {
    const item = cartItems.find((i) => i.id === productId);
    if (!item || !item.resalePlans) return;

    const selectedPlan = item.resalePlans.find((p) => p.id === planId);
    if (!selectedPlan) return;

    // Update local state
    dispatch(
      setItemPurchaseType({
        id: productId,
        purchaseType: "resale",
        resalePlan: selectedPlan,
      })
    );

    // Save to backend if authenticated
    if (isAuthenticated) {
      try {
        await dispatch(
          updateCartOptionsAsync({
            productId,
            options: {
              purchase_type: "resale",
              resale_plan_id: planId,
            },
          })
        ).unwrap();
      } catch (error) {
        console.error("Failed to save resale plan selection:", error);
      }
    }
  };

  // Check if global company is selected
  const hasGlobalCompany = globalCompanyId !== null;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.warning(t("cart.cartEmpty"));
      return;
    }
    if (!isAuthenticated) {
      toast.warning(t("checkout.loginRequired") || "Please login to checkout");
      navigate("/login");
      return;
    }
    // Open checkout modal
    setShowCheckoutModal(true);
  };

  const handleConfirmCheckout = async () => {
    // Validate company selection - global company
    if (!hasGlobalCompany) {
      toast.error(
        t("checkout.selectCompanyForAll") || "Please select a delivery partner"
      );
      return;
    }

    // Validate shipping if has wallet items (phone and address required)
    if (hasWalletItems) {
      if (!shippingPhone.trim() || !shippingAddress.trim()) {
        toast.error(
          t("checkout.shippingRequired") || "Please fill in phone and address"
        );
        return;
      }
    }

    setCheckoutLoading(true);

    try {
      // Build payment payload - each item can have its own purchase type
      const payload: PaymentPayload = {
        items: cartItems.map((item) => {
          // Item uses resale if it has a selected resale plan
          const hasSelectedPlan = item.selectedResalePlan || (item.resalePlans && item.resalePlans.length > 0);
          const purchaseType = hasSelectedPlan ? "resale" : "wallet";
          const resalePlan = hasSelectedPlan
            ? item.selectedResalePlan || item.resalePlans![0]
            : null;
          
          return {
            product_id: item.id,
            quantity: item.quantity,
            purchase_type: purchaseType,
            resale_plan_id: resalePlan ? resalePlan.id : null,
            company_id: globalCompanyId,
          };
        }),
        discount_percent: discountPercent,
        discount_code: discountCode || undefined,
      };

      // Add shipping info if has wallet items
      if (hasWalletItems) {
        payload.shipping_phone = shippingPhone;
        payload.shipping_address = shippingAddress;
        const validAdditionalPhones = additionalPhones.filter((p) => p.trim());
        if (validAdditionalPhones.length > 0) {
          payload.shipping_phones = validAdditionalPhones;
        }
      }

      // Initiate payment via MyFatoorah
      const result = await initiatePayment(payload);

      if (result.success && result.data?.payment_url) {
        // Show redirect message
        toast.info(
          t("checkout.redirectingToPayment") || "جاري التحويل لبوابة الدفع..."
        );

        // Redirect to MyFatoorah payment page
        window.location.href = result.data.payment_url;
      } else {
        toast.error(result.message || result.error || t("checkout.failed"));
        setCheckoutLoading(false);
      }
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            message?: string;
            error?: string;
            data?: { available?: number; requested?: number };
          };
        };
      };
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        t("checkout.failed") ||
        "Payment initiation failed";

      // Check for stock issues
      if (err.response?.data?.data?.available !== undefined) {
        const available = err.response.data.data.available;
        const requested = err.response.data.data.requested;
        toast.error(
          `${message}. ${t("cart.available") || "Available"}: ${available}, ${t("cart.requested") || "Requested"}: ${requested}`
        );
      } else {
        toast.error(message);
      }
      setCheckoutLoading(false);
    }
    // Note: Don't set checkoutLoading to false on success - we're redirecting away
  };

  const handleContinueShopping = () => {
    navigate("/products");
  };

  return (
    <>
      <SEO
        title={pageSEO.cart.title}
        description={pageSEO.cart.description}
        keywords={pageSEO.cart.keywords}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mx-auto px-4 py-12 w-[95%] max-w-4xl"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <h1 className="text-4xl font-bold text-gray-800">
              {t("cart.title")}
            </h1>
            <ShoppingCart className="w-10 h-10 text-[#c4886a]" />
          </div>
          <p className="text-gray-600 text-lg">{t("cart.subtitle")}</p>
        </motion.div>

        {/* Loading state when fetching cart from backend */}
        {cartLoading && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <Loader2 className="w-12 h-12 text-[#c4886a] animate-spin mb-4" />
            <p className="text-gray-600">
              {t("cart.loading") || "جاري تحميل السلة..."}
            </p>
          </motion.div>
        )}

        {!cartLoading && cartItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">
              {t("cart.emptyCart")}
            </h2>
            <p className="text-gray-500 mb-6">{t("cart.emptyMessage")}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleContinueShopping}
              className="px-8 py-3 bg-[#c4886a] text-white rounded-lg font-bold hover:bg-[#b47858] transition-all"
            >
              {t("cart.continueShopping")}
            </motion.button>
          </motion.div>
        ) : (
          !cartLoading && (
            <div className="space-y-6">
              {/* Global Cart Options - Purchase Type & Company */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-right flex items-center justify-end gap-2">
                  <span>{"شراء مباشر"}</span>
                  <ShoppingCart className="w-5 h-5 text-[#c4886a]" />
                </h3>

                {/* Direct Purchase Info - Always Shown */}
                <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-end gap-2 mb-2">
                    <span className="text-[#3a4b95] font-bold">
                      {t("cart.directPurchaseSelected") || "شراء مباشر"}
                    </span>
                    <Truck className="w-5 h-5 text-[#3a4b95]" />
                  </div>
                  <p className="text-sm text-gray-600 text-right">
                    {t("cart.directPurchaseNote") || "سيتم شحن المنتجات إليك"}
                  </p>
                </div>

                {/* Investment Info - Always Shown if available */}
                {hasAnyResalePlans && (
                  <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center justify-end gap-2 mb-2">
                      <span className="text-green-700 font-bold">
                        {"الأرباح"}
                      </span>
                      <PiggyBank className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-sm text-gray-600 text-right">
                      {t("cart.investmentNote") || "استثمر وابدأ في جني الأرباح"}
                    </p>
                  </div>
                )}

                {/* Global Company/Delivery Partner Selection */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                      {companiesLoading ? (
                        <div className="flex items-center justify-center py-3">
                          <Loader2 className="w-6 h-6 animate-spin text-[#3a4b95]" />
                        </div>
                      ) : (
                        <div className="relative">
                          <select
                            value={globalCompanyId || ""}
                            onChange={(e) =>
                              handleGlobalCompanyChange(Number(e.target.value))
                            }
                            className={`w-full px-4 py-3 rounded-xl text-right appearance-none cursor-pointer transition-all duration-200 pr-4 pl-12 text-base ${
                              globalCompanyId
                                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-400 text-green-800 font-medium"
                                : "bg-gray-50 border-2 border-gray-200 text-gray-600 hover:border-[#3a4b95] hover:bg-blue-50"
                            } focus:outline-none focus:ring-2 focus:ring-[#3a4b95]/20`}
                          >
                            <option value="">
                              {t("cart.selectDeliveryPartner") ||
                                "اختر شريك التوصيل"}
                            </option>
                            {companies.map((company) => (
                              <option key={company.id} value={company.id}>
                                {company.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            {globalCompanyId ? (
                              <CheckCircle className="w-6 h-6 text-green-500" />
                            ) : (
                              <Building2 className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-right shrink-0">
                      <span className="text-base font-medium text-gray-700">
                        {t("cart.deliveryPartner") || "شريك التوصيل"}
                      </span>
                      <Truck className="w-6 h-6 text-[#3a4b95]" />
                    </div>
                  </div>

                  {!globalCompanyId && (
                    <p className="text-sm text-amber-600 mt-2 text-right flex items-center justify-end gap-1">
                      <span>
                        {t("cart.selectDeliveryPartnerHint") ||
                          "يرجى اختيار شريك التوصيل لإتمام الطلب"}
                      </span>
                      <AlertCircle className="w-4 h-4" />
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Cart Items - Simplified */}
              <div className="space-y-4">
                {cartItems.map((item, index) => {
                  const itemTotal = item.price * item.quantity;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-md p-6 relative"
                    >
                      {/* Remove Button - Top Left Corner */}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleRemoveItem(item.id, item.name)}
                        className="absolute top-4 left-4 z-10 w-10 h-10 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center text-red-500 hover:text-red-600 transition-all group"
                        title={t("cart.remove") || "Remove item"}
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>

                      <div className="flex items-center gap-6">
                        {/* Product Image - Right Side */}
                        <div className="w-24 h-24 shrink-0">
                          <img
                            src={item.image || test1}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        {/* Product Info - Center */}
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800 mb-2 text-right">
                            {item.name}
                          </h3>

                          {/* Show item type badges - both options visible */}
                          <div className="flex items-center gap-2 justify-end flex-wrap">
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-[#3a4b95] rounded-full text-sm font-medium">
                              <Wallet className="w-4 h-4" />
                              {t("cart.directPurchase")}
                            </span>
                            {item.resalePlans && item.resalePlans.length > 0 && (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                                <TrendingUp className="w-4 h-4" />
                                {t("cart.investment") || "الأرباح"}
                              </span>
                            )}
                          </div>

                          {/* Resale Plan Selector - Always show if item has plans */}
                          {item.resalePlans &&
                            item.resalePlans.length > 0 && (
                              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-700 font-semibold text-right mb-2">
                                  {t("cart.selectResalePlan") ||
                                    "اختر فترة الأرباح"}
                                </p>
                                <div className="flex flex-wrap gap-2 justify-end">
                                  {item.resalePlans.map((plan) => {
                                    const isSelected =
                                      item.selectedResalePlan?.id === plan.id ||
                                      (!item.selectedResalePlan &&
                                        plan.id === item.resalePlans![0].id);
                                    return (
                                      <button
                                        key={plan.id}
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          handleItemResalePlanChange(
                                            item.id,
                                            plan.id
                                          );
                                        }}
                                        className={`px-3 py-2 rounded-lg text-sm transition-all ${
                                          isSelected
                                            ? "bg-green-600 text-white shadow-md"
                                            : "bg-white text-gray-700 border border-green-300 hover:bg-green-100"
                                        }`}
                                      >
                                        <span className="font-bold">
                                          {plan.months}
                                        </span>{" "}
                                        {t("cart.months") || "شهر"}
                                        <span className="mx-1">•</span>
                                        <span className="font-semibold">
                                          +{plan.profit_percentage}%
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Show expected return for this item */}
                                {(() => {
                                  const selectedPlan =
                                    item.selectedResalePlan ||
                                    item.resalePlans[0];
                                  
                                  // Calculate properly based on profit percentage
                                  const basePrice = item.price * item.quantity;
                                  const profitAmount = (basePrice * selectedPlan.profit_percentage) / 100;
                                  const expectedReturn = basePrice + profitAmount;
                                  
                                  return (
                                    <div className="mt-3 pt-2 border-t border-green-200 text-right">
                                      <div className="flex justify-between items-center text-sm">
                                        <span className="text-green-700 font-bold">
                                          {Math.round(expectedReturn)}{" "}
                                          {t("cart.riyal")}
                                        </span>
                                        <span className="text-gray-600">
                                          {t("cart.expectedReturn") ||
                                            "العائد المتوقع"}
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center text-sm mt-1">
                                        <span className="text-green-600 font-semibold">
                                          +{Math.round(profitAmount)}{" "}
                                          {t("cart.riyal")}
                                        </span>
                                        <span className="text-gray-500">
                                          {t("cart.yourProfit") || "ربحك"}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            )}
                        </div>

                        {/* Price and Quantity - Left Side */}
                        <div className="flex flex-col items-center gap-3">
                          <div className="text-center">
                            <span className="text-2xl font-bold text-gray-800">
                              {itemTotal}
                            </span>
                            <span className="text-gray-600 mr-1">
                              {t("cart.riyal")}
                            </span>
                          </div>

                          {/* Quantity Controls */}
                          <NumberStepper
                            value={item.quantity}
                            onIncrement={() =>
                              handleUpdateQuantity(item.id, item.quantity, 1)
                            }
                            onDecrement={() =>
                              handleUpdateQuantity(item.id, item.quantity, -1)
                            }
                            onDirectChange={async (newQty) => {
                              dispatch(updateQuantity({ id: item.id, quantity: newQty }));
                              if (isAuthenticated) {
                                try {
                                  await dispatch(updateQuantityAsync({ productId: item.id, quantity: newQty })).unwrap();
                                } catch (error) {
                                  toast.error(String(error));
                                }
                              }
                            }}
                            min={1}
                            max={999}
                          />
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Summary Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                {/* Discount Code */}
                <div className="flex gap-3 mb-6">
                  <input
                    type="text"
                    value={discountCode}
                    onChange={(e) => setDiscountCode(e.target.value)}
                    placeholder={t("cart.discountCode")}
                    className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 text-right focus:border-[#c4886a] focus:outline-none"
                    disabled={discountLoading}
                  />
                  <motion.button
                    whileHover={{ scale: discountLoading ? 1 : 1.02 }}
                    whileTap={{ scale: discountLoading ? 1 : 0.98 }}
                    onClick={handleApplyDiscount}
                    disabled={discountLoading || !discountCode.trim()}
                    className="px-8 py-3 border-2 border-[#c4886a] text-[#c4886a] rounded-lg font-bold hover:bg-[#c4886a] hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {discountLoading && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {t("cart.applyDiscount")}
                  </motion.button>
                </div>

                <div className="border-t-2 border-gray-200 pt-4 mb-4">
                  {/* Base Subtotal */}
                  <div className="flex justify-between text-gray-700 mb-3">
                    <span className="font-semibold">
                      {total} {t("cart.riyal")}
                    </span>
                    <span className="font-semibold">{t("cart.subtotal")}</span>
                  </div>

                  {/* Expected Profit from Investments (if any resale items) */}
                  {hasResaleItems && expectedProfit > 0 && (
                    <div className="flex justify-between text-green-600 mb-3">
                      <span className="font-semibold">
                        +{Math.round(expectedProfit)} {t("cart.riyal")}
                      </span>
                      <span className="font-semibold">
                        {t("cart.expectedProfitLabel")}
                      </span>
                    </div>
                  )}

                  {/* Discount */}
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-green-600 mb-3">
                      <span className="font-semibold">
                        -{discountAmount.toFixed(0)} {t("cart.riyal")}
                      </span>
                      <span className="font-semibold">
                        خصم {discountPercent}%
                      </span>
                    </div>
                  )}

                  {/* Shipping */}
                  <div className="flex justify-between text-gray-700 mb-4">
                    <span className="font-semibold">0 {t("cart.riyal")}</span>
                    <span className="font-semibold">{t("cart.shipping")}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mb-4">
                  <motion.button
                    whileHover={{ scale: !hasGlobalCompany ? 1 : 1.02 }}
                    whileTap={{ scale: !hasGlobalCompany ? 1 : 0.98 }}
                    onClick={handleCheckout}
                    disabled={!hasGlobalCompany}
                    className="flex-1 py-3 bg-[#c4886a] text-white rounded-lg font-bold hover:bg-[#b47858] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t("cart.checkout")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleContinueShopping}
                    className="flex-1 py-3 border-2 border-[#c4886a] text-[#c4886a] rounded-lg font-bold hover:bg-gray-50 transition-all"
                  >
                    {t("cart.continueShopping")}
                  </motion.button>
                </div>

                {/* Validation Messages */}
                {!hasGlobalCompany && (
                  <div className="mb-4">
                    <p className="text-sm text-amber-600 text-right flex items-center justify-end gap-1">
                      <span>
                        {t("cart.selectDeliveryPartnerHint") ||
                          "يرجى اختيار شريك التوصيل لإتمام الطلب"}
                      </span>
                      <AlertCircle className="w-4 h-4" />
                    </p>
                  </div>
                )}

                {/* Total */}
                <div className="border-t-2 border-gray-200 pt-4 flex justify-between text-2xl font-bold">
                  <span className="text-gray-800">{t("cart.total")}</span>
                  <span className="text-gray-800">
                    {finalTotal.toFixed(0)} {t("cart.riyal")}
                  </span>
                </div>
              </motion.div>
            </div>
          )
        )}

        {/* Checkout Modal */}
        {showCheckoutModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full my-8"
            >
              <h2 className="text-2xl font-bold text-[#3a4b95] mb-6 text-right">
                {t("checkout.title") || "إتمام الطلب"}
              </h2>

              {/* Order Type Indicator */}
              <div className="mb-6 p-4 rounded-lg bg-gray-50">
                {isPureInvestment ? (
                  <div className="flex items-center gap-3 text-green-600">
                    <PiggyBank className="w-6 h-6" />
                    <div className="text-right flex-1">
                      <p className="font-bold">
                        {t("checkout.investmentOrder") || "طلب أرباح"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("checkout.noShippingNeeded") ||
                          "لا يحتاج شحن - ستعود أرباحك مع الربح"}
                      </p>
                    </div>
                  </div>
                ) : hasWalletItems && hasResaleItems ? (
                  <div className="flex items-center gap-3 text-[#3a4b95]">
                    <div className="flex">
                      <Truck className="w-5 h-5" />
                      <TrendingUp className="w-5 h-5 -ml-1" />
                    </div>
                    <div className="text-right flex-1">
                      <p className="font-bold">
                        {t("checkout.mixedOrder") || "طلب مختلط"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("checkout.mixedOrderDesc") ||
                          "يحتوي على منتجات للشحن والأرباح"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-[#c4886a]">
                    <Truck className="w-6 h-6" />
                    <div className="text-right flex-1">
                      <p className="font-bold">
                        {t("checkout.directOrder") || "طلب مباشر"}
                      </p>
                      <p className="text-sm text-gray-600">
                        {t("checkout.willBeShipped") ||
                          "سيتم شحن المنتجات إليك"}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipping Form - Only show if has wallet items */}
              {hasWalletItems && (
                <div className="mb-6 space-y-4">
                  <h3 className="font-bold text-gray-800 text-right flex items-center justify-end gap-2">
                    <span>
                      {t("checkout.shippingDetails") || "تفاصيل الشحن"}
                    </span>
                    <Truck className="w-5 h-5" />
                  </h3>

                  <div>
                    <input
                      type="tel"
                      value={shippingPhone}
                      onChange={(e) => setShippingPhone(e.target.value)}
                      placeholder={t("checkout.phone") || "رقم الجوال"}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 text-right focus:border-[#c4886a] focus:outline-none"
                    />
                  </div>

                  {/* Additional Phones */}
                  {additionalPhones.map((phone, index) => (
                    <div key={index} className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setAdditionalPhones(
                            additionalPhones.filter((_, i) => i !== index)
                          )
                        }
                        className="px-3 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
                      >
                        <XCircle className="w-5 h-5" />
                      </button>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => {
                          const updated = [...additionalPhones];
                          updated[index] = e.target.value;
                          setAdditionalPhones(updated);
                        }}
                        placeholder={
                          t("checkout.additionalPhone") || "رقم جوال إضافي"
                        }
                        className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 text-right focus:border-[#c4886a] focus:outline-none"
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() =>
                      setAdditionalPhones([...additionalPhones, ""])
                    }
                    className="w-full px-4 py-2 border-2 border-dashed border-gray-300 text-gray-600 rounded-lg hover:border-[#c4886a] hover:text-[#c4886a] transition-colors flex items-center justify-center gap-2"
                  >
                    <span>+</span>
                    <span>
                      {t("checkout.addPhone") || "إضافة رقم جوال آخر"}
                    </span>
                  </button>

                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder={t("checkout.address") || "العنوان التفصيلي"}
                    rows={3}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 text-right focus:border-[#c4886a] focus:outline-none resize-none"
                  />
                </div>
              )}

              {/* Warning if delivery partner not selected */}
              {!hasGlobalCompany && (
                <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-2 text-yellow-800 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-right flex-1">
                    {t("cart.selectDeliveryPartnerWarning") ||
                      "يرجى اختيار شريك التوصيل قبل إتمام الطلب"}
                  </span>
                </div>
              )}

              {/* Order Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-bold text-gray-800 mb-3 text-right">
                  {t("checkout.orderSummary") || "ملخص الطلب"}
                </h3>

                {/* Items breakdown */}
                <div className="space-y-2 text-sm mb-3 max-h-32 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center"
                    >
                      <span className="font-semibold">
                        {item.price * item.quantity} {t("cart.riyal")}
                      </span>
                      <div className="text-right flex items-center gap-2">
                        <span>
                          {item.name} × {item.quantity}
                        </span>
                        {globalPurchaseType === "resale" &&
                        item.resalePlans &&
                        item.resalePlans.length > 0 ? (
                          <TrendingUp className="w-4 h-4 text-green-600" />
                        ) : (
                          <Wallet className="w-4 h-4 text-[#3a4b95]" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {total} {t("cart.riyal")}
                    </span>
                    <span>{t("cart.subtotal")}</span>
                  </div>

                  {discountPercent > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-semibold">
                        -{discountAmount.toFixed(0)} {t("cart.riyal")}
                      </span>
                      <span>
                        {t("checkout.discount") || "خصم"} {discountPercent}%
                      </span>
                    </div>
                  )}

                  {hasResaleItems && expectedProfit > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span className="font-semibold">
                        +{Math.round(expectedProfit)} {t("cart.riyal")}
                      </span>
                      <span>{t("cart.expectedProfitLabel")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-300">
                    <span>
                      {finalTotal.toFixed(0)} {t("cart.riyal")}
                    </span>
                    <span>{t("checkout.totalToPay") || "المبلغ المطلوب"}</span>
                  </div>
                </div>
              </div>

              {/* Warning for investments */}
              {hasResaleItems && (
                <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-2 text-right">
                    <div className="flex-1">
                      <p className="text-sm text-yellow-800">
                        <AlertCircle className="w-4 h-4 inline ml-1" />
                        {t("checkout.investmentWarning") ||
                          "الأرباح ستُسجل بالأرباح الحالية ولن تتأثر بأي تغييرات مستقبلية في خطط المنتجات."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCheckoutModal(false)}
                  disabled={checkoutLoading}
                  className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 disabled:opacity-50"
                >
                  {t("checkout.cancel") || "إلغاء"}
                </motion.button>
                <motion.button
                  whileHover={{
                    scale:
                      !hasGlobalCompany || checkoutLoading || companiesLoading
                        ? 1
                        : 1.02,
                  }}
                  whileTap={{
                    scale:
                      !hasGlobalCompany || checkoutLoading || companiesLoading
                        ? 1
                        : 0.98,
                  }}
                  onClick={handleConfirmCheckout}
                  disabled={
                    checkoutLoading || companiesLoading || !hasGlobalCompany
                  }
                  className="flex-1 py-3 bg-[#c4886a] text-white rounded-lg font-bold hover:bg-[#b47858] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {checkoutLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t("checkout.redirectingToPayment") ||
                        "جاري التحويل للدفع..."}
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5" />
                      {t("checkout.proceedToPayment") || "المتابعة للدفع"}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Cart;
