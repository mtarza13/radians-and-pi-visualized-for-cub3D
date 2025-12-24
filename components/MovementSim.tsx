
import React, { useState, useEffect, useRef } from 'react';
import { PlayerState } from '../types';

const MovementSim: React.FC = () => {
  const [player, setPlayer] = useState<PlayerState>({
    pos: { x: 100, y: 100 },
    angle: 0,
  });
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const handleDown = (e: KeyboardEvent) => setKeys(prev => new Set(prev).add(e.code));
    const handleUp = (e: KeyboardEvent) => setKeys(prev => {
      const next = new Set(prev);
      next.delete(e.code);
      return next;
    });
    window.addEventListener('keydown', handleDown);
    window.addEventListener('keyup', handleUp);
    return () => {
      window.removeEventListener('keydown', handleDown);
      window.removeEventListener('keyup', handleUp);
    };
  }, []);

  useEffect(() => {
    const step = () => {
      const speed = 2.0;
      const rotSpeed = 0.05;
      let nextPos = { ...player.pos };
      let nextAngle = player.angle;

      if (keys.has('KeyW')) {
        nextPos.x += Math.cos(nextAngle) * speed;
        nextPos.y += Math.sin(nextAngle) * speed;
      }
      if (keys.has('KeyS')) {
        nextPos.x -= Math.cos(nextAngle) * speed;
        nextPos.y -= Math.sin(nextAngle) * speed;
      }
      if (keys.has('KeyA')) nextAngle -= rotSpeed;
      if (keys.has('KeyD')) nextAngle += rotSpeed;

      setPlayer({ pos: nextPos, angle: nextAngle });
      requestAnimationFrame(step);
    };
    const id = requestAnimationFrame(step);
    return () => cancelAnimationFrame(id);
  }, [keys, player]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw grid
    ctx.clearRect(0, 0, 300, 200);
    ctx.strokeStyle = '#1e293b';
    for (let i = 0; i < 300; i += 20) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, 200); ctx.stroke();
    }
    for (let i = 0; i < 200; i += 20) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(300, i); ctx.stroke();
    }

    // Draw Player
    ctx.save();
    ctx.translate(player.pos.x, player.pos.y);
    ctx.rotate(player.angle);
    
    // Body
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(0, 0, 8, 0, Math.PI * 2);
    ctx.fill();

    // Direction arrow
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();
    ctx.restore();
  }, [player]);

  return (
    <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 flex flex-col md:flex-row gap-6">
      <div className="flex-1">
        <h3 className="text-xl font-bold mb-4 text-yellow-400">2. Movement & Projection</h3>
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={200} 
          className="bg-slate-950 rounded-lg border border-slate-800 w-full h-[200px]"
        />
        <div className="mt-4 flex gap-4 text-xs mono">
          <div className="bg-slate-800 p-2 rounded flex-1">
            <span className="text-slate-500">POS X:</span> {player.pos.x.toFixed(1)}<br/>
            <span className="text-slate-500">POS Y:</span> {player.pos.y.toFixed(1)}
          </div>
          <div className="bg-slate-800 p-2 rounded flex-1">
            <span className="text-slate-500">ANGLE:</span> {player.angle.toFixed(2)}<br/>
            <span className="text-slate-500">DIR:</span> [{Math.cos(player.angle).toFixed(2)}, {Math.sin(player.angle).toFixed(2)}]
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm mono">
          <p className="text-slate-400 mb-2">// Movement logic</p>
          <div className="text-emerald-400">
            x += cos(θ) * speed;<br/>
            y += sin(θ) * speed;
          </div>
          <p className="text-slate-400 mt-4 mb-2">// Rotation logic</p>
          <div className="text-emerald-400">
            θ += 0.05; <span className="text-slate-600 text-[10px]">// ~2.8 degrees</span>
          </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed">
          Use <kbd className="px-1 bg-slate-700 rounded text-slate-100">WASD</kbd> to move.
          Notice how <strong>Cos</strong> gives us horizontal speed and <strong>Sin</strong> gives us vertical speed. 
          Together they form the <span className="text-fuchsia-400 font-bold">Direction Vector</span>.
        </p>
      </div>
    </div>
  );
};

export default MovementSim;
