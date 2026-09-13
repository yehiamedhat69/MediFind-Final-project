import React, { useEffect, useState } from "react";
import "./PharmacyReservations.css";
import { getMyPharmacy } from "../../services/pharmacyManagementService";
import { getPharmacyReservations, updateReservationStatus } from "../../services/reservationService";
function PharmacyReservations() {
  const [reservations, setReservations] = useState([]);
  const [filter, setFilter] = useState("All");
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReservations = async () => {
    try {
      setLoading(true);
      const pharmacy = await getMyPharmacy();
      const data = await getPharmacyReservations(pharmacy._id || pharmacy.id);
      setReservations(data);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load reservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadReservations(); }, []);

  const filteredReservations = filter === "All"
    ? reservations
    : reservations.filter((reservation) => reservation.status === filter);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setLoadingId(id);
      setError("");
      await updateReservationStatus(id, newStatus);
      await loadReservations();
    } catch (err) {
      setError(err.message || "Unable to update reservation.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="pharmacy-reservations-page">\n      {error && <div className="reservation-error">{error}</div>}\n      {loading && <p>Loading reservations...</p>}
      <div className="pharmacy-reservations-header">
        <h1>Pharmacy Reservations</h1>
        <p>View and manage customer medicine reservations.</p>
      </div>

      <div className="reservation-filters">
        {["All", "Pending", "Accepted", "Rejected"].map((status) => (
          <button
            key={status}
            className={filter === status ? "active" : ""}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {filteredReservations.length === 0 ? (
        <div className="empty-reservations">
          <h2>No Reservations Found</h2>
          <p>There are no reservations with this status.</p>
        </div>
      ) : (
        <div className="reservations-list">
          {filteredReservations.map((reservation) => (
            <div
              className="reservation-card"
              key={reservation.id}
            >
              <div className="reservation-card-header">
                <div>
                  <h2>{reservation.medicineName}</h2>
                  <p>Reservation #{reservation.id}</p>
                </div>

                <span
                  className={`reservation-status ${reservation.status.toLowerCase()}`}
                >
                  {reservation.status}
                </span>
              </div>

              <div className="reservation-info">
                <div className="info-item">
                  <span>Customer</span>
                  <strong>{reservation.customerName}</strong>
                </div>

                <div className="info-item">
                  <span>Phone</span>
                  <strong>{reservation.customerPhone}</strong>
                </div>

                <div className="info-item">
                  <span>Quantity</span>
                  <strong>{reservation.quantity}</strong>
                </div>

                <div className="info-item">
                  <span>Price</span>
                  <strong>{reservation.price} EGP</strong>
                </div>

                <div className="info-item">
                  <span>Reservation Date</span>
                  <strong>{reservation.date}</strong>
                </div>
              </div>

              {reservation.status === "Pending" && (
                <div className="reservation-actions">
                  <button
                    className="accept-btn"
                    disabled={loadingId === reservation.id}
                    onClick={() =>
                      handleStatusChange(
                        reservation.id,
                        "Accepted"
                      )
                    }
                  >
                    {loadingId === reservation.id
                      ? "Processing..."
                      : "Accept"}
                  </button>

                  <button
                    className="reject-btn"
                    disabled={loadingId === reservation.id}
                    onClick={() =>
                      handleStatusChange(
                        reservation.id,
                        "Rejected"
                      )
                    }
                  >
                    {loadingId === reservation.id
                      ? "Processing..."
                      : "Reject"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PharmacyReservations;