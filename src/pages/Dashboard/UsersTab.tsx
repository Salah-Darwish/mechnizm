import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Users,
  Shield,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Building,
  Eye,
  EyeOff,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
  type CreateUserData,
  type UpdateUserData,
} from "../../services/userService";
import type { AxiosError } from "axios";

interface FormState {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role: 'USER' | 'ADMIN';
  city: string;
  national_id: string;
  bank_iban: string;
  bank_name: string;
  primary_mobile: string;
}

const UsersTab = () => {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [roleFilter, setRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const initialFormState: FormState = {
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "USER",
    city: "",
    national_id: "",
    bank_iban: "",
    bank_name: "",
    primary_mobile: "",
  };
  
  const [formData, setFormData] = useState<FormState>(initialFormState);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || t("dashboard.users.failedLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter users based on role and search
  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesSearch = 
      searchQuery === "" ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const openAddModal = () => {
    setEditingUser(null);
    setFormData(initialFormState);
    setShowPassword(false);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      password_confirmation: "",
      role: user.role,
      city: user.city || "",
      national_id: user.national_id || "",
      bank_iban: user.bank_iban || "",
      bank_name: user.bank_name || "",
      primary_mobile: user.mobiles?.find(m => m.is_primary)?.mobile || "",
    });
    setShowPassword(false);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email) {
      toast.error(t("dashboard.users.fillRequired"));
      return;
    }

    if (!editingUser && (!formData.password || formData.password !== formData.password_confirmation)) {
      toast.error(t("dashboard.users.passwordMismatch"));
      return;
    }

    setSubmitting(true);

    try {
      if (editingUser) {
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          city: formData.city || undefined,
          national_id: formData.national_id || undefined,
          bank_iban: formData.bank_iban || undefined,
          bank_name: formData.bank_name || undefined,
        };
        
        if (formData.password) {
          updateData.password = formData.password;
          updateData.password_confirmation = formData.password_confirmation;
        }

        await updateUser(editingUser.id, updateData);
        toast.success(t("dashboard.users.updateSuccess"));
      } else {
        const createData: CreateUserData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          role: formData.role,
          city: formData.city || undefined,
          national_id: formData.national_id || undefined,
          bank_iban: formData.bank_iban || undefined,
          bank_name: formData.bank_name || undefined,
          primary_mobile: formData.primary_mobile || undefined,
        };

        await createUser(createData);
        toast.success(t("dashboard.users.createSuccess"));
      }
      
      setModalOpen(false);
      fetchUsers();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string; errors?: Record<string, string[]> }>;
      if (axiosError.response?.data?.errors) {
        const firstError = Object.values(axiosError.response.data.errors)[0];
        toast.error(firstError[0]);
      } else {
        toast.error(axiosError.response?.data?.message || t("dashboard.users.error"));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(t("dashboard.users.deleteConfirm"))) return;

    try {
      await deleteUser(id);
      toast.success(t("dashboard.users.deleteSuccess"));
      fetchUsers();
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(axiosError.response?.data?.message || t("dashboard.users.error"));
    }
  };

  const adminCount = users.filter(u => u.role === 'ADMIN').length;
  const userCount = users.filter(u => u.role === 'USER').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{t("dashboard.users.title")}</h2>
          <p className="text-gray-600">{t("dashboard.users.subtitle")}</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-[#c4886a] text-white rounded-lg hover:bg-opacity-90 transition-all font-medium"
        >
          <Plus className="w-5 h-5" />
          {t("dashboard.users.addUser")}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{t("dashboard.users.totalUsers")}</p>
            <p className="text-2xl font-bold text-gray-800">{users.length}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <Shield className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{t("dashboard.users.admins")}</p>
            <p className="text-2xl font-bold text-gray-800">{adminCount}</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <UserIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">{t("dashboard.users.customers")}</p>
            <p className="text-2xl font-bold text-gray-800">{userCount}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("dashboard.users.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
            />
          </div>
          
          {/* Role Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setRoleFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                roleFilter === "all"
                  ? "bg-[#c4886a] text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("dashboard.users.all")} ({users.length})
            </button>
            <button
              onClick={() => setRoleFilter("ADMIN")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                roleFilter === "ADMIN"
                  ? "bg-purple-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("dashboard.users.admins")} ({adminCount})
            </button>
            <button
              onClick={() => setRoleFilter("USER")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                roleFilter === "USER"
                  ? "bg-green-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {t("dashboard.users.customers")} ({userCount})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4886a]"></div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>{t("dashboard.users.noUsers")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className={`px-6 py-4 text-sm font-bold text-gray-700 ${isArabic ? 'text-right' : 'text-left'}`}>
                    {t("dashboard.users.name")}
                  </th>
                  <th className={`px-6 py-4 text-sm font-bold text-gray-700 ${isArabic ? 'text-right' : 'text-left'}`}>
                    {t("dashboard.users.email")}
                  </th>
                  <th className={`px-6 py-4 text-sm font-bold text-gray-700 ${isArabic ? 'text-right' : 'text-left'}`}>
                    {t("dashboard.users.role")}
                  </th>
                  <th className={`px-6 py-4 text-sm font-bold text-gray-700 ${isArabic ? 'text-right' : 'text-left'}`}>
                    {t("dashboard.users.city")}
                  </th>
                  <th className={`px-6 py-4 text-sm font-bold text-gray-700 ${isArabic ? 'text-right' : 'text-left'}`}>
                    {t("dashboard.users.joined")}
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-gray-700">
                    {t("dashboard.users.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-all">
                    <td className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'}`}>
                      <div className={`flex items-center gap-3 ${isArabic ? 'justify-end flex-row-reverse' : 'justify-start'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c4886a] to-[#ff7a5c] flex items-center justify-center text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800">{user.name}</span>
                      </div>
                    </td>
                    <td className={`px-6 py-4 text-gray-600 ${isArabic ? 'text-right' : 'text-left'}`}>
                      {user.email}
                    </td>
                    <td className={`px-6 py-4 ${isArabic ? 'text-right' : 'text-left'}`}>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {user.role === 'ADMIN' ? t("dashboard.users.admin") : t("dashboard.users.customer")}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-gray-600 ${isArabic ? 'text-right' : 'text-left'}`}>
                      {user.city || '-'}
                    </td>
                    <td className={`px-6 py-4 text-sm text-gray-600 ${isArabic ? 'text-right' : 'text-left'}`}>
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(user)}
                          disabled={user.role === 'USER'}
                          className={`p-2 rounded-lg transition-all ${
                            user.role === 'USER'
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          title={user.role === 'USER' ? t("dashboard.users.cannotEditCustomer") : t("dashboard.users.edit")}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          disabled={user.role === 'USER'}
                          className={`p-2 rounded-lg transition-all ${
                            user.role === 'USER'
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-600 hover:bg-red-50'
                          }`}
                          title={user.role === 'USER' ? t("dashboard.users.cannotDeleteCustomer") : t("dashboard.users.delete")}
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

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => !submitting && setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-xl my-8 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  {editingUser ? t("dashboard.users.editUser") : t("dashboard.users.addUser")}
                </h3>
                <button
                  onClick={() => !submitting && setModalOpen(false)}
                  className="text-gray-500 hover:text-red-600 disabled:opacity-50"
                  disabled={submitting}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      {t("dashboard.users.name")} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder={t("dashboard.users.namePlaceholder")}
                      required
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {t("dashboard.users.email")} *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder={t("dashboard.users.emailPlaceholder")}
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {t("dashboard.users.password")} {!editingUser && '*'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent pr-10"
                        placeholder={editingUser ? t("dashboard.users.leaveBlank") : t("dashboard.users.passwordPlaceholder")}
                        required={!editingUser}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      {t("dashboard.users.confirmPassword")} {!editingUser && '*'}
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder={t("dashboard.users.confirmPasswordPlaceholder")}
                      required={!editingUser && formData.password !== ''}
                    />
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      {t("dashboard.users.role")} *
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as 'USER' | 'ADMIN' })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                    >
                      <option value="USER">{t("dashboard.users.customer")}</option>
                      <option value="ADMIN">{t("dashboard.users.admin")}</option>
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {t("dashboard.users.city")}
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder={t("dashboard.users.cityPlaceholder")}
                    />
                  </div>

                  {/* Phone (only for new users) */}
                  {!editingUser && (
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {t("dashboard.users.phone")}
                      </label>
                      <input
                        type="tel"
                        value={formData.primary_mobile}
                        onChange={(e) => setFormData({ ...formData, primary_mobile: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                        placeholder={t("dashboard.users.phonePlaceholder")}
                      />
                    </div>
                  )}

                  {/* National ID */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      {t("dashboard.users.nationalId")}
                    </label>
                    <input
                      type="text"
                      value={formData.national_id}
                      onChange={(e) => setFormData({ ...formData, national_id: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder={t("dashboard.users.nationalIdPlaceholder")}
                    />
                  </div>

                  {/* Bank Name */}
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <Building className="w-4 h-4" />
                      {t("dashboard.users.bankName")}
                    </label>
                    <input
                      type="text"
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder={t("dashboard.users.bankNamePlaceholder")}
                    />
                  </div>

                  {/* Bank IBAN */}
                  <div className="md:col-span-2">
                    <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      {t("dashboard.users.bankIban")}
                    </label>
                    <input
                      type="text"
                      value={formData.bank_iban}
                      onChange={(e) => setFormData({ ...formData, bank_iban: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c4886a] focus:border-transparent"
                      placeholder={t("dashboard.users.bankIbanPlaceholder")}
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-[#c4886a] text-white rounded-lg hover:bg-opacity-90 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <span className="animate-spin">⏳</span>
                        {editingUser ? t("dashboard.users.updating") : t("dashboard.users.creating")}
                      </>
                    ) : (
                      editingUser ? t("dashboard.users.updateUser") : t("dashboard.users.createUser")
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-medium disabled:opacity-50"
                  >
                    {t("dashboard.users.cancel")}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UsersTab;
