// frontend/src/components/CategoryChart.jsx
// Revenue vs profit by category, horizontal bars (category names can be long).
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency, formatCurrencyPrecise } from "../utils/format.js";

export default function CategoryChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 6, right: 16, left: 8, bottom: 0 }}
        barCategoryGap={14}
      >
        <CartesianGrid stroke="#dfdacd" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={formatCurrency}
          tick={{ fontSize: 11.5, fill: "#5b6b85" }}
          axisLine={{ stroke: "#c7c0ac" }}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="category"
          tick={{ fontSize: 12, fill: "#12203d" }}
          axisLine={false}
          tickLine={false}
          width={130}
        />
        <Tooltip
          formatter={(value, name) => [formatCurrencyPrecise(value), name === "revenue" ? "Revenue" : "Profit"]}
          contentStyle={{ fontSize: 13, borderRadius: 4, borderColor: "#c7c0ac" }}
        />
        <Legend
          formatter={(value) => (value === "revenue" ? "Revenue" : "Profit")}
          wrapperStyle={{ fontSize: 12.5 }}
        />
        <Bar dataKey="revenue" fill="#12203d" radius={[0, 2, 2, 0]} />
        <Bar dataKey="profit" fill="#a97632" radius={[0, 2, 2, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
