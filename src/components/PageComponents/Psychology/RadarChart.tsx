import React from "react";

export default function RadarChart({
  values,
  size = 300,
}: {
  values: Record<string, number>;
  size?: number;
}) {
  const labelNames: Record<string, string> = {
    risk: "風險承受度",
    stability: "情緒穩定度",
    confidence: "決策信心",
    patience: "長期耐心",
    sensitivity: "市場敏感度",
    impulsivity: "衝動性",
    time_horizon: "時域偏好",
    stress: "心理壓力",
  };
  const keys = Object.keys(values);
  const labels = keys.map((k) => labelNames[k] || k);
  const dims = keys.map((k) => values[k] ?? 0);

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

  const [hovered, setHovered] = React.useState<number | null>(null);

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
        <defs>
          <linearGradient id="radarGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {/* grid rings */}
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
              strokeWidth={idx === 4 ? 1.5 : 1}
              opacity={idx === 4 ? 0.9 : 0.8}
            />
          );
        })}

        {/* axis lines */}
        {outer.map((pt, i) => {
          const [x, y] = pt.split(",").map(Number);
          return (
            <line
              key={`axis-${i}`}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="#F3F4F6"
              strokeWidth={1}
            />
          );
        })}

        {/* labels */}
        {outer.map((pt, i) => {
          const [x, y] = pt.split(",").map(Number);
          const offset = Math.max(8, Math.round(total * 0.025));
          const dx = x > cx ? offset : x < cx ? -offset : 0;
          const anchor = x > cx ? "start" : x < cx ? "end" : "middle";
          return (
            <text
              key={`label-${i}`}
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

        {/* filled polygon */}
        <polygon
          points={points.join(" ")}
          fill="url(#radarGrad)"
          stroke="#7C3AED"
          strokeWidth={2}
          style={{ transition: "all 350ms ease" }}
        />

        {/* points with hover interaction */}
        {points.map((pt, i) => {
          const [x, y] = pt.split(",").map(Number);
          const val = dims[i] ?? 0;
          return (
            <g key={`pt-${i}`}>
              <circle
                cx={x}
                cy={y}
                r={Math.max(3, size * 0.01)}
                fill={hovered === i ? "#06B6D4" : "#7C3AED"}
                stroke="#fff"
                strokeWidth={1}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
              {hovered === i && (
                <g>
                  <rect
                    x={x + 6}
                    y={y - 14}
                    width={40}
                    height={22}
                    rx={6}
                    fill="#111827"
                    opacity={0.9}
                  />
                  <text
                    x={x + 26}
                    y={y}
                    fill="#fff"
                    fontSize={12}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    {String(val)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
