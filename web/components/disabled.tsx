import type { ReactElement } from "react";
import React from "react";

export default function Disabled(): ReactElement {
  return (
    <div className="px-10">
      <div className="text-6xl font-black">
        Page unavailable
      </div>
      <div className="font-medium">
        We regret to inform you that the requested page is currently
        not available due to compliance reasons. Please check back in
        the future, keep an eye out on our socials and keep on digging...
      </div>
    </div>
  );
}
