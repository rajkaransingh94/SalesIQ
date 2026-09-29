// backend/controllers/customerController.js
const pool = require("../db");
const { buildFilters } = require("../utils/queryFilters");

// GET /api/customers/top?limit=10
async function getTopCustomers(req, res, next) {
  try {
    const { whereSql, params } = buildFilters(req.query);
    const limit = clampLimit(req.query.limit, 10, 100);

    const sql = `
      SELECT
        cu.id AS customerId,
        cu.name AS customer,
        cu.region AS region,
        COUNT(DISTINCT o.id) AS orders,
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100)), 0) AS revenue,
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100) - oi.quantity * p.cost), 0) AS profit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      JOIN customers cu ON o.customer_id = cu.id
      ${whereSql}
      GROUP BY cu.id, cu.name, cu.region
      ORDER BY revenue DESC
      LIMIT ?;
    `;

    const [rows] = await pool.query(sql, [...params, limit]);
    res.json(
      rows.map((r) => ({
        ...r,
        orders: Number(r.orders),
        revenue: round2(Number(r.revenue)),
        profit: round2(Number(r.profit)),
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

module.exports = { getTopCustomers };
