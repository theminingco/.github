import type { IInstruction } from "@solana/web3.js";
import { AccountRole, address } from "@solana/web3.js";
import { splitInstructions } from "@theminingco/core";
import assert from "assert";
import { describe, it } from "mocha";

function instr(n: number): IInstruction {
  return {
    accounts: [
      { address: address("11111111111111111111111111111111"), role: AccountRole.WRITABLE },
      { address: address("11111111111111111111111111111111"), role: AccountRole.WRITABLE },
      { address: address("11111111111111111111111111111111"), role: AccountRole.WRITABLE },
      { address: address("11111111111111111111111111111111"), role: AccountRole.WRITABLE },
      { address: address("11111111111111111111111111111111"), role: AccountRole.WRITABLE },
      { address: address("11111111111111111111111111111111"), role: AccountRole.WRITABLE },
      { address: address("11111111111111111111111111111111"), role: AccountRole.WRITABLE },
      { address: address("11111111111111111111111111111111"), role: AccountRole.WRITABLE },
      { address: address("11111111111111111111111111111111"), role: AccountRole.WRITABLE },
    ],
    data: new Uint8Array(n),
    programAddress: address("11111111111111111111111111111111"),
  };
}

describe("transaction", () => {
  it("Should split instructions in multiple transactions", () => {
    const instructions = [
      instr(1), instr(2), instr(3),
      instr(4), instr(5), instr(6),
      instr(7), instr(8), instr(9),
      instr(10),
    ];
    const transactions = splitInstructions(instructions);
    console.log(transactions);
    assert.deepStrictEqual(transactions, [
      instructions.slice(0, 3),
      instructions.slice(3, 6),
      instructions.slice(6, 9),
      instructions.slice(9),
    ]);
  });

  it("Should split instructions in a single transaction if possible", () => {
    const instructions = [instr(1), instr(2), instr(3)];
    const transactions = splitInstructions(instructions);
    assert.deepStrictEqual(transactions, [instructions]);
  });

  it("Should return empty array if no instructions", () => {
    const transactions = splitInstructions([]);
    assert.deepStrictEqual(transactions, []);
  });
});
