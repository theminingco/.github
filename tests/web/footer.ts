import { describe, it, beforeEach } from "mocha";
import { startTestRender, context } from "./setup";
import assert from "assert";
import Footer from "../../web/components/footer";
import { createElement } from "react";

describe("footer", () => {

  beforeEach(async () => {
    await startTestRender(createElement(Footer));
  });

  it("Footer should contain copyright", async () => {
    const copyright = await context.findByText("Copyright © 2023 ⛏ The Mining Company");
    assert.ok(copyright);
  });

  it("Footer should contain social links", async () => {
    const links = await context.findAllByRole("link") as Array<HTMLAnchorElement>;
    assert.strictEqual(links.length, 3);
    assert.strictEqual(links[0].href, "https://twitter.com/theminingco");
    assert.strictEqual(links[1].href, "https://discord.gg/w9DpyG6ddG");
    assert.strictEqual(links[2].href, "https://github.com/theminingco");
  });

  it("Footer should contain legal buttons", async () => {
    const buttons = await context.findAllByRole("button") as Array<HTMLButtonElement>;
    assert.strictEqual(buttons.length, 2);
  });
});

