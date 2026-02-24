import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Save,
  Upload,
  Loader2,
  Image as ImageIcon,
  Trash2,
  FileText,
  Plus,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getPrivacySettings,
  updatePrivacySettings,
  removePrivacyHeroImage,
  type PrivacySettings,
} from "../../services/privacyService";
import type { AxiosError } from "axios";

const PrivacyTab = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [privacyData, setPrivacyData] = useState<PrivacySettings | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title_ar: "",
    title_en: "",
    intro_ar: [""],
    intro_en: [""],
    terms_title_ar: "",
    terms_title_en: "",
    terms_content_ar: "",
    terms_content_en: "",
    privacy_title_ar: "",
    privacy_title_en: "",
    privacy_content_ar: "",
    privacy_content_en: "",
    operation_title_ar: "",
    operation_title_en: "",
    operation_content_ar: "",
    operation_content_en: "",
    copyright_title_ar: "",
    copyright_title_en: "",
    copyright_content_ar: "",
    copyright_content_en: "",
  });

  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchPrivacySettings = async () => {
    try {
      setLoading(true);
      const data = await getPrivacySettings();
      setPrivacyData(data);
      setFormData({
        title_ar: data.title_ar || "",
        title_en: data.title_en || "",
        intro_ar: data.intro_ar?.length ? data.intro_ar : [""],
        intro_en: data.intro_en?.length ? data.intro_en : [""],
        terms_title_ar: data.terms_title_ar || "",
        terms_title_en: data.terms_title_en || "",
        terms_content_ar: data.terms_content_ar || "",
        terms_content_en: data.terms_content_en || "",
        privacy_title_ar: data.privacy_title_ar || "",
        privacy_title_en: data.privacy_title_en || "",
        privacy_content_ar: data.privacy_content_ar || "",
        privacy_content_en: data.privacy_content_en || "",
        operation_title_ar: data.operation_title_ar || "",
        operation_title_en: data.operation_title_en || "",
        operation_content_ar: data.operation_content_ar || "",
        operation_content_en: data.operation_content_en || "",
        copyright_title_ar: data.copyright_title_ar || "",
        copyright_title_en: data.copyright_title_en || "",
        copyright_content_ar: data.copyright_content_ar || "",
        copyright_content_en: data.copyright_content_en || "",
      });
      if (data.hero_image) {
        setImagePreview(data.hero_image);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل تحميل بيانات صفحة الخصوصية" : "Failed to load privacy page data")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacySettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIntroChange = (lang: "ar" | "en", index: number, value: string) => {
    const key = `intro_${lang}` as "intro_ar" | "intro_en";
    setFormData((prev) => {
      const newIntro = [...prev[key]];
      newIntro[index] = value;
      return { ...prev, [key]: newIntro };
    });
  };

  const addIntroItem = (lang: "ar" | "en") => {
    const key = `intro_${lang}` as "intro_ar" | "intro_en";
    setFormData((prev) => ({
      ...prev,
      [key]: [...prev[key], ""],
    }));
  };

  const removeIntroItem = (lang: "ar" | "en", index: number) => {
    const key = `intro_${lang}` as "intro_ar" | "intro_en";
    setFormData((prev) => {
      if (prev[key].length <= 1) return prev;
      const newIntro = prev[key].filter((_, i) => i !== index);
      return { ...prev, [key]: newIntro };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error(
          isRTL
            ? "حجم الصورة يجب أن يكون أقل من 1 ميجابايت"
            : "Image size must be less than 1MB"
        );
        return;
      }
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setSubmitting(true);
      await removePrivacyHeroImage();
      setImagePreview("");
      setNewImage(null);
      if (privacyData) {
        setPrivacyData({ ...privacyData, hero_image: null });
      }
      toast.success(
        isRTL ? "تم حذف الصورة بنجاح" : "Image removed successfully"
      );
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل حذف الصورة" : "Failed to remove image")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const updateData: Parameters<typeof updatePrivacySettings>[0] = {
        ...formData,
        intro_ar: formData.intro_ar.filter((item) => item.trim() !== ""),
        intro_en: formData.intro_en.filter((item) => item.trim() !== ""),
      };

      if (newImage) {
        updateData.hero_image = newImage;
      }

      const updatedData = await updatePrivacySettings(updateData);
      setPrivacyData(updatedData);
      setNewImage(null);

      toast.success(
        isRTL
          ? "تم تحديث بيانات صفحة الخصوصية بنجاح"
          : "Privacy page updated successfully"
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
            <FileText className="w-5 h-5 text-[#c4886a]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isRTL ? "إدارة صفحة الشروط والخصوصية" : "Privacy Page Management"}
            </h2>
            <p className="text-sm text-gray-500">
              {isRTL
                ? "تعديل محتوى صفحة الشروط والخصوصية بالعربية والإنجليزية"
                : "Edit privacy page content in Arabic and English"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Image Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#c4886a]" />
            {isRTL ? "صورة الصفحة" : "Page Image"}
          </h3>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="relative">
              {imagePreview ? (
                <div className="relative w-64 h-40 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Privacy"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={submitting}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="w-64 h-40 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                  <div className="text-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">{isRTL ? "لا توجد صورة" : "No image"}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-[#c4886a]/10 text-[#c4886a] rounded-lg hover:bg-[#c4886a]/20 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {isRTL ? "رفع صورة جديدة" : "Upload New Image"}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                {isRTL
                  ? "الحجم الأقصى: 1 ميجابايت. الصيغ المدعومة: JPG, PNG, GIF, WebP"
                  : "Max size: 1MB. Supported formats: JPG, PNG, GIF, WebP"}
              </p>
            </div>
          </div>
        </div>

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

        {/* Intro Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "المقدمة (نقاط)" : "Introduction (Bullet Points)"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Arabic Intro */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {isRTL ? "النقاط (عربي)" : "Points (Arabic)"}
                </label>
                <button
                  type="button"
                  onClick={() => addIntroItem("ar")}
                  className="flex items-center gap-1 text-sm text-[#c4886a] hover:text-[#b3775c]"
                >
                  <Plus className="w-4 h-4" />
                  {isRTL ? "إضافة" : "Add"}
                </button>
              </div>
              <div className="space-y-2">
                {formData.intro_ar.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleIntroChange("ar", index, e.target.value)}
                      dir="rtl"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
                      placeholder={`${isRTL ? "النقطة" : "Point"} ${index + 1}`}
                    />
                    {formData.intro_ar.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIntroItem("ar", index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* English Intro */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {isRTL ? "النقاط (إنجليزي)" : "Points (English)"}
                </label>
                <button
                  type="button"
                  onClick={() => addIntroItem("en")}
                  className="flex items-center gap-1 text-sm text-[#c4886a] hover:text-[#b3775c]"
                >
                  <Plus className="w-4 h-4" />
                  {isRTL ? "إضافة" : "Add"}
                </button>
              </div>
              <div className="space-y-2">
                {formData.intro_en.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleIntroChange("en", index, e.target.value)}
                      dir="ltr"
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
                      placeholder={`Point ${index + 1}`}
                    />
                    {formData.intro_en.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeIntroItem("en", index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Terms of Use Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "شروط الاستخدام" : "Terms of Use"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "العنوان (عربي)" : "Title (Arabic)"}
              </label>
              <input
                type="text"
                name="terms_title_ar"
                value={formData.terms_title_ar}
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
                name="terms_title_en"
                value={formData.terms_title_en}
                onChange={handleInputChange}
                dir="ltr"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "المحتوى (عربي)" : "Content (Arabic)"}
              </label>
              <textarea
                name="terms_content_ar"
                value={formData.terms_content_ar}
                onChange={handleInputChange}
                dir="rtl"
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "المحتوى (إنجليزي)" : "Content (English)"}
              </label>
              <textarea
                name="terms_content_en"
                value={formData.terms_content_en}
                onChange={handleInputChange}
                dir="ltr"
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Privacy Policy Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "سياسة الخصوصية" : "Privacy Policy"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "العنوان (عربي)" : "Title (Arabic)"}
              </label>
              <input
                type="text"
                name="privacy_title_ar"
                value={formData.privacy_title_ar}
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
                name="privacy_title_en"
                value={formData.privacy_title_en}
                onChange={handleInputChange}
                dir="ltr"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "المحتوى (عربي)" : "Content (Arabic)"}
              </label>
              <textarea
                name="privacy_content_ar"
                value={formData.privacy_content_ar}
                onChange={handleInputChange}
                dir="rtl"
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "المحتوى (إنجليزي)" : "Content (English)"}
              </label>
              <textarea
                name="privacy_content_en"
                value={formData.privacy_content_en}
                onChange={handleInputChange}
                dir="ltr"
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Operation Terms Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "شروط التشغيل" : "Operation Terms"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "العنوان (عربي)" : "Title (Arabic)"}
              </label>
              <input
                type="text"
                name="operation_title_ar"
                value={formData.operation_title_ar}
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
                name="operation_title_en"
                value={formData.operation_title_en}
                onChange={handleInputChange}
                dir="ltr"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "المحتوى (عربي)" : "Content (Arabic)"}
              </label>
              <textarea
                name="operation_content_ar"
                value={formData.operation_content_ar}
                onChange={handleInputChange}
                dir="rtl"
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "المحتوى (إنجليزي)" : "Content (English)"}
              </label>
              <textarea
                name="operation_content_en"
                value={formData.operation_content_en}
                onChange={handleInputChange}
                dir="ltr"
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
              />
            </div>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "حقوق النشر" : "Copyright"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "العنوان (عربي)" : "Title (Arabic)"}
              </label>
              <input
                type="text"
                name="copyright_title_ar"
                value={formData.copyright_title_ar}
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
                name="copyright_title_en"
                value={formData.copyright_title_en}
                onChange={handleInputChange}
                dir="ltr"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "المحتوى (عربي)" : "Content (Arabic)"}
              </label>
              <textarea
                name="copyright_content_ar"
                value={formData.copyright_content_ar}
                onChange={handleInputChange}
                dir="rtl"
                rows={4}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "المحتوى (إنجليزي)" : "Content (English)"}
              </label>
              <textarea
                name="copyright_content_en"
                value={formData.copyright_content_en}
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

export default PrivacyTab;
