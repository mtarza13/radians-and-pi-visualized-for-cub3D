
import React from 'react';

interface ASCIIDiagramProps {
  content: string;
  caption?: string;
}

const ASCIIDiagram: React.FC<ASCIIDiagramProps> = ({ content, caption }) => (
  <div className="my-6">
    <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800 leading-tight">
      <pre>{content.trim()}</pre>
    </div>
    {caption && <p className="text-xs text-slate-500 mt-2 text-center italic">{caption}</p>}
  </div>
);

export default ASCIIDiagram;
