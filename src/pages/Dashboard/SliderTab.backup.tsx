import { useState } from "react";
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
} from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  addSlider,
  updateSlider,
  deleteSlider,
  toggleSliderActive,
  reorderSliders,
} from "../../store/slices/sliderSlice";
import type { Slider } from "../../types/slider";

const SliderTab = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const dispatch = useAppDispatch();
  const sliders = useAppSelector((state) => state.sliders.sliders);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlider, setEditingSlider] = useState<Slider | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    image: "",
    isActive: true,
    order: 1,
  });

  const sortedSliders = [...sliders].sort((a, b) => a.order - b.order);

  const openAddModal = () => {
    setEditingSlider(null);
    setFormData({
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      image: "",
      isActive: true,
      order: sliders.length + 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (slider: Slider) => {
    setEditingSlider(slider);
    setFormData({
      title: slider.title,
      titleAr: slider.titleAr,
      description: slider.description,
      descriptionAr: slider.descriptionAr,
      image: slider.image,
      isActive: slider.isActive,
      order: slider.order,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.titleAr || !formData.image) {
      toast.error(
        isRTL
          ? "يرجى ملء جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      return;
    }

    if (editingSlider) {
      dispatch(
        updateSlider({
          ...editingSlider,
          ...formData,
        })
      );
      toast.success(
        isRTL ? "تم تحديث السلايدر بنجاح" : "Slider updated successfully"
      );
    } else {
      dispatch(addSlider(formData));
      toast.success(
        isRTL ? "تم إضافة السلايدر بنجاح" : "Slider added successfully"
      );
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (
      window.confirm(
        isRTL
          ? "هل أنت متأكد من حذف هذا السلايدر؟"
          : "Are you sure you want to delete this slider?"
      )
    ) {
      dispatch(deleteSlider(id));
      toast.success(
        isRTL ? "تم حذف السلايدر بنجاح" : "Slider deleted successfully"
      );
    }
  };

  const handleToggleActive = (id: string) => {
    dispatch(toggleSliderActive(id));
  };

  const moveSlider = (index: number, direction: "up" | "down") => {
    const newSliders = [...sortedSliders];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSliders.length) return;

    // Swap orders
    const temp = newSliders[index].order;
    newSliders[index] = {
      ...newSliders[index],
      order: newSliders[targetIndex].order,
    };
    newSliders[targetIndex] = { ...newSliders[targetIndex], order: temp };

    dispatch(reorderSliders(newSliders));
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
        {sortedSliders.length === 0 ? (
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
                slider.isActive ? "border-green-200" : "border-gray-200"
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Preview */}
                <div className="md:w-64 h-40 md:h-auto relative shrink-0">
                  <img
                    src={slider.image}
                    alt={isRTL ? slider.titleAr : slider.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/400x200?text=Image+Not+Found";
                    }}
                  />
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
                            slider.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {slider.isActive
                            ? isRTL
                              ? "نشط"
                              : "Active"
                            : isRTL
                              ? "غير نشط"
                              : "Inactive"}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-1">
                        {isRTL ? slider.titleAr : slider.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        {isRTL ? slider.descriptionAr : slider.description}
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
                          slider.isActive
                            ? "bg-green-100 hover:bg-green-200 text-green-600"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                        }`}
                        title={
                          slider.isActive
                            ? isRTL
                              ? "إخفاء"
                              : "Hide"
                            : isRTL
                              ? "إظهار"
                              : "Show"
                        }
                      >
                        {slider.isActive ? (
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
            onClick={() => setIsModalOpen(false)}
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
                    ? isRTL
                      ? "تعديل السلايدر"
                      : "Edit Slider"
                    : isRTL
                      ? "إضافة سلايدر جديد"
                      : "Add New Slider"}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Image URL */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {isRTL ? "رابط الصورة" : "Image URL"} *
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors"
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                  {formData.image && (
                    <div className="mt-3 rounded-lg overflow-hidden h-32">
                      <img
                        src={formData.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://via.placeholder.com/400x200?text=Invalid+URL";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Title English */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {isRTL ? "العنوان (إنجليزي)" : "Title (English)"} *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors"
                    placeholder="Black Friday Sale"
                    required
                  />
                </div>

                {/* Title Arabic */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {isRTL ? "العنوان (عربي)" : "Title (Arabic)"} *
                  </label>
                  <input
                    type="text"
                    value={formData.titleAr}
                    onChange={(e) =>
                      setFormData({ ...formData, titleAr: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors text-right"
                    placeholder="تخفيضات الجمعة السوداء"
                    dir="rtl"
                    required
                  />
                </div>

                {/* Description English */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    {isRTL ? "الوصف (إنجليزي)" : "Description (English)"}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
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
                    value={formData.descriptionAr}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        descriptionAr: e.target.value,
                      })
                    }
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          order: parseInt(e.target.value) || 1,
                        })
                      }
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            isActive: e.target.checked,
                          })
                        }
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
                    className="flex-1 px-6 py-3 border-2 border-gray-200 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                  >
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#3a4b95] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#2d3d7a] transition-colors"
                  >
                    <Save className="w-5 h-5" />
                    {editingSlider
                      ? isRTL
                        ? "حفظ التعديلات"
                        : "Save Changes"
                      : isRTL
                        ? "إضافة السلايدر"
                        : "Add Slider"}
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
