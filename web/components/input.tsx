import clsx from "clsx";
import type { InputHTMLAttributes, ReactElement } from "react";


interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly prefix?: string;
  readonly suffix?: string;
  readonly className?: string;
  readonly outerClassName?: string;
}

export default function Input(props: InputProps): ReactElement {
  return (
    <div className={clsx(
      "flex gap-1 p-1 rounded-md",
      "border border-slate-200/20 focus-within:border-sky-500/50",
      props.outerClassName,
    )}>
      {props.prefix != null ? <span className="mr-2">{props.prefix}</span> : null}
      <input className={clsx("w-full bg-transparent focus:outline-none focus:ring-none", props.className)} {...props} />
      {props.suffix != null ? <span className="ml-2">{props.suffix}</span> : null}
    </div>
  );
}
