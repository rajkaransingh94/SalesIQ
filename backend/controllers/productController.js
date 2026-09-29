// backend/controllers/productController.js
const pool = require("../db");
const { buildFilters } = require("../utils/queryFilters");

// GET /api/products/top?sortBy=revenue|profit&limit=10
async function getTopProducts(req, res, next) {
  try {
    const { whereSql, params } = buildFilters(req.query);
    const sortBy = req.query.sortBy === "profit" ? "profit" : "revenue";
    const limit = clampLimit(req.query.limit, 10, 100);

    const sql = `
      SELECT
        p.id AS productId,
        p.name AS product,
        c.name AS category,
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100)), 0) AS revenue,
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100) - oi.quantity * p.cost), 0) AS profit,
        COALESCE(SUM(oi.quantity), 0) AS unitsSold
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      ${whereSql}
      GROUP BY p.id, p.name, c.name
      ORDER BY ${sortBy} DESC
      LIMIT ?;
    `;

    const [rows] = await pool.query(sql, [...params, limit]);
    res.json(
      rows.map((r) => ({
        ...r,
        revenue: round2(Number(r.revenue)),
        profit: round2(Number(r.profit)),
        unitsSold: Number(r.unitsSold),
      }))
    );
  } catch (err) {
    next(err);
  }
}

function clampLimit(value, def, max) {
  const n = parseInt(value, 10);
  if (!Number.isFinite(n) || n <= 0) return def;
  return Math.min(n, max);
}
function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { getTopProducts };
