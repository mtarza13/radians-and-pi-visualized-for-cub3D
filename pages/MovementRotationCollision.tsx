import React from 'react';
import LessonEnding from '../components/LessonEnding';
import Math from '../components/Math';
import ASCIIDiagram from '../components/ASCIIDiagram';
import MovementSim from '../components/MovementSim';

export default function MovementRotationCollision() {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 max-w-4xl">
      <header className="space-y-3">
        <h1 className="text-4xl font-black text-white tracking-tight">Movement + rotation + collision</h1>
        <p className="text-lg text-slate-400 leading-relaxed">
          Movement is pure vector math, collision is pure map logic. Keep them separate.
        </p>
      </header>

      <MovementSim />

      <section className="space-y-4">
        <h2 className="text-2xl font-bold text-white">Forward motion</h2>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4">
          <Math block>{String.raw`pos_x \leftarrow pos_x + \cos\theta \cdot speed`}</Math>
          <Math block>{String.raw`pos_y \leftarrow pos_y + \sin\theta \cdot speed`}</Math>
        </div>

        <ASCIIDiagram
          caption="Collision is checking the next tile before committing."
          content={`
nextX = posX + dirX * speed
nextY = posY + dirY * speed

if (map[(int)nextY][(int)nextX] != '1')
  pos = next
`}
        />
      </section>

      <LessonEnding
        mustRemember={[
          'Movement uses direction vector (cosθ, sinθ).',
          'Collision is a map lookup at the next position.',
          'Rotation must update both dir and plane.',
        ]}
        commonMistakes={[
          'Checking collision after moving (you can get stuck in walls).',
          'Using (int)posX/(int)posY inconsistently across checks.',
          'Rotating only dir but forgetting to rotate plane.',
        ]}
        quiz={[
          'Why check collision before updating position?',
          'What tile types should block movement in cub3D?',
          'Why must the plane rotate together with dir?',
        ]}
      />
    </div>
  );
}
