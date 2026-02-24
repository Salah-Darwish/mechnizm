import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Edit,
  Eye,
  EyeOff,
  Image,
  Save,
  Loader2,
  Upload,
  Home,
  ShoppingBag,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAdminHero,
  saveHero,
  saveProductsCover,
  toggleHero,
  type HeroSetting,
} from "../../services/heroService";
import type { AxiosError } from "axios";

const HeroTab = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const serviceFileInputRef = useRef<HTMLInputElement>(null);
  const productsCoverFileInputRef = useRef<HTMLInputElement>(null);

  const [hero, setHero] = useState<HeroSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [productsCoverSubmitting, setProductsCoverSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Hero & Service Images
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [serviceImageFile, setServiceImageFile] = useState<File | null>(null);
  const [serviceImagePreview, setServiceImagePreview] = useState<string>("");
  
  // Products Cover Image
  const [productsCoverImageFile, setProductsCoverImageFile] = useState<File | null>(null);
  const [productsCoverImagePreview, setProductsCoverImagePreview] = useState<string>("");
  
  const [formData, setFormData] = useState({
    title: "",
    title_ar: "",
    description1: "",
    description1_ar: "",
    description2: "",
    description2_ar: "",
    is_active: true,
  });

  const fetchHero = async () => {
    try {
      setLoading(true);
      const response = await getAdminHero();
      const heroData = response.data.hero;
      setHero(heroData);
      if (heroData) {
        setFormData({
          title: heroData.title || "",
          title_ar: heroData.title_ar || "",
          description1: heroData.description1 || "",
          description1_ar: heroData.description1_ar || "",
          description2: heroData.description2 || "",
          description2_ar: heroData.description2_ar || "",
          is_active: heroData.is_active,
        });
        setImagePreview(heroData.image || "");
        setServiceImagePreview(heroData.service_image || "");
        setProductsCoverImagePreview(heroData.products_cover_image || "");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل تحميل البيانات" : "Failed to load data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHero();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 1 * 1024 * 1024) {
        toast.error(isRTL ? "حجم الملف كبير جداً. الحد الأقصى هو 1 ميجابايت." : "File is too large. Max size is 2MB.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setImageFile(null); // Clear file object to force using preview string
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleServiceImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 1 * 1024 * 1024) {
        toast.error(isRTL ? "حجم الملف كبير جداً. الحد الأقصى هو 1 ميجابايت." : "File is too large. Max size is 2MB.");
        if (serviceFileInputRef.current) serviceFileInputRef.current.value = "";
        return;
      }

      setServiceImageFile(null); // Clear file object to force using preview string
      const reader = new FileReader();
      reader.onload = () => {
        setServiceImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductsCoverImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 1 * 1024 * 1024) {
        toast.error(isRTL ? "حجم الملف كبير جداً. الحد الأقصى هو 1 ميجابايت." : "File is too large. Max size is 2MB.");
        if (productsCoverFileInputRef.current) productsCoverFileInputRef.current.value = "";
        return;
      }

      setProductsCoverImageFile(null); // Clear file object to force using preview string
      const reader = new FileReader();
      reader.onload = () => {
        setProductsCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.title_ar) {
      toast.error(isRTL ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);

      await saveHero({
        title: formData.title,
        title_ar: formData.title_ar,
        description1: formData.description1,
        description1_ar: formData.description1_ar,
        description2: formData.description2,
        description2_ar: formData.description2_ar,
        is_active: formData.is_active,
      }, imageFile || imagePreview || undefined, serviceImageFile || serviceImagePreview || undefined);

      toast.success(isRTL ? "تم حفظ إعدادات البطل بنجاح" : "Hero settings saved successfully");
      setIsEditing(false);
      setImageFile(null);
      setServiceImageFile(null);
      fetchHero();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>;
      if (axiosError.response?.data?.errors) {
        Object.values(axiosError.response.data.errors).forEach((errArray) => {
          errArray.forEach((err) => toast.error(err));
        });
      } else {
        toast.error(axiosError.response?.data?.message || (isRTL ? "حدث خطأ" : "An error occurred"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleProductsCoverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productsCoverImagePreview && !productsCoverImageFile) {
       toast.error(isRTL ? "يرجى اختيار صورة" : "Please select an image");
       return;
    }

    try {
      setProductsCoverSubmitting(true);
      
      await saveProductsCover(productsCoverImageFile || productsCoverImagePreview);
      
      toast.success(isRTL ? "تم حفظ صورة غلاف المنتجات بنجاح" : "Products cover image saved successfully");
      setProductsCoverImageFile(null);
      fetchHero();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل حفظ الصورة" : "Failed to save image"));
    } finally {
      setProductsCoverSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    if (!hero) return;
    try {
      await toggleHero(hero.id);
      toast.success(isRTL ? "تم تحديث حالة البطل" : "Hero status updated");
      fetchHero();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل التحديث" : "Failed to update"));
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    if (hero) {
      setFormData({
        title: hero.title || "",
        title_ar: hero.title_ar || "",
        description1: hero.description1 || "",
        description1_ar: hero.description1_ar || "",
        description2: hero.description2 || "",
        description2_ar: hero.description2_ar || "",
        is_active: hero.is_active,
      });
      setImagePreview(hero.image || "");
      setServiceImagePreview(hero.service_image || "");
    }
    setImageFile(null);
    setServiceImageFile(null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setImageFile(null);
    setServiceImageFile(null);
    if (hero) {
      setFormData({
        title: hero.title || "",
        title_ar: hero.title_ar || "",
        description1: hero.description1 || "",
        description1_ar: hero.description1_ar || "",
        description2: hero.description2 || "",
        description2_ar: hero.description2_ar || "",
        is_active: hero.is_active,
      });
      setImagePreview(hero.image || "");
      setServiceImagePreview(hero.service_image || "");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#3a4b95]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isRTL ? "إعدادات البطل" : "Hero Settings"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isRTL
              ? "تخصيص قسم البطل في الصفحة الرئيسية"
              : "Customize the hero section on the home page"}
          </p>
        </div>
        <div className="flex gap-2">
          {hero && !isEditing && (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleActive}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors ${
                  hero.is_active
                    ? "bg-green-100 hover:bg-green-200 text-green-700"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {hero.is_active ? (
                  <Eye className="w-5 h-5" />
                ) : (
                  <EyeOff className="w-5 h-5" />
                )}
                {hero.is_active
                  ? isRTL ? "نشط" : "Active"
                  : isRTL ? "غير نشط" : "Inactive"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startEditing}
                className="flex items-center gap-2 bg-[#3a4b95] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#2d3d7a] transition-colors"
              >
                <Edit className="w-5 h-5" />
                {isRTL ? "تعديل" : "Edit"}
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {!hero && !isEditing ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Home className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {isRTL ? "لا توجد إعدادات للبطل حتى الآن" : "No hero settings yet"}
          </p>
          <p className="text-gray-400 mb-4">
            {isRTL
              ? "اضغط على إضافة لإنشاء قسم البطل"
              : "Click Add to create the hero section"}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="bg-[#3a4b95] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d3d7a] transition-colors"
          >
            {isRTL ? "إضافة إعدادات البطل" : "Add Hero Settings"}
          </motion.button>
        </div>
      ) : isEditing ? (
        /* Edit Form */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {isRTL ? "صورة البطل" : "Hero Image"}
              </label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#3a4b95] transition-colors"
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg object-contain"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {isRTL ? "اضغط لتغيير الصورة" : "Click to change image"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Upload className="w-10 h-10" />
                    <p>{isRTL ? "اضغط لرفع صورة" : "Click to upload image"}</p>
                    <p className="text-xs text-gray-400">PNG, JPG, GIF up to 2MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Service Image Upload */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {isRTL ? "صورة الخدمة" : "Service Image"}
              </label>
              <input
                type="file"
                ref={serviceFileInputRef}
                onChange={handleServiceImageChange}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => serviceFileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-[#3a4b95] transition-colors"
              >
                {serviceImagePreview ? (
                  <div className="relative">
                    <img
                      src={serviceImagePreview}
                      alt="Service Preview"
                      className="max-h-48 mx-auto rounded-lg object-contain"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {isRTL ? "اضغط لتغيير الصورة" : "Click to change image"}
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <Upload className="w-10 h-10" />
                    <p>{isRTL ? "اضغط لرفع صورة الخدمة" : "Click to upload service image"}</p>
                    <p className="text-xs text-gray-400">PNG, JPG, GIF up to 2MB</p>
                  </div>
                )}
              </div>
            </div>

            {/* Title Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {isRTL ? "العنوان (إنجليزي)" : "Title (English)"} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors"
                  placeholder="Run your products now..."
                  required
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {isRTL ? "العنوان (عربي)" : "Title (Arabic)"} *
                </label>
                <input
                  type="text"
                  value={formData.title_ar}
                  onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors text-right"
                  placeholder="شغل منتجاتك الآن..."
                  dir="rtl"
                  required
                />
              </div>
            </div>

            {/* Description 1 Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {isRTL ? "الوصف الأول (إنجليزي)" : "Description 1 (English)"}
                </label>
                <textarea
                  value={formData.description1}
                  onChange={(e) => setFormData({ ...formData, description1: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors resize-none"
                  rows={3}
                  placeholder="We are a modern, organized company..."
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {isRTL ? "الوصف الأول (عربي)" : "Description 1 (Arabic)"}
                </label>
                <textarea
                  value={formData.description1_ar}
                  onChange={(e) => setFormData({ ...formData, description1_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors resize-none text-right"
                  rows={3}
                  placeholder="هي شركة حديثة منظمة..."
                  dir="rtl"
                />
              </div>
            </div>

            {/* Description 2 Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {isRTL ? "الوصف الثاني (إنجليزي)" : "Description 2 (English)"}
                </label>
                <textarea
                  value={formData.description2}
                  onChange={(e) => setFormData({ ...formData, description2: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors resize-none"
                  rows={2}
                  placeholder="Join today and start your journey..."
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {isRTL ? "الوصف الثاني (عربي)" : "Description 2 (Arabic)"}
                </label>
                <textarea
                  value={formData.description2_ar}
                  onChange={(e) => setFormData({ ...formData, description2_ar: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors resize-none text-right"
                  rows={2}
                  placeholder="انضم اليوم وابدأ رحلتك..."
                  dir="rtl"
                />
              </div>
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-5 h-5 rounded text-[#3a4b95] focus:ring-[#3a4b95]"
              />
              <label htmlFor="is_active" className="font-semibold text-gray-700 cursor-pointer">
                {isRTL ? "نشط (يظهر في الصفحة الرئيسية)" : "Active (Show on homepage)"}
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={cancelEditing}
                disabled={submitting}
                className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <motion.button
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-[#3a4b95] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d3d7a] transition-colors disabled:opacity-50"
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
              </motion.button>
            </div>
          </form>
        </motion.div>
      ) : (
        /* Preview Card */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${
            hero?.is_active ? "border-green-200" : "border-gray-200"
          }`}
        >
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Preview */}
            <div className="relative h-64 md:h-auto">
              {hero?.image ? (
                <img
                  src={hero.image}
                  alt={isRTL ? hero.title_ar : hero.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-[256px] bg-gray-200 flex items-center justify-center">
                  <Image className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div
                className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-semibold ${
                  hero?.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {hero?.is_active
                  ? isRTL ? "نشط" : "Active"
                  : isRTL ? "غير نشط" : "Inactive"}
              </div>
            </div>

            {/* Content Preview */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {isRTL ? "العنوان" : "Title"}
                </h3>
                <p className="text-xl font-bold text-gray-800">
                  {isRTL ? hero?.title_ar : hero?.title}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {isRTL ? hero?.title : hero?.title_ar}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {isRTL ? "الوصف الأول" : "Description 1"}
                </h3>
                <p className="text-gray-700">
                  {isRTL ? hero?.description1_ar : hero?.description1}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {isRTL ? hero?.description1 : hero?.description1_ar}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {isRTL ? "الوصف الثاني" : "Description 2"}
                </h3>
                <p className="text-gray-700">
                  {isRTL ? hero?.description2_ar : hero?.description2}
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  {isRTL ? hero?.description2 : hero?.description2_ar}
                </p>
              </div>

              {/* Service Image Preview */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">
                  {isRTL ? "صورة الخدمة" : "Service Image"}
                </h3>
                {hero?.service_image ? (
                  <img
                    src={hero.service_image}
                    alt="Service"
                    className="max-h-32 rounded-lg object-contain"
                  />
                ) : (
                  <p className="text-gray-400 text-sm">
                    {isRTL ? "لا توجد صورة" : "No image"}
                  </p>
                )}
              </div>


            </div>
          </div>
        </motion.div>
      )}

      {/* Products Cover Image Section - Separate Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-[#3a4b95]" />
          {isRTL ? "إعدادات صفحة المنتجات" : "Products Page Settings"}
        </h3>
        
        <form onSubmit={handleProductsCoverSubmit} className="space-y-6">
          {/* Products Cover Image Upload */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              {isRTL ? "صورة غلاف المنتجات" : "Products Cover Image"}
            </label>
            <div
              onClick={() => productsCoverFileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#3a4b95] transition-colors"
            >
              <input
                ref={productsCoverFileInputRef}
                type="file"
                accept="image/*"
                onChange={handleProductsCoverImageChange}
                className="hidden"
              />
              {productsCoverImagePreview ? (
                <div className="relative">
                  <img
                    src={productsCoverImagePreview}
                    alt="Products Cover Preview"
                    className="max-h-40 mx-auto rounded-lg"
                  />
                  <p className="text-sm text-[#3a4b95] mt-2">
                    {isRTL ? "اضغط لتغيير الصورة" : "Click to change image"}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Upload className="w-10 h-10" />
                  <p>{isRTL ? "اضغط لرفع صورة غلاف المنتجات" : "Click to upload products cover image"}</p>
                  <p className="text-xs text-gray-400">PNG, JPG, GIF up to 2MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: productsCoverSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: productsCoverSubmitting ? 1 : 0.98 }}
              type="submit"
              disabled={productsCoverSubmitting}
              className="flex items-center justify-center gap-2 bg-[#3a4b95] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d3d7a] transition-colors disabled:opacity-50"
            >
              {productsCoverSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isRTL ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isRTL ? "حفظ صورة الغلاف" : "Save Cover Image"}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default HeroTab;
