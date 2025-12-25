import React, { useMemo } from 'react';
import katex from 'katex';

interface MathProps {
  children: string;
  block?: boolean;
}

export default function Math({ children, block }: MathProps) {
  const html = useMemo(() => {
    return katex.renderToString(children, {
      throwOnError: false,
      displayMode: Boolean(block),
      strict: 'ignore',
    });
  }, [children, block]);

  if (block) {
    return <div className="katex-display" dangerouslySetInnerHTML={{ __html: html }} />;
  }
  return <span className="katex" dangerouslySetInnerHTML={{ __html: html }} />;
}
