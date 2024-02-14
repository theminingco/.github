import type { ReactElement } from "react";
import React, { useMemo } from "react";
import { Disclaimer, Headline, Subline } from "../components/text";
import { css, keyframes } from "@emotion/react";

const spin = keyframes`
    to { transform: rotate(360deg); }
`;

export enum StatusType {
  Loading = "loading",
  Success = "success",
  Failure = "failure"
}

interface StatusProps {
  readonly title?: string;
  readonly description?: string;
  readonly type: StatusType;
  readonly disclaimer?: string;
}

const Status = (props: StatusProps): ReactElement => {

  const title = useMemo(() => {
    if (props.title == null) { return null; }
    return <Headline>{props.title}</Headline>;
  }, [props.title]);

  const description = useMemo(() => {
    if (props.description == null) { return null; }
    return <Subline>{props.description}</Subline>;
  }, [props.description]);

  const statusIcon = useMemo(() => {
    switch (props.type) {
      case StatusType.Loading: return "progress_activity"; // FIXME: This does not work.
      case StatusType.Success: return "check_circle";
      case StatusType.Failure: return "cancel";
      default: return "help";
    }
  }, [props.type]);

  const status = useMemo(() => {
    const animation = props.type === StatusType.Loading
      ? css`animation: ${spin} 1s linear infinite;`
      : "";
    const style = css`
            text-align: center;
            font-weight: bold;
            font-size: 76px;
            font-family: "Material Icons";
            color: #e5e5e5;
            margin-bottom: 16px;
            ${animation}
        `;
    return <div css={style}>{statusIcon}</div>;
  }, [statusIcon]);

  // TODO: Close button??

  const disclaimer = useMemo(() => {
    if (props.disclaimer == null) { return null; }
    return <Disclaimer>{props.disclaimer}</Disclaimer>;
  }, [props.disclaimer]);

  return <>{title}{description}{status}{disclaimer}</>;
};

export default Status;
