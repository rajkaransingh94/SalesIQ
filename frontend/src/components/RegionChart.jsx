// frontend/src/components/RegionChart.jsx
// Revenue vs profit by region, vertical bars.
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency, formatCurrencyPrecise } from "../utils/format.js";

export default function RegionChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }} barCategoryGap={22}>
        <CartesianGrid stroke="#dfdacd" vertical={false} />
        <XAxis
          dataKey="region"
          tick={{ fontSize: 12, fill: "#12203d" }}
          axisLine={{ stroke: "#c7c0ac" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 11.5, fill: "#5b6b85" }}
          axisLine={false}
          tickLine={false}
          width={64}
        />
        <Tooltip
          formatter={(value, name) => [formatCurrencyPrecise(value), name === "revenue" ? "Revenue" : "Profit"]}
          contentStyle={{ fontSize: 13, borderRadius: 4, borderColor: "#c7c0ac" }}
        />
        <Legend
          formatter={(value) => (value === "revenue" ? "Revenue" : "Profit")}
          wrapperStyle={{ fontSize: 12.5 }}
        />
        <Bar dataKey="revenue" fill="#12203d" radius={[2, 2, 0, 0]} />
        <Bar dataKey="profit" fill="#a97632" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
