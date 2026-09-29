import { useEffect, useState, useCallback } from "react";
import { api } from "../services/api.js";
import Filters from "../components/Filters.jsx";
import KPICard from "../components/KPICard.jsx";
import SalesChart from "../components/SalesChart.jsx";
import CategoryChart from "../components/CategoryChart.jsx";
import RegionChart from "../components/RegionChart.jsx";
import DataTable from "../components/DataTable.jsx";
import {
  formatCurrency,
  formatCurrencyPrecise,
  formatNumber,
  formatPercent,
} from "../utils/format.js";

const EMPTY_FILTERS = { region: "", category: "", startDate: "", endDate: "" };

const TAB_COPY = {
  overview: {
    title: "Sales overview",
    subtitle: "Revenue, profit and customer activity across the sample SalesIQ retail dataset.",
  },
  trends: {
    title: "Sales trends",
    subtitle: "Monthly revenue and profit trend, plus the regional and category breakdown behind it.",
  },
  products: {
    title: "Products",
    subtitle: "Which categories and individual products are driving revenue and profit.",
  },
  customers: {
    title: "Customers",
    subtitle: "Regional performance and the customers generating the most revenue.",
  },
};

export default function Dashboard({ activeTab = "overview" }) {
  const [filterOptions, setFilterOptions] = useState({ regions: [], categories: [] });
  const [pendingFilters, setPendingFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [byRegion, setByRegion] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load filter dropdown options once.
  useEffect(() => {
    api
      .filterOptions()
      .then(setFilterOptions)
      .catch(() => {
        /* non-fatal: filters just won't have options */
      });
  }, []);

  const loadDashboard = useCallback(async (filters) => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, monthlyRes, categoryRes, regionRes, productsRes, customersRes] = await Promise.all([
        api.summary(filters),
        api.monthlySales(filters),
        api.salesByCategory(filters),
        api.salesByRegion(filters),
        api.topProducts(filters, "revenue", 10),
        api.topCustomers(filters, 10),
      ]);
      setSummary(summaryRes);
      setMonthly(monthlyRes);
      setByCategory(categoryRes);
      setByRegion(regionRes);
      setTopProducts(productsRes);
      setTopCustomers(customersRes);
    } catch (err) {
      setError(err.message || "Something went wrong while loading the dashboard.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard(appliedFilters);
  }, [appliedFilters, loadDashboard]);

  function handleApply() {
    setAppliedFilters(pendingFilters);
  }

  function handleReset() {
    setPendingFilters(EMPTY_FILTERS);
    setAppliedFilters(EMPTY_FILTERS);
  }

  const activeFilterCount = Object.values(appliedFilters).filter(Boolean).length;
  const copy = TAB_COPY[activeTab] || TAB_COPY.overview;

  const showTrends = activeTab === "overview" || activeTab === "trends";
  const showRegion = activeTab === "overview" || activeTab === "trends" || activeTab === "customers";
  const showCategory = activeTab === "overview" || activeTab === "trends" || activeTab === "products";
  const showProductsTable = activeTab === "overview" || activeTab === "products";
  const showCustomersTable = activeTab === "overview" || activeTab === "customers";

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{copy.title}</h1>
          <div className="page-header__subtitle">{copy.subtitle}</div>
        </div>
        <div className="page-header__meta">
          Sample data · fictional business
          <br />
          Last generated dataset load
        </div>
      </div>

      <Filters
        options={filterOptions}
        values={pendingFilters}
        onChange={setPendingFilters}
        onApply={handleApply}
        onReset={handleReset}
      />

      {activeFilterCount > 0 && (
        <div className="filter-bar__active">
          {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied
        </div>
      )}

      {error && <div className="state-box state-box--error">Couldn't load the dashboard: {error}</div>}

      <div className="kpi-strip">
        <KPICard label="Total Revenue" value={summary ? formatCurrency(summary.totalRevenue) : ""} loading={loading} />
        <KPICard
          label="Total Profit"
          value={summary ? formatCurrency(summary.totalProfit) : ""}
          loading={loading}
          accent
        />
        <KPICard label="Total Orders" value={summary ? formatNumber(summary.totalOrders) : ""} loading={loading} />
        <KPICard
          label="Total Customers"
          value={summary ? formatNumber(summary.totalCustomers) : ""}
          loading={loading}
        />
        <KPICard
          label="Profit Margin"
          value={summary ? formatPercent(summary.profitMargin) : ""}
          loading={loading}
        />
      </div>

      {(showTrends || showRegion) && (
        <div className={showTrends && showRegion ? "chart-grid" : ""}>
          {showTrends && (
            <div className="panel">
              <div className="panel__header">
                <span className="panel__title">Monthly sales trend</span>
                <span className="panel__subtitle">Revenue vs. profit, last 24 months</span>
              </div>
              {loading ? <ChartSkeleton /> : monthly.length ? <SalesChart data={monthly} /> : <NoData />}
            </div>
          )}

          {showRegion && (
            <div className="panel">
              <div className="panel__header">
                <span className="panel__title">Revenue by region</span>
                <span className="panel__subtitle">Revenue vs. profit</span>
              </div>
              {loading ? <ChartSkeleton /> : byRegion.length ? <RegionChart data={byRegion} /> : <NoData />}
            </div>
          )}
        </div>
      )}

      {showCategory && (
        <div className="panel">
          <div className="panel__header">
            <span className="panel__title">Sales by category</span>
            <span className="panel__subtitle">Revenue vs. profit</span>
          </div>
          {loading ? <ChartSkeleton /> : byCategory.length ? <CategoryChart data={byCategory} /> : <NoData />}
        </div>
      )}

      {(showProductsTable || showCustomersTable) && (
        <div className={showProductsTable && showCustomersTable ? "tables-grid" : ""}>
          {showProductsTable && (
            <div className="panel">
              <div className="panel__header">
                <span className="panel__title">Top products</span>
                <span className="panel__subtitle">Ranked by revenue</span>
              </div>
              {loading ? (
                <TableSkeleton />
              ) : (
                <DataTable
                  rows={topProducts}
                  columns={[
                    { key: "product", label: "Product" },
                    { key: "category", label: "Category" },
                    {
                      key: "revenue",
                      label: "Revenue",
                      align: "num",
                      render: (r) => formatCurrencyPrecise(r.revenue),
                    },
                    { key: "profit", label: "Profit", align: "num", render: (r) => formatCurrencyPrecise(r.profit) },
                    { key: "unitsSold", label: "Units sold", align: "num", render: (r) => formatNumber(r.unitsSold) },
                  ]}
                />
              )}
            </div>
          )}

          {showCustomersTable && (
            <div className="panel">
              <div className="panel__header">
                <span className="panel__title">Top customers</span>
                <span className="panel__subtitle">Ranked by revenue</span>
              </div>
              {loading ? (
                <TableSkeleton />
              ) : (
                <DataTable
                  rows={topCustomers}
                  columns={[
                    { key: "customer", label: "Customer" },
                    { key: "region", label: "Region" },
                    { key: "orders", label: "Orders", align: "num", render: (r) => formatNumber(r.orders) },
                    {
                      key: "revenue",
                      label: "Revenue",
                      align: "num",
                      render: (r) => formatCurrencyPrecise(r.revenue),
                    },
                    { key: "profit", label: "Profit", align: "num", render: (r) => formatCurrencyPrecise(r.profit) },
                  ]}
                />
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function ChartSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "40px 0" }}>
      <div className="skeleton-line" style={{ width: "90%" }} />
      <div className="skeleton-line" style={{ width: "70%" }} />
      <div className="skeleton-line" style={{ width: "80%" }} />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "10px 0 24px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <div className="skeleton-line" key={n} style={{ width: `${95 - n * 6}%` }} />
      ))}
    </div>
  );
}

function NoData() {
  return <div className="state-box">No data matches the current filters.</div>;
}
