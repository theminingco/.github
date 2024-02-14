import type { ReactElement } from "react";
import React, { useCallback, useMemo } from "react";
import { useWindowSize } from "../hooks/size";
import { useFirebase } from "../hooks/firebase";
import { css } from "@emotion/react";
import { LinkButton } from "../components/button";

const Footer = (): ReactElement => {
  const { width } = useWindowSize();
  const { logEvent } = useFirebase();

  const openLink = useCallback((file: string) => {
    const filename = file.toUpperCase();
    const url = `https://github.com/theminingco/.github/blob/main/${filename}.md`;
    logEvent(`footer_${file}`);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [logEvent]);

  const contactClicked = useCallback(() => openLink("contact"), [openLink]);
  const termsClicked = useCallback(() => openLink("terms"), [openLink]);
  const privacyClicked = useCallback(() => openLink("privacy"), [openLink]);

  const isPhone = useMemo(() => {
    return width < 768;
  }, [width]);

  const blockStyle = useMemo(() => {
    return css`
            font-size: 12px;
            bottom: 0;
            display: flex;
            align-items: center;
            color: #e5e5e5;
        `;
  }, []);

  const leftStyle = useMemo(() => {
    return css`
            padding: 6px;
        `;
  }, []);

  const spacerStyle = useMemo(() => {
    return css`
            flex: 1;
        `;
  }, []);

  return (
    <div css={blockStyle}>
      <span css={leftStyle}>{isPhone ? "© 2023" : "Copyright © 2023 ⛏ The Mining Company" }</span>
      <span css={spacerStyle} />
      <LinkButton onClick={contactClicked}>{isPhone ? "Contact" : "Contact"}</LinkButton>
      <LinkButton onClick={termsClicked}>{isPhone ? "ToS" : "Terms of Service"}</LinkButton>
      <LinkButton onClick={privacyClicked}>{isPhone ? "PP" : "Privacy Policy"}</LinkButton>
    </div>
  );
};

export default Footer;
