import React from 'react';
import LessonEnding from '../components/LessonEnding';
import Math from '../components/Math';
import ASCIIDiagram from '../components/ASCIIDiagram';

export default function ProjectionLineHeight() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">Projection and lineHeight</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Once you have <code className="text-slate-200">perpWallDist</code>, projection is just drawing a vertical slice.
        </p>
      </header>

      <section className="space-y-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <Math block>{String.raw`\text{lineHeight} = \left\lfloor \frac{screenH}{perpWallDist} \right\rfloor`}</Math>
          <Math block>{String.raw`drawStart = -\frac{lineHeight}{2} + \frac{screenH}{2}`}</Math>
          <Math block>{String.raw`drawEnd = \frac{lineHeight}{2} + \frac{screenH}{2}`}</Math>
        </div>

        <ASCIIDiagram
          caption="A single column gets a start/end on screen."
          content={`
Screen (y): 0
  ceiling
  |
  |  drawStart
  |  ██████ wall slice
  |  drawEnd
  floor
Screen (y): screenH
`}
        />
      </section>

      <LessonEnding
        mustRemember={[
          'Projection uses perpWallDist, not raw distance.',
          'drawStart/drawEnd clamp to [0, screenH-1].',
          'Ceiling/floor are just fills above/below the slice.',
        ]}
        commonMistakes={[
          'Not clamping drawStart/drawEnd → out-of-bounds pixel writes.',
          'Using screenW instead of screenH in lineHeight.',
          'Mixing int and float too early (stair-steppy visuals).',
        ]}
        quiz={[
          'What happens to lineHeight when perpWallDist doubles?',
          'Why do we center the slice around screenH/2?',
          'Why should drawStart/drawEnd be clamped?',
        ]}
      />
    </div>
  );
}
