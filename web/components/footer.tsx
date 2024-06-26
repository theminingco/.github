import type { ReactElement } from "react";
import React, { useCallback, useEffect, useState } from "react";
import { faXTwitter, faDiscord, faGithub } from "@fortawesome/free-brands-svg-icons";
import { faFileContract, faShieldHalved } from "@fortawesome/free-solid-svg-icons";
import Button from "./button";
import FontIcon from "./font";
import { usePopup } from "../hooks/popup";
import { cachedFetch } from "@theminingco/core/lib/cache";
import { useFirebase } from "../hooks/firebase";
import Loader from "./loader";

async function parseMd(md: string): Promise<string> {
  const marked = await import("marked");
  const renderer = new marked.Renderer();
  renderer.link = ({ href, title, text }) => {
    return `<a target="_blank" rel="noreferrer noopener" href="${href}" title="${title}">${text}</a>`;
  };
  return marked.parse(md, { renderer });
}

const baseUrl = "https://raw.githubusercontent.com/theminingco/.github/main/";
function HtmlNode(props: { slug: string }): ReactElement {
  const [html, setHtml] = useState<string>();
  const { logError } = useFirebase();

  useEffect(() => {
    const file = `${props.slug.toUpperCase()}.md`;
    cachedFetch(`${baseUrl}${file}`)
      .then(parseMd)
      .then(setHtml)
      .catch(logError);
  }, [props.slug]);

  if (html == null) {
    return <Loader className="my-auto" />;
  }

  return (
    <div
      id="legal"
      className="text-pretty"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default function Footer(): ReactElement {
  const { openPopup } = usePopup();

  const openMd = useCallback((slug: string) => {
    openPopup(<HtmlNode slug={slug} />);
  }, [openPopup]);

  return (
    <div className="text-sm flex justify-center mx-1">
      <span className="p-1 max-sm:hidden">Copyright © 2024 iwcapital.xyz</span>
      <span className="grow" />
      <Button href="https://twitter.com/theminingco" outerClassName="p-1 px-2 h-8" aria-label="Twitter">
        <FontIcon className="h-full" icon={faXTwitter} />
      </Button>
      <Button href="https://discord.gg/w9DpyG6ddG" outerClassName="p-1 px-2 h-8" aria-label="Discord">
        <FontIcon className="h-full" icon={faDiscord} />
      </Button>
      <Button href="https://github.com/theminingco" outerClassName="p-1 px-2 h-8" aria-label="GitHub">
        <FontIcon className="h-full" icon={faGithub} />
      </Button>
      <Button onClick={() => openMd("terms")} outerClassName="p-1 px-2 h-8" aria-label="Terms of Service">
        <FontIcon className="h-full" icon={faFileContract} />
      </Button>
      <Button onClick={() => openMd("privacy")} outerClassName="p-1 px-2 h-8" aria-label="Privacy Policy">
        <FontIcon className="h-full" icon={faShieldHalved} />
      </Button>
    </div>
  );
}
