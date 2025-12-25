import React from 'react';

interface LessonEndingProps {
  mustRemember: string[];
  commonMistakes: string[];
  quiz: string[];
}

export default function LessonEnding({ mustRemember, commonMistakes, quiz }: LessonEndingProps) {
  return (
    <div className="mt-12 space-y-6">
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
        <h3 className="text-sm font-black tracking-widest uppercase text-emerald-400">What you MUST remember</h3>
        <ul className="space-y-2 text-slate-300">
          {mustRemember.map((x) => (
            <li key={x} className="flex gap-2">
              <span>✅</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl space-y-3">
        <h3 className="text-sm font-black tracking-widest uppercase text-rose-300">Common mistakes</h3>
        <ul className="space-y-2 text-slate-300">
          {commonMistakes.map((x) => (
            <li key={x} className="flex gap-2">
              <span>⚠️</span>
              <span>{x}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl space-y-3">
        <h3 className="text-sm font-black tracking-widest uppercase text-blue-300">Mini quiz (3)</h3>
        <ol className="space-y-2 text-slate-200 list-decimal pl-5">
          {quiz.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </div>
    </div>
  );
}
