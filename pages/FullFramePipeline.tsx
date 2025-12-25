import React from 'react';
import LessonEnding from '../components/LessonEnding';
import ASCIIDiagram from '../components/ASCIIDiagram';
import Math from '../components/Math';

export default function FullFramePipeline() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">Full frame pipeline</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          A frame is: input → update player → cast rays → draw → present.
          If your pipeline order is wrong, debugging becomes impossible.
        </p>
      </header>

      <section className="space-y-4">
        <ASCIIDiagram
          caption="The whole loop (what your project is really graded on)."
          content={`
while (running)
{
  handle_input();
  update_player();

  for (x = 0; x < screenW; x++) {
    build_ray(x);
    dda();
    compute_perpWallDist();
    draw_column(x);
  }

  mlx_put_image_to_window(...);
}
`}
        />

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <div className="text-xs font-black tracking-widest uppercase text-slate-500">Time budget intuition</div>
          <p className="text-slate-300 leading-relaxed">
            If you draw <Math>{String.raw`W`}</Math> columns and each ray takes ~<Math>{String.raw`S`}</Math> DDA steps,
            your frame cost is roughly:
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
            <Math block>{String.raw`\text{work} \approx W \cdot S`}</Math>
          </div>
          <p className="text-slate-500 text-sm">This is why open maps (infinite DDA) are catastrophic.</p>
        </div>
      </section>

      <LessonEnding
        mustRemember={[
          'Frame order matters: input → update → render → present.',
          'You cast and draw one column at a time.',
          'Performance is roughly columns × average DDA steps.',
        ]}
        commonMistakes={[
          'Updating player after rendering (input feels delayed).',
          'Not clearing the image buffer each frame (ghosting).',
          'Calling mlx_put_image_to_window for every column (slow).',
        ]}
        quiz={[
          'Why should mlx_put_image_to_window happen once per frame?',
          'What happens if the map is open and DDA never hits?',
          'What is the typical loop nesting for cub3D rendering?',
        ]}
      />
    </div>
  );
}
