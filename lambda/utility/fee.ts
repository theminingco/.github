import type { Creator } from "@metaplex-foundation/js";
import type { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { SystemProgram } from "@solana/web3.js";

interface NftWithFee {
  readonly sellerFeeBasisPoints: number;
  readonly creators: Array<Creator>;
}

export const createFeeInstructions = (payer: PublicKey, price: number, nftOrSft: NftWithFee): Array<TransactionInstruction> => {
  const instructions: Array<TransactionInstruction> = [];
  const feeBps = nftOrSft.sellerFeeBasisPoints;

  for (const creator of nftOrSft.creators) {
    if (creator.share === 0) { continue; }
    const feeReceiver = creator.address;
    const feeAmount = feeBps * creator.share * price / 1000000;

    const instruction = SystemProgram.transfer({
      fromPubkey: payer,
      toPubkey: feeReceiver,
      lamports: feeAmount
    });
    instructions.push(instruction);
  }
  return instructions;
};
