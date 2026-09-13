import { useNavigate } from "react-router-dom";

function MedicineCard({ medicine }) {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/medicine/${medicine.id}`);
  };

  return (
    <article className="medicine-card">
      <div className="card-top">
        <div>
          <h3>{medicine.name}</h3>

          <p>{medicine.description}</p>
        </div>
      </div>

      <div className="card-actions">
        <button onClick={handleViewDetails}>
          View Medicine Details
        </button>
      </div>
    </article>
  );
}

export default MedicineCard;