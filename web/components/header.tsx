import type { ReactElement } from "react";
import React, { useCallback, useMemo, useEffect, lazy } from "react";
import { usePopup } from "../hooks/popup";
import { useFirebase } from "../hooks/firebase";
import { css } from "@emotion/react";
import { MinorButton } from "../components/button";
import { useWallet } from "@solana/wallet-adapter-react";
import { wait } from "@theminingco/core";
import { useNavigation } from "../hooks/navigation";

const Connect = lazy(async () => import("./connect"));

const Header = (): ReactElement => {
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { publicKey, disconnect } = useWallet();
  const { logEvent } = useFirebase();
  const { isHome, openHome } = useNavigation();
  const { openPopup, closePopup, popup } = usePopup();

  const connectText = useMemo(() => {
    return publicKey == null ? "Connect" : "Disconnect";
  }, [publicKey]);

  const backText = useMemo(() => {
    return isHome ? "" : "arrow_back_ios_new";
  }, [isHome]);

  useEffect(() => {
    // FIXME: an imperfect solution to detect a Connect popup.
    if (popup?.type === "div") { return; }
    closePopup();
  }, [publicKey, closePopup]);

  const loginPressed = useCallback(() => {
    if (publicKey == null) {
      logEvent("connect_open");
      openPopup(<Connect />);
    } else {
      wait(200)
        .then(disconnect)
        .catch(() => { /* Ignore error */ });
      logEvent("disconnect");
    }
  }, [publicKey, disconnect, openPopup, logEvent]);

  const iconStyle = useMemo(() => {
    return css`
            font-family: "Material Icons";
        `;
  }, []);

  const blockStyle = useMemo(() => {
    return css`
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #e5e5e5;
        `;
  }, []);

  return (
    <div css={blockStyle}>
      <MinorButton css={iconStyle} onClick={openHome}>{backText}</MinorButton>
      <MinorButton onClick={loginPressed}>{connectText}</MinorButton>
    </div>
  );
};

export default Header;
