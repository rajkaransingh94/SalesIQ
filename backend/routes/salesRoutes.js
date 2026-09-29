// backend/routes/salesRoutes.js
const express = require("express");
const router = express.Router();
const {
  getMonthlySales,
  getSalesByCategory,
  getSalesByRegion,
} = require("../controllers/salesController");

router.get("/monthly", getMonthlySales);
router.get("/category", getSalesByCategory);
router.get("/region", getSalesByRegion);

module.exports = router;
