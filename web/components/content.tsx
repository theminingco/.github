import { css } from "@emotion/react";
import type { ReactElement } from "react";
import React, { Suspense, useMemo } from "react";
import { Disclaimer } from "./text";
import { useNavigation } from "../hooks/navigation";

const Content = (): ReactElement => {
  const { content } = useNavigation();

  const blockStyle = useMemo(() => {
    return css`
            width: 100vw;
            height: calc(100vh - 82px);
            display: flex;
            justify-content: center;
            align-items: center;
        `;
  }, []);

  const contentStyle = useMemo(() => {
    return css`
            max-width: 512px;
            width: 100vw;
            max-height: 95%;
            display: flex;
            flex-direction: column;
            overflow-y: auto;
        `;
  }, []);

  const disclaimerText = useMemo(() => {
    return "Financial markets are complex. The trading and holding of ⛏ The Mining Company tokens are at the risk of the token holder. ⛏ The Mining Company does not provide any financial advice and does not make any recommendations regarding the purchase or sale of any financial assets. ⛏ The Mining Company does not guarantee the performance of any financial assets and does not guarantee the value of any financial assets.";
  }, []);

  return (
    <div css={blockStyle}>
      <div css={contentStyle}>
        <Suspense>{content}</Suspense>
        <Disclaimer>{disclaimerText}</Disclaimer>
      </div>
    </div>
  );
};

export default Content;
