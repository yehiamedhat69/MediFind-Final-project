import { Outlet } from "react-router-dom";
import PharmacySidebar from "./PharmacySidebar.jsx";
import { PharmacyProvider } from "../../context/PharmacyContext.jsx";

function PharmacyLayout() {
  return (
    <PharmacyProvider>
      <div className="customer-page-layout">
        <PharmacySidebar />

        <main className="customer-main-content">
          <Outlet />
        </main>
      </div>
    </PharmacyProvider>
  );
}

export default PharmacyLayout;