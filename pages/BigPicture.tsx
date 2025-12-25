import React from 'react';
import ASCIIDiagram from '../components/ASCIIDiagram';
import LessonEnding from '../components/LessonEnding';
import Math from '../components/Math';

export default function BigPicture() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Big Picture: 2D → fake 3D</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          cub3D is a trick: we never build real 3D geometry.
          We stay in a 2D grid and draw <strong>vertical slices</strong> whose height depends on distance.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">The “flashlight” idea</h2>
        <p className="text-slate-400 leading-relaxed">
          Imagine you’re in a maze with a flashlight. For each screen column, you shine a ray and ask:
          <strong> where is the first wall hit?</strong> That distance becomes the wall slice height.
        </p>

        <ASCIIDiagram
          caption="One ray (one screen column)."
          content={`
[TOP-DOWN GRID]                         [SCREEN]

1111111111                               ^ y
1000000001                               |
10P----->*1   ray hits wall              |        ████
1000000001                               |        ████  close = tall
1111111111                               |         ██
                                         +--------------> x
                                                  far = short
`}
        />

        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Core formula</div>
          <p className="text-slate-300 leading-relaxed">
            In classic raycasters, wall slice height is inversely proportional to distance:
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Math block>{String.raw`\text{lineHeight} = \left\lfloor \frac{\text{screenH}}{\text{perpWallDist}} \right\rfloor`}</Math>
          </div>
          <p className="text-slate-500 text-sm">
            Key word: <code className="text-slate-200">perpWallDist</code> (distance corrected to avoid fish-eye).
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">What is the “engine”, really?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
            <div className="text-xs font-black tracking-widest uppercase text-emerald-400 mb-2">2D engine</div>
            <ul className="text-slate-300 space-y-2">
              <li>Parse map into a grid</li>
              <li>Player position + direction</li>
              <li>For each column: cast ray (DDA)</li>
              <li>Get hit distance + wall side</li>
            </ul>
          </div>
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
            <div className="text-xs font-black tracking-widest uppercase text-blue-400 mb-2">Rendering output</div>
            <ul className="text-slate-300 space-y-2">
              <li>Compute slice height</li>
              <li>Draw ceiling + floor</li>
              <li>Draw wall strip (color/texture)</li>
              <li>Repeat for all columns</li>
            </ul>
          </div>
        </div>
      </section>

      <LessonEnding
        mustRemember={[
          'One ray per screen column (vertical strip rendering).',
          'Rays walk on grid lines (tile boundaries), not pixels.',
          'Slice height uses the corrected distance: perpWallDist.',
        ]}
        commonMistakes={[
          'Using the raw Euclidean hit distance → fish-eye distortion.',
          'Mixing up map indexing: map[y][x] (row first).',
          'Forgetting to handle spaces/void properly → open maps and crashes.',
        ]}
        quiz={[
          'Why do we cast one ray per screen column (not per pixel)?',
          'What does perpWallDist fix compared to the raw hit distance?',
          'In C, why is the map accessed as map[y][x]?',
        ]}
      />
    </div>
  );
}
