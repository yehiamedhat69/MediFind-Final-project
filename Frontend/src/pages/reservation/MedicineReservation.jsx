import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getReservationDetails,
  createReservation,
} from "../../services/reservationService";

import "./MedicineReservation.css";

function MedicineReservation() {
  const { medicineId, pharmacyId } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [pharmacy, setPharmacy] = useState(null);
  const [availability, setAvailability] =
    useState(null);

  const [quantity, setQuantity] = useState(1);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchReservationDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const data =
          await getReservationDetails(
            medicineId,
            pharmacyId
          );

        setMedicine(data.medicine);
        setPharmacy(data.pharmacy);
        setAvailability(data.availability);
      } catch (err) {
        setError(
          err.message ||
            "Failed to load reservation details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReservationDetails();
  }, [medicineId, pharmacyId]);

  const handleQuantityChange = (event) => {
    const value = event.target.value;

    if (value === "") {
      setQuantity("");
      return;
    }

    const parsedValue = Number(value);

    if (Number.isInteger(parsedValue)) {
      setQuantity(parsedValue);
    }
  };

  const validateQuantity = () => {
    if (
      quantity === "" ||
      quantity === null ||
      quantity === undefined
    ) {
      return "Please enter the reservation quantity.";
    }

    if (!Number.isInteger(Number(quantity))) {
      return "Quantity must be a whole number.";
    }

    if (Number(quantity) <= 0) {
      return "Quantity must be greater than zero.";
    }

    if (
      availability &&
      Number(quantity) > availability.quantity
    ) {
      return `Only ${availability.quantity} units are available.`;
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateQuantity();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (
      !availability ||
      !availability.available
    ) {
      setError(
        "This medicine is currently unavailable."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const result =
        await createReservation({
          medicineId,
          pharmacyId,
          quantity: Number(quantity),
        });

      setSuccess(result.reservation);
    } catch (err) {
      setError(
        err.message ||
          "Failed to complete the reservation."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/medicine/${medicineId}`);
  };

  if (loading) {
    return (
      <div className="reservation-page">
        <div className="reservation-state">
          <div className="reservation-spinner"></div>
          <p>Loading reservation details...</p>
        </div>
      </div>
    );
  }

  if (error && !medicine) {
    return (
      <div className="reservation-page">
        <div className="reservation-state error-state">
          <h2>Unable to Load Reservation</h2>
          <p>{error}</p>

          <button
            className="back-button"
            onClick={handleCancel}
          >
            Back to Medicine
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="reservation-page">
        <div className="reservation-card success-card">
          <div className="success-icon">✓</div>

          <h1>Reservation Successful!</h1>

          <p className="success-message">
            Your medicine has been successfully
            reserved.
          </p>

          <div className="reservation-summary">
            <div className="summary-row">
              <span>Reservation ID</span>
              <strong>{success.id}</strong>
            </div>

            <div className="summary-row">
              <span>Medicine</span>
              <strong>{medicine.name}</strong>
            </div>

            <div className="summary-row">
              <span>Pharmacy</span>
              <strong>{pharmacy.name}</strong>
            </div>

            <div className="summary-row">
              <span>Quantity</span>
              <strong>{success.quantity}</strong>
            </div>

            <div className="summary-row">
              <span>Price per unit</span>
              <strong>
                {availability.price} EGP
              </strong>
            </div>

            <div className="summary-row total-row">
              <span>Total</span>
              <strong>
                {availability.price *
                  success.quantity}{" "}
                EGP
              </strong>
            </div>
          </div>

          <button
            className="primary-button"
            onClick={() =>
              navigate(
                `/medicine/${medicineId}`
              )
            }
          >
            Back to Medicine
          </button>
        </div>
      </div>
    );
  }

  const isUnavailable =
    !availability ||
    !availability.available ||
    availability.quantity <= 0;

  return (
    <div className="reservation-page">
      <div className="reservation-container">
        <button
          className="back-link"
          onClick={handleCancel}
        >
          ← Back to Medicine
        </button>

        <div className="reservation-card">
          <div className="reservation-header">
            <h1>Reserve Medicine</h1>

            <p>
              Review the details and choose the
              quantity you want to reserve.
            </p>
          </div>

          {error && (
            <div className="reservation-error">
              {error}
            </div>
          )}

          <div className="details-grid">
            <div className="details-section">
              <h2>Medicine Information</h2>

              <div className="info-item">
                <span>Medicine</span>
                <strong>{medicine.name}</strong>
              </div>

              <div className="info-item">
                <span>Description</span>
                <strong>
                  {medicine.description}
                </strong>
              </div>
            </div>

            <div className="details-section">
              <h2>Pharmacy Information</h2>

              <div className="info-item">
                <span>Pharmacy</span>
                <strong>{pharmacy.name}</strong>
              </div>

              <div className="info-item">
                <span>Location</span>
                <strong>
                  {pharmacy.address}
                </strong>
              </div>

              <div className="info-item">
                <span>Phone</span>
                <strong>{pharmacy.phone}</strong>
              </div>
            </div>
          </div>

          <div className="availability-section">
            <h2>Availability</h2>

            <div className="availability-grid">
              <div className="availability-item">
                <span>Price per unit</span>
                <strong>
                  {availability.price} EGP
                </strong>
              </div>

              <div className="availability-item">
                <span>Available quantity</span>
                <strong>
                  {availability.quantity}
                </strong>
              </div>

              <div className="availability-item">
                <span>Status</span>
                <strong
                  className={
                    availability.available
                      ? "available"
                      : "unavailable"
                  }
                >
                  {availability.available
                    ? "Available"
                    : "Unavailable"}
                </strong>
              </div>
            </div>
          </div>

          {isUnavailable ? (
            <div className="unavailable-box">
              <strong>
                Medicine Unavailable
              </strong>

              <p>
                This medicine cannot be reserved
                because it is currently out of
                stock.
              </p>
            </div>
          ) : (
            <form
              className="reservation-form"
              onSubmit={handleSubmit}
            >
              <label htmlFor="quantity">
                Reservation Quantity
              </label>

              <input
                id="quantity"
                type="number"
                min="1"
                max={availability.quantity}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={submitting}
              />

              <small>
                Maximum available quantity:{" "}
                {availability.quantity}
              </small>

              {quantity > 0 &&
                quantity <=
                  availability.quantity && (
                  <div className="price-preview">
                    <span>Total Price</span>
                    <strong>
                      {availability.price *
                        quantity}{" "}
                      EGP
                    </strong>
                  </div>
                )}

              <div className="reservation-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={submitting}
                >
                  {submitting
                    ? "Processing..."
                    : "Confirm Reservation"}
                </button>
              </div>
            </form>
          )}

          {isUnavailable && (
            <div className="reservation-actions">
              <button
                className="cancel-button"
                onClick={handleCancel}
              >
                Back
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MedicineReservation;