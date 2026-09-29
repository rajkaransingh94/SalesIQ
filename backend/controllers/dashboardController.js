// backend/controllers/dashboardController.js
const pool = require("../db");
const { buildFilters } = require("../utils/queryFilters");

// GET /api/dashboard/summary
async function getSummary(req, res, next) {
  try {
    const { whereSql, params } = buildFilters(req.query);

    const sql = `
      SELECT
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100)), 0) AS totalRevenue,
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100) - oi.quantity * p.cost), 0) AS totalProfit,
        COUNT(DISTINCT o.id) AS totalOrders,
        COUNT(DISTINCT o.customer_id) AS totalCustomers
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      ${whereSql};
    `;

    const [rows] = await pool.query(sql, params);
    const row = rows[0];

    const totalRevenue = Number(row.totalRevenue);
    const totalProfit = Number(row.totalProfit);
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    res.json({
      totalRevenue: round2(totalRevenue),
      totalProfit: round2(totalProfit),
      totalOrders: Number(row.totalOrders),
      totalCustomers: Number(row.totalCustomers),
      profitMargin: round2(profitMargin),
    });
  } catch (err) {
    next(err);
  }
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { getSummary };
