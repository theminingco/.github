import clsx from "clsx";
import type { ReactElement } from "react";

interface SkeletonProps {
  className?: string;
}

export default function Skeleton(props: SkeletonProps): ReactElement {
  return (
    <div className={clsx(
      "inline-block rounded",
      "animate-pulse bg-slate-100/10",
      "backdrop-blur-xl shadow-2xl",
      props.className,
    )} />
  );
}
