import type { MessagePartialSigner } from "@solana/web3.js";
import { getBase58Encoder } from "@solana/web3.js";
import { randomId } from "./identifier";
import type { Signer } from "arbundles";
import { createData, SIG_CONFIG } from "arbundles";

function getArweaveSigner(signer: MessagePartialSigner): Signer {
  const publicKey = Buffer.from(
    getBase58Encoder().encode(signer.address),
  );

  return {
    publicKey,
    signatureType: 2,
    signatureLength: SIG_CONFIG[2].sigLength,
    ownerLength: SIG_CONFIG[2].pubLength,
    sign: async (message: Uint8Array) => {
      const signatures = await signer.signMessages([{
        content: message,
        signatures: {},
      }]);
      return Buffer.from(signatures[0][signer.address]);
    },
  };
}

export async function uploadData(
  data: string | Buffer,
  signer: Signer | MessagePartialSigner,
): Promise<string> {
  const arSigner = "publicKey" in signer ? signer : getArweaveSigner(signer);
  const buffer = Buffer.from(data);

  const dataItem = createData(buffer, arSigner, {
    anchor: `${randomId()}${randomId}`.slice(0, 32),
  });

  await dataItem.sign(arSigner);

  const response = await fetch("https://node2.irys.xyz/tx/solana", {
    method: "POST",
    body: dataItem.getRaw(),
    headers: { "Content-Type": "application/octet-stream" },
  });

  const json = await response.json() as { id: string };

  return Promise.resolve(`https://arweave.net/${json.id}`);
}
