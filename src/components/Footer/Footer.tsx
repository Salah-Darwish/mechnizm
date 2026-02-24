import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home,
  ShoppingBag,
  Phone,
  HelpCircle,
  Shield,
  Info,
} from "lucide-react";
import logo from "../../assets/images/Logo_Footer.png";
import { getFooterLinks, type FooterLinks } from "../../services/footerService";

const Footer = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [links, setLinks] = useState<FooterLinks>({
    whatsapp: "https://wa.me/",
    facebook: "https://facebook.com",
    youtube: "https://youtube.com",
    linkedin: "https://linkedin.com",
    twitter: "https://twitter.com",
  });

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await getFooterLinks();
        if (response.data?.links) {
          setLinks((prev) => ({ ...prev, ...response.data.links }));
        }
      } catch (error) {
        console.error("Failed to fetch footer links:", error);
      }
    };
    fetchLinks();
  }, []);

  // Quick links for navigation
  const quickLinks = [
    {
      name: isRTL ? "الرئيسية" : "Home",
      path: "/",
      icon: <Home className="w-5 h-5" />,
    },
    {
      name: isRTL ? "المنتجات" : "Products",
      path: "/products",
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      name: isRTL ? "من نحن" : "About Us",
      path: "/about",
      icon: <Info className="w-5 h-5" />,
    },
    {
      name: isRTL ? "الأسئلة الشائعة" : "FAQ",
      path: "/faq",
      icon: <HelpCircle className="w-5 h-5" />,
    },
    {
      name: isRTL ? "الشروط والخصوصية" : "Privacy",
      path: "/privacy",
      icon: <Shield className="w-5 h-5" />,
    },
    {
      name: isRTL ? "اتصل بنا" : "Contact",
      path: "/contact",
      icon: <Phone className="w-5 h-5" />,
    },
  ];

  const socialLinks = [
    {
      name: "WhatsApp",
      icon: (
        <svg
          width="40"
          height="40"
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M32.4008 7.58602C30.7829 5.96732 28.8608 4.68462 26.7451 3.81176C24.6295 2.9389 22.3621 2.49312 20.0734 2.50008C10.4688 2.50008 2.65 10.2798 2.64609 19.8438C2.64181 22.8892 3.44457 25.8814 4.97266 28.5157L2.5 37.5001L11.7383 35.0884C14.2954 36.4738 17.1581 37.1988 20.0664 37.1977H20.0734C29.6773 37.1977 37.4953 29.4173 37.5 19.854C37.5058 17.5732 37.058 15.314 36.1826 13.2078C35.3071 11.1017 34.0216 9.19071 32.4008 7.58602ZM20.0734 34.2704H20.0672C17.4745 34.2712 14.929 33.5773 12.6953 32.261L12.1664 31.9485L6.68437 33.3798L8.14766 28.0602L7.80312 27.5134C6.35343 25.2182 5.58535 22.5585 5.58828 19.8438C5.58828 11.8962 12.0891 5.42977 20.0789 5.42977C23.9117 5.42292 27.5903 6.93878 30.3055 9.64392C33.0208 12.3491 34.5504 16.022 34.5578 19.8548C34.5547 27.8032 28.057 34.2704 20.0734 34.2704ZM28.018 23.4743C27.5828 23.2571 25.4398 22.2087 25.043 22.0641C24.6461 21.9196 24.3531 21.847 24.0633 22.2813C23.7734 22.7157 22.9383 23.6876 22.6844 23.9806C22.4305 24.2735 22.1766 24.3055 21.7414 24.0884C21.3063 23.8712 19.9023 23.4141 18.2391 21.9376C16.9445 20.7884 16.0711 19.3696 15.8172 18.936C15.5633 18.5024 15.7898 18.2673 16.0078 18.0516C16.2039 17.8571 16.443 17.5454 16.6609 17.2923C16.8789 17.0391 16.9516 16.8579 17.0961 16.5688C17.2406 16.2798 17.1687 16.0266 17.0602 15.8102C16.9516 15.5938 16.0805 13.4602 15.718 12.5923C15.3641 11.747 15.0055 11.8618 14.7383 11.8485C14.4844 11.836 14.1914 11.8329 13.9031 11.8329C13.6827 11.8386 13.4659 11.8897 13.2662 11.983C13.0664 12.0763 12.888 12.2098 12.7422 12.3751C12.343 12.8095 11.218 13.8595 11.218 15.9907C11.218 18.122 12.7805 20.1845 12.9961 20.4735C13.2117 20.7626 16.0664 25.1399 20.4344 27.0173C21.2455 27.3646 22.0742 27.6692 22.9172 27.9298C23.9602 28.2595 24.9094 28.2134 25.6594 28.1016C26.4961 27.9774 28.2375 27.0532 28.5992 26.0407C28.9609 25.0282 28.9617 24.161 28.8531 23.9806C28.7445 23.8001 28.4539 23.6907 28.018 23.4743Z"
            fill="white"
          />
        </svg>
      ),
      url: links.whatsapp || "https://wa.me/",
      color: "hover:text-green-500",
    },
  ];

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-[#3a4b95] text-white py-12 mt-auto"
    >
      <div className="w-[95%] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Logo & Description */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-center md:items-start space-y-4"
          >
            <img src={logo} alt="MeKanizm Logo" className="w-auto h-20" />
            <p className="text-gray-300 text-sm text-center md:text-right leading-relaxed">
              {isRTL
                ? "منصة متكاملة لعرض منتجاتك وإدارة مبيعاتك بكل سهولة"
                : "Complete platform to showcase your products and manage your sales easily"}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col items-center md:items-start"
          >
            <h3 className="text-lg font-bold mb-4 text-[#c4886a]">
              {isRTL ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-gray-300 hover:text-[#c4886a] transition-colors duration-300 group"
                  >
                    <span className="group-hover:translate-x-1 transition-transform duration-300">
                      {link.icon}
                    </span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col items-center md:items-start"
          >
            <h3 className="text-lg font-bold mb-4 text-[#c4886a]">
              {isRTL ? "تواصل معنا" : "Follow Us"}
            </h3>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className={`transition-all duration-300 ${social.color}`}
                  aria-label={social.name}
                  title={social.name}
                >
                  <div className="w-12 h-12 flex items-center bg-[#c4886a] hover:bg-[#b47858] p-2 rounded-full justify-center transition-colors duration-300 shadow-lg hover:shadow-xl">
                    {social.icon}
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col items-center md:items-start"
          >
            <h3 className="text-lg font-bold mb-4 text-[#c4886a]">
              {isRTL ? "معلومات التواصل" : "Contact Info"}
            </h3>
            <div className="space-y-3 text-gray-300 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-[#c4886a]" />
                <a
                  href={links.whatsapp}
                  className="hover:text-[#c4886a] transition-colors"
                >
                  {isRTL ? "واتساب" : "WhatsApp"}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-[#c4886a]" />
                <span>{isRTL ? "دعم فني متاح 24/7" : "24/7 Support"}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-600 my-6"></div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="text-center text-sm text-gray-300"
        >
          <p>
            {isRTL ? (
              <>
                &copy; {new Date().getFullYear()} MeKanizm. جميع الحقوق محفوظة.
              </>
            ) : (
              <>
                &copy; {new Date().getFullYear()} MeKanizm. All rights reserved.
              </>
            )}
          </p>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;
