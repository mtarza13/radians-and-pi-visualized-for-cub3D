
import React, { useMemo, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { PAGES, PAGES_BY_ID, type PageId } from './site/siteMap';

const App: React.FC = () => {
  const [activePageId, setActivePageId] = useState<PageId>('big-picture');
  const activePage = useMemo(() => PAGES_BY_ID[activePageId] ?? PAGES[0], [activePageId]);
  const Page = activePage.Component;

  return (
    <div className="flex bg-[#020617] min-h-screen text-slate-200">
      <Sidebar activePageId={activePageId} pages={PAGES} onNavigate={setActivePageId} />
      
      <main className="flex-1 overflow-y-auto h-screen">
        <TopBar activePage={activePage} pages={PAGES} onNavigate={setActivePageId} />
        <div className="max-w-6xl mx-auto p-8 md:p-12">
          <Page />
        </div>
      </main>
    </div>
  );
};

export default App;
