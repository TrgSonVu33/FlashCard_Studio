import './CategorySelect.css';

export default function CategorySelect({ categories, flashcards, onSelect }) {
  return (
    <div className="category-select">
      <h2 className="category-select-title">Choose a Category</h2>
      <div className="category-grid">
        {categories.map((cat) => (
          <button
            key={cat.key}
            className="category-card"
            onClick={() => onSelect(cat.key)}
          >
            <span className="category-emoji">{cat.emoji}</span>
            <span className="category-label">{cat.label}</span>
            <span className="category-count">{flashcards[cat.key].length} cards</span>
          </button>
        ))}
      </div>
    </div>
  );
}
