import React, { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  getPharmacyById,
  getMedicineAvailability,
  getPharmacyMedicines,
} from "../../services/pharmacyService";

import { getMedicineById } from "../../services/medicineService";

import "./PharmacyDetails.css";

function PharmacyDetails() {
  const { pharmacyId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const medicineId = searchParams.get("medicineId");

  const [pharmacy, setPharmacy] = useState(null);
  const [medicine, setMedicine] = useState(null);
  const [availability, setAvailability] =
    useState(null);

  const [pharmacyMedicines, setPharmacyMedicines] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPharmacyDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const pharmacyData =
          await getPharmacyById(pharmacyId);

        if (!pharmacyData) {
          setPharmacy(null);
          return;
        }

        setPharmacy(pharmacyData);

        const medicineDetails = await getPharmacyMedicines(pharmacyId);
        setPharmacyMedicines(medicineDetails);

        if (medicineId) {
          const [
            medicineData,
            availabilityData,
          ] = await Promise.all([
            getMedicineById(medicineId),
            getMedicineAvailability(
              pharmacyId,
              medicineId
            ),
          ]);

          setMedicine(medicineData);
          setAvailability(availabilityData);
        } else {
          setMedicine(null);
          setAvailability(null);
        }
      } catch (err) {
        console.error(
          "Error fetching pharmacy details:",
          err
        );

        setError(
          "Something went wrong while loading pharmacy details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPharmacyDetails();
  }, [pharmacyId, medicineId]);

  const handleBackToMedicine = () => {
    if (medicineId) {
      navigate(`/medicine/${medicineId}`);
    } else {
      navigate("/medicine-search");
    }
  };

const handleReservation = () => {
  if (!medicine || !pharmacy) {
    return;
  }

  navigate(
    `/reservation/${medicine.id}/${pharmacy.id}`
  );
};

  if (loading) {
    return (
      <div className="pharmacy-details-page">
        <div className="pharmacy-details-state">
          <div className="loader"></div>
          <p>Loading pharmacy details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pharmacy-details-page">
        <div className="pharmacy-details-state error-state">
          <h2>Unable to load pharmacy</h2>
          <p>{error}</p>

          <button
            onClick={() =>
              window.location.reload()
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!pharmacy) {
    return (
      <div className="pharmacy-details-page">
        <div className="pharmacy-details-state">
          <h2>Pharmacy Not Found</h2>

          <p>
            The pharmacy you're looking for doesn't
            exist or is no longer available.
          </p>

          <button
            onClick={() =>
              navigate("/medicine-search")
            }
          >
            Back to Medicine Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pharmacy-details-page">
      <div className="pharmacy-details-container">

        <button
          className="back-button"
          onClick={handleBackToMedicine}
        >
          ← Back to Medicine
        </button>

        {/* Pharmacy Information */}

        <section className="pharmacy-info-card">
          <span className="pharmacy-label">
            Pharmacy
          </span>

          <h1>{pharmacy.name}</h1>

          <p className="pharmacy-description">
            {pharmacy.description}
          </p>

          <div className="pharmacy-contact-info">

            <div className="contact-item">
              <span>📍 Location</span>
              <strong>
                {pharmacy.address}
              </strong>
            </div>

            <div className="contact-item">
              <span>📞 Phone</span>
              <strong>
                {pharmacy.phone}
              </strong>
            </div>

            <div className="contact-item">
              <span>✉ Email</span>
              <strong>
                {pharmacy.email}
              </strong>
            </div>

          </div>
        </section>

        {/* Selected Medicine */}

        {medicineId && (
          <section className="availability-section">
            <div className="section-header">
              <h2>Medicine Availability</h2>

              <p>
                Availability of the selected medicine
                at this pharmacy.
              </p>
            </div>

            {!medicine ? (
              <div className="availability-card">
                <h3>Medicine Not Found</h3>

                <p>
                  We couldn't find information about
                  this medicine.
                </p>
              </div>
            ) : !availability ? (
              <div className="availability-card unavailable-card">
                <div className="availability-header">
                  <div>
                    <span className="medicine-label">
                      Medicine
                    </span>

                    <h3>{medicine.name}</h3>
                  </div>

                  <span className="status unavailable">
                    Not Available
                  </span>
                </div>

                <p>
                  This medicine is not listed at this
                  pharmacy.
                </p>
              </div>
            ) : (
              <div className="availability-card">
                <div className="availability-header">
                  <div>
                    <span className="medicine-label">
                      Medicine
                    </span>

                    <h3>{medicine.name}</h3>
                  </div>

                  <span
                    className={`status ${
                      availability.available
                        ? "available"
                        : "unavailable"
                    }`}
                  >
                    {availability.available
                      ? "Available"
                      : "Unavailable"}
                  </span>
                </div>

                <div className="availability-info">

                  <div>
                    <span>Price</span>

                    <strong>
                      {availability.price} EGP
                    </strong>
                  </div>

                  <div>
                    <span>Quantity</span>

                    <strong>
                      {availability.available
                        ? availability.quantity
                        : "N/A"}
                    </strong>
                  </div>

                </div>

                {availability.available && (
                  <button
                    className="reservation-button"
                    onClick={handleReservation}
                  >
                    Start Reservation
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Pharmacy Medicines */}

        <section className="pharmacy-medicines-section">
          <div className="section-header">
            <h2>Medicines at this Pharmacy</h2>

            <p>
              Medicines currently listed in this
              pharmacy.
            </p>
          </div>

          <div className="medicine-list">
            {pharmacyMedicines.length === 0 ? (
              <div className="availability-card">
                <p>
                  No medicine information available.
                </p>
              </div>
            ) : (
              pharmacyMedicines.map((item) => (
                <div
                  className="medicine-list-item"
                  key={item.medicineId}
                >
                  <div>
                    <strong>{item.name}</strong>

                    <p>
                      Price: {item.price} EGP
                    </p>
                  </div>

                  <div className="medicine-list-status">
                    <span
                      className={
                        item.available
                          ? "status available"
                          : "status unavailable"
                      }
                    >
                      {item.available
                        ? `Available (${item.quantity})`
                        : "Unavailable"}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

export default PharmacyDetails;