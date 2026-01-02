import React from 'react';

interface PolarChartProps {
  data: { subject: string; A: number; fullMark: number }[];
  color: string;
}

// VIBGYOR colors (Violet, Indigo, Blue, Green, Yellow, Orange, Red)
const VIBGYOR_COLORS = [
  '#8B5CF6', // Violet
  '#6366F1', // Indigo
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#EAB308', // Yellow
  '#F97316', // Orange
  '#EF4444', // Red
];

export const SimpleRadarChart: React.FC<PolarChartProps> = ({ data, color }) => {
  const size = 300;
  const center = size / 2;
  const maxRadius = (size / 2) - 50;
  const total = data.length;
  const angleSlice = (Math.PI * 2) / total;

  const polarToCartesian = (cx: number, cy: number, r: number, angle: number) => {
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle)
    };
  };

  const describeArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? "0" : "1";

    return [
      "M", cx, cy,
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  const levels = 5;
  const gridCircles = Array.from({ length: levels }).map((_, i) => {
    const levelRadius = (maxRadius / levels) * (i + 1);
    return (
      <circle
        key={i}
        cx={center}
        cy={center}
        r={levelRadius}
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.15}
        strokeDasharray="4 4"
      />
    );
  });

  const axes = data.map((_, index) => {
    const angle = index * angleSlice - Math.PI / 2;
    const endPoint = polarToCartesian(center, center, maxRadius, angle);
    return (
      <line
        key={index}
        x1={center}
        y1={center}
        x2={endPoint.x}
        y2={endPoint.y}
        stroke="currentColor"
        strokeOpacity={0.1}
      />
    );
  });

  const wedges = data.map((item, index) => {
    const startAngle = index * angleSlice - Math.PI / 2;
    const endAngle = startAngle + angleSlice;
    const valueRadius = (item.A / item.fullMark) * maxRadius;
    const path = describeArc(center, center, valueRadius, startAngle, endAngle);
    const borderColor = VIBGYOR_COLORS[index % VIBGYOR_COLORS.length];

    return (
      <path
        key={index}
        d={path}
        fill={color}
        fillOpacity={0.4 + (item.A / item.fullMark) * 0.3}
        stroke={borderColor}
        strokeWidth={4}
        strokeOpacity={1}
      />
    );
  });

  const labels = data.map((item, index) => {
    const angle = index * angleSlice - Math.PI / 2 + angleSlice / 2;
    const labelRadius = maxRadius + 20;
    const { x, y } = polarToCartesian(center, center, labelRadius, angle);
    
    let anchor: "start" | "middle" | "end" = "middle";
    if (x < center - 10) anchor = "end";
    else if (x > center + 10) anchor = "start";

    return (
      <text
        key={index}
        x={x}
        y={y}
        textAnchor={anchor}
        dominantBaseline="middle"
        fontSize="11"
        className="text-[11px] font-medium fill-muted-foreground"
      >
        {item.subject}
      </text>
    );
  });

  return (
    <div className="w-full h-full flex justify-center items-center py-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        <g>
          {gridCircles}
          {axes}
          {wedges}
          {labels}
        </g>
      </svg>
    </div>
  );
};
