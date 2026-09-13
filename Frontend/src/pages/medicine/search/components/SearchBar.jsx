function SearchBar({ searchTerm, setSearchTerm, onSearch, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!searchTerm.trim()) {
      return;
    }

    onSearch(searchTerm.trim());
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search for a medicine..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        disabled={loading}
      />

      <button
        type="submit"
        disabled={loading || !searchTerm.trim()}
      >
        {loading ? "Searching..." : "Search"}
      </button>
    </form>
  );
}

export default SearchBar;