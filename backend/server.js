// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const dashboardRoutes = require("./routes/dashboardRoutes");
const salesRoutes = require("./routes/salesRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const metaRoutes = require("./routes/metaRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware ----
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());

app.use(
  cors({
    origin: allowedOrigins,
  })
);
app.use(express.json());

// ---- Health check ----
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

// ---- Routes ----
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/meta", metaRoutes);

// ---- 404 handler ----
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// ---- Central error handler ----
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error", detail: err.message });
});

app.listen(PORT, () => {
  console.log(`SalesIQ API running on http://localhost:${PORT}`);
});
