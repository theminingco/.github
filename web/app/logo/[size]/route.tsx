import type { NextRequest, NextResponse } from "next/server";
import React from "react";
import { dynamicImage } from "../../image";

interface IconProps {
  readonly params: { size: string };
}

const prerenderedSizes = [
  "16", "24", "32", "48", "64",
  "72", "96", "128", "144", "152",
  "192", "256", "384", "512",
];

export function generateStaticParams(): IconProps["params"][] {
  return prerenderedSizes.map(size => ({ size }));
}

export async function GET(_request: NextRequest, props: IconProps): Promise<NextResponse> {
  const size = Number(props.params.size);
  const style = { fontSize: `${size / 2}px` };

  const element = (
    // FIXME: remove bg-sky-900 when gradient works
    <div tw="w-full h-full flex justify-center items-center bg-sky-900 bg-lg bg-gradient-to-tl from-rose-950 via-sky-950 to-rose-950 text-slate-200 rounded-md" style={style}>
      <span>⛏</span>
    </div>
  );

  return dynamicImage(element, size, size);
}
