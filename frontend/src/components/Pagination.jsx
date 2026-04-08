import './Pagination.css';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  return (
    <div className="pagination">
      {Array.from({ length: pages }, (_, i) => i + 1).map((num) => (
        <button
          key={num}
          className={`pagination-btn${num === page ? ' active' : ''}`}
          onClick={() => onPageChange(num)}
          disabled={num === page}
        >
          {num}
        </button>
      ))}
    </div>
  );
}
