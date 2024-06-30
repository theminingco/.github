import type { ReactElement } from "react";
import { useMemo, useState } from "react";
import clsx from "clsx";
import Button from "./button";
import Legend from "./legend";
import { getColor } from "../utility/color";
import { interval } from "@theminingco/core/lib/array";
import { usePopup } from "../hooks/popup";

interface DonutProps {
  readonly data: Map<string, bigint>;
  readonly maxItems?: number;
  readonly thickness?: number;
  readonly hideLegend?: boolean;
  readonly className?: string;
  readonly disabled?: boolean;
  readonly onSave?: (data: Map<string, bigint>) => void;
}

export default function Donut(props: DonutProps): ReactElement {
  const initialDonutData = useMemo(() => Array.from(props.data.entries()), [props.data]);
  const [donutData, setDonutData] = useState(initialDonutData);
  const { closePopup } = usePopup();
  const thickness = props.thickness ?? 12;
  const radius = 50 - thickness;
  const circumference = 2 * Math.PI * radius;
  const editable = props.onSave != null;
  const hideLegend = props.hideLegend ?? false;

  const arcs = useMemo(() => {
    let cumlative = 0;
    const values: string[] = [];
    for (const [_, value] of donutData) {
      const segment = Number(value) / 10000 * circumference;
      const remaining = Math.max(circumference - cumlative - segment, 0);
      values.push(`0 ${cumlative} ${segment} ${remaining}`);
      cumlative += segment;
    }
    return values;
  }, [donutData]);

  const circles = useMemo(() => {
    return interval(donutData.length).map(index => {
      return (
        <circle
          key={index}
          cx="50" cy="50"
          r={radius}
          stroke={getColor(index)}
          strokeWidth={thickness}
          fill="none"
          strokeDasharray={arcs[index]}
        />
      );
    });
  }, [donutData, arcs]);

  const hasChanges = useMemo(() => {
    if (donutData.length !== initialDonutData.length) {
      return true;
    }
    return !donutData.every(([key, value], index) => key === initialDonutData[index][0] && value === initialDonutData[index][1]);
  }, [donutData, initialDonutData]);

  const actionButtons = useMemo(() => {
    const saveData = donutData.filter(([_, value]) => value > 0);
    return (
      <div className="flex gap-2">
        {editable ? (
          <Button
            onClick={() => props.onSave?.(new Map(saveData))}
            disabled={props.disabled || !hasChanges}
            outerClassName="mt-4 w-32"
            className="py-2 bg-sky-500/50 rounded"
          >
            Save
          </Button>
        ) : null}
        <Button
          onClick={() => closePopup()}
          outerClassName="mt-4 w-32"
          className="py-2 bg-slate-100/10 rounded"
        >
          {hasChanges ? "Cancel" : "Close"}
        </Button>
      </div>
    );
  }, [editable, hasChanges, donutData, props.disabled, props.onSave, closePopup]);

  return (
    <div className={clsx("flex flex-col items-center", props.className)}>
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle
          cx="50" cy="50"
          r={radius}
          stroke="#cccccc"
          strokeWidth={thickness}
          fill="none"
        />
        {circles}
      </svg>
      <Legend
        data={donutData}
        setData={editable ? setDonutData : undefined}
        className={hideLegend ? "hidden" : ""}
      />
      {actionButtons}
    </div>
  );
}
