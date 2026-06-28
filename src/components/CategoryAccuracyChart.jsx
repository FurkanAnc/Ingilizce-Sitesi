import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function CategoryAccuracyChart({ data, accuracyLabel = "Accuracy" }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ top: 8, right: 20, bottom: 8, left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis type="number" domain={[0, 100]} stroke="#888" fontSize={12} tickFormatter={(value) => `${value}%`} />
        <YAxis dataKey="category" type="category" stroke="#888" fontSize={12} width={110} />
        <Tooltip formatter={(value, name) => (name === "accuracy" ? [`${value}%`, accuracyLabel] : [value, name])} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
        <Bar dataKey="accuracy" fill="rgb(59, 130, 246)" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
