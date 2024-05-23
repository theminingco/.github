import { getTransferSolInstruction } from "@solana-program/system";
import { IInstruction, TransactionSigner } from "@solana/web3.js";
import { Creator } from "@theminingco/core";


interface NftWithFee {
  readonly sellerFeeBasisPoints: number;
  readonly creators: Array<Creator>;
}

export function createFeeInstructions(payer: TransactionSigner, price: bigint, nftOrSft: NftWithFee):  Array<IInstruction> {
  const instructions: Array<IInstruction> = [];
  const feeBps = nftOrSft.sellerFeeBasisPoints;

  for (const creator of nftOrSft.creators) {
    if (creator.share === 0) { continue; }
    const feeReceiver = creator.address;
    const feeAmount = BigInt(feeBps * creator.share) * price / 1000000n;

    instructions.push(
      getTransferSolInstruction({
        source: payer,
        destination: feeReceiver,
        amount: feeAmount,
      })
    );
  }
  return instructions;
}
