import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { FileText, Shield, Settings, Copyright, Loader2 } from "lucide-react";
import SEO from "../../components/SEO";
import { pageSEO } from "../../types/seo";
import privacyFallbackImage from "../../assets/images/privacy.png";
import { getPrivacySettings, type PrivacySettings } from "../../services/privacyService";

const Privacy = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [loading, setLoading] = useState(true);
  const [privacyData, setPrivacyData] = useState<PrivacySettings | null>(null);

  // Fallback to translations if no backend data
  const fallbackIntro = t("privacy.intro", { returnObjects: true }) as string[];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getPrivacySettings();
        setPrivacyData(data);
      } catch (error) {
        console.error("Error fetching privacy data:", error);
        // Will use fallback translations
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Get content based on language, with fallback to translations
  const title = privacyData
    ? isArabic
      ? privacyData.title_ar
      : privacyData.title_en
    : t("privacy.title");

  const intro = privacyData
    ? isArabic
      ? privacyData.intro_ar || []
      : privacyData.intro_en || []
    : fallbackIntro;

  const termsTitle = privacyData
    ? isArabic
      ? privacyData.terms_title_ar
      : privacyData.terms_title_en
    : t("privacy.sections.termsOfUse.title");

  const termsContent = privacyData
    ? isArabic
      ? privacyData.terms_content_ar
      : privacyData.terms_content_en
    : t("privacy.sections.termsOfUse.content");

  const privacyTitle = privacyData
    ? isArabic
      ? privacyData.privacy_title_ar
      : privacyData.privacy_title_en
    : t("privacy.sections.privacyPolicy.title");

  const privacyContent = privacyData
    ? isArabic
      ? privacyData.privacy_content_ar
      : privacyData.privacy_content_en
    : t("privacy.sections.privacyPolicy.content");

  const operationTitle = privacyData
    ? isArabic
      ? privacyData.operation_title_ar
      : privacyData.operation_title_en
    : t("privacy.sections.operationTerms.title");

  const operationContent = privacyData
    ? isArabic
      ? privacyData.operation_content_ar
      : privacyData.operation_content_en
    : t("privacy.sections.operationTerms.content");

  const copyrightTitle = privacyData
    ? isArabic
      ? privacyData.copyright_title_ar
      : privacyData.copyright_title_en
    : t("privacy.sections.copyright.title");

  const copyrightContent = privacyData
    ? isArabic
      ? privacyData.copyright_content_ar
      : privacyData.copyright_content_en
    : t("privacy.sections.copyright.content");

  const heroImage = privacyData?.hero_image || privacyFallbackImage;

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
        title={pageSEO.privacy.title}
        description={pageSEO.privacy.description}
        keywords={pageSEO.privacy.keywords}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mx-auto py-4 w-[95%]"
      >
        {/* Page Title */}

        <div className="flex  items-center justify-center gap-3 pb-10">
              {/* Right Side - Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center w-1/2"
          >
            <div className="w-full max-w-md">
              {/* Dynamic Image */}
          <img src={heroImage} alt="Privacy" className="w-full h-auto object-contain" />
            </div>
          </motion.div>
          <div className="flex flex-col justify-start gap-5  w-1/2">
            <div className="flex items-center gap-3">

                    <FileText className="w-10 h-10 text-[#c4886a]" />
          <h1 className="text-3xl md:text-4xl font-bold text-[#3a4b95]">
            {title}
          </h1>
            </div>
             {/* Introduction */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-right space-y-4"
            >
              <ul className="space-y-3 text-gray-700 text-lg text-justify leading-relaxed">
                {intro.map((text, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-[#c4886a] mt-2">•</span>
                    <span className="w-[70%]">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
        </div>
    
     
        </div>
      
          

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-1 gap-12 max-w-7xl mx-auto">
          {/* Left Side - Content */}
          <div className="space-y-12 order-2 lg:order-1">
            {/* Terms of Use */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-start gap-3 mb-4">
                <FileText className="w-6 h-6 text-[#3a4b95]" />
                <h2 className="text-2xl font-bold text-gray-800">
                  {termsTitle}
                </h2>
              </div>
              <div className="border-r-4 border-[#c4886a] p-4 rounded-lg bg-[#3a4b950A] ">
                <p className="text-gray-700 text-lg text-right leading-relaxed">
                  {termsContent}
                </p>
              </div>
            </motion.section>

            {/* Privacy Policy */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-start gap-3 mb-4">
                <Shield className="w-6 h-6 text-[#c4886a]" />
                <h2 className="text-2xl font-bold text-gray-800">
                  {privacyTitle}
                </h2>
              </div>
              <div className="border-r-4 border-[#c4886a] p-4 rounded-lg bg-[#3a4b950A] ">
                <p className="text-gray-700 text-lg text-right leading-relaxed">
                  {privacyContent}
                </p>
              </div>
            </motion.section>

            {/* Operation Terms */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-start gap-3 mb-4">
                <Settings className="w-6 h-6 text-[#c4886a]" />
                <h2 className="text-2xl font-bold text-gray-800">
                  {operationTitle}
                </h2>
              </div>
              <div className="border-r-4 border-[#c4886a] p-4 rounded-lg bg-[#3a4b950A] ">
                <p className="text-gray-700 text-lg text-right leading-relaxed">
                  {operationContent}
                </p>
              </div>
            </motion.section>

            {/* Copyright */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-start gap-3 mb-4">
                <Copyright className="w-6 h-6 text-[#c4886a]" />
                <h2 className="text-2xl font-bold text-gray-800">
                  {copyrightTitle}
                </h2>
              </div>
              <div className="border-r-4 border-[#c4886a] p-4 rounded-lg bg-[#3a4b950A] ">
                <p className="text-gray-700 text-lg text-right leading-relaxed">
                  {copyrightContent}
                </p>
              </div>
            </motion.section>
          </div>

        </div>
      </motion.div>
    </>
  );
};

export default Privacy;
