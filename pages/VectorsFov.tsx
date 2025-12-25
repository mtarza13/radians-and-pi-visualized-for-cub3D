import React, { useState } from 'react';
import ASCIIDiagram from '../components/ASCIIDiagram';
import LessonEnding from '../components/LessonEnding';
import Tex from '../components/Math';
import UnitCircle from '../components/UnitCircle';

export default function VectorsFov() {
  const [angle, setAngle] = useState(Math.PI / 6);

  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">Vectors: dir + camera plane (FOV)</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          In cub3D you have two key vectors:
          <strong> direction</strong> (where you look) and the <strong>camera plane</strong> (how wide you see).
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Direction vector</h2>
        <p className="text-slate-400 leading-relaxed">
          When your player angle is $\theta$, your direction vector is just the unit circle:
          <Tex>{String.raw`\vec{dir} = (\cos\theta,\ \sin\theta)`}</Tex>
        </p>
        <UnitCircle angle={angle} setAngle={setAngle} />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Camera plane (perpendicular)</h2>
        <p className="text-slate-400 leading-relaxed">
          The camera plane is a vector perpendicular to <code className="text-slate-200">dir</code>.
          If <Tex>{String.raw`\vec{dir}=(d_x,d_y)`}</Tex>, then a perpendicular is:
        </p>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <Tex block>{String.raw`\vec{plane} = (-d_y,\ d_x) \cdot \text{planeLen}`}</Tex>
        </div>

        <ASCIIDiagram
          caption="dir points forward. plane points sideways and spans your FOV."
          content={`
             plane (sideways)
          <------------------>
                 |
                 |
                 |
                 P -----> dir (forward)
`}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">How plane length relates to FOV</h2>
        <p className="text-slate-400 leading-relaxed">
          In the classic LodeV approach, you cast rays using:
          <Tex>{String.raw`\vec{rayDir} = \vec{dir} + \vec{plane}\cdot cameraX`}</Tex>
          where <Tex>{String.raw`cameraX \in [-1,1]`}</Tex>.
        </p>
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Rule of thumb</div>
          <p className="text-slate-300 leading-relaxed">
            If <code className="text-slate-200">dir</code> is unit-length, then the plane length is:
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Tex block>{String.raw`\text{planeLen} = \tan\left(\frac{\text{FOV}}{2}\right)`}</Tex>
          </div>
          <p className="text-slate-500 text-sm leading-relaxed">
            Example: <code className="text-slate-200">planeLen = 0.66</code> gives roughly <Tex>{String.raw`\text{FOV}\approx 2\arctan(0.66)`}</Tex> ≈ 66°.
          </p>
        </div>
      </section>

      <LessonEnding
        mustRemember={[
          'dir comes from (cosθ, sinθ).',
          'plane is perpendicular to dir and scales your FOV.',
          'planeLen ≈ tan(FOV/2) when dir is normalized.',
        ]}
        commonMistakes={[
          'Forgetting plane must rotate with the player.',
          'Using degrees in C math functions (they expect radians).',
          'Changing planeLen without updating your mental model of FOV.',
        ]}
        quiz={[
          'If dir = (dx, dy), what perpendicular vector can you use for the plane?',
          'What does increasing planeLen do to your view?',
          'Why must dir be unit-length for the tan(FOV/2) relation to hold?',
        ]}
      />
    </div>
  );
}
