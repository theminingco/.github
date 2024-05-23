import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import type { ReactNode } from "react";
import type { Font } from "satori";
import satori from "satori";
import sharp from "sharp";
import tw from "../tailwind.config";

const tailwindConfig = tw as object;
type FontSpec = Omit<Font, "data"> & { path: string };

const fontSpec: Array<FontSpec> = [
  { name: "NotoEmoji", style: "normal", weight: 400, path: "./font/NotoEmoji-Regular.ttf" },
  { name: "NotoSans", style: "normal", weight: 400, path: "./font/NotoSans-Regular.ttf" },
  { name: "NotoSans", style: "normal", weight: 500, path: "./font/NotoSans-Medium.ttf" },
];

export async function dynamicImage(element: ReactNode, width: number, height: number): Promise<NextResponse> {
  const fonts = await Promise.all(
    fontSpec.map(async spec => ({ ...spec, data: await readFile(spec.path) }))
  );

  const svg = await satori(element, { width, height, fonts, tailwindConfig });
  const data = await sharp(Buffer.from(svg)).toBuffer();

  return new NextResponse(data, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, immutable, no-transform, max-age=31536000",
    },
  });
}
