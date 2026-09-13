import React, { useState, useEffect } from "react";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";

import "./PharmacyNotifications.css";
import { getCustomerNotifications, markNotificationAsRead } from "../services/notificationService";

function PharmacyNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");
      setNotifications(await getCustomerNotifications());
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, isRead: true, read: true } : notification
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update notification.");
    }
  };

  if (loading) {
    return (
      <div className="pharmacy-notifications-page">
        <div className="pharmacy-notifications-header">
          <h1>Pharmacy Notifications</h1>
        </div>

        <div className="notification-state">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pharmacy-notifications-page">
        <div className="pharmacy-notifications-header">
          <h1>Pharmacy Notifications</h1>
        </div>

        <div className="notification-state error-state">
          <ErrorMessage
            message={error}
            onRetry={fetchNotifications}
          />
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="pharmacy-notifications-page">
        <div className="pharmacy-notifications-header">
          <h1>Pharmacy Notifications</h1>
        </div>

        <div className="notification-state">
          <EmptyState message="No notifications available." />
        </div>
      </div>
    );
  }

  return (
    <div className="pharmacy-notifications-page">
      <div className="pharmacy-notifications-header">
        <h1>Pharmacy Notifications</h1>

        <p>
          Stay updated with reservations, stock alerts,
          and pharmacy activity.
        </p>
      </div>

      <div className="notifications-list">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification-card ${
              notification.read ? "read" : "unread"
            }`}
          >
            <div className="notification-content">
              <p className="notification-message">
                {notification.message}
              </p>

              <small className="notification-date">
                {notification.date}
              </small>
            </div>

            {!notification.read && (
              <button
                className="mark-read-btn"
                onClick={() => markAsRead(notification.id)}
              >
                Mark as Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default PharmacyNotifications;