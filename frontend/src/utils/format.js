// frontend/src/utils/format.js
export function formatCurrency(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
}

export function formatCurrencyPrecise(value) {
  const n = Number(value) || 0;
  return n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

export function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-US");
}

export function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`;
}

export function formatMonth(yyyyMm) {
  if (!yyyyMm) return "";
  const [year, month] = yyyyMm.split("-");
  const date = new Date(Number(year), Number(month) - 1, 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}
