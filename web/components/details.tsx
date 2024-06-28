import Image from "next/image";
import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import Donut from "./donut";
import { useWallet } from "../hooks/wallet";
import { allocationParser } from "@theminingco/core/lib/allocation";
import Button from "./button";
import { useTransaction } from "../hooks/transaction";
import { address } from "@solana/web3.js";
import { shortAddress } from "@theminingco/core/lib/address";
import type { Item } from "../hooks/items";
import { tensorLink, magicedenLink } from "../utility/link";

interface DetailsProps {
  readonly item: Item;
}

export default function Details(props: DetailsProps): ReactElement {
  const donutData = useMemo(() => allocationParser().parse(props.item), [props.item]);
  const { publicKey } = useWallet();
  const { commit, loading } = useTransaction();
  const [copied, setCopied] = useState(false);

  const isEditable = useMemo(() => {
    return "owner" in props.item && props.item.owner === publicKey;
  }, [props.item, publicKey]);

  const saveAllocation = useCallback((data: Map<string, bigint>) => {
    const tokenAddress = address(props.item.address);
    const allocation = allocationParser({ container: "record", value: "percent" }).parse({ allocation: data })
    commit(tokenAddress, allocation);
  }, [props.item, commit]);

  const title = useMemo(() => {
    return "pool" in props.item ? `${props.item.pool.name} (${props.item.name})` : props.item.name;
  }, [props.item]);

  const copyText = useMemo(() => {
    return copied ? "copied" : shortAddress(props.item.address);
  }, [copied, props.item]);

  const copyToClipboard = useCallback(() => {
    void navigator.clipboard.writeText(props.item.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  }, [props.item.address, setCopied]);

  return (
    <div className="flex flex-col w-full h-full">
      <div className="flex gap-2 h-8 w-full items-center">
        <Image className="rounded" src={props.item.image} alt={props.item.name} width={32} height={32} />
        <span>{title}</span>
        <Button className="text-slate-500" onClick={copyToClipboard}>{copyText}</Button>
        <span className="grow" />
        <Button href={tensorLink(props.item)}>
          <Image src="/tensor.png" alt="Tensor logo" height={32} width={32} />
        </Button>
        <Button href={magicedenLink(props.item)}>
          <Image src="/magiceden.png" alt="MagicEden logo" height={32} width={32} />
        </Button>
      </div>
      <Donut
        data={donutData}
        onSave={isEditable ? saveAllocation : undefined}
        disabled={loading}
      />
    </div>
  );
}
