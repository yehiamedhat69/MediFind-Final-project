import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMedicineById,
  getPharmaciesByMedicineId,
} from "../../../services/medicineService";

import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import EmptyState from "../../../components/EmptyState";

import "./MedicineDetails.css";

function MedicineDetails() {
  const { medicineId } = useParams();
  const navigate = useNavigate();

  const [medicine, setMedicine] = useState(null);
  const [pharmacies, setPharmacies] = useState([]);

  const [filters, setFilters] = useState({
    location: "all",
    minPrice: "",
    maxPrice: "",
    availability: "all",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    location: "all",
    minPrice: "",
    maxPrice: "",
    availability: "all",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMedicineDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const medicineData = await getMedicineById(medicineId);

      if (!medicineData) {
        setMedicine(null);
        setPharmacies([]);
        return;
      }

      setMedicine(medicineData);

      const pharmacyData =
        await getPharmaciesByMedicineId(medicineId);

      setPharmacies(pharmacyData || []);
    } catch (err) {
      console.error(
        "Error fetching medicine details:",
        err
      );

      setError(
        "Something went wrong while loading medicine details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicineDetails();
  }, [medicineId]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    setAppliedFilters(filters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      location: "all",
      minPrice: "",
      maxPrice: "",
      availability: "all",
    };

    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  const filteredPharmacies = pharmacies.filter(
    (pharmacy) => {
      const locationMatch =
        appliedFilters.location === "all" ||
        pharmacy.location ===
          appliedFilters.location;

      const minPriceMatch =
        appliedFilters.minPrice === "" ||
        pharmacy.price >=
          Number(appliedFilters.minPrice);

      const maxPriceMatch =
        appliedFilters.maxPrice === "" ||
        pharmacy.price <=
          Number(appliedFilters.maxPrice);

      const availabilityMatch =
        appliedFilters.availability === "all" ||
        (appliedFilters.availability ===
          "available" &&
          pharmacy.available) ||
        (appliedFilters.availability ===
          "unavailable" &&
          !pharmacy.available);

      return (
        locationMatch &&
        minPriceMatch &&
        maxPriceMatch &&
        availabilityMatch
      );
    }
  );

  const handlePharmacyClick = (pharmacyId) => {
    navigate(
      `/pharmacy/${pharmacyId}?medicineId=${medicineId}`
    );
  };

  const handleReservation = (pharmacy) => {
    navigate(
      `/reservation/${medicineId}/${pharmacy.id}`
    );
  };

  if (loading) {
    return (
      <div className="medicine-details-page">
        <div className="details-state">
          <Loading />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="medicine-details-page">
        <div className="details-state error-state">
          <h2>Unable to load medicine</h2>

          <ErrorMessage
            message={error}
            onRetry={fetchMedicineDetails}
          />
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="medicine-details-page">
        <div className="details-state">
          <h2>Medicine Not Found</h2>

          <EmptyState
            message="The medicine you're looking for doesn't exist or is no longer available."
          />

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
    <div className="medicine-details-page">
      <div className="medicine-details-container">

        <button
          className="back-button"
          onClick={() =>
            navigate("/medicine-search")
          }
        >
          ← Back to Search
        </button>

        <section className="medicine-info-card">
          <span className="medicine-label">
            Medicine
          </span>

          <h1>{medicine.name}</h1>

          <p className="medicine-description">
            {medicine.description}
          </p>
        </section>

        <section className="filters-section">
          <div className="filters-header">
            <div>
              <h2>Filter Pharmacies</h2>

              <p>
                Find the best pharmacy based on
                location, price, and availability.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
            >
              Clear
            </button>
          </div>

          <div className="filters-grid">

            <div className="filter-group">
              <label htmlFor="location">
                Location
              </label>

              <select
                id="location"
                name="location"
                value={filters.location}
                onChange={handleFilterChange}
              >
                <option value="all">
                  All locations
                </option>

                <option value="Benha">
                  Benha
                </option>

                <option value="Cairo">
                  Cairo
                </option>

                <option value="Giza">
                  Giza
                </option>
              </select>
            </div>

            <div className="filter-group">
              <label>Price Range</label>

              <div className="range-inputs">
                <input
                  type="number"
                  name="minPrice"
                  min="0"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                />

                <input
                  type="number"
                  name="maxPrice"
                  min="0"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="availability">
                Availability
              </label>

              <select
                id="availability"
                name="availability"
                value={filters.availability}
                onChange={handleFilterChange}
              >
                <option value="all">
                  All
                </option>

                <option value="available">
                  Available
                </option>

                <option value="unavailable">
                  Unavailable
                </option>
              </select>
            </div>

            <button
              type="button"
              className="apply-filters-button"
              onClick={applyFilters}
            >
              Apply Filters
            </button>

          </div>
        </section>

        <section className="pharmacies-section">
          <div className="section-header">
            <h2>Pharmacies</h2>

            <p>
              Pharmacies selling {medicine.name}.
            </p>

            <span className="results-count">
              {filteredPharmacies.length} pharmacy
              {filteredPharmacies.length !== 1
                ? "ies"
                : ""}
            </span>
          </div>

          {filteredPharmacies.length === 0 ? (
            <EmptyState
              message="No pharmacies match your filters. Try changing or clearing your filters."
            />
          ) : (
            <div className="pharmacies-grid">
              {filteredPharmacies.map(
                (pharmacy) => (
                  <div
                    className="pharmacy-card"
                    key={pharmacy.id}
                  >
                    <div className="pharmacy-card-header">
                      <h3>{pharmacy.name}</h3>

                      <span
                        className={
                          pharmacy.available
                            ? "status available"
                            : "status unavailable"
                        }
                      >
                        {pharmacy.available
                          ? "Available"
                          : "Unavailable"}
                      </span>
                    </div>

                    <div className="pharmacy-details">
                      <p>
                        <strong>Location:</strong>{" "}
                        {pharmacy.location}
                      </p>

                      <p>
                        <strong>Price:</strong>{" "}
                        {pharmacy.price} EGP
                      </p>

                      <p>
                        <strong>Quantity:</strong>{" "}
                        {pharmacy.available
                          ? pharmacy.quantity
                          : "N/A"}
                      </p>
                    </div>

                    <div className="pharmacy-actions">
                      <button
                        className="details-button"
                        onClick={() =>
                          handlePharmacyClick(
                            pharmacy.id
                          )
                        }
                      >
                        View Pharmacy
                      </button>

                      {pharmacy.available && (
                        <button
                          className="reservation-button"
                          onClick={() =>
                            handleReservation(
                              pharmacy
                            )
                          }
                        >
                          Start Reservation
                        </button>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

export default MedicineDetails;