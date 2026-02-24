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
  Type,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAdminMarquees,
  createMarquee,
  updateMarquee as updateMarqueeApi,
  deleteMarquee as deleteMarqueeApi,
  toggleMarquee,
} from "../../services/marqueeService";
import type { Marquee } from "../../types/marquee";
import { useDispatch } from "react-redux";
import { setMarquees } from "../../store/slices/marqueeSlice";
import type { AppDispatch } from "../../store";
import type { AxiosError } from "axios";

const MarqueeTab = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [marquees, setLocalMarquees] = useState<Marquee[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newMarqueeTextAr, setNewMarqueeTextAr] = useState("");
  const [newMarqueeTextEn, setNewMarqueeTextEn] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTextAr, setEditTextAr] = useState("");
  const [editTextEn, setEditTextEn] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  const fetchMarquees = async () => {
    try {
      setLoading(true);
      const response = await getAdminMarquees();
      const apiList = response.data.marquees || [];
      // map API shape to app Marquee shape
      const list = apiList.map((m) => ({
        id: String(m.id),
        text_ar: m.text_ar,
        text_en: m.text_en,
        isActive: Boolean(m.is_active),
        createdAt: m.created_at,
        updatedAt: m.updated_at,
      }));

      setLocalMarquees(list);
      // update redux store so banner reflects changes immediately
      dispatch(setMarquees(list));
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل تحميل البيانات" : "Failed to load data")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarquees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddMarquee = async () => {
    if (!newMarqueeTextAr.trim() || !newMarqueeTextEn.trim()) {
      toast.error(isRTL ? "الرجاء إدخال النص بالعربية والإنجليزية" : "Please enter text in both Arabic and English");
      return;
    }

    try {
      setSubmitting(true);
      await createMarquee({ text_ar: newMarqueeTextAr.trim(), text_en: newMarqueeTextEn.trim() });
      setNewMarqueeTextAr("");
      setNewMarqueeTextEn("");
      setIsAdding(false);
      toast.success(
        isRTL ? "تم إضافة النص بنجاح" : "Marquee text added successfully"
      );
      fetchMarquees();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل الإضافة" : "Failed to add")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMarquee = async (id: string) => {
    if (!editTextAr.trim() || !editTextEn.trim()) {
      toast.error(isRTL ? "الرجاء إدخال النص بالعربية والإنجليزية" : "Please enter text in both Arabic and English");
      return;
    }

    try {
      setSubmitting(true);
      await updateMarqueeApi(Number(id), { text_ar: editTextAr.trim(), text_en: editTextEn.trim() });
      setEditingId(null);
      setEditTextAr("");
      setEditTextEn("");
      toast.success(
        isRTL ? "تم تحديث النص بنجاح" : "Marquee text updated successfully"
      );
      fetchMarquees();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل التحديث" : "Failed to update")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMarquee = async (id: string) => {
    if (marquees.length <= 1) {
      toast.error(
        isRTL
          ? "يجب أن يكون هناك نص واحد على الأقل"
          : "At least one marquee text is required"
      );
      return;
    }

    try {
      await deleteMarqueeApi(Number(id));
      toast.success(
        isRTL ? "تم حذف النص بنجاح" : "Marquee text deleted successfully"
      );
      fetchMarquees();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل الحذف" : "Failed to delete")
      );
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleMarquee(Number(id));
      toast.success(isRTL ? "تم تحديث حالة النص" : "Marquee status updated");
      fetchMarquees();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل التحديث" : "Failed to update")
      );
    }
  };

  const startEditing = (id: string, text_ar: string, text_en: string) => {
    setEditingId(id);
    setEditTextAr(text_ar);
    setEditTextEn(text_en);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTextAr("");
    setEditTextEn("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
            <Type className="w-5 h-5 text-gray-800" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isRTL ? "إدارة الشريط المتحرك" : "Manage Marquee Banner"}
            </h2>
            <p className="text-sm text-gray-600">
              {isRTL
                ? "إدارة النصوص التي تظهر في الشريط المتحرك أعلى الموقع"
                : "Manage the scrolling text banner at the top of the site"}
            </p>
          </div>
        </div>

        {!isAdding && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsAdding(true)}
            className="px-4 py-2 bg-yellow-400 text-gray-900 rounded-lg flex items-center gap-2 hover:bg-yellow-500 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{isRTL ? "إضافة نص جديد" : "Add New Text"}</span>
          </motion.button>
        )}
      </div>

      {/* Add New Marquee Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              {isRTL ? "إضافة نص جديد" : "Add New Marquee Text"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? "النص بالعربية" : "Arabic Text"}
                </label>
                <input
                  type="text"
                  value={newMarqueeTextAr}
                  onChange={(e) => setNewMarqueeTextAr(e.target.value)}
                  placeholder={isRTL ? "أدخل النص بالعربية..." : "Enter Arabic text..."}
                  dir="rtl"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {isRTL ? "النص بالإنجليزية" : "English Text"}
                </label>
                <input
                  type="text"
                  value={newMarqueeTextEn}
                  onChange={(e) => setNewMarqueeTextEn(e.target.value)}
                  placeholder={isRTL ? "أدخل النص بالإنجليزية..." : "Enter English text..."}
                  dir="ltr"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddMarquee}
                  disabled={submitting}
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isRTL ? "حفظ" : "Save"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setIsAdding(false);
                    setNewMarqueeTextAr("");
                    setNewMarqueeTextEn("");
                  }}
                  className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  {isRTL ? "إلغاء" : "Cancel"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Marquees List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
          </div>
        ) : marquees.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-12 text-center text-gray-500">
            <Type className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>{isRTL ? "لا توجد نصوص حتى الآن" : "No marquee texts yet"}</p>
          </div>
        ) : (
          marquees.map((marquee) => (
            <motion.div
              key={marquee.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6"
            >
              {editingId === marquee.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? "النص بالعربية" : "Arabic Text"}
                    </label>
                    <input
                      type="text"
                      value={editTextAr}
                      onChange={(e) => setEditTextAr(e.target.value)}
                      dir="rtl"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {isRTL ? "النص بالإنجليزية" : "English Text"}
                    </label>
                    <input
                      type="text"
                      value={editTextEn}
                      onChange={(e) => setEditTextEn(e.target.value)}
                      dir="ltr"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateMarquee(marquee.id)}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {isRTL ? "حفظ" : "Save"}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={cancelEditing}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      {isRTL ? "إلغاء" : "Cancel"}
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleToggleStatus(marquee.id)}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        marquee.isActive
                          ? "bg-green-100 text-green-600"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {marquee.isActive ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <XCircle className="w-6 h-6" />
                      )}
                    </motion.button>

                    <div className="flex-1">
                      <div className="flex flex-col gap-1">
                        <p className="text-lg font-medium text-gray-900" dir="rtl">
                          <span className="text-xs text-gray-500 ml-2">AR:</span>
                          {marquee.text_ar}
                        </p>
                        <p className="text-lg font-medium text-gray-900" dir="ltr">
                          <span className="text-xs text-gray-500 mr-2">EN:</span>
                          {marquee.text_en}
                        </p>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        {isRTL ? "آخر تحديث: " : "Last updated: "}
                        {new Date(marquee.updatedAt).toLocaleDateString(
                          isRTL ? "ar-EG" : "en-US"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startEditing(marquee.id, marquee.text_ar, marquee.text_en)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Edit2 className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteMarquee(marquee.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">
          {isRTL ? "معاينة الشريط المتحرك" : "Marquee Preview"}
        </h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden">
          <div className="bg-yellow-400 py-3 overflow-hidden">
            <motion.div
              className="flex whitespace-nowrap"
              animate={{
                x: [0, "-33.333%"],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
            >
              {[
                ...marquees.filter((m) => m.isActive),
                ...marquees.filter((m) => m.isActive),
                ...marquees.filter((m) => m.isActive),
              ].map((marquee, index) => (
                <div
                  key={`${marquee.id}-${index}`}
                  className="inline-flex items-center px-8"
                >
                  <span className="text-sm md:text-base font-medium text-gray-800">
                    {isRTL ? marquee.text_ar : marquee.text_en}
                  </span>
                  <span className="mx-4 text-gray-600">•</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarqueeTab;
