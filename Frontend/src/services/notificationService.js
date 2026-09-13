import { request, idOf } from "./api";

const normalize = (n) => ({
  ...n,
  id: idOf(n),
  read: Boolean(n.isRead),
  date: n.createdAt || n.date,
  title: n.title || "Notification",
});

export const getCustomerNotifications = async () => {
  const data = await request("/notifications");
  return (data.notifications || []).map(normalize);
};

export const markNotificationAsRead = async (notificationId) => {
  const data = await request(`/notifications/${encodeURIComponent(notificationId)}/read`, { method: "PATCH" });
  return { ...data, notification: normalize(data.notification) };
};
