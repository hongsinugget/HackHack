import { useState } from "react";

export function useCopyToClipboard(resetDelay = 2000) {
  const [copied, setCopied] = useState(false);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
    });
  };

  return { copied, copy };
}
