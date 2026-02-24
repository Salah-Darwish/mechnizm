import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Image,
  ArrowUp,
  ArrowDown,
  X,
  Save,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAdminSliders,
  createSlider,
  updateSlider as updateSliderApi,
  deleteSlider as deleteSliderApi,
  toggleSlider,
  reorderSliders,
  type Slider,
} from "../../services/sliderService";
import type { AxiosError } from "axios";

const SliderTab = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState({
    title: "",
    title_ar: "",
    description: "",
    description_ar: "",
    is_active: true,
    order: 1,
  });

  const sortedSliders = [...sliders].sort((a, b) => a.order - b.order);

  const fetchSliders = async () => {
    try {
      setLoading(true);
      const response = await getAdminSliders();
      setSliders(response.data.sliders || []);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل تحميل البيانات" : "Failed to load data"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSliders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAddModal = () => {
    setEditingSlider(null);
    setImageFile(null);
    setImagePreview("");
    setFormData({
      title: "",
      title_ar: "",
      description: "",
      description_ar: "",
      is_active: true,
      order: sliders.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slider: Slider) => {
    setEditingSlider(slider);
    setImageFile(null);
    setImagePreview(slider.image || "");
    setFormData({
      title: slider.title,
      title_ar: slider.title_ar,
      description: slider.description || "",
      description_ar: slider.description_ar || "",
      is_active: slider.is_active,
      order: slider.order,
    });
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlider && !imageFile) {
      toast.error(isRTL ? "يرجى اختيار صورة" : "Please select an image");
      return;
    }

    try {
      setSubmitting(true);

      if (editingSlider) {
        await updateSliderApi(editingSlider.id, {
          title: formData.title,
          title_ar: formData.title_ar,
          description: formData.description,
          description_ar: formData.description_ar,
          is_active: formData.is_active,
          order: formData.order,
        }, imageFile || undefined);
        toast.success(isRTL ? "تم تحديث السلايدر بنجاح" : "Slider updated successfully");
      } else {
        await createSlider({
          title: formData.title,
          title_ar: formData.title_ar,
          description: formData.description,
          description_ar: formData.description_ar,
          is_active: formData.is_active,
          order: formData.order,
        }, imageFile || undefined);
        toast.success(isRTL ? "تم إضافة السلايدر بنجاح" : "Slider added successfully");
      }

      setIsModalOpen(false);
      fetchSliders();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "حدث خطأ" : "An error occurred"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(isRTL ? "هل أنت متأكد من حذف هذا السلايدر؟" : "Are you sure you want to delete this slider?")) {
      return;
    }

    try {
      await deleteSliderApi(id);
      toast.success(isRTL ? "تم حذف السلايدر بنجاح" : "Slider deleted successfully");
      fetchSliders();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل الحذف" : "Failed to delete"));
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleSlider(id);
      fetchSliders();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل التحديث" : "Failed to update"));
    }
  };

  const moveSlider = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sortedSliders.length) return;

    const newSliders = [...sortedSliders];
    const tempOrder = newSliders[index].order;
    newSliders[index] = { ...newSliders[index], order: newSliders[targetIndex].order };
    newSliders[targetIndex] = { ...newSliders[targetIndex], order: tempOrder };

    try {
      await reorderSliders(newSliders.map(s => ({ id: s.id, order: s.order })));
      fetchSliders();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل إعادة الترتيب" : "Failed to reorder"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isRTL ? "إدارة السلايدر" : "Slider Management"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isRTL
              ? "إضافة وتعديل وحذف السلايدر في الصفحة الرئيسية"
              : "Add, edit, and delete sliders on the home page"}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#3a4b95] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d3d7a] transition-colors"
        >
          <Plus className="w-5 h-5" />
          {isRTL ? "إضافة سلايدر" : "Add Slider"}
        </motion.button>
      </div>

      {/* Sliders Grid */}
      <div className="grid gap-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#3a4b95]" />
          </div>
        ) : sortedSliders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <Image className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">
              {isRTL ? "لا توجد سلايدرات حتى الآن" : "No sliders yet"}
            </p>
            <p className="text-gray-400">
              {isRTL
                ? "اضغط على إضافة سلايدر لإنشاء أول سلايدر"
                : "Click Add Slider to create your first slider"}
            </p>
          </div>
        ) : (
          sortedSliders.map((slider, index) => (
            <motion.div
              key={slider.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-xl shadow-md overflow-hidden border-2 ${
                slider.is_active ? "border-green-200" : "border-gray-200"
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Preview */}
                <div className="md:w-64 h-40 md:h-auto relative shrink-0">
                  {slider.image ? (
                    <img
                      src={slider.image}
                      alt={isRTL ? slider.title_ar : slider.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Image className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                    #{slider.order}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            slider.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {slider.is_active
                            ? isRTL ? "نشط" : "Active"
                            : isRTL ? "غير نشط" : "Inactive"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {isRTL ? slider.title_ar : slider.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {isRTL ? slider.description_ar : slider.description}
                      </p>
                      <p className="text-gray-400 text-xs">
                        {isRTL ? "العنوان بالإنجليزية:" : "English Title:"}{" "}
                        {slider.title}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2">
                      <button
                        onClick={() => moveSlider(index, "up")}
                        disabled={index === 0}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={isRTL ? "تحريك لأعلى" : "Move Up"}
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => moveSlider(index, "down")}
                        disabled={index === sortedSliders.length - 1}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title={isRTL ? "تحريك لأسفل" : "Move Down"}
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleActive(slider.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          slider.is_active
                            ? "bg-green-100 hover:bg-green-200 text-green-600"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        }`}
                        title={slider.is_active ? (isRTL ? "إخفاء" : "Hide") : (isRTL ? "إظهار" : "Show")}
                      >
                        {slider.is_active ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => openEditModal(slider)}
                        className="p-2 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-600 transition-colors"
                        title={isRTL ? "تعديل" : "Edit"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(slider.id)}
                        className="p-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-600 transition-colors"
                        title={isRTL ? "حذف" : "Delete"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => !submitting && setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-800">
                  {editingSlider
                    ? isRTL ? "تعديل السلايدر" : "Edit Slider"
                    : isRTL ? "إضافة سلايدر جديد" : "Add New Slider"}
                </h3>
                <button
                  onClick={() => !submitting && setIsModalOpen(false)}
                  disabled={submitting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image Upload */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {isRTL ? "الصورة" : "Image"} *
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
                          className="max-h-48 mx-auto rounded-lg object-contain"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          {isRTL ? "اضغط لتغيير الصورة" : "Click to change image"}
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-gray-500">
                        <Upload className="w-10 h-10" />
                        <p>{isRTL ? "اضغط لرفع صورة" : "Click to upload image"}</p>
                        <p className="text-xs text-gray-400">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title English */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {isRTL ? "العنوان (إنجليزي)" : "Title (English)"} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors"
                    placeholder="Black Friday Sale"
                    // required
                  />
                </div>

                {/* Title Arabic */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {isRTL ? "العنوان (عربي)" : "Title (Arabic)"} *
                  </label>
                  <input
                    type="text"
                    value={formData.title_ar}
                    onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors text-right"
                    placeholder="تخفيضات الجمعة السوداء"
                    dir="rtl"
                    // required
                  />
                </div>

                {/* Description English */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {isRTL ? "الوصف (إنجليزي)" : "Description (English)"}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors resize-none"
                    rows={2}
                    placeholder="20% OFF SITEWIDE! Promotion valid through..."
                  />
                </div>

                {/* Description Arabic */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {isRTL ? "الوصف (عربي)" : "Description (Arabic)"}
                  </label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors resize-none text-right"
                    rows={2}
                    placeholder="خصم 20% على كل المنتجات..."
                    dir="rtl"
                  />
                </div>

                {/* Order & Active */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {isRTL ? "الترتيب" : "Order"}
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-5 h-5 rounded text-[#3a4b95] focus:ring-[#3a4b95]"
                      />
                      <span className="font-semibold text-gray-700">
                        {isRTL ? "نشط" : "Active"}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
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
                        {editingSlider
                          ? isRTL ? "حفظ التعديلات" : "Save Changes"
                          : isRTL ? "إضافة السلايدر" : "Add Slider"}
                      </>
                    )}
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

export default SliderTab;
