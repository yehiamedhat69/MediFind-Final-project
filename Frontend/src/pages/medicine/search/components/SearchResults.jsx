import MedicineCard from "./MedicineCard";

function SearchResults({ results }) {
  return (
    <div className="results-wrapper">
      <div className="results-header">
        <h2>Search Results</h2>

        <span>
          {results.length} result(s)
        </span>
      </div>

      <div className="results-list">
        {results.map((medicine) => (
          <MedicineCard
            key={medicine.id}
            medicine={medicine}
          />
        ))}
      </div>
    </div>
  );
}

export default SearchResults;