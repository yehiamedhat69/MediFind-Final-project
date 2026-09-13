import React, { useEffect, useState } from "react";

import Loading from "../../components/Loading";
import ErrorMessage from "../../components/ErrorMessage";
import EmptyState from "../../components/EmptyState";
import { getCustomerReservations, cancelReservation } from "../../services/reservationService";

import "./CustomerReservations.css";

function CustomerReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError("");
      setReservations(await getCustomerReservations());
    } catch (err) {
      setError(err.message || "Failed to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (reservationId) => {
    try {
      setError("");
      await cancelReservation(reservationId);
      await fetchReservations();
    } catch (err) {
      setError(err.message || "Failed to cancel reservation.");
    }
  };

  const getStatusClass = (status) => {
    const normalizedStatus = status.toLowerCase();

    if (normalizedStatus === "confirmed") {
      return "accepted";
    }

    if (normalizedStatus === "completed") {
      return "completed";
    }

    return normalizedStatus;
  };

  const canCancel = (status) => {
    return status === "Pending";
  };

  return (
    <main className="reservations-page">
      <div className="reservations-container">
        <header className="reservations-header">
          <div>
            <h1>My Reservations</h1>
            <p>
              View and manage your medicine reservations.
            </p>
          </div>

          {!loading && !error && reservations.length > 0 && (
            <span className="reservation-count">
              {reservations.length} Reservations
            </span>
          )}
        </header>

        {loading && (
          <div className="reservations-state">
            <Loading />
            <p>Loading your reservations...</p>
          </div>
        )}

        {!loading && error && (
          <div className="reservations-state error-state">
            <ErrorMessage
              message={error}
              onRetry={fetchReservations}
            />
          </div>
        )}

        {!loading && !error && reservations.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>

            <h2>No Reservations Yet</h2>

            <p>
              You don't have any medicine reservations yet.
            </p>
          </div>
        )}

        {!loading && !error && reservations.length > 0 && (
          <div className="reservations-list">
            {reservations.map((reservation) => (
              <article
                key={reservation.id}
                className="reservation-card"
              >
                <div className="reservation-card-header">
                  <div>
                    <h2>{reservation.medicineName}</h2>

                    <span className="reservation-id">
                      Reservation #{reservation.id}
                    </span>
                  </div>

                  <span
                    className={`status-badge ${getStatusClass(
                      reservation.status
                    )}`}
                  >
                    {reservation.status}
                  </span>
                </div>

                <div className="reservation-info">
                  <div className="info-item">
                    <span>Pharmacy</span>
                    <strong>
                      {reservation.pharmacyName}
                    </strong>
                  </div>

                  <div className="info-item">
                    <span>Date</span>
                    <strong>{reservation.date}</strong>
                  </div>
                </div>

                {canCancel(reservation.status) && (
                  <div className="reservation-actions">
                    <button
                      type="button"
                      className="cancel-reservation-button"
                      onClick={() =>
                        handleCancel(reservation.id)
                      }
                    >
                      Cancel Reservation
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default CustomerReservations;