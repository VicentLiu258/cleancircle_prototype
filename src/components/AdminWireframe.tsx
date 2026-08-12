import type { WireBlock, ScreenDef } from '../data/types';

// ——— 图片占位：灰块 + 对角叉线 ———
const crossBg: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(to top right, transparent calc(50% - 1px), #d1d5db calc(50% - 1px), #d1d5db calc(50% + 1px), transparent calc(50% + 1px)), linear-gradient(to bottom right, transparent calc(50% - 1px), #d1d5db calc(50% - 1px), #d1d5db calc(50% + 1px), transparent calc(50% + 1px))',
};

// 后台 IA：对齐《后端需求.docx》（冲突以后端为准，2026-08-07）
const MENU: { group: string; items: { label: string; sid?: string }[] }[] = [
  { group: '工作台', items: [
    { label: '运营总览', sid: 'B02' },
    { label: '转化漏斗', sid: 'B48' },
    { label: '业务趋势', sid: 'B49' },
    { label: '用户行为', sid: 'B50' },
  ]},
  { group: '用户与 CRM', items: [
    { label: '用户列表', sid: 'B18' },
    { label: '用户详情', sid: 'B19' },
    { label: '标签与分群', sid: 'B17' },
    { label: '老用户迁移', sid: 'B20' },
  ]},
  { group: '消息与触达', items: [
    { label: '消息模板', sid: 'B15' },
    { label: '触发器', sid: 'B16' },
    { label: '触达任务与效果', sid: 'B28' },
  ]},
  { group: '问卷评测', items: [
    { label: '问卷与版本', sid: 'B08' },
    { label: '问卷编辑器', sid: 'B09' },
    { label: '评测结果话术', sid: 'B10' },
  ]},
  { group: '内容中心', items: [
    { label: '视频库', sid: 'B03' },
    { label: '视频编辑', sid: 'B04' },
    { label: '批量导入', sid: 'B05' },
    { label: '标签库', sid: 'B06' },
    { label: 'AI 打标复核', sid: 'B07' },
    { label: 'AI 课程组合', sid: 'B31' },
    { label: '今日话术', sid: 'B56' },
    { label: '内容编排', sid: 'B57' },
  ]},
  { group: '排课与建议', items: [
    { label: '排课规则', sid: 'B11' },
    { label: '规则编辑', sid: 'B12' },
    { label: '模拟测试(30天)', sid: 'B13' },
    { label: '阶段建议', sid: 'B14' },
  ]},
  { group: '训练与能量值', items: [
    { label: '打卡数据', sid: 'B29' },
    { label: '能量值规则', sid: 'B30' },
    { label: '能量值调整', sid: 'B23' },
  ]},
  { group: '会员与财务', items: [
    { label: '会员套餐', sid: 'B22' },
    { label: '订阅/订单', sid: 'B21' },
    { label: '退款管理', sid: 'B24' },
    { label: '财务对账', sid: 'B25' },
  ]},
  { group: '社区与活动', items: [
    { label: '帖子管理', sid: 'B32' },
    { label: '评论管理', sid: 'B33' },
    { label: '官方内容', sid: 'B34' },
    { label: 'UGC 审核', sid: 'B35' },
    { label: '举报与申诉', sid: 'B36' },
    { label: '挑战赛', sid: 'B37' },
    { label: '活动投放', sid: 'B38' },
    { label: '社区数据', sid: 'B47' },
  ]},
  { group: '商品导购与分享', items: [
    { label: '外链商品', sid: 'B39' },
    { label: 'H5 分享页', sid: 'B40' },
    { label: 'App 商品入口', sid: 'B41' },
    { label: '外链检查', sid: 'B51' },
  ]},
  { group: '客服', items: [
    { label: '企微配置', sid: 'B42' },
  ]},
  { group: '基础运营配置', items: [
    { label: 'App 页面编辑', sid: 'B55' },
    { label: 'App 版本', sid: 'B43' },
    { label: '功能开关', sid: 'B44' },
    { label: '公告与弹窗', sid: 'B45' },
    { label: '第三方服务', sid: 'B46' },
  ]},
  { group: '系统管理', items: [
    { label: '角色权限', sid: 'B26' },
    { label: '审计日志', sid: 'B27' },
    { label: '后台登录', sid: 'B01' },
  ]},
];

function Badge({ n }: { n: number }) {
  return (
    <span className="absolute -left-1.5 -top-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-gray-500 text-[9px] font-bold text-white">
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
  onSwitchState?: (stateId: string) => void;
}

export function BlockView({ block: b, onNavigate, onSwitchState }: BlockProps) {
  const clickable = !!b.to;
  const patchCls = b.patch ? 'border border-dashed border-amber-400' : '';
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
      className={`relative ${extraCls} ${clickCls}`}
      onClick={clickable ? () => onNavigate(b.to!) : undefined}
      title={clickable ? `跳转到 ${b.to}` : undefined}
    >
      {inner(children)}
    </div>
  );

  switch (b.kind) {
    case 'chrome':
      return (
        <div className="flex items-center gap-2 border-b border-gray-300 bg-gray-100 px-3 py-1.5">
          <span className="flex gap-1">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            <span className="h-2 w-2 rounded-full bg-gray-400" />
          </span>
          <span className="mx-auto flex w-2/3 items-center rounded bg-white px-2 py-0.5 text-[10px] text-gray-400 border border-gray-200">
            🔒 {b.label}
          </span>
        </div>
      );
    case 'topbar':
      return wrap(
        <div className={`flex items-center justify-between border-b border-gray-200 bg-white px-3 py-1.5 ${patchCls}`}>
          <span className="text-[11px] text-gray-500">{b.label}</span>
          {b.sub && <span className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[10px] text-gray-500">{b.sub}</span>}
        </div>,
      );
    case 'page-header':
      return wrap(
        <div className={`px-3 pt-2 pb-1 ${patchCls}`}>
          <p className="text-[14px] font-bold text-gray-800">{b.label}</p>
          {b.sub && <p className="mt-0.5 text-[10.5px] leading-relaxed text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'alert': {
      const toneCls =
        b.tone === 'error' ? 'border-2 border-gray-700 bg-gray-100'
        : b.tone === 'warn' ? 'border border-gray-500 bg-gray-100'
        : b.tone === 'ok' ? 'border border-gray-700 bg-gray-700'
        : 'border border-gray-300 bg-gray-50';
      const icon = b.tone === 'error' ? '✗' : b.tone === 'warn' ? '⚠' : b.tone === 'ok' ? '✓' : 'ℹ';
      const textCls = b.tone === 'ok' ? 'text-white' : 'text-gray-700';
      const subCls = b.tone === 'ok' ? 'text-gray-300' : 'text-gray-500';
      return wrap(
        <div className={`mx-3 my-1 rounded-md px-2.5 py-2 ${toneCls} ${patchCls}`}>
          <p className={`text-[11px] font-semibold ${textCls}`}>{icon} {b.label}</p>
          {b.sub && <p className={`mt-0.5 text-[10px] leading-relaxed ${subCls}`}>{b.sub}</p>}
        </div>,
      );
    }
    case 'stat-row':
      return wrap(
        <div className={`mx-3 my-1 flex gap-1.5 ${patchCls}`}>
          {(b.items ?? []).map((it, i) => (
            <div key={i} className="flex-1 rounded-md border border-gray-200 bg-gray-50 px-2 py-1.5 text-center">
              <p className="text-[11px] font-semibold text-gray-700">{it}</p>
            </div>
          ))}
        </div>,
      );
    case 'filter-bar':
      return wrap(
        <div className={`mx-3 my-1 flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 ${patchCls}`}>
          <span className="text-[11px] text-gray-400">🔍</span>
          <span className="text-[10.5px] text-gray-500">{b.label}</span>
        </div>,
      );
    case 'tabs':
      return wrap(
        <div className={`mx-3 my-1 flex flex-wrap gap-0 border-b border-gray-300 ${patchCls}`}>
          {(b.items ?? []).map((t, i) => {
            const stateId = b.tabStates?.[i];
            const active = i === (b.activeStep ?? 0);
            const canSwitch = !!(stateId && onSwitchState);
            return (
              <button
                key={i}
                type="button"
                disabled={!canSwitch}
                onClick={(e) => {
                  if (!canSwitch) return;
                  e.stopPropagation();
                  onSwitchState!(stateId!);
                }}
                className={`px-2.5 py-1.5 text-[10.5px] ${
                  active
                    ? 'border-b-2 border-gray-700 font-bold text-gray-800'
                    : canSwitch
                      ? 'cursor-pointer text-gray-400 hover:text-gray-700'
                      : 'text-gray-400'
                }`}
                title={canSwitch ? `切换到「${t}」` : undefined}
              >
                {t}
              </button>
            );
          })}
        </div>,
      );
    case 'steps':
      return wrap(
        <div className={`mx-3 my-1.5 flex items-center gap-0 ${patchCls}`}>
          {(b.items ?? []).map((s, i) => {
            const active = i === (b.activeStep ?? 0);
            const done = i < (b.activeStep ?? 0);
            return (
              <span key={i} className="flex flex-1 items-center">
                <span className="flex flex-col items-center gap-0.5">
                  <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[8px] font-bold ${
                    active ? 'bg-gray-700 text-white' : done ? 'bg-gray-400 text-white' : 'border border-gray-300 text-gray-400'
                  }`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <span className={`whitespace-nowrap text-[8.5px] ${active ? 'font-bold text-gray-700' : 'text-gray-400'}`}>{s}</span>
                </span>
                {i < (b.items!.length - 1) && <span className="mx-0.5 mb-3 h-px flex-1 bg-gray-300" />}
              </span>
            );
          })}
        </div>,
      );
    case 'table': {
      const rows = (b.items ?? []).map((r) => r.split('｜').map((c) => c.trim()));
      return wrap(
        <div className={`mx-3 my-1 overflow-hidden rounded-md border border-gray-300 ${patchCls}`}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-300 bg-gray-100">
                {(b.cols ?? []).map((c, i) => (
                  <th key={i} className="px-2 py-1 text-[9.5px] font-bold text-gray-500">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className={`border-b border-gray-100 last:border-0 ${clickable ? 'hover:bg-gray-100' : ''}`}>
                  {r.map((c, j) => (
                    <td key={j} className="px-2 py-1.5 text-[10px] leading-relaxed text-gray-600">
                      {c}{clickable && j === r.length - 1 && ' →'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
    }
    case 'form-row':
      return wrap(
        <div className={`mx-3 my-1 flex items-start gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 ${patchCls}`}>
          <span className="w-2/5 shrink-0 text-[10.5px] font-semibold leading-relaxed text-gray-600">{b.label}</span>
          <span className="min-w-0 flex-1 rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] leading-relaxed text-gray-500">{b.sub || '—'}</span>
        </div>,
      );
    case 'split':
      return wrap(
        <div className={`mx-3 my-1 flex gap-1.5 ${patchCls}`}>
          <div className="min-w-0 flex-1 rounded-md border border-gray-300 bg-gray-50 p-2">
            <p className="mb-1 border-b border-gray-200 pb-1 text-[10px] font-bold text-gray-600">{b.label}</p>
            {(b.items ?? []).map((it, i) => (
              <p key={i} className="py-0.5 text-[9.5px] leading-relaxed text-gray-500">{it}</p>
            ))}
          </div>
          <div className="min-w-0 flex-1 rounded-md border border-gray-300 bg-white p-2">
            <p className="mb-1 border-b border-gray-200 pb-1 text-[10px] font-bold text-gray-600">{b.sub}</p>
            {(b.right ?? []).map((it, i) => (
              <p key={i} className="py-0.5 text-[9.5px] leading-relaxed text-gray-500">{it}</p>
            ))}
          </div>
        </div>,
      );
    case 'tag-row':
      return wrap(
        <div className={`mx-3 my-1 space-y-1 ${patchCls}`}>
          {(b.items ?? []).map((t, i) => {
            const head = t.trim().charAt(0);
            const cls =
              head === '✓' ? 'bg-gray-700 text-white'
              : head === '✎' ? 'border border-gray-500 bg-white text-gray-600'
              : head === '✗' ? 'border border-gray-200 bg-gray-100 text-gray-400 line-through'
              : 'border border-dashed border-amber-500 bg-amber-50 text-amber-700';
            return (
              <div key={i} className={`rounded-md px-2 py-1 text-[10px] ${cls}`}>{t}</div>
            );
          })}
        </div>,
      );
    case 'calendar-grid': {
      const restDays = [5, 11, 18, 25];
      return wrap(
        <div className={`mx-3 my-1 rounded-md border border-gray-300 bg-gray-50 p-2 ${patchCls}`}>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 28 }).map((_, i) => {
              const day = i + 1;
              const cls =
                day === 3 ? 'bg-gray-700 text-white ring-2 ring-gray-400'
                : day === 12 ? 'border border-dashed border-amber-500 bg-amber-50 text-amber-700'
                : restDays.includes(day) ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-300 text-gray-600';
              return (
                <div key={i} className={`flex aspect-[4/3] flex-col items-center justify-center rounded-sm text-[8px] ${cls}`}>
                  <span className="font-bold">{day}</span>
                  <span>{day === 12 ? '兜底' : restDays.includes(day) ? '休' : '训练'}</span>
                </div>
              );
            })}
          </div>
          <p className="mt-1.5 text-[9px] text-gray-500">{b.label}</p>
          {b.sub && <p className="text-[9px] text-gray-400">{b.sub}</p>}
        </div>,
      );
    }
    case 'progress': {
      const m = (b.label ?? '').match(/(\d+)%/);
      const pct = m ? Math.min(100, Number(m[1])) : 40;
      return wrap(
        <div className={`mx-3 my-1 ${patchCls}`}>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full rounded-full bg-gray-600" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-gray-500">{b.label}</p>
        </div>,
      );
    }
    case 'panel':
      return wrap(
        <div
          className={`mx-3 my-1 flex flex-col items-center justify-center rounded-md border border-gray-300 bg-gray-100 px-3 py-3 text-center ${patchCls}`}
          style={{ minHeight: b.height ?? 72, ...(b.height && b.height > 100 ? crossBg : {}) }}
        >
          <p className="text-[11px] font-semibold text-gray-600">{b.label}</p>
          {b.sub && <p className="mt-0.5 text-[9.5px] leading-relaxed text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'button-primary':
      return wrap(
        <div className={`mx-3 my-1 inline-block rounded-md bg-gray-700 px-3.5 py-2 ${patchCls}`}>
          <p className="text-[11px] font-semibold text-white">{b.label}{clickable && ' →'}</p>
          {b.sub && <p className="text-[9px] text-gray-300">{b.sub}</p>}
        </div>,
      );
    case 'button-secondary':
      return wrap(
        <div className={`mx-3 my-1 inline-block rounded-md border border-gray-400 bg-white px-3 py-1.5 ${patchCls}`}>
          <p className="text-[10.5px] font-medium text-gray-600">{b.label}{clickable && ' →'}</p>
          {b.sub && <p className="text-[9px] text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'button-danger':
      return wrap(
        <div className={`mx-3 my-1 inline-block rounded-md border-2 border-gray-600 bg-white px-3 py-1.5 ${patchCls}`}>
          <p className="text-[10.5px] font-bold text-gray-700">{b.label}</p>
          {b.sub && <p className="text-[9px] text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'text':
      return wrap(
        <div className={`mx-3 my-1 ${patchCls}`}>
          <p className="text-[10.5px] leading-relaxed text-gray-500">{b.label}</p>
          {b.sub && <p className="text-[9px] text-gray-400">{b.sub}</p>}
        </div>,
      );
    case 'divider':
      return <div className="mx-3 my-1 border-t border-gray-200" />;
    case 'spacer':
      return <div style={{ height: b.height ?? 12 }} />;
    default:
      return null;
  }
}

// ——— 侧边栏 ———
function Sidebar({ active, screenId, onNavigate }: { active: string; screenId?: string; onNavigate: (id: string) => void }) {
  return (
    <div className="w-[118px] shrink-0 overflow-y-auto border-r border-gray-300 bg-gray-50 py-1.5">
      <p className="px-2 pb-1.5 text-[10px] font-bold text-gray-700">CC 管理后台</p>
      {MENU.map((g) => (
        <div key={g.group} className="mb-1">
          <p className="px-2 pt-1 text-[8.5px] font-bold uppercase text-gray-400">{g.group}</p>
          {g.items.map((it) => {
            const isActive = it.sid ? it.sid === screenId : (it.label === active || it.label.startsWith(active));
            return (
              <button
                key={it.label}
                onClick={it.sid ? () => onNavigate(it.sid!) : undefined}
                className={`block w-full truncate px-2 py-0.5 text-left text-[9.5px] ${
                  isActive ? 'bg-gray-700 font-bold text-white' : it.sid ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300'
                }`}
                title={it.sid ? `跳转到 ${it.sid}` : '后续批次'}
              >
                {it.label}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ——— 桌面浏览器框 ———
export function AdminFrame({
  screen,
  stateId,
  onNavigate,
  onSwitchState,
}: {
  screen: ScreenDef;
  stateId: string;
  onNavigate: (id: string) => void;
  onSwitchState?: (stateId: string) => void;
}) {
  const state = screen.states.find((s) => s.id === stateId) ?? screen.states[0];
  const blocks = state.blocks;
  const sidebarBlock = blocks.find((b) => b.kind === 'sidebar');
  const chromeBlock = blocks.find((b) => b.kind === 'chrome');
  const content = blocks.filter((b) => b.kind !== 'sidebar' && b.kind !== 'chrome');

  return (
    <div className="flex w-full max-w-[900px] flex-col overflow-hidden rounded-xl border-2 border-gray-700 bg-white shadow-xl" style={{ height: 640 }}>
      {chromeBlock ? (
        <BlockView block={chromeBlock} onNavigate={onNavigate} onSwitchState={onSwitchState} />
      ) : (
        <BlockView block={{ kind: 'chrome', label: `admin.cleancircle.cn/${screen.id.toLowerCase()}` }} onNavigate={onNavigate} onSwitchState={onSwitchState} />
      )}
      <div className="flex min-h-0 flex-1">
        {sidebarBlock && <Sidebar active={sidebarBlock.label ?? ''} screenId={screen.id} onNavigate={onNavigate} />}
        <div className="min-w-0 flex-1 overflow-y-auto py-1">
          {content.map((b, i) => (
            <BlockView key={i} block={b} onNavigate={onNavigate} onSwitchState={onSwitchState} />
          ))}
        </div>
      </div>
    </div>
  );
}
