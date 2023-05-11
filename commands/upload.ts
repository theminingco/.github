import { readFileSync } from "fs";
import { promptText } from "../utility/prompt.js";
import { homedir } from "os";
import { uploadArweave } from "../utility/perma.js";
import { link } from "../utility/link.js";
import { startLoading, stopLoading } from "../utility/loader.js";
import { log } from "../utility/log.js";

const symbol = await promptText("What is the token symbol?", "BMB");
const name = await promptText("What is the token name?", "The Bomb Squad");
const description = await promptText("What is the token description?", "Kaboom?");
const imagePath = await promptText("What is the token image?", "~/Downloads/bmb.png");

startLoading("Uploading meta to arweave");

const imageUri = imagePath.replace("~", homedir);
const imageBuffer = readFileSync(imageUri);

const image = await uploadArweave(imageBuffer, "image/png");

const metadata = JSON.stringify({
    name,
    symbol,
    description,
    image
});

const meta = await uploadArweave(Buffer.from(metadata), "application/json");
stopLoading();
log(`Uploaded metadata to ${link(meta, meta)}`);
