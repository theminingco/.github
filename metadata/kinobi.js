const { createFromRoot } = require("kinobi");
const { renderVisitor } = require("@kinobi-so/renderers-js");
const { rootNodeFromAnchor } = require("@kinobi-so/nodes-from-anchor");

const kinobi = createFromRoot(
  rootNodeFromAnchor(
    require("./idl.json"),
  ),
);

kinobi.accept(
  renderVisitor("./generated"),
);

