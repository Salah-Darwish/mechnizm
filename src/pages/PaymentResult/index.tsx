import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, AlertCircle, ShoppingBag, Home } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch } from "../../store/hooks";
import { clearCart } from "../../store/slices/cartSlice";
import SEO from "../../components/SEO";

/**
 * PaymentResult Page
 * 
 * Handles the redirect back from MyFatoorah after payment.
 * URL params:
 * - status: success | failed | cancelled | error | partial | already_processed
 * - order_id: Order ID (on success)
 * - order_number: Order number (on success)
 * - message: Error message (on error/partial)
 * - invoice_status: MyFatoorah invoice status (on failed)
 */
const PaymentResult = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status") || "error";
  const orderNumber = searchParams.get("order_number");
  const message = searchParams.get("message");
  const invoiceStatus = searchParams.get("invoice_status");

  // Clear cart on successful payment
  useEffect(() => {
    if (status === "success") {
      dispatch(clearCart());
    }
  }, [status, dispatch]);

  const getStatusConfig = () => {
    switch (status) {
      case "success":
        return {
          icon: CheckCircle,
          iconColor: "text-green-600",
          bgColor: "bg-green-100",
          title: t("payment.success") || "تمت عملية الدفع بنجاح!",
          description: t("payment.successDesc") || "تم تأكيد طلبك وسيتم معالجته قريباً",
        };
      case "failed":
        return {
          icon: XCircle,
          iconColor: "text-red-600",
          bgColor: "bg-red-100",
          title: t("payment.failed") || "فشلت عملية الدفع",
          description: invoiceStatus 
            ? `${t("payment.invoiceStatus") || "حالة الفاتورة"}: ${invoiceStatus}`
            : t("payment.failedDesc") || "لم يتم إكمال عملية الدفع",
        };
      case "cancelled":
        return {
          icon: XCircle,
          iconColor: "text-[#c4886a]",
          bgColor: "bg-[#c4886a]",
          title: t("payment.cancelled") || "تم إلغاء عملية الدفع",
          description: t("payment.cancelledDesc") || "قمت بإلغاء عملية الدفع. يمكنك المحاولة مرة أخرى.",
        };
      case "partial":
        return {
          icon: AlertCircle,
          iconColor: "text-yellow-600",
          bgColor: "bg-yellow-100",
          title: t("payment.partial") || "تم الدفع - يرجى التواصل معنا",
          description: message || t("payment.partialDesc") || "تم الدفع بنجاح ولكن حدث خطأ في إنشاء الطلب. يرجى التواصل مع الدعم.",
        };
      case "already_processed":
        return {
          icon: AlertCircle,
          iconColor: "text-blue-600",
          bgColor: "bg-blue-100",
          title: t("payment.alreadyProcessed") || "تم معالجة هذا الطلب مسبقاً",
          description: t("payment.alreadyProcessedDesc") || "هذا الطلب تم معالجته بالفعل.",
        };
      default:
        return {
          icon: XCircle,
          iconColor: "text-red-600",
          bgColor: "bg-red-100",
          title: t("payment.error") || "حدث خطأ",
          description: message || t("payment.errorDesc") || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.",
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <>
      <SEO
        title={status === "success" ? "تم الدفع بنجاح" : "نتيجة الدفع"}
        description="نتيجة عملية الدفع"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex items-center justify-center px-4 py-12"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          {/* Status Icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className={`w-24 h-24 ${config.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <IconComponent className={`w-14 h-14 ${config.iconColor}`} />
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold text-gray-800 mb-3"
          >
            {config.title}
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-gray-600 mb-6"
          >
            {config.description}
          </motion.p>

          {/* Order Info (on success) */}
          {status === "success" && orderNumber && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-green-50 rounded-lg p-4 mb-6"
            >
              <div className="flex justify-between items-center text-right">
                <span className="font-bold text-green-800">{orderNumber}</span>
                <span className="text-gray-600">{t("payment.orderNumber") || "رقم الطلب"}</span>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            {status === "success" ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-3 bg-[#c4886a] text-white rounded-lg font-bold hover:bg-[#b47858] flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {t("payment.viewOrders") || "عرض الطلبات"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  {t("payment.backToHome") || "العودة للرئيسية"}
                </motion.button>
              </>
            ) : status === "cancelled" || status === "failed" ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/cart")}
                  className="w-full py-3 bg-[#c4886a] text-white rounded-lg font-bold hover:bg-[#b47858] flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {t("payment.tryAgain") || "المحاولة مرة أخرى"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  {t("payment.backToHome") || "العودة للرئيسية"}
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-3 bg-[#3a4b95] text-white rounded-lg font-bold hover:bg-[#2d3d7a] flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {t("payment.viewOrders") || "عرض الطلبات"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/")}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <Home className="w-5 h-5" />
                  {t("payment.backToHome") || "العودة للرئيسية"}
                </motion.button>
              </>
            )}
          </motion.div>

          {/* Contact Support (on partial/error) */}
          {(status === "partial" || status === "error") && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-6 text-sm text-gray-500"
            >
              {t("payment.needHelp") || "هل تحتاج مساعدة؟"}{" "}
              <a href="/contact" className="text-[#c4886a] hover:underline">
                {t("payment.contactSupport") || "تواصل معنا"}
              </a>
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default PaymentResult;
