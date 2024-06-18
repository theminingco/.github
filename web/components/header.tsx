import type { ReactElement } from "react";
import React, { useCallback, useEffect, useMemo } from "react";
import { usePopup } from "../hooks/popup";
import { useWallet } from "../hooks/wallet";
import dynamic from "next/dynamic";
import Button from "../components/button";
import Link from "next/link";
import { shortAddress } from "@theminingco/core/lib/address";
import { Noto_Emoji } from "next/font/google";
import clsx from "clsx";

const Connect = dynamic(async () => import("./connect"));

const fonts = Noto_Emoji({
  weight: "variable",
  subsets: ["emoji"],
});

export default function Header(): ReactElement {
  const { publicKey } = useWallet();
  const { openPopup, closePopup } = usePopup();

  const connectText = useMemo(() => {
    if (publicKey == null) { return "Connect"; }
    return shortAddress(publicKey);
  }, [publicKey]);

  useEffect(() => {
    if (publicKey != null) {
      closePopup();
    }
  }, [publicKey, closePopup]);

  const loginPressed = useCallback(() => {
    openPopup(<Connect />);
  }, [publicKey, openPopup]);

  return (
    <div className="relative w-full flex items-center justify-between">
      <Link className="p-1 mx-3" href="/">
        <span className={clsx("text-3xl", fonts.className)}>⛏</span>
      </Link>
      <Button className="px-4 py-2 m-2 font-bold uppercase" onClick={loginPressed}>
        {connectText}
      </Button>
    </div>
  );
}
