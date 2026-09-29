// backend/routes/customerRoutes.js
const express = require("express");
const router = express.Router();
const { getTopCustomers } = require("../controllers/customerController");

router.get("/top", getTopCustomers);

module.exports = router;
