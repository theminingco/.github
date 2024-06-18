import type { ReactElement } from "react";
import { useMemo } from "react";
import clsx from "clsx";
import { interval } from "@theminingco/core/lib/array";

interface DonutProps<T extends number | bigint> {
  data: Map<string, T>;
  maxItems?: number;
  thickness?: number;
  hideLegend?: boolean;
  className?: string;
  onUpdate?: (data: Map<string, T>) => void;
}

// TODO: colors:
const colors = [
  "#16a34a", "#a1ca62", "#fff095", "#f49b59", "#d43d51",
  "#56b04f", "#c2d771", "#fdd47b", "#ed7d51", "#7ebd57",
  "#e1e382", "#f9b867", "#e25e4f",
];

export default function Donut<T extends number | bigint>(props: DonutProps<T>): ReactElement {
  const thickness = props.thickness ?? 12;
  const maxItems = props.maxItems ?? 7;
  const radius = 50 - thickness;
  const circumference = 2 * Math.PI * radius;
  const hideLegend = props.hideLegend ?? false;

  // TODO: editable if props.setData is defined

  const data = useMemo(() => {
    if (props.data.size === 0) {
      return [["Other", 1]] as const;
    }
    const items = Array.from(props.data.entries())
      .sort((a, b) => Number(b[1] - a[1]));
    if (items.length <= maxItems) {
      return items;
    }

    const otherAmount = items
      .slice(maxItems - 1)
      .reduce((acc, [_, value]) => acc + Number(value), 0);

    return [
      ...items.slice(0, maxItems - 1),
      ["Other", otherAmount],
    ] as const;
  }, [props.data, props.maxItems]);

  const total = useMemo(() => {
    return data.reduce((acc, [_, value]) => acc + Number(value), Number.EPSILON);
  }, [data]);

  const arcs = useMemo(() => {
    let remaining = circumference;
    const values: string[] = [];
    for (const [_, value] of data) {
      values.push(`${remaining} ${circumference}`);
      remaining -= Number(value) / total * circumference;
    }
    return values;
  }, [data, total]);

  const circles = useMemo(() => {
    return interval(data.length).map(index => {
      return (
        <circle
          key={index}
          cx="50" cy="50"
          r={radius}
          stroke={colors[index % colors.length]}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={arcs[index]}
        />
      );
    });
  }, [data, arcs, colors]);

  const legendItems = useMemo(() => {
    return data.map(([label, value], index) => {
      const percentage = Number(value) / total * 100;
      return (
        <div key={index} className="flex gap-1 items-center">
          <div className="w-4 h-4 bg-current rounded-sm" style={{ backgroundColor: colors[index % colors.length] }} />
          <span>{label} ({percentage.toFixed(0)}%)</span>
        </div>
      );
    });
  }, [data, colors]);

  const legend = useMemo(() => {
    if (hideLegend) {
      return null;
    }
    return (
      <div className="flex flex-wrap px-4 gap-x-4 justify-center">
        {legendItems}
      </div>
    );
  }, [hideLegend, legendItems]);

  return (
    <div className={clsx("flex flex-col items-center", props.className)}>
      <svg viewBox="0 0 100 100">
        {circles}
      </svg>
      {legend}
    </div>
  );
}
