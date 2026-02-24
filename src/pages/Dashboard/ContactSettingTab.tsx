import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Save, Loader2, Mail } from "lucide-react";
import { toast } from "react-toastify";
import {
  getContactSettings,
  updateContactSettings,
} from "../../services/contactSettingService";
import type { AxiosError } from "axios";

const ContactSettingTab = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title_ar: "",
    title_en: "",
    description1_ar: "",
    description1_en: "",
    description2_ar: "",
    description2_en: "",
  });

  const fetchContactSettings = async () => {
    try {
      setLoading(true);
      const data = await getContactSettings();
      setFormData({
        title_ar: data.title_ar || "",
        title_en: data.title_en || "",
        description1_ar: data.description1_ar || "",
        description1_en: data.description1_en || "",
        description2_ar: data.description2_ar || "",
        description2_en: data.description2_en || "",
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL
            ? "فشل تحميل بيانات صفحة التواصل"
            : "Failed to load contact page data")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContactSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      await updateContactSettings(formData);

      toast.success(
        isRTL
          ? "تم تحديث بيانات صفحة التواصل بنجاح"
          : "Contact page updated successfully"
      );
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل تحديث البيانات" : "Failed to update data")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c4886a]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c4886a]/10 rounded-lg flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#c4886a]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isRTL ? "إدارة صفحة التواصل" : "Contact Page Management"}
            </h2>
            <p className="text-sm text-gray-500">
              {isRTL
                ? "تعديل محتوى صفحة التواصل بالعربية والإنجليزية"
                : "Edit contact page content in Arabic and English"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Page Title Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "عنوان الصفحة" : "Page Title"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "العنوان (عربي)" : "Title (Arabic)"}
              </label>
              <input
                type="text"
                name="title_ar"
                value={formData.title_ar}
                onChange={handleInputChange}
                dir="rtl"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "العنوان (إنجليزي)" : "Title (English)"}
              </label>
              <input
                type="text"
                name="title_en"
                value={formData.title_en}
                onChange={handleInputChange}
                dir="ltr"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
              />
            </div>
          </div>
        </div>

        {/* Description 1 Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "الوصف الأول" : "Description 1"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "الوصف الأول (عربي)" : "Description 1 (Arabic)"}
              </label>
              <textarea
                name="description1_ar"
                value={formData.description1_ar}
                onChange={handleInputChange}
                dir="rtl"
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "الوصف الأول (إنجليزي)" : "Description 1 (English)"}
              </label>
              <textarea
                name="description1_en"
                value={formData.description1_en}
                onChange={handleInputChange}
                dir="ltr"
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Description 2 Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "الوصف الثاني" : "Description 2"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "الوصف الثاني (عربي)" : "Description 2 (Arabic)"}
              </label>
              <textarea
                name="description2_ar"
                value={formData.description2_ar}
                onChange={handleInputChange}
                dir="rtl"
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "الوصف الثاني (إنجليزي)" : "Description 2 (English)"}
              </label>
              <textarea
                name="description2_en"
                value={formData.description2_en}
                onChange={handleInputChange}
                dir="ltr"
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 bg-[#c4886a] text-white rounded-xl font-medium hover:bg-[#b3775c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {isRTL ? "جاري الحفظ..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isRTL ? "حفظ التغييرات" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default ContactSettingTab;
