import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Loader2, Save, Link as LinkIcon, ExternalLink } from "lucide-react";
import { getFooterLinks, updateFooterLinks, type FooterLinks } from "../../services/footerService";
import { AxiosError } from "axios";

const FooterLinksTab = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [links, setLinks] = useState<FooterLinks>({
    whatsapp: "",
    facebook: "",
    youtube: "",
    linkedin: "",
    twitter: "",
  });

  const platforms = [
    { key: "whatsapp", label: "WhatsApp", labelAr: "واتساب", placeholder: "https://wa.me/966XXXXXXXXX" },
    { key: "facebook", label: "Facebook", labelAr: "فيسبوك", placeholder: "https://facebook.com/yourpage" },
    { key: "youtube", label: "YouTube", labelAr: "يوتيوب", placeholder: "https://youtube.com/@yourchannel" },
    { key: "linkedin", label: "LinkedIn", labelAr: "لينكد إن", placeholder: "https://linkedin.com/company/yourcompany" },
    { key: "twitter", label: "Twitter / X", labelAr: "تويتر / إكس", placeholder: "https://twitter.com/yourhandle" },
  ];

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setLoading(true);
        const response = await getFooterLinks();
        if (response.data?.links) {
          setLinks((prev) => ({ ...prev, ...response.data.links }));
        }
      } catch (error) {
        console.error("Failed to fetch footer links:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLinks();
  }, []);

  const handleChange = (platform: string, value: string) => {
    setLinks((prev) => ({ ...prev, [platform]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updateFooterLinks(links);
      toast.success(isRTL ? "تم حفظ روابط التواصل بنجاح" : "Footer links saved successfully");
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || (isRTL ? "حدث خطأ" : "An error occurred"));
    } finally {
      setSubmitting(false);
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
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          {isRTL ? "روابط التواصل الاجتماعي" : "Social Media Links"}
        </h2>
        <p className="text-gray-600 mt-1">
          {isRTL
            ? "تحديث روابط وسائل التواصل الاجتماعي في تذييل الموقع"
            : "Update the social media links displayed in the footer"}
        </p>
      </div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {platforms.map((platform) => (
            <div key={platform.key}>
              <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" />
                {isRTL ? platform.labelAr : platform.label}
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={links[platform.key as keyof FooterLinks] || ""}
                  onChange={(e) => handleChange(platform.key, e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#3a4b95] focus:outline-none transition-colors"
                  placeholder={platform.placeholder}
                  dir="ltr"
                />
                {links[platform.key as keyof FooterLinks] && (
                  <a
                    href={links[platform.key as keyof FooterLinks]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center"
                    title={isRTL ? "فتح الرابط" : "Open link"}
                  >
                    <ExternalLink className="w-5 h-5 text-gray-600" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <motion.button
              whileHover={{ scale: submitting ? 1 : 1.02 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-[#3a4b95] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2d3d7a] transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isRTL ? "جارٍ الحفظ..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isRTL ? "حفظ الروابط" : "Save Links"}
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default FooterLinksTab;
