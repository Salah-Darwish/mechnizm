import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  RefreshCw,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchReports,
  exportReports,
  type ReportsData,
  type ChartDataPoint,
} from "../../services/reportService";

const ReportsTab = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  // State
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("month");
  const [selectedChart, setSelectedChart] = useState<"revenue" | "orders">("revenue");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<ReportsData | null>(null);

  // Fetch reports data
  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchReports(dateRange);
      setReportData(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load reports";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  // Load reports on mount and when date range changes
  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Handle export
  const handleExport = async () => {
    setExporting(true);
    try {
      const data = await exportReports(dateRange, "json");
      
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `makanizm-reports-${dateRange}-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(t("dashboard.reports.exportSuccess") || "Reports exported successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to export reports";
      toast.error(message);
    } finally {
      setExporting(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `${t("common.currency")} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Get chart label based on language
  const getChartLabel = (item: ChartDataPoint) => {
    return isRTL ? item.label_ar : item.label;
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      processing: "#6366f1",
      shipped: "#8b5cf6",
      delivered: "#22c55e",
      completed: "#10b981",
      cancelled: "#ef4444",
    };
    return colors[status] || "#6b7280";
  };

  // Loading state
  if (loading && !reportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{t("dashboard.reports.loading") || "Loading reports..."}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !reportData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-700 font-semibold mb-2">{t("dashboard.reports.loadError") || "Failed to load reports"}</p>
        <p className="text-red-600 text-sm mb-4">{error}</p>
        <button
          onClick={loadReports}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t("dashboard.reports.retry") || "Try Again"}
        </button>
      </div>
    );
  }

  // Default empty data
  const overview = reportData?.overview || {
    total_revenue: 0,
    current_period_revenue: 0,
    previous_period_revenue: 0,
    revenue_growth: 0,
    total_orders: 0,
    current_period_orders: 0,
    previous_period_orders: 0,
    orders_growth: 0,
    avg_order_value: 0,
    current_avg_order_value: 0,
    avg_order_growth: 0,
    total_products: 0,
    active_products: 0,
    total_profit: 0,
    completed_revenue: 0,
  };

  const chartData = reportData?.chart_data || [];
  const orderStatus = reportData?.order_status || { total: 0, distribution: [] };
  const orderTypes = reportData?.order_types || {
    sale: { count: 0, percentage: 0, revenue: 0, revenue_percentage: 0 },
    resale: { count: 0, percentage: 0, revenue: 0, revenue_percentage: 0, profit: 0, pending_returns: 0, completed_returns: 0 },
    total_revenue: 0,
  };
  const topProducts = reportData?.top_products || [];
  const recentActivity = reportData?.recent_activity || [];

  // Calculate max values for chart
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 1);
  const maxOrders = Math.max(...chartData.map((d) => d.orders), 1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {t("dashboard.reports.title")}
          </h2>
          {reportData?.generated_at && (
            <p className="text-sm text-gray-500 mt-1">
              {t("dashboard.reports.lastUpdated") || "Last updated"}: {new Date(reportData.generated_at).toLocaleString(isRTL ? "ar-SA" : "en-US")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Date Range Filter */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm">
            {(["week", "month", "year"] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                disabled={loading}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-50 ${
                  dateRange === range
                    ? "bg-[#3a4b95] text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {t(`dashboard.reports.${range}`)}
              </button>
            ))}
          </div>
          
          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={loadReports}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </motion.button>
          
          {/* Export Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleExport}
            disabled={exporting || loading}
            className="flex items-center gap-2 px-4 py-2 bg-[#c4886a] text-white rounded-lg hover:bg-[#b47858] transition-all disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${exporting ? "animate-pulse" : ""}`} />
            {t("dashboard.reports.export")}
          </motion.button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                overview.revenue_growth >= 0 ? "text-green-200" : "text-red-200"
              }`}
            >
              {overview.revenue_growth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(overview.revenue_growth).toFixed(1)}%
            </div>
          </div>
          <p className="text-blue-100 text-sm mb-1">
            {t("dashboard.reports.totalRevenue")}
          </p>
          <p className="text-3xl font-bold">
            {formatCurrency(overview.total_revenue)}
          </p>
        </motion.div>

        {/* Total Orders */}
        <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                overview.orders_growth >= 0 ? "text-green-200" : "text-red-200"
              }`}
            >
              {overview.orders_growth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(overview.orders_growth).toFixed(1)}%
            </div>
          </div>
          <p className="text-green-100 text-sm mb-1">
            {t("dashboard.reports.totalOrders")}
          </p>
          <p className="text-3xl font-bold">{overview.total_orders}</p>
        </motion.div>

        {/* Average Order Value */}
        <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div
              className={`flex items-center gap-1 text-sm ${
                overview.avg_order_growth >= 0 ? "text-green-200" : "text-red-200"
              }`}
            >
              {overview.avg_order_growth >= 0 ? (
                <ArrowUpRight className="w-4 h-4" />
              ) : (
                <ArrowDownRight className="w-4 h-4" />
              )}
              {Math.abs(overview.avg_order_growth).toFixed(1)}%
            </div>
          </div>
          <p className="text-purple-100 text-sm mb-1">
            {t("dashboard.reports.avgOrderValue")}
          </p>
          <p className="text-3xl font-bold">
            {formatCurrency(overview.avg_order_value)}
          </p>
        </motion.div>

        {/* Active Products */}
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-gradient-to-br from-[#c4886a] to-[#b47858] rounded-xl p-5 text-white"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6" />
            </div>
          </div>
          <p className="text-white text-sm mb-1">
            {t("dashboard.reports.activeProducts")}
          </p>
          <p className="text-3xl font-bold">
            {overview.active_products}/{overview.total_products}
          </p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue/Orders Chart */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">
                {t("dashboard.reports.revenueChart")}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {(["revenue", "orders"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedChart(type)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    selectedChart === type
                      ? "bg-[#3a4b95] text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {t(`dashboard.reports.${type}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Bar Chart */}
          {chartData.length > 0 ? (
            <>
              <div className="flex items-end justify-between h-64 gap-2 px-2 overflow-x-auto">
                {chartData.slice(-14).map((data, index) => {
                  const value = selectedChart === "revenue" ? data.revenue : data.orders;
                  const maxValue = selectedChart === "revenue" ? maxRevenue : maxOrders;
                  const height = maxValue > 0 ? (value / maxValue) * 100 : 0;

                  return (
                    <div
                      key={index}
                      className="flex-1 min-w-[30px] flex flex-col items-center gap-2"
                      title={`${getChartLabel(data)}: ${selectedChart === "revenue" ? formatCurrency(value) : value}`}
                    >
                      <div className="w-full h-48 flex items-end">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${height}%` }}
                          transition={{ delay: index * 0.05, duration: 0.5 }}
                          className={`w-full rounded-t-lg cursor-pointer hover:opacity-80 ${
                            selectedChart === "revenue"
                              ? "bg-gradient-to-t from-blue-500 to-blue-400"
                              : "bg-gradient-to-t from-green-500 to-green-400"
                          }`}
                        />
                      </div>
                      <span className="text-xs text-gray-500 font-medium truncate max-w-full">
                        {getChartLabel(data)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full" />
                  <span className="text-sm text-gray-600">
                    {t("dashboard.reports.revenue")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-sm text-gray-600">
                    {t("dashboard.reports.orders")}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              {t("dashboard.reports.noData") || "No data available"}
            </div>
          )}
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div
          custom={5}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {t("dashboard.reports.orderStatus")}
            </h3>
          </div>

          {/* Pie Chart */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {orderStatus.distribution.reduce(
                (acc, item) => {
                  const strokeDasharray = orderStatus.total > 0 
                    ? (item.count / orderStatus.total) * 251 
                    : 0;
                  
                  acc.elements.push(
                    <circle
                      key={item.status}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={getStatusColor(item.status)}
                      strokeWidth="20"
                      strokeDasharray={`${strokeDasharray} 251`}
                      strokeDashoffset={`-${acc.offset}`}
                    />
                  );
                  acc.offset += strokeDasharray;
                  return acc;
                },
                { elements: [] as React.ReactNode[], offset: 0 }
              ).elements}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-800">
                  {orderStatus.total}
                </p>
                <p className="text-sm text-gray-500">
                  {t("dashboard.reports.orders")}
                </p>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {orderStatus.distribution
              .filter((item) => item.count > 0)
              .map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getStatusColor(item.status) }}
                    />
                    <span className="text-sm text-gray-600">
                      {t(`dashboard.status.${item.status}`)}
                    </span>
                  </div>
                  <span className="font-semibold text-sm">{item.count}</span>
                </div>
              ))}
          </div>
        </motion.div>
      </div>

      {/* Order Types & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Types */}
        <motion.div
          custom={6}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            {t("dashboard.reports.orderTypes") || "Order Types"}
          </h3>

          <div className="space-y-4">
            {/* Direct Purchase (Sale) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-blue-500" />
                  <span className="text-gray-600">
                    {t("dashboard.orders.directPurchase")}
                  </span>
                </div>
                <span className="font-semibold">
                  {formatCurrency(orderTypes.sale.revenue)} ({orderTypes.sale.count} {t("dashboard.reports.orders")})
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${orderTypes.sale.revenue_percentage}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-blue-500 rounded-full"
                />
              </div>
            </div>

            {/* Investment (Resale) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#c4886a]" />
                  <span className="text-gray-600">
                    {t("dashboard.orders.investment")}
                  </span>
                </div>
                <span className="font-semibold">
                  {formatCurrency(orderTypes.resale.revenue)} ({orderTypes.resale.count} {t("dashboard.reports.orders")})
                </span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${orderTypes.resale.revenue_percentage}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-[#c4886a] rounded-full"
                />
              </div>
            </div>

            {/* Resale Stats */}
            {orderTypes.resale.count > 0 && (
              <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-xs text-gray-500">{t("dashboard.reports.resaleProfit") || "Resale Profit"}</p>
                  <p className="text-lg font-bold text-green-600">
                    {formatCurrency(orderTypes.resale.profit)}
                  </p>
                </div>
                <div className="p-3 bg-[#c4886a20] rounded-lg">
                  <p className="text-xs text-gray-500">{t("dashboard.reports.pendingReturns") || "Pending Returns"}</p>
                  <p className="text-lg font-bold text-[#c4886a]">
                    {orderTypes.resale.pending_returns}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Summary */}
        <motion.div
          custom={7}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            {t("dashboard.reports.quickSummary")}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                {t("dashboard.reports.thisMonth")}
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatCurrency(overview.current_period_revenue)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                {t("dashboard.reports.lastMonth")}
              </p>
              <p className="text-2xl font-bold text-gray-600">
                {formatCurrency(overview.previous_period_revenue)}
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                {t("dashboard.reports.monthlyOrders")}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {overview.current_period_orders}
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">
                {t("dashboard.reports.growth")}
              </p>
              <p
                className={`text-2xl font-bold ${
                  overview.revenue_growth >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {overview.revenue_growth >= 0 ? "+" : ""}
                {overview.revenue_growth.toFixed(1)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Products & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <motion.div
          custom={8}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            {t("dashboard.reports.topProducts") || "Top Selling Products"}
          </h3>

          {topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {isRTL ? (product.title_ar || product.title) : (product.title_en || product.title)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {product.total_quantity_sold} {t("dashboard.reports.sold") || "sold"} • {product.order_count} {t("dashboard.reports.orders")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">
                      {formatCurrency(product.total_revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("dashboard.reports.noProducts") || "No products sold yet"}
            </div>
          )}
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          custom={9}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-6">
            {t("dashboard.reports.recentActivity") || "Recent Activity"}
          </h3>

          {recentActivity.length > 0 ? (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${getStatusColor(activity.status)}20` }}
                  >
                    {activity.type === "resale" ? (
                      <TrendingUp className="w-5 h-5" style={{ color: getStatusColor(activity.status) }} />
                    ) : (
                      <ShoppingCart className="w-5 h-5" style={{ color: getStatusColor(activity.status) }} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {activity.order_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      {activity.user_name} • {activity.created_at_human}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-800">
                      {formatCurrency(activity.total_amount)}
                    </p>
                    <span
                      className="text-xs px-2 py-1 rounded-full"
                      style={{
                        backgroundColor: `${getStatusColor(activity.status)}20`,
                        color: getStatusColor(activity.status),
                      }}
                    >
                      {t(`dashboard.status.${activity.status}`)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              {t("dashboard.reports.noActivity") || "No recent activity"}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ReportsTab;
