import Image from "next/image";
import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import Donut from "./donut";
import { useWallet } from "../hooks/wallet";
import { parseAllocation } from "@theminingco/core/lib/metadata";
import Button from "./button";
import { useTransaction } from "../hooks/transaction";
import { address } from "@solana/web3.js";
import { shortAddress } from "@theminingco/core/lib/address";
import type { Item } from "../hooks/items";

interface DetailsProps {
  readonly item: Item;
}

function magicedenLink(item: Item): string {
  return `https://magiceden.io/marketplace/${item.address}`;
}

function tensorLink(item: Item): string {
  const slug = "owner" in item ? "item" : "trade";
  return `https://tensor.trade/${slug}/${item.address}`;
}

export default function Details(props: DetailsProps): ReactElement {
  const initialDonutData = useMemo(() => parseAllocation(props.item), [props.item]);
  const [donutData, setDonutData] = useState(initialDonutData);
  const { publicKey } = useWallet();
  const { commit, loading } = useTransaction();
  const [copied, setCopied] = useState(false);

  const isEditable = useMemo(() => {
    return "owner" in props.item && props.item.owner === publicKey;
  }, [props.item, publicKey]);

  const onDonutUpdate = useMemo(() => {
    return isEditable ? setDonutData : undefined;
  }, [isEditable, setDonutData]);

  const saveAllocation = useCallback(() => {
    const allocation = new Map(
      Array.from(donutData.entries())
        .map(([symbol, value]) => [symbol, value.toString()]),
    );
    const tokenAddress = address(props.item.address);
    commit(tokenAddress, allocation);
  }, [props.item, donutData, commit]);

  const saveButton = useMemo(() => {
    if (!isEditable) {
      return null;
    }
    return (
      <Button
        onClick={saveAllocation}
        disabled={donutData !== initialDonutData || loading}
      >
        Save
      </Button>
    );
  }, [isEditable, donutData, saveAllocation, initialDonutData, loading]);

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
      <Donut data={donutData} onUpdate={onDonutUpdate} />
      {saveButton}
    </div>
  );
}
