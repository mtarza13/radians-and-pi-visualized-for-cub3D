import React from 'react';
import ASCIIDiagram from '../components/ASCIIDiagram';
import LessonEnding from '../components/LessonEnding';
import Math from '../components/Math';

export default function FishEyeFix() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">perpWallDist & fish-eye fix</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          If you use the raw ray length, walls “curve” (fish-eye). You want the distance perpendicular to the camera plane.
        </p>
      </header>

      <section className="space-y-4">
        <ASCIIDiagram
          caption="Same wall, different rays: raw distance changes with angle."
          content={`
player -> wall is flat
center ray hits straight
side ray hits diagonally (longer)

If you use raw distance:
  side columns look farther => wall bends
`}
        />

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Classic cub3D fix</div>
          <p className="text-slate-300">
            After DDA, compute perpendicular distance from the side you hit:
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Math block>{String.raw`\text{if side==0: } perpWallDist = sideDistX - \Delta_x`}</Math>
            <Math block>{String.raw`\text{if side==1: } perpWallDist = sideDistY - \Delta_y`}</Math>
          </div>
        </div>
      </section>

      <LessonEnding
        mustRemember={[
          'Fish-eye happens when you use the raw ray length.',
          'Use perpWallDist for projection (slice height).',
          'In the LodeV method, perpWallDist comes from sideDist - deltaDist.',
        ]}
        commonMistakes={[
          'Using sqrt(dx*dx+dy*dy) from player to hit point as distance for projection.',
          'Not tracking which side was hit (side variable).',
          'Using the wrong sideDist when side changes.',
        ]}
        quiz={[
          'Why do side rays produce longer raw distances?',
          'Where does perpWallDist come from in the DDA loop?',
          'What visual artifact appears without the fix?',
        ]}
      />
    </div>
  );
}
