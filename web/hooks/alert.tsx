import type { PropsWithChildren, ReactElement } from "react";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import Loader from "../components/loader";
import type { IconDefinition } from "@fortawesome/free-brands-svg-icons";
import Button from "../components/button";
import FontIcon from "../components/font";
import { faCircleCheck, faCircleInfo, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import clsx from "clsx";

type AlertType = "info" | "loading" | "success" | "error";
type AlertPosition = "topLeft" | "topRight" | "bottomLeft" | "bottomRight";

type AlertAction = {
  icon: IconDefinition;
  onClick: () => void;
} | {
  icon: IconDefinition;
  href: string;
};

export interface AlertProps {
  title: string;
  message?: string;
  actions?: AlertAction[];
  type?: AlertType;
  position?: AlertPosition;
}

export interface UseAlert {
  setAlert: (props: AlertProps) => void;
  clearAlert: () => void;
  readonly alert: AlertProps | null;
}

export const AlertContext = createContext<UseAlert>({
  setAlert: () => { throw new Error("not implemented"); },
  clearAlert: () => { throw new Error("not implemented"); },
  alert: null,
});

export function useAlert(): UseAlert {
  return useContext(AlertContext);
}

function toastPosition(position?: AlertPosition): string {
  switch (position) {
    case "topLeft": return "top-8 left-12";
    case "bottomLeft": return "bottom-8 left-12";
    case "bottomRight": return "bottom-8 right-12";
    default: return "top-8 right-12";
  }
}

export default function AlertProvider(props: PropsWithChildren): ReactElement {
  const [alert, setAlertElement] = useState<AlertProps | null>(null);

  const setAlert = useCallback((x: AlertProps) => {
    setAlertElement(x);
  }, [setAlertElement]);

  const clearAlert = useCallback(() => {
    setAlertElement(null);
  }, [setAlertElement]);

  const alertIcon = useMemo(() => {
    if (alert == null) { return null; }
    switch (alert.type) {
      case "loading": return <Loader type="hourglass" size="mini" />;
      case "success": return <FontIcon className="text-green-300 w-4 h-4" icon={faCircleCheck} />;
      case "error": return <FontIcon className="text-red-300 w-4 h-4" icon={faCircleXmark} />;
      default: return <FontIcon className="text-sky-300 w-4 h-4" icon={faCircleInfo} />;
    }
  }, [alert]);

  const alertActions = useMemo(() => {
    if (alert?.actions == null) { return null; }
    return alert.actions.map((action, index) => {
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
  }, [alert]);

  const alertNode = useMemo(() => {
    if (alert == null) { return null; }
    return (
      <div className={clsx(
        "fixed rounded-xl p-4 z-50 w-96",
        "flex items-center gap-2",
        "bg-slate-100/5 border border-slate-100/5",
        "backdrop-blur-xl shadow-2xl",
        toastPosition(alert.position),
      )}>
        {alertIcon}
        <div className="flex flex-col grow">
          <div className="font-bold">{alert.title}</div>
          {alert.message != null ? <div className="text-sm">{alert.message}</div> : null}
        </div>
        {alertActions}
      </div>
    );
  }, [alert, alertIcon, alertActions]);

  // FIXME: in/out animation

  const context = useMemo(() => {
    return { setAlert, clearAlert, alert };
  }, [setAlert, clearAlert, alert]);

  return (
    <AlertContext.Provider value={context}>
      {props.children}
      {alertNode}
    </AlertContext.Provider>
  );
}
