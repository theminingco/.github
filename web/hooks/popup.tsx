import type { PropsWithChildren, ReactElement } from "react";
import React, { Suspense, createContext, useCallback, useContext, useMemo, useState } from "react";
import { css } from "@emotion/react";

interface UsePopup {
  openPopup: (node: ReactElement, closeOnBackground?: boolean) => void;
  closePopup: () => void;
  readonly popup: ReactElement | null;
}

const Context = createContext<UsePopup>({
  openPopup: () => { /* Empty */ },
  closePopup: () => { /* Empty */ },
  popup: null
});

export const usePopup = (): UsePopup => {
  return useContext(Context);
};

const PopupProvider = (props: PropsWithChildren): ReactElement => {
  const [popup, setPopup] = useState<ReactElement | null>(null);
  const [backgroundClick, setBackgroundClick] = useState(false);

  const overlayStyle = useMemo(() => {
    return css`
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            height: 100vh;
            width: 100vw;
            background-color: #00000020;
        `;
  }, []);

  const backgroundStyle = useMemo(() => {
    return css`
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #f1f1ef;
            border-radius: 24px;
            filter: drop-shadow(4px 4px 20px #00000020);
            max-height: 70vh;
            width: 70vw;
            max-width: 512px;
            background-color: #2f323a;
            padding: 16px 32px;
            overflow-y: auto;
            overflow-x: hidden;
            &::-webkit-scrollbar-track {
                margin: 16px 0;
            }
        `;
  }, []);

  const openPopup = useCallback((node: ReactElement, closeOnBackground = true) => {
    setPopup(node);
    setBackgroundClick(closeOnBackground);
  }, [setPopup]);

  const closePopup = useCallback(() => {
    setPopup(null);
  }, [setPopup]);

  const popupNode = useMemo(() => {
    if (popup == null) { return null; }
    const onClick = backgroundClick ? closePopup : undefined;
    return (
      <Suspense>
        <div css={overlayStyle} onClick={onClick} />
        <div css={backgroundStyle}>{popup}</div>
      </Suspense>
    );
  }, [popup, backgroundClick]);

  const context = useMemo(() => {
    return { openPopup, closePopup, popup };
  }, [openPopup, closePopup, popup]);

  return (
    <Context.Provider value={context}>
      {props.children}
      {popupNode}
    </Context.Provider>
  );
};

export default PopupProvider;

