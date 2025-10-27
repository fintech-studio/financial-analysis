import React from "react";

interface WaveProps {
  color?: string;
  className?: string;
}
const Wave = ({ color = "#f8fafc", className = "" }: WaveProps) => {
  // If user passes Tailwind utility classes like 'bg-gray-900' or
  // 'dark:bg-gray-800', convert bg- to text- so the SVG can use
  // fill="currentColor" and inherit the color via CSS (text color).
  let svgFill = color;
  let colorClass = "";

  if (typeof color === "string") {
    // detect if the string contains any Tailwind-like bg- or text- tokens
    const tokens = color.split(/\s+/).filter(Boolean);
    const hasTailwindToken = tokens.some(
      (t) => t.includes("bg-") || t.includes("text-")
    );

    if (hasTailwindToken) {
      // Map any token that includes 'bg-' to 'text-' so variants like 'dark:bg-...' -> 'dark:text-...'
      const mapped = tokens.map((t) =>
        t.includes("bg-") ? t.replace(/bg-/, "text-") : t
      );
      colorClass = mapped.join(" ");
      svgFill = "currentColor";
    }
  }

  const wrapperClass =
    `absolute bottom-0 left-0 right-0 ${colorClass} ${className}`.trim();

  return (
    <div className={wrapperClass}>
      <svg
        className="w-full h-auto"
        viewBox="0 0 1440 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,101.3C960,117,1056,139,1152,133.3C1248,128,1344,96,1392,80L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          fill={svgFill}
        />
      </svg>
    </div>
  );
};

export default Wave;
