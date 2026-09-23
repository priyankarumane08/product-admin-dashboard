export default function Pagination({
  page,
  total,
  limit,
  onPageChange,
  onLimitChange
}) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = total === 0 ? 0 : (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <div className="mt-6 flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-slate-600">
        Showing {start}–{end} of {total}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          className="rounded-md border bg-white px-3 py-2 text-sm"
          aria-label="Page size"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>

        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-md border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <div className="flex gap-1">
          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (number) => (
              <button
                key={number}
                onClick={() => onPageChange(number)}
                className={`rounded-md px-3 py-2 text-sm ${
                  number === page
                    ? "bg-blue-600 text-white"
                    : "border bg-white"
                }`}
              >
                {number}
              </button>
            )
          )}
        </div>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-md border bg-white px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}