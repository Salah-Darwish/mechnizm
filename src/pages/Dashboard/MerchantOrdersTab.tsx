import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Package,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Truck,
  CreditCard,
  Banknote,
} from "lucide-react";
import { useAppSelector } from "../../store/hooks";

const MerchantOrdersTab = () => {
  const { t, i18n } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const allOrders = useAppSelector((state) => state.orders.orders);

  const [activeFilter, setActiveFilter] = useState<
    "all" | "cash" | "installment"
  >("all");

  // Filter orders for this merchant
  const merchantOrders = useMemo(() => {
    return allOrders.filter(
      (order) => order.merchantId === user?.id || !order.merchantId
    );
  }, [allOrders, user]);

  // Filter by payment type
  const filteredOrders = useMemo(() => {
    if (activeFilter === "all") return merchantOrders;
    return merchantOrders.filter((order) => order.paymentType === activeFilter);
  }, [merchantOrders, activeFilter]);

  // Calculate stats
  const stats = useMemo(() => {
    const cashOrders = merchantOrders.filter((o) => o.paymentType === "cash");
    const installmentOrders = merchantOrders.filter(
      (o) => o.paymentType === "installment"
    );

    const cashRevenue = cashOrders.reduce((sum, o) => sum + o.finalTotal, 0);
    const installmentRevenue = installmentOrders.reduce(
      (sum, o) => sum + o.finalTotal,
      0
    );

    const installmentProfit = installmentOrders.reduce(
      (sum, o) => sum + (o.installmentDetails?.profit || 0),
      0
    );

    const pendingInstallments = installmentOrders.filter(
      (o) => o.installmentDetails && o.installmentDetails.remainingPayments > 0
    );

    return {
      totalOrders: merchantOrders.length,
      cashOrders: cashOrders.length,
      installmentOrders: installmentOrders.length,
      cashRevenue,
      installmentRevenue,
      totalRevenue: cashRevenue + installmentRevenue,
      installmentProfit,
      pendingInstallments: pendingInstallments.length,
    };
  }, [merchantOrders]);

  // Calculate days remaining for installment
  const getDaysRemaining = (nextPaymentDate: string) => {
    const now = new Date();
    const next = new Date(nextPaymentDate);
    const diff = next.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Sample orders for demonstration - use useMemo to avoid recomputing
  const sampleOrders = useMemo(() => {
    const now = new Date();
    return [
      {
        id: "1",
        orderNumber: "ORD-2024-001",
        items: [
          {
            id: 1,
            productId: 1,
            productName: "Fresh Beef",
            quantity: 2,
            price: 120,
            image: "",
          },
        ],
        total: 240,
        discountAmount: 0,
        finalTotal: 264, // With 10% installment fee
        status: "delivered" as const,
        paymentType: "installment" as const,
        installmentDetails: {
          tier: { months: 3 as const, percentage: 10 },
          totalAmount: 264,
          monthlyPayment: 88,
          monthsPaid: 1,
          nextPaymentDate: new Date(
            now.getTime() + 15 * 24 * 60 * 60 * 1000
          ).toISOString(),
          remainingPayments: 2,
          profit: 24,
        },
        merchantId: user?.id,
        createdAt: new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "2",
        orderNumber: "ORD-2024-002",
        items: [
          {
            id: 2,
            productId: 2,
            productName: "Chicken Breast",
            quantity: 3,
            price: 45,
            image: "",
          },
        ],
        total: 135,
        discountAmount: 0,
        finalTotal: 135,
        status: "delivered" as const,
        paymentType: "cash" as const,
        merchantId: user?.id,
        createdAt: new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
        updatedAt: now.toISOString(),
      },
      {
        id: "3",
        orderNumber: "ORD-2024-003",
        items: [
          {
            id: 3,
            productId: 3,
            productName: "Salmon Fillet",
            quantity: 1,
            price: 85,
            image: "",
          },
        ],
        total: 85,
        discountAmount: 0,
        finalTotal: 102, // With 20% for 12 months
        status: "processing" as const,
        paymentType: "installment" as const,
        installmentDetails: {
          tier: { months: 12 as const, percentage: 20 },
          totalAmount: 102,
          monthlyPayment: 8.5,
          monthsPaid: 0,
          nextPaymentDate: new Date(
            now.getTime() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          remainingPayments: 12,
          profit: 17,
        },
        merchantId: user?.id,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      },
    ];
  }, [user?.id]);

  const ordersToShow =
    filteredOrders.length > 0 ? filteredOrders : sampleOrders;

  const filters = [
    {
      key: "all" as const,
      label: t("dashboard.merchantOrders.all"),
      icon: Package,
    },
    {
      key: "cash" as const,
      label: t("dashboard.merchantOrders.cash"),
      icon: Banknote,
    },
    {
      key: "installment" as const,
      label: t("dashboard.merchantOrders.installment"),
      icon: CreditCard,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("dashboard.merchantOrders.title")}
        </h2>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-blue-100 text-sm">
                {t("dashboard.merchantOrders.totalOrders")}
              </p>
              <p className="text-2xl font-bold">
                {stats.totalOrders || sampleOrders.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-green-100 text-sm">
                {t("dashboard.merchantOrders.totalRevenue")}
              </p>
              <p className="text-2xl font-bold">${stats.totalRevenue || 501}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-[#c4886a] to-[#b47858] rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-white text-sm">
                {t("dashboard.merchantOrders.installmentProfit")}
              </p>
              <p className="text-2xl font-bold">
                ${stats.installmentProfit || 41}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-purple-100 text-sm">
                {t("dashboard.merchantOrders.pendingInstallments")}
              </p>
              <p className="text-2xl font-bold">
                {stats.pendingInstallments || 2}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {filters.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setActiveFilter(filter.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              activeFilter === filter.key
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <filter.icon className="w-4 h-4" />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {ordersToShow.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 text-gray-500"
            >
              {t("dashboard.merchantOrders.noOrders")}
            </motion.div>
          ) : (
            ordersToShow.map((order, index) => (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${
                  order.paymentType === "installment"
                    ? "border-[#c4886a30]"
                    : "border-green-200"
                }`}
              >
                {/* Order Header */}
                <div className="p-4 bg-gray-50 border-b flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {order.paymentType === "installment" ? (
                      <CreditCard className="w-5 h-5 text-[#c4886a]" />
                    ) : (
                      <Banknote className="w-5 h-5 text-green-500" />
                    )}
                    <div>
                      <p className="font-bold text-gray-800">
                        {order.orderNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString(
                          i18n.language === "ar" ? "ar-EG" : "en-US"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "processing"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "shipped"
                              ? "bg-purple-100 text-purple-800"
                              : order.status === "cancelled"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status === "delivered" && (
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                      )}
                      {order.status === "processing" && (
                        <Clock className="w-3 h-3 inline mr-1" />
                      )}
                      {order.status === "shipped" && (
                        <Truck className="w-3 h-3 inline mr-1" />
                      )}
                      {t(`dashboard.status.${order.status}`)}
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.paymentType === "installment"
                          ? "bg-[#e5d4c8] text-[#6a4a2a]"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.paymentType === "installment"
                        ? t("dashboard.merchantOrders.installment")
                        : t("dashboard.merchantOrders.cash")}
                    </span>
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-4">
                  {/* Items */}
                  <div className="mb-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-gray-700">
                          {item.productName} × {item.quantity}
                        </span>
                        <span className="font-medium">
                          ${item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Installment Details */}
                  {order.paymentType === "installment" &&
                    order.installmentDetails && (
                      <div className="mt-4 p-4 bg-[#c4886a20] rounded-lg border border-[#c4886a30]">
                        <div className="flex items-center gap-2 mb-3">
                          <CreditCard className="w-5 h-5 text-[#c4886a]" />
                          <span className="font-bold text-[#6a4a2a]">
                            {t("dashboard.merchantOrders.installmentDetails")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">
                              {t("dashboard.merchantOrders.period")}
                            </p>
                            <p className="font-bold text-gray-800">
                              {order.installmentDetails.tier.months}{" "}
                              {t("dashboard.products.monthsShort")}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              {t("dashboard.merchantOrders.monthly")}
                            </p>
                            <p className="font-bold text-gray-800">
                              $
                              {order.installmentDetails.monthlyPayment.toFixed(
                                2
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              {t("dashboard.merchantOrders.paid")}
                            </p>
                            <p className="font-bold text-green-600">
                              {order.installmentDetails.monthsPaid} /{" "}
                              {order.installmentDetails.tier.months}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              {t("dashboard.merchantOrders.yourProfit")}
                            </p>
                            <p className="font-bold text-[#c4886a]">
                              +${order.installmentDetails.profit}
                            </p>
                          </div>
                        </div>

                        {/* Countdown to next payment */}
                        {order.installmentDetails.remainingPayments > 0 && (
                          <div className="mt-4 pt-4 border-t border-[#c4886a30]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#c4886a]" />
                                <span className="text-sm text-gray-600">
                                  {t("dashboard.merchantOrders.nextPayment")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="bg-[#c4886a] text-white px-3 py-1 rounded-lg font-bold">
                                  {getDaysRemaining(
                                    order.installmentDetails.nextPaymentDate
                                  )}{" "}
                                  {t("dashboard.merchantOrders.days")}
                                </div>
                                <AlertCircle className="w-4 h-4 text-[#c4886a]" />
                              </div>
                            </div>

                            {/* Progress bar for installment */}
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>
                                  {t("dashboard.merchantOrders.progress")}
                                </span>
                                <span>
                                  {Math.round(
                                    (order.installmentDetails.monthsPaid /
                                      order.installmentDetails.tier.months) *
                                      100
                                  )}
                                  %
                                </span>
                              </div>
                              <div className="w-full bg-[#c4886a40] rounded-full h-2">
                                <motion.div
                                  className="bg-[#c4886a] h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${
                                      (order.installmentDetails.monthsPaid /
                                        order.installmentDetails.tier.months) *
                                      100
                                    }%`,
                                  }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Order Total */}
                  <div className="mt-4 pt-4 border-t flex items-center justify-between">
                    <span className="text-gray-600">
                      {t("dashboard.merchantOrders.total")}
                    </span>
                    <span className="text-xl font-bold text-primary">
                      ${order.finalTotal}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MerchantOrdersTab;
