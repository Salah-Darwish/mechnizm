import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Target, Eye, Award, Loader2 } from "lucide-react";
import SEO from "../../components/SEO";
import { pageSEO } from "../../types/seo";
import { getAboutSettings, type AboutSettings } from "../../services/aboutService";

// Import the about hero image (fallback)
import aboutHeroImg from "../../assets/images/Home.png";

const About = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [aboutData, setAboutData] = useState<AboutSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const data = await getAboutSettings();
        setAboutData(data);
      } catch (error) {
        console.error("Failed to fetch about data:", error);
        // Will use fallback translations
      } finally {
        setLoading(false);
      }
    };

    fetchAboutData();
  }, []);

  // Helper function to get localized content
  const getLocalizedContent = (arContent: string | undefined, enContent: string | undefined, fallbackKey: string) => {
    if (isRTL) {
      return arContent || t(fallbackKey);
    }
    return enContent || t(fallbackKey);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.2,
        duration: 0.5,
      },
    }),
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#c4886a]" />
      </div>
    );
  }

  return (
    <>
      <SEO
        title={pageSEO.about.title}
        description={pageSEO.about.description}
        keywords={pageSEO.about.keywords}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen"
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[300px] md:h-[400px] overflow-hidden rounded-b-3xl"
        >
          <img
            src={aboutData?.hero_image || aboutHeroImg}
            alt="Makanizm Bridge"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#3a4b95]/30 to-transparent" />
        </motion.div>

        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* About Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-16"
          >
            {/* Title */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="w-3 h-3 bg-[#3a4b95] rounded-full"
              />
              <h1 className="text-3xl md:text-4xl font-bold text-[#3a4b95]">
                {getLocalizedContent(aboutData?.title_ar, aboutData?.title_en, "aboutPage.title")}
              </h1>
            </div>

            {/* Content with Image */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              {/* Text Content */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="space-y-6 text-gray-700 text-lg leading-relaxed"
                dir={isRTL ? "rtl" : "ltr"}
              >
                <p>{getLocalizedContent(aboutData?.description1_ar, aboutData?.description1_en, "aboutPage.description1")}</p>
                <p>{getLocalizedContent(aboutData?.description2_ar, aboutData?.description2_en, "aboutPage.description2")}</p>
              </motion.div>

              {/* Illustration */}
              <motion.div
                initial={{ opacity: 0, x: isRTL ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="flex justify-center"
              >
                {aboutData?.hero_image ? (
                  // Show backend image if available
                  <div className="relative">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#3a4b95]/10 rounded-full" />
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#c4886a]/10 rounded-full" />
                    <img
                      src={aboutData.hero_image}
                      alt="About Makanizm"
                      className="relative z-10 w-full max-w-[300px] h-auto rounded-2xl shadow-lg object-cover"
                    />
                  </div>
                ) : (
                  // Fallback SVG illustration
                  <div className="relative">
                    <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#3a4b95]/10 rounded-full" />
                    <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[#c4886a]/10 rounded-full" />
                    <svg
                      width="300"
                      height="250"
                      viewBox="0 0 300 250"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="relative z-10"
                    >
                      <ellipse cx="150" cy="200" rx="120" ry="30" fill="#E8F4E8" />
                      <circle cx="180" cy="80" r="60" fill="#E8F4E8" stroke="#4CAF50" strokeWidth="2" />
                      <circle cx="180" cy="80" r="45" fill="white" stroke="#4CAF50" strokeWidth="2" />
                      <line x1="220" y1="120" x2="250" y2="150" stroke="#4CAF50" strokeWidth="8" strokeLinecap="round" />
                      <circle cx="240" cy="40" r="25" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
                      <circle cx="240" cy="40" r="15" fill="white" />
                      <circle cx="270" cy="70" r="18" fill="#FFF3E0" stroke="#FF9800" strokeWidth="2" />
                      <circle cx="270" cy="70" r="10" fill="white" />
                      <circle cx="100" cy="100" r="25" fill="#FFCC80" />
                      <path d="M60 180 Q100 140 140 180" fill="#3a4b95" />
                      <rect x="85" y="120" width="30" height="40" rx="5" fill="#FF7043" />
                      <rect x="50" cy="160" width="40" height="50" rx="5" fill="white" stroke="#3a4b95" strokeWidth="2" />
                      <rect x="55" y="170" width="30" height="3" fill="#3a4b95" />
                      <rect x="55" y="178" width="20" height="3" fill="#c4886a" />
                      <rect x="55" y="186" width="25" height="3" fill="#4CAF50" />
                    </svg>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Mission, Values, Vision Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Mission Card */}
            <motion.div
              custom={0}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Target className="w-7 h-7 text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {getLocalizedContent(aboutData?.mission_title_ar, aboutData?.mission_title_en, "aboutPage.mission.title")}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {getLocalizedContent(aboutData?.mission_description_ar, aboutData?.mission_description_en, "aboutPage.mission.description")}
                </p>
              </div>
            </motion.div>

            {/* Values Card - Featured */}
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-[#c4886a] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">
                  {getLocalizedContent(aboutData?.values_title_ar, aboutData?.values_title_en, "aboutPage.values.title")}
                </h3>
                <p className="text-white/90 leading-relaxed text-sm">
                  {getLocalizedContent(aboutData?.values_description_ar, aboutData?.values_description_en, "aboutPage.values.description")}
                </p>
              </div>
            </motion.div>

            {/* Vision Card */}
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-[#c4886a]/10 rounded-full flex items-center justify-center mb-4">
                  <Eye className="w-7 h-7 text-[#c4886a]" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {getLocalizedContent(aboutData?.vision_title_ar, aboutData?.vision_title_en, "aboutPage.vision.title")}
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {getLocalizedContent(aboutData?.vision_description_ar, aboutData?.vision_description_en, "aboutPage.vision.description")}
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default About;
