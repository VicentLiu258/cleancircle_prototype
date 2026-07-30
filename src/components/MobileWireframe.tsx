import type { WireBlock, ScreenDef } from '../data/mobile/types';

// ——— 图片占位：灰块 + 对角叉线 ———
const crossBg: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to top right, transparent calc(50% - 1px), #d1d5db calc(50% - 1px), #d1d5db calc(50% + 1px), transparent calc(50% + 1px)), linear-gradient(to bottom right, transparent calc(50% - 1px), #d1d5db calc(50% - 1px), #d1d5db calc(50% + 1px), transparent calc(50% + 1px))',
};

const TABS: { label: string; to: string }[] = [
  { label: '今日', to: 'S09' },
  { label: '浏览', to: 'S29' },
  { label: '社区', to: 'S31' },
  { label: '日历', to: 'S25' },
  { label: '更多', to: 'S26' },
];

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

interface BlockProps {
  block: WireBlock;
  onNavigate: (id: string) => void;
}

export function BlockView({ block: b, onNavigate }: BlockProps) {
  const clickable = !!b.to;
  const patchCls = b.patch ? 'border border-dashed border-amber-400' : '';
  const base = 'relative w-full';
  const clickCls = clickable ? 'cursor-pointer hover:ring-2 hover:ring-gray-400 transition' : '';
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
      onClick={clickable ? () => onNavigate(b.to!) : undefined}
      title={clickable ? `跳转到 ${b.to}` : undefined}
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
    case 'calendar-grid':
      return wrap(
        <div className={`mx-3 rounded-md border border-gray-300 bg-gray-50 p-2 ${patchCls}`} style={{ minHeight: b.height ?? 140 }}>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className={`flex aspect-square items-center justify-center rounded-sm text-[8px] ${
                  i === 16 ? 'bg-gray-600 text-white' : i < 16 ? 'bg-gray-300 text-gray-600' : 'bg-gray-100 text-gray-400'
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
    case 'tabbar':
      return (
        <div className="mt-auto flex items-stretch border-t border-gray-300 bg-white">
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
}: {
  screen: ScreenDef;
  stateId: string;
  onNavigate: (id: string) => void;
}) {
  const state = screen.states.find((s) => s.id === stateId) ?? screen.states[0];
  return (
    <div
      className="flex flex-col overflow-hidden rounded-[36px] border-4 border-gray-700 bg-white shadow-xl"
      style={{ width: 300, height: 650 }}
    >
      <div className="mx-auto mt-1.5 h-4 w-24 rounded-full bg-gray-700" />
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto py-1">
        {state.blocks.map((b, i) => (
          <BlockView key={i} block={b} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  );
}
