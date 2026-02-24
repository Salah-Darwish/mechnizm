import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import SEO from "../../components/SEO";
import { verifyEmail, resendVerificationEmail } from "../../services/authService";

type VerificationStatus = "loading" | "success" | "error" | "expired";

const VerifyEmail = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      setErrorMessage(t("verifyEmail.invalidLink"));
      return;
    }

    handleVerification(token, email);
  }, [searchParams]);

  const handleVerification = async (token: string, email: string) => {
    try {
      const response = await verifyEmail(token, email);
      
      if (response.success) {
        setStatus("success");
        toast.success(t("verifyEmail.successMessage"));
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message;
      
      if (errorMsg?.includes("expired") || errorMsg?.includes("انتهت صلاحية")) {
        setStatus("expired");
        setErrorMessage(t("verifyEmail.linkExpired"));
      } else {
        setStatus("error");
        setErrorMessage(errorMsg || t("verifyEmail.verificationFailed"));
      }
      
      toast.error(errorMsg || t("verifyEmail.verificationFailed"));
    }
  };

  const handleResendVerification = async () => {
    const email = searchParams.get("email");
    
    if (!email) {
      toast.error(t("verifyEmail.emailRequired"));
      return;
    }

    try {
      toast.info(t("verifyEmail.resendingEmail"));
      await resendVerificationEmail(email);
      toast.success(t("verifyEmail.emailResent"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("verifyEmail.resendFailed"));
    }
  };

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <div className="text-center">
            <Loader2 className="w-20 h-20 mx-auto mb-6 text-[#3a4b95] animate-spin" />
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {t("verifyEmail.verifying")}
            </h1>
            <p className="text-gray-600">{t("verifyEmail.pleaseWait")}</p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              <CheckCircle className="w-20 h-20 mx-auto mb-6 text-green-500" />
            </motion.div>
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {t("verifyEmail.successTitle")}
            </h1>
            <p className="text-gray-600 mb-6">{t("verifyEmail.successDescription")}</p>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 bg-[#3a4b95] text-white rounded-lg font-semibold hover:bg-[#2d3a75] transition-colors"
            >
              {t("verifyEmail.goToLogin")}
            </button>
          </div>
        );

      case "expired":
        return (
          <div className="text-center">
            <XCircle className="w-20 h-20 mx-auto mb-6 text-orange-500" />
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {t("verifyEmail.expiredTitle")}
            </h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={handleResendVerification}
              className="px-8 py-3 bg-[#3a4b95] text-white rounded-lg font-semibold hover:bg-[#2d3a75] transition-colors"
            >
              <Mail className="w-5 h-5 inline ml-2" />
              {t("verifyEmail.resendEmail")}
            </button>
          </div>
        );

      case "error":
      default:
        return (
          <div className="text-center">
            <XCircle className="w-20 h-20 mx-auto mb-6 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-800 mb-3">
              {t("verifyEmail.errorTitle")}
            </h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="space-x-4">
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                {t("verifyEmail.goToLogin")}
              </button>
              <button
                onClick={handleResendVerification}
                className="px-8 py-3 bg-[#3a4b95] text-white rounded-lg font-semibold hover:bg-[#2d3a75] transition-colors"
              >
                <Mail className="w-5 h-5 inline ml-2" />
                {t("verifyEmail.resendEmail")}
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <>
      <SEO
        title={t("verifyEmail.pageTitle")}
        description={t("verifyEmail.pageDescription")}
        keywords="email verification, verify account, تأكيد البريد الإلكتروني"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 md:p-12"
        >
          {renderContent()}
        </motion.div>
      </motion.div>
    </>
  );
};

export default VerifyEmail;
