import React from "react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function LearningProgressChart({ data, accuracyLabel = "Accuracy", wordsLabel = "Words" }) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} />
        <Tooltip formatter={(value, name) => (name === "accuracy" ? [`${value}%`, accuracyLabel] : name === "words" ? [value, wordsLabel] : [value, name])} contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }} />
        <Area type="monotone" dataKey="accuracy" stroke="rgb(59, 130, 246)" strokeWidth={2} fill="url(#accuracyGradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
