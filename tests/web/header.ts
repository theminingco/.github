import { describe, it, beforeEach } from "mocha";
import { generateKeyPairSigner } from "@solana/web3.js";
import { startTestRender, context } from "./setup";
import Header from "../../web/components/header";
import { createElement } from "react";
import { setPublicKey } from "../mock/wallet";

describe("header", () => {

  beforeEach(() => {
    startTestRender(createElement(Header));
  });

  it("Header should contain connect when not connected", async () => {
    setPublicKey(null);
    await context.findByRole("button", { name: "Connect" });
  });

  it("Header should contain pubkey when connected", async () => {
    const publicKey = await generateKeyPairSigner();
    setPublicKey(publicKey.address);
    const prefix = publicKey.address.toString().slice(0, 4);
    const suffix = publicKey.address.toString().slice(-4);
    const text = `${prefix}...${suffix}`;
    await context.findByRole("button", { name: text });
  });
});

