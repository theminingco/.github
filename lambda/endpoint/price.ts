import { isAddress } from "@solana/web3.js";
import type { Request, Response } from "express";
import { poolCollection, tokenCollection } from "../utility/firebase";
import { HttpsError } from "firebase-functions/v2/https";

export default async function getPrice(request: Request, response: Response): Promise<void> {
  let address = request.query.address;
  if (address == null) { throw new HttpsError("invalid-argument", "Missing address"); }
  if (typeof address !== "string") { throw new HttpsError("invalid-argument", "Invalid address"); }
  if (!isAddress(address)) { throw new HttpsError("invalid-argument", "Invalid address"); }

  console.info(`Fetching token with address ${address}`);
  const token = await tokenCollection
    .where("address", "==", address)
    .limit(1)
    .get();

  if (token.docs.length === 1) {
    address = token.docs[0].data().collection;
  }

  console.info(`Fetching pool with address ${address}`);
  const pool = await poolCollection
    .where("address", "==", address)
    .limit(1)
    .get();

  if (pool.docs.length !== 1) { throw new HttpsError("not-found", "No pool or token found"); }
  const price = pool.docs[0].data().price;
  const priceTimestamp = pool.docs[0].data().priceTimestamp;

  response.json({ address, price, priceTimestamp });
}
