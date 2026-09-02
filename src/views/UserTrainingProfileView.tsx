import { useMemo, useState } from 'react';
import {
  RULE_TYPE_GLOSSARY,
  TAG_MAPPINGS,
  type RuleType,
} from '../data/onboarding-config';
import { USER_ONBOARDING_SAMPLES } from '../data/user-onboarding-samples';
import {
  deriveCourseTags,
  deriveUserProfile,
  deriveUserTags,
  formatProfileJson,
  getDerivationRules,
  getTagLineage,
  runSampleDerivations,
  type TagLineage,
  type UserTrainingProfile,
} from '../lib/derive-user-profile';
import { cn } from '../lib/utils';

type TabId = 'user' | 'derivation';

function RuleBadge({ type }: { type: RuleType }) {
  const g = RULE_TYPE_GLOSSARY[type];
  const isHard = type.includes('Hard');
  const isContext = type.includes('Context');
  const cls = isHard
    ? 'bg-gray-800 text-white'
    : isContext
      ? 'bg-gray-500 text-white'
      : 'bg-gray-200 text-gray-700';
  return (
    <span className={cn('inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold whitespace-nowrap', cls)} title={g?.desc}>
      {g?.short ?? type}
    </span>
  );
}

function Chip({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray' | 'blue' | 'green' }) {
  const cls =
    tone === 'blue' ? 'bg-blue-50 text-blue-800 border-blue-100'
    : tone === 'green' ? 'bg-emerald-50 text-emerald-800 border-emerald-100'
    : 'bg-gray-100 text-gray-700 border-gray-200';
  return (
    <span className={cn('inline-block rounded border px-1.5 py-0.5 text-[10px] font-mono', cls)}>{children}</span>
  );
}

const PROFILE_GROUPS = ['基础', '目标', '能力', '限制', '偏好', '生命周期', '系统元数据'] as const;

function groupLineage(lineage: TagLineage[]) {
  const map = new Map<string, TagLineage[]>();
  lineage.forEach((l) => {
    const g = l.profileGroup;
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(l);
  });
  return map;
}

function profileFieldsByGroup(profile: UserTrainingProfile): Record<string, { label: string; value: string }[]> {
  return {
    基础: [
      { label: 'age_band', value: profile.age_band },
      { label: 'bmi_band', value: profile.bmi_band },
    ],
    目标: [
      { label: 'primary_goal', value: profile.primary_goal },
      ...(profile.secondary_goal ? [{ label: 'secondary_goal', value: profile.secondary_goal }] : []),
    ],
    能力: [
      { label: 'fitness_capacity', value: profile.fitness_capacity },
      { label: 'jump_tolerance', value: profile.jump_tolerance },
    ],
    限制: profile.movement_limitations.length
      ? profile.movement_limitations.map((m) => ({ label: `constraint.${m.area}`, value: m.severity }))
      : [{ label: 'movement_limitations', value: '无' }],
    偏好: [
      { label: 'preferred_duration_min', value: profile.preferred_duration_min.join(', ') },
      { label: 'planned_days_per_week', value: String(profile.planned_days_per_week) },
      { label: 'preferred_formats', value: profile.preferred_formats.join(', ') },
      { label: 'avoid_formats', value: profile.avoid_formats.join(', ') || '无' },
    ],
    生命周期: [
      { label: 'life_stage', value: profile.life_stage },
      ...(profile.last_period_date ? [{ label: 'last_period_date', value: profile.last_period_date }] : []),
      ...(profile.cycle_context ? [{ label: 'cycle_context', value: profile.cycle_context }] : []),
      ...(profile.postpartum_weeks ? [{ label: 'postpartum_weeks', value: profile.postpartum_weeks }] : []),
      ...(profile.postpartum_clearance ? [{ label: 'postpartum_clearance', value: profile.postpartum_clearance }] : []),
    ],
    系统元数据: [
      { label: 'profile_version', value: profile.profile_version },
      { label: 'completed_at', value: profile.completed_at },
      { label: 'consent_version', value: profile.consent_version },
    ],
  };
}

interface Props {
  embedded?: boolean;
  initialUserId?: string;
  initialTab?: TabId;
  onNavigateToOnboarding?: () => void;
}

export function UserTrainingProfileView({
  embedded,
  initialUserId,
  initialTab = 'user',
  onNavigateToOnboarding,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);
  const [selectedUserId, setSelectedUserId] = useState(
    initialUserId ?? USER_ONBOARDING_SAMPLES[0]?.userId ?? 'U-08771',
  );
  const [sampleRun, setSampleRun] = useState(false);
  const [expandedJsonUser, setExpandedJsonUser] = useState<string | null>(null);

  const submission = useMemo(
    () => USER_ONBOARDING_SAMPLES.find((s) => s.userId === selectedUserId) ?? USER_ONBOARDING_SAMPLES[0],
    [selectedUserId],
  );

  const profile = useMemo(() => (submission ? deriveUserProfile(submission) : null), [submission]);
  const lineage = useMemo(() => (submission ? getTagLineage(submission) : []), [submission]);
  const userTags = useMemo(() => (submission ? deriveUserTags(submission) : []), [submission]);
  const courseTags = useMemo(() => (submission ? deriveCourseTags(submission) : []), [submission]);
  const grouped = useMemo(() => groupLineage(lineage), [lineage]);
  const fieldsByGroup = useMemo(() => (profile ? profileFieldsByGroup(profile) : {}), [profile]);

  const derivationRules = useMemo(() => getDerivationRules(), []);
  const sampleResults = useMemo(
    () => (sampleRun ? runSampleDerivations(USER_ONBOARDING_SAMPLES) : []),
    [sampleRun],
  );

  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white shadow-sm', embedded ? '' : 'mx-auto max-w-[1200px]')}>
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">用户与 CRM · 问卷评测</p>
            <h2 className="text-lg font-bold text-gray-900">用户训练档案与标签</h2>
            <p className="mt-1 text-[11px] text-gray-500">
              问卷完成后推导的训练档案标签与排课课程标签；营销 CRM 标签（如「大基数」）与此分离，不可自由创建健康标签。
            </p>
          </div>
          {onNavigateToOnboarding && (
            <button
              type="button"
              onClick={onNavigateToOnboarding}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
            >
              查看 Onboarding 配置 →
            </button>
          )}
        </div>
        <div className="mt-4 flex gap-1 border-b border-gray-100">
          {([
            { id: 'user' as const, label: '用户档案（B19）' },
            { id: 'derivation' as const, label: 'Profile 推导（B10）' },
          ]).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2 text-[12px] font-medium transition',
                activeTab === tab.id
                  ? 'border-b-2 border-gray-800 text-gray-900'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        {activeTab === 'user' && submission && profile && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className={cn('mb-1 text-[10px] font-bold uppercase text-gray-500')}>选择用户</p>
                <select
                  className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[12px] text-gray-800"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  {USER_ONBOARDING_SAMPLES.map((s) => (
                    <option key={s.userId} value={s.userId}>
                      {s.userId} · {s.nickname}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-[11px] text-gray-500">
                <p>问卷版本：<span className="font-mono text-gray-800">{submission.questionnaireVersion}</span></p>
                <p>完成时间：<span className="font-mono text-gray-800">{submission.completedAt.slice(0, 10)}</span></p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
              <p className="text-[10px] font-bold uppercase text-gray-500">实际答题路径</p>
              <p className="mt-1 font-mono text-[10px] leading-relaxed text-gray-700">
                {submission.pathTaken.join(' → ')}
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50/40 p-3">
                <p className="text-[11px] font-bold text-blue-900">用户标签（{userTags.length}）</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {userTags.map((t) => (
                    <Chip key={t.key} tone="blue">{t.label}</Chip>
                  ))}
                </div>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-3">
                <p className="text-[11px] font-bold text-emerald-900">课程标签（排课用 · {courseTags.length}）</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {courseTags.map((t) => (
                    <Chip key={t.key} tone="green">{t.label}</Chip>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[12px] font-bold text-gray-800">Profile 字段分组</p>
              {PROFILE_GROUPS.map((group) => {
                const fields = fieldsByGroup[group];
                const groupTags = grouped.get(group === '系统元数据' ? '基础' : group) ?? grouped.get(group) ?? [];
                if (!fields?.length && groupTags.length === 0 && group !== '系统元数据') return null;
                return (
                  <div key={group} className="rounded-lg border border-gray-200 p-3">
                    <p className="text-[11px] font-bold text-gray-700">{group}</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {(fields ?? []).map((f) => (
                        <div key={f.label} className="rounded border border-gray-100 bg-gray-50 px-2 py-1.5">
                          <p className="font-mono text-[9px] text-gray-400">{f.label}</p>
                          <p className="text-[11px] font-medium text-gray-800">{f.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div>
              <p className="text-[12px] font-bold text-gray-800">标签血缘表</p>
              <p className="text-[10px] text-gray-500">每条标签可追溯到来源题目与用户答案</p>
              <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-[720px] text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100">
                      {['输入域', 'Profile 字段', '用户标签', '课程标签', '来源题', '用户答案', '规则'].map((h) => (
                        <th key={h} className="px-2 py-2 text-[10px] font-bold uppercase text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {lineage.map((l, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-2 py-1.5 text-gray-600">{l.inputDomain}</td>
                        <td className="px-2 py-1.5 font-mono text-gray-800">{l.field}</td>
                        <td className="px-2 py-1.5"><Chip tone="blue">{l.userTag}</Chip></td>
                        <td className="px-2 py-1.5">
                          <div className="flex flex-wrap gap-0.5">
                            {l.courseTags.length === 0
                              ? <span className="text-gray-400">—</span>
                              : l.courseTags.map((c) => <Chip key={c} tone="green">{c}</Chip>)}
                          </div>
                        </td>
                        <td className="px-2 py-1.5 font-mono font-semibold text-gray-800">{l.sourceQuestionId}</td>
                        <td className="max-w-[140px] px-2 py-1.5 text-gray-600">{l.sourceAnswer}</td>
                        <td className="px-2 py-1.5"><RuleBadge type={l.ruleType} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <details className="rounded-lg border border-gray-200 bg-gray-50 p-3">
              <summary className="cursor-pointer text-[11px] font-bold text-gray-700">Profile JSON（只读）</summary>
              <pre className="mt-2 overflow-x-auto rounded bg-white p-3 font-mono text-[10px] text-gray-700">
                {formatProfileJson(profile)}
              </pre>
            </details>
          </div>
        )}

        {activeTab === 'derivation' && (
          <div className="space-y-5">
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
              训练档案标签只能由问卷 / Profile 推导产生，禁止在 CRM 自由创建「大基数友好」「PCOS 友好」等健康标签（见 B17 设计）。
            </div>

            <div>
              <p className="text-[12px] font-bold text-gray-800">推导规则总览</p>
              <p className="text-[10px] text-gray-500">来自主问卷 Q01–Q15 与生命周期分支 L1–L9</p>
              <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100">
                      {['目标字段', '来源', '规则类型', '用户标签说明'].map((h) => (
                        <th key={h} className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {derivationRules.map((r, i) => (
                      <tr key={i} className="border-b border-gray-100">
                        <td className="px-3 py-2 font-mono text-gray-800">{r.field}</td>
                        <td className="px-3 py-2 font-mono font-semibold">{r.source}</td>
                        <td className="px-3 py-2"><RuleBadge type={r.ruleType} /></td>
                        <td className="px-3 py-2 text-gray-600">{r.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <p className="text-[12px] font-bold text-gray-800">标签映射表（TAG_MAPPINGS）</p>
              <div className="mt-2 overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-100">
                      {['输入域', '用户标签', '课程标签', '规则'].map((h) => (
                        <th key={h} className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TAG_MAPPINGS.map((m) => (
                      <tr key={m.inputDomain} className="border-b border-gray-100">
                        <td className="px-3 py-2 text-gray-700">{m.inputDomain}</td>
                        <td className="px-3 py-2 font-mono text-[10px] text-gray-600">{m.userTag}</td>
                        <td className="px-3 py-2 font-mono text-[10px] text-gray-600">{m.courseTag}</td>
                        <td className="px-3 py-2"><RuleBadge type={m.ruleType} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-[12px] font-bold text-gray-800">样本用户批量推导</p>
                <button
                  type="button"
                  onClick={() => setSampleRun(true)}
                  className="rounded-md bg-gray-800 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-gray-700"
                >
                  运行全部样本
                </button>
              </div>
              {sampleRun && (
                <div className="mt-2 space-y-2">
                  {sampleResults.map((r) => (
                    <div key={r.userId} className="rounded-lg border border-gray-200 p-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold">{r.userId}</span>
                        <span className="text-[12px] text-gray-700">{r.nickname}</span>
                        <span className={cn(
                          'rounded px-1.5 py-0.5 text-[10px] font-semibold',
                          r.status === 'ok' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
                        )}>
                          {r.status === 'ok' ? '✓ 推导完整' : '⚠ 需检查'}
                        </span>
                        <span className="text-[10px] text-gray-500">{r.lineageCount} 条标签血缘</span>
                        <button
                          type="button"
                          onClick={() => setExpandedJsonUser(expandedJsonUser === r.userId ? null : r.userId)}
                          className="ml-auto text-[10px] text-gray-500 underline"
                        >
                          {expandedJsonUser === r.userId ? '收起 JSON' : '展开 JSON'}
                        </button>
                      </div>
                      <p className="mt-1 font-mono text-[10px] text-gray-600">
                        primary_goal={r.profile.primary_goal} · capacity={r.profile.fitness_capacity} · life_stage={r.profile.life_stage}
                        {r.profile.movement_limitations.length > 0 && ` · limitations=${r.profile.movement_limitations.map((x) => x.area).join(',')}`}
                      </p>
                      {r.statusNote && <p className="mt-1 text-[10px] text-amber-700">{r.statusNote}</p>}
                      {expandedJsonUser === r.userId && (
                        <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-2 font-mono text-[9px] text-gray-700">
                          {formatProfileJson(r.profile)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
