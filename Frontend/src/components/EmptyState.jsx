function EmptyState({ message = "No data available" }) {
  return (
    <div>
      <p>{message}</p>
    </div>
  );
}

export default EmptyState;