import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  ShoppingBag,
  User,
  Package,
  Handshake,
  Calendar,
  DollarSign,
  Bell,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Edit,
  Save,
  Mail,
  Phone,
  MapPin,
  Building2,
  AlertCircle,
  Users,
  Image,
  Shield,
  Settings,
  BarChart3,
  Type,
  Loader2,
  CreditCard,
  Landmark,
  Plus,
  Trash2,
  Upload,
  X,
  ExternalLink,
  Check,
  Percent,
  Home,
  Link as LinkIcon,
  HelpCircle,
  Info,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateUser } from "../../store/slices/authSlice";
import SEO from "../../components/SEO";
import { toast } from "react-toastify";
import SliderTab from "./SlidersTab";
import HeroTab from "./HeroTab";
import FooterLinksTab from "./FooterLinksTab";
import AdminProductsTab from "./AdminProductsTab";
import MerchantOrdersTab from "./MerchantOrdersTab";
import SettingsTab from "./SettingsTab";
import ReportsTab from "./ReportsTab";
import MarqueeTab from "./MarqueeTab";
import UsersTab from "./UsersTab";
import OrdersTab from "./OrdersTab";
import ContactMessagesTab from "./ContactMessagesTab";
import InvestmentPayoutsTab from "./InvestmentPayoutsTab";
import MyInvestmentsTab from "./MyInvestmentsTab";
import DiscountCodesTab from "./DiscountCodesTab";
import FAQTab from "./FAQTab";
import AboutTab from "./AboutTab";
import PrivacyTab from "./PrivacyTab";
import ContactSettingTab from "./ContactSettingTab";
import {
  getDashboardStats,
  getRecentOrders,
  getAlerts,
  getDeferredSales,
  updateDeferredSale,
  updateMyProfile,
  getMyProfile,
  type DashboardStats,
  type RecentOrder,
  type Alert,
  type DeferredSale,
} from "../../services/dashboardService";
import {
  getAdminCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyLogoUrl,
  type Company,
  type CreateCompanyData,
} from "../../services/companyService";

type TabType =
  | "overview"
  | "orders"
  | "investments"
  | "profile"
  | "merchant"
  | "partnerships"
  | "seasonal"
  | "deferred"
  | "products"
  | "users"
  | "sliders"
  | "hero"
  | "adminProducts"
  | "merchantOrders"
  | "settings"
  | "reports"
  | "marquee"
  | "footerLinks"
  | "payouts"
  | "contact"
  | "discounts"
  | "faq"
  | "about"
  | "privacy"
  | "contactSettings";

import { useSearchParams } from "react-router-dom";

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Check for tab query parameter
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      [
        "overview",
        "orders",
        "profile",
        "merchant",
        "partnerships",
        "seasonal",
        "deferred",
        "products",
        "users",
        "sliders",
        "hero",
        "adminProducts",
        "merchantOrders",
        "settings",
        "reports",
        "marquee",
        "footerLinks",
        "payouts",
        "contact",
        "discounts",
        "faq",
        "about",
        "privacy",
        "contactSettings",
      ].includes(tabParam)
    ) {
      return tabParam as TabType;
    }
    return "overview";
  });
  const user = useAppSelector((state) => state.auth.user);
  console.log(user);

  // Update tab when query param changes
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      [
        "overview",
        "orders",
        "profile",
        "merchant",
        "partnerships",
        "seasonal",
        "deferred",
        "products",
        "users",
        "sliders",
        "hero",
        "adminProducts",
        "merchantOrders",
        "settings",
        "reports",
        "marquee",
        "footerLinks",
        "payouts",
        "contact",
        "discounts",
        "faq",
        "about",
        "privacy",
        "contactSettings",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam as TabType);
      // Clear the query param after setting tab
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  // Cities and Banks for dropdowns
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone:
      user?.mobiles?.find((m) => m.is_primary)?.mobile || user?.phone || "",
    city: user?.city || "",
    national_id: user?.national_id || "",
    bank_name: user?.bank_name || "",
    bank_iban: user?.bank_iban || "",
  });

  // Backend data state
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [deferredSales, setDeferredSales] = useState<DeferredSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingPartnership, setIsSubmittingPartnership] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Company management state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(false);
  const [addCompanyModalOpen, setAddCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyFormData, setCompanyFormData] = useState<CreateCompanyData>({
    name: "",
    activity: "",
    store_url: "",
    is_active: true,
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Fetch dashboard data on mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [statsData, ordersData, alertsData] = await Promise.all([
          getDashboardStats(),
          getRecentOrders(5),
          getAlerts(),
        ]);
        setStats(statsData);
        setRecentOrders(ordersData);
        setAlerts(alertsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error(t("dashboard.errors.loadFailed"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [t]);

  // Fetch deferred sales when tab is active
  useEffect(() => {
    if (activeTab === "deferred") {
      const fetchDeferredSales = async () => {
        try {
          const data = await getDeferredSales();
          setDeferredSales(data.deferred_sales);
        } catch (error) {
          console.error("Error fetching deferred sales:", error);
        }
      };
      fetchDeferredSales();
    }
  }, [activeTab]);

  // Fetch profile data when profile tab is active
  useEffect(() => {
    if (activeTab === "profile" && user) {
      const fetchProfile = async () => {
        try {
          const profileResponse = await getMyProfile();
          setProfileData({
            name: profileResponse.name || "",
            email: profileResponse.email || "",
            phone:
              profileResponse.mobiles?.find(
                (m: { is_primary: boolean }) => m.is_primary
              )?.mobile || "",
            city: profileResponse.city || "",
            national_id: profileResponse.national_id || "",
            bank_name: profileResponse.bank_name || "",
            bank_iban: profileResponse.bank_iban || "",
          });
        } catch (error) {
          console.error("Error fetching profile:", error);
          toast.error(
            t("dashboard.profile.loadError") || "Failed to load profile data"
          );
        }
      };
      fetchProfile();
    }
  }, [activeTab, user, t]);

  // Fetch companies when partnerships tab is active
  useEffect(() => {
    if (activeTab === "partnerships") {
      const fetchCompanies = async () => {
        try {
          setIsLoadingCompanies(true);
          const response = await getAdminCompanies();
          setCompanies(response.data.companies);
        } catch (error) {
          console.error("Error fetching companies:", error);
          toast.error(t("dashboard.partnerships.loadError"));
        } finally {
          setIsLoadingCompanies(false);
        }
      };
      fetchCompanies();
    }
  }, [activeTab, t]);

  // User tabs - visible to all authenticated users
  const userTabs: Array<{
    id: TabType;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }> = [
    {
      id: "overview" as TabType,
      icon: LayoutDashboard,
      label: t("dashboard.tabs.overview"),
    },
    {
      id: "merchantOrders" as TabType,
      icon: DollarSign,
      label: t("dashboard.tabs.merchantOrders"),
    },
    {
      id: "investments" as TabType,
      icon: TrendingUp,
      label: t("dashboard.tabs.investments"),
    },
    {
      id: "profile" as TabType,
      icon: User,
      label: t("dashboard.tabs.profile"),
    },
    {
      id: "settings" as TabType,
      icon: Settings,
      label: t("dashboard.tabs.settings"),
    },
  ];

  // Admin-only tabs - only visible to admins
  const adminTabs: Array<{
    id: TabType;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }> = [
    {
      id: "orders" as TabType,
      icon: ShoppingBag,
      label: t("dashboard.tabs.orders"),
    },
    {
      id: "users" as TabType,
      icon: Users,
      label: t("dashboard.tabs.users"),
    },
    {
      id: "products" as TabType,
      icon: Shield,
      label: t("dashboard.tabs.products"),
    },
    {
      id: "partnerships" as TabType,
      icon: Handshake,
      label: t("dashboard.tabs.partnerships"),
    },
    {
      id: "sliders" as TabType,
      icon: Image,
      label: t("dashboard.tabs.sliders"),
    },
    {
      id: "hero" as TabType,
      icon: Home,
      label: t("dashboard.tabs.hero"),
    },
    {
      id: "marquee" as TabType,
      icon: Type,
      label: t("dashboard.tabs.marquee"),
    },
    {
      id: "footerLinks" as TabType,
      icon: LinkIcon,
      label: t("dashboard.tabs.footerLinks"),
    },
    {
      id: "payouts" as TabType,
      icon: DollarSign,
      label: t("dashboard.tabs.payouts"),
    },
    {
      id: "reports" as TabType,
      icon: BarChart3,
      label: t("dashboard.tabs.reports"),
    },
    {
      id: "contact" as TabType,
      icon: Mail,
      label: t("dashboard.tabs.contact"),
    },
    {
      id: "discounts" as TabType,
      icon: Percent,
      label: t("dashboard.tabs.discounts"),
    },
    {
      id: "faq" as TabType,
      icon: HelpCircle,
      label: t("dashboard.tabs.faq"),
    },
    {
      id: "about" as TabType,
      icon: Info,
      label: t("dashboard.tabs.about"),
    },
    {
      id: "privacy" as TabType,
      icon: Shield,
      label: t("dashboard.tabs.privacy"),
    },
    {
      id: "contactSettings" as TabType,
      icon: Mail,
      label: t("dashboard.tabs.contactSettings"),
    },
  ];

  // Combine tabs based on user role
  const tabs = user?.role === "ADMIN" ? [...userTabs, ...adminTabs] : userTabs;

  const handleSaveProfile = async () => {
    try {
      setIsSavingProfile(true);
      await updateMyProfile({
        name: profileData.name,
        email: profileData.email,
        city: profileData.city,
        national_id: profileData.national_id,
        bank_name: profileData.bank_name,
        bank_iban: profileData.bank_iban,
        mobile: profileData.phone,
      });
      dispatch(
        updateUser({
          ...user!,
          ...profileData,
          // Update legacy phone field as well
          phone: profileData.phone,
        })
      );
      setIsEditingProfile(false);
      toast.success(t("dashboard.profile.updateSuccess"));
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(t("dashboard.profile.updateError"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Company CRUD handlers
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(t("dashboard.partnerships.logoSizeError"));
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const openAddCompanyModal = () => {
    setEditingCompany(null);
    setCompanyFormData({
      name: "",
      activity: "",
      store_url: "",
      is_active: true,
    });
    setLogoFile(null);
    setLogoPreview("");
    setAddCompanyModalOpen(true);
  };

  const openEditCompanyModal = (company: Company) => {
    setEditingCompany(company);
    setCompanyFormData({
      name: company.name,
      activity: company.activity || "",
      store_url: company.store_url || "",
      is_active: company.is_active,
    });
    setLogoFile(null);
    setLogoPreview(company.id ? getCompanyLogoUrl(company.id) : "");
    setAddCompanyModalOpen(true);
  };

  const closeCompanyModal = () => {
    setAddCompanyModalOpen(false);
    setEditingCompany(null);
    setCompanyFormData({
      name: "",
      activity: "",
      store_url: "",
      is_active: true,
    });
    setLogoFile(null);
    setLogoPreview("");
  };

  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!logoFile && !editingCompany) {
      toast.error(t("dashboard.partnerships.logoRequired"));
      return;
    }

    try {
      setIsSubmittingPartnership(true);

      if (editingCompany) {
        // Update existing company
        await updateCompany({
          id: editingCompany.id,
          ...companyFormData,
          logo: logoFile || undefined,
        });
        toast.success(t("dashboard.partnerships.updateSuccess"));
      } else {
        // Create new company
        await createCompany({
          ...companyFormData,
          logo: logoFile!,
        });
        toast.success(t("dashboard.partnerships.createSuccess"));
      }

      // Refresh companies list
      const response = await getAdminCompanies();
      setCompanies(response.data.companies);
      closeCompanyModal();
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error(
        editingCompany
          ? t("dashboard.partnerships.updateError")
          : t("dashboard.partnerships.createError")
      );
    } finally {
      setIsSubmittingPartnership(false);
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    if (!window.confirm(t("dashboard.partnerships.confirmDelete"))) {
      return;
    }

    try {
      await deleteCompany(companyId);
      setCompanies((prev) => prev.filter((c) => c.id !== companyId));
      toast.success(t("dashboard.partnerships.deleteSuccess"));
    } catch (error) {
      console.error("Error deleting company:", error);
      toast.error(t("dashboard.partnerships.deleteError"));
    }
  };

  // Handle deferred sale approval/rejection (Admin)
  const handleDeferredSaleAction = async (
    id: number,
    status: "approved" | "rejected"
  ) => {
    try {
      await updateDeferredSale(id, { status });
      setDeferredSales((prev) =>
        prev.map((sale) => (sale.id === id ? { ...sale, status } : sale))
      );
      toast.success(
        status === "approved"
          ? t("dashboard.deferred.approveSuccess")
          : t("dashboard.deferred.rejectSuccess")
      );
    } catch (error) {
      console.error("Error updating deferred sale:", error);
      toast.error(t("dashboard.deferred.actionError"));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "processing":
        return <Package className="w-4 h-4" />;
      case "shipped":
        return <Truck className="w-4 h-4" />;
      case "delivered":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <>
      <SEO
        title={t("dashboard.seo.title")}
        description={t("dashboard.seo.description")}
        keywords={t("dashboard.seo.keywords")}
      />
      <div className="min-h-screen bg-gray-50">
        <div className="w-[95%] max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {t("dashboard.title")}
            </h1>
            <p className="text-gray-600">
              {t("dashboard.welcome")}, {user?.name}
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-2 border-b border-gray-200 min-w-max">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-3 font-semibold transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-600 hover:text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Loading State */}
                {isLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Card 1: Total Revenue (إجمالي الإيرادات) */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-green-100">
                            {isArabic ? "إجمالي الإيرادات" : "Total Revenue"}
                          </h3>
                          <div className="p-2 bg-white/20 rounded-lg">
                            <DollarSign className="w-6 h-6" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold mb-2">
                          {(stats?.revenue.total || 0).toFixed(2)}{" "}
                          {t("common.currency")}
                        </p>
                        <div className="flex items-center justify-between text-sm text-green-100">
                          {/* <span>{isArabic ? "الأرباح" : "Profit"}: {(stats?.revenue.profit || 0).toFixed(2)}</span> */}
                          {/* <span className={`flex items-center gap-1 ${(stats?.growth.revenue || 0) >= 0 ? "" : "text-red-200"
                            }`}>
                            {(stats?.growth.revenue || 0) >= 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                            {stats?.growth.revenue || 0}%
                          </span> */}
                        </div>
                      </motion.div>

                      {/* Card 2: Wallet (Direct) Orders */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-[#3a4b95] to-[#2a3a75] rounded-xl shadow-lg p-6 text-white"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-blue-100">
                            {isArabic
                              ? "طلبات المحفظة (مباشر)"
                              : "Wallet (Direct) Orders"}
                          </h3>
                          <div className="p-2 bg-white/20 rounded-lg">
                            <CreditCard className="w-6 h-6" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold mb-2">
                          {stats?.wallet_orders?.total ||
                            stats?.orders.sale_orders ||
                            0}
                        </p>
                        <div className="flex items-center justify-between text-sm text-blue-100">
                          <span>
                            {isArabic ? "الإيرادات" : "Revenue"}:{" "}
                            {(
                              stats?.wallet_orders?.revenue ||
                              stats?.revenue.wallet_revenue ||
                              0
                            ).toFixed(2)}
                          </span>
                          <span>
                            {isArabic ? "مكتمل" : "Completed"}:{" "}
                            {stats?.wallet_orders?.completed || 0}
                          </span>
                        </div>
                      </motion.div>

                      {/* Card 3: Resale (Investment) Orders */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gradient-to-br from-[#c4886a] to-[#b47858] rounded-xl shadow-lg p-6 text-white"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold text-white">
                            {isArabic
                              ? "طلبات إعادة البيع (أرباح)"
                              : "Resale (Profit) Orders"}
                          </h3>
                          <div className="p-2 bg-white/20 rounded-lg">
                            <TrendingUp className="w-6 h-6" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold mb-2">
                          {stats?.investment_orders?.total ||
                            stats?.orders.resale_orders ||
                            0}
                        </p>
                        <div className="flex items-center justify-between text-sm text-white">
                          <span>
                            {isArabic ? "الإيرادات" : "Revenue"}:{" "}
                            {(
                              stats?.investment_orders?.revenue ||
                              stats?.revenue.investment_revenue ||
                              0
                            ).toFixed(2)}
                          </span>
                          {/* <span>{isArabic ? "العوائد المتوقعة" : "Expected Returns"}: {(stats?.investments.expected_returns || 0).toFixed(2)}</span> */}
                        </div>
                      </motion.div>
                    </div>

                    {/* Smart Alerts - Admin Only */}
                    {user?.role === "ADMIN" && (
                      <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Bell className="w-6 h-6 text-primary" />
                          <h2 className="text-xl font-bold text-gray-800">
                            {t("dashboard.alerts.title")}
                          </h2>
                        </div>
                        <div className="space-y-3">
                          {alerts.length > 0 ? (
                            alerts.map((alert, index) => (
                              <div
                                key={index}
                                className={`flex items-start gap-3 p-4 rounded-lg ${
                                  alert.type === "warning"
                                    ? "bg-yellow-50"
                                    : alert.type === "error"
                                      ? "bg-red-50"
                                      : alert.type === "success"
                                        ? "bg-green-50"
                                        : "bg-blue-50"
                                }`}
                              >
                                <AlertCircle
                                  className={`w-5 h-5 mt-0.5 ${
                                    alert.type === "warning"
                                      ? "text-yellow-600"
                                      : alert.type === "error"
                                        ? "text-red-600"
                                        : alert.type === "success"
                                          ? "text-green-600"
                                          : "text-blue-600"
                                  }`}
                                />
                                <div>
                                  <p className="font-semibold text-gray-800">
                                    {alert.title}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {alert.message}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-gray-600 text-center py-4">
                              {t("dashboard.alerts.noAlerts")}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Recent Orders Summary */}
                    <div className="bg-white rounded-xl shadow-md p-6">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">
                        {t("dashboard.recentOrders")}
                      </h2>
                      {recentOrders.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">
                          {t("dashboard.noOrders")}
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {recentOrders.map((order) => (
                            <div
                              key={order.id}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all"
                            >
                              <div>
                                <p className="font-semibold text-gray-800">
                                  {order.order_number}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {new Date(
                                    order.created_at
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <p className="font-bold text-gray-800">
                                  {order.total_amount.toFixed(2)}{" "}
                                  {t("common.currency")}
                                </p>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(
                                    order.status
                                  )}`}
                                >
                                  {getStatusIcon(order.status)}
                                  {t(`dashboard.status.${order.status}`)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
            {/* Sliders Tab (Admin Only) */}
            {activeTab === "sliders" && user?.role === "ADMIN" && <SliderTab />}

            {/* Hero Tab (Admin Only) */}
            {activeTab === "hero" && user?.role === "ADMIN" && <HeroTab />}

            {/* Marquee Tab (Admin Only) */}
            {activeTab === "marquee" && user?.role === "ADMIN" && (
              <MarqueeTab />
            )}

            {/* Footer Links Tab (Admin Only) */}
            {activeTab === "footerLinks" && user?.role === "ADMIN" && (
              <FooterLinksTab />
            )}

            {/* Investment Payouts Tab (Admin Only) */}
            {activeTab === "payouts" && user?.role === "ADMIN" && (
              <InvestmentPayoutsTab />
            )}

            {/* Contact Messages Tab (Admin Only) */}
            {activeTab === "contact" && user?.role === "ADMIN" && (
              <ContactMessagesTab />
            )}

            {/* Discount Codes Tab (Admin Only) */}
            {activeTab === "discounts" && user?.role === "ADMIN" && (
              <DiscountCodesTab />
            )}

            {/* FAQ Tab (Admin Only) */}
            {activeTab === "faq" && user?.role === "ADMIN" && <FAQTab />}

            {/* About Tab (Admin Only) */}
            {activeTab === "about" && user?.role === "ADMIN" && <AboutTab />}

            {/* Privacy Tab (Admin Only) */}
            {activeTab === "privacy" && user?.role === "ADMIN" && (
              <PrivacyTab />
            )}

            {/* Contact Settings Tab (Admin Only) */}
            {activeTab === "contactSettings" && user?.role === "ADMIN" && (
              <ContactSettingTab />
            )}

            {/* Orders Tab - Integrated with Backend API */}
            {activeTab === "orders" && <OrdersTab />}

            {/* My Investments Tab - User Investment Tracking */}
            {activeTab === "investments" && <MyInvestmentsTab />}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      {t("dashboard.profile.title")}
                    </h2>
                    <button
                      onClick={() =>
                        isEditingProfile
                          ? handleSaveProfile()
                          : setIsEditingProfile(true)
                      }
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50"
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isEditingProfile ? (
                        <>
                          <Save className="w-4 h-4" />
                          {t("dashboard.profile.save")}
                        </>
                      ) : (
                        <>
                          <Edit className="w-4 h-4" />
                          {t("dashboard.profile.edit")}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phone Number */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Phone className="w-4 h-4" />
                        {t("dashboard.profile.phone")}
                      </label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                        dir="ltr"
                      />
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <User className="w-4 h-4" />
                        {t("dashboard.profile.name")}
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Mail className="w-4 h-4" />
                        {t("dashboard.profile.email")}
                      </label>
                      <input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    {/* City */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <MapPin className="w-4 h-4" />
                        {t("dashboard.profile.city")}
                      </label>
                      <select
                        value={profileData.city}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            city: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <option value="">{t("loginPage.selectCity")}</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* National ID */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <CreditCard className="w-4 h-4" />
                        {t("loginPage.nationalId")}
                      </label>
                      <input
                        type="text"
                        value={profileData.national_id}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            national_id: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                      />
                    </div>

                    {/* Bank Name */}
                    <div>
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <Landmark className="w-4 h-4" />
                        {t("loginPage.bankName")}
                      </label>
                      <select
                        value={profileData.bank_name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bank_name: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                      >
                        <option value="">{t("loginPage.selectBank")}</option>
                        {banks.map((bank) => (
                          <option key={bank} value={bank}>
                            {bank}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* IBAN */}
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                        <CreditCard className="w-4 h-4" />
                        {t("loginPage.bankIban")}
                      </label>
                      <input
                        type="text"
                        value={profileData.bank_iban}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            bank_iban: e.target.value,
                          })
                        }
                        disabled={!isEditingProfile}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Merchant Tab */}
            {activeTab === "merchant" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">
                    {t("dashboard.merchant.title")}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {t("dashboard.merchant.accountType")}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {user?.businessType || "Not Set"}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-gray-800 mb-2">
                        {t("dashboard.merchant.memberSince")}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 p-6 bg-gradient-to-r from-primary to-secondary rounded-lg text-white">
                    <h3 className="text-lg font-bold mb-2">
                      {t("dashboard.merchant.upgradeTitle")}
                    </h3>
                    <p className="text-sm mb-4">
                      {t("dashboard.merchant.upgradeDesc")}
                    </p>
                    <button className="px-6 py-2 bg-white text-primary rounded-lg font-semibold hover:bg-opacity-90 transition-all">
                      {t("dashboard.merchant.upgradeCta")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Partnerships Tab - Company Management */}
            {activeTab === "partnerships" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-6 h-6 text-primary" />
                      <h2 className="text-xl font-bold text-gray-800">
                        {t("dashboard.partnerships.title")}
                      </h2>
                    </div>
                    <button
                      onClick={openAddCompanyModal}
                      className="flex items-center gap-2 px-4 py-2 bg-[#3a4b95] text-white rounded-lg hover:bg-opacity-90 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      {t("dashboard.partnerships.addCompany")}
                    </button>
                  </div>

                  {isLoadingCompanies ? (
                    <div className="flex justify-center items-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                  ) : companies.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Building2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p>{t("dashboard.partnerships.noCompanies")}</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              className={`px-4 py-3 ${isArabic ? "text-right" : "text-left"} text-xs font-semibold text-gray-600 uppercase`}
                            >
                              {t("dashboard.partnerships.logo")}
                            </th>
                            <th
                              className={`px-4 py-3 ${isArabic ? "text-right" : "text-left"} text-xs font-semibold text-gray-600 uppercase`}
                            >
                              {t("dashboard.partnerships.companyName")}
                            </th>
                            <th
                              className={`px-4 py-3 ${isArabic ? "text-right" : "text-left"} text-xs font-semibold text-gray-600 uppercase`}
                            >
                              {t("dashboard.partnerships.businessActivity")}
                            </th>
                            <th
                              className={`px-4 py-3 ${isArabic ? "text-right" : "text-left"} text-xs font-semibold text-gray-600 uppercase`}
                            >
                              {t("dashboard.partnerships.storeUrl")}
                            </th>
                            <th
                              className={`px-4 py-3 ${isArabic ? "text-right" : "text-left"} text-xs font-semibold text-gray-600 uppercase`}
                            >
                              {t("dashboard.partnerships.status")}
                            </th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                              {t("dashboard.partnerships.actions")}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {companies.map((company) => (
                            <tr key={company.id} className="hover:bg-gray-50">
                              <td className="px-4 py-4">
                                <img
                                  src={getCompanyLogoUrl(company.id)}
                                  alt={company.name}
                                  className="w-12 h-12 object-cover rounded-lg"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">🏢</text></svg>';
                                  }}
                                />
                              </td>
                              <td
                                className={`px-4 py-4 font-medium text-gray-800 ${isArabic ? "text-right" : "text-left"}`}
                              >
                                {company.name}
                              </td>
                              <td
                                className={`px-4 py-4 text-gray-600 ${isArabic ? "text-right" : "text-left"}`}
                              >
                                {company.activity || "-"}
                              </td>
                              <td
                                className={`px-4 py-4 ${isArabic ? "text-right" : "text-left"}`}
                              >
                                {company.store_url ? (
                                  <a
                                    href={company.store_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {t("dashboard.partnerships.visitStore")}
                                  </a>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td
                                className={`px-4 py-4 ${isArabic ? "text-right" : "text-left"}`}
                              >
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    company.is_active
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {company.is_active
                                    ? t("dashboard.partnerships.active")
                                    : t("dashboard.partnerships.inactive")}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() =>
                                      openEditCompanyModal(company)
                                    }
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    title={t(
                                      "dashboard.partnerships.editCompany"
                                    )}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleDeleteCompany(company.id)
                                    }
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title={t(
                                      "dashboard.partnerships.deleteCompany"
                                    )}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Add/Edit Company Modal */}
                <AnimatePresence>
                  {addCompanyModalOpen && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                      onClick={closeCompanyModal}
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                          <h3 className="text-xl font-bold text-gray-800">
                            {editingCompany
                              ? t("dashboard.partnerships.editCompany")
                              : t("dashboard.partnerships.addCompany")}
                          </h3>
                          <button
                            onClick={closeCompanyModal}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form
                          onSubmit={handleSubmitCompany}
                          className="p-6 space-y-6"
                        >
                          {/* Company Logo Upload */}
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <Upload className="w-4 h-4" />
                              {t("dashboard.partnerships.logo")}
                            </label>
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                {logoPreview ? (
                                  <img
                                    src={logoPreview}
                                    alt="Logo preview"
                                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="w-24 h-24 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                                    <Building2 className="w-8 h-8 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLogoChange}
                                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Max size: 2MB. Recommended: 200x200px
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Company Name */}
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <Building2 className="w-4 h-4" />
                              {t("dashboard.partnerships.companyName")} *
                            </label>
                            <input
                              type="text"
                              value={companyFormData.name}
                              onChange={(e) =>
                                setCompanyFormData({
                                  ...companyFormData,
                                  name: e.target.value,
                                })
                              }
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                          </div>

                          {/* Activity */}
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <Package className="w-4 h-4" />
                              {t("dashboard.partnerships.businessActivity")}
                            </label>
                            <input
                              type="text"
                              value={companyFormData.activity}
                              onChange={(e) =>
                                setCompanyFormData({
                                  ...companyFormData,
                                  activity: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="e.g., Electronics, Fashion, Food"
                            />
                          </div>

                          {/* Store URL */}
                          <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                              <ExternalLink className="w-4 h-4" />
                              {t("dashboard.partnerships.storeUrl")}
                            </label>
                            <input
                              type="url"
                              value={companyFormData.store_url}
                              onChange={(e) =>
                                setCompanyFormData({
                                  ...companyFormData,
                                  store_url: e.target.value,
                                })
                              }
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                              placeholder="https://example.com"
                              dir="ltr"
                            />
                          </div>

                          {/* Active Status */}
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              id="companyActive"
                              checked={companyFormData.is_active}
                              onChange={(e) =>
                                setCompanyFormData({
                                  ...companyFormData,
                                  is_active: e.target.checked,
                                })
                              }
                              className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-2 focus:ring-primary"
                            />
                            <label
                              htmlFor="companyActive"
                              className="text-sm font-medium text-gray-700"
                            >
                              {t("dashboard.partnerships.activeCompanyLabel")}
                            </label>
                          </div>

                          {/* Submit Button */}
                          <div className="flex items-center gap-3 pt-4">
                            <button
                              type="submit"
                              disabled={isSubmittingPartnership}
                              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all font-semibold disabled:opacity-50"
                            >
                              {isSubmittingPartnership ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  {editingCompany
                                    ? "Updating..."
                                    : "Creating..."}
                                </>
                              ) : (
                                <>
                                  <Check className="w-4 h-4" />
                                  {editingCompany
                                    ? t("dashboard.partnerships.editCompany")
                                    : t("dashboard.partnerships.addCompany")}
                                </>
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={closeCompanyModal}
                              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Seasonal Tab */}
            {activeTab === "seasonal" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <Calendar className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-gray-800">
                      {t("dashboard.seasonal.title")}
                    </h2>
                  </div>

                  <div className="bg-gradient-to-r from-[#c4886a] to-[#b47858] rounded-xl p-8 text-white mb-6">
                    <h3 className="text-2xl font-bold mb-2">
                      {t("dashboard.seasonal.comingSoon")}
                    </h3>
                    <p className="text-lg mb-4">
                      {t("dashboard.seasonal.desc")}
                    </p>
                    <div className="flex items-center gap-4 text-xl font-bold">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <div className="text-3xl">15</div>
                        <div className="text-xs">
                          {t("dashboard.seasonal.days")}
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <div className="text-3xl">08</div>
                        <div className="text-xs">
                          {t("dashboard.seasonal.hours")}
                        </div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <div className="text-3xl">42</div>
                        <div className="text-xs">
                          {t("dashboard.seasonal.minutes")}
                        </div>
                      </div>
                    </div>
                    <button className="mt-6 px-8 py-3 bg-white text-[#c4886a] rounded-lg font-bold hover:bg-opacity-90 transition-all">
                      {t("dashboard.seasonal.register")}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t("dashboard.seasonal.blackFriday")}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t("dashboard.seasonal.blackFridayDesc")}
                      </p>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-2">
                        {t("dashboard.seasonal.newYear")}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {t("dashboard.seasonal.newYearDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Deferred Payment Tab */}
            {activeTab === "deferred" && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <DollarSign className="w-6 h-6 text-primary" />
                    <h2 className="text-xl font-bold text-gray-800">
                      {t("dashboard.deferred.title")}
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {deferredSales.length === 0 ? (
                      <p className="text-gray-600 text-center py-8">
                        {t("dashboard.deferred.noRequests")}
                      </p>
                    ) : (
                      deferredSales.map((sale) => (
                        <div
                          key={sale.id}
                          className="border border-gray-200 rounded-lg p-6"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">
                                {sale.product.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {t("dashboard.deferred.requestDate")}:{" "}
                                {new Date(sale.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-semibold w-fit mt-2 md:mt-0 ${
                                sale.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : sale.status === "approved"
                                    ? "bg-green-100 text-green-800"
                                    : sale.status === "rejected"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {t(`dashboard.status.${sale.status}`)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                {t("dashboard.deferred.originalPrice")}
                              </p>
                              <p className="text-lg font-bold text-gray-800">
                                {sale.original_price.toFixed(2)}{" "}
                                {t("common.currency")}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                {t("dashboard.deferred.requestedPrice")}
                              </p>
                              <p className="text-lg font-bold text-primary">
                                {sale.requested_price.toFixed(2)}{" "}
                                {t("common.currency")}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                {t("dashboard.deferred.profit")}
                              </p>
                              <p className="text-lg font-bold text-green-600">
                                {sale.profit_amount.toFixed(2)}{" "}
                                {t("common.currency")}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                {t("dashboard.deferred.profitPercent")}
                              </p>
                              <p className="text-lg font-bold text-green-600">
                                {sale.profit_percentage.toFixed(1)}%
                              </p>
                            </div>
                          </div>

                          {user?.role === "ADMIN" &&
                            sale.status === "pending" && (
                              <div className="flex gap-3">
                                <button
                                  onClick={() =>
                                    handleDeferredSaleAction(
                                      sale.id,
                                      "approved"
                                    )
                                  }
                                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-semibold"
                                >
                                  {t("dashboard.deferred.approve")}
                                </button>
                                <button
                                  onClick={() =>
                                    handleDeferredSaleAction(
                                      sale.id,
                                      "rejected"
                                    )
                                  }
                                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all font-semibold"
                                >
                                  {t("dashboard.deferred.reject")}
                                </button>
                              </div>
                            )}
                        </div>
                      ))
                    )}

                    <div className="p-6 bg-blue-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-semibold text-gray-800 mb-1">
                            {t("dashboard.deferred.infoTitle")}
                          </p>
                          <p className="text-sm text-gray-600">
                            {t("dashboard.deferred.infoDesc")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Tab - Use AdminProductsTab for backend integration */}
            {activeTab === "products" && <AdminProductsTab />}

            {/* Merchant Orders Tab */}
            {activeTab === "merchantOrders" && <MerchantOrdersTab />}

            {/* Admin Products Tab (Admin Only) */}
            {activeTab === "adminProducts" && user?.role === "ADMIN" && (
              <AdminProductsTab />
            )}

            {/* Users Tab (Admin Only) */}
            {activeTab === "users" && user?.role === "ADMIN" && <UsersTab />}

            {/* Settings Tab */}
            {activeTab === "settings" && <SettingsTab />}

            {/* Reports Tab */}
            {activeTab === "reports" && <ReportsTab />}
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
