// frontend/src/services/api.js
// Thin wrapper around the SalesIQ REST API.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

async function request(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.json();
}

export const api = {
  health: () => request("/health"),
  filterOptions: () => request("/meta/filters"),
  summary: (filters) => request("/dashboard/summary", filters),
  monthlySales: (filters) => request("/sales/monthly", filters),
  salesByCategory: (filters) => request("/sales/category", filters),
  salesByRegion: (filters) => request("/sales/region", filters),
  topProducts: (filters, sortBy = "revenue", limit = 10) =>
    request("/products/top", { ...filters, sortBy, limit }),
  topCustomers: (filters, limit = 10) => request("/customers/top", { ...filters, limit }),
};
