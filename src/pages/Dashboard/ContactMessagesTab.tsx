import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Mail,
  MailOpen,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Calendar,
  MessageSquare,
  Inbox,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getContactMessages,
  markMessageAsRead,
  markMessageAsUnread,
  deleteContactMessage,
  type ContactMessage,
} from "../../services/contactService";
import type { AxiosError } from "axios";

const ContactMessagesTab = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchMessages = async (page = 1) => {
    try {
      setLoading(true);
      const params: { page: number; per_page: number; is_read?: boolean } = {
        page,
        per_page: 10,
      };
      
      if (filter === "unread") params.is_read = false;
      if (filter === "read") params.is_read = true;

      const response = await getContactMessages(params);
      setMessages(response.data.data);
      setCurrentPage(response.data.current_page);
      setTotalPages(response.data.last_page);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل تحميل الرسائل" : "Failed to load messages")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markMessageAsRead(id);
      toast.success(isRTL ? "تم تحديد الرسالة كمقروءة" : "Message marked as read");
      fetchMessages(currentPage);
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, is_read: true });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل تحديث الحالة" : "Failed to update status")
      );
    }
  };

  const handleMarkAsUnread = async (id: number) => {
    try {
      await markMessageAsUnread(id);
      toast.success(isRTL ? "تم تحديد الرسالة كغير مقروءة" : "Message marked as unread");
      fetchMessages(currentPage);
      if (selectedMessage?.id === id) {
        setSelectedMessage({ ...selectedMessage, is_read: false });
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل تحديث الحالة" : "Failed to update status")
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm(isRTL ? "هل أنت متأكد من حذف هذه الرسالة؟" : "Are you sure you want to delete this message?")) {
      return;
    }

    try {
      await deleteContactMessage(id);
      toast.success(isRTL ? "تم حذف الرسالة بنجاح" : "Message deleted successfully");
      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
      fetchMessages(currentPage);
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      toast.error(
        axiosError.response?.data?.message ||
          (isRTL ? "فشل حذف الرسالة" : "Failed to delete message")
      );
    }
  };

  const openMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.is_read) {
      await handleMarkAsRead(message.id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isRTL ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#384B70]" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${isRTL ? "text-right" : "text-left"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-[#384B70]">
          {t("dashboard.contactMessages.title")}
        </h2>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "all"
                ? "bg-[#384B70] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t("dashboard.contactMessages.all")}
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "unread"
                ? "bg-[#c4886a] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t("dashboard.contactMessages.unread")}
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === "read"
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {t("dashboard.contactMessages.read")}
          </button>
        </div>
      </div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Inbox className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">
            {t("dashboard.contactMessages.noMessages")}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-100">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !message.is_read ? "bg-blue-50/50" : ""
                }`}
                onClick={() => openMessage(message)}
              >
                <div className="flex items-start gap-4">
                  {/* Read Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {message.is_read ? (
                      <MailOpen className="w-5 h-5 text-gray-400" />
                    ) : (
                      <Mail className="w-5 h-5 text-[#c4886a]" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3
                        className={`font-semibold truncate ${
                          !message.is_read ? "text-[#384B70]" : "text-gray-700"
                        }`}
                      >
                        {message.name}
                      </h3>
                      <span className="text-sm text-gray-500 flex-shrink-0">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{message.email}</p>
                    <p className="text-gray-600 truncate">{message.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openMessage(message);
                      }}
                      className="p-2 text-gray-500 hover:text-[#384B70] hover:bg-gray-100 rounded-lg transition-colors"
                      title={isRTL ? "عرض" : "View"}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(message.id);
                      }}
                      className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title={isRTL ? "حذف" : "Delete"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 p-4 border-t border-gray-100">
              <button
                onClick={() => fetchMessages(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>
              <span className="text-gray-600">
                {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => fetchMessages(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-gray-100 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
              >
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Message Detail Modal */}
      <AnimatePresence>
        {selectedMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMessage(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-[#384B70]">
                  {t("dashboard.contactMessages.messageDetails")}
                </h3>
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                {/* Sender Info */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-[#384B70] rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#384B70]">{selectedMessage.name}</h4>
                    <p className="text-gray-500">{selectedMessage.email}</p>
                  </div>
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(selectedMessage.created_at)}</span>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-700 font-medium">
                    <MessageSquare className="w-4 h-4" />
                    <span>{t("dashboard.contactMessages.message")}</span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50">
                {selectedMessage.is_read ? (
                  <button
                    onClick={() => handleMarkAsUnread(selectedMessage.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    {t("dashboard.contactMessages.markAsUnread")}
                  </button>
                ) : (
                  <button
                    onClick={() => handleMarkAsRead(selectedMessage.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#384B70] text-white rounded-lg hover:bg-[#2d3c5a] transition-colors"
                  >
                    <MailOpen className="w-4 h-4" />
                    {t("dashboard.contactMessages.markAsRead")}
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDelete(selectedMessage.id);
                    setSelectedMessage(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t("dashboard.contactMessages.delete")}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContactMessagesTab;
