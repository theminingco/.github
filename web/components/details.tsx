import type { Pool, Token } from "@theminingco/core/lib/model";
import Image from "next/image";
import type { ReactElement } from "react";
import { useCallback, useMemo, useState } from "react";
import Donut from "./donut";
import { useWallet } from "../hooks/wallet";
import { parseAllocation } from "@theminingco/core/lib/metadata";
import Button from "./button";
import { useTransaction } from "../hooks/transaction";
import { address } from "@solana/web3.js";
import Spinner from "./spinner";

interface DetailsProps {
  readonly item: Pool | Token;
}

export default function Details(props: DetailsProps): ReactElement {
  const initialDonutData = useMemo(() => parseAllocation(props.item), [props.item]);
  const [donutData, setDonutData] = useState(initialDonutData);
  const { publicKey } = useWallet();
  const { commit, loading, result } = useTransaction();

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
  }, [donutData]);

  const saveButton = useMemo(() => {
    if (!isEditable) {
      return null;
    }
    if (result != null) {
      return <div>{result.toString()}</div>;
    }
    return (
      <Button
        onClick={saveAllocation}
        disabled={donutData === initialDonutData}
      >
        Save
      </Button>
    );
  }, [isEditable, result, donutData, saveAllocation, initialDonutData]);

  // TODO: styling

  return (
    <div>
      <Image src={props.item.image} alt={props.item.name} width={100} height={100} />
      {props.item.name}
      {loading ? <Spinner type="hourglass" /> : <Donut data={donutData} onUpdate={onDonutUpdate} />}
      {saveButton}
    </div>
  );
}
