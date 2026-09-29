// frontend/src/components/DataTable.jsx
// Generic ranked data table used for both Top Products and Top Customers.
// columns: [{ key, label, align: "left" | "num", render?: (row) => node }]

export default function DataTable({ columns, rows, emptyMessage = "No data for this selection." }) {
  if (!rows || rows.length === 0) {
    return <div className="state-box">{emptyMessage}</div>;
  }

  return (
    <table className="data-table">
      <thead>
        <tr>
          <th className="data-table__rank">#</th>
          {columns.map((col) => (
            <th key={col.key} className={col.align === "num" ? "num" : ""}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.id ?? i}>
            <td className="data-table__rank">{i + 1}</td>
            {columns.map((col) => (
              <td key={col.key} className={col.align === "num" ? "num" : ""}>
                {col.render ? col.render(row) : row[col.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
