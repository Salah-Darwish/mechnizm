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
  Upload,
  Loader2,
  HelpCircle,
  Minus,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAllFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  type Faq,
  type FaqQuestion,
  type CreateQuestionData,
} from "../../services/faqService";
import type { AxiosError } from "axios";

interface QuestionFormItem {
  id: string;
  question_ar: string;
  question_en: string;
  answer_ar: string;
  answer_en: string;
  is_active: boolean;
}

const FAQTab = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Add FAQ mode
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestions, setNewQuestions] = useState<QuestionFormItem[]>([
    { id: crypto.randomUUID(), question_ar: "", question_en: "", answer_ar: "", answer_en: "", is_active: true }
  ]);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>("");
  const [newFaqActive, setNewFaqActive] = useState(true);

  // Edit FAQ (image) mode
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [editFaqImage, setEditFaqImage] = useState<File | null>(null);
  const [editFaqImagePreview, setEditFaqImagePreview] = useState<string>("");
  const [editFaqActive, setEditFaqActive] = useState(true);

  // Add Question to existing FAQ mode
  const [addingQuestionToFaqId, setAddingQuestionToFaqId] = useState<number | null>(null);
  const [addQuestionForm, setAddQuestionForm] = useState<QuestionFormItem>({
    id: "", question_ar: "", question_en: "", answer_ar: "", answer_en: "", is_active: true
  });

  // Edit Question mode
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(null);
  const [editQuestionForm, setEditQuestionForm] = useState<QuestionFormItem>({
    id: "", question_ar: "", question_en: "", answer_ar: "", answer_en: "", is_active: true
  });

  // Expanded FAQs for viewing questions
  const [expandedFaqs, setExpandedFaqs] = useState<number[]>([]);

  const fetchFaqs = async () => {
    try {
      setLoading(true);
      const data = await getAllFaqs();
      setFaqs(data);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل تحميل الأسئلة الشائعة" : "Failed to load FAQs")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetAllForms = () => {
    setIsAdding(false);
    setNewQuestions([{ id: crypto.randomUUID(), question_ar: "", question_en: "", answer_ar: "", answer_en: "", is_active: true }]);
    setNewImage(null);
    setNewImagePreview("");
    setNewFaqActive(true);
    setEditingFaqId(null);
    setEditFaqImage(null);
    setEditFaqImagePreview("");
    setAddingQuestionToFaqId(null);
    setAddQuestionForm({ id: "", question_ar: "", question_en: "", answer_ar: "", answer_en: "", is_active: true });
    setEditingQuestionId(null);
    setEditQuestionForm({ id: "", question_ar: "", question_en: "", answer_ar: "", answer_en: "", is_active: true });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        toast.error(isRTL ? "حجم الصورة يجب أن يكون أقل من 1 ميجابايت" : "Image size must be less than 1MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditFaqImage(file);
          setEditFaqImagePreview(reader.result as string);
        } else {
          setNewImage(file);
          setNewImagePreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleFaqExpand = (faqId: number) => {
    setExpandedFaqs(prev => 
      prev.includes(faqId) ? prev.filter(id => id !== faqId) : [...prev, faqId]
    );
  };

  // ==================== New FAQ Handlers ====================
  const addQuestionToNewFaq = () => {
    setNewQuestions([...newQuestions, { 
      id: crypto.randomUUID(), 
      question_ar: "", 
      question_en: "", 
      answer_ar: "", 
      answer_en: "", 
      is_active: true 
    }]);
  };

  const removeQuestionFromNewFaq = (id: string) => {
    if (newQuestions.length > 1) {
      setNewQuestions(newQuestions.filter(q => q.id !== id));
    }
  };

  const updateNewQuestion = (id: string, field: keyof QuestionFormItem, value: string | boolean) => {
    setNewQuestions(newQuestions.map(q => 
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const handleCreateFaq = async () => {
    const validQuestions = newQuestions.filter(q => 
      q.question_ar.trim() && q.question_en.trim() && q.answer_ar.trim() && q.answer_en.trim()
    );

    if (validQuestions.length === 0) {
      toast.error(isRTL 
        ? "الرجاء إدخال سؤال واحد على الأقل (بالعربية والإنجليزية)" 
        : "Please enter at least one complete question (Arabic & English)"
      );
      return;
    }

    try {
      setSubmitting(true);
      
      const questionsData: CreateQuestionData[] = validQuestions.map(q => ({
        question_ar: q.question_ar.trim(),
        question_en: q.question_en.trim(),
        answer_ar: q.answer_ar.trim(),
        answer_en: q.answer_en.trim(),
        is_active: q.is_active,
      }));

      await createFaq({
        questions: questionsData,
        image: newImage || undefined,
        is_active: newFaqActive,
      });

      toast.success(
        isRTL 
          ? `تم إنشاء قسم FAQ مع ${validQuestions.length} سؤال` 
          : `FAQ section created with ${validQuestions.length} question(s)`
      );
      resetAllForms();
      fetchFaqs();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل الإنشاء" : "Failed to create")
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==================== FAQ Update/Delete Handlers ====================
  const startEditFaq = (faq: Faq) => {
    resetAllForms();
    setEditingFaqId(faq.id);
    setEditFaqImagePreview(faq.image || "");
    setEditFaqActive(faq.is_active);
  };

  const handleUpdateFaq = async () => {
    if (!editingFaqId) return;

    try {
      setSubmitting(true);
      await updateFaq(editingFaqId, {
        image: editFaqImage || undefined,
        is_active: editFaqActive,
      });
      toast.success(isRTL ? "تم تحديث القسم بنجاح" : "FAQ section updated successfully");
      resetAllForms();
      fetchFaqs();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل التحديث" : "Failed to update"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaq = async (id: number) => {
    if (!window.confirm(isRTL ? "هل تريد حذف هذا القسم وجميع أسئلته؟" : "Delete this FAQ section and all its questions?")) {
      return;
    }

    try {
      await deleteFaq(id);
      toast.success(isRTL ? "تم حذف القسم بنجاح" : "FAQ section deleted successfully");
      fetchFaqs();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل الحذف" : "Failed to delete"));
    }
  };

  // ==================== Question Handlers ====================
  const startAddQuestion = (faqId: number) => {
    resetAllForms();
    setAddingQuestionToFaqId(faqId);
    setAddQuestionForm({ id: "", question_ar: "", question_en: "", answer_ar: "", answer_en: "", is_active: true });
    if (!expandedFaqs.includes(faqId)) {
      setExpandedFaqs([...expandedFaqs, faqId]);
    }
  };

  const handleAddQuestion = async () => {
    if (!addingQuestionToFaqId) return;

    if (!addQuestionForm.question_ar.trim() || !addQuestionForm.question_en.trim() || 
        !addQuestionForm.answer_ar.trim() || !addQuestionForm.answer_en.trim()) {
      toast.error(isRTL ? "الرجاء ملء جميع الحقول" : "Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      await addQuestion(addingQuestionToFaqId, {
        question_ar: addQuestionForm.question_ar.trim(),
        question_en: addQuestionForm.question_en.trim(),
        answer_ar: addQuestionForm.answer_ar.trim(),
        answer_en: addQuestionForm.answer_en.trim(),
        is_active: addQuestionForm.is_active,
      });
      toast.success(isRTL ? "تم إضافة السؤال بنجاح" : "Question added successfully");
      resetAllForms();
      fetchFaqs();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل الإضافة" : "Failed to add"));
    } finally {
      setSubmitting(false);
    }
  };

  const startEditQuestion = (question: FaqQuestion) => {
    resetAllForms();
    setEditingQuestionId(question.id);
    setEditQuestionForm({
      id: question.id.toString(),
      question_ar: question.question_ar,
      question_en: question.question_en,
      answer_ar: question.answer_ar,
      answer_en: question.answer_en,
      is_active: question.is_active,
    });
  };

  const handleUpdateQuestion = async () => {
    if (!editingQuestionId) return;

    if (!editQuestionForm.question_ar.trim() || !editQuestionForm.question_en.trim() || 
        !editQuestionForm.answer_ar.trim() || !editQuestionForm.answer_en.trim()) {
      toast.error(isRTL ? "الرجاء ملء جميع الحقول" : "Please fill all fields");
      return;
    }

    try {
      setSubmitting(true);
      await updateQuestion(editingQuestionId, {
        question_ar: editQuestionForm.question_ar.trim(),
        question_en: editQuestionForm.question_en.trim(),
        answer_ar: editQuestionForm.answer_ar.trim(),
        answer_en: editQuestionForm.answer_en.trim(),
        is_active: editQuestionForm.is_active,
      });
      toast.success(isRTL ? "تم تحديث السؤال بنجاح" : "Question updated successfully");
      resetAllForms();
      fetchFaqs();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل التحديث" : "Failed to update"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!window.confirm(isRTL ? "هل تريد حذف هذا السؤال؟" : "Delete this question?")) {
      return;
    }

    try {
      await deleteQuestion(questionId);
      toast.success(isRTL ? "تم حذف السؤال بنجاح" : "Question deleted successfully");
      fetchFaqs();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "فشل الحذف" : "Failed to delete"));
    }
  };

  // ==================== Render Question Form ====================
  const renderQuestionFields = (
    form: QuestionFormItem,
    onChange: (field: keyof QuestionFormItem, value: string | boolean) => void,
    showRemove = false,
    onRemove?: () => void
  ) => (
    <div className="space-y-4 p-4 bg-white rounded-lg border border-gray-200">
      {showRemove && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onRemove}
            className="flex items-center gap-1 px-2 py-1 text-red-600 hover:bg-red-50 rounded transition-all text-sm"
          >
            <Minus className="w-4 h-4" />
            {isRTL ? "حذف" : "Remove"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Arabic Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRTL ? "السؤال (عربي)" : "Question (Arabic)"}
          </label>
          <input
            type="text"
            value={form.question_ar}
            onChange={(e) => onChange("question_ar", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-right"
            placeholder="أدخل السؤال بالعربية"
            dir="rtl"
          />
        </div>

        {/* English Question */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRTL ? "السؤال (إنجليزي)" : "Question (English)"}
          </label>
          <input
            type="text"
            value={form.question_en}
            onChange={(e) => onChange("question_en", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-left"
            placeholder="Enter question in English"
            dir="ltr"
          />
        </div>

        {/* Arabic Answer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRTL ? "الإجابة (عربي)" : "Answer (Arabic)"}
          </label>
          <textarea
            value={form.answer_ar}
            onChange={(e) => onChange("answer_ar", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-right"
            placeholder="أدخل الإجابة بالعربية"
            dir="rtl"
          />
        </div>

        {/* English Answer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRTL ? "الإجابة (إنجليزي)" : "Answer (English)"}
          </label>
          <textarea
            value={form.answer_en}
            onChange={(e) => onChange("answer_en", e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-left"
            placeholder="Enter answer in English"
            dir="ltr"
          />
        </div>
      </div>

      {/* Active Toggle */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => onChange("is_active", e.target.checked)}
          className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label className="text-sm text-gray-700">
          {isRTL ? "نشط" : "Active"}
        </label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-gray-800">
              {isRTL ? "إدارة الأسئلة الشائعة" : "FAQ Management"}
            </h2>
          </div>
          {!isAdding && !editingFaqId && !addingQuestionToFaqId && !editingQuestionId && (
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
            >
              <Plus className="w-5 h-5" />
              {isRTL ? "إضافة قسم FAQ جديد" : "Add New FAQ Section"}
            </button>
          )}
        </div>

        {/* ==================== Add New FAQ Form ==================== */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-primary"
            >
              <h3 className="text-lg font-semibold mb-4">
                {isRTL ? "إنشاء قسم FAQ جديد (مع صورة وأسئلة)" : "Create New FAQ Section (with Image & Questions)"}
              </h3>

              <div className="space-y-6">
                {/* Image Upload */}
                <div className="p-4 bg-white rounded-lg border border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? "صورة القسم (اختياري)" : "Section Image (Optional)"}
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-all">
                      <Upload className="w-5 h-5" />
                      {isRTL ? (newImagePreview ? "تغيير الصورة" : "رفع صورة") : (newImagePreview ? "Change" : "Upload")}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                        onChange={(e) => handleImageChange(e, false)}
                        className="hidden"
                      />
                    </label>
                    {newImagePreview && (
                      <>
                        <button
                          type="button"
                          onClick={() => { setNewImage(null); setNewImagePreview(""); }}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          {isRTL ? "حذف" : "Remove"}
                        </button>
                        <img src={newImagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border" />
                      </>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {isRTL ? "الحد الأقصى: 1 ميجابايت | JPG, PNG, GIF, WebP" : "Max: 1MB | JPG, PNG, GIF, WebP"}
                  </p>
                </div>

                {/* FAQ Active Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newFaqActive}
                    onChange={(e) => setNewFaqActive(e.target.checked)}
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    {isRTL ? "القسم نشط" : "Section Active"}
                  </label>
                </div>

                {/* Questions */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-700">{isRTL ? "الأسئلة:" : "Questions:"}</h4>
                  {newQuestions.map((q, index) => (
                    <div key={q.id}>
                      <p className="text-sm text-gray-500 mb-2">{isRTL ? `سؤال ${index + 1}` : `Question ${index + 1}`}</p>
                      {renderQuestionFields(
                        q,
                        (field, value) => updateNewQuestion(q.id, field, value),
                        newQuestions.length > 1,
                        () => removeQuestionFromNewFaq(q.id)
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={addQuestionToNewFaq}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition-all"
                  >
                    <Plus className="w-5 h-5" />
                    {isRTL ? "إضافة سؤال آخر" : "Add Another Question"}
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end pt-4 border-t">
                  <button
                    onClick={resetAllForms}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all"
                    disabled={submitting}
                  >
                    <X className="w-5 h-5" />
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    onClick={handleCreateFaq}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isRTL ? "إنشاء القسم" : "Create Section"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== Edit FAQ (Image) Form ==================== */}
        <AnimatePresence>
          {editingFaqId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-blue-500"
            >
              <h3 className="text-lg font-semibold mb-4">
                {isRTL ? "تعديل قسم FAQ (الصورة والحالة)" : "Edit FAQ Section (Image & Status)"}
              </h3>

              <div className="space-y-4">
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRTL ? "الصورة" : "Image"}
                  </label>
                  <div className="flex items-center gap-4 flex-wrap">
                    <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700 transition-all">
                      <Upload className="w-5 h-5" />
                      {isRTL ? (editFaqImagePreview ? "تغيير" : "رفع") : (editFaqImagePreview ? "Change" : "Upload")}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                        onChange={(e) => handleImageChange(e, true)}
                        className="hidden"
                      />
                    </label>
                    {editFaqImagePreview && (
                      <>
                        <button
                          type="button"
                          onClick={() => { setEditFaqImage(null); setEditFaqImagePreview(""); }}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <img src={editFaqImagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border" />
                      </>
                    )}
                  </div>
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editFaqActive}
                    onChange={(e) => setEditFaqActive(e.target.checked)}
                    className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    {isRTL ? "نشط" : "Active"}
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 justify-end">
                  <button onClick={resetAllForms} className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all" disabled={submitting}>
                    <X className="w-5 h-5" />
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                  <button onClick={handleUpdateFaq} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50" disabled={submitting}>
                    {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {isRTL ? "حفظ" : "Save"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== Add Question to Existing FAQ Form ==================== */}
        <AnimatePresence>
          {addingQuestionToFaqId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-green-500"
            >
              <h3 className="text-lg font-semibold mb-4">
                {isRTL ? "إضافة سؤال جديد" : "Add New Question"}
              </h3>

              {renderQuestionFields(
                addQuestionForm,
                (field, value) => setAddQuestionForm({ ...addQuestionForm, [field]: value })
              )}

              <div className="flex gap-2 justify-end mt-4">
                <button onClick={resetAllForms} className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all" disabled={submitting}>
                  <X className="w-5 h-5" />
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button onClick={handleAddQuestion} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50" disabled={submitting}>
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isRTL ? "إضافة السؤال" : "Add Question"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== Edit Question Form ==================== */}
        <AnimatePresence>
          {editingQuestionId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-6 bg-gray-50 rounded-lg border-2 border-orange-500"
            >
              <h3 className="text-lg font-semibold mb-4">
                {isRTL ? "تعديل السؤال" : "Edit Question"}
              </h3>

              {renderQuestionFields(
                editQuestionForm,
                (field, value) => setEditQuestionForm({ ...editQuestionForm, [field]: value })
              )}

              <div className="flex gap-2 justify-end mt-4">
                <button onClick={resetAllForms} className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all" disabled={submitting}>
                  <X className="w-5 h-5" />
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button onClick={handleUpdateQuestion} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-all disabled:opacity-50" disabled={submitting}>
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  {isRTL ? "حفظ التعديلات" : "Save Changes"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ==================== FAQs List ==================== */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : faqs.length === 0 && !isAdding ? (
          <div className="text-center py-16">
            <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">
              {isRTL ? "لا توجد أقسام FAQ" : "No FAQ sections found"}
            </p>
            <button
              onClick={() => setIsAdding(true)}
              className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all mx-auto shadow-lg"
            >
              <Plus className="w-5 h-5" />
              {isRTL ? "إضافة أول قسم" : "Add First Section"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <motion.div
                key={faq.id}
                layout
                className="bg-white rounded-lg border-2 border-gray-200 hover:border-primary transition-all shadow-sm overflow-hidden"
              >
                {/* FAQ Header */}
                <div className="p-4 flex items-center justify-between gap-4 bg-gray-50">
                  <div className="flex items-center gap-4">
                    {faq.image ? (
                      <img src={faq.image} alt="FAQ" className="h-16 w-16 object-cover rounded-lg border" />
                    ) : (
                      <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-800">
                          {isRTL ? `قسم FAQ #${faq.id}` : `FAQ Section #${faq.id}`}
                        </span>
                        {faq.is_active ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                            <CheckCircle className="w-3 h-3" />
                            {isRTL ? "نشط" : "Active"}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                            <XCircle className="w-3 h-3" />
                            {isRTL ? "غير نشط" : "Inactive"}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {isRTL ? `${faq.questions?.length || 0} سؤال` : `${faq.questions?.length || 0} question(s)`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => startAddQuestion(faq.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all text-sm"
                      title={isRTL ? "إضافة سؤال" : "Add Question"}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => startEditFaq(faq)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all text-sm"
                      title={isRTL ? "تعديل الصورة" : "Edit Image"}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-sm"
                      title={isRTL ? "حذف" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleFaqExpand(faq.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all text-sm"
                    >
                      {expandedFaqs.includes(faq.id) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Questions List (Expandable) */}
                <AnimatePresence>
                  {expandedFaqs.includes(faq.id) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t"
                    >
                      {faq.questions && faq.questions.length > 0 ? (
                        <div className="divide-y">
                          {faq.questions.map((q) => (
                            <div key={q.id} className="p-4 hover:bg-gray-50">
                              <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 space-y-2">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">{isRTL ? "السؤال (عربي)" : "Question (AR)"}</p>
                                      <p className="font-medium text-gray-800 text-right" dir="rtl">{q.question_ar}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">{isRTL ? "السؤال (إنجليزي)" : "Question (EN)"}</p>
                                      <p className="font-medium text-gray-800 text-left" dir="ltr">{q.question_en}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">{isRTL ? "الإجابة (عربي)" : "Answer (AR)"}</p>
                                      <p className="text-gray-600 text-sm text-right" dir="rtl">{q.answer_ar}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500 mb-1">{isRTL ? "الإجابة (إنجليزي)" : "Answer (EN)"}</p>
                                      <p className="text-gray-600 text-sm text-left" dir="ltr">{q.answer_en}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {q.is_active ? (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs">
                                        <CheckCircle className="w-3 h-3" />
                                        {isRTL ? "نشط" : "Active"}
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">
                                        <XCircle className="w-3 h-3" />
                                        {isRTL ? "غير نشط" : "Inactive"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <button
                                    onClick={() => startEditQuestion(q)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-all"
                                    title={isRTL ? "تعديل" : "Edit"}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteQuestion(q.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-all"
                                    title={isRTL ? "حذف" : "Delete"}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          {isRTL ? "لا توجد أسئلة في هذا القسم" : "No questions in this section"}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQTab;
