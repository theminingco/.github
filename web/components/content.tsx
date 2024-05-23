import type { ReactElement } from "react";
import React, { useEffect, useState } from "react";
import { useWallet } from "../hooks/wallet";
import { address } from "@solana/web3.js";
import dynamic from "next/dynamic";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const fallback = <div className="flex-1" />;
const Details = dynamic(async () => import("./details"), { loading: () => fallback });
const List = dynamic(async () => import("./list"), { loading: () => fallback });

export default function Content(): ReactElement {
  const { publicKey } = useWallet();
  const query = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const [content, setContent] = useState<ReactElement>();

  useEffect(() => {
    try {
      if (query.size !== 1) {
        throw new Error();
      }
      const key = query.keys().next().value as unknown;
      if (typeof key !== "string") {
        throw new Error();
      }
      const collectionMint = address(key);
      setContent(<Details collection={collectionMint} />);
    } catch (error) {
      router.replace(path);
      setContent(<List />);
    }
  }, [query, publicKey, path, router]);

  return (
    <div className="flex flex-1 items-center justify-center w-screen overflow-y-auto">
      <div className="relative max-w-lg w-screen h-full flex flex-col items-center justify-center gap-4">
        {content}
      </div>
    </div>
  );
}
