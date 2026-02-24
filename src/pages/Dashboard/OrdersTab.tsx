import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  ShoppingBag,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ban,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import {
  fetchUserOrders,
  fetchOrderDetails,
  cancelUserOrder,
  fetchAllOrdersAdmin,  updateOrderStatusAdmin,} from "../../store/slices/ordersSlice";
import type { Order, OrderStatus, OrderType } from "../../types/order";
import { toast } from "react-toastify";

type FilterType = "all" | "sale" | "resale";
type StatusFilter = "all" | OrderStatus;

const OrdersTab = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { orders, loading, error, pagination } = useAppSelector(
    (state) => state.orders
  );

  const [typeFilter, setTypeFilter] = useState<FilterType>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const isRTL = i18n.language === "ar";

  // Fetch orders on mount and when filters change
  useEffect(() => {
    const filters = {
      type: typeFilter !== "all" ? typeFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      page: currentPage,
      per_page: 10,
    };

    if (isAdmin) {
      dispatch(fetchAllOrdersAdmin(filters));
    } else {
      dispatch(fetchUserOrders(filters));
    }
  }, [dispatch, typeFilter, statusFilter, currentPage, isAdmin]);

  // Calculate stats from orders
  const stats = useMemo(() => {
    const saleOrders = orders.filter((o) => o.type === "sale");
    const resaleOrders = orders.filter(
      (o) => o.type === "resale" || o.type === "mixed"
    );
    const pendingOrders = orders.filter(
      (o) => o.status === "pending" || o.status === "processing"
    );
    const completedOrders = orders.filter(
      (o) => o.status === "confirmed" || o.status === "invested"
    );

    const totalRevenue = orders.reduce(
      (sum, o) => sum + (o.totalAmount || o.finalTotal),
      0
    );
    const totalInvestmentReturn = resaleOrders.reduce(
      (sum, o) => sum + (o.resale?.expectedReturn || 0),
      0
    );
    const totalProfit = resaleOrders.reduce(
      (sum, o) => sum + (o.resale?.profitAmount || 0),
      0
    );

    return {
      totalOrders: orders.length,
      saleOrders: saleOrders.length,
      resaleOrders: resaleOrders.length,
      pendingOrders: pendingOrders.length,
      completedOrders: completedOrders.length,
      totalRevenue,
      totalInvestmentReturn,
      totalProfit,
    };
  }, [orders]);

  // Type filter options
  const typeFilters = [
    { key: "all" as FilterType, label: t("dashboard.orders.allTypes") },
    { key: "sale" as FilterType, label: t("dashboard.orders.directPurchase") },
    { key: "resale" as FilterType, label: t("dashboard.orders.investment") },
  ];

  // Status filter options (simplified: confirmed is final for wallet, invested for resale)
  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: t("dashboard.orders.allStatuses") },
    { key: "pending", label: t("dashboard.status.pending") },
    { key: "confirmed", label: t("dashboard.status.confirmed") },
    { key: "invested", label: t("dashboard.status.invested") },
    { key: "cancelled", label: t("dashboard.status.cancelled") },
  ];

  // Get status color and icon
  const getStatusConfig = (status: OrderStatus) => {
    const configs: Record<
      OrderStatus,
      { color: string; bgColor: string; icon: React.ReactNode }
    > = {
      pending: {
        color: "text-yellow-700",
        bgColor: "bg-yellow-100",
        icon: <Clock className="w-4 h-4" />,
      },
      confirmed: {
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      processing: {
        color: "text-indigo-700",
        bgColor: "bg-indigo-100",
        icon: <Package className="w-4 h-4" />,
      },
      shipped: {
        color: "text-purple-700",
        bgColor: "bg-purple-100",
        icon: <Truck className="w-4 h-4" />,
      },
      delivered: {
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      invested: {
        color: "text-[#8a5a3a]",
        bgColor: "bg-[#c4886a]",
        icon: <TrendingUp className="w-4 h-4" />,
      },
      completed: {
        color: "text-green-700",
        bgColor: "bg-green-100",
        icon: <CheckCircle className="w-4 h-4" />,
      },
      cancelled: {
        color: "text-red-700",
        bgColor: "bg-red-100",
        icon: <XCircle className="w-4 h-4" />,
      },
    };
    return configs[status] || configs.pending;
  };

  // Get order type badge
  const getTypeBadge = (type?: OrderType) => {
    if (!type) return null;
    const configs: Record<
      OrderType,
      { color: string; bgColor: string; label: string }
    > = {
      sale: {
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        label: t("dashboard.orders.directPurchase"),
      },
      resale: {
        color: "text-[#8a5a3a]",
        bgColor: "bg-[#c4886a]",
        label: t("dashboard.orders.investment"),
      },
      mixed: {
        color: "text-purple-700",
        bgColor: "bg-purple-100",
        label: t("dashboard.orders.mixed"),
      },
    };
    return configs[type];
  };

  // Calculate days remaining for investment
  const getDaysRemaining = (returnDate: string | null) => {
    if (!returnDate) return 0;
    const now = new Date();
    const target = new Date(returnDate);
    const diff = target.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  // Handle view order details
  const handleViewOrder = async (orderId: string) => {
    try {
      await dispatch(fetchOrderDetails(orderId)).unwrap();
      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
        setShowOrderDetail(true);
      }
    } catch {
      toast.error(t("dashboard.orders.loadError"));
    }
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm(t("dashboard.orders.cancelConfirm"))) return;

    try {
      await dispatch(cancelUserOrder(orderId)).unwrap();
      toast.success(t("dashboard.orders.cancelSuccess"));
    } catch {
      toast.error(t("dashboard.orders.cancelError"));
    }
  };

  // Handle approve order (Admin only)
  const handleApproveOrder = async (orderId: string) => {
    try {
      await dispatch(updateOrderStatusAdmin({ id: orderId, status: "confirmed" })).unwrap();
      toast.success(t("dashboard.orders.approveSuccess") || "Order approved successfully");
    } catch {
      toast.error(t("dashboard.orders.approveError") || "Failed to approve order");
    }
  };

  // Refresh orders
  const handleRefresh = () => {
    const filters = {
      type: typeFilter !== "all" ? typeFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      page: currentPage,
      per_page: 10,
    };

    if (isAdmin) {
      dispatch(fetchAllOrdersAdmin(filters));
    } else {
      dispatch(fetchUserOrders(filters));
    }
  };

  // Format date based on locale
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(
      isRTL ? "ar-SA" : "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${t("common.currency")} ${amount.toFixed(2)}`;
  };

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-700 font-semibold mb-2">
          {t("dashboard.orders.loadError")}
        </p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t("dashboard.orders.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("dashboard.orders.title")}
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          {t("dashboard.orders.refresh")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white"
        >
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-blue-100 text-sm">
                {t("dashboard.orders.totalOrders")}
              </p>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
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
            <Package className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-green-100 text-sm">
                {t("dashboard.orders.directPurchases")}
              </p>
              <p className="text-2xl font-bold">{stats.saleOrders}</p>
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
                {t("dashboard.orders.investments")}
              </p>
              <p className="text-2xl font-bold">{stats.resaleOrders}</p>
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
            <DollarSign className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-purple-100 text-sm">
                {t("dashboard.orders.expectedProfit")}
              </p>
              <p className="text-2xl font-bold">
                {formatCurrency(stats.totalProfit)}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">
              {t("dashboard.orders.filterBy")}:
            </span>
          </div>

          {/* Type Filter */}
          <div className="flex flex-wrap gap-2">
            {typeFilters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => {
                  setTypeFilter(filter.key);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  typeFilter === filter.key
                    ? "bg-primary text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as StatusFilter);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {statusFilters.map((filter) => (
              <option key={filter.key} value={filter.key}>
                {filter.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <RefreshCw className="w-12 h-12 text-primary mx-auto animate-spin mb-4" />
            <p className="text-gray-600">{t("dashboard.orders.loading")}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              {t("dashboard.orders.noOrders")}
            </p>
            <p className="text-gray-500 text-sm">
              {t("dashboard.orders.noOrdersDesc")}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {orders.map((order, index) => {
              const statusConfig = getStatusConfig(order.status);
              const typeBadge = getTypeBadge(order.type);
              const isResale =
                order.type === "resale" || order.type === "mixed";
              const daysRemaining = isResale && order.resale
                ? getDaysRemaining(order.resale.returnDate)
                : 0;
              const canCancel =
                order.status === "pending" || order.status === "confirmed";

              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${
                    isResale ? "border-[#c4886a]" : "border-blue-200"
                  }`}
                >
                  {/* Order Header */}
                  <div className="p-4 bg-gray-50 border-b flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {isResale ? (
                        <TrendingUp className="w-5 h-5 text-[#c4886a]" />
                      ) : (
                        <ShoppingBag className="w-5 h-5 text-blue-500" />
                      )}
                      <div>
                        <p className="font-bold text-gray-800">
                          {order.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Type Badge */}
                      {typeBadge && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${typeBadge.bgColor} ${typeBadge.color}`}
                        >
                          {typeBadge.label}
                        </span>
                      )}

                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusConfig.bgColor} ${statusConfig.color}`}
                      >
                        {statusConfig.icon}
                        {t(`dashboard.status.${order.status}`)}
                      </span>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="p-4">
                    {/* Items Summary */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>
                          {t("dashboard.orders.itemsCount", {
                            count: order.itemsCount || order.items?.length || 0,
                          })}
                        </span>
                        <span className="font-medium">
                          {t("dashboard.orders.subtotal")}:{" "}
                          {formatCurrency(order.subtotal || order.total)}
                        </span>
                      </div>

                      {/* Show items if available */}
                      {order.items && order.items.length > 0 && (
                        <div className="space-y-2">
                          {order.items.slice(0, 3).map((item) => (
                            <div
                              key={item.id}
                              className={`flex items-center justify-between py-2 border-b border-gray-100 last:border-0 ${
                                item.isResale ? "bg-[#c4886a] rounded-lg px-2" : ""
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.productName}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="text-gray-800 font-medium">
                                      {item.productName}
                                    </p>
                                    {/* Item type badge for mixed orders */}
                                    {order.type === "mixed" && (
                                      <span
                                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                                          item.isResale
                                            ? "bg-[#c4886a] text-[#8a5a3a]"
                                            : "bg-blue-100 text-blue-700"
                                        }`}
                                      >
                                        {item.isResale
                                          ? t("dashboard.orders.investment")
                                          : t("dashboard.orders.directPurchase")}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-500">
                                    {t("dashboard.orders.qty")}: {item.quantity}{" "}
                                    × {formatCurrency(item.price)}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="font-medium">
                                  {formatCurrency(item.totalPrice || item.price * item.quantity)}
                                </p>
                                {item.isResale && item.resale && (
                                  <p className="text-sm text-[#c4886a]">
                                    +{item.resale.profitPercentage}%{" "}
                                    {t("dashboard.orders.profit")}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                          {order.items.length > 3 && (
                            <p className="text-sm text-gray-500 text-center">
                              +{order.items.length - 3}{" "}
                              {t("dashboard.orders.moreItems")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Investment Details - Show for orders with resale items */}
                    {isResale && order.resale && order.resale.expectedReturn > 0 && (
                      <div className="mt-4 p-4 bg-[#c4886a] rounded-lg border border-[#c4886a]">
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp className="w-5 h-5 text-[#c4886a]" />
                          <span className="font-bold text-[#6a4a2a]">
                            {t("dashboard.orders.investmentDetails")}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">
                              {t("dashboard.orders.invested")}
                            </p>
                            <p className="font-bold text-gray-800">
                              {/* For mixed orders, only count resale items */}
                              {formatCurrency(
                                order.type === "mixed" && order.items
                                  ? order.items
                                      .filter((item) => item.isResale)
                                      .reduce((sum, item) => sum + (item.totalPrice || item.price * item.quantity), 0)
                                  : order.totalAmount || order.finalTotal
                              )}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              {t("dashboard.orders.expectedReturn")}
                            </p>
                            <p className="font-bold text-green-600">
                              {formatCurrency(order.resale.expectedReturn)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              {t("dashboard.orders.profit")}
                            </p>
                            <p className="font-bold text-[#c4886a]">
                              +{formatCurrency(order.resale.profitAmount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              {t("dashboard.orders.maturityDate")}
                            </p>
                            <p className="font-bold text-gray-800">
                              {order.resale.returnDate
                                ? new Date(
                                    order.resale.returnDate
                                  ).toLocaleDateString(
                                    isRTL ? "ar-SA" : "en-US"
                                  )
                                : "-"}
                            </p>
                          </div>
                        </div>

                        {/* Days Remaining */}
                        {!order.resale.returned && order.resale.returnDate && (
                          <div className="mt-4 pt-4 border-t border-[#c4886a]">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-[#c4886a]" />
                                <span className="text-sm text-gray-600">
                                  {t("dashboard.orders.daysRemaining")}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="bg-[#c4886a] text-white px-3 py-1 rounded-lg font-bold">
                                  {daysRemaining}{" "}
                                  {t("dashboard.orders.days")}
                                </div>
                                {daysRemaining <= 7 && (
                                  <AlertCircle className="w-4 h-4 text-[#c4886a]" />
                                )}
                              </div>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>{t("dashboard.orders.progress")}</span>
                                <span>
                                  {order.resale.returned ? "100%" : `${Math.max(0, Math.min(100, 100 - (daysRemaining / 30) * 100)).toFixed(0)}%`}
                                </span>
                              </div>
                              <div className="w-full bg-[#c4886a40] rounded-full h-2">
                                <motion.div
                                  className="bg-[#c4886a] h-2 rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: order.resale.returned
                                      ? "100%"
                                      : `${Math.max(0, Math.min(100, 100 - (daysRemaining / 30) * 100))}%`,
                                  }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Returned Status */}
                        {order.resale.returned && (
                          <div className="mt-4 pt-4 border-t border-[#c4886a]">
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-5 h-5" />
                              <span className="font-bold">
                                {t("dashboard.orders.investmentCompleted")}
                              </span>
                              {order.resale.returnedAt && (
                                <span className="text-sm text-gray-500">
                                  ({formatDate(order.resale.returnedAt)})
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Shipping Info for Sale Orders */}
                    {order.type === "sale" && order.shipping?.city && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="w-5 h-5 text-blue-600" />
                          <span className="font-bold text-blue-800">
                            {t("dashboard.orders.shippingInfo")}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {order.shipping.name && <span>{order.shipping.name}, </span>}
                          {order.shipping.city}
                          {order.shipping.address && ` - ${order.shipping.address}`}
                        </p>
                        {order.shipping.phone && (
                          <p className="text-sm text-gray-600 mt-1">
                            {t("dashboard.orders.phone")}: {order.shipping.phone}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Order Total & Actions */}
                      <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            {t("dashboard.orders.total")}
                          </p>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(order.totalAmount || order.finalTotal)}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {/* View Details button */}
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            {t("dashboard.orders.viewDetails")}
                          </button>

                          {/* Approve button for pending sale/wallet items */}
                          {isAdmin && 
                           order.status === "pending" && 
                           (order.type === "sale" || (order.type === "mixed" && order.items?.some(item => !item.isResale))) && (
                            <button
                              onClick={() => handleApproveOrder(order.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              {t("dashboard.orders.approve") || "Approve"}
                            </button>
                          )}

                          {/* Cancel button */}
                          {canCancel && (
                            <button
                              onClick={() => handleCancelOrder(order.id)}
                              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <Ban className="w-4 h-4" />
                              {t("dashboard.orders.cancel")}
                            </button>
                          )}
                        </div>
                      </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || loading}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          <div className="flex gap-1">
            {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === 1 ||
                  page === pagination.last_page ||
                  Math.abs(page - currentPage) <= 1
              )
              .map((page, idx, arr) => {
                const showEllipsis = idx > 0 && page - arr[idx - 1] > 1;
                return (
                  <div key={page} className="flex items-center gap-1">
                    {showEllipsis && (
                      <span className="px-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => setCurrentPage(page)}
                      disabled={loading}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === page
                          ? "bg-primary text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {page}
                    </button>
                  </div>
                );
              })}
          </div>

          <button
            onClick={() =>
              setCurrentPage((p) => Math.min(pagination.last_page, p + 1))
            }
            disabled={currentPage === pagination.last_page || loading}
            className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {showOrderDetail && selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowOrderDetail(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b sticky top-0 bg-white rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">
                    {t("dashboard.orders.orderDetails")}
                  </h3>
                  <button
                    onClick={() => setShowOrderDetail(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-gray-500" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Order Info */}
                <div className="mb-6">
                  <p className="text-lg font-bold text-gray-800">
                    {selectedOrder.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h4 className="font-bold text-gray-800 mb-3">
                    {t("dashboard.orders.items")}
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.productName}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">
                            {item.productName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.quantity} × {formatCurrency(item.price)}
                          </p>
                          {item.isResale && item.resale && (
                            <p className="text-sm text-[#c4886a]">
                              {t("dashboard.orders.investmentReturn")}:{" "}
                              {formatCurrency(item.resale.expectedReturn)} (+
                              {item.resale.profitPercentage}%)
                            </p>
                          )}
                        </div>
                        <p className="font-bold text-gray-800">
                          {formatCurrency(item.totalPrice || item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>{t("dashboard.orders.total")}</span>
                    <span className="text-primary">
                      {formatCurrency(selectedOrder.totalAmount || selectedOrder.finalTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrdersTab;
