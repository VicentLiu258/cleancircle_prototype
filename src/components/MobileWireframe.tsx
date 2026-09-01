import type { WireBlock, ScreenDef } from '../data/mobile/types';

// ——— 图片占位：灰块 + 对角叉线 ———
const crossBg: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to top right, transparent calc(50% - 1px), #d1d5db calc(50% - 1px), #d1d5db calc(50% + 1px), transparent calc(50% + 1px)), linear-gradient(to bottom right, transparent calc(50% - 1px), #d1d5db calc(50% - 1px), #d1d5db calc(50% + 1px), transparent calc(50% + 1px))',
};

const TABS: { label: string; to: string }[] = [
  { label: '今日', to: 'S09' },
  { label: '课程库', to: 'S29' },
  { label: '日历', to: 'S25' },
  { label: '社区', to: 'S31' },
  { label: '我的', to: 'S26' },
];

// ——— 周期阶段配色（品牌玫瑰色阶）———
const PHASES = [
  { name: '月经期', days: 5, bg: '#aa6459', cls: 'text-white', dot: '#aa6459' },
  { name: '卵泡期', days: 9, bg: '#ba7872', cls: 'text-white', dot: '#ba7872' },
  { name: '排卵期', days: 3, bg: '#824d48', cls: 'text-white', dot: '#824d48' },
  { name: '黄体期', days: 13, bg: '#68403e', cls: 'text-white', dot: '#68403e' },
];

function phaseOfDay(dayIdx: number) {
  let d = (dayIdx + 21) % 28;
  for (const p of PHASES) {
    if (d < p.days) return p;
    d -= p.days;
  }
  return PHASES[PHASES.length - 1];
}

type TrainingIntent = 'rest' | 'push' | 'warm' | 'soft' | 'fallback';
type CompletionStatus = 'done' | 'partial' | null;
type SecondaryBadge = 'locked' | 'replan' | 'addon' | null;

interface CalendarDayDemo {
  intent: TrainingIntent;
  completion: CompletionStatus;
  badge: SecondaryBadge;
}

const INTENT_ICON: Record<TrainingIntent, string> = {
  rest: '□', push: '↑', warm: '●', soft: '～', fallback: '!',
};

const DEFAULT_INTENTS: TrainingIntent[] = ['warm', 'push', 'soft', 'warm', 'soft', 'rest', 'warm'];

function buildCalendarDemo(): CalendarDayDemo[] {
  const days: CalendarDayDemo[] = Array.from({ length: 30 }, (_, i) => ({
    intent: DEFAULT_INTENTS[i % DEFAULT_INTENTS.length],
    completion: null,
    badge: null,
  }));
  Object.assign(days[0], { intent: 'soft' as TrainingIntent });
  Object.assign(days[1], { intent: 'warm', badge: 'replan' as SecondaryBadge });
  Object.assign(days[5], { intent: 'soft', badge: 'addon' as SecondaryBadge });
  Object.assign(days[7], { intent: 'rest' });
  Object.assign(days[10], { intent: 'push', completion: 'partial' as CompletionStatus });
  Object.assign(days[15], { intent: 'warm', badge: 'locked' as SecondaryBadge });
  Object.assign(days[20], { intent: 'warm', completion: 'done' as CompletionStatus });
  Object.assign(days[22], { intent: 'fallback' as TrainingIntent });
  return days;
}

const CALENDAR_DEMO = buildCalendarDemo();

function CalendarDayCell({ dayIdx, demo }: { dayIdx: number; demo: CalendarDayDemo }) {
  const phase = phaseOfDay(dayIdx);
  const isToday = dayIdx === 0;
  const isFallback = demo.intent === 'fallback';
  return (
    <div
      className={`relative flex aspect-square flex-col items-center justify-center rounded-sm text-[7px] leading-none ${phase.cls} ${
        isToday ? 'ring-2 ring-[#49352e] font-bold' : ''
      } ${isFallback ? 'ring-1 ring-amber-500' : ''}`}
      style={{ backgroundColor: phase.bg }}
    >
      {demo.completion === 'done' && (
        <span className="absolute right-0 top-0 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-white/90 text-[6px] font-bold text-gray-800">
          ✓
        </span>
      )}
      {demo.completion === 'partial' && (
        <span className="absolute right-0 top-0 text-[7px] font-bold text-white">◐</span>
      )}
      <span className="text-[8px]">{isToday ? '今' : dayIdx + 1}</span>
      <span className="mt-0.5 text-[6px] opacity-90">{INTENT_ICON[demo.intent]}</span>
      {demo.badge === 'locked' && <span className="absolute bottom-0 left-0 text-[5px]">🔒</span>}
      {demo.badge === 'replan' && <span className="absolute bottom-0 left-0 text-[6px] font-bold">↺</span>}
      {demo.badge === 'addon' && <span className="absolute bottom-0 left-0 text-[6px]">◇</span>}
    </div>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -left-1 -top-1 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-gray-500 text-[9px] font-bold text-white">
      {n}
    </span>
  );
}

function PatchBadge() {
  return (
    <span className="absolute -right-1 -top-1 z-10 rounded-sm bg-amber-400 px-1 text-[9px] font-bold text-white">
      补
    </span>
  );
}

const SLOT_STYLES: Record<string, { bar: string; badge: string; label: string }> = {
  work: { bar: 'bg-gray-500', badge: 'bg-gray-600', label: 'Work' },
  fuel: { bar: 'bg-emerald-500', badge: 'bg-emerald-600', label: 'Fuel' },
  care: { bar: 'bg-violet-500', badge: 'bg-violet-600', label: 'Care' },
  commerce: { bar: 'bg-orange-500', badge: 'bg-orange-600', label: 'Commerce' },
};

function SlotBadge({ slot }: { slot: string }) {
  const s = SLOT_STYLES[slot] ?? SLOT_STYLES.work;
  return (
    <span className={`rounded px-1 py-0.5 text-[8px] font-bold text-white ${s.badge}`}>
      资源位 · {s.label}
    </span>
  );
}

function BackBar({ onBack }: { onBack: () => void }) {
  return (
    <button
      type="button"
      onClick={onBack}
      className="flex w-full shrink-0 items-center gap-0.5 border-b border-gray-200 px-2 py-1.5 text-left hover:bg-gray-50"
      title="返回上级界面"
    >
      <span className="px-1 text-[18px] leading-none text-gray-700">‹</span>
      <span className="text-[12px] font-medium text-gray-700">返回</span>
    </button>
  );
}

interface BlockProps {
  block: WireBlock;
  onNavigate: (id: string, stateId?: string) => void;
  onStateChange: (id: string) => void;
}

export function BlockView({ block: b, onNavigate, onStateChange }: BlockProps) {
  const clickable = !!b.to || !!b.toState;
  const patchCls = b.patch ? 'border border-dashed border-amber-400' : '';
  const base = 'relative w-full';
  const clickCls = clickable ? 'cursor-pointer hover:ring-2 hover:ring-gray-400 transition' : '';
  const handleClick = () => {
    if (b.to) onNavigate(b.to, b.toState);
    else if (b.toState) onStateChange(b.toState);
  };
  const inner = (children: React.ReactNode) => (
    <>
      {b.marker != null && <Badge n={b.marker} />}
      {b.patch && <PatchBadge />}
      {children}
    </>
  );
  const wrap = (children: React.ReactNode, extraCls = '') => (
    <div
      className={`${base} ${extraCls} ${clickCls}`}
      onClick={clickable ? handleClick : undefined}
      title={clickable ? (b.to ? `跳转到 ${b.to}${b.toState ? ` · 状态 ${b.toState}` : ''}` : `切换到状态 ${b.toState}`) : undefined}
    >
      {inner(children)}
    </div>
  );

  switch (b.kind) {
    case 'statusbar':
      return (
        <div className="flex items-center justify-between px-3 py-1 text-[10px] text-gray-500">
          <span className="font-semibold">9:41</span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-3 rounded-[1px] border border-gray-400" />
            <span className="inline-block h-2 w-2 rounded-full border border-gray-400" />
            <span className="inline-block h-2 w-5 rounded-[1px] bg-gray-300 border border-gray-400" />
          </span>
        </div>
      );
    case 'header':
      return wrap(
        <div className={`px-3 py-2 ${patchCls}`}>
          <p className="text-[13px] font-bold text-gray-700">{b.label}</p>
          {b.sub && <p className="mt-0.5 text-[10px] text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'image':
      return wrap(
        <div
          className={`mx-3 flex items-center justify-center rounded-md border border-gray-300 bg-gray-100 ${patchCls}`}
          style={{ height: b.height ?? 100, ...(b.patch ? {} : crossBg) }}
        >
          <span className="bg-gray-100/80 px-2 text-center text-[10px] text-gray-400">{b.label}</span>
        </div>,
      );
    case 'text':
      return wrap(
        <div className={`px-3 py-1.5 ${patchCls}`}>
          <p className="text-[11px] leading-relaxed text-gray-500">{b.label}</p>
          {b.sub && <p className="text-[9px] text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'input':
      return wrap(
        <div className={`mx-3 flex items-center justify-between rounded-md border border-gray-300 bg-white px-2.5 py-2 ${patchCls}`}>
          <span className="text-[11px] text-gray-600">{b.label}</span>
          {b.sub && <span className="text-[10px] text-gray-400">{b.sub}</span>}
        </div>,
      );
    case 'button-primary':
      return wrap(
        <div className={`mx-3 rounded-md bg-gray-700 px-3 py-2.5 text-center ${patchCls}`}>
          <p className="text-[12px] font-semibold text-white">{b.label}{clickable && ' →'}</p>
          {b.sub && <p className="text-[9px] text-gray-300">{b.sub}</p>}
        </div>,
      );
    case 'button-secondary':
      return wrap(
        <div className={`mx-3 rounded-md border border-gray-400 bg-white px-3 py-2 text-center ${patchCls}`}>
          <p className="text-[11px] font-medium text-gray-600">{b.label}{clickable && ' →'}</p>
          {b.sub && <p className="text-[9px] text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'button-danger':
      return wrap(
        <div className={`mx-3 rounded-md border-2 border-gray-600 bg-white px-3 py-2 text-center ${patchCls}`}>
          <p className="text-[11px] font-bold text-gray-700">{b.label}</p>
          {b.sub && <p className="text-[9px] text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'card':
      return wrap(
        <div className={`mx-3 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 ${patchCls}`} style={b.height ? { minHeight: b.height } : undefined}>
          <p className="text-[11px] font-medium text-gray-600">{b.label}{clickable && ' →'}</p>
          {b.sub && <p className="mt-0.5 text-[9px] leading-relaxed text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'list-item':
      return wrap(
        <div className={`mx-3 flex items-center justify-between border-b border-gray-100 px-1 py-2 ${patchCls}`}>
          <span className="text-[11px] text-gray-600">{b.label}{clickable && ' →'}</span>
          {b.sub && <span className="ml-2 text-right text-[9px] text-gray-400">{b.sub}</span>}
        </div>,
      );
    case 'chip-row':
      return wrap(
        <div className={`mx-3 flex flex-wrap gap-1 px-1 py-1 ${patchCls}`}>
          <span className="text-[10px] text-gray-500">{b.label}</span>
          {b.sub && <span className="w-full text-[9px] text-gray-400">{b.sub}</span>}
        </div>,
      );
    case 'divider':
      return <div className="mx-3 my-1 border-t border-gray-200" />;
    case 'spacer':
      return <div style={{ height: b.height ?? 12 }} />;
    case 'progress':
      return wrap(
        <div className={`mx-3 py-1 ${patchCls}`}>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/3 rounded-full bg-gray-500" />
          </div>
          <p className="mt-1 text-[10px] text-gray-500">{b.label}</p>
        </div>,
      );
    case 'calendar-grid': {
      const isPicker = b.label.includes('选择日期');
      if (isPicker) {
        return wrap(
          <div className={`mx-3 rounded-md border border-gray-300 bg-gray-50 p-2 ${patchCls}`} style={{ minHeight: b.height ?? 140 }}>
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-sm text-[8px] ${
                    i < 16 ? 'bg-gray-100 text-gray-300 line-through' : i === 16 ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
            <p className="mt-1.5 text-[9px] text-gray-400">{b.label}</p>
            {b.sub && <p className="text-[9px] text-gray-400">{b.sub}</p>}
          </div>,
        );
      }
      return wrap(
        <div className={`mx-3 rounded-md border border-gray-300 bg-white p-2 ${patchCls}`} style={{ minHeight: b.height ?? 210 }}>
          <div className="grid grid-cols-7 gap-1">
            {CALENDAR_DEMO.map((demo, i) => (
              <CalendarDayCell key={i} dayIdx={i} demo={demo} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {PHASES.map((p) => (
              <span key={p.name} className="flex items-center gap-0.5 text-[8px] text-gray-500">
                <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: p.dot }} />
                {p.name}
              </span>
            ))}
          </div>
          <p className="mt-1 text-[8px] text-gray-500">↑ Push · ● Warm · ～ Soft · □ 休息 · ! 兜底</p>
          <p className="text-[8px] text-gray-500">✓ 完成 · ◐ 部分 · ↺ 变更 · ◇ 自选 · 🔒 锁定</p>
          <p className="mt-1 text-[9px] text-gray-400">{b.label}</p>
          {b.sub && <p className="text-[9px] text-gray-400">{b.sub}</p>}
        </div>,
      );
    }
    case 'cycle-ruler':
      return wrap(
        <div className={`mx-3 px-1 py-2 ${patchCls}`} style={{ minHeight: b.height ?? 80 }}>
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-[12px] font-bold text-gray-700">{b.label}</span>
          </div>
          <div className="relative mt-2 flex h-2 overflow-hidden rounded-full">
            {PHASES.map((p) => (
              <div key={p.name} style={{ flex: p.days, backgroundColor: p.dot }} title={p.name} />
            ))}
            <div className="absolute left-[72%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gray-800 bg-white" />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {PHASES.map((p) => (
              <span key={p.name} className="flex items-center gap-0.5 text-[8px] text-gray-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: p.dot }} />
                {p.name}
              </span>
            ))}
          </div>
          {b.sub && <p className="mt-1 text-[9px] text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'checkin-row':
      return wrap(
        <div className={`mx-3 flex items-center justify-between border-b border-gray-200 px-1 py-2 ${patchCls}`}>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-gray-700">{b.label}{clickable && ' →'}</p>
            {b.sub && <p className="text-[9px] text-gray-400">{b.sub}</p>}
          </div>
          <span className="ml-2 shrink-0 text-[10px] text-gray-400">›</span>
        </div>,
      );
    case 'course-panel':
      return wrap(
        <div className={`mx-3 overflow-hidden rounded-md border border-gray-200 bg-white ${patchCls}`}>
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-2 py-1">
            {b.slot && <SlotBadge slot={b.slot} />}
            {b.source && <span className="text-[8px] text-gray-400">{b.source}</span>}
          </div>
          <div className="flex items-center justify-center border-b border-gray-100 bg-gray-100" style={{ height: b.height ?? 90, ...crossBg }}>
            <span className="bg-gray-100/80 px-2 text-[9px] text-gray-400">4:3 课程封面</span>
          </div>
          <div className="px-2.5 py-2">
            <p className="text-[11px] font-semibold text-gray-700">{b.label}{clickable && ' →'}</p>
            {b.sub && <p className="mt-0.5 text-[9px] leading-relaxed text-gray-400">{b.sub}</p>}
          </div>
        </div>,
      );
    case 'jos-note':
      return wrap(
        <div className={`mx-3 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 ${patchCls}`}>
          <p className="text-[9px] font-bold uppercase tracking-wide text-gray-400">Jo&apos;s Note</p>
          <p className="mt-1 text-[10px] leading-relaxed text-gray-600">{b.label}</p>
          {b.sub && <p className="mt-0.5 text-[10px] leading-relaxed text-gray-500">{b.sub}</p>}
        </div>,
      );
    case 'resource-slot':
      return wrap(
        <div className={`mx-3 flex overflow-hidden rounded-md border border-gray-200 bg-white ${patchCls}`}>
          <div className={`w-1 shrink-0 ${SLOT_STYLES[b.slot ?? 'work']?.bar ?? 'bg-gray-400'}`} />
          <div className="min-w-0 flex-1 px-2.5 py-2">
            <div className="flex items-center justify-between gap-1">
              <SlotBadge slot={b.slot ?? 'work'} />
              {b.source && <span className="truncate text-[8px] text-gray-400">{b.source}</span>}
            </div>
            <p className="mt-1 text-[11px] font-medium text-gray-600">{b.label}{clickable && ' →'}</p>
            {b.sub && <p className="mt-0.5 text-[9px] leading-relaxed text-gray-400">{b.sub}</p>}
          </div>
        </div>,
      );
    case 'trial-strip':
      return wrap(
        <div className={`mx-3 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 ${patchCls}`}>
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-gray-600">{b.label}{clickable && ' →'}</p>
            {b.sub && <span className="text-[9px] text-gray-400">{b.sub}</span>}
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-[85%] rounded-full bg-gray-500" />
          </div>
        </div>,
      );
    case 'cycle-grid':
      return wrap(
        <div className={`mx-3 rounded-md border border-gray-300 bg-white p-2 ${patchCls}`} style={{ minHeight: b.height ?? 180 }}>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 30 }).map((_, i) => {
              const p = phaseOfDay(i);
              const isToday = i === 0;
              return (
                <div
                  key={i}
                  className={`flex aspect-square items-center justify-center rounded-sm text-[8px] ${p.cls} ${
                    isToday ? 'ring-2 ring-[#49352e] font-bold' : ''
                  }`}
                  style={{ backgroundColor: p.bg }}
                >
                  {i === 0 ? '今' : i + 1}
                </div>
              );
            })}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
            {PHASES.map((p) => (
              <span key={p.name} className="flex items-center gap-0.5 text-[8px] text-gray-500">
                <span className="inline-block h-2 w-2 rounded-sm" style={{ backgroundColor: p.dot }} />
                {p.name}
              </span>
            ))}
          </div>
          <p className="mt-1 text-[9px] text-gray-400">{b.label}</p>
          {b.sub && <p className="text-[9px] text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'tabbar':
      return (
        <div className="flex items-stretch border-t border-gray-300 bg-white">
          {TABS.map((t) => {
            const active = t.label === b.label;
            return (
              <button
                key={t.label}
                onClick={() => onNavigate(t.to)}
                className={`flex flex-1 flex-col items-center gap-0.5 py-1.5 text-[9px] ${
                  active ? 'font-bold text-gray-800' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <span className={`h-3.5 w-3.5 rounded-sm ${active ? 'bg-gray-600' : 'bg-gray-300'}`} />
                {t.label}
              </button>
            );
          })}
        </div>
      );
    default:
      return null;
  }
}

// ——— 手机框 ———
export function PhoneFrame({
  screen,
  stateId,
  onNavigate,
  onStateChange,
  onBack,
}: {
  screen: ScreenDef;
  stateId: string;
  onNavigate: (id: string, stateId?: string) => void;
  onStateChange: (id: string) => void;
  onBack?: () => void;
}) {
  const state = screen.states.find((s) => s.id === stateId) ?? screen.states[0];
  const tabbar = state.blocks.find((b) => b.kind === 'tabbar');
  const bodyBlocks = state.blocks.filter((b) => b.kind !== 'tabbar');
  const showBack = !!onBack && !tabbar && screen.id !== 'S01';
  const statusIdx = bodyBlocks.findIndex((b) => b.kind === 'statusbar');

  return (
    <div
      className="flex flex-col overflow-hidden rounded-[36px] border-4 border-gray-700 bg-white shadow-xl"
      style={{ width: 300, height: 650 }}
    >
      <div className="mx-auto mt-1.5 h-4 w-24 rounded-full bg-gray-700" />
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto py-1">
        {showBack && statusIdx < 0 && <BackBar onBack={onBack} />}
        {bodyBlocks.map((b, i) => (
          <div key={i} className="contents">
            <BlockView block={b} onNavigate={onNavigate} onStateChange={onStateChange} />
            {showBack && i === statusIdx && <BackBar onBack={onBack} />}
          </div>
        ))}
      </div>
      {tabbar && (
        <div className="shrink-0 bg-white">
          <BlockView block={tabbar} onNavigate={onNavigate} onStateChange={onStateChange} />
        </div>
      )}
    </div>
  );
}
