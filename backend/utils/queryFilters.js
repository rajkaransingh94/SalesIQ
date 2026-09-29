// backend/utils/queryFilters.js
// Builds a shared WHERE clause + parameter array from the optional
// query-string filters supported across the analytics endpoints:
//   ?region=North&category=Electronics&startDate=2025-01-01&endDate=2025-12-31

const VALID_REGIONS = ["North", "South", "East", "West", "Central"];

function buildFilters(query = {}) {
  const { region, category, startDate, endDate } = query;
  const clauses = [];
  const params = [];

  if (region && VALID_REGIONS.includes(region)) {
    clauses.push("o.region = ?");
    params.push(region);
  }

  if (category) {
    clauses.push("c.name = ?");
    params.push(category);
  }

  if (startDate) {
    clauses.push("o.order_date >= ?");
    params.push(startDate);
  }

  if (endDate) {
    clauses.push("o.order_date <= ?");
    params.push(endDate);
  }

  const whereSql = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return { whereSql, params };
}

module.exports = { buildFilters, VALID_REGIONS };
