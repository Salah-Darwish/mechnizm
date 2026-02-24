import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  CheckCircle,
  XCircle,
  Percent,
  Loader2,
  Calendar,
  Hash,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getDiscountCodes,
  createDiscountCode,
  updateDiscountCode,
  toggleDiscountCode,
  deleteDiscountCode,
  type DiscountCode,
} from "../../services/discountService";
import type { AxiosError } from "axios";

const DiscountCodesTab = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discount_percent: 10,
    is_active: true,
    valid_from: "",
    valid_until: "",
    usage_limit: "",
  });

  const fetchCodes = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getDiscountCodes({ page, per_page: 10 });
      setCodes(response.data.data);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل تحميل أكواد الخصم" : "Failed to load discount codes")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingCode(null);
    setFormData({
      code: "",
      discount_percent: 10,
      is_active: true,
      valid_from: "",
      valid_until: "",
      usage_limit: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (code: DiscountCode) => {
    setEditingCode(code);
    setFormData({
      code: code.code,
      discount_percent: code.discount_percent,
      is_active: code.is_active,
      valid_from: code.valid_from ? code.valid_from.split("T")[0] : "",
      valid_until: code.valid_until ? code.valid_until.split("T")[0] : "",
      usage_limit: code.usage_limit?.toString() || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error(isRTL ? "الرجاء إدخال كود الخصم" : "Please enter discount code");
      return;
    }
    
    if (formData.discount_percent < 1 || formData.discount_percent > 100) {
      toast.error(isRTL ? "نسبة الخصم يجب أن تكون بين 1 و 100" : "Discount percent must be between 1 and 100");
      return;
    }

    try {
      setSubmitting(true);
      
      const data = {
        code: formData.code.trim().toUpperCase(),
        discount_percent: formData.discount_percent,
        is_active: formData.is_active,
        valid_from: formData.valid_from || null,
        valid_until: formData.valid_until || null,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
      };

      if (editingCode) {
        await updateDiscountCode(editingCode.id, data);
        toast.success(isRTL ? "تم تحديث كود الخصم بنجاح" : "Discount code updated successfully");
      } else {
        await createDiscountCode(data);
        toast.success(isRTL ? "تم إنشاء كود الخصم بنجاح" : "Discount code created successfully");
      }
      
      setIsModalOpen(false);
      fetchCodes(currentPage);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل حفظ كود الخصم" : "Failed to save discount code")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (code: DiscountCode) => {
    try {
      await toggleDiscountCode(code.id);
      toast.success(
        code.is_active
          ? (isRTL ? "تم إلغاء تفعيل الكود" : "Code deactivated")
          : (isRTL ? "تم تفعيل الكود" : "Code activated")
      );
      fetchCodes(currentPage);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل تحديث الحالة" : "Failed to update status")
      );
    }
  };

  const handleDelete = async (code: DiscountCode) => {
    if (!confirm(isRTL ? `هل أنت متأكد من حذف كود "${code.code}"؟` : `Delete code "${code.code}"?`)) {
      return;
    }

    try {
      await deleteDiscountCode(code.id);
      toast.success(isRTL ? "تم حذف كود الخصم بنجاح" : "Discount code deleted successfully");
      fetchCodes(currentPage);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل حذف كود الخصم" : "Failed to delete discount code")
      );
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString(isRTL ? "ar-SA" : "en-US");
  };

  if (loading && codes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#384B70]" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? "text-right" : "text-left"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-[#384B70]">
          {t("dashboard.discountCodes.title")}
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#c4886a] text-white rounded-lg hover:bg-[#b47858] transition-colors"
        >
          <Plus className="w-5 h-5" />
          {t("dashboard.discountCodes.add")}
        </motion.button>
      </div>

      {/* Codes Table */}
      {codes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Percent className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {t("dashboard.discountCodes.noCodes")}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-gray-700 font-semibold">{t("dashboard.discountCodes.code")}</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">{t("dashboard.discountCodes.percent")}</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">{t("dashboard.discountCodes.status")}</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">{t("dashboard.discountCodes.validFrom")}</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">{t("dashboard.discountCodes.validUntil")}</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">{t("dashboard.discountCodes.usage")}</th>
                  <th className="px-4 py-3 text-gray-700 font-semibold">{t("dashboard.discountCodes.actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {codes.map((code) => (
                  <motion.tr
                    key={code.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4">
                      <span className="font-mono font-bold text-[#384B70] bg-gray-100 px-2 py-1 rounded">
                        {code.code}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-[#c4886a] font-bold">{code.discount_percent}%</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleToggle(code)}
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          code.is_active
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {code.is_active ? (
                          <><CheckCircle className="w-4 h-4" /> {t("dashboard.discountCodes.active")}</>
                        ) : (
                          <><XCircle className="w-4 h-4" /> {t("dashboard.discountCodes.inactive")}</>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600">
                      {formatDate(code.valid_from)}
                    </td>
                    <td className="px-4 py-4 text-center text-gray-600">
                      {formatDate(code.valid_until)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="text-gray-700">
                        {code.times_used}
                        {code.usage_limit && ` / ${code.usage_limit}`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(code)}
                          className="p-2 text-gray-500 hover:text-[#384B70] hover:bg-gray-100 rounded-lg transition-colors"
                          title={isRTL ? "تعديل" : "Edit"}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(code)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title={isRTL ? "حذف" : "Delete"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-100">
              <button
                onClick={() => fetchCodes(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
              <span className="text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => fetchCodes(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-[#384B70]">
                  {editingCode
                    ? t("dashboard.discountCodes.edit")
                    : t("dashboard.discountCodes.add")}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t("dashboard.discountCodes.code")} *
                  </label>
                  <div className="relative">
                    <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      placeholder="DISCOUNT20"
                      className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-gray-200 focus:border-[#c4886a] focus:outline-none font-mono uppercase"
                      required
                    />
                  </div>
                </div>

                {/* Discount Percent */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t("dashboard.discountCodes.percent")} *
                  </label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.discount_percent}
                      onChange={(e) => setFormData({ ...formData, discount_percent: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-gray-200 focus:border-[#c4886a] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Valid From */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t("dashboard.discountCodes.validFrom")}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.valid_from}
                      onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                      className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-gray-200 focus:border-[#c4886a] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Valid Until */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t("dashboard.discountCodes.validUntil")}
                  </label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={formData.valid_until}
                      onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                      className="w-full px-4 py-3 pr-10 rounded-lg border-2 border-gray-200 focus:border-[#c4886a] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Usage Limit */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">
                    {t("dashboard.discountCodes.usageLimit")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.usage_limit}
                    onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                    placeholder={isRTL ? "غير محدود" : "Unlimited"}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#c4886a] focus:outline-none"
                  />
                </div>

                {/* Is Active */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-[#c4886a] border-gray-300 rounded focus:ring-[#c4886a]"
                  />
                  <label htmlFor="is_active" className="text-gray-700 font-medium">
                    {t("dashboard.discountCodes.isActive")}
                  </label>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50"
                  >
                    {t("dashboard.discountCodes.cancel")}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: submitting ? 1 : 1.02 }}
                    whileTap={{ scale: submitting ? 1 : 0.98 }}
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-[#c4886a] text-white rounded-lg font-bold hover:bg-[#b47858] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    {t("dashboard.discountCodes.save")}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DiscountCodesTab;
