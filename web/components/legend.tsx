import clsx from "clsx";
import type { Dispatch, ReactElement, SetStateAction } from "react";
import { useCallback, useMemo, useState } from "react";
import Button from "./button";
import Input from "./input";
import { getColor } from "../utility/color";
import FontIcon from "./font";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { interval } from "@theminingco/core/lib/array";

interface LegendProps {
  readonly data: [string, bigint][];
  readonly setData?: Dispatch<SetStateAction<[string, bigint][]>>;
  readonly className?: string;
}

interface LegendItemProps {
  readonly data?: [string, bigint][];
  readonly total?: bigint;
  readonly new?: boolean;
  readonly index: number;
  readonly setData?: Dispatch<SetStateAction<[string, bigint][]>>;
}

function ReadonlyItem(props: LegendItemProps): ReactElement {
  const total = props.total ?? 0n;
  const label = useMemo(() => props.data?.[props.index]?.[0] ?? "None", [props.data, props.index]);
  const backgroundColor = useMemo(() => label === "None" ? "#cccccc" : getColor(props.index), [label, props.index]);
  const value = useMemo(() => props.data?.[props.index]?.[1] ?? 10000n - total, [props.data, props.index]);
  const percentage = useMemo(() => (Number(value) / 100).toFixed(0), [value]);

  return (
    <div className="flex gap-1 items-center">
      <div className="w-4 h-4 bg-current rounded-sm" style={{ backgroundColor }} />
      <span>{label} ({percentage}%)</span>
    </div>
  );
}

function EditableItem(props: LegendItemProps): ReactElement {
  const total = props.total ?? 0n;
  const item = useMemo(() => props.data?.[props.index], [props.data, props.index]);
  const [label, setLabel] = useState(item?.[0] ?? "");
  const [labelValid, setLabelValid] = useState(true);
  const backgroundColor = useMemo(() => getColor(props.index), [props.index]);
  const [value, setValue] = useState(() => item == null ? "" : (Number(item[1]) / 100).toFixed(0));
  const [valueValid, setValueValid] = useState(true);

  const removeItem = useCallback(() => {
    props.setData?.(prev => [...prev.slice(0, props.index), ...prev.slice(props.index + 1)]);
  }, [props.setData, props.index]);

  const onBlur = useCallback(() => {
    const percentage = parseInt(value);
    if (isNaN(percentage)) {
      setValueValid(false);
      return;
    }
    const basisPoints = BigInt(percentage) * 100n;
    const oldPercentage = item?.[1] ?? 0n;
    const newTotal = total - oldPercentage + basisPoints;
    if (basisPoints <= 0 || newTotal > 10000) {
      setValueValid(false);
      return;
    }

    // TODO: check against allowed symbols from alpaca
    const hasDuplicate = props.data?.some(([symbol], index) => symbol === label && index !== props.index) ?? false;
    if (label === "" || hasDuplicate) {
      setLabelValid(false);
      return;
    }

    props.setData?.(prev => [...prev.slice(0, props.index), [label, basisPoints], ...prev.slice(props.index + 1)]);
  }, [label, value]);

  return (
    <div className="flex gap-1 items-center">
      <div className="w-4 h-4 bg-current rounded-sm" style={{ backgroundColor }} />
      <Input
        type="text"
        value={label}
        outerClassName={clsx("w-32", labelValid ? "" : "!border-red-500")}
        placeholder="SPY"
        onChange={event => setLabel(event.target.value)}
        onFocus={() => setLabelValid(true)}
        onBlur={onBlur}
      />
      <Input
        type="text"
        value={value}
        outerClassName={clsx("w-16", valueValid ? "" : "!border-red-500")}
        suffix="%"
        placeholder="0"
        onChange={event => setValue(event.target.value)}
        onFocus={() => setValueValid(true)}
        onBlur={onBlur}
      />
      {props.index === props.data?.length
        ? null
        : (
          <Button outerClassName="h-8 w-8" onClick={removeItem}>
            <FontIcon className="p-2.5" icon={faTrashCan} />
          </Button>
        )}
    </div>
  );
}

export default function Legend(props: LegendProps): ReactElement {
  const editable = useMemo(() => props.setData != null, [props.setData]);
  const Item = editable ? EditableItem : ReadonlyItem;

  const total = useMemo(() => props.data?.reduce((acc, [_, value]) => acc + value, 0n) ?? 0, [props.data]);

  const legendItems = useMemo(() => {
    const extraItems = total < 10000 ? 1 : 0;
    return interval(props.data.length + extraItems).map(index => (
      <Item
        key={`${props.data[index]?.[0]}-${index}`}
        data={props.data}
        index={index}
        setData={props.setData}
        total={total}
      />
    ));
  }, [props.data, props.setData, total]);

  return (
    <div className={clsx(
      "flex px-4 gap-x-4 gap-y-1 justify-center",
      editable ? "flex-col" : "flex-wrap",
      props.className,
    )}>
      {legendItems}
    </div>
  );
}
