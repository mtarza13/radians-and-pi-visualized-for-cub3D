import React from 'react';
import ASCIIDiagram from '../components/ASCIIDiagram';
import LessonEnding from '../components/LessonEnding';
import Math from '../components/Math';
import DDAVisualizer from '../components/DDAVisualizer';

export default function DDADeepDive() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">DDA Deep Dive</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          DDA (Digital Differential Analyzer) is how your ray walks tile-by-tile to find the first wall.
          It’s not random stepping — it always chooses the next closest grid intersection.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">The two “clocks”: sideDistX and sideDistY</h2>
        <p className="text-slate-400 leading-relaxed">
          Think of <code className="text-slate-200">sideDistX</code> and <code className="text-slate-200">sideDistY</code> as two timers.
          Each one tells you the distance to the next vertical or horizontal grid line.
          You always step the smaller one.
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <Math block>{String.raw`\Delta_x = \left|\frac{1}{rayDir_x}\right|\quad\quad \Delta_y = \left|\frac{1}{rayDir_y}\right|`}</Math>
        </div>

        <ASCIIDiagram
          caption="DDA chooses the closest next grid crossing."
          content={`
Each step:
  if (sideDistX < sideDistY)
    sideDistX += deltaDistX;  mapX += stepX;  side = 0;
  else
    sideDistY += deltaDistY;  mapY += stepY;  side = 1;

'side' tells you which wall orientation you hit.
`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">A step table (the thing you should debug with)</h2>
        <p className="text-slate-400 leading-relaxed">
          When DDA “feels wrong”, print a step table. If your map loops forever, your step table will show it.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead className="text-slate-500">
              <tr>
                <th className="text-left py-2">step</th>
                <th className="text-left py-2">mapX</th>
                <th className="text-left py-2">mapY</th>
                <th className="text-left py-2">sideDistX</th>
                <th className="text-left py-2">sideDistY</th>
                <th className="text-left py-2">side</th>
              </tr>
            </thead>
            <tbody className="text-slate-200">
              {[0, 1, 2, 3].map((i) => (
                <tr key={i} className="border-t border-slate-800">
                  <td className="py-2">{i}</td>
                  <td className="py-2">…</td>
                  <td className="py-2">…</td>
                  <td className="py-2 text-blue-300">…</td>
                  <td className="py-2 text-rose-300">…</td>
                  <td className="py-2">…</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-slate-500 mt-3">
            The values depend on your ray; the structure is what matters.
          </p>
        </div>

        <DDAVisualizer />
      </section>

      <LessonEnding
        mustRemember={[
          'deltaDist is the distance to cross one grid cell in X or Y along the ray.',
          'sideDist starts at the first grid boundary from the player, then increases by deltaDist.',
          'You always step toward the smaller sideDist (closest next intersection).',
        ]}
        commonMistakes={[
          'Computing deltaDist with integer division or using 0 when rayDir is tiny.',
          'Mixing up mapX/mapY updates (stepping X when you meant Y).',
          'Not bounding DDA steps when debugging → infinite loops hide the bug.',
        ]}
        quiz={[
          'What does deltaDistX represent geometrically?',
          'Why do we compare sideDistX and sideDistY each loop?',
          'What does the variable side tell you after a hit?',
        ]}
      />
    </div>
  );
}
