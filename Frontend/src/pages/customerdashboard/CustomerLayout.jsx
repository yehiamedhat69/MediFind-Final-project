import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";

function CustomerLayout() {
  return (
    <div className="customer-page-layout">
      <Sidebar />

      <main className="customer-main-content">
        <Outlet />
      </main>
    </div>
  );
}

export default CustomerLayout;