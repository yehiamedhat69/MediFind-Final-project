import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPharmacyDashboard } from "../../services/pharmacyManagementService";
import Loading from "../../components/Loading";
import "./PharmacyDashboard.css";

const PharmacyDashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setError("");
      setDashboard(await getPharmacyDashboard());
    } catch (err) {
      setError(err.message || "Unable to load pharmacy dashboard.");
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (!dashboard) {
    return <div className="pharmacy-dashboard"><Loading /><p>{error || "Loading dashboard..."}</p></div>;
  }

  const { pharmacy, inventory, reservations } = dashboard;

  return (
    <div className="pharmacy-dashboard">

      {/* Welcome */}
      <section className="welcome-section">
        <div>
          <p className="welcome-label">Welcome back</p>

          <h1>{pharmacy.name}</h1>

          <p>
            Manage your pharmacy, inventory and reservations
            from one place.
          </p>
        </div>

        <div className="welcome-icon">+</div>
      </section>


      {/* Pharmacy Information */}
      <section className="section">

        <div className="section-header">
          <h2>Pharmacy Information</h2>
        </div>

        <div className="info-grid">

          <div className="info-card">
            <span>Pharmacy Name</span>
            <strong>{pharmacy.name}</strong>
          </div>

          <div className="info-card">
            <span>Phone</span>
            <strong>{pharmacy.phone}</strong>
          </div>

          <div className="info-card">
            <span>Address</span>
            <strong>{pharmacy.address}</strong>
          </div>

        </div>
      </section>


      {/* Inventory */}
      <section className="section">

        <div className="section-header">
          <h2>Inventory Overview</h2>

          <button
            className="secondary-button"
            onClick={() => navigate("/pharmacy/inventory")}
          >
            Manage Inventory
          </button>
        </div>


        <div className="stats-grid">

          <div className="stat-card">
            <div className="stat-icon">M</div>

            <div>
              <span>Available Medicines</span>
              <strong>{inventory.availableMedicines}</strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">S</div>

            <div>
              <span>Total Stock</span>
              <strong>{inventory.totalStock}</strong>
            </div>
          </div>


          <div className="stat-card">
            <div className="stat-icon">L</div>

            <div>
              <span>Low Stock</span>
              <strong>{inventory.lowStock}</strong>
            </div>
          </div>

        </div>


        {inventory.availableMedicines === 0 && (
          <div className="empty-state">

            <h3>No inventory yet</h3>

            <p>
              Add medicines to your inventory to see them here.
            </p>

            <button
              className="primary-button"
              onClick={() => navigate("/pharmacy/inventory")}
            >
              Add Medicine
            </button>

          </div>
        )}

      </section>


      {/* Reservations */}
      <section className="section">

        <div className="section-header">

          <h2>Reservations</h2>

          <button
            className="secondary-button"
            onClick={() => navigate("/pharmacy/reservation")}
          >
            View Reservations
          </button>

        </div>


        <div className="reservation-grid">

          <div className="reservation-card">
            <span>Pending</span>
            <strong>{reservations.pending}</strong>
          </div>

          <div className="reservation-card">
            <span>Confirmed</span>
            <strong>{reservations.confirmed}</strong>
          </div>

          <div className="reservation-card">
            <span>Completed</span>
            <strong>{reservations.completed}</strong>
          </div>

          <div className="reservation-card">
            <span>Cancelled</span>
            <strong>{reservations.cancelled}</strong>
          </div>

        </div>


        {reservations.total === 0 && (
          <div className="empty-state">

            <h3>No reservations</h3>

            <p>
              There are currently no reservations for your pharmacy.
            </p>

          </div>
        )}

      </section>


      {/* Quick Navigation */}
      <section className="section">

        <div className="section-header">
          <h2>Quick Access</h2>
        </div>


        <div className="quick-links">

          <button
            className="quick-link"
            onClick={() => navigate("/pharmacy/profile")}
          >
            <strong>Pharmacy Profile</strong>

            <span>
              View and edit pharmacy information
            </span>
          </button>


          <button
            className="quick-link"
            onClick={() => navigate("/pharmacy/inventory")}
          >
            <strong>Inventory Management</strong>

            <span>
              Manage available medicines and stock
            </span>
          </button>


          <button
            className="quick-link"
            onClick={() => navigate("/pharmacy/reservation")}
          >
            <strong>Reservation Management</strong>

            <span>
              View and manage reservations
            </span>
          </button>


          <button
            className="quick-link"
            onClick={() => navigate("/pharmacy/notifications")}
          >
            <strong>Notifications</strong>

            <span>
              View pharmacy notifications
            </span>
          </button>

        </div>

      </section>

    </div>
  );
};

export default PharmacyDashboard;