import React from "react";
import clsx from "clsx";
import type { NextResponse } from "next/server";
import { dynamicImage } from "../image";

export async function GET(): Promise<NextResponse> {
  const element = (
    <div tw={clsx(
      "w-full h-full text-slate-200 flex items-center justify-center",
      "bg-sky-900", // FIXME: remove when \/ works
      "bg-lg bg-gradient-to-tl from-rose-900 via-sky-900 to-rose-900",
    )}>
      <div tw="flex w-4/5 mr-20">
        <span tw="text-6xl font-black mr-20">
          ⛏
        </span>
        <div tw="flex flex-col">
          <span tw="text-6xl font-black">
            The Mining Company
          </span>
          <span tw="text-xl font-medium px-3">
            Fodinae cum codice serpentis ad praenuntianda nummorum pretia et negotiationem automatisticam. Noli lutum fodere, aurum invenire.
          </span>
        </div>
      </div>
    </div>
  );

  return dynamicImage(element, 800, 418);
}
