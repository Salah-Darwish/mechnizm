import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Package,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getUserInvestments,
  type UserInvestment,
  type InvestmentSummary,
} from "../../services/userInvestmentService";

type StatusFilter = "all" | "active" | "matured" | "paid_out";

const MyInvestmentsTab = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [investments, setInvestments] = useState<UserInvestment[]>([]);
  const [summary, setSummary] = useState<InvestmentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchInvestments = async (page: number = 1, status: StatusFilter = "all") => {
    setLoading(true);
    try {
      const response = await getUserInvestments(page, 15, status);
      if (response.data) {
        setInvestments(response.data.investments);
        setSummary(response.data.summary);
        setCurrentPage(response.data.pagination.current_page);
        setTotalPages(response.data.pagination.last_page);
      }
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || t("dashboard.investments.fetchError") || "Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments(1, statusFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handlePageChange = (page: number) => {
    fetchInvestments(page, statusFilter);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "matured":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "paid_out":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "matured":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "paid_out":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{summary.active_count}</span>
            </div>
            <p className="text-sm opacity-90">{t("dashboard.investments.activeCount")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{summary.matured_count}</span>
            </div>
            <p className="text-sm opacity-90">{t("dashboard.investments.maturedCount")}</p>
            {summary.pending_payout > 0 && (
              <p className="text-xs mt-2 bg-white/20 rounded px-2 py-1">
                {t("dashboard.investments.pendingAmount")}: {summary.pending_payout.toFixed(0)} {t("cart.riyal")}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">{summary.paid_out_count}</span>
            </div>
            <p className="text-sm opacity-90">{t("dashboard.investments.paidOutCount")}</p>
            {summary.total_paid_out > 0 && (
              <p className="text-xs mt-2 bg-white/20 rounded px-2 py-1">
                {t("dashboard.investments.totalPaidOut")}: {summary.total_paid_out.toFixed(0)} {t("cart.riyal")}
              </p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 opacity-80" />
              <span className="text-3xl font-bold">
                {summary.total_profit > 0 ? `+${summary.total_profit.toFixed(0)}` : "0"}
              </span>
            </div>
            <p className="text-sm opacity-90">{t("dashboard.investments.totalProfit")}</p>
            <p className="text-xs mt-2 bg-white/20 rounded px-2 py-1">
              {t("dashboard.investments.invested")}: {summary.total_invested.toFixed(0)} {t("cart.riyal")}
            </p>
          </motion.div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          {(["all", "active", "matured", "paid_out"] as StatusFilter[]).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                statusFilter === status
                  ? "bg-[#c4886a] text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t(`dashboard.investments.filter.${status}`)}
            </button>
          ))}

          <button
            onClick={() => fetchInvestments(currentPage, statusFilter)}
            className="mr-auto px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {t("dashboard.investments.refresh")}
          </button>
        </div>
      </div>

      {/* Investments List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-12 h-12 text-[#c4886a] animate-spin" />
        </div>
      ) : investments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-16 bg-white rounded-xl shadow-md"
        >
          <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-600 text-lg">{t("dashboard.investments.noInvestments")}</p>
          <p className="text-gray-500 text-sm mt-2">{t("dashboard.investments.startInvesting")}</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {investments.map((investment, index) => (
            <motion.div
              key={investment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Product Info */}
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    {getStatusIcon(investment.status)}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-800">
                        {isArabic ? investment.product.title_ar : investment.product.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {t("dashboard.investments.order")}: {investment.order.order_number}
                      </p>
                    </div>
                    <div
                      className={`px-3 py-1 rounded-lg border text-xs font-semibold ${getStatusColor(
                        investment.status
                      )}`}
                    >
                      {investment.status_display}
                    </div>
                  </div>

                  {/* Investment Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">{t("dashboard.investments.invested")}</p>
                      <p className="font-bold text-gray-800">
                        {investment.invested_amount.toFixed(0)} {t("cart.riyal")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t("dashboard.investments.expectedReturn")}</p>
                      <p className="font-bold text-green-600">
                        {investment.expected_return.toFixed(0)} {t("cart.riyal")}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t("dashboard.investments.profit")}</p>
                      <p className="font-bold text-green-600">
                        +{investment.profit_amount.toFixed(0)} {t("cart.riyal")} ({investment.profit_percentage}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">{t("dashboard.investments.duration")}</p>
                      <p className="font-bold text-gray-800">
                        {investment.plan_months} {t("dashboard.investments.months")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="lg:w-72 border-t lg:border-t-0 lg:border-r pt-4 lg:pt-0 lg:pr-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{t("dashboard.investments.started")}:</span>
                      <span className="font-semibold">{formatDate(investment.investment_date)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{t("dashboard.investments.maturity")}:</span>
                      <span className="font-semibold">{formatDate(investment.maturity_date)}</span>
                    </div>

                    {investment.status === "active" && !investment.has_matured && (
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Clock className="w-4 h-4" />
                        <span className="font-semibold">
                          {investment.days_until_maturity} {t("dashboard.investments.daysRemaining")}
                        </span>
                      </div>
                    )}

                    {investment.status === "matured" && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-yellow-800 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-semibold">{t("dashboard.investments.waitingPayout")}</span>
                        </div>
                        <p className="text-xs text-yellow-700 mt-1">
                          {t("dashboard.investments.payoutMessage")}
                        </p>
                      </div>
                    )}

                    {investment.status === "paid_out" && investment.paid_out_at && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-green-800 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-semibold">{t("dashboard.investments.paidOut")}</span>
                        </div>
                        <p className="text-xs text-green-700 mt-1">
                          {formatDate(investment.paid_out_at)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                currentPage === page
                  ? "bg-[#c4886a] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyInvestmentsTab;
