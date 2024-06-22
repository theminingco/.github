import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Spinner from "../components/spinner";
import type { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import Button from "../components/button";
import FontIcon from "../components/font";
import { faCircleCheck, faCircleInfo, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

type ToastType = "info" | "loading" | "success" | "error";

type ToastAction = {
  icon: IconDefinition;
  onClick: () => void;
} | {
  icon: IconDefinition;
  href: string;
};

export interface ToastProps {
  title: string;
  message?: string;
  actions?: ToastAction[];
  type?: ToastType;
}

export interface UseToast {
  setToast: (props: ToastProps) => void;
  clearToast: () => void;
  readonly toast: ToastProps | null;
}

export const ToastContext = createContext<UseToast>({
  setToast: () => { throw new Error("not implemented"); },
  clearToast: () => { throw new Error("not implemented"); },
  toast: null,
});

export function useToast(): UseToast {
  return useContext(ToastContext);
}

export default function ToastProvider(props: PropsWithChildren): ReactElement {
  const [toast, setToastElement] = useState<ToastProps | null>(null);

  const setToast = useCallback((x: ToastProps) => {
    setToastElement(x);
  }, [setToastElement]);

  const clearToast = useCallback(() => {
    setToastElement(null);
  }, [setToastElement]);

  const toastIcon = useMemo(() => {
    if (toast == null) { return null; }
    switch (toast.type) {
      case "loading": return <Spinner type="hourglass" size="mini" />;
      case "success": return <FontIcon className="text-green-300 w-4 h-4" icon={faCircleCheck} />;
      case "error": return <FontIcon className="text-red-300 w-4 h-4" icon={faCircleXmark} />;
      default: return <FontIcon className="text-sky-300 w-4 h-4" icon={faCircleInfo} />;
    }
  }, [toast]);

  const toastActions = useMemo(() => {
    if (toast?.actions == null) { return null; }
    return toast.actions.map((action, index) => {
      return (
        <Button
          key={index}
          className="flex items-center p-2"
          {...action}
        >
          <FontIcon className="w-4 h-4" icon={action.icon} />
        </Button>
      );
    });
  }, [toast]);

  const toastNode = useMemo(() => {
    if (toast == null) { return null; }
    return (
      <div className={clsx(
        "fixed p-4 bottom-16 left-12 z-50 rounded w-96",
        "flex items-center gap-2",
        "drop-shadow-2xl bg-slate-900",
      )}>
        {toastIcon}
        <div className="flex flex-col grow">
          <div className="font-bold">{toast.title}</div>
          {toast.message != null ? <div className="text-sm">{toast.message}</div> : null}
        </div>
        {toastActions}
      </div>
    );
  }, [toast, toastIcon, toastActions]);

  // TODO: in/out animation

  const context = useMemo(() => {
    return { setToast, clearToast, toast };
  }, [setToast, clearToast, toast]);

  return (
    <ToastContext.Provider value={context}>
      {props.children}
      {toastNode}
    </ToastContext.Provider>
  );
}
