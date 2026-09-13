import { useEffect, useMemo, useState } from "react";
import { request, idOf } from "../../services/api";
import { addMedicine as apiAddMedicine, updateMedicine as apiUpdateMedicine, deleteMedicine } from "../../services/medicineService";
import "./Admindashboard.css";

const normalizeUser = (u) => ({
  ...u,
  id: idOf(u),
  name: u.username || u.name || "",
  status: u.isActive === false ? "Inactive" : "Active",
  role: u.role === "customer" ? "Customer" : (u.role || "").replace(/^./, (c) => c.toUpperCase()),
});

const normalizePharmacy = (p) => ({
  ...p,
  id: idOf(p),
  name: p.name || "",
  email: p.email || "",
  phone: p.phone || "",
  address: p.address || "",
  status: p.isActive === false ? "Inactive" : "Active",
});

const normalizeReservation = (r) => ({
  ...r,
  id: idOf(r),
  customer: r.customerId?.username || "Unknown Customer",
  medicine: r.medicineId?.name || "Unknown Medicine",
  pharmacy: r.pharmacyId?.name || "Unknown Pharmacy",
  date: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-",
  status: r.status ? r.status[0].toUpperCase() + r.status.slice(1) : "-",
});

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview");
  const [users, setUsers] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [pharmacySearch, setPharmacySearch] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");
  const [reservationSearch, setReservationSearch] = useState("");
  const [showUserForm, setShowUserForm] = useState(false);
  const [showPharmacyForm, setShowPharmacyForm] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [editingPharmacyId, setEditingPharmacyId] = useState(null);
  const [editingMedicineId, setEditingMedicineId] = useState(null);
  const [userForm, setUserForm] = useState({ name: "", email: "", role: "Customer" });
  const [pharmacyForm, setPharmacyForm] = useState({ name: "", email: "", phone: "", address: "" });
  const [medicineForm, setMedicineForm] = useState({ name: "", category: "", description: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [usersData, pharmaciesData, medicinesData, reservationsData] = await Promise.all([
        request("/admin/users"),
        request("/admin/pharmacies"),
        request("/medicines?limit=1000"),
        request("/admin/reservations"),
      ]);
      setUsers((usersData.data || []).map(normalizeUser));
      setPharmacies((pharmaciesData.data || []).map(normalizePharmacy));
      setMedicines((medicinesData.data || []).map((m) => ({ ...m, id: idOf(m), category: m.category || "", description: m.description || "" })));
      setReservations((reservationsData.data || []).map(normalizeReservation));
    } catch (err) {
      setError(err.message || "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totalUsers = users.length;
  const totalPharmacies = pharmacies.length;
  const totalMedicines = medicines.length;
  const totalReservations = reservations.length;

  const filteredUsers = useMemo(() => {
    const q = userSearch.toLowerCase().trim();
    return !q ? users : users.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q));
  }, [users, userSearch]);

  const filteredPharmacies = useMemo(() => {
    const q = pharmacySearch.toLowerCase().trim();
    return !q ? pharmacies : pharmacies.filter((p) => `${p.name} ${p.email} ${p.address}`.toLowerCase().includes(q));
  }, [pharmacies, pharmacySearch]);

  const filteredMedicines = useMemo(() => {
    const q = medicineSearch.toLowerCase().trim();
    return !q ? medicines : medicines.filter((m) => `${m.name} ${m.category} ${m.description}`.toLowerCase().includes(q));
  }, [medicines, medicineSearch]);

  const filteredReservations = useMemo(() => {
    const q = reservationSearch.toLowerCase().trim();
    return !q ? reservations : reservations.filter((r) => `${r.customer} ${r.medicine} ${r.pharmacy} ${r.status}`.toLowerCase().includes(q));
  }, [reservations, reservationSearch]);

  const resetUserForm = () => {
    setUserForm({ name: "", email: "", role: "Customer" });
    setEditingUserId(null);
    setShowUserForm(false);
  };

  const handleEditUser = (user) => {
    setEditingUserId(user.id);
    setUserForm({ name: user.name, email: user.email, role: user.role });
    setShowUserForm(true);
  };

  const handleUserSubmit = async (event) => {
    event.preventDefault();
    try {
      await request(`/admin/users/${editingUserId}`, {
        method: "PATCH",
        body: JSON.stringify({
          username: userForm.name.trim(),
          email: userForm.email.trim().toLowerCase(),
          role: userForm.role.toLowerCase(),
        }),
      });
      resetUserForm();
      await loadData();
    } catch (err) { setError(err.message || "Failed to update user."); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await request(`/admin/users/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) { setError(err.message || "Failed to delete user."); }
  };

  const resetPharmacyForm = () => {
    setPharmacyForm({ name: "", email: "", phone: "", address: "" });
    setEditingPharmacyId(null);
    setShowPharmacyForm(false);
  };

  const handleEditPharmacy = (pharmacy) => {
    setEditingPharmacyId(pharmacy.id);
    setPharmacyForm({ name: pharmacy.name, email: pharmacy.email, phone: pharmacy.phone, address: pharmacy.address });
    setShowPharmacyForm(true);
  };

  const handlePharmacySubmit = async (event) => {
    event.preventDefault();
    try {
      await request(`/admin/pharmacies/${editingPharmacyId}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: pharmacyForm.name.trim(),
          phone: pharmacyForm.phone.trim(),
          address: pharmacyForm.address.trim(),
        }),
      });
      resetPharmacyForm();
      await loadData();
    } catch (err) { setError(err.message || "Failed to update pharmacy."); }
  };

  const handleTogglePharmacyStatus = async (id) => {
    const pharmacy = pharmacies.find((p) => String(p.id) === String(id));
    if (!pharmacy) return;
    try {
      await request(`/admin/pharmacies/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: pharmacy.status !== "Active" }),
      });
      await loadData();
    } catch (err) { setError(err.message || "Failed to update pharmacy status."); }
  };

  const handleDeletePharmacy = async (id) => {
    if (!window.confirm("Delete this pharmacy?")) return;
    try {
      await request(`/admin/pharmacies/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) { setError(err.message || "Failed to delete pharmacy."); }
  };

  const resetMedicineForm = () => {
    setMedicineForm({ name: "", category: "", description: "" });
    setEditingMedicineId(null);
    setShowMedicineForm(false);
  };

  const handleEditMedicine = (medicine) => {
    setEditingMedicineId(medicine.id);
    setMedicineForm({ name: medicine.name, category: medicine.category, description: medicine.description });
    setShowMedicineForm(true);
  };

  const handleMedicineSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        name: medicineForm.name.trim(),
        category: medicineForm.category.trim(),
        description: medicineForm.description.trim(),
      };
      if (editingMedicineId !== null) await apiUpdateMedicine(editingMedicineId, payload);
      else await apiAddMedicine(payload);
      resetMedicineForm();
      await loadData();
    } catch (err) { setError(err.message || "Failed to save medicine."); }
  };

  const handleDeleteMedicine = async (id) => {
    if (!window.confirm("Delete this medicine?")) return;
    try {
      await deleteMedicine(id);
      await loadData();
    } catch (err) { setError(err.message || "Failed to delete medicine."); }
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm("Delete this reservation?")) return;
    try {
      await request(`/admin/reservations/${id}`, { method: "DELETE" });
      await loadData();
    } catch (err) { setError(err.message || "Failed to delete reservation."); }
  };

  // ==========================================
  // Sidebar Navigation
  // ==========================================

  const navigationItems = [
    {
      id: "overview",
      label: "Overview",
      icon: "▦",
    },
    {
      id: "users",
      label: "Users",
      icon: "♙",
    },
    {
      id: "pharmacies",
      label: "Pharmacies",
      icon: "⌂",
    },
    {
      id: "medicines",
      label: "Medicines",
      icon: "▣",
    },
    {
      id: "reservations",
      label: "Reservations",
      icon: "◷",
    },
  ];

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="admin-dashboard">

      {/* ======================================
          Sidebar
      ====================================== */}

      <aside className="admin-sidebar">

        <div className="admin-logo">
          <div className="admin-logo-icon">
            <span>+</span>
          </div>

          <span className="admin-logo-text">
            MediFind
          </span>
        </div>

        <nav className="admin-nav">

          {navigationItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-nav-item ${
                activeSection === item.id
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setActiveSection(item.id)
              }
            >
              <span className="admin-nav-icon">
                {item.icon}
              </span>

              <span>{item.label}</span>
            </button>
          ))}

        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-profile">
            <div className="admin-avatar">
              A
            </div>

            <div>
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>
          </div>
        </div>

      </aside>

      {/* ======================================
          Main Content
      ====================================== */}

      <main className="admin-main">
        {error && <div className="admin-alert error">{error}</div>}\n        {loading && <div className="admin-alert">Loading data...</div>}

        {/* ====================================
            Header
        ==================================== */}

        <header className="admin-header">

          <div>
            <h1>
              {activeSection === "overview" &&
                "Overview"}

              {activeSection === "users" &&
                "Users Management"}

              {activeSection === "pharmacies" &&
                "Pharmacy Management"}

              {activeSection === "medicines" &&
                "Medicine Management"}

              {activeSection === "reservations" &&
                "Reservations Management"}
            </h1>

            <p>
              Manage and monitor the MediFind platform
            </p>
          </div>

        </header>

        {/* ====================================
            Overview
        ==================================== */}

        {activeSection === "overview" && (
          <section className="admin-section">

            <div className="admin-stats-grid">

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  ♙
                </div>

                <div>
                  <span>Total Users</span>
                  <strong>{totalUsers}</strong>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  ⌂
                </div>

                <div>
                  <span>Total Pharmacies</span>
                  <strong>
                    {totalPharmacies}
                  </strong>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  ▣
                </div>

                <div>
                  <span>Total Medicines</span>
                  <strong>
                    {totalMedicines}
                  </strong>
                </div>
              </div>

              <div className="admin-stat-card">
                <div className="admin-stat-icon">
                  ◷
                </div>

                <div>
                  <span>Total Reservations</span>
                  <strong>
                    {totalReservations}
                  </strong>
                </div>
              </div>

            </div>

            <div className="admin-content-card">

              <div className="admin-card-header">
                <div>
                  <h2>Recent Reservations</h2>
                  <p>
                    Latest activity on the platform
                  </p>
                </div>

                <button
                  type="button"
                  className="admin-secondary-button"
                  onClick={() =>
                    setActiveSection("reservations")
                  }
                >
                  View All
                </button>
              </div>

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Medicine</th>
                      <th>Pharmacy</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>

                    {reservations
                      .slice(0, 5)
                      .map((reservation) => (
                        <tr key={reservation.id}>

                          <td>
                            {reservation.customer}
                          </td>

                          <td>
                            {reservation.medicine}
                          </td>

                          <td>
                            {reservation.pharmacy}
                          </td>

                          <td>
                            {reservation.date}
                          </td>

                          <td>
                            <span
                              className={`admin-status ${
                                reservation.status
                                  .toLowerCase()
                              }`}
                            >
                              {reservation.status}
                            </span>
                          </td>

                        </tr>
                      ))}

                  </tbody>

                </table>

              </div>

            </div>

          </section>
        )}

        {/* ====================================
            Users
        ==================================== */}

        {activeSection === "users" && (
          <section className="admin-section">

            <div className="admin-toolbar">

              <input
                type="text"
                placeholder="Search users..."
                value={userSearch}
                onChange={(event) =>
                  setUserSearch(event.target.value)
                }
                className="admin-search-input"
              />

            </div>

            {showUserForm && editingUserId !== null && (
              <div className="admin-form-card">

                <div className="admin-card-header">
                  <div>
                    <h2>
                      {editingUserId !== null
                        ? "Edit User"
                        : "Add User"}
                    </h2>
                  </div>
                </div>

                <form
                  onSubmit={handleUserSubmit}
                  className="admin-form"
                >

                  <input
                    type="text"
                    placeholder="Name"
                    value={userForm.name}
                    onChange={(event) =>
                      setUserForm({
                        ...userForm,
                        name: event.target.value,
                      })
                    }
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={userForm.email}
                    onChange={(event) =>
                      setUserForm({
                        ...userForm,
                        email: event.target.value,
                      })
                    }
                  />

                  <select
                    value={userForm.role}
                    onChange={(event) =>
                      setUserForm({
                        ...userForm,
                        role: event.target.value,
                      })
                    }
                  >
                    <option value="Customer">
                      Customer
                    </option>

                    <option value="Pharmacy">
                      Pharmacy
                    </option>

                    <option value="Admin">
                      Admin
                    </option>
                  </select>

                  <div className="admin-form-actions">

                    <button
                      type="submit"
                      className="admin-primary-button"
                    >
                      {editingUserId !== null
                        ? "Update User"
                        : "Add User"}
                    </button>

                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={resetUserForm}
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              </div>
            )}

            <div className="admin-content-card">

              <div className="admin-card-header">
                <div>
                  <h2>All Users</h2>
                  <p>
                    Manage customer, pharmacy and admin
                    accounts
                  </p>
                </div>
              </div>

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredUsers.map((user) => (
                      <tr key={user.id}>

                        <td>{user.name}</td>

                        <td>{user.email}</td>

                        <td>{user.role}</td>

                        <td>
                          <span
                            className={`admin-status ${
                              user.status.toLowerCase()
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        <td>

                          <div className="admin-action-buttons">

                            <button
                              type="button"
                              className="admin-edit-button"
                              onClick={() =>
                                handleEditUser(user)
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-delete-button"
                              onClick={() =>
                                handleDeleteUser(
                                  user.id
                                )
                              }
                            >
                              Delete
                            </button>

                          </div>

                        </td>

                      </tr>
                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </section>
        )}

        {/* ====================================
            Pharmacies
        ==================================== */}

        {activeSection === "pharmacies" && (
          <section className="admin-section">

            <div className="admin-toolbar">

              <input
                type="text"
                placeholder="Search pharmacies..."
                value={pharmacySearch}
                onChange={(event) =>
                  setPharmacySearch(
                    event.target.value
                  )
                }
                className="admin-search-input"
              />

            </div>

            {showPharmacyForm && editingPharmacyId !== null && (
              <div className="admin-form-card">

                <div className="admin-card-header">
                  <div>
                    <h2>
                      {editingPharmacyId !== null
                        ? "Edit Pharmacy"
                        : "Add Pharmacy"}
                    </h2>
                  </div>
                </div>

                <form
                  onSubmit={handlePharmacySubmit}
                  className="admin-form"
                >

                  <input
                    type="text"
                    placeholder="Pharmacy Name"
                    value={pharmacyForm.name}
                    onChange={(event) =>
                      setPharmacyForm({
                        ...pharmacyForm,
                        name: event.target.value,
                      })
                    }
                  />

                  <input
                    type="email"
                    placeholder="Email"
                    value={pharmacyForm.email}
                    onChange={(event) =>
                      setPharmacyForm({
                        ...pharmacyForm,
                        email: event.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Phone"
                    value={pharmacyForm.phone}
                    onChange={(event) =>
                      setPharmacyForm({
                        ...pharmacyForm,
                        phone: event.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Address"
                    value={pharmacyForm.address}
                    onChange={(event) =>
                      setPharmacyForm({
                        ...pharmacyForm,
                        address: event.target.value,
                      })
                    }
                  />

                  <div className="admin-form-actions">

                    <button
                      type="submit"
                      className="admin-primary-button"
                    >
                      {editingPharmacyId !== null
                        ? "Update Pharmacy"
                        : "Add Pharmacy"}
                    </button>

                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={resetPharmacyForm}
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              </div>
            )}

            <div className="admin-content-card">

              <div className="admin-card-header">
                <div>
                  <h2>All Pharmacies</h2>
                  <p>
                    Manage registered pharmacies
                  </p>
                </div>
              </div>

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Address</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredPharmacies.map(
                      (pharmacy) => (
                        <tr key={pharmacy.id}>

                          <td>{pharmacy.name}</td>

                          <td>{pharmacy.email}</td>

                          <td>{pharmacy.phone}</td>

                          <td>{pharmacy.address}</td>

                          <td>
                            <span
                              className={`admin-status ${
                                pharmacy.status.toLowerCase()
                              }`}
                            >
                              {pharmacy.status}
                            </span>
                          </td>

                          <td>

                            <div className="admin-action-buttons">

                              <button
                                type="button"
                                className="admin-edit-button"
                                onClick={() =>
                                  handleEditPharmacy(
                                    pharmacy
                                  )
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="admin-toggle-button"
                                onClick={() =>
                                  handleTogglePharmacyStatus(
                                    pharmacy.id
                                  )
                                }
                              >
                                {pharmacy.status ===
                                "Active"
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>

                              <button
                                type="button"
                                className="admin-delete-button"
                                onClick={() =>
                                  handleDeletePharmacy(
                                    pharmacy.id
                                  )
                                }
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>
        )}

        {/* ====================================
            Medicines
        ==================================== */}

        {activeSection === "medicines" && (
          <section className="admin-section">

            <div className="admin-toolbar">

              <input
                type="text"
                placeholder="Search medicines..."
                value={medicineSearch}
                onChange={(event) =>
                  setMedicineSearch(
                    event.target.value
                  )
                }
                className="admin-search-input"
              />

              <button
                type="button"
                className="admin-primary-button"
                onClick={() => {
                  setEditingMedicineId(null);

                  setMedicineForm({
                    name: "",
                    category: "",
                    description: "",
                  });

                  setShowMedicineForm(true);
                }}
              >
                + Add Medicine
              </button>

            </div>

            {showMedicineForm && (
              <div className="admin-form-card">

                <div className="admin-card-header">
                  <div>
                    <h2>
                      {editingMedicineId !== null
                        ? "Edit Medicine"
                        : "Add Medicine"}
                    </h2>

                    <p>
                      Medicine catalog information only
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleMedicineSubmit}
                  className="admin-form"
                >

                  <input
                    type="text"
                    placeholder="Medicine Name"
                    value={medicineForm.name}
                    onChange={(event) =>
                      setMedicineForm({
                        ...medicineForm,
                        name: event.target.value,
                      })
                    }
                  />

                  <input
                    type="text"
                    placeholder="Category"
                    value={medicineForm.category}
                    onChange={(event) =>
                      setMedicineForm({
                        ...medicineForm,
                        category:
                          event.target.value,
                      })
                    }
                  />

                  <textarea
                    placeholder="Description"
                    value={medicineForm.description}
                    onChange={(event) =>
                      setMedicineForm({
                        ...medicineForm,
                        description:
                          event.target.value,
                      })
                    }
                    rows="4"
                  />

                  <div className="admin-form-actions">

                    <button
                      type="submit"
                      className="admin-primary-button"
                    >
                      {editingMedicineId !== null
                        ? "Update Medicine"
                        : "Add Medicine"}
                    </button>

                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={resetMedicineForm}
                    >
                      Cancel
                    </button>

                  </div>

                </form>

              </div>
            )}

            <div className="admin-content-card">

              <div className="admin-card-header">
                <div>
                  <h2>Medicine Catalog</h2>

                  <p>
                    Manage medicines available in the
                    MediFind system
                  </p>
                </div>
              </div>

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredMedicines.length === 0 ? (
                      <tr>
                        <td
                          colSpan="4"
                          className="admin-empty-cell"
                        >
                          No medicines found.
                        </td>
                      </tr>
                    ) : (
                      filteredMedicines.map(
                        (medicine) => (
                          <tr key={medicine.id}>

                            <td>
                              <strong>
                                {medicine.name}
                              </strong>
                            </td>

                            <td>
                              {medicine.category}
                            </td>

                            <td>
                              {medicine.description ||
                                "No description"}
                            </td>

                            <td>

                              <div className="admin-action-buttons">

                                <button
                                  type="button"
                                  className="admin-edit-button"
                                  onClick={() =>
                                    handleEditMedicine(
                                      medicine
                                    )
                                  }
                                >
                                  Edit
                                </button>

                                <button
                                  type="button"
                                  className="admin-delete-button"
                                  onClick={() =>
                                    handleDeleteMedicine(
                                      medicine.id
                                    )
                                  }
                                >
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>
        )}

        {/* ====================================
            Reservations
        ==================================== */}

        {activeSection === "reservations" && (
          <section className="admin-section">

            <div className="admin-toolbar">

              <input
                type="text"
                placeholder="Search reservations..."
                value={reservationSearch}
                onChange={(event) =>
                  setReservationSearch(
                    event.target.value
                  )
                }
                className="admin-search-input"
              />

            </div>

            <div className="admin-content-card">

              <div className="admin-card-header">
                <div>
                  <h2>All Reservations</h2>

                  <p>
                    Monitor medicine reservation
                    requests
                  </p>
                </div>
              </div>

              <div className="admin-table-wrapper">

                <table className="admin-table">

                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Medicine</th>
                      <th>Pharmacy</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>

                    {filteredReservations.length ===
                    0 ? (
                      <tr>
                        <td
                          colSpan="6"
                          className="admin-empty-cell"
                        >
                          No reservations found.
                        </td>
                      </tr>
                    ) : (
                      filteredReservations.map(
                        (reservation) => (
                          <tr
                            key={reservation.id}
                          >

                            <td>
                              {reservation.customer}
                            </td>

                            <td>
                              {reservation.medicine}
                            </td>

                            <td>
                              {reservation.pharmacy}
                            </td>

                            <td>
                              {reservation.date}
                            </td>

                            <td>
                              <span
                                className={`admin-status ${
                                  reservation.status.toLowerCase()
                                }`}
                              >
                                {reservation.status}
                              </span>
                            </td>

                            <td>

                              <div className="admin-action-buttons">

                                <button
                                  type="button"
                                  className="admin-delete-button"
                                  onClick={() =>
                                    handleDeleteReservation(
                                      reservation.id
                                    )
                                  }
                                >
                                  Delete
                                </button>

                              </div>

                            </td>

                          </tr>
                        )
                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          </section>
        )}

      </main>

    </div>
  );
}

export default AdminDashboard;