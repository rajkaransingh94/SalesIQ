# SalesIQ — Career Materials

## Resume

**Project title:** SalesIQ — Full-Stack Sales Analytics Dashboard

**Bullets:**

- Built a full-stack sales analytics platform (React, Node.js/Express,
  MySQL) that computes revenue, profit, and margin KPIs from a normalized
  five-table relational schema using parameterized SQL aggregate queries.
- Designed and implemented a REST API with seven endpoints supporting
  dynamic region/category/date-range filtering, consumed by a React
  dashboard built with Recharts for trend, category, and regional
  visualizations.
- Engineered a data-generation pipeline producing 2,200+ orders and 5,400+
  order line items with realistic seasonality and regional demand
  weighting, used to validate query correctness and UI states at scale.
- Delivered a responsive, production-style UI with loading, error, and
  empty states, and documented the project for deployment on free-tier
  cloud hosting (frontend, backend, and managed MySQL).

## Tech stack line

```
React.js | Vite | JavaScript | Node.js | Express.js | MySQL | REST API | Recharts | Git
```

## LinkedIn description

SalesIQ is a full-stack sales analytics dashboard I built to practice the
complete data-to-UI pipeline: a normalized MySQL schema, SQL aggregate
queries for revenue/profit/margin, a Node.js/Express REST API, and a React
+ Recharts dashboard with live filtering by region, category, and date
range. All analytics are computed by SQL at query time — nothing is
hardcoded in the frontend. Built with a generated, realistic sample dataset
(2,200+ orders) to stress-test the queries and UI states end to end.

## Interview explanation prep

**What problem does SalesIQ solve?**
It gives a business a single place to see revenue, profit, and customer
trends without writing SQL by hand — the same kind of internal tool sales
ops or BI teams use to track performance by region, category, and product.

**How does the architecture work?**
Four layers, one direction of data flow: MySQL stores raw transactional
data (orders, order items, products, customers). Express queries MySQL with
parameterized SQL and shapes the results into JSON. React fetches that JSON
from the REST API and renders it with Recharts and plain tables. Nothing is
computed or hardcoded on the frontend — the API is the single source of
truth for every number shown.

**How does React communicate with Express?**
Through `fetch` calls in `src/services/api.js`, which build query strings
from the active filters and call the Express endpoints over HTTP. CORS is
enabled on the backend so the Vite dev server (a different origin) can call
it directly.

**How does Express communicate with MySQL?**
Through a connection pool created with `mysql2/promise` in `db.js`.
Controllers pull credentials from environment variables (never hardcoded),
build parameterized SQL with placeholders, and pass user-supplied filter
values as bound parameters — never string-concatenated — to prevent SQL
injection.

**How are analytics calculated?**
Revenue and profit aren't stored columns — they're computed per order line
as `quantity * unit_price * (1 - discount / 100)` for revenue, and revenue
minus `quantity * product.cost` for profit. Every dashboard number is a
`SUM`/`COUNT`/`GROUP BY` over that expression, joined across
`order_items → orders → products → categories → customers`.

**How do SQL JOINs work in this project?**
Every analytics query starts from `order_items` (the only table with both a
price and a link to a product) and joins up to `orders` for date/region,
`products` and `categories` for product/category info, and — for the
top-customers query — `customers` for name/region. The joins let one query
compute revenue broken down by any dimension without denormalizing the
data.

**How does filtering work?**
A shared helper (`utils/queryFilters.js`) turns query-string params
(`region`, `category`, `startDate`, `endDate`) into a `WHERE` clause and a
matching parameter array. Every controller calls it, so all endpoints
support the same filters consistently, and values are always bound
parameters rather than inlined into the SQL string.

**How does data reach Recharts?**
The controller's JSON response (an array of `{ month, revenue, profit }` or
similar) is stored in React state via `useState`/`useEffect`, then passed
directly as the `data` prop to Recharts' `LineChart`/`BarChart` components,
which map each object's keys to chart series.

**Why React?**
Component-based UI made it straightforward to reuse one `DataTable`
component for both the products and customers tables, and to keep chart
components (`SalesChart`, `CategoryChart`, `RegionChart`) independent and
swappable.

**Why Node/Express?**
Same language (JavaScript) across the stack, a minimal, well-understood
routing/middleware model, and first-class MySQL driver support via
`mysql2`.

**Why MySQL?**
The data is inherently relational — orders reference customers, order
items reference both orders and products — so foreign keys and joins are a
natural fit, and SQL aggregate functions are the simplest way to compute
revenue/profit rollups without doing that work in application code.

**How did you generate the dataset?**
A Node script (`database/generate-seed.js`) generates categories, products,
customers, orders, and order items with weighted randomness: regions and
products have different demand weights, order volume follows a monthly
seasonality curve (higher in Nov/Dec), and a subset of customers are
modeled as repeat buyers — so the resulting top-products/top-customers/
regional breakdowns look like real business data instead of being flat.

**How is the application deployed?**
Frontend as a static build (`vite build`) on a static host, backend as a
Node process on a Node-friendly host, and MySQL on a managed/cloud MySQL
instance — all connected via environment variables (`VITE_API_BASE_URL` on
the frontend, `DB_*` and `CORS_ORIGIN` on the backend). See the README for
the current recommended free-tier services.

**What challenges were encountered?**
Getting the generated data to produce *meaningful* differences between
regions/categories/products (rather than everything landing near the
average) required adding explicit weighting rather than pure uniform
randomness — otherwise every chart looked flat and every "top N" list was
arbitrary.

**How were those challenges solved?**
By giving each region and product a randomized weight used in a weighted
random selection, and applying a monthly seasonality multiplier to order
volume, so aggregated results have realistic spread while still being
fully synthetic.
