import React, { useMemo, useState } from 'react';
import { validateCubMap } from '../utils/mapValidation';

const VALID_MAP = `
111111111
1N0000001
111011101
100000001
111111111
`.trimEnd();

const INVALID_MAP = `
111111111
1N0000001
1110 1101
100000001
111111111
`.trimEnd();

type Mode = 'valid' | 'invalid';

function cellClass(ch: string, isIssue: boolean) {
  const base = 'w-6 h-6 md:w-7 md:h-7 flex items-center justify-center text-[10px] font-mono border border-slate-800';
  if (isIssue) return `${base} bg-rose-500/25 text-rose-200 border-rose-500/40`;
  if (ch === '1') return `${base} bg-slate-800/60 text-slate-200`;
  if (ch === '0') return `${base} bg-emerald-500/10 text-emerald-200`;
  if (ch === ' ') return `${base} bg-slate-950 text-slate-700`;
  return `${base} bg-yellow-500/10 text-yellow-200`; // N/S/E/W
}

export default function MapValidationMini() {
  const [mode, setMode] = useState<Mode>('valid');

  const text = mode === 'valid' ? VALID_MAP : INVALID_MAP;
  const validated = useMemo(() => validateCubMap(text), [text]);

  const issueCells = useMemo(() => {
    const set = new Set<string>();
    for (const i of validated.issues) {
      if (typeof i.x === 'number' && typeof i.y === 'number') set.add(`${i.x},${i.y}`);
    }
    return set;
  }, [validated.issues]);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Map parsing & validation</div>
          <div className="text-slate-300 mt-1">
            Spaces are real tiles (void). Any walkable tile (<code className="text-slate-200">0</code> or player) touching void means an open map.
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('valid')}
            className={`px-3 py-1 rounded-lg text-xs font-bold border ${mode === 'valid' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-900'}`}
          >
            Valid
          </button>
          <button
            onClick={() => setMode('invalid')}
            className={`px-3 py-1 rounded-lg text-xs font-bold border ${mode === 'invalid' ? 'bg-rose-500 text-slate-950 border-rose-400' : 'bg-slate-950 text-slate-200 border-slate-800 hover:bg-slate-900'}`}
          >
            Invalid
          </button>
        </div>
      </div>

      <div className="flex gap-6 flex-col lg:flex-row">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 inline-block">
          <div
            className="grid gap-0"
            style={{ gridTemplateColumns: `repeat(${validated.width}, minmax(0, 1fr))` }}
          >
            {validated.grid.map((row, y) =>
              row.map((ch, x) => {
                const isIssue = issueCells.has(`${x},${y}`);
                return (
                  <div key={`${x}-${y}`} className={cellClass(ch, isIssue)} title={`(${y},${x}) '${ch === ' ' ? 'space' : ch}'`}>
                    {ch === ' ' ? '·' : ch}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div className="text-sm text-slate-400 leading-relaxed">
            <ul className="list-disc pl-5 space-y-1">
              <li>Only <code className="text-slate-200">0 1 N S E W</code> and space are allowed.</li>
              <li>Exactly one player spawn.</li>
              <li>No empty line inside the map block.</li>
              <li>All walkable tiles must be surrounded (cannot touch void).</li>
            </ul>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <div className="text-xs font-black tracking-widest uppercase text-slate-500 mb-2">Validator output</div>
            {validated.issues.length === 0 ? (
              <div className="text-emerald-300 text-sm">No issues found.</div>
            ) : (
              <div className="space-y-2 text-sm">
                {validated.issues.slice(0, 4).map((i, idx) => (
                  <div key={idx} className="text-rose-200">
                    <span className="text-rose-400 font-bold">{i.kind}</span>: {i.message}
                  </div>
                ))}
                {validated.issues.length > 4 ? (
                  <div className="text-slate-500 text-xs">+ {validated.issues.length - 4} more…</div>
                ) : null}
              </div>
            )}
          </div>

          <div className="text-xs text-slate-500">
            Legend: <span className="text-slate-200">1</span>=wall, <span className="text-emerald-200">0</span>=floor, <span className="text-yellow-200">N/S/E/W</span>=player, <span className="text-slate-400">·</span>=void(space).
          </div>
        </div>
      </div>
    </div>
  );
}
