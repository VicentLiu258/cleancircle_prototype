import { decisions, pendingQuestions } from '../../data/mobile/decisions';

interface Props {
  onNavigate: (screenId: string) => void;
}

export function DecisionsView({ onNavigate }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-800">逻辑补全决策（B-01 … B-14）</h2>
      <p className="mt-1 text-sm text-gray-500">
        以下为需求文档中冲突/缺失之处，原型按当前方案固化。仍待确认的补全项以 <span className="rounded bg-amber-100 px-1 font-bold text-amber-700">amber「补」</span> 标记区分；B-06/B-07 已按 2026-08-27 确认脑图更新。
      </p>
      <div className="mt-4 space-y-4">
        {decisions.map((d) => (
          <div key={d.id} className="rounded-lg border border-dashed border-amber-400 bg-white p-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded bg-amber-400 px-2 py-0.5 font-mono text-sm font-bold text-white">{d.id}</span>
              <span className="text-base font-bold text-gray-800">{d.title}</span>
              <span className="ml-auto rounded border border-amber-300 bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">{d.status}</span>
            </div>
            <dl className="mt-3 space-y-2 text-[13px] leading-relaxed">
              <div><dt className="font-bold text-gray-500">问题</dt><dd className="text-gray-700">{d.question}</dd></div>
              <div><dt className="font-bold text-gray-500">文档原文冲突 / 缺失</dt><dd className="text-gray-700">{d.conflict}</dd></div>
              <div><dt className="font-bold text-amber-700">原型采用的决策</dt><dd className="rounded bg-amber-50 px-2 py-1 text-gray-800">{d.decision}</dd></div>
              <div><dt className="font-bold text-gray-500">理由</dt><dd className="text-gray-700">{d.reason}</dd></div>
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] text-gray-400">影响屏幕：</span>
              {d.screens.map((sid) => (
                <button
                  key={sid}
                  onClick={() => onNavigate(sid)}
                  className="rounded border border-gray-300 bg-gray-50 px-2 py-0.5 font-mono text-[12px] text-gray-700 hover:bg-gray-700 hover:text-white"
                >
                  {sid} →
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 text-2xl font-bold text-gray-800">待业务确认清单（M-Q01 … M-Q10）</h2>
      <p className="mt-1 text-sm text-gray-500">来自需求文档 §11，附原型当前占位方案。</p>
      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[12px] text-gray-500">
              <th className="px-4 py-2.5 font-bold">编号</th>
              <th className="px-4 py-2.5 font-bold">问题</th>
              <th className="px-4 py-2.5 font-bold">对原型/开发的影响</th>
              <th className="px-4 py-2.5 font-bold">原型占位方案</th>
            </tr>
          </thead>
          <tbody>
            {pendingQuestions.map((q) => (
              <tr key={q.id} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2.5 font-mono font-bold text-gray-700">{q.id}</td>
                <td className="px-4 py-2.5 text-gray-700">{q.question}</td>
                <td className="px-4 py-2.5 text-gray-500">{q.impact}</td>
                <td className="px-4 py-2.5 text-gray-600">{q.placeholder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
