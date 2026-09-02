import { useState } from 'react';
import {
  CHECKIN_BOUNDARY,
  CHECKIN_VS_ONBOARDING,
  CONFLICT_ORDER,
  FRAMEWORK_LAYERS,
  LIFECYCLE_BRANCHES,
  MAIN_QUESTIONS,
  ONBOARDING_VERSION,
  POSTPARTUM_DETAILS,
  PROFILE_EXAMPLE,
  PROFILE_OUTPUT,
  RULE_PRIORITY,
  TAG_MAPPINGS,
  V1_INTERACTION_RULES,
  type QuestionDef,
  type RuleType,
} from '../data/onboarding-config';
import { cn } from '../lib/utils';

type TabId = 'questions' | 'lifecycle' | 'postpartum' | 'mapping' | 'profile' | 'checkin';

const TABS: { id: TabId; label: string }[] = [
  { id: 'questions', label: '主问卷题目' },
  { id: 'lifecycle', label: '生命周期分支' },
  { id: 'postpartum', label: '产后恢复' },
  { id: 'mapping', label: '标签映射' },
  { id: 'profile', label: 'Profile 输出' },
  { id: 'checkin', label: 'Check-in 边界' },
];

function RuleBadge({ type }: { type: RuleType }) {
  const isHard = type.includes('Hard');
  const isContext = type.includes('Context');
  const cls = isHard
    ? 'bg-gray-800 text-white'
    : isContext
      ? 'bg-gray-500 text-white'
      : 'bg-gray-200 text-gray-700';
  return (
    <span className={cn('inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap', cls)}>
      {type}
    </span>
  );
}

function LayerBadge({ layer }: { layer: string }) {
  const colors: Record<string, string> = {
    A: 'bg-blue-100 text-blue-800',
    B: 'bg-green-100 text-green-800',
    C: 'bg-purple-100 text-purple-800',
    D: 'bg-pink-100 text-pink-800',
    E: 'bg-gray-100 text-gray-700',
  };
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-bold', colors[layer] ?? 'bg-gray-100')}>
      {layer}
    </span>
  );
}

function QuestionRow({ q, expanded, onToggle }: { q: QuestionDef; expanded: boolean; onToggle: () => void }) {
  return (
    <>
      <tr
        className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
        onClick={onToggle}
      >
        <td className="px-3 py-2 font-mono text-[11px] font-bold text-gray-800">{q.id}</td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            <LayerBadge layer={q.layer} />
            <span className="text-[12px] font-medium text-gray-800">{q.title}</span>
            {!q.required && <span className="text-[10px] text-gray-400">可跳过</span>}
          </div>
        </td>
        <td className="px-3 py-2 text-[11px] text-gray-500">{q.branch !== '否' ? q.branch : '—'}</td>
        <td className="px-3 py-2"><RuleBadge type={q.ruleType} /></td>
        <td className="px-3 py-2 text-[11px] text-gray-400">{expanded ? '▲' : '▼'}</td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="px-4 py-3">
            <div className="grid gap-3 md:grid-cols-2">
              <Detail label="选项" value={q.options} />
              <Detail label="后台字段" value={q.backendField} mono />
              <Detail label="生成用户标签" value={q.userTags} mono />
              <Detail label="匹配课程标签" value={q.courseTags} mono />
              <Detail label="备注" value={q.note} className="md:col-span-2" />
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function Detail({ label, value, mono, className }: { label: string; value: string; mono?: boolean; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
      <p className={cn('mt-0.5 text-[11px] leading-relaxed text-gray-700', mono && 'font-mono')}>{value}</p>
    </div>
  );
}

interface Props {
  embedded?: boolean;
}

export function OnboardingConfigView({ embedded }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('questions');
  const [expandedQ, setExpandedQ] = useState<string | null>('Q03');
  const [selectedBranch, setSelectedBranch] = useState<string>('L6');

  const branch = LIFECYCLE_BRANCHES.find((b) => b.id === selectedBranch) ?? LIFECYCLE_BRANCHES[0];

  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white shadow-sm', embedded ? '' : 'mx-auto max-w-[1200px]')}>
      {/* Header */}
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-gray-900">Onboarding 问卷配置</p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              NOT A PHASE Onboarding 问卷需求文档 V1（统一联动版）· 版本 {ONBOARDING_VERSION}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-gray-800 px-2.5 py-1 font-semibold text-white">15 主问题</span>
            <span className="rounded-full bg-gray-500 px-2.5 py-1 font-semibold text-white">9 生命周期分支</span>
            <span className="rounded-full bg-gray-200 px-2.5 py-1 font-semibold text-gray-700">3–5 分钟</span>
          </div>
        </div>

        {/* Rule priority */}
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <span className="text-[10px] font-bold text-gray-500">规则优先级：</span>
          {RULE_PRIORITY.map((r, i) => (
            <span key={r.name} className="flex items-center gap-1 text-[10px] text-gray-600">
              {i > 0 && <span className="text-gray-300">→</span>}
              <span className="font-semibold">{r.name}</span>
            </span>
          ))}
          <span className="ml-2 text-[10px] text-gray-400">冲突：{CONFLICT_ORDER}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-0 border-b border-gray-200 px-5">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-3 py-2.5 text-[12px] font-medium transition',
              activeTab === tab.id
                ? 'border-b-2 border-gray-800 text-gray-900'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-5">
        {/* Tab: 主问卷题目 */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="grid gap-2 sm:grid-cols-5">
              {FRAMEWORK_LAYERS.map((l) => (
                <div key={l.layer} className="rounded-lg border border-gray-200 bg-gray-50 p-2.5">
                  <div className="flex items-center gap-1.5">
                    <LayerBadge layer={l.layer} />
                    <span className="text-[11px] font-bold text-gray-700">{l.name}</span>
                  </div>
                  <p className="mt-1 text-[10px] leading-relaxed text-gray-500">{l.scope}</p>
                </div>
              ))}
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100">
                    {['ID', '题目', '分支', '规则类型', ''].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MAIN_QUESTIONS.map((q) => (
                    <QuestionRow
                      key={q.id}
                      q={q}
                      expanded={expandedQ === q.id}
                      onToggle={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              Q12 器械题 V1 已取消；Q04 次要目标可跳过。点击题目行展开选项、字段映射与备注。
            </div>
          </div>
        )}

        {/* Tab: 生命周期分支 */}
        {activeTab === 'lifecycle' && (
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="space-y-1">
              {LIFECYCLE_BRANCHES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBranch(b.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] transition',
                    selectedBranch === b.id
                      ? 'bg-gray-800 font-semibold text-white'
                      : 'text-gray-600 hover:bg-gray-100',
                  )}
                >
                  <span className="font-mono text-[11px]">{b.id}</span>
                  <span className="truncate">{b.name}</span>
                </button>
              ))}
            </div>
            <div className="rounded-xl border border-gray-200 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-sm font-bold text-gray-800">{branch.id}</span>
                <span className="text-base font-bold text-gray-900">{branch.name}</span>
                <RuleBadge type={branch.ruleType} />
              </div>
              <p className="mt-2 text-[11px] text-gray-500">
                <span className="font-semibold">触发：</span>{branch.trigger}
              </p>
              <p className="mt-1 text-[11px] text-gray-500">{branch.note}</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">追加问题（{branch.extraQuestions.length}）</p>
                  <ul className="mt-2 space-y-1">
                    {branch.extraQuestions.map((q) => (
                      <li key={q} className="rounded border border-gray-100 bg-gray-50 px-2 py-1 text-[11px] text-gray-700">{q}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">后台字段</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {branch.backendFields.map((f) => (
                      <span key={f} className="rounded bg-gray-100 px-2 py-0.5 font-mono text-[10px] text-gray-600">{f}</span>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase text-gray-400">用户标签</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {branch.userTags.map((t) => (
                      <span key={t} className="rounded bg-blue-50 px-2 py-0.5 font-mono text-[10px] text-blue-700">{t}</span>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] font-bold uppercase text-gray-400">课程约束</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {branch.courseConstraints.map((c) => (
                      <span key={c} className="rounded bg-purple-50 px-2 py-0.5 font-mono text-[10px] text-purple-700">{c}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: 产后恢复 */}
        {activeTab === 'postpartum' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-pink-200 bg-pink-50 px-3 py-2 text-[11px] text-pink-800">
              「产后恢复」作为 primary_goal 时，系统仍必须读取 life_stage 与安全字段。目标说明用户想得到什么；产后 Context 决定当前能安全做什么，两者不可合并为一个字段。
            </div>
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-100">
                    {['判断项', '建议选项', '规则输出', '课程匹配动作'].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {POSTPARTUM_DETAILS.map((row) => (
                    <tr key={row.item} className="border-b border-gray-100 last:border-0">
                      <td className="px-3 py-2 text-[12px] font-semibold text-gray-800">{row.item}</td>
                      <td className="px-3 py-2 text-[11px] text-gray-600">{row.options}</td>
                      <td className="px-3 py-2 font-mono text-[10px] text-gray-700">{row.ruleOutput}</td>
                      <td className="px-3 py-2 text-[11px] leading-relaxed text-gray-600">{row.courseAction}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: 标签映射 */}
        {activeTab === 'mapping' && (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  {['输入域', '用户标签', '课程标签', '匹配规则', '类型'].map((h) => (
                    <th key={h} className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TAG_MAPPINGS.map((m) => (
                  <tr key={m.inputDomain} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                    <td className="px-3 py-2 text-[12px] font-semibold text-gray-800">{m.inputDomain}</td>
                    <td className="px-3 py-2 font-mono text-[10px] text-blue-700">{m.userTag}</td>
                    <td className="px-3 py-2 font-mono text-[10px] text-purple-700">{m.courseTag}</td>
                    <td className="px-3 py-2 text-[11px] text-gray-600">{m.ruleSummary}</td>
                    <td className="px-3 py-2"><RuleBadge type={m.ruleType} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Profile 输出 */}
        {activeTab === 'profile' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-3">
              <p className="text-sm font-bold text-gray-800">User Training Profile 字段组</p>
              {PROFILE_OUTPUT.map((g) => (
                <div key={g.group} className="rounded-lg border border-gray-200 p-3">
                  <p className="text-[11px] font-bold text-gray-700">{g.group}</p>
                  <p className="mt-1 font-mono text-[10px] text-gray-600">{g.example}</p>
                  <p className="mt-1 text-[10px] text-gray-400">{g.requirement}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">示例 Profile JSON</p>
              <pre className="mt-2 overflow-x-auto rounded-lg border border-gray-200 bg-gray-900 p-4 text-[11px] leading-relaxed text-green-300">
                {JSON.stringify(PROFILE_EXAMPLE, null, 2)}
              </pre>
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-[11px] font-bold text-gray-700">V1 交互原则</p>
                <div className="mt-2 space-y-2">
                  {V1_INTERACTION_RULES.map((r) => (
                    <div key={r.item} className="border-b border-gray-100 pb-2 last:border-0">
                      <p className="text-[11px] font-semibold text-gray-700">{r.item}</p>
                      <p className="text-[10px] text-gray-500">{r.value}</p>
                      <p className="text-[10px] text-gray-400">验收：{r.acceptance}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Check-in 边界 */}
        {activeTab === 'checkin' && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {CHECKIN_VS_ONBOARDING.map((block) => (
                <div key={block.category} className="rounded-lg border border-gray-200 p-3">
                  <p className="text-[12px] font-bold text-gray-800">{block.category}</p>
                  <ul className="mt-2 space-y-1">
                    {block.items.map((item) => (
                      <li key={item} className="text-[11px] text-gray-600">• {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoCard title="Check-in 输入" items={CHECKIN_BOUNDARY.inputs} />
              <InfoCard title="当日输出" items={CHECKIN_BOUNDARY.outputs} />
              <InfoCard title="可临时调整" items={CHECKIN_BOUNDARY.canAdjust} tone="ok" />
              <InfoCard title="不可覆盖" items={CHECKIN_BOUNDARY.cannotOverride} tone="warn" />
            </div>

            <div className="rounded-lg border-2 border-gray-700 bg-gray-50 px-4 py-3">
              <p className="text-[11px] font-bold text-gray-800">合并逻辑</p>
              <p className="mt-1 text-[12px] leading-relaxed text-gray-700">{CHECKIN_BOUNDARY.mergeLogic}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard({ title, items, tone }: { title: string; items: string[]; tone?: 'ok' | 'warn' }) {
  const border = tone === 'ok' ? 'border-green-200' : tone === 'warn' ? 'border-amber-200' : 'border-gray-200';
  return (
    <div className={cn('rounded-lg border p-3', border)}>
      <p className="text-[11px] font-bold text-gray-700">{title}</p>
      <ul className="mt-2 space-y-0.5">
        {items.map((item) => (
          <li key={item} className="text-[10px] text-gray-600">• {item}</li>
        ))}
      </ul>
    </div>
  );
}
