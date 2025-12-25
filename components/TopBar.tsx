import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight, Search } from 'lucide-react';
import type { PageId, PageMeta } from '../site/siteMap';

interface TopBarProps {
  activePage: PageMeta;
  pages: PageMeta[];
  onNavigate: (id: PageId) => void;
}

export default function TopBar({ activePage, pages, onNavigate }: TopBarProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      if (!isCmdK) return;
      e.preventDefault();
      setOpen(true);
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return pages
      .map((p) => {
        const hay = `${p.title} ${p.shortTitle} ${p.keywords.join(' ')}`.toLowerCase();
        const score = hay.includes(q) ? 2 : p.keywords.some((k) => k.toLowerCase().includes(q)) ? 1 : 0;
        return { p, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map((r) => r.p);
  }, [pages, query]);

  const showDropdown = open && (query.trim().length > 0 || results.length > 0);

  return (
    <div className="sticky top-0 z-20 bg-[#020617]/90 backdrop-blur border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-8 md:px-12 py-4 flex items-center justify-between gap-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="text-slate-400 font-semibold">cub3D Guide</span>
          <ChevronRight size={14} className="opacity-60" />
          <span>{activePage.group}</span>
          <ChevronRight size={14} className="opacity-60" />
          <span className="text-slate-200 font-semibold">{activePage.shortTitle}</span>
        </div>

        <div className="relative w-[420px] max-w-full">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-200">
            <Search size={16} className="text-slate-500" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              onBlur={() => {
                // Tiny delay so click selection works.
                setTimeout(() => setOpen(false), 120);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) {
                  onNavigate(results[0].id);
                  setQuery('');
                  setOpen(false);
                }
                if (e.key === 'Escape') {
                  setOpen(false);
                  setQuery('');
                  (e.target as HTMLInputElement).blur();
                }
              }}
              placeholder="Search lessons (Ctrl+K)"
              className="w-full bg-transparent outline-none text-sm placeholder:text-slate-600"
            />
            <span className="text-[10px] text-slate-600 border border-slate-800 rounded px-2 py-0.5">Ctrl K</span>
          </div>

          {showDropdown && (
            <div className="absolute top-full mt-2 w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              {results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500">No matches.</div>
              ) : (
                <div className="py-2">
                  {results.map((p) => (
                    <button
                      key={p.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        onNavigate(p.id);
                        setQuery('');
                        setOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-900 text-sm text-slate-200 flex items-center justify-between"
                    >
                      <span className="truncate">{p.number ? `${p.number}) ` : ''}{p.title}</span>
                      <span className="text-[10px] text-slate-500">{p.group}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
