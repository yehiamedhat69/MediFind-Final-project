import React, { useEffect, useState } from "react";

import {
  getCustomerNotifications,
  markNotificationAsRead,
} from "../../services/notificationService";

import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";

import "./CustomerNotifications.css";

function CustomerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [readingId, setReadingId] = useState(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getCustomerNotifications();

      setNotifications(data || []);
    } catch (err) {
      setError(
        err.message || "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId) => {
    try {
      setReadingId(notificationId);
      setError("");
      setActionMessage("");

      await markNotificationAsRead(notificationId);

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      setActionMessage("Notification marked as read.");
    } catch (err) {
      setError(
        err.message || "Failed to update notification."
      );
    } finally {
      setReadingId(null);
    }
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-state">
          <Loading />
        </div>
      </div>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <div className="notifications-page">
        <div className="notifications-state error-state">
          <h2>Unable to Load Notifications</h2>

          <ErrorMessage
            message={error}
            onRetry={fetchNotifications}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">

        <div className="notifications-header">
          <div>
            <h1>Notifications</h1>

            <p>
              Stay updated about your reservations and
              account activity.
            </p>
          </div>

          <div className="unread-count">
            {unreadCount} Unread
          </div>
        </div>

        {actionMessage && (
          <div className="success-message">
            {actionMessage}
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <EmptyState
            message="You don't have any notifications right now."
          />
        ) : (
          <div className="notifications-list">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`notification-card ${
                  notification.read ? "read" : "unread"
                }`}
              >
                <div className="notification-icon">
                  🔔
                </div>

                <div className="notification-content">
                  <div className="notification-top">
                    <h2>{notification.title}</h2>

                    {!notification.read && (
                      <span className="unread-badge">
                        New
                      </span>
                    )}
                  </div>

                  <p>{notification.message}</p>

                  <div className="notification-bottom">
                    <span className="notification-date">
                      {new Date(
                        notification.date
                      ).toLocaleString()}
                    </span>

                    {!notification.read && (
                      <button
                        className="read-button"
                        onClick={() =>
                          handleMarkAsRead(
                            notification.id
                          )
                        }
                        disabled={
                          readingId === notification.id
                        }
                      >
                        {readingId === notification.id
                          ? "Updating..."
                          : "Mark as Read"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerNotifications;