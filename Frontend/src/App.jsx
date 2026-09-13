import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context
import { MedicineProvider } from "./context/MedicineContext.jsx";
import { PharmacyProvider } from "./context/PharmacyContext.jsx";

// Protected Routes
import ProtectedRoute from "./rout/protectroutes";

// Customer
import CustomerDashboard from "./pages/customerdashboard/customerdashboard";
import CustomerLayout from "./pages/customerdashboard/CustomerLayout";
import CustomerReservations from "./pages/reservation/CustomerReservations";
import CustomerNotifications from "./pages/notifications/CustomerNotifications";

// Medicine
import MedicineSearch from "./pages/medicine/search/MedicineSearch";
import MedicineDetails from "./pages/medicine/details/MedicineDetails";

// Pharmacy
import PharmacyDetails from "./pages/pharmacy/PharmacyDetails";
import PharmacyDashboard from "./pages/pharmacy/PharmacyDashboard";
import PharmacyLayout from "./pages/pharmacy/PharmacyLayout";
import PharmacyNotifications from "./pages/PharmacyNotifications";
import PharmacyProfile from "./pages/pharmacy/PharmacyProfile";
import InventoryManagement from "./pages/pharmacy/InventoryManagement";

// Reservations
import MedicineReservation from "./pages/reservation/MedicineReservation";
import PharmacyReservations from "./pages/reservation/PharmacyReservations";

// Authentication
import Login from "./pages/authentication/Login/Login";
import Register from "./pages/authentication/Register/Register";

// Admin
import AdminDashboard from "./pages/admin/Admindashboard";

function App() {
  return (
    <MedicineProvider>
      <PharmacyProvider>
      <BrowserRouter>
        <Routes>

          {/* =========================
              Public Routes
          ========================= */}

          {/* Default */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Authentication */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Unauthorized */}
          <Route
            path="/unauthorized"
            element={
              <div style={{ padding: "40px", textAlign: "center" }}>
                <h1>Unauthorized</h1>
                <p>You do not have permission to access this page.</p>
              </div>
            }
          />

          {/* Medicine Details */}
          <Route
            path="/medicine/:medicineId"
            element={<MedicineDetails />}
          />

          {/* Pharmacy Details */}
          <Route
            path="/pharmacy/:pharmacyId"
            element={<PharmacyDetails />}
          />

          {/* Reservation */}
          <Route
            path="/reservation/:medicineId/:pharmacyId"
            element={<MedicineReservation />}
          />


          {/* =========================
              Customer Routes
          ========================= */}

          <Route
            element={
              <ProtectedRoute allowedRoles={["customer"]} />
            }
          >
            <Route element={<CustomerLayout />}>

              <Route
                path="/customer/dashboard"
                element={<CustomerDashboard />}
              />

              <Route
                path="/medicine-search"
                element={<MedicineSearch />}
              />

              <Route
                path="/customer/reservations"
                element={<CustomerReservations />}
              />

              <Route
                path="/customer/notifications"
                element={<CustomerNotifications />}
              />

            </Route>
          </Route>


          {/* =========================
              Pharmacy Routes
          ========================= */}

          <Route
            element={
              <ProtectedRoute allowedRoles={["pharmacy"]} />
            }
          >
            <Route element={<PharmacyLayout />}>

              <Route
                path="/pharmacy/dashboard"
                element={<PharmacyDashboard />}
              />

              <Route
                path="/pharmacy/notifications"
                element={<PharmacyNotifications />}
              />

              <Route
                path="/pharmacy/profile"
                element={<PharmacyProfile />}
              />

              <Route
                path="/pharmacy/inventory"
                element={<InventoryManagement />}
              />

              <Route
                path="/pharmacy/reservation"
                element={<PharmacyReservations />}
              />

            </Route>
          </Route>


          {/* =========================
              Admin Routes
          ========================= */}

          <Route
            element={
              <ProtectedRoute allowedRoles={["admin"]} />
            }
          >
            <Route
              path="/admin/dashboard"
              element={<AdminDashboard />}
            />
          </Route>


          {/* =========================
              Fallback
          ========================= */}

          <Route
            path="*"
            element={<Navigate to="/medicine-search" replace />}
          />

        </Routes>
      </BrowserRouter>
      </PharmacyProvider>
    </MedicineProvider>
  );
}

export default App;