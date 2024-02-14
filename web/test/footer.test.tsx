import React from "react";
import renderer from "react-test-renderer";

it("Footer should be rendered", async () => {
  const file = await import("../components/footer");
  jest.mock("firebase/functions", async () => { /* Empty */ });
  const Footer = file.default;
  const component = renderer.create(<Footer />);
  const tree = component.toJSON();
  expect(tree).toMatchSnapshot();
});
