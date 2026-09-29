// frontend/src/components/Filters.jsx
export default function Filters({ options, values, onChange, onApply, onReset }) {
  const { regions = [], categories = [] } = options || {};

  function update(key, value) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="filter-bar">
      <div className="filter-field">
        <label htmlFor="filter-region">Region</label>
        <select id="filter-region" value={values.region} onChange={(e) => update("region", e.target.value)}>
          <option value="">All regions</option>
          {regions.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-category">Category</label>
        <select id="filter-category" value={values.category} onChange={(e) => update("category", e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-field">
        <label htmlFor="filter-start">Start date</label>
        <input
          id="filter-start"
          type="date"
          value={values.startDate}
          onChange={(e) => update("startDate", e.target.value)}
        />
      </div>

      <div className="filter-field">
        <label htmlFor="filter-end">End date</label>
        <input
          id="filter-end"
          type="date"
          value={values.endDate}
          onChange={(e) => update("endDate", e.target.value)}
        />
      </div>

      <div className="filter-actions">
        <button className="btn" onClick={onReset} type="button">
          Reset
        </button>
        <button className="btn btn--primary" onClick={onApply} type="button">
          Apply
        </button>
      </div>
    </div>
  );
}
