import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { UserPlus, ChevronDown, LogIn, Lock, Mail, CreditCard, Building2, Phone, User, IdCard } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAppDispatch } from "../../store/hooks";
import { login } from "../../store/slices/authSlice";
import SEO from "../../components/SEO";
import { pageSEO } from "../../types/seo";
import { loginUser, registerUser, type RegisterData, type LoginCredentials } from "../../services/authService";
import type { AxiosError } from "axios";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const [loginData, setLoginData] = useState<LoginCredentials>({
    email: "",
    password: "",
  });

  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    city: "",
    national_id: "",
    national_id_type: "Saudi Arabian",
    bank_iban: "",
    bank_name: "",
    primary_mobile: "",
  });

  // Validation errors state
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    city: "",
    national_id: "",
    bank_name: "",
    primary_mobile: "",
  });

  // Validation functions
  const validateName = (name: string) => {
    if (!name.trim()) return t("loginPage.validation.nameRequired");
    if (name.trim().length < 3) return t("loginPage.validation.nameMinLength");
    if (!/^[\u0600-\u06FFa-zA-Z\s]+$/.test(name)) return t("loginPage.validation.nameLettersOnly");
    return "";
  };

  const validateEmail = (email: string) => {
    if (!email.trim()) return t("loginPage.validation.emailRequired");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t("loginPage.validation.emailInvalid");
    return "";
  };

  const validatePassword = (password: string) => {
    if (!password) return t("loginPage.validation.passwordRequired");
    if (password.length < 8) return t("loginPage.validation.passwordMinLength");
    if (!/(?=.*[a-z])/.test(password)) return t("loginPage.validation.passwordLowercase");
    if (!/(?=.*[A-Z])/.test(password)) return t("loginPage.validation.passwordUppercase");
    if (!/(?=.*\d)/.test(password)) return t("loginPage.validation.passwordNumber");
    return "";
  };

  const validateMobile = (mobile: string) => {
    if (!mobile.trim()) return t("loginPage.validation.mobileRequired");
    if (!/^05\d{8}$/.test(mobile)) return t("loginPage.validation.mobileFormat");
    return "";
  };

  const validateNationalId = (id: string) => {
    if (!id.trim()) return t("loginPage.validation.nationalIdRequired");
    if (!/^[12]\d{9}$/.test(id)) return t("loginPage.validation.nationalIdFormat");
    return "";
  };

  const validateCity = (city: string) => {
    if (!city) return t("loginPage.validation.cityRequired");
    return "";
  };

  const validateBankName = (bank: string) => {
    if (!bank) return t("loginPage.validation.bankNameRequired");
    return "";
  };

  const cities = [
    "الرياض",
    "جدة",
    "مكة المكرمة",
    "المدينة المنورة",
    "الدمام",
    "الخبر",
    "الطائف",
    "تبوك",
    "أبها",
    "القصيم",
    "حائل",
    "نجران",
    "جازان",
  ];

  const banks = [
    "البنك الأهلي السعودي",
    "مصرف الراجحي",
    "بنك الرياض",
    "البنك السعودي الفرنسي",
    "البنك السعودي البريطاني (ساب)",
    "البنك العربي الوطني",
    "بنك الجزيرة",
    "البنك السعودي للاستثمار",
    "بنك البلاد",
    "الإنماء",
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginData.email || !loginData.password) {
      toast.error(
        t("loginPage.errors.fillAllFields") || "يرجى ملء جميع الحقول"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser(loginData);
      
      // Map backend role to frontend role format
      const roleMapping: Record<string, 'customer' | 'merchant' | 'admin' | 'ADMIN'> = {
        'USER': 'customer',
        'ADMIN': 'ADMIN',
        'MERCHANT': 'merchant',
      };

      dispatch(
        login({
          user: {
            id: response.data.user.id,
            email: response.data.user.email,
            name: response.data.user.name,
            role: (roleMapping[response.data.user.role] || response.data.user.role) as 'customer' | 'merchant' | 'admin' | 'ADMIN',
          },
          token: response.data.token,
        })
      );
      
      toast.success(t("loginPage.loginSuccess") || "تم تسجيل الدخول بنجاح!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>;
      const errorMessage = axiosError.response?.data?.message || "";
      
      // Check if error is related to email verification
      if (errorMessage.includes("verify") || 
          errorMessage.includes("تحقق") || 
          errorMessage.includes("verification") ||
          errorMessage.includes("not verified")) {
        toast.error(errorMessage, {
          autoClose: 8000,
          position: "top-center",
        });
        
        // Show reminder to check email
        setTimeout(() => {
          toast.info(t("loginPage.verificationRequired"), {
            autoClose: 10000,
            position: "top-center",
          });
        }, 1000);
      } else {
        // Regular login error
        toast.error(errorMessage || t("loginPage.errors.invalidCredentials") || "البريد الإلكتروني أو كلمة المرور غير صحيحة");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields except bank_iban
    const newErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      primary_mobile: validateMobile(formData.primary_mobile),
      national_id: validateNationalId(formData.national_id),
      city: validateCity(formData.city),
      bank_name: validateBankName(formData.bank_name),
    };

    setErrors(newErrors);

    // Check if there are any errors
    const hasErrors = Object.values(newErrors).some(error => error !== "");
    if (hasErrors) {
      toast.error(t("loginPage.errors.fixFormErrors"));
      return;
    }

    // Check if all required fields are filled
    if (
      !formData.name ||
      !formData.primary_mobile ||
      !formData.city ||
      !formData.email ||
      !formData.password ||
      !formData.national_id ||
      !formData.bank_name
    ) {
      toast.error(
        t("loginPage.errors.fillAllFields") || "يرجى ملء جميع الحقول"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerUser(formData);
      
      // Check if the response indicates that email verification is required
      if (response.message?.includes("verification") || 
          response.message?.includes("تحقق") || 
          response.message?.includes("verify")) {
        // Email verification required - don't log in yet
        toast.success(t("loginPage.verificationEmailSent"), {
          autoClose: 8000,
          position: "top-center",
        });
        
        // Show info message about checking email
        setTimeout(() => {
          toast.info(t("loginPage.verificationRequired"), {
            autoClose: 10000,
            position: "top-center",
          });
        }, 1000);
        
        // Switch to login tab after showing messages
        setTimeout(() => {
          setIsLogin(true);
        }, 2000);
      } else {
        // Direct login if no verification required (old behavior)
        const roleMapping: Record<string, 'customer' | 'merchant' | 'admin'> = {
          'USER': 'customer',
          'ADMIN': 'admin',
          'MERCHANT': 'merchant',
        };

        dispatch(
          login({
            user: {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              role: roleMapping[response.data.user.role] || response.data.user.role as 'customer' | 'merchant' | 'admin',
              city: response.data.user.city,
              national_id: response.data.user.national_id,
              bank_iban: response.data.user.bank_iban,
              bank_name: response.data.user.bank_name,
              mobiles: response.data.user.mobiles,
            },
            token: response.data.token,
          })
        );
        
        toast.success(t("loginPage.success") || "تم التسجيل بنجاح!");
        setTimeout(() => navigate("/dashboard"), 1000);
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>;
      
      // Show first validation error if available
      if (axiosError.response?.data?.errors) {
        const firstError = Object.values(axiosError.response.data.errors)[0]?.[0];
        toast.error(firstError || t("loginPage.errors.registrationFailed"));
      } else {
        toast.error(
          axiosError.response?.data?.message || 
          t("loginPage.errors.registrationFailed") || 
          "فشل في التسجيل، يرجى المحاولة مرة أخرى"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title={pageSEO.login.title}
        description={pageSEO.login.description}
        keywords={pageSEO.login.keywords}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="mx-auto px-4 py-12 min-h-screen bg-linear-to-br from-gray-50 to-gray-100"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto"
        >
          {/* Toggle Buttons */}
          <div className="flex gap-4 mb-8 justify-center">
            <button
              onClick={() => setIsLogin(true)}
              className={`px-8 py-3 rounded-lg font-bold transition-all ${
                isLogin
                  ? "bg-[#3a4b95] text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <LogIn className="w-5 h-5 inline ml-2" />
              {t("loginPage.loginTab")}
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`px-8 py-3 rounded-lg font-bold transition-all ${
                !isLogin
                  ? "bg-[#3a4b95] text-white shadow-lg"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              <UserPlus className="w-5 h-5 inline ml-2" />
              {t("loginPage.registerTab")}
            </button>
          </div>

          {/* Login Form */}
          {isLogin ? (
            <motion.form
              key="login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleLogin}
              className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
            >
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-[#3a4b95] mb-2">
                  {t("loginPage.loginTitle")}
                </h1>
                <p className="text-gray-600">{t("loginPage.loginSubtitle")}</p>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-right">
                  <Mail className="w-4 h-4 inline ml-2" />
                  {t("loginPage.email")}*
                </label>
                <input
                  type="email"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:border-secondary focus:bg-white focus:outline-none transition-all text-right"
                  placeholder="example@email.com"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2 text-right">
                  <Lock className="w-4 h-4 inline ml-2" />
                  {t("loginPage.password")}*
                </label>
                <input
                  type="password"
                  value={loginData.password}
                  onChange={(e) =>
                    setLoginData({ ...loginData, password: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:border-secondary focus:bg-white focus:outline-none transition-all text-right"
                  placeholder="••••••••"
                  required
                />
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#c4886a] text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "..." : t("loginPage.loginButton")}
              </motion.button>

            </motion.form>
          ) : (
            // Register Form
            <motion.form
              key="register"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-2xl shadow-xl p-8 space-y-6"
            >
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-[#3a4b95] mb-2">
                  {t("loginPage.registerTitle")}
                </h1>
                <p className="text-gray-600">
                  {t("loginPage.registerSubtitle")}
                </p>
              </div>

              {/* Row 1: Full Name & Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-right">
                    <User className="w-4 h-4 inline ml-2" />
                    {t("loginPage.fullName")}*
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      setErrors({ ...errors, name: "" });
                    }}
                    onBlur={(e) => setErrors({ ...errors, name: validateName(e.target.value) })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-secondary focus:bg-white focus:outline-none transition-all text-right`}
                    placeholder={t("loginPage.fullName")}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1 text-right">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-right">
                    <Phone className="w-4 h-4 inline ml-2" />
                    {t("loginPage.phoneNumber")}*
                  </label>
                  <input
                    type="tel"
                    value={formData.primary_mobile}
                    onChange={(e) => {
                      setFormData({ ...formData, primary_mobile: e.target.value });
                      setErrors({ ...errors, primary_mobile: "" });
                    }}
                    onBlur={(e) => setErrors({ ...errors, primary_mobile: validateMobile(e.target.value) })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.primary_mobile ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-secondary focus:bg-white focus:outline-none transition-all text-right`}
                    placeholder="05XXXXXXXX"
                  />
                  {errors.primary_mobile && (
                    <p className="text-red-500 text-sm mt-1 text-right">{errors.primary_mobile}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Email & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-right">
                    <Mail className="w-4 h-4 inline ml-2" />
                    {t("loginPage.email")}*
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      setErrors({ ...errors, email: "" });
                    }}
                    onBlur={(e) => setErrors({ ...errors, email: validateEmail(e.target.value) })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-secondary focus:bg-white focus:outline-none transition-all text-right`}
                    placeholder="example@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1 text-right">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-right">
                    <Lock className="w-4 h-4 inline ml-2" />
                    {t("loginPage.password")}*
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      setErrors({ ...errors, password: "" });
                    }}
                    onBlur={(e) => setErrors({ ...errors, password: validatePassword(e.target.value) })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-secondary focus:bg-white focus:outline-none transition-all text-right`}
                    placeholder="••••••••"
                    minLength={8}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 text-right">{errors.password}</p>
                  )}
                </div>
              </div>

              {/* Row 3: National ID & City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-right">
                    <IdCard className="w-4 h-4 inline ml-2" />
                    {t("loginPage.nationalId")}*
                  </label>
                  <input
                    type="text"
                    value={formData.national_id}
                    onChange={(e) => {
                      setFormData({ ...formData, national_id: e.target.value });
                      setErrors({ ...errors, national_id: "" });
                    }}
                    onBlur={(e) => setErrors({ ...errors, national_id: validateNationalId(e.target.value) })}
                    className={`w-full px-4 py-3 rounded-lg border-2 ${errors.national_id ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-secondary focus:bg-white focus:outline-none transition-all text-right`}
                    placeholder="1XXXXXXXXX"
                  />
                  {errors.national_id && (
                    <p className="text-red-500 text-sm mt-1 text-right">{errors.national_id}</p>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-right">
                    {t("loginPage.city")}*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.city}
                      onChange={(e) => {
                        setFormData({ ...formData, city: e.target.value });
                        setErrors({ ...errors, city: validateCity(e.target.value) });
                      }}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-secondary focus:bg-white focus:outline-none transition-all appearance-none text-right cursor-pointer`}
                    >
                      <option value="">{t("loginPage.selectCity")}</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary pointer-events-none" />
                  </div>
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1 text-right">{errors.city}</p>
                  )}
                </div>
              </div>

              {/* Row 4: Bank IBAN & Bank Name */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-right">
                    <CreditCard className="w-4 h-4 inline ml-2" />
                    {t("loginPage.bankIban")}
                  </label>
                  <input
                    type="text"
                    value={formData.bank_iban}
                    onChange={(e) =>
                      setFormData({ ...formData, bank_iban: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 bg-gray-50 focus:border-secondary focus:bg-white focus:outline-none transition-all text-right"
                    placeholder="SA XXXXXXXXXXXXXXXXXXXXXX"
                  />
                  <p className="text-gray-500 text-xs mt-1 text-right">{t("loginPage.optional")}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2 text-right">
                    <Building2 className="w-4 h-4 inline ml-2" />
                    {t("loginPage.bankName")}*
                  </label>
                  <div className="relative">
                    <select
                      value={formData.bank_name}
                      onChange={(e) => {
                        setFormData({ ...formData, bank_name: e.target.value });
                        setErrors({ ...errors, bank_name: validateBankName(e.target.value) });
                      }}
                      className={`w-full px-4 py-3 rounded-lg border-2 ${errors.bank_name ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} focus:border-secondary focus:bg-white focus:outline-none transition-all appearance-none text-right cursor-pointer`}
                    >
                      <option value="">{t("loginPage.selectBank")}</option>
                      {banks.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary pointer-events-none" />
                  </div>
                  {errors.bank_name && (
                    <p className="text-red-500 text-sm mt-1 text-right">{errors.bank_name}</p>
                  )}
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#c4886a] text-white py-4 rounded-lg font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "..." : t("loginPage.registerButton")}
              </motion.button>
            </motion.form>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};

export default Login;
