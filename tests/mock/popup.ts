import type { PropsWithChildren, ReactElement } from "react";
import { useMemo, createElement } from "react";
import { PopupContext } from "../../web/hooks/popup";


export function MockPopupProvider(props: PropsWithChildren): ReactElement {
  const context = useMemo(() => {
    return {
      openPopup: () => { /* Empty */ },
      closePopup: () => { /* Empty */ },
      setCloseOnBackground: () => { /* Empty */ },
      popup: null,
    };
  }, []);

  return createElement(PopupContext.Provider, { ...props, value: context });
}
