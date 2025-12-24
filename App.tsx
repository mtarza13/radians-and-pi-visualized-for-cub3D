
import React, { useState } from 'react';
import { MousePointer2, Compass, Cpu, Layers, AlertTriangle } from 'lucide-react';
import UnitCircle from './components/UnitCircle';
import MovementSim from './components/MovementSim';

const App: React.FC = () => {
  const [angle, setAngle] = useState(0.8);

  return (
    <div className="min-h-screen pb-20 selection:bg-emerald-500/30">
      {/* Header */}
      <header className="p-8 border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
              RADIANS & RAYCASTING
            </h1>
            <p className="text-slate-400 mt-1 font-medium italic">A Geometrical Engine Builder's Guide</p>
          </div>
          <div className="hidden md:flex gap-4 text-xs mono">
            <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">PI = 3.14159...</span>
            <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">RAD = DIST / R</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-24">
        
        {/* Intro */}
        <section className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 rounded-lg text-sm text-slate-300">
              <Compass size={16} /> <span>Fundamentals</span>
            </div>
            <h2 className="text-4xl font-bold leading-tight">
              Why do we use <span className="text-emerald-400">Radians</span> instead of Degrees?
            </h2>
            <p className="text-lg text-slate-400">
              In game engines, degrees are a human construct. Radians are <strong>intrinsic geometry</strong>. 
              In cub3D, every ray we cast, every step we take, is a calculation of distance on a circle.
            </p>
            <div className="flex gap-4">
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex-1">
                <span className="block text-2xl font-bold text-white">2π</span>
                <span className="text-xs text-slate-500 uppercase">Full Circle</span>
              </div>
              <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex-1">
                <span className="block text-2xl font-bold text-white">1 rad</span>
                <span className="text-xs text-slate-500 uppercase">Length of Radius</span>
              </div>
            </div>
          </div>
          <UnitCircle angle={angle} setAngle={setAngle} />
        </section>

        {/* Movement Section */}
        <section className="space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold">Turning Math into Motion</h2>
            <p className="text-slate-400">
              Movement is just a vector. <span className="text-blue-400">Cos</span> tells us how much to move along the X axis, 
              and <span className="text-rose-400">Sin</span> tells us how much to move along the Y axis.
            </p>
          </div>
          <MovementSim />
        </section>

        {/* Degrees vs Radians Visual Comparison */}
        <section className="bg-slate-900/30 rounded-3xl p-10 border border-slate-800 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <AlertTriangle size={200} />
          </div>
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
             <AlertTriangle className="text-orange-400" /> The Scaling Trap
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <h4 className="text-orange-400 font-bold uppercase tracking-widest text-sm">Wrong: Degrees in Logic</h4>
              <div className="bg-slate-950 p-6 rounded-2xl border border-red-500/30 relative">
                <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">DIRTY</div>
                <code className="text-sm block mono">
                  <span className="text-red-400">// This won't work:</span><br/>
                  x += cos(90) * speed; <br/>
                  <span className="text-slate-600">// CPU thinks 90 is 90 Radians!</span><br/>
                  <br/>
                  <span className="text-red-400">// Now you need constants:</span><br/>
                  float rad = deg * (PI / 180.0);<br/>
                  x += cos(rad) * speed;
                </code>
              </div>
              <p className="text-sm text-slate-500 italic">
                Using degrees forces you to multiply by π/180 every frame. In raycasting, you do this 3,000+ times per second. 
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-emerald-400 font-bold uppercase tracking-widest text-sm">Correct: Pure Radians</h4>
              <div className="bg-slate-950 p-6 rounded-2xl border border-emerald-500/30 relative">
                 <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">EFFICIENT</div>
                <code className="text-sm block mono">
                  <span className="text-emerald-400">// Direct Geometrical Relation:</span><br/>
                  x += cos(player.angle) * speed;<br/>
                  <br/>
                  <span className="text-slate-600">// θ is distance on the unit circle.</span><br/>
                  <span className="text-slate-600">// No conversion. Pure movement.</span>
                </code>
              </div>
              <p className="text-sm text-slate-500 italic">
                Since Angle = Distance / Radius, and your world is a coordinate system (radius units), radians are "unit-less" and work perfectly.
              </p>
            </div>
          </div>
        </section>

        {/* cub3D Application */}
        <section className="space-y-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-1 flex-1 bg-slate-800" />
            <h2 className="text-2xl font-bold px-4">Why this matters in cub3D</h2>
            <div className="h-1 flex-1 bg-slate-800" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-emerald-500/50 transition-colors">
              <Layers className="text-emerald-400 mb-4" />
              <h4 className="font-bold mb-2">FOV Mapping</h4>
              <p className="text-sm text-slate-400">
                A 66° FOV is roughly <span className="mono text-white">0.66 * π/3</span> radians. You divide this by screen width to find the step between each ray.
              </p>
            </div>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-blue-500/50 transition-colors">
              <Cpu className="text-blue-400 mb-4" />
              <h4 className="font-bold mb-2">Camera Plane</h4>
              <p className="text-sm text-slate-400">
                To rotate the camera plane (the 2D view), you use the <strong>Rotation Matrix</strong>. It uses Sin/Cos of the player's angle to transform vectors.
              </p>
            </div>
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-fuchsia-500/50 transition-colors">
              <MousePointer2 className="text-fuchsia-400 mb-4" />
              <h4 className="font-bold mb-2">Mouse Look</h4>
              <p className="text-sm text-slate-400">
                Mouse movement (DX) is simply added to the angle. Sensitivity is just a multiplier on how many <strong>Radians</strong> we turn per pixel.
              </p>
            </div>
          </div>
        </section>

        {/* Conclusion / Formula Sheet */}
        <section className="text-center p-12 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl border border-slate-800">
          <h2 className="text-2xl font-bold mb-8">Cheat Sheet for cub3D</h2>
          <div className="flex flex-wrap justify-center gap-8 text-sm mono">
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500">Angle:</span> <span className="text-emerald-400">θ = arc / r</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500">Full:</span> <span className="text-blue-400">2 * PI</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500">Vector:</span> <span className="text-fuchsia-400">x=cos, y=sin</span>
            </div>
            <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
              <span className="text-slate-500">Ray:</span> <span className="text-yellow-400">pos + dir * dist</span>
            </div>
          </div>
        </section>

      </main>

      <footer className="text-center text-slate-600 text-xs py-10 border-t border-slate-900">
        Engineered for Educators & Developers • 2024
      </footer>
    </div>
  );
};

export default App;
