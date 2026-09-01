import { useState } from 'react';
import { OverviewView } from './views/OverviewView';
import { ScreensView } from './views/ScreensView';
import { DecisionsView } from './views/DecisionsView';
import { OverviewView as MobileOverviewView } from './views/mobile/MobileOverviewView';
import { ScreensView as MobileScreensView } from './views/mobile/MobileScreensView';
import { DecisionsView as MobileDecisionsView } from './views/mobile/MobileDecisionsView';
import { COURSE_TAGGING_VIEW_ID } from './data/types';
import { V1_VERSION_MATRIX } from './data/v1Overlay';

type Mode = 'mobile' | 'admin';
type View = 'overview' | 'screens' | 'decisions';

const NAV: { id: View; label: string }[] = [
  { id: 'overview', label: '总览' },
  { id: 'screens', label: '原型页面' },
  { id: 'decisions', label: '逻辑补全说明' },
];

const MODES: { id: Mode; label: string; sub: string }[] = [
  { id: 'mobile', label: '移动端 App', sub: '核心主链路 + 商品导购与 H5 分享（S01–S34，S07/S18 未分配）· 0901 更新' },
  { id: 'admin', label: '管理后台', sub: '全量 B01–B57 线框（含外链商品、H5 分享页、内容编排与 AI 审核）' },
];

export default function App() {
  const [mode, setMode] = useState<Mode>('admin');
  const [view, setView] = useState<View>('overview');
  const [adminScreenId, setAdminScreenId] = useState('B02');
  const [mobileScreenId, setMobileScreenId] = useState('S01');

  const goAdminScreen = (id: string) => {
    setAdminScreenId(id);
    setMode('admin');
    setView('screens');
  };
  const goMobileScreen = (id: string) => {
    setMobileScreenId(id);
    setMode('mobile');
    setView('screens');
  };
  const goTagging = () => {
    setAdminScreenId(COURSE_TAGGING_VIEW_ID);
    setMode('admin');
    setView('screens');
  };

  const curMode = MODES.find((m) => m.id === mode)!;

  return (
    <div className="flex h-screen flex-col bg-white">
      <header className="flex shrink-0 items-center gap-4 border-b border-gray-200 bg-white px-5 py-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded bg-gray-800 text-[11px] font-bold text-white">CC</span>
          <div>
            <p className="text-sm font-bold leading-tight text-gray-800">Clean Circle · 线框原型评审站</p>
            <p className="text-[10px] leading-tight text-gray-400">{curMode.sub} · 灰度线框 · 业务逻辑评审用 · 非视觉稿 · {V1_VERSION_MATRIX.taxonomy} / {V1_VERSION_MATRIX.ruleSet}</p>
          </div>
        </div>
        <div className="ml-4 flex rounded-lg border border-gray-300 bg-gray-100 p-0.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-md px-3.5 py-1.5 text-[13px] ${
                mode === m.id ? 'bg-gray-800 font-semibold text-white shadow' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {m.label}
            </button>
          ))}
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
        {mode === 'admin' && view === 'overview' && <OverviewView onNavigate={goAdminScreen} />}
        {mode === 'admin' && view === 'screens' && (
          <ScreensView
            screenId={adminScreenId}
            onNavigate={setAdminScreenId}
            onShowDecisions={() => setView('decisions')}
            onOpenMobile={goMobileScreen}
            onOpenTagging={goTagging}
          />
        )}
        {mode === 'admin' && view === 'decisions' && <DecisionsView onNavigate={goAdminScreen} />}
        {mode === 'mobile' && view === 'overview' && <MobileOverviewView onNavigate={goMobileScreen} />}
        {mode === 'mobile' && view === 'screens' && (
          <MobileScreensView screenId={mobileScreenId} onNavigate={setMobileScreenId} onShowDecisions={() => setView('decisions')} />
        )}
        {mode === 'mobile' && view === 'decisions' && <MobileDecisionsView onNavigate={goMobileScreen} />}
      </div>
    </div>
  );
}
