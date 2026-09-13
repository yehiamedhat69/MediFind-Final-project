import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/pharmacy/dashboard",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
        <rect
          x="3"
          y="3"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x="14"
          y="3"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x="3"
          y="14"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <rect
          x="14"
          y="14"
          width="7"
          height="7"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.8"
        />
      </svg>
    ),
  },

  {
    id: "inventory",
    label: "Inventory",
    path: "/pharmacy/inventory",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
        <path
          d="M4 7H20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M6 7V19H18V7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9 7V4H15V7"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M9 11H15"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },

  {
    id: "reservations",
    label: "Reservations",
    path: "/pharmacy/reservation",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
        <rect
          x="4"
          y="5"
          width="16"
          height="16"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M8 3V7M16 3V7M4 10H20"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <path
          d="M8 14H16M8 17H13"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },

  {
    id: "notifications",
    label: "Notifications",
    path: "/pharmacy/notifications",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
        <path
          d="M18 8C18 4.7 15.3 2 12 2C8.7 2 6 4.7 6 8C6 15 3 17 3 17H21C21 17 18 15 18 8Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        <path
          d="M10 21H14"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },

  {
    id: "profile",
    label: "Pharmacy Profile",
    path: "/pharmacy/profile",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
        <circle
          cx="12"
          cy="8"
          r="4"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M4 21C4 16.6 7.6 14 12 14C16.4 14 20 16.6 20 21"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
];

export default function PharmacySidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <div className="logo-icon">
          <svg viewBox="0 0 40 40" fill="none">
            <rect
              x="4"
              y="4"
              width="32"
              height="32"
              rx="9"
              fill="#ecfdf5"
            />

            <path
              d="M20 11V29M11 20H29"
              stroke="#0d9488"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <span className="logo-text">MediFind</span>
      </div>

      <nav className="nav-menu">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;

          return (
            <button
              key={item.id}
              type="button"
              className={`nav-item${isActive ? " active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}

        <button
          type="button"
          className="nav-item nav-logout"
          onClick={handleLogout}
        >
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M10 17L15 12L10 7"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            <path
              d="M15 12H3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />

            <path
              d="M21 3V21"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>

          Logout
        </button>
      </nav>
    </aside>
  );
}