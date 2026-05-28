"use client";

import katex from "katex";
import { useMemo } from "react";

interface KaTeXProps {
  expression: string;
  displayMode?: boolean;
  className?: string;
}

export function KaTeX({ expression, displayMode = false, className }: KaTeXProps) {
  const html = useMemo(
    () =>
      katex.renderToString(expression, {
        displayMode,
        throwOnError: false,
        output: "html",
        strict: "ignore",
      }),
    [expression, displayMode],
  );

  return (
    <span
      className={className}
      // KaTeX renders sanitized HTML; we trust the library here.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
