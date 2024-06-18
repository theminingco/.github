import "../utility/tailwind.css";
import clsx from "clsx";
import type { PropsWithChildren, ReactElement } from "react";
import React, { Suspense } from "react";
import { Noto_Sans } from "next/font/google";

const fonts = Noto_Sans({
  weight: "variable",
  subsets: ["latin"],
});

export default function Root(props: PropsWithChildren): ReactElement {
  return (
    <html lang="en">
      <head>
        <title>The Mining Company</title>
        <meta name="viewport" content="viewport-fit=cover, width=device-width, initial-scale=1.0" />
        <meta name="description" content="Keep on digging..." />
        <meta name="theme-color" content="#e8eaed" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#3d4043" media="(prefers-color-scheme: dark)" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo/32" />
        <link rel="icon" type="image/png" sizes="64x64" href="/logo/64" />
        <link rel="apple-touch-icon" type="image/png" sizes="32x32" href="/logo/192" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://theminingco.xyz/" />
        <meta property="og:title" content="The Mining Company" />
        <meta property="og:description" content="Keep on digging..." />
        <meta property="og:image" content="/preview" />
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:title" content="The Mining Company" />
        <meta property="twitter:image" content="/preview" />
        <meta property="twitter:description" content="Keep on digging..." />
      </head>
      <body className={clsx(
        "w-doc h-doc flex flex-col justify-center",
        "overflow-hidden select-none",
        "text-slate-200",
        "bg-lg bg-gradient-to-tl animate-gradient",
        "from-rose-950 via-sky-950 to-rose-950",
        fonts.className,
      )}
      >
        <noscript>You need to enable JavaScript to run this app.</noscript>
        <Suspense>{props.children}</Suspense>
      </body>
    </html>
  );
}
