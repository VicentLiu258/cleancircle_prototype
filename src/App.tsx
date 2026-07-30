import { useState } from 'react';
import { OverviewView } from './views/OverviewView';
import { ScreensView } from './views/ScreensView';
import { DecisionsView } from './views/DecisionsView';

type View = 'overview' | 'screens' | 'decisions';

const NAV: { id: View; label: string }[] = [
  { id: 'overview', label: '总览' },
  { id: 'screens', label: '原型页面' },
  { id: 'decisions', label: '逻辑补全说明' },
];

export default function App() {
  const [view, setView] = useState<View>('overview');
  const [screenId, setScreenId] = useState('B01');

  const goScreen = (id: string) => {
    setScreenId(id);
    setView('screens');
  };

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-gray-800 text-[11px] font-bold text-white">CC</span>
          <div>
            <p className="text-sm font-bold leading-tight text-gray-800">Clean Circle · 管理后台灰度线框原型</p>
            <p className="text-[10px] leading-tight text-gray-400">第 3 批 · 后台 P0 全集 · 业务逻辑评审用 · 非视觉稿 · 22 屏（§4 清单 P0 全覆盖：B01 / B03–B16 / B18–B21 / B23 / B26 / B27）</p>
          </div>
        </div>
        <nav className="ml-auto flex gap-1">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => setView(n.id)}
              className={`rounded-md px-3.5 py-1.5 text-sm ${
                view === n.id ? 'bg-gray-800 font-semibold text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {n.label}
            </button>
          ))}
        </nav>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {view === 'overview' && <OverviewView onNavigate={goScreen} />}
        {view === 'screens' && (
          <ScreensView screenId={screenId} onNavigate={setScreenId} onShowDecisions={() => setView('decisions')} />
        )}
        {view === 'decisions' && <DecisionsView onNavigate={goScreen} />}
      </div>
    </div>
  );
}
