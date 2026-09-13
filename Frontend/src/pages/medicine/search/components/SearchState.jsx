function SearchState({ type, message }) {
  if (type === "loading") {
    return (
      <div className="search-state">
        <div className="loader"></div>
        <h3>Searching...</h3>
        <p>Looking for available medicines.</p>
      </div>
    );
  }

  if (type === "empty") {
    return (
      <div className="search-state">
        <h3>No medicines found</h3>
        <p>
          We couldn't find any medicine matching your search.
        </p>
      </div>
    );
  }

  if (type === "error") {
    return (
      <div className="search-state error-state">
        <h3>Something went wrong</h3>
        <p>{message}</p>
      </div>
    );
  }

  return null;
}

export default SearchState;