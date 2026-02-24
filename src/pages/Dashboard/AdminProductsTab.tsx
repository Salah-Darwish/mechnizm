import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Upload,
  Package,
  CreditCard,
  TrendingUp,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAdminProducts,
  getAdminProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  deleteProductImage,
  type Product,
  type CreateProductData,
  type PaymentOption,
  type ResalePlan,
} from "../../services/productService";
import type { AxiosError } from "axios";

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

const AdminProductsTab = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "active" | "inactive">("all");
  
  // Form state for add/edit product
  const initialFormState: FormState = {
    title_ar: "",
    title_en: "",
    description_ar: "",
    description_en: "",
    type: "",
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

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await getAdminProducts();
      setProducts(response.data.products);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  // Filter products based on active filter
  const filteredProducts = products.filter((product) => {
    if (activeFilter === "active") return product.is_active;
    if (activeFilter === "inactive") return !product.is_active;
    return true;
  });

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must not exceed 2MB");
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
        toast.error(`Image ${file.name} is too large (max 2MB)`);
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
      toast.success("Image deleted");
    } catch {
      toast.error("Failed to delete image");
    }
  };

  const addResalePlan = () => {
    setFormData(prev => ({
      ...prev,
      resale_plans: [...prev.resale_plans, { months: 3, profit_percentage: 10, is_active: true }]
    }));
  };

  const removeResalePlan = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resale_plans: prev.resale_plans.filter((_, i) => i !== index)
    }));
  };

  const updateResalePlan = (index: number, field: keyof ResalePlan, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      resale_plans: prev.resale_plans.map((plan, i) => 
        i === index ? { ...plan, [field]: value } : plan
      )
    }));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setMainImageFile(null);
    setMainImagePreview("");
    setSubImages([]);
    setSubImagePreviews([]);
    setExistingSubImages([]);
    setAddModalOpen(true);
  };

  const openEditModal = async (product: Product) => {
    // Fetch full product details from API
    try {
      const response = await getAdminProduct(product.id);
      const fullProduct = response.data;
      
      setEditingProduct(fullProduct);
      setFormData({
        title_ar: fullProduct.title_ar || "",
        title_en: fullProduct.title_en || "",
        description_ar: fullProduct.description_ar || "",
        description_en: fullProduct.description_en || "",
        type: fullProduct.type,
        price: fullProduct.price,
        stock_quantity: fullProduct.stock_quantity,
        is_active: fullProduct.is_active,
        payment_options: fullProduct.payment_options || [],
        resale_plans: fullProduct.resale_plans || [],
      });
      setMainImageFile(null);
      setMainImagePreview(fullProduct.main_image_url || "");
      setSubImages([]);
      setSubImagePreviews([]);
      setExistingSubImages(fullProduct.images || []);
      setAddModalOpen(true);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || t("dashboard.adminProducts.failedLoadProducts"));
      // Fallback to using the product data from the list
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
      setAddModalOpen(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title_ar || !formData.title_en || !formData.type || formData.price <= 0) {
      toast.error("Please fill all required fields");
      return;
    }

    if (!editingProduct && !mainImageFile) {
      toast.error("Main product image is required");
      return;
    }

    setSubmitting(true);

    try {
      const productData: CreateProductData = {
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
        resale_plans: formData.resale_plans.length > 0 ? formData.resale_plans : undefined,
      };

      let productId: number;

      if (editingProduct) {
        await updateProduct({ id: editingProduct.id, ...productData });
        productId = editingProduct.id;
        toast.success("Product updated successfully");
      } else {
        const response = await createProduct(productData);
        productId = response.data.id;
        toast.success("Product created successfully");
      }

      // Upload sub-images if any
      if (subImages.length > 0) {
        try {
          await addProductImages(productId, subImages);
          toast.success(`${subImages.length} additional images uploaded`);
        } catch {
          toast.error("Failed to upload some images");
        }
      }
      
      setAddModalOpen(false);
      fetchProducts();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>;
      
      if (axiosError.response?.data?.errors) {
        const firstError = Object.values(axiosError.response.data.errors)[0]?.[0];
        toast.error(firstError || "Failed to save product");
      } else {
        toast.error(axiosError.response?.data?.message || "Failed to save product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("dashboard.products.deleteConfirm") || "Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || "Failed to delete product");
    }
  };

  const activeCount = products.filter(p => p.is_active).length;
  const inactiveCount = products.filter(p => !p.is_active).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("dashboard.adminProducts.title") || "Products Management"}
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#c4886a] text-white rounded-lg hover:bg-opacity-90 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          {t("dashboard.products.addProduct") || "Add Product"}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeFilter === "all"
              ? "bg-[#3a4b95] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("dashboard.adminProducts.all")}
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-white/20">
            {products.length}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter("active")}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeFilter === "active"
              ? "bg-green-100 text-green-800 border-2 border-green-400"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("dashboard.adminProducts.active")}
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-200 text-green-800">
            {activeCount}
          </span>
        </button>
        <button
          onClick={() => setActiveFilter("inactive")}
          className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeFilter === "inactive"
              ? "bg-gray-200 text-gray-800 border-2 border-gray-400"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          {t("dashboard.adminProducts.inactive")}
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-300 text-gray-800">
            {inactiveCount}
          </span>
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">
          <Package className="w-12 h-12 mx-auto mb-4 animate-pulse" />
          Loading products...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500">{t("dashboard.adminProducts.noProducts") || "No products found"}</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" dir={isArabic ? "rtl" : "ltr"}>
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'} text-sm font-bold text-gray-700`}>
                    {t("dashboard.adminProducts.tableImage")}
                  </th>
                  <th className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'} text-sm font-bold text-gray-700`}>
                    {t("dashboard.adminProducts.tableProductName")}
                  </th>
                  <th className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'} text-sm font-bold text-gray-700`}>
                    {t("dashboard.adminProducts.tablePrice")}
                  </th>
                  <th className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'} text-sm font-bold text-gray-700`}>
                    {t("dashboard.adminProducts.tableInstallment")}
                  </th>
                  <th className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'} text-sm font-bold text-gray-700`}>
                    {t("dashboard.adminProducts.tableStock")}
                  </th>
                  <th className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'} text-sm font-bold text-gray-700`}>
                    {t("dashboard.adminProducts.tableActions")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr 
                    key={product.id} 
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    {/* Product Image */}
                    <td className="px-6 py-4">
                      {product.main_image_url ? (
                        <img
                          src={product.main_image_url}
                          alt={isArabic ? (product.title_ar || product.title_en) : (product.title_en || product.title_ar) || 'Product'}
                          className="w-20 h-20 object-cover rounded-lg shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </td>

                    {/* Product Name */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">
                        {isArabic ? (product.title_ar || product.title_en) : (product.title_en || product.title_ar)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {product.type}
                      </div>
                      {!product.is_active && (
                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full">
                          {t("dashboard.adminProducts.inactive")}
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-[#c4886a] text-lg">
                        {product.price} {t("common.currency")}
                      </div>
                    </td>

                    {/* Installments/Resale Plans */}
                    <td className="px-6 py-4">
                      {product.resale_plans && product.resale_plans.length > 0 ? (
                        <div className="space-y-1">
                          {product.resale_plans.map((plan) => (
                            <div 
                              key={plan.months} 
                              className={`text-sm bg-blue-50 text-blue-700 px-2 py-1 rounded inline-block ${isArabic ? 'ml-1' : 'mr-1'}`}
                            >
                              {plan.months} {t("dashboard.adminProducts.month")} (+{plan.profit_percentage}%)
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>

                    {/* Stock */}
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                        product.in_stock 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stock_quantity}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title={t("dashboard.adminProducts.editTooltip")}
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title={t("dashboard.adminProducts.deleteTooltip")}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {addModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => !submitting && setAddModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-4xl w-full shadow-xl my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingProduct ? t("dashboard.adminProducts.editProduct") : t("dashboard.adminProducts.addProduct")}
                </h3>
                <button
                  onClick={() => !submitting && setAddModalOpen(false)}
                  className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                  disabled={submitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Main Image Upload */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    {t("dashboard.adminProducts.mainImage")} *
                  </label>
                  <div className="flex items-center gap-4">
                    {mainImagePreview && (
                      <img
                        src={mainImagePreview}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border-2 border-gray-200"
                      />
                    )}
                    <div className="flex-1">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#c4886a] transition-colors">
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          {mainImagePreview ? t("dashboard.adminProducts.changeImage") : t("dashboard.adminProducts.uploadMainImage")}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">{t("dashboard.adminProducts.maxFileSize")}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                          onChange={handleMainImageChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Sub Images Upload */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="block text-gray-700 font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    {t("dashboard.adminProducts.additionalImages")}
                  </label>
                  
                  {/* Existing sub-images (edit mode) */}
                  {existingSubImages.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">{t("dashboard.adminProducts.currentImages")}:</p>
                      <div className="flex flex-wrap gap-2">
                        {existingSubImages.map((img) => (
                          <div key={img.id} className="relative group">
                            <img
                              src={img.url}
                              alt="Sub"
                              className="w-20 h-20 object-cover rounded-lg"
                            />
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
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">{t("dashboard.adminProducts.newImages")}:</p>
                      <div className="flex flex-wrap gap-2">
                        {subImagePreviews.map((preview, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="w-20 h-20 object-cover rounded-lg"
                            />
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
                  
                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer w-fit">
                    <Plus className="w-4 h-4" />
                    {t("dashboard.adminProducts.addMoreImages")}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleSubImagesChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Basic Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Title (Arabic) */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      الاسم (عربي) *
                    </label>
                    <input
                      type="text"
                      value={formData.title_ar}
                      onChange={(e) => setFormData({ ...formData, title_ar: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder="اسم المنتج بالعربية"
                      dir="rtl"
                    />
                  </div>

                  {/* Title (English) */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      الاسم (إنجليزي) *
                    </label>
                    <input
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder="Product Title in English"
                    />
                  </div>

                  {/* Title (Legacy) */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {t("dashboard.adminProducts.productTitle")} *
                    </label>
                    <input
                      type="text"
                      value={formData.title_en}
                      onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder="Product Title in English"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {t("dashboard.adminProducts.productType")} *
                    </label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder="e.g., Electronics, Meat, Clothing"
                      required
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {t("dashboard.adminProducts.priceSAR")} *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {t("dashboard.adminProducts.stockQuantity")}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                {/* Description (Arabic) */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    الوصف (عربي)
                  </label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="وصف المنتج بالعربية"
                    dir="rtl"
                  />
                </div>

                {/* Description (English) */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    الوصف (إنجليزي)
                  </label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Product Description in English"
                  />
                </div>

                {/* Payment Options Section */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-gray-700 font-semibold flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      {t("dashboard.adminProducts.paymentOptions")}
                    </label>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-white p-3 rounded-lg">
                    <div className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600 font-medium">
                      {isArabic ? "محفظة" : "Wallet"}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
                      <Check className="w-4 h-4" />
                      {t("dashboard.adminProducts.active")}
                    </div>
                  </div>
                </div>

                {/* Resale Plans Section */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-gray-700 font-semibold flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      {t("dashboard.adminProducts.resalePlans")}
                    </label>
                    <button
                      type="button"
                      onClick={addResalePlan}
                      className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600"
                    >
                      <Plus className="w-4 h-4" />
                      {t("dashboard.adminProducts.addResalePlan")}
                    </button>
                  </div>
                  
                  {formData.resale_plans.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">{t("dashboard.adminProducts.noResalePlans")}</p>
                  ) : (
                    <div className="space-y-3">
                      {formData.resale_plans.map((plan, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white p-3 rounded-lg flex-wrap">
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">{t("dashboard.adminProducts.months")}:</label>
                            <input
                              type="number"
                              min="1"
                              value={plan.months}
                              onChange={(e) => updateResalePlan(index, 'months', parseInt(e.target.value) || 1)}
                              className="w-20 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-gray-600">{t("dashboard.adminProducts.profitPercentage")}:</label>
                            <input
                              type="number"
                              min="0"
                              max="200"
                              step="0.1"
                              value={plan.profit_percentage}
                              onChange={(e) => updateResalePlan(index, 'profit_percentage', parseFloat(e.target.value) || 0)}
                              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                            />
                          </div>
                          <input
                            type="text"
                            value={plan.label || ''}
                            onChange={(e) => updateResalePlan(index, 'label', e.target.value)}
                            placeholder={t("dashboard.adminProducts.labelOptional")}
                            className="flex-1 min-w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                          />
                          <label className="flex items-center gap-1 text-sm">
                            <input
                              type="checkbox"
                              checked={plan.is_active !== false}
                              onChange={(e) => updateResalePlan(index, 'is_active', e.target.checked)}
                              className="w-4 h-4"
                            />
                            {t("dashboard.adminProducts.active")}
                          </label>
                          <button
                            type="button"
                            onClick={() => removeResalePlan(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 text-[#c4886a] cursor-pointer"
                  />
                  <label className="text-gray-700 font-semibold">
                    {t("dashboard.adminProducts.activeStatus")}
                  </label>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-[#c4886a] text-white rounded-lg hover:bg-opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        {editingProduct ? t("dashboard.adminProducts.updating") : t("dashboard.adminProducts.creating")}
                      </>
                    ) : (
                      editingProduct ? t("dashboard.adminProducts.updateProduct") : t("dashboard.adminProducts.createProduct")
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddModalOpen(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:opacity-50"
                  >
                    {t("dashboard.adminProducts.cancel")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminProductsTab;
