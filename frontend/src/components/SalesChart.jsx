// frontend/src/components/SalesChart.jsx
// Monthly revenue vs profit trend line.
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatMonth, formatCurrency, formatCurrencyPrecise } from "../utils/format.js";

export default function SalesChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 6, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="#dfdacd" vertical={false} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tick={{ fontSize: 11.5, fill: "#5b6b85" }}
          axisLine={{ stroke: "#c7c0ac" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatCurrency}
          tick={{ fontSize: 11.5, fill: "#5b6b85" }}
          axisLine={false}
          tickLine={false}
          width={70}
        />
        <Tooltip
          labelFormatter={formatMonth}
          formatter={(value, name) => [formatCurrencyPrecise(value), name === "revenue" ? "Revenue" : "Profit"]}
          contentStyle={{ fontSize: 13, borderRadius: 4, borderColor: "#c7c0ac" }}
        />
        <Legend
          formatter={(value) => (value === "revenue" ? "Revenue" : "Profit")}
          wrapperStyle={{ fontSize: 12.5 }}
        />
        <Line type="monotone" dataKey="revenue" stroke="#12203d" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="profit" stroke="#a97632" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
