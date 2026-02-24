import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";
import SEO from "../../components/SEO";
import { pageSEO } from "../../types/seo";
import { submitContactMessage } from "../../services/contactService";
import {
  getContactSettings,
  type ContactSettings,
} from "../../services/contactSettingService";

const Contact = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [contactSettings, setContactSettings] = useState<ContactSettings | null>(
    null
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const data = await getContactSettings();
        setContactSettings(data);
      } catch (error) {
        console.error("Error fetching contact settings:", error);
        // Will use fallback translations
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Get content based on language, with fallback to translations
  const title = contactSettings
    ? isArabic
      ? contactSettings.title_ar
      : contactSettings.title_en
    : t("contactPage.title");

  const description1 = contactSettings
    ? isArabic
      ? contactSettings.description1_ar
      : contactSettings.description1_en
    : t("contactPage.description1");

  const description2 = contactSettings
    ? isArabic
      ? contactSettings.description2_ar
      : contactSettings.description2_en
    : t("contactPage.description2");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error(t("contactPage.errors.fillAllFields"));
      return;
    }

    setIsSubmitting(true);

    try {
      await submitContactMessage(formData);
      toast.success(t("contactPage.success"));
      setFormData({ name: "", email: "", message: "" });
    } catch {
      toast.error(t("contactPage.errors.submitFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#c4886a]" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={pageSEO.contact.title}
        description={pageSEO.contact.description}
        keywords={pageSEO.contact.keywords}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mx-auto px-4 py-12 w-[95%]"
      >
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-7xl mx-auto">
          {/* Right Side - Description */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6 text-right"
          >
            {/* Title with Icon */}
            <div className="flex items-center justify-start gap-3 mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[#3a4b95]">
                {title}
              </h1>
              <svg
                width="50"
                height="50"
                viewBox="0 0 50 50"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clip-path="url(#clip0_69_286)">
                  <path
                    d="M44.0281 40.9028C44.0281 39.0972 43.7503 38.6111 41.8059 38.4722C41.4587 38.4722 41.2503 38.1944 41.2503 37.8472V36.9444C41.2503 36.7361 41.3892 36.4583 41.5975 36.3889C44.0281 34.7222 45.6253 31.9444 45.6253 28.8194L45.6948 28.4028C45.7642 28.125 45.9725 27.9167 46.2503 27.8472C47.0837 27.6389 47.7087 27.0833 47.917 26.25C48.1253 25.0694 47.3614 24.0278 46.2503 23.8194C46.042 23.75 45.9725 23.6111 45.9725 23.4028L46.2503 19.7917C46.3198 5.76389 26.1114 5.55556 25.9725 19.5139L26.3198 23.4722C26.3198 23.6111 26.2503 23.75 26.1114 23.8194C25.2087 24.1667 24.5837 25.2083 24.8614 26.25C25.0698 27.0139 25.7642 27.5 26.5975 27.7083C26.9448 27.7778 27.1531 28.0556 27.1531 28.4028V28.75C27.1531 31.9444 28.8198 34.7917 31.3198 36.4583C31.4587 36.5278 31.4587 36.6667 31.4587 36.7361V37.8472C31.4587 38.125 31.2503 38.4028 30.9031 38.4028C28.8198 38.5417 28.6114 39.0278 28.542 40.7639C28.4725 40.9028 28.4725 40.9722 28.4031 41.0417C25.0003 42.5 22.5003 44.5139 22.5698 49.4444C22.5698 49.7222 22.8475 50 23.1253 50H49.4448C49.7225 50 50.0003 49.7917 50.0003 49.4444C50.0698 44.5139 47.7087 42.6389 44.2364 41.1806C44.167 41.0417 44.0975 40.9722 44.0281 40.9028Z"
                    fill="#c4886a"
                  />
                  <path
                    d="M26.3892 38.8889C26.3892 36.6667 26.1114 36.1111 23.6809 35.9028C23.2642 35.9028 22.9864 35.5556 22.9864 35.1389V34.0278C22.9864 33.75 23.1253 33.4722 23.4031 33.3333C26.3892 31.3194 28.3337 27.9167 28.3337 24.0972L28.4031 23.6111C28.4725 23.2639 28.7503 22.9861 29.0975 22.9167C30.0698 22.7083 30.9031 21.9444 31.1114 20.9722C31.3892 19.5139 30.417 18.2639 29.0975 17.9861C28.8892 17.9167 28.7503 17.7083 28.7503 17.5L29.0281 13.0556C29.0975 -3.95833 4.51421 -4.16667 4.37532 12.7778L4.79199 17.6389C4.79199 17.8472 4.72254 17.9861 4.51421 18.0556C3.4031 18.4722 2.63921 19.7222 2.98643 21.0417C3.19476 21.9444 4.09754 22.5694 5.06976 22.8472C5.48643 22.9167 5.76421 23.2639 5.76421 23.6806V24.0972C5.76421 27.9861 7.7781 31.4583 10.8337 33.4722C10.9725 33.5417 11.042 33.6806 11.042 33.8194V35.2083C11.042 35.5556 10.7642 35.9028 10.3475 35.9028C7.84754 36.0417 7.56976 36.6667 7.50032 38.8194C7.43087 38.8889 7.36143 39.0278 7.29199 39.0972C3.12532 40.8333 0.0697633 43.3333 0.208652 49.375C0.208652 49.7222 0.48643 50 0.903097 50H32.9864C33.3337 50 33.6809 49.7222 33.6809 49.375C33.8198 43.3333 30.8337 41.1111 26.667 39.3056C26.5281 39.0972 26.4587 39.0278 26.3892 38.8889Z"
                    fill="#3a4b95"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_69_286">
                    <rect width="50" height="50" fill="white" />
                  </clipPath>
                </defs>
              </svg>
            </div>

            {/* Description Text */}
            <div className="text-gray-700 leading-relaxed text-lg space-y-4">
              {description1 && <p>{description1}</p>}
              {description2 && <p>{description2}</p>}
            </div>
          </motion.div>
          {/* Left Side - Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-gray-800 font-bold mb-3 text-right text-lg">
                  {t("contactPage.form.name")}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder={t("contactPage.form.namePlaceholder")}
                  className="w-full px-5 py-4 rounded-xl border-2 border-[#c4886a] bg-gray-50 text-right placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-gray-800 font-bold mb-3 text-right text-lg">
                  {t("contactPage.form.email")}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder={t("contactPage.form.emailPlaceholder")}
                  className="w-full px-5 py-4 rounded-xl border-2 border-[#c4886a] bg-gray-50 text-right placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Message Field */}
              <div>
                <label className="block text-gray-800 font-bold mb-3 text-right text-lg">
                  {t("contactPage.form.message")}
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  rows={8}
                  placeholder={t("contactPage.form.messagePlaceholder")}
                  className="w-full px-5 py-4 rounded-xl border-2 border-[#c4886a] bg-gray-50 text-right placeholder:text-gray-400 focus:bg-white focus:outline-none transition-all resize-none"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={`w-[40%] text-white py-4 rounded-xl font-bold text-lg transition-all ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#c4886a] hover:bg-[#b47858]"
                }`}
              >
                {isSubmitting
                  ? t("contactPage.form.submitting")
                  : t("contactPage.form.submit")}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Contact;
