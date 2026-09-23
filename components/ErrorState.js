export default function ErrorState({ message, onRetry }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <p className="mb-4 text-red-700">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-md bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );
}