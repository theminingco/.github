import { isAddress } from "@solana/web3.js";
import type { Request, Response } from "express";
import { poolCollection, tokenCollection } from "../utility/firebase";

export default async function getPrice(request: Request, response: Response): Promise<void> {
  let address = request.query.address;
  if (address == null) { response.status(400).json("Missing address"); return; }
  if (typeof address !== "string") { response.status(400).json("Invalid address"); return; }
  if (!isAddress(address)) { response.status(400).json("Invalid address"); return; }

  const token = await tokenCollection
    .where("address", "==", address)
    .limit(1)
    .get();

  if (token.docs.length === 1) {
    address = token.docs[0].data().collection;
  }

  const pool = await poolCollection
    .where("address", "==", address)
    .limit(1)
    .get();

  if (pool.docs.length !== 1) { response.status(404).json("Not found"); return; }
  const price = pool.docs[0].data().price;
  const priceTimestamp = pool.docs[0].data().priceTimestamp;

  response.status(200).json({ address, price, priceTimestamp });
}
