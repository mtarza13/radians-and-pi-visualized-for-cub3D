import React from 'react';
import ASCIIDiagram from '../components/ASCIIDiagram';
import LessonEnding from '../components/LessonEnding';
import Math from '../components/Math';

export default function RayPerColumn() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">Ray per Column: cameraX and rayDir</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          The screen is chopped into vertical columns. Column <code className="text-slate-200">x</code> becomes a value in [-1, 1]
          called <code className="text-slate-200">cameraX</code>.
        </p>
      </header>

      <section className="space-y-4">
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <Math block>{String.raw`cameraX = 2\cdot\frac{x}{w} - 1`}</Math>
          <Math block>{String.raw`\vec{rayDir} = \vec{dir} + \vec{plane}\cdot cameraX`}</Math>
        </div>

        <ASCIIDiagram
          caption="cameraX maps left edge to -1 and right edge to +1."
          content={`
Screen columns:  0            w/2            w-1
cameraX:        -1             0              +1

rayDir(left)   = dir - plane
rayDir(center) = dir
rayDir(right)  = dir + plane
`}
        />
      </section>

      <LessonEnding
        mustRemember={[
          'cameraX maps each column into [-1, 1].',
          'rayDir is dir plus/minus a portion of the camera plane.',
          'The camera plane controls the spread of rays (FOV).',
        ]}
        commonMistakes={[
          'Using integer division for x/w (cameraX becomes 0 for most columns).',
          'Forgetting the “2*” in cameraX mapping.',
          'Casting rays from grid cell centers instead of real player position.',
        ]}
        quiz={[
          'What cameraX do you get at the screen center?',
          'Why does rayDir use plane * cameraX?',
          'What happens to ray spread if planeLen increases?',
        ]}
      />
    </div>
  );
}
