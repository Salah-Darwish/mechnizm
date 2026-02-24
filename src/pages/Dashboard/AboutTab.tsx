import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Save,
  Upload,
  Loader2,
  Image as ImageIcon,
  Trash2,
  Info,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAboutSettings,
  updateAboutSettings,
  removeAboutHeroImage,
  type AboutSettings,
} from "../../services/aboutService";
import type { AxiosError } from "axios";

const AboutTab = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [aboutData, setAboutData] = useState<AboutSettings | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title_ar: "",
    title_en: "",
    description1_ar: "",
    description1_en: "",
    description2_ar: "",
    description2_en: "",
    mission_title_ar: "",
    mission_title_en: "",
    mission_description_ar: "",
    mission_description_en: "",
    values_title_ar: "",
    values_title_en: "",
    values_description_ar: "",
    values_description_en: "",
    vision_title_ar: "",
    vision_title_en: "",
    vision_description_ar: "",
    vision_description_en: "",
  });

  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const fetchAboutSettings = async () => {
    try {
      setLoading(true);
      const data = await getAboutSettings();
      setAboutData(data);
      setFormData({
        title_ar: data.title_ar || "",
        title_en: data.title_en || "",
        description1_ar: data.description1_ar || "",
        description1_en: data.description1_en || "",
        description2_ar: data.description2_ar || "",
        description2_en: data.description2_en || "",
        mission_title_ar: data.mission_title_ar || "",
        mission_title_en: data.mission_title_en || "",
        mission_description_ar: data.mission_description_ar || "",
        mission_description_en: data.mission_description_en || "",
        values_title_ar: data.values_title_ar || "",
        values_title_en: data.values_title_en || "",
        values_description_ar: data.values_description_ar || "",
        values_description_en: data.values_description_en || "",
        vision_title_ar: data.vision_title_ar || "",
        vision_title_en: data.vision_title_en || "",
        vision_description_ar: data.vision_description_ar || "",
        vision_description_en: data.vision_description_en || "",
      });
      if (data.hero_image) {
        setImagePreview(data.hero_image);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل تحميل بيانات صفحة من نحن" : "Failed to load about page data")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      await removeAboutHeroImage();
      setImagePreview("");
      setNewImage(null);
      if (aboutData) {
        setAboutData({ ...aboutData, hero_image: null });
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

      const updateData: Parameters<typeof updateAboutSettings>[0] = {
        ...formData,
      };

      if (newImage) {
        updateData.hero_image = newImage;
      }

      const updatedData = await updateAboutSettings(updateData);
      setAboutData(updatedData);
      setNewImage(null);

      toast.success(
        isRTL
          ? "تم تحديث بيانات صفحة من نحن بنجاح"
          : "About page updated successfully"
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
            <Info className="w-5 h-5 text-[#c4886a]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {isRTL ? "إدارة صفحة من نحن" : "About Page Management"}
            </h2>
            <p className="text-sm text-gray-500">
              {isRTL
                ? "تعديل محتوى صفحة من نحن بالعربية والإنجليزية"
                : "Edit about page content in Arabic and English"}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Hero Image Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#c4886a]" />
            {isRTL ? "صورة الغلاف" : "Hero Image"}
          </h3>

          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Image Preview */}
            <div className="relative">
              {imagePreview ? (
                <div className="relative w-64 h-40 rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imagePreview}
                    alt="Hero"
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
                    <p className="text-sm">
                      {isRTL ? "لا توجد صورة" : "No image"}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Upload Button */}
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

        {/* Main Title & Description Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "العنوان والوصف الرئيسي" : "Main Title & Description"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Arabic Title */}
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
                placeholder="من نحن"
              />
            </div>

            {/* English Title */}
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
                placeholder="About Us"
              />
            </div>

            {/* Arabic Description 1 */}
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
                placeholder="الفقرة الأولى..."
              />
            </div>

            {/* English Description 1 */}
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
                placeholder="First paragraph..."
              />
            </div>

            {/* Arabic Description 2 */}
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
                placeholder="الفقرة الثانية..."
              />
            </div>

            {/* English Description 2 */}
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
                placeholder="Second paragraph..."
              />
            </div>
          </div>
        </div>

        {/* Mission Card Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "بطاقة المهمة" : "Mission Card"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "عنوان المهمة (عربي)" : "Mission Title (Arabic)"}
              </label>
              <input
                type="text"
                name="mission_title_ar"
                value={formData.mission_title_ar}
                onChange={handleInputChange}
                dir="rtl"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
                placeholder="مهمتنا"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "عنوان المهمة (إنجليزي)" : "Mission Title (English)"}
              </label>
              <input
                type="text"
                name="mission_title_en"
                value={formData.mission_title_en}
                onChange={handleInputChange}
                dir="ltr"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
                placeholder="Our Mission"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "وصف المهمة (عربي)" : "Mission Description (Arabic)"}
              </label>
              <textarea
                name="mission_description_ar"
                value={formData.mission_description_ar}
                onChange={handleInputChange}
                dir="rtl"
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
                placeholder="وصف المهمة..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "وصف المهمة (إنجليزي)" : "Mission Description (English)"}
              </label>
              <textarea
                name="mission_description_en"
                value={formData.mission_description_en}
                onChange={handleInputChange}
                dir="ltr"
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
                placeholder="Mission description..."
              />
            </div>
          </div>
        </div>

        {/* Values Card Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "بطاقة القيم" : "Values Card"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "عنوان القيم (عربي)" : "Values Title (Arabic)"}
              </label>
              <input
                type="text"
                name="values_title_ar"
                value={formData.values_title_ar}
                onChange={handleInputChange}
                dir="rtl"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
                placeholder="قيمنا"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "عنوان القيم (إنجليزي)" : "Values Title (English)"}
              </label>
              <input
                type="text"
                name="values_title_en"
                value={formData.values_title_en}
                onChange={handleInputChange}
                dir="ltr"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
                placeholder="Our Values"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "وصف القيم (عربي)" : "Values Description (Arabic)"}
              </label>
              <textarea
                name="values_description_ar"
                value={formData.values_description_ar}
                onChange={handleInputChange}
                dir="rtl"
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
                placeholder="وصف القيم..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "وصف القيم (إنجليزي)" : "Values Description (English)"}
              </label>
              <textarea
                name="values_description_en"
                value={formData.values_description_en}
                onChange={handleInputChange}
                dir="ltr"
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
                placeholder="Values description..."
              />
            </div>
          </div>
        </div>

        {/* Vision Card Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {isRTL ? "بطاقة الرؤية" : "Vision Card"}
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "عنوان الرؤية (عربي)" : "Vision Title (Arabic)"}
              </label>
              <input
                type="text"
                name="vision_title_ar"
                value={formData.vision_title_ar}
                onChange={handleInputChange}
                dir="rtl"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
                placeholder="رؤيتنا"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "عنوان الرؤية (إنجليزي)" : "Vision Title (English)"}
              </label>
              <input
                type="text"
                name="vision_title_en"
                value={formData.vision_title_en}
                onChange={handleInputChange}
                dir="ltr"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a]"
                placeholder="Our Vision"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "وصف الرؤية (عربي)" : "Vision Description (Arabic)"}
              </label>
              <textarea
                name="vision_description_ar"
                value={formData.vision_description_ar}
                onChange={handleInputChange}
                dir="rtl"
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
                placeholder="وصف الرؤية..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isRTL ? "وصف الرؤية (إنجليزي)" : "Vision Description (English)"}
              </label>
              <textarea
                name="vision_description_en"
                value={formData.vision_description_en}
                onChange={handleInputChange}
                dir="ltr"
                rows={3}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#c4886a]/20 focus:border-[#c4886a] resize-none"
                placeholder="Vision description..."
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

export default AboutTab;
