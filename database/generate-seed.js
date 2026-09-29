/**
 * SalesIQ — fictional sample data generator
 * ------------------------------------------------------------------
 * Generates realistic (but entirely fictional) business data and writes
 * it to database/seed.sql as plain INSERT statements. No DB connection
 * or npm dependencies are required to run this script.
 *
 * Usage:
 *   node generate-seed.js
 *
 * Then load schema.sql followed by seed.sql into MySQL.
 * ------------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

// ---------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------
const REGIONS = ["North", "South", "East", "West", "Central"];
const NUM_CUSTOMERS = 550;
const NUM_MONTHS = 24; // 2 years of history
const TARGET_ORDERS = 2200;
const MAX_ITEMS_PER_ORDER = 4;

// Region demand weights (some regions sell more than others)
const REGION_WEIGHT = { North: 1.3, South: 0.9, East: 1.15, West: 1.0, Central: 0.7 };

// Seasonality multiplier by month (Nov/Dec holiday bump, Jan/Feb dip)
const SEASONALITY = [0.85, 0.8, 0.95, 1.0, 1.0, 0.95, 0.9, 0.95, 1.05, 1.15, 1.35, 1.5];

// ---------------------------------------------------------------------
// Categories + products (name, category, price, cost)
// ---------------------------------------------------------------------
const CATALOG = {
  Electronics: [
    ["Wireless Earbuds Pro", 89.99, 38],
    ["4K Streaming Stick", 49.99, 19],
    ["Smart LED Desk Lamp", 34.99, 14],
    ["Portable Bluetooth Speaker", 59.99, 24],
    ["USB-C Fast Charger 65W", 29.99, 11],
  ],
  "Home & Kitchen": [
    ["Stainless Steel Cookware Set", 129.99, 58],
    ["Programmable Coffee Maker", 74.99, 31],
    ["Robot Vacuum Cleaner", 249.99, 120],
    ["Air Fryer XL", 99.99, 42],
    ["Memory Foam Pillow (2-Pack)", 39.99, 15],
  ],
  "Office Supplies": [
    ["Ergonomic Mesh Office Chair", 179.99, 82],
    ["Standing Desk Converter", 139.99, 63],
    ["Wireless Keyboard & Mouse Combo", 44.99, 17],
    ["Adjustable Laptop Stand", 27.99, 9],
    ["Noise-Cancelling Headset", 69.99, 27],
  ],
  "Sports & Outdoors": [
    ["Insulated Water Bottle 32oz", 24.99, 8],
    ["Yoga Mat Premium", 34.99, 12],
    ["Adjustable Dumbbell Set", 189.99, 88],
    ["Camping Hammock", 44.99, 16],
    ["Running Shoes Trail Edition", 94.99, 39],
  ],
  "Beauty & Personal Care": [
    ["Facial Cleansing Device", 59.99, 22],
    ["Electric Toothbrush", 49.99, 18],
    ["Hair Dryer Ionic", 64.99, 26],
    ["Skincare Gift Set", 54.99, 21],
  ],
  "Pet Supplies": [
    ["Automatic Pet Feeder", 79.99, 34],
    ["Orthopedic Dog Bed", 69.99, 28],
    ["Cat Tree Tower", 89.99, 37],
  ],
};

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
function esc(str) {
  return String(str).replace(/'/g, "''");
}
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[randInt(0, arr.length - 1)];
}
function weightedRegion() {
  const total = Object.values(REGION_WEIGHT).reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (const region of REGIONS) {
    r -= REGION_WEIGHT[region];
    if (r <= 0) return region;
  }
  return REGIONS[0];
}

const FIRST_NAMES = ["James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda","David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Charles","Karen","Christopher","Nancy","Daniel","Lisa","Matthew","Betty","Anthony","Margaret","Mark","Sandra","Donald","Ashley","Steven","Kimberly","Paul","Emily","Andrew","Donna","Joshua","Michelle","Kenneth","Dorothy","Kevin","Carol","Brian","Amanda","George","Melissa","Edward","Deborah","Ronald","Stephanie","Timothy","Rebecca","Jason","Sharon","Jeffrey","Laura","Ryan","Cynthia","Jacob","Kathleen","Gary","Amy","Nicholas","Shirley","Eric","Angela","Jonathan","Helen","Stephen","Anna","Larry","Brenda","Justin","Pamela","Scott","Nicole","Brandon","Emma","Benjamin","Samantha","Samuel","Katherine","Gregory","Christine","Frank","Debra","Alexander","Rachel","Raymond","Catherine","Patrick","Carolyn","Jack","Janet"];
const LAST_NAMES = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts"];

function randomName(usedEmails) {
  const first = pick(FIRST_NAMES);
  const last = pick(LAST_NAMES);
  let email, suffix = 0;
  do {
    suffix++;
    email = `${first.toLowerCase()}.${last.toLowerCase()}${suffix > 1 ? suffix : ""}@example.com`;
  } while (usedEmails.has(email));
  usedEmails.add(email);
  return { name: `${first} ${last}`, email };
}

function randomDateInRange(startDate, endDate) {
  const start = startDate.getTime();
  const end = endDate.getTime();
  return new Date(start + Math.random() * (end - start));
}
function fmtDate(d) {
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------
// Build categories + products
// ---------------------------------------------------------------------
const categories = Object.keys(CATALOG).map((name, i) => ({ id: i + 1, name }));
const products = [];
let productId = 1;
for (const cat of categories) {
  for (const [name, price, cost] of CATALOG[cat.name]) {
    products.push({ id: productId++, name, category_id: cat.id, price, cost });
  }
}

// Give each product a relative popularity weight so some products sell
// far more than others (produces meaningful "top products" rankings).
products.forEach((p) => (p.weight = Math.random() * 2 + 0.3));

// ---------------------------------------------------------------------
// Build customers
// ---------------------------------------------------------------------
const usedEmails = new Set();
const customers = [];
for (let i = 1; i <= NUM_CUSTOMERS; i++) {
  const { name, email } = randomName(usedEmails);
  customers.push({ id: i, name, email, region: weightedRegion() });
}

// ---------------------------------------------------------------------
// Build orders + order_items across NUM_MONTHS, weighted by seasonality
// ---------------------------------------------------------------------
const today = new Date();
const rangeEnd = new Date(today.getFullYear(), today.getMonth(), 28);
const rangeStart = new Date(rangeEnd);
rangeStart.setMonth(rangeStart.getMonth() - NUM_MONTHS);

// Precompute month buckets with seasonality weight so order volume
// naturally rises in Nov/Dec and dips in Jan/Feb, repeated per year.
const months = [];
for (let i = 0; i < NUM_MONTHS; i++) {
  const d = new Date(rangeStart);
  d.setMonth(d.getMonth() + i);
  const seasonIdx = d.getMonth(); // 0-11
  months.push({ year: d.getFullYear(), month: d.getMonth(), weight: SEASONALITY[seasonIdx] });
}
const monthWeightTotal = months.reduce((a, m) => a + m.weight, 0);

function pickMonth() {
  let r = Math.random() * monthWeightTotal;
  for (const m of months) {
    r -= m.weight;
    if (r <= 0) return m;
  }
  return months[months.length - 1];
}
function pickProductWeighted() {
  const total = products.reduce((a, p) => a + p.weight, 0);
  let r = Math.random() * total;
  for (const p of products) {
    r -= p.weight;
    if (r <= 0) return p;
  }
  return products[products.length - 1];
}

// A subset of customers behave as "high value" repeat buyers so the
// top-customers report has a meaningful spread.
customers.forEach((c) => (c.loyalty = Math.random() < 0.12 ? randInt(3, 6) : randInt(1, 2)));

const orders = [];
const orderItems = [];
let orderId = 1;
let itemId = 1;

while (orders.length < TARGET_ORDERS) {
  const customer = pick(customers);
  const ordersForThisCustomer = customer.loyalty;
  for (let n = 0; n < ordersForThisCustomer && orders.length < TARGET_ORDERS; n++) {
    const m = pickMonth();
    const daysInMonth = new Date(m.year, m.month + 1, 0).getDate();
    const orderDate = new Date(m.year, m.month, randInt(1, daysInMonth));
    // Order region: usually matches customer region, occasionally differs
    // (e.g. shipping to a different address) to keep the data realistic.
    const region = Math.random() < 0.85 ? customer.region : weightedRegion();

    const order = { id: orderId++, customer_id: customer.id, order_date: fmtDate(orderDate), region };
    orders.push(order);

    const numItems = randInt(1, MAX_ITEMS_PER_ORDER);
    const chosenProducts = new Set();
    for (let k = 0; k < numItems; k++) {
      const product = pickProductWeighted();
      if (chosenProducts.has(product.id)) continue;
      chosenProducts.add(product.id);
      const quantity = randInt(1, 5);
      const discount = Math.random() < 0.3 ? pick([5, 10, 15, 20]) : 0;
      orderItems.push({
        id: itemId++,
        order_id: order.id,
        product_id: product.id,
        quantity,
        unit_price: product.price,
        discount,
      });
    }
  }
}

// ---------------------------------------------------------------------
// Write SQL
// ---------------------------------------------------------------------
const lines = [];
lines.push("-- =====================================================================");
lines.push("-- SalesIQ — generated sample data (fictional business data)");
lines.push(`-- Generated ${new Date().toISOString()}`);
lines.push(`-- ${categories.length} categories, ${products.length} products, ${customers.length} customers,`);
lines.push(`-- ${orders.length} orders, ${orderItems.length} order items`);
lines.push("-- =====================================================================");
lines.push("");
lines.push("USE sales_dashboard;");
lines.push("");
lines.push("SET FOREIGN_KEY_CHECKS = 0;");
lines.push("TRUNCATE TABLE order_items;");
lines.push("TRUNCATE TABLE orders;");
lines.push("TRUNCATE TABLE products;");
lines.push("TRUNCATE TABLE customers;");
lines.push("TRUNCATE TABLE categories;");
lines.push("SET FOREIGN_KEY_CHECKS = 1;");
lines.push("");

function insertBatch(table, columns, rows, rowToValues, batchSize = 500) {
  lines.push(`-- ${table} (${rows.length} rows)`);
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    lines.push(`INSERT INTO ${table} (${columns.join(", ")}) VALUES`);
    lines.push(chunk.map(rowToValues).join(",\n") + ";");
  }
  lines.push("");
}

insertBatch(
  "categories",
  ["id", "name"],
  categories,
  (c) => `(${c.id}, '${esc(c.name)}')`
);

insertBatch(
  "products",
  ["id", "name", "category_id", "price", "cost"],
  products,
  (p) => `(${p.id}, '${esc(p.name)}', ${p.category_id}, ${p.price.toFixed(2)}, ${p.cost.toFixed(2)})`
);

insertBatch(
  "customers",
  ["id", "name", "email", "region"],
  customers,
  (c) => `(${c.id}, '${esc(c.name)}', '${esc(c.email)}', '${c.region}')`
);

insertBatch(
  "orders",
  ["id", "customer_id", "order_date", "region"],
  orders,
  (o) => `(${o.id}, ${o.customer_id}, '${o.order_date}', '${o.region}')`
);

insertBatch(
  "order_items",
  ["id", "order_id", "product_id", "quantity", "unit_price", "discount"],
  orderItems,
  (it) => `(${it.id}, ${it.order_id}, ${it.product_id}, ${it.quantity}, ${it.unit_price.toFixed(2)}, ${it.discount.toFixed(2)})`
);

lines.push("-- Reset AUTO_INCREMENT counters to continue after seeded IDs");
lines.push(`ALTER TABLE categories AUTO_INCREMENT = ${categories.length + 1};`);
lines.push(`ALTER TABLE products AUTO_INCREMENT = ${products.length + 1};`);
lines.push(`ALTER TABLE customers AUTO_INCREMENT = ${customers.length + 1};`);
lines.push(`ALTER TABLE orders AUTO_INCREMENT = ${orders.length + 1};`);
lines.push(`ALTER TABLE order_items AUTO_INCREMENT = ${orderItems.length + 1};`);
lines.push("");

const outPath = path.join(__dirname, "seed.sql");
fs.writeFileSync(outPath, lines.join("\n"));

console.log(`Wrote ${outPath}`);
console.log(`  categories:  ${categories.length}`);
console.log(`  products:    ${products.length}`);
console.log(`  customers:   ${customers.length}`);
console.log(`  orders:      ${orders.length}`);
console.log(`  order_items: ${orderItems.length}`);
