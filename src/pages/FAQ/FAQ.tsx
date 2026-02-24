import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import SEO from "../../components/SEO";
import { pageSEO } from "../../types/seo";
import coverFAQ from "../../assets/images/FAQ.png";
import { getActiveFaqs, type Faq, type FaqQuestion } from "../../services/faqService";
import { toast } from "react-toastify";

const FAQ = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [coverImage, setCoverImage] = useState<string>(coverFAQ);

  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        setIsLoading(true);
        const data = await getActiveFaqs();
        setFaqs(data);
        
        // Use the first FAQ's image as cover if available
        if (data.length > 0 && data[0].image) {
          setCoverImage(data[0].image);
        }
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        toast.error(isRTL ? "فشل تحميل الأسئلة الشائعة" : "Failed to load FAQs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFaqs();
  }, [isRTL]);

  // Flatten all questions from all FAQs for display
  const allQuestions: (FaqQuestion & { faqImage?: string | null })[] = faqs.flatMap(faq => 
    (faq.questions || []).map(q => ({ ...q, faqImage: faq.image }))
  );

  const getQuestion = (q: FaqQuestion) => isRTL ? q.question_ar : q.question_en;
  const getAnswer = (q: FaqQuestion) => isRTL ? q.answer_ar : q.answer_en;

  return (
    <>
      <SEO
        title={pageSEO.faq.title}
        description={pageSEO.faq.description}
        keywords={pageSEO.faq.keywords}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mx-auto px-4 py-12 w-[95%]"
      >
        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
  

          {/* Right Side - Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1"
          >
            <div className="relative">
              {/* FAQ illustration */}
              <div className="w-full aspect-square flex items-center justify-center">
                <img src={coverImage} className="w-[60%] mx-auto" alt="FAQ Cover" />
              </div>
            </div>
          </motion.div>

          {/* Left Side - FAQ Questions */}
          <div className="space-y-4 order-2 lg:order-1">
            {isLoading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : allQuestions.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-gray-500">{isRTL ? "لا توجد أسئلة شائعة" : "No FAQs available"}</p>
              </div>
            ) : (
              allQuestions.map((question, index) => (
                <motion.div
                  key={`${question.faq_id}-${question.id}`}
                  initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all"
                >
                  <button
                    onClick={() => setOpenIndex(openIndex === `${question.faq_id}-${question.id}` ? null : `${question.faq_id}-${question.id}`)}
                    className={`w-full px-6 py-5 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-2xl ${isRTL ? "text-right" : "text-left"}`}
                  >
                   
                    <span className={`font-bold text-gray-800 text-lg ${isRTL ? "pr-4" : "pl-4"}`}>
                      {getQuestion(question)}
                    </span>
                     <ChevronLeft
                      className={`w-6 h-6 text-[#c4886a] transition-transform flex-shrink-0 ${
                        openIndex === `${question.faq_id}-${question.id}` ? "-rotate-90" : ""
                      } ${!isRTL ? "rotate-180" : ""}`}
                    />
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openIndex === `${question.faq_id}-${question.id}` ? "auto" : 0 }}
                    className="overflow-hidden"
                  >
                    <p className={`px-6 pb-5 text-gray-600 leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>
                      {getAnswer(question)}
                    </p>
                  </motion.div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default FAQ;
