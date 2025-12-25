import React from 'react';
import ASCIIDiagram from '../components/ASCIIDiagram';
import LessonEnding from '../components/LessonEnding';
import Math from '../components/Math';

export default function MapParsingLesson() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">Map Parsing & Validation</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Your map is not “just input”. It controls memory access, collision, and raycasting loops.
          A single open wall can become an out-of-bounds read in DDA.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Mental model: strings → grid</h2>
        <ASCIIDiagram
          caption="Why we say map[y][x]: each string is a row (Y)."
          content={`
char **map = {
  "111111",
  "1000N1",
  "100001",
  "111111",
};

// map[y][x]
// map[0] = first ROW (top)
// map[1] = second ROW
`}
        />

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Indexing formula</div>
          <p className="text-slate-400">
            In C you’ll often store the map as <code className="text-slate-200">char **</code>. If you ever flatten it into 1D,
            the conversion is:
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Math block>{String.raw`\text{index} = y \cdot \text{width} + x`}</Math>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Validation rules (cub3D-style)</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
            <div className="text-xs font-black tracking-widest uppercase text-emerald-400">Allowed chars</div>
            <p className="text-slate-400">Only:</p>
            <ASCIIDiagram content={`
'1' wall
'0' floor
' ' void (outside)
'N' 'S' 'E' 'W' player start
`} />
          </div>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
            <div className="text-xs font-black tracking-widest uppercase text-emerald-400">Exactly 1 player</div>
            <p className="text-slate-400 leading-relaxed">
              If you have 0 players → you can’t spawn.
              If you have 2+ → your data model is ambiguous.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">The scary part: spaces and “void”</h2>
        <p className="text-slate-400 leading-relaxed">
          In many cub3D maps, lines have different lengths. When you pad shorter lines with spaces,
          those spaces represent “outside the map”. A floor tile next to a space is an open map.
        </p>

        <ASCIIDiagram
          caption="A single space can make your map open."
          content={`
1111111
1000001
10N0 11   <- that ' ' is void
1000001
1111111

The '0' next to ' ' leaks outside.
Ray DDA can march forever or read outside.
`}
        />

        <div className="bg-rose-500/10 border border-rose-500/20 rounded-3xl p-6">
          <div className="text-xs font-black tracking-widest uppercase text-rose-300 mb-2">Practical closed-map rule</div>
          <p className="text-slate-300 leading-relaxed">
            Every walkable tile (<code className="text-slate-200">0</code> or player start) must have
            non-void neighbors in the 4 directions. If any neighbor is out of bounds or a space → error.
          </p>
        </div>
      </section>

      <LessonEnding
        mustRemember={[
          'Normalize the grid: pad lines to max width with spaces.',
          'Exactly one player start (N/S/E/W).',
          'A walkable tile touching space/void means the map is open.',
        ]}
        commonMistakes={[
          'Trimming lines aggressively (removes meaningful trailing spaces).',
          'Treating spaces as floors (will crash your DDA).',
          'Only checking the outer border but ignoring inner void pockets.',
        ]}
        quiz={[
          'Why can trimming trailing spaces break validation?',
          'What tiles are “walkable” for the closed-map rule?',
          'Give one way an open map can crash raycasting.',
        ]}
      />
    </div>
  );
}
