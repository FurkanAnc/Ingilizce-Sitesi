import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function LearnedTimelineChart({ data, learnedLabel = "Learned" }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="learnedGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(34, 197, 94)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="rgb(34, 197, 94)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
        <XAxis dataKey="date" stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} allowDecimals={false} />
        <Tooltip formatter={(value, name) => (name === "learned" ? [value, learnedLabel] : [value, name])} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
        <Area type="monotone" dataKey="learned" stroke="rgb(34, 197, 94)" strokeWidth={3} fill="url(#learnedGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
