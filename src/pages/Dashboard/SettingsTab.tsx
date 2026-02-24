import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
//   Globe,
//   Bell,
//   Shield,
  Eye,
  EyeOff,
//   Moon,
//   Sun,
//   Smartphone,
//   Mail,
  Lock,
  Save,
//   Check,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { changePassword, type ChangePasswordData } from "../../services/dashboardService";
import type { AxiosError } from "axios";

const SettingsTab = () => {
  const { t, i18n } = useTranslation();
//   const isRTL = i18n.language === "ar";

  // Settings state
    const [settings,
        // setSettings
    ] = useState({
    // Language
    language: i18n.language,
    // Theme
    darkMode: false,
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    promotions: false,
    // Privacy
    showProfile: true,
    showOrders: true,
    // Security
    twoFactorAuth: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

//   const handleLanguageChange = (lang: string) => {
//     setSettings({ ...settings, language: lang });
//     i18n.changeLanguage(lang);
//     document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
//     toast.success(
//       lang === "ar" ? "تم تغيير اللغة للعربية" : "Language changed to English"
//     );
//   };

  const handleSaveSettings = () => {
    // In a real app, save to backend
    localStorage.setItem("userSettings", JSON.stringify(settings));
    toast.success(t("dashboard.settings.saveSuccess"));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t("dashboard.settings.passwordMismatch"));
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      toast.error(t("dashboard.settings.passwordTooShort"));
      return;
    }

    try {
      setIsChangingPassword(true);
      
      const data: ChangePasswordData = {
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword,
        new_password_confirmation: passwordData.confirmPassword,
      };

      await changePassword(data);
      
      toast.success(t("dashboard.settings.passwordChanged"));
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; error?: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error;
      
      if (errorMessage === 'Current password is incorrect') {
        toast.error(t("dashboard.settings.incorrectPassword") || "Current password is incorrect");
      } else if (errorMessage === 'New password must be different from current password') {
        toast.error(t("dashboard.settings.samePassword") || "New password must be different from current password");
      } else {
        toast.error(errorMessage || t("dashboard.settings.passwordChangeError") || "Failed to change password");
      }
    } finally {
      setIsChangingPassword(false);
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1 },
    }),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          {t("dashboard.settings.title")}
        </h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSaveSettings}
          className="flex items-center gap-2 px-4 py-2 bg-[#3a4b95] text-white rounded-lg hover:bg-[#2d3c78] transition-all"
        >
          <Save className="w-4 h-4" />
          {t("dashboard.settings.saveAll")}
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Language Settings */}
        {/* <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {t("dashboard.settings.language")}
            </h3>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleLanguageChange("ar")}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                settings.language === "ar"
                  ? "border-[#3a4b95] bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇸🇦</span>
                <span className="font-semibold">العربية</span>
              </div>
              {settings.language === "ar" && (
                <Check className="w-5 h-5 text-[#3a4b95]" />
              )}
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                settings.language === "en"
                  ? "border-[#3a4b95] bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🇺🇸</span>
                <span className="font-semibold">English</span>
              </div>
              {settings.language === "en" && (
                <Check className="w-5 h-5 text-[#3a4b95]" />
              )}
            </button>
          </div>
        </motion.div> */}

        {/* Theme Settings */}
        {/* <motion.div
          custom={1}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              {settings.darkMode ? (
                <Moon className="w-5 h-5 text-purple-600" />
              ) : (
                <Sun className="w-5 h-5 text-purple-600" />
              )}
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {t("dashboard.settings.theme")}
            </h3>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Sun className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">
                {t("dashboard.settings.lightMode")}
              </span>
            </div>
            <button
              onClick={() =>
                setSettings({ ...settings, darkMode: !settings.darkMode })
              }
              className={`relative w-14 h-7 rounded-full transition-all ${
                settings.darkMode ? "bg-[#3a4b95]" : "bg-gray-300"
              }`}
            >
              <div
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                  settings.darkMode ? "right-1" : "left-1"
                }`}
              />
            </button>
            <div className="flex items-center gap-3">
              <span className="font-medium">
                {t("dashboard.settings.darkMode")}
              </span>
              <Moon className="w-5 h-5 text-gray-600" />
            </div>
          </div>

          <p className="text-sm text-gray-500 mt-3">
            {t("dashboard.settings.themeNote")}
          </p>
        </motion.div> */}

        {/* Notification Settings */}
        {/* <motion.div
          custom={2}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-[#c4886a]" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {t("dashboard.settings.notifications")}
            </h3>
          </div>

          <div className="space-y-4">
            {[
              {
                key: "emailNotifications",
                icon: Mail,
                label: t("dashboard.settings.emailNotifications"),
              },
              {
                key: "pushNotifications",
                icon: Smartphone,
                label: t("dashboard.settings.pushNotifications"),
              },
              {
                key: "orderUpdates",
                icon: ShoppingBag,
                label: t("dashboard.settings.orderUpdates"),
              },
              {
                key: "promotions",
                icon: Bell,
                label: t("dashboard.settings.promotions"),
              },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>
                <button
                  onClick={() =>
                    setSettings({
                      ...settings,
                      [item.key]: !settings[item.key as keyof typeof settings],
                    })
                  }
                  className={`relative w-12 h-6 rounded-full transition-all ${
                    settings[item.key as keyof typeof settings]
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                      settings[item.key as keyof typeof settings]
                        ? isRTL
                          ? "left-0.5"
                          : "right-0.5"
                        : isRTL
                          ? "right-0.5"
                          : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </motion.div> */}

        {/* Privacy Settings */}
        {/* <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {t("dashboard.settings.privacy")}
            </h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">
                  {t("dashboard.settings.showProfile")}
                </span>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    showProfile: !settings.showProfile,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-all ${
                  settings.showProfile ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                    settings.showProfile
                      ? isRTL
                        ? "left-0.5"
                        : "right-0.5"
                      : isRTL
                        ? "right-0.5"
                        : "left-0.5"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-gray-500" />
                <span className="font-medium text-gray-700">
                  {t("dashboard.settings.twoFactorAuth")}
                </span>
              </div>
              <button
                onClick={() =>
                  setSettings({
                    ...settings,
                    twoFactorAuth: !settings.twoFactorAuth,
                  })
                }
                className={`relative w-12 h-6 rounded-full transition-all ${
                  settings.twoFactorAuth ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                    settings.twoFactorAuth
                      ? isRTL
                        ? "left-0.5"
                        : "right-0.5"
                      : isRTL
                        ? "right-0.5"
                        : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.div> */}

        {/* Change Password */}
        <motion.div
          custom={4}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-md p-6 lg:col-span-2"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">
              {t("dashboard.settings.changePassword")}
            </h3>
          </div>

          <form
            onSubmit={handlePasswordChange}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboard.settings.currentPassword")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4b95] focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboard.settings.newPassword")}
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4b95] focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("dashboard.settings.confirmPassword")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3a4b95] focus:border-transparent"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="md:col-span-3 flex justify-end">
              <motion.button
                whileHover={{ scale: isChangingPassword ? 1 : 1.02 }}
                whileTap={{ scale: isChangingPassword ? 1 : 0.98 }}
                type="submit"
                disabled={isChangingPassword}
                className="px-6 py-2 bg-[#c4886a] text-white rounded-lg hover:bg-[#b47858] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("dashboard.settings.updating")}
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    {t("dashboard.settings.updatePassword")}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

// Need to import ShoppingBag for notifications section
// import { ShoppingBag } from "lucide-react";

export default SettingsTab;
