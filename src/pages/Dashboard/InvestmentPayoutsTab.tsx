import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  DollarSign,
  CheckCircle,
  Clock,
  TrendingUp,
  Package,
  Calendar,
  AlertCircle,
  History,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  investmentPayoutService,
  type PayoutItem,
  type PayoutSummary,
  type Pagination,
} from "../../services/investmentPayoutService";

type ViewMode = "pending" | "history";

const InvestmentPayoutsTab = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [viewMode, setViewMode] = useState<ViewMode>("pending");
  const [payouts, setPayouts] = useState<PayoutItem[]>([]);
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingPaid, setMarkingPaid] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<PayoutItem | null>(null);

  const fetchPayouts = async (page: number = 1) => {
    try {
      setLoading(true);
      if (viewMode === "pending") {
        const [payoutsResponse, summaryResponse] = await Promise.all([
          investmentPayoutService.getPendingPayouts(page),
          investmentPayoutService.getSummary(),
        ]);
        setPayouts(payoutsResponse.data.payouts);
        setPagination(payoutsResponse.data.pagination);
        setSummary(summaryResponse.data);
      } else {
        const response = await investmentPayoutService.getPaidHistory(page);
        setPayouts(response.data.payouts);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast.error(t("dashboard.payouts.loadError"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  const handleMarkAsPaid = async (payout: PayoutItem) => {
    setConfirmModal(payout);
  };

  const confirmMarkAsPaid = async () => {
    if (!confirmModal) return;

    try {
      setMarkingPaid(confirmModal.id);
      await investmentPayoutService.markAsPaid(confirmModal.id);
      toast.success(t("dashboard.payouts.markedAsPaid"));
      setConfirmModal(null);
      fetchPayouts(pagination?.current_page || 1);
    } catch (error) {
      console.error("Error marking as paid:", error);
      toast.error(t("dashboard.payouts.markError"));
    } finally {
      setMarkingPaid(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(isArabic ? "ar-SA" : "en-SA", {
      style: "currency",
      currency: "SAR",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getProductTitle = (product: PayoutItem["product"]) => {
    if (!product) return "-";
    return isArabic && product.title_ar ? product.title_ar : product.title || "-";
  };

  return (
    <div className="space-y-6 min-h-screen" dir={isArabic ? "rtl" : "ltr"}>
      {/* Summary Cards */}
      {summary && viewMode === "pending" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={isArabic ? "text-right" : "text-left"}>
                <p className="text-sm opacity-90 mb-1">{t("dashboard.payouts.pendingCount")}</p>
                <p className="text-3xl font-bold">{summary.pending_count}</p>
              </div>
              <Clock className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-[#c4886a] to-[#b47858] rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={isArabic ? "text-right" : "text-left"}>
                <p className="text-sm opacity-90 mb-1">{t("dashboard.payouts.pendingTotal")}</p>
                <p className="text-2xl font-bold">{summary.pending_total_return.toFixed(0)} {isArabic ? "ر.س" : "SAR"}</p>
              </div>
              <DollarSign className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={isArabic ? "text-right" : "text-left"}>
                <p className="text-sm opacity-90 mb-1">{t("dashboard.payouts.paidCount")}</p>
                <p className="text-3xl font-bold">{summary.paid_count}</p>
              </div>
              <CheckCircle className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={isArabic ? "text-right" : "text-left"}>
                <p className="text-sm opacity-90 mb-1">{t("dashboard.payouts.activeInvestments")}</p>
                <p className="text-3xl font-bold">{summary.active_count}</p>
              </div>
              <TrendingUp className="w-10 h-10 opacity-80" />
            </div>
          </motion.div>
        </div>
      )}

      {/* View Mode Toggle */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setViewMode("pending")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            viewMode === "pending"
              ? "bg-amber-500 text-white shadow-lg scale-105"
              : "bg-white white:bg-gray-800 text-gray-700 white:text-gray-300 hover:bg-gray-50 white:hover:bg-gray-700 shadow-md"
          }`}
        >
          <Clock className="w-5 h-5" />
          {t("dashboard.payouts.pendingTab")}
        </button>
        <button
          onClick={() => setViewMode("history")}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
            viewMode === "history"
              ? "bg-green-500 text-white shadow-lg scale-105"
              : "bg-white white:bg-gray-800 text-gray-700 white:text-gray-300 hover:bg-gray-50 white:hover:bg-gray-700 shadow-md"
          }`}
        >
          <History className="w-5 h-5" />
          {t("dashboard.payouts.historyTab")}
        </button>
      </div>

      {/* Payouts Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : payouts.length === 0 ? (
        <div className="bg-white white:bg-gray-900 rounded-xl p-12 text-center shadow-lg border border-gray-100 white:border-gray-800">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 white:text-gray-400">
            {viewMode === "pending"
              ? t("dashboard.payouts.noPending")
              : t("dashboard.payouts.noHistory")}
          </p>
        </div>
      ) : (
        <div className="bg-white white:bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-100 white:border-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 white:from-gray-800 white:to-gray-900">
                <tr>
                  <th className={`px-6 py-4 ${isArabic ? "text-right" : "text-left"} text-xs font-bold uppercase tracking-wider text-gray-700 white:text-gray-200`}>
                    {t("dashboard.payouts.investor")}
                  </th>
                  <th className={`px-6 py-4 ${isArabic ? "text-right" : "text-left"} text-xs font-bold uppercase tracking-wider text-gray-700 white:text-gray-200`}>
                    {t("dashboard.payouts.product")}
                  </th>
                  <th className={`px-6 py-4 ${isArabic ? "text-right" : "text-left"} text-xs font-bold uppercase tracking-wider text-gray-700 white:text-gray-200`}>
                    {t("dashboard.payouts.invested")}
                  </th>
                  <th className={`px-6 py-4 ${isArabic ? "text-right" : "text-left"} text-xs font-bold uppercase tracking-wider text-gray-700 white:text-gray-200`}>
                    {t("dashboard.payouts.return")}
                  </th>
                  <th className={`px-6 py-4 ${isArabic ? "text-right" : "text-left"} text-xs font-bold uppercase tracking-wider text-gray-700 white:text-gray-200`}>
                    {t("dashboard.payouts.profit")}
                  </th>
                  <th className={`px-6 py-4 ${isArabic ? "text-right" : "text-left"} text-xs font-bold uppercase tracking-wider text-gray-700 white:text-gray-200`}>
                    {t("dashboard.payouts.maturityDate")}
                  </th>
                  {viewMode === "history" && (
                    <th className={`px-6 py-4 ${isArabic ? "text-right" : "text-left"} text-xs font-bold uppercase tracking-wider text-gray-700 white:text-gray-200`}>
                      {t("dashboard.payouts.paidOn")}
                    </th>
                  )}
                  {viewMode === "pending" && (
                    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider text-gray-700 white:text-gray-200">
                      {t("dashboard.payouts.actions")}
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 white:divide-gray-700">
                {payouts.map((payout) => (
                  <motion.tr
                    key={payout.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 white:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3a4b95] to-[#2a3870] flex items-center justify-center text-white font-bold">
                          {payout.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 white:text-white">
                            {payout.user.name}
                          </p>
                          <p className="text-xs text-gray-500 white:text-gray-400">{payout.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#c4886a]" />
                        <span className="font-medium text-gray-700 white:text-gray-300">
                          {getProductTitle(payout.product)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900 white:text-white">
                        {payout.invested_amount.toFixed(0)} {isArabic ? "ر.س" : "SAR"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-green-600 white:text-green-400">
                        {payout.expected_return.toFixed(0)} {isArabic ? "ر.س" : "SAR"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 bg-green-50 white:bg-green-900/20 px-3 py-1 rounded-lg">
                          <TrendingUp className="w-4 h-4 text-green-600 white:text-green-400" />
                          <span className="font-semibold text-green-700 white:text-green-300">
                            +{payout.profit_amount.toFixed(0)}
                          </span>
                          <span className="text-xs text-green-600 white:text-green-400">
                            ({payout.profit_percentage}%)
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-700 white:text-gray-300">
                            {formatDate(payout.maturity_date)}
                          </span>
                        </div>
                        {viewMode === "pending" && payout.days_since_matured && payout.days_since_matured > 0 && (
                          <span className="text-xs font-semibold text-amber-600 bg-amber-100 white:bg-amber-900/30 px-2 py-1 rounded inline-block w-fit">
                            {payout.days_since_matured} {t("dashboard.payouts.daysAgo")}
                          </span>
                        )}
                      </div>
                    </td>
                    {viewMode === "history" && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="font-medium text-gray-700 white:text-gray-300">
                              {payout.paid_out_at ? formatDate(payout.paid_out_at.split(" ")[0]) : "-"}
                            </span>
                          </div>
                          {payout.paid_by && (
                            <span className="text-xs text-gray-500 white:text-gray-400">
                              {t("dashboard.payouts.by")} {payout.paid_by.name}
                            </span>
                          )}
                        </div>
                      </td>
                    )}
                    {viewMode === "pending" && (
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleMarkAsPaid(payout)}
                            disabled={markingPaid === payout.id}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {markingPaid === payout.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                            {t("dashboard.payouts.markPaid")}
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination && pagination.last_page > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 white:border-gray-800 bg-gray-50 white:bg-gray-900">
              <p className="text-sm text-gray-600 white:text-gray-400">
                {t("dashboard.payouts.showing")} <span className="font-semibold">{payouts.length}</span> {t("dashboard.payouts.of")}{" "}
                <span className="font-semibold">{pagination.total}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchPayouts(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="p-2 rounded-lg bg-white white:bg-gray-800 border border-gray-200 white:border-gray-700 hover:bg-gray-50 white:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isArabic ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
                <span className="flex items-center px-4 py-2 text-sm font-semibold text-gray-700 white:text-gray-300 bg-white white:bg-gray-800 border border-gray-200 white:border-gray-700 rounded-lg">
                  {pagination.current_page} / {pagination.last_page}
                </span>
                <button
                  onClick={() => fetchPayouts(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.last_page}
                  className="p-2 rounded-lg bg-white white:bg-gray-800 border border-gray-200 white:border-gray-700 hover:bg-gray-50 white:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isArabic ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setConfirmModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white white:bg-gray-900 rounded-xl p-6 max-w-md w-full border border-gray-100 white:border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 white:text-white">
                  {t("dashboard.payouts.confirmTitle")}
                </h3>
                <button
                  onClick={() => setConfirmModal(null)}
                  className="p-2 hover:bg-gray-100 white:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 white:text-gray-400">
                  {t("dashboard.payouts.confirmMessage")}
                </p>

                <div className="bg-gray-50 white:bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("dashboard.payouts.investor")}:</span>
                    <span className="font-medium text-gray-900 white:text-white">
                      {confirmModal.user.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("dashboard.payouts.product")}:</span>
                    <span className="font-medium text-gray-900 white:text-white">
                      {getProductTitle(confirmModal.product)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("dashboard.payouts.amountToPay")}:</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(confirmModal.expected_return)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setConfirmModal(null)}
                    className="flex-1 px-4 py-2 border border-gray-300 white:border-gray-700 rounded-lg text-gray-700 white:text-gray-300 hover:bg-gray-50 white:hover:bg-gray-800"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={confirmMarkAsPaid}
                    disabled={markingPaid === confirmModal.id}
                    className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {markingPaid === confirmModal.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    {t("dashboard.payouts.confirmPaid")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvestmentPayoutsTab;
