import { useState } from 'react';
import { screens, screenMap, groupByFlow } from '../../data/mobile';
import { FLOW_NAMES, FLOW_ORDER } from '../../data/mobile/types';
import { PhoneFrame } from '../../components/MobileWireframe';

interface Props {
  screenId: string;
  onNavigate: (screenId: string) => void;
  onShowDecisions: () => void;
}

// 把含 Sxx 的文本渲染成可点击引用
function ScreenRefs({ text, onNavigate }: { text: string; onNavigate: (id: string) => void }) {
  const parts = text.split(/(S\d{2})/g);
  return (
    <>
      {parts.map((p, i) =>
        /^S\d{2}$/.test(p) && screenMap[p] ? (
          <button key={i} onClick={() => onNavigate(p)} className="font-mono text-gray-800 underline decoration-gray-400 hover:bg-gray-200">
            {p}
          </button>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 px-4 py-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <div className="mt-1 text-[13px] leading-relaxed text-gray-700">{children}</div>
    </div>
  );
}

export function ScreensView({ screenId, onNavigate, onShowDecisions }: Props) {
  const screen = screenMap[screenId] ?? screens[0];
  const [stateId, setStateId] = useState(screen.states[0].id);
  const curState = screen.states.find((s) => s.id === stateId) ?? screen.states[0];
  const groups = groupByFlow(screens);
  const a = screen.annotations;

  const selectScreen = (id: string) => {
    onNavigate(id);
    setStateId((screenMap[id] ?? screens[0]).states[0].id);
  };

  return (
    <div className="flex h-full min-h-0">
      {/* 左栏：屏幕列表 */}
      <aside className="w-56 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 py-3">
        {FLOW_ORDER.map((f) => (
          <div key={f} className="mb-3">
            <p className="px-3 py-1 text-[11px] font-bold text-gray-400">{FLOW_NAMES[f]}</p>
            {(groups.get(f) ?? []).map((s) => (
              <button
                key={s.id}
                onClick={() => selectScreen(s.id)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] ${
                  s.id === screen.id ? 'bg-gray-700 font-semibold text-white' : 'text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="font-mono text-[11px]">{s.id}</span>
                <span className="min-w-0 flex-1 truncate">{s.name}</span>
                <span className={`rounded px-1 text-[10px] ${s.priority === 'P0' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-600'} ${s.id === screen.id ? '!bg-white !text-gray-700' : ''}`}>
                  {s.priority}
                </span>
              </button>
            ))}
          </div>
        ))}
      </aside>

      {/* 中栏：手机线框 */}
      <main className="flex min-w-0 flex-1 flex-col items-center overflow-y-auto bg-gray-100 py-5">
        <div className="flex flex-wrap items-center justify-center gap-2 px-4">
          <span className="font-mono text-lg font-bold text-gray-800">{screen.id}</span>
          <span className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-[11px] text-gray-500">{screen.reqCode}</span>
          <span className="text-lg font-semibold text-gray-700">{screen.name}</span>
          <span className={`rounded px-1.5 py-0.5 text-[11px] font-bold ${screen.priority === 'P0' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-600'}`}>
            {screen.priority}
          </span>
        </div>
        {screen.states.length > 1 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1.5 px-4">
            {screen.states.map((st) => (
              <button
                key={st.id}
                onClick={() => setStateId(st.id)}
                className={`rounded-full border px-2.5 py-1 text-[11px] ${
                  st.id === curState.id
                    ? 'border-gray-700 bg-gray-700 text-white'
                    : 'border-gray-300 bg-white text-gray-500 hover:border-gray-500'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4">
          <PhoneFrame screen={screen} stateId={curState.id} onNavigate={selectScreen} />
        </div>
        <p className="mt-3 text-[11px] text-gray-400">带 → 的按钮可点击跳转 · 灰色圆点数字对应右栏标注 · amber 虚线 = 产品补全</p>
      </main>

      {/* 右栏：标注面板 */}
      <aside className="w-80 shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-sm font-bold text-gray-700">业务标注 · {screen.id} {screen.name}</p>
        </div>
        <Field label="页面目标">{a.goal}</Field>
        <Field label="入口 / 出口">
          <p><span className="text-gray-400">入口：</span><ScreenRefs text={a.entry} onNavigate={selectScreen} /></p>
          <p className="mt-1">
            <span className="text-gray-400">出口：</span>
            {a.exit.length === 0 ? '（无页面出口，内容为终点）' : a.exit.map((e, i) => (
              <span key={e}>
                {i > 0 && '、'}
                <button onClick={() => selectScreen(e)} className="font-mono text-gray-800 underline decoration-gray-400 hover:bg-gray-200">{e}</button>
              </span>
            ))}
          </p>
        </Field>
        <Field label="角色">{a.role}</Field>
        <Field label="主数据字段与来源">
          <ul className="list-disc space-y-0.5 pl-4">
            {a.data.map((d, i) => <li key={i}><ScreenRefs text={d} onNavigate={selectScreen} /></li>)}
          </ul>
        </Field>
        <Field label="操作">
          <p><span className="font-semibold">主操作：</span><ScreenRefs text={a.actions.primary} onNavigate={selectScreen} /></p>
          {a.actions.secondary.length > 0 && (
            <p className="mt-1"><span className="font-semibold">次操作：</span>{a.actions.secondary.join('；')}</p>
          )}
          {a.actions.destructive && a.actions.destructive !== '无' && (
            <p className="mt-1 rounded border border-gray-400 bg-gray-100 px-2 py-1 text-[12px]">
              <span className="font-bold">破坏性操作：</span>{a.actions.destructive}
            </p>
          )}
        </Field>
        <Field label="状态">
          <div className="flex flex-wrap gap-1">
            {a.statesDesc.map((s, i) => (
              <span key={i} className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-600">{s}</span>
            ))}
          </div>
        </Field>
        <Field label="触发规则与跳转">
          <ul className="list-disc space-y-0.5 pl-4">
            {a.triggers.map((t, i) => <li key={i}><ScreenRefs text={t} onNavigate={selectScreen} /></li>)}
          </ul>
        </Field>
        <Field label="后台依赖">
          <ul className="list-disc space-y-0.5 pl-4">
            {a.deps.map((d, i) => <li key={i}>{d}</li>)}
          </ul>
        </Field>
        <div className={`px-4 py-3 ${a.patches.length > 0 ? 'bg-amber-50' : ''}`}>
          <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">补全标记</p>
          {a.patches.length === 0 ? (
            <p className="mt-1 text-[13px] text-gray-400">全部为原始需求，无产品补全。</p>
          ) : (
            <div className="mt-1 flex flex-wrap gap-1.5">
              {a.patches.map((p) => (
                <button
                  key={p}
                  onClick={onShowDecisions}
                  className="rounded border border-dashed border-amber-500 bg-amber-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-amber-700 hover:bg-amber-200"
                  title="查看逻辑补全说明"
                >
                  {p} 补
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
