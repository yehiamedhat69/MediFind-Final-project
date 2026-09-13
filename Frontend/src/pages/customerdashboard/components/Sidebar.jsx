import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/customer/dashboard",
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
    id: "search",
    label: "Find Medicine",
    path: "/medicine-search",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
        <circle
          cx="11"
          cy="11"
          r="7"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        <path
          d="M16 16L21 21"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },

  {
    id: "reservations",
    label: "My Reservations",
    path: "/customer/reservations",
    icon: (
      <svg className="nav-icon" viewBox="0 0 24 24" fill="none">
        <path
          d="M6 3H18C19.1 3 20 3.9 20 5V21L12 17L4 21V5C4 3.9 4.9 3 6 3Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },

  {
    id: "notifications",
    label: "Notifications",
    path: "/customer/notifications",
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
];

export default function Sidebar() {
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