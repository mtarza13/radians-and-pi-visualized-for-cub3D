
import React, { useMemo, useState } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { validateCubMap } from '../utils/mapValidation';

const MapValidator: React.FC = () => {
  const [input, setInput] = useState(
    [
      '111111111',
      '100000001',
      '10N000001',
      '100000001',
      '111111111',
    ].join('\n')
  );
  
  const validation = useMemo(() => {
    return validateCubMap(input);
  }, [input]);

  const posKey = (y: number, x: number) => `${y},${x}`;

  const issuePositions = useMemo(() => {
    const set = new Set<string>();
    for (const issue of validation.issues) {
      if (typeof issue.x === 'number' && typeof issue.y === 'number') {
        set.add(posKey(issue.y, issue.x));
      }
    }
    return set;
  }, [validation.issues]);

  const hasErrors = validation.issues.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <header className="space-y-2">
        <h2 className="text-3xl font-black text-white">Map Validator Tool</h2>
        <p className="text-slate-400 max-w-3xl leading-relaxed">
          Paste a cub3D map (only the map part). This validator checks allowed chars, exactly one player,
          and the classic “closed map” rule where walkable tiles can’t touch void spaces.
        </p>
      </header>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-500 uppercase">Input Map (.cub format)</label>
          <textarea 
            className="w-full h-64 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-sm text-emerald-400 focus:border-emerald-500 outline-none transition-all"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200">Legend:</strong>{' '}
            <span className="text-slate-500">·</span> = space/void,{' '}
            <span className="text-slate-200">1</span> = wall,{' '}
            <span className="text-emerald-400">0</span> = floor,{' '}
            <span className="text-yellow-300">N/S/E/W</span> = player.
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 h-64 overflow-y-auto">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Validation Results</h4>
            {!hasErrors ? (
              <div className="flex items-center gap-3 text-emerald-400 text-sm font-semibold">
                <CheckCircle2 size={20} /> Map is theoretically closed and valid!
              </div>
            ) : (
              <div className="space-y-2">
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-rose-300 whitespace-pre-wrap">
                  {'Error\n'}
                  {validation.issues.map((e) => e.message).join('\n')}
                </div>

                {validation.issues.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-rose-400 text-xs pt-1">
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    {err.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 overflow-x-auto">
            <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Highlighted Map Preview</h4>
            <pre className="font-mono text-sm leading-snug whitespace-pre">
              {validation.grid.map((row, y) => (
                <div key={y}>
                  {row.map((ch, x) => {
                    const key = posKey(y, x);
                    const isIssue = issuePositions.has(key);
                    const isPlayer = ch === 'N' || ch === 'S' || ch === 'E' || ch === 'W';
                    const visible = ch === ' ' ? '·' : ch;

                    let cls = 'text-slate-400';
                    if (ch === '1') cls = 'text-slate-200';
                    if (ch === '0') cls = 'text-emerald-400';
                    if (isPlayer) cls = validation.playerCount === 1 ? 'text-yellow-300' : 'text-rose-300';

                    if (isIssue) {
                      cls += ' bg-rose-500/15 ring-1 ring-rose-500/30';
                    }

                    return (
                      <span key={x} className={`inline-block w-[1ch] ${cls}`} title={`${y},${x}`}>{visible}</span>
                    );
                  })}
                </div>
              ))}
            </pre>
          </div>

          <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-xs text-slate-400 leading-relaxed">
            <strong>Tip:</strong> In cub3D, spaces <code className="text-slate-200">' '</code> are valid, but they represent void.
            Any floor/player touching void means the map is open.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapValidator;
