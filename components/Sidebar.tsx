
import React from 'react';
import { BookOpen, Play } from 'lucide-react';
import type { PageGroup, PageId, PageMeta } from '../site/siteMap';

interface SidebarProps {
  activePageId: PageId;
  pages: PageMeta[];
  onNavigate: (page: PageId) => void;
}

const GROUP_ORDER: PageGroup[] = ['Lessons', 'Tools'];

const Sidebar: React.FC<SidebarProps> = ({ activePageId, pages, onNavigate }) => {
  const grouped = GROUP_ORDER.map((g) => ({
    group: g,
    items: pages.filter((p) => p.group === g),
  }));

  return (
    <aside className="w-72 border-r border-slate-800 bg-slate-950/50 h-screen sticky top-0 overflow-y-auto hidden md:block">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center text-slate-950 font-bold">C3</div>
          <span className="font-bold tracking-tighter text-white">CUB3D GUIDE</span>
        </div>
        
        <nav className="space-y-6">
          {grouped.map(({ group, items }) => (
            <div key={group} className="space-y-2">
              <div className="text-[11px] font-black tracking-widest uppercase text-slate-600 flex items-center gap-2">
                {group === 'Lessons' ? <BookOpen size={14} /> : <Play size={14} />}
                {group}
              </div>
              <div className="space-y-1">
                {items.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onNavigate(p.id)}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                      activePageId === p.id
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    } ${p.group === 'Tools' ? 'border border-dashed border-emerald-500/30' : ''}`}
                  >
                    <span className="w-6 text-slate-600 font-mono text-xs">
                      {p.number ? String(p.number).padStart(2, '0') : '•'}
                    </span>
                    <span className="truncate">{p.shortTitle}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
