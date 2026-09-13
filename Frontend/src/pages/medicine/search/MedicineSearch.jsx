import { useState } from "react";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResults";
import Pagination from "./components/Pagination";
import { searchMedicines } from "../../../services/medicineService";

import Loading from "../../../components/Loading";
import ErrorMessage from "../../../components/ErrorMessage";
import EmptyState from "../../../components/EmptyState";

import "./MedicineSearch.css";

function MedicineSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);

  const RESULTS_PER_PAGE = 4;

  const handleSearch = async (term) => {
    const trimmedTerm = term.trim();

    if (!trimmedTerm) {
      setResults([]);
      setSearched(false);
      setError("");
      setCurrentPage(1);
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    setCurrentPage(1);

    try {
      const data = await searchMedicines(trimmedTerm);
      setResults(data || []);
    } catch (err) {
      console.error("Error searching medicines:", err);
      setResults([]);
      setError("Failed to search for medicines.");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(
    results.length / RESULTS_PER_PAGE
  );

  const startIndex =
    (currentPage - 1) * RESULTS_PER_PAGE;

  const endIndex =
    startIndex + RESULTS_PER_PAGE;

  const currentResults = results.slice(
    startIndex,
    endIndex
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const renderResults = () => {
    if (loading) {
      return <Loading />;
    }

    if (error) {
      return (
        <ErrorMessage
          message={error}
          onRetry={() => handleSearch(searchTerm)}
        />
      );
    }

    if (searched && results.length === 0) {
      return (
        <EmptyState
          message="No medicines found. Try searching for another medicine."
        />
      );
    }

    if (results.length > 0) {
      return (
        <>
          <SearchResults results={currentResults} />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      );
    }

    return (
      <div className="welcome-state">
        <h2>Find Your Medicine</h2>

        <p>
          Search for a medicine to view its details and
          available pharmacies.
        </p>
      </div>
    );
  };

  return (
    <main className="medicine-search-page">
      <div className="search-container">

        <header className="page-header">
          <h1>Find Your Medicine</h1>

          <p>
            Search for a medicine and find pharmacies
            where it is available.
          </p>
        </header>

        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          onSearch={handleSearch}
          loading={loading}
        />

        <section className="results-container">
          {renderResults()}
        </section>

      </div>
    </main>
  );
}

export default MedicineSearch;