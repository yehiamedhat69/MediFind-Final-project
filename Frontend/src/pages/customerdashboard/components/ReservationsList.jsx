import { useNavigate } from "react-router-dom";

function MedicineThumb({ thumb }) {
  return (
    <div className="medicine-thumb">
      <svg viewBox="0 0 40 40" fill="none">
        <rect
          x="8"
          y="6"
          width="24"
          height="28"
          rx="3"
          fill={thumb.fill}
          stroke={thumb.stroke}
          strokeWidth="1.5"
        />
        <rect
          x="12"
          y="10"
          width="16"
          height="8"
          rx="1"
          fill={thumb.labelFill}
        />
        <text
          x="20"
          y="16"
          textAnchor="middle"
          fill="white"
          fontSize={thumb.label.length > 1 ? 4 : 5}
          fontWeight="bold"
        >
          {thumb.label}
        </text>
      </svg>
    </div>
  );
}

export default function ReservationsList({ reservations }) {
  const navigate = useNavigate();

  return (
    <section className="reservations-section">
      <h2>My Reservations</h2>

      <div className="reservations-list">
        {reservations.map((item) => (
          <article key={item.id} className="reservation-row">
            <div className="medicine-info">
              <MedicineThumb thumb={item.thumb} />

              <div className="medicine-details">
                <span className="medicine-name">{item.name}</span>
                <span className="medicine-qty">{item.quantity}</span>
              </div>
            </div>

            <span className="pharmacy">{item.pharmacy}</span>

            <span className="price">{item.price}</span>

            <span
              className={`status-badge status-${item.status.toLowerCase()}`}
            >
              {item.status}
            </span>
          </article>
        ))}
      </div>

      <div className="view-all-wrapper">
        <button
          type="button"
          className="view-all"
          onClick={() => navigate("/customer/reservations")}
        >
          View All
        </button>
      </div>
    </section>
  );
}