import React from "react";

export default function RadarChart({
  values,
  size = 300,
}: {
  values: {
    risk: number;
    stability: number;
    confidence: number;
    patience: number;
    sensitivity: number;
  };
  size?: number;
}) {
  const labels = [
    "風險承受度",
    "情緒穩定度",
    "決策信心",
    "長期耐心",
    "市場敏感度",
  ];
  const dims = Object.values(values);

  const margin = Math.max(0, Math.round(size * 0.2));
  const total = size + margin * 2;
  const cx = total / 2;
  const cy = total / 2;
  const r = size / 2 - 20;
  const points = dims.map((v, i) => {
    const angle = (Math.PI * 2 * i) / dims.length - Math.PI / 2;
    const radius = (v / 100) * r;
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
  });
  const outer = labels.map((_, i) => {
    const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  });

  return (
    <div
      style={{
        width: "100%",
        maxWidth: size + margin * 2,
        margin: "0 auto",
        padding: 0,
        boxSizing: "border-box",
        overflow: "visible",
      }}
    >
      <svg
        width="100%"
        height="auto"
        viewBox={`0 0 ${total} ${total}`}
        preserveAspectRatio="xMidYMid meet"
        className="mx-auto block"
      >
        {[0.2, 0.4, 0.6, 0.8, 1].map((s, idx) => {
          const poly = labels
            .map((_, i) => {
              const angle = (Math.PI * 2 * i) / labels.length - Math.PI / 2;
              const radius = s * r;
              return `${cx + radius * Math.cos(angle)},${
                cy + radius * Math.sin(angle)
              }`;
            })
            .join(" ");
          return (
            <polygon
              key={idx}
              points={poly}
              fill="none"
              stroke="#E6E6E6"
              strokeWidth={1}
            />
          );
        })}
        {outer.map((pt, i) => {
          const [x, y] = pt.split(",").map(Number);
          const offset = Math.max(10, Math.round(total * 0.03));
          const dx = x > cx ? offset : x < cx ? -offset : 0;
          const anchor = x > cx ? "start" : x < cx ? "end" : "middle";
          return (
            <text
              key={i}
              x={x + dx}
              y={y}
              fontSize={Math.max(10, Math.round(size * 0.04))}
              fill="#374151"
              textAnchor={anchor}
              dominantBaseline="middle"
            >
              {labels[i]}
            </text>
          );
        })}
        <polygon
          points={points.join(" ")}
          fill="rgba(124,58,237,0.15)"
          stroke="#7C3AED"
          strokeWidth={2}
        />
        {points.map((pt, i) => {
          const [x, y] = pt.split(",").map(Number);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={Math.max(3, size * 0.01)}
              fill="#7C3AED"
            />
          );
        })}
      </svg>
    </div>
  );
}
