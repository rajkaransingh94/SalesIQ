// backend/routes/productRoutes.js
const express = require("express");
const router = express.Router();
const { getTopProducts } = require("../controllers/productController");

router.get("/top", getTopProducts);

module.exports = router;
