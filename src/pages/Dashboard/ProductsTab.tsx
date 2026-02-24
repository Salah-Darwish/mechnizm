import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Package,
  DollarSign,
  Image as ImageIcon,
  CreditCard,
  Clock,
  AlertCircle,
  Upload,
  TrendingUp,
} from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  deleteProductImage,
  type Product,
  type PaymentOption,
  type ResalePlan,
  type CreateProductData,
} from "../../services/productService";

interface FormState {
  title_ar: string;
  title_en: string;
  description_ar: string;
  description_en: string;
  type: string;
  price: number;
  stock_quantity: number;
  is_active: boolean;
  payment_options: PaymentOption[];
  resale_plans: ResalePlan[];
}

const ProductsTab = () => {
  const { t } = useTranslation();
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const initialFormState: FormState = {
    title_ar: "",
    title_en: "",
    description_ar: "",
    description_en: "",
    type: "meat",
    price: 0,
    stock_quantity: 0,
    is_active: true,
    payment_options: [],
    resale_plans: [],
  };

  const [formData, setFormData] = useState<FormState>(initialFormState);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [subImages, setSubImages] = useState<File[]>([]);
  const [subImagePreviews, setSubImagePreviews] = useState<string[]>([]);
  const [existingSubImages, setExistingSubImages] = useState<Array<{ id: number; url: string }>>([]);

  // Installment tier state (for UI matching original design)
  const [installment3, setInstallment3] = useState({ enabled: false, percentage: 10 });
  const [installment6, setInstallment6] = useState({ enabled: false, percentage: 15 });
  const [installment12, setInstallment12] = useState({ enabled: false, percentage: 20 });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAdminProducts();
      // Filter products - admin sees all, merchants see only their products
      const allProducts = response.data.products;
      const filtered = isAdmin ? allProducts : allProducts.filter((p: Product & { userId?: number }) => p.userId === user?.id || !p.userId);
      setProducts(filtered);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || t("dashboard.products.loadError") || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build resale plans from installment tier states
  const buildResalePlans = (): ResalePlan[] => {
    const plans: ResalePlan[] = [];
    if (installment3.enabled) {
      plans.push({ months: 3, profit_percentage: installment3.percentage, is_active: true });
    }
    if (installment6.enabled) {
      plans.push({ months: 6, profit_percentage: installment6.percentage, is_active: true });
    }
    if (installment12.enabled) {
      plans.push({ months: 12, profit_percentage: installment12.percentage, is_active: true });
    }
    return plans;
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("dashboard.products.imageSizeError") || "Image must be less than 2MB");
        return;
      }
      setMainImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setMainImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name}: ${t("dashboard.products.imageSizeError") || "Image must be less than 2MB"}`);
        return false;
      }
      return true;
    });
    
    setSubImages(prev => [...prev, ...validFiles]);
    
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSubImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeSubImage = (index: number) => {
    setSubImages(prev => prev.filter((_, i) => i !== index));
    setSubImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingSubImage = async (imageId: number) => {
    if (!editingProduct) return;
    
    try {
      await deleteProductImage(editingProduct.id, imageId);
      setExistingSubImages(prev => prev.filter(img => img.id !== imageId));
      toast.success(t("dashboard.products.imageDeleted") || "Image deleted");
    } catch {
      toast.error(t("dashboard.products.imageDeleteError") || "Failed to delete image");
    }
  };

  const handleAdd = async () => {
    if (!formData.title_ar || !formData.title_en || !formData.type || formData.price <= 0) {
      toast.error(t("dashboard.products.fillRequired"));
      return;
    }

    if (!mainImageFile) {
      toast.error(t("dashboard.products.mainImageRequired") || "Main product image is required");
      return;
    }

    setSubmitting(true);

    try {
      const resalePlans = buildResalePlans();
      
      const productData: CreateProductData = {
        title_ar: formData.title_ar,
        title_en: formData.title_en,
        description_ar: formData.description_ar || undefined,
        description_en: formData.description_en || undefined,
        type: formData.type,
        price: formData.price,
        stock_quantity: formData.stock_quantity,
        is_active: formData.is_active,
        main_image: mainImageFile,
        payment_options: [{ type: 'wallet', is_active: true }],
        resale_plans: resalePlans.length > 0 ? resalePlans : undefined,
      };

      const response = await createProduct(productData);
      const productId = response.data.id;

      // Upload sub-images if any
      if (subImages.length > 0) {
        try {
          await addProductImages(productId, subImages);
        } catch {
          toast.warning(t("dashboard.products.subImagesError") || "Product created but some images failed to upload");
        }
      }

      toast.success(t("dashboard.products.addSuccess"));
      resetForm();
      fetchProducts();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>;
      if (axiosError.response?.data?.errors) {
        const firstError = Object.values(axiosError.response.data.errors)[0]?.[0];
        toast.error(firstError || t("dashboard.products.addError") || "Failed to add product");
      } else {
        toast.error(axiosError.response?.data?.message || t("dashboard.products.addError") || "Failed to add product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingProduct) return;

    if (!formData.title_ar || !formData.title_en || !formData.type || formData.price <= 0) {
      toast.error(t("dashboard.products.fillRequired"));
      return;
    }

    setSubmitting(true);

    try {
      const resalePlans = buildResalePlans();

      await updateProduct({
        id: editingProduct.id,
        title_ar: formData.title_ar,
        title_en: formData.title_en,
        description_ar: formData.description_ar || undefined,
        description_en: formData.description_en || undefined,
        type: formData.type,
        price: formData.price,
        stock_quantity: formData.stock_quantity,
        is_active: formData.is_active,
        main_image: mainImageFile || undefined,
        payment_options: [{ type: 'wallet', is_active: true }],
        resale_plans: resalePlans,
      });

      // Upload new sub-images if any
      if (subImages.length > 0) {
        try {
          await addProductImages(editingProduct.id, subImages);
        } catch {
          toast.warning(t("dashboard.products.subImagesError") || "Product updated but some images failed to upload");
        }
      }

      toast.success(t("dashboard.products.updateSuccess"));
      resetForm();
      fetchProducts();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>;
      if (axiosError.response?.data?.errors) {
        const firstError = Object.values(axiosError.response.data.errors)[0]?.[0];
        toast.error(firstError || t("dashboard.products.updateError") || "Failed to update product");
      } else {
        toast.error(axiosError.response?.data?.message || t("dashboard.products.updateError") || "Failed to update product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("dashboard.products.deleteConfirm"))) return;

    try {
      await deleteProduct(id);
      toast.success(t("dashboard.products.deleteSuccess"));
      fetchProducts();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || t("dashboard.products.deleteError") || "Failed to delete product");
    }
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title_ar: product.title_ar || "",
      title_en: product.title_en || "",
      description_ar: product.description_ar || "",
      description_en: product.description_en || "",
      type: product.type,
      price: product.price,
      stock_quantity: product.stock_quantity,
      is_active: product.is_active,
      payment_options: product.payment_options || [],
      resale_plans: product.resale_plans || [],
    });
    setMainImageFile(null);
    setMainImagePreview(product.main_image_url || "");
    setSubImages([]);
    setSubImagePreviews([]);
    setExistingSubImages(product.images || []);

    // Populate installment tiers from resale_plans
    const tier3 = product.resale_plans?.find((p) => p.months === 3);
    const tier6 = product.resale_plans?.find((p) => p.months === 6);
    const tier12 = product.resale_plans?.find((p) => p.months === 12);

    setInstallment3({ enabled: !!tier3, percentage: tier3?.profit_percentage || 10 });
    setInstallment6({ enabled: !!tier6, percentage: tier6?.profit_percentage || 15 });
    setInstallment12({ enabled: !!tier12, percentage: tier12?.profit_percentage || 20 });

    setIsAdding(true);
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingProduct(null);
    setFormData(initialFormState);
    setMainImageFile(null);
    setMainImagePreview("");
    setSubImages([]);
    setSubImagePreviews([]);
    setExistingSubImages([]);
    setInstallment3({ enabled: false, percentage: 10 });
    setInstallment6({ enabled: false, percentage: 15 });
    setInstallment12({ enabled: false, percentage: 20 });
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("dashboard.products.title")}
        </h2>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
        >
          <Plus className="w-5 h-5" />
          {t("dashboard.products.addNew")}
        </button>
      </div>

      {/* Add/Edit Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">
              {editingProduct
                ? t("dashboard.products.editProduct")
                : t("dashboard.products.addProduct")}
            </h3>
            <button
              onClick={resetForm}
              disabled={submitting}
              className="text-gray-500 hover:text-red-600 transition-all disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Title (Arabic) */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                الاسم (عربي)*
              </label>
              <input
                type="text"
                value={formData.title_ar}
                onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="اسم المنتج بالعربية"
                dir="rtl"
              />
            </div>

            {/* Product Title (English) */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                الاسم (إنجليزي)*
              </label>
              <input
                type="text"
                value={formData.title_en}
                onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Product Title in English"
              />
            </div>

            {/* Product Type/Category */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t("dashboard.products.category")}*
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="e.g., Electronics, Meat, Clothing"
              />
            </div>

            {/* Description (Arabic) */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">
                الوصف (عربي)
              </label>
              <textarea
                value={formData.description_ar}
                onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="وصف المنتج بالعربية"
                dir="rtl"
              />
            </div>

            {/* Description (English) */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">
                الوصف (إنجليزي)
              </label>
              <textarea
                value={formData.description_en}
                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                placeholder="Product Description in English"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <DollarSign className="w-4 h-4 inline" />
                {t("dashboard.products.price")}*
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                <Package className="w-4 h-4 inline" />
                {t("dashboard.products.stock")}
              </label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="0"
                min="0"
              />
            </div>

            {/* Main Image Upload */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">
                <ImageIcon className="w-4 h-4 inline" />
                {t("dashboard.products.mainImage")}*
              </label>
              <div className="flex items-center gap-4 flex-wrap">
                {mainImagePreview && (
                  <img
                    src={mainImagePreview}
                    alt="Preview"
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                )}
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-all">
                  <Upload className="w-4 h-4" />
                  {mainImagePreview ? t("dashboard.products.changeImage") : t("dashboard.products.uploadImage")}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                    onChange={handleMainImageChange}
                    className="hidden"
                  />
                </label>
                <span className="text-sm text-gray-500">
                  {t("dashboard.products.maxSize") || "Max 2MB (JPEG, PNG, WebP)"}
                </span>
              </div>
            </div>

            {/* Sub Images Upload */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-semibold mb-2">
                <ImageIcon className="w-4 h-4 inline" />
                {t("dashboard.products.additionalImages")}
              </label>
              
              {/* Existing sub-images */}
              {existingSubImages.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">{t("dashboard.products.currentImages")}:</p>
                  <div className="flex flex-wrap gap-2">
                    {existingSubImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img src={img.url} alt="Sub" className="w-16 h-16 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeExistingSubImage(img.id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* New sub-images preview */}
              {subImagePreviews.length > 0 && (
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">{t("dashboard.products.newImages")}:</p>
                  <div className="flex flex-wrap gap-2">
                    {subImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img src={preview} alt={`Preview ${index + 1}`} className="w-16 h-16 object-cover rounded-lg" />
                        <button
                          type="button"
                          onClick={() => removeSubImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer w-fit transition-all">
                <Plus className="w-4 h-4" />
                {t("dashboard.products.addMoreImages")}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSubImagesChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Installment Options Section (Resale Plans) */}
          <div className="mt-8 border-t pt-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-primary" />
              <h4 className="text-lg font-bold text-gray-800">
                {t("dashboard.products.installmentOptions")}
              </h4>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              {/* 3 Months */}
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer min-w-[120px]">
                  <input
                    type="checkbox"
                    checked={installment3.enabled}
                    onChange={(e) => setInstallment3({ ...installment3, enabled: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{t("dashboard.products.months3")}</span>
                </label>
                {installment3.enabled && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <input
                      type="number"
                      value={installment3.percentage}
                      onChange={(e) => setInstallment3({ ...installment3, percentage: Number(e.target.value) })}
                      className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                      min="0"
                      max="200"
                    />
                    <span className="text-gray-600">%</span>
                    <span className="text-sm text-gray-500">
                      = {formData.price ? (formData.price * (1 + installment3.percentage / 100)).toFixed(2) : 0} {t("common.currency")}
                    </span>
                  </div>
                )}
              </div>

              {/* 6 Months */}
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer min-w-[120px]">
                  <input
                    type="checkbox"
                    checked={installment6.enabled}
                    onChange={(e) => setInstallment6({ ...installment6, enabled: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{t("dashboard.products.months6")}</span>
                </label>
                {installment6.enabled && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <input
                      type="number"
                      value={installment6.percentage}
                      onChange={(e) => setInstallment6({ ...installment6, percentage: Number(e.target.value) })}
                      className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                      min="0"
                      max="200"
                    />
                    <span className="text-gray-600">%</span>
                    <span className="text-sm text-gray-500">
                      = {formData.price ? (formData.price * (1 + installment6.percentage / 100)).toFixed(2) : 0} {t("common.currency")}
                    </span>
                  </div>
                )}
              </div>

              {/* 12 Months */}
              <div className="flex items-center gap-4 flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer min-w-[120px]">
                  <input
                    type="checkbox"
                    checked={installment12.enabled}
                    onChange={(e) => setInstallment12({ ...installment12, enabled: e.target.checked })}
                    className="w-4 h-4 text-primary rounded focus:ring-primary"
                  />
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{t("dashboard.products.months12")}</span>
                </label>
                {installment12.enabled && (
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <input
                      type="number"
                      value={installment12.percentage}
                      onChange={(e) => setInstallment12({ ...installment12, percentage: Number(e.target.value) })}
                      className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-center"
                      min="0"
                      max="200"
                    />
                    <span className="text-gray-600">%</span>
                    <span className="text-sm text-gray-500">
                      = {formData.price ? (formData.price * (1 + installment12.percentage / 100)).toFixed(2) : 0} {t("common.currency")}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {t("dashboard.products.installmentNote")}
            </p>
          </div>

          {/* Active Status */}
          <div className="mt-6 flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="w-5 h-5 text-primary cursor-pointer rounded"
            />
            <label className="text-gray-700 font-semibold">
              {t("dashboard.products.activeStatus")}
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="mt-6 flex gap-4">
            <button
              onClick={editingProduct ? handleUpdate : handleAdd}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {editingProduct ? t("common.save") : t("dashboard.products.add")}
            </button>
            <button
              onClick={resetForm}
              disabled={submitting}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all disabled:opacity-50"
            >
              {t("common.cancel")}
            </button>
          </div>
        </motion.div>
      )}

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    {t("dashboard.products.image")}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    {t("dashboard.products.name")}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    {t("dashboard.products.price")}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    {t("dashboard.products.installment")}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    {t("dashboard.products.status")}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    {t("dashboard.products.stock")}
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-bold text-gray-700">
                    {t("dashboard.products.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      {t("dashboard.products.noProducts")}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-all">
                      <td className="px-6 py-4">
                        {product.main_image_url ? (
                          <img
                            src={product.main_image_url}
                            alt={product.title_ar || product.title_en || 'Product'}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-semibold text-gray-800">{product.title_ar || product.title_en}</div>
                        <div className="text-xs text-gray-500 mt-1">{product.type}</div>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-primary">
                        {product.price} {t("common.currency")}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {product.resale_plans && product.resale_plans.length > 0 ? (
                          <div className="space-y-1">
                            {product.resale_plans.map((plan) => (
                              <div key={plan.months} className="text-xs">
                                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                  {plan.months} {t("dashboard.products.monthsShort")} (+{plan.profit_percentage}%)
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            {t("dashboard.products.cashOnly")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                            product.is_active
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {product.is_active ? t("dashboard.products.active") : t("dashboard.products.inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.stock_quantity > 20
                              ? "bg-green-100 text-green-800"
                              : product.stock_quantity > 0
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.stock_quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => startEdit(product)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title={t("common.edit")}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title={t("common.delete")}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Products Count */}
      <div className="text-right text-sm text-gray-600">
        {t("dashboard.products.total")}: {products.length}
      </div>
    </div>
  );
};

export default ProductsTab;
