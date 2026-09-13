function ErrorMessage({ message = "Something went wrong", onRetry }) {
  return (
    <div>
      <p>{message}</p>

      {onRetry && (
        <button onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export default ErrorMessage;