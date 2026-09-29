// backend/controllers/salesController.js
const pool = require("../db");
const { buildFilters } = require("../utils/queryFilters");

// GET /api/sales/monthly
async function getMonthlySales(req, res, next) {
  try {
    const { whereSql, params } = buildFilters(req.query);

    const sql = `
      SELECT
        DATE_FORMAT(o.order_date, '%Y-%m') AS month,
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100)), 0) AS revenue,
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100) - oi.quantity * p.cost), 0) AS profit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      ${whereSql}
      GROUP BY month
      ORDER BY month ASC;
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(formatRevenueProfit));
  } catch (err) {
    next(err);
  }
}

// GET /api/sales/category
async function getSalesByCategory(req, res, next) {
  try {
    const { whereSql, params } = buildFilters(req.query);

    const sql = `
      SELECT
        c.name AS category,
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100)), 0) AS revenue,
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100) - oi.quantity * p.cost), 0) AS profit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      ${whereSql}
      GROUP BY c.name
      ORDER BY revenue DESC;
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(formatRevenueProfit));
  } catch (err) {
    next(err);
  }
}

// GET /api/sales/region
async function getSalesByRegion(req, res, next) {
  try {
    const { whereSql, params } = buildFilters(req.query);

    const sql = `
      SELECT
        o.region AS region,
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100)), 0) AS revenue,
        COALESCE(SUM(oi.quantity * oi.unit_price * (1 - oi.discount / 100) - oi.quantity * p.cost), 0) AS profit
      FROM order_items oi
      JOIN orders o ON oi.order_id = o.id
      JOIN products p ON oi.product_id = p.id
      JOIN categories c ON p.category_id = c.id
      ${whereSql}
      GROUP BY o.region
      ORDER BY revenue DESC;
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows.map(formatRevenueProfit));
  } catch (err) {
    next(err);
  }
}

function formatRevenueProfit(row) {
  return {
    ...row,
    revenue: round2(Number(row.revenue)),
    profit: round2(Number(row.profit)),
  };
}
function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { getMonthlySales, getSalesByCategory, getSalesByRegion };
