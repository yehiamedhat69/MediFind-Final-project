import { useEffect, useState } from "react";
import StatsCards from "./components/StatsCards.jsx";
import ReservationsList from "./components/ReservationsList.jsx";

import { getCustomerReservations } from "../../services/reservationService";
import { getCurrentUser } from "../../services/authService";

import "./customerdashboard.css";

export default function CustomerDashboard() {
  const [customerName, setCustomerName] = useState("Customer");
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const user = await getCurrentUser();
        setCustomerName(user.username || "Customer");
        const data = await getCustomerReservations();
        setReservations(data);
      } catch {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const active = reservations.filter((r) => ["Pending", "Accepted"].includes(r.status)).length;
  const completed = reservations.filter((r) => r.status === "Fulfilled").length;
  const cancelled = reservations.filter((r) => r.status === "Cancelled").length;
  const stats = [
    { id: "active", value: active, label: "Active Reservations", tone: "active" },
    { id: "completed", value: completed, label: "Completed", tone: "completed" },
    { id: "cancelled", value: cancelled, label: "Cancelled", tone: "cancelled" },
  ];
  const dashboardReservations = reservations.slice(0, 3).map((r) => ({
    id: r.id,
    name: r.medicineName,
    quantity: `${r.quantity} ${r.quantity === 1 ? "Box" : "Boxes"}`,
    pharmacy: r.pharmacyName,
    price: `${Number(r.price || 0) * Number(r.quantity || 0)} EGP`,
    status: r.status,
    thumb: { fill: "#e8f4fc", stroke: "#94c4e0", labelFill: "#0077b6", label: (r.medicineName || "M").slice(0, 2).toUpperCase() },
  }));

  if (loading) return <div className="dashboard"><main className="main-content"><p>Loading dashboard...</p></main></div>;

  return (
    <div className="dashboard">
      <main className="main-content">
        <header className="page-header">
          <h1>Welcome, {customerName}! 👋</h1>
          <p className="subtitle">Here is your recent activity</p>
        </header>
        <StatsCards stats={stats} />
        <ReservationsList reservations={dashboardReservations} />
      </main>
    </div>
  );
}