// backend/controllers/metaController.js
// Small helper endpoint that powers the frontend filter dropdowns.
const pool = require("../db");
const { VALID_REGIONS } = require("../utils/queryFilters");

// GET /api/meta/filters
async function getFilterOptions(req, res, next) {
  try {
    const [categories] = await pool.query("SELECT name FROM categories ORDER BY name ASC");
    res.json({
      regions: VALID_REGIONS,
      categories: categories.map((c) => c.name),
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getFilterOptions };
