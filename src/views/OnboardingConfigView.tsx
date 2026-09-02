import { useCallback, useMemo, useState } from 'react';
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
  RULE_TYPE_GLOSSARY,
  TAG_MAPPINGS,
  V1_INTERACTION_RULES,
  getRuleTypeLabel,
  type LifecycleBranch,
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

const LAYERS: QuestionDef['layer'][] = ['A', 'B', 'C', 'D', 'E'];

const inputCls = 'w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-[11px] text-gray-800 outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-400';
const textareaCls = 'w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 font-mono text-[11px] text-gray-800 outline-none focus:border-gray-600 focus:ring-1 focus:ring-gray-400';
const labelCls = 'mb-1 block text-[10px] font-bold uppercase tracking-wide text-gray-500';

function cloneQuestions(): QuestionDef[] {
  return JSON.parse(JSON.stringify(MAIN_QUESTIONS)) as QuestionDef[];
}

function cloneBranches(): LifecycleBranch[] {
  return JSON.parse(JSON.stringify(LIFECYCLE_BRANCHES)) as LifecycleBranch[];
}

function linesToArray(text: string): string[] {
  return text.split('\n').map((s) => s.trim()).filter(Boolean);
}

function arrayToLines(items: string[]): string {
  return items.join('\n');
}

function RuleBadge({ type, showLabel }: { type: RuleType; showLabel?: boolean }) {
  const g = RULE_TYPE_GLOSSARY[type];
  const isHard = type.includes('Hard');
  const isContext = type.includes('Context');
  const cls = isHard
    ? 'bg-gray-800 text-white'
    : isContext
      ? 'bg-gray-500 text-white'
      : 'bg-gray-200 text-gray-700';
  return (
    <span
      className={cn('inline-block rounded px-1.5 py-0.5 text-[10px] font-semibold whitespace-nowrap', cls)}
      title={[g?.desc, g?.devNote].filter(Boolean).join('\n\n')}
    >
      {showLabel ? g?.label ?? type : type}
      {!showLabel && g?.short && (
        <span className={cn('ml-1 font-normal opacity-90', isHard || isContext ? 'text-gray-300' : 'text-gray-500')}>
          {g.short}
        </span>
      )}
    </span>
  );
}

function RuleTypeLegend({ compact }: { compact?: boolean }) {
  const types = Object.keys(RULE_TYPE_GLOSSARY) as RuleType[];
  if (compact) {
    return (
      <div className="mt-2 flex flex-wrap gap-1.5">
        {types.map((t) => (
          <RuleBadge key={t} type={t} showLabel />
        ))}
      </div>
    );
  }
  return (
    <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3">
      <p className="text-[11px] font-bold text-gray-800">规则类型说明（研发对照）</p>
      <p className="mt-0.5 text-[10px] text-gray-500">
        冲突优先级：Hard Filter &gt; Context &gt; Soft Preference；组合类型表示同一字段可能同时参与多层规则。
      </p>
      <div className="mt-2 space-y-2">
        {types.map((t) => {
          const g = RULE_TYPE_GLOSSARY[t];
          return (
            <div key={t} className="rounded-md border border-gray-100 bg-gray-50 px-2.5 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <RuleBadge type={t} showLabel />
                <span className="text-[10px] text-gray-600">{g.desc}</span>
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-gray-400">研发：{g.devNote}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RuleTypeSelect({
  value,
  onChange,
}: {
  value: RuleType;
  onChange: (v: RuleType) => void;
}) {
  const types = Object.keys(RULE_TYPE_GLOSSARY) as RuleType[];
  return (
    <div>
      <select
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value as RuleType)}
      >
        {types.map((t) => (
          <option key={t} value={t} title={RULE_TYPE_GLOSSARY[t].desc}>
            {getRuleTypeLabel(t)}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[10px] leading-relaxed text-gray-500">{RULE_TYPE_GLOSSARY[value].desc}</p>
      <p className="text-[10px] leading-relaxed text-gray-400">研发：{RULE_TYPE_GLOSSARY[value].devNote}</p>
    </div>
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

function FormField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function EditToolbar({
  onSave,
  onCancel,
  dirty,
}: {
  onSave: () => void;
  onCancel: () => void;
  dirty?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3">
      <button
        type="button"
        onClick={onSave}
        className="rounded-md bg-gray-800 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-gray-700"
      >
        保存
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[11px] font-medium text-gray-600 hover:bg-gray-50"
      >
        取消
      </button>
      {dirty && <span className="text-[10px] text-amber-600">· 有未保存修改</span>}
    </div>
  );
}

function QuestionEditForm({
  draft,
  onChange,
  onSave,
  onCancel,
  dirty,
}: {
  draft: QuestionDef;
  onChange: (next: QuestionDef) => void;
  onSave: () => void;
  onCancel: () => void;
  dirty: boolean;
}) {
  return (
    <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
      <div className="grid gap-3 md:grid-cols-2">
        <FormField label="题目标题">
          <input
            className={inputCls}
            value={draft.title}
            onChange={(e) => onChange({ ...draft, title: e.target.value })}
          />
        </FormField>
        <div className="grid grid-cols-2 gap-2">
          <FormField label="层级">
            <select
              className={inputCls}
              value={draft.layer}
              onChange={(e) => onChange({ ...draft, layer: e.target.value as QuestionDef['layer'] })}
            >
              {LAYERS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </FormField>
          <FormField label="规则类型">
            <RuleTypeSelect
              value={draft.ruleType}
              onChange={(ruleType) => onChange({ ...draft, ruleType })}
            />
          </FormField>
        </div>
        <FormField label="选项" className="md:col-span-2">
          <textarea
            className={textareaCls}
            rows={2}
            value={draft.options}
            onChange={(e) => onChange({ ...draft, options: e.target.value })}
          />
        </FormField>
        <FormField label="分支条件">
          <input
            className={inputCls}
            value={draft.branch}
            onChange={(e) => onChange({ ...draft, branch: e.target.value })}
          />
        </FormField>
        <FormField label="必填">
          <label className="flex items-center gap-2 text-[11px] text-gray-700">
            <input
              type="checkbox"
              checked={draft.required}
              onChange={(e) => onChange({ ...draft, required: e.target.checked })}
            />
            {draft.required ? '必填' : '可跳过'}
          </label>
        </FormField>
        <FormField label="后台字段">
          <input
            className={cn(inputCls, 'font-mono')}
            value={draft.backendField}
            onChange={(e) => onChange({ ...draft, backendField: e.target.value })}
          />
        </FormField>
        <FormField label="生成用户标签">
          <textarea
            className={textareaCls}
            rows={2}
            value={draft.userTags}
            onChange={(e) => onChange({ ...draft, userTags: e.target.value })}
          />
        </FormField>
        <FormField label="匹配课程标签" className="md:col-span-2">
          <textarea
            className={textareaCls}
            rows={2}
            value={draft.courseTags}
            onChange={(e) => onChange({ ...draft, courseTags: e.target.value })}
          />
        </FormField>
        <FormField label="备注" className="md:col-span-2">
          <textarea
            className={textareaCls}
            rows={2}
            value={draft.note}
            onChange={(e) => onChange({ ...draft, note: e.target.value })}
          />
        </FormField>
      </div>
      <EditToolbar onSave={onSave} onCancel={onCancel} dirty={dirty} />
    </div>
  );
}

function BranchEditForm({
  draft,
  onChange,
  onSave,
  onCancel,
  dirty,
}: {
  draft: LifecycleBranch;
  onChange: (next: LifecycleBranch) => void;
  onSave: () => void;
  onCancel: () => void;
  dirty: boolean;
}) {
  const updateArray = (key: keyof Pick<LifecycleBranch, 'extraQuestions' | 'backendFields' | 'userTags' | 'courseConstraints'>, text: string) => {
    onChange({ ...draft, [key]: linesToArray(text) });
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <FormField label="分支名称">
          <input
            className={inputCls}
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
          />
        </FormField>
        <FormField label="规则类型" className="sm:col-span-2">
          <RuleTypeSelect
            value={draft.ruleType}
            onChange={(ruleType) => onChange({ ...draft, ruleType })}
          />
        </FormField>
        <FormField label="触发条件" className="sm:col-span-2">
          <input
            className={inputCls}
            value={draft.trigger}
            onChange={(e) => onChange({ ...draft, trigger: e.target.value })}
          />
        </FormField>
        <FormField label="备注" className="sm:col-span-2">
          <textarea
            className={textareaCls}
            rows={2}
            value={draft.note}
            onChange={(e) => onChange({ ...draft, note: e.target.value })}
          />
        </FormField>
        <FormField label="追加问题（每行一题）">
          <textarea
            className={textareaCls}
            rows={4}
            value={arrayToLines(draft.extraQuestions)}
            onChange={(e) => updateArray('extraQuestions', e.target.value)}
          />
        </FormField>
        <FormField label="后台字段（每行一个）">
          <textarea
            className={textareaCls}
            rows={4}
            value={arrayToLines(draft.backendFields)}
            onChange={(e) => updateArray('backendFields', e.target.value)}
          />
        </FormField>
        <FormField label="用户标签（每行一个）">
          <textarea
            className={textareaCls}
            rows={4}
            value={arrayToLines(draft.userTags)}
            onChange={(e) => updateArray('userTags', e.target.value)}
          />
        </FormField>
        <FormField label="课程约束（每行一个）">
          <textarea
            className={textareaCls}
            rows={4}
            value={arrayToLines(draft.courseConstraints)}
            onChange={(e) => updateArray('courseConstraints', e.target.value)}
          />
        </FormField>
      </div>
      <EditToolbar onSave={onSave} onCancel={onCancel} dirty={dirty} />
    </div>
  );
}

function QuestionRow({
  q,
  expanded,
  editing,
  draft,
  dirty,
  onToggle,
  onEdit,
  onDraftChange,
  onSave,
  onCancel,
}: {
  q: QuestionDef;
  expanded: boolean;
  editing: boolean;
  draft: QuestionDef | null;
  dirty: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDraftChange: (next: QuestionDef) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
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
            {editing && <span className="rounded bg-amber-100 px-1 text-[9px] font-semibold text-amber-700">编辑中</span>}
          </div>
        </td>
        <td className="px-3 py-2 text-[11px] text-gray-500">{q.branch !== '否' ? q.branch : '—'}</td>
        <td className="px-3 py-2"><RuleBadge type={q.ruleType} /></td>
        <td className="px-3 py-2 text-[11px] text-gray-400">{expanded ? '▲' : '▼'}</td>
      </tr>
      {expanded && (
        <tr className="bg-gray-50">
          <td colSpan={5} className="px-4 py-3">
            {editing && draft ? (
              <QuestionEditForm
                draft={draft}
                onChange={onDraftChange}
                onSave={onSave}
                onCancel={onCancel}
                dirty={dirty}
              />
            ) : (
              <div>
                <div className="mb-3 flex justify-end">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="rounded-md border border-gray-400 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                  >
                    编辑题目
                  </button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <Detail label="选项" value={q.options} />
                  <Detail label="后台字段" value={q.backendField} mono />
                  <Detail label="生成用户标签" value={q.userTags} mono />
                  <Detail label="匹配课程标签" value={q.courseTags} mono />
                  <Detail label="备注" value={q.note} className="md:col-span-2" />
                </div>
              </div>
            )}
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
  const [questions, setQuestions] = useState<QuestionDef[]>(cloneQuestions);
  const [branches, setBranches] = useState<LifecycleBranch[]>(cloneBranches);
  const [expandedQ, setExpandedQ] = useState<string | null>('Q03');
  const [selectedBranch, setSelectedBranch] = useState<string>('L6');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] = useState<QuestionDef | null>(null);
  const [branchDraft, setBranchDraft] = useState<LifecycleBranch | null>(null);
  const [ruleLegendOpen, setRuleLegendOpen] = useState(false);

  const branch = branches.find((b) => b.id === selectedBranch) ?? branches[0];

  const questionsDirty = useMemo(
    () => JSON.stringify(questions) !== JSON.stringify(MAIN_QUESTIONS),
    [questions],
  );
  const branchesDirty = useMemo(
    () => JSON.stringify(branches) !== JSON.stringify(LIFECYCLE_BRANCHES),
    [branches],
  );

  const questionDraftDirty = useMemo(() => {
    if (!questionDraft || !editingQuestionId) return false;
    const original = questions.find((q) => q.id === editingQuestionId);
    return original ? JSON.stringify(questionDraft) !== JSON.stringify(original) : false;
  }, [questionDraft, editingQuestionId, questions]);

  const branchDraftDirty = useMemo(() => {
    if (!branchDraft || !editingBranchId) return false;
    const original = branches.find((b) => b.id === editingBranchId);
    return original ? JSON.stringify(branchDraft) !== JSON.stringify(original) : false;
  }, [branchDraft, editingBranchId, branches]);

  const startEditQuestion = useCallback((q: QuestionDef) => {
    setEditingQuestionId(q.id);
    setQuestionDraft({ ...q });
    setExpandedQ(q.id);
  }, []);

  const saveQuestion = useCallback(() => {
    if (!questionDraft) return;
    setQuestions((prev) => prev.map((q) => (q.id === questionDraft.id ? questionDraft : q)));
    setEditingQuestionId(null);
    setQuestionDraft(null);
  }, [questionDraft]);

  const cancelQuestionEdit = useCallback(() => {
    setEditingQuestionId(null);
    setQuestionDraft(null);
  }, []);

  const startEditBranch = useCallback((b: LifecycleBranch) => {
    setEditingBranchId(b.id);
    setBranchDraft(JSON.parse(JSON.stringify(b)) as LifecycleBranch);
  }, []);

  const saveBranch = useCallback(() => {
    if (!branchDraft) return;
    setBranches((prev) => prev.map((b) => (b.id === branchDraft.id ? branchDraft : b)));
    setEditingBranchId(null);
    setBranchDraft(null);
  }, [branchDraft]);

  const cancelBranchEdit = useCallback(() => {
    setEditingBranchId(null);
    setBranchDraft(null);
  }, []);

  const resetQuestions = useCallback(() => {
    setQuestions(cloneQuestions());
    setEditingQuestionId(null);
    setQuestionDraft(null);
  }, []);

  const resetBranches = useCallback(() => {
    setBranches(cloneBranches());
    setEditingBranchId(null);
    setBranchDraft(null);
  }, []);

  const selectBranch = useCallback((id: string) => {
    if (editingBranchId && branchDraftDirty) {
      if (!window.confirm('当前分支有未保存修改，确定切换？')) return;
    }
    setSelectedBranch(id);
    setEditingBranchId(null);
    setBranchDraft(null);
  }, [editingBranchId, branchDraftDirty]);

  return (
    <div className={cn('rounded-2xl border border-gray-200 bg-white shadow-sm', embedded ? '' : 'mx-auto max-w-[1200px]')}>
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-gray-900">Onboarding 问卷配置</p>
            <p className="mt-0.5 text-[12px] text-gray-500">
              NOT A PHASE Onboarding 问卷需求文档 V1（统一联动版）· 版本 {ONBOARDING_VERSION}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-full bg-gray-800 px-2.5 py-1 font-semibold text-white">{questions.length} 主问题</span>
            <span className="rounded-full bg-gray-500 px-2.5 py-1 font-semibold text-white">{branches.length} 生命周期分支</span>
            <span className="rounded-full bg-gray-200 px-2.5 py-1 font-semibold text-gray-700">3–5 分钟</span>
            {(questionsDirty || branchesDirty) && (
              <span className="rounded-full bg-amber-100 px-2.5 py-1 font-semibold text-amber-800">已修改（会话内）</span>
            )}
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-gray-500">规则优先级：</span>
            {RULE_PRIORITY.map((r, i) => (
              <span key={r.name} className="flex items-center gap-1 text-[10px] text-gray-600">
                {i > 0 && <span className="text-gray-300">→</span>}
                <span className="font-semibold" title={r.desc}>{r.name}</span>
              </span>
            ))}
            <span className="text-[10px] text-gray-400">（{CONFLICT_ORDER}）</span>
            <button
              type="button"
              onClick={() => setRuleLegendOpen((v) => !v)}
              className="ml-auto text-[10px] font-semibold text-gray-600 underline-offset-2 hover:underline"
            >
              {ruleLegendOpen ? '收起规则类型说明' : '展开规则类型说明'}
            </button>
          </div>
          <RuleTypeLegend compact />
          {ruleLegendOpen && <RuleTypeLegend />}
        </div>
      </div>

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
        {activeTab === 'questions' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-gray-500">点击题目行展开详情；支持编辑标题、选项、标签映射与规则类型</p>
              {questionsDirty && (
                <button
                  type="button"
                  onClick={resetQuestions}
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
                >
                  恢复题目默认
                </button>
              )}
            </div>

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
                    {['ID', '题目', '分支', '规则类型（悬停查看说明）', ''].map((h) => (
                      <th key={h} className="px-3 py-2 text-[10px] font-bold uppercase text-gray-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <QuestionRow
                      key={q.id}
                      q={q}
                      expanded={expandedQ === q.id}
                      editing={editingQuestionId === q.id}
                      draft={editingQuestionId === q.id ? questionDraft : null}
                      dirty={questionDraftDirty}
                      onToggle={() => {
                        if (editingQuestionId && editingQuestionId !== q.id && questionDraftDirty) {
                          if (!window.confirm('当前题目有未保存修改，确定切换？')) return;
                          cancelQuestionEdit();
                        }
                        setExpandedQ(expandedQ === q.id ? null : q.id);
                      }}
                      onEdit={() => startEditQuestion(q)}
                      onDraftChange={setQuestionDraft}
                      onSave={saveQuestion}
                      onCancel={cancelQuestionEdit}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
              Q12 器械题 V1 已取消；Q04 次要目标可跳过。修改保存在当前会话内，刷新页面将恢复默认。
            </div>
          </div>
        )}

        {activeTab === 'lifecycle' && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-gray-500">选择分支后编辑追加问题、后台字段与用户/课程标签</p>
              {branchesDirty && (
                <button
                  type="button"
                  onClick={resetBranches}
                  className="rounded-md border border-gray-300 px-2.5 py-1 text-[11px] text-gray-600 hover:bg-gray-50"
                >
                  恢复分支默认
                </button>
              )}
            </div>

            <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
              <div className="space-y-1">
                {branches.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => selectBranch(b.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[12px] transition',
                      selectedBranch === b.id
                        ? 'bg-gray-800 font-semibold text-white'
                        : 'text-gray-600 hover:bg-gray-100',
                    )}
                  >
                    <span className="font-mono text-[11px]">{b.id}</span>
                    <span className="truncate">{b.name}</span>
                    {editingBranchId === b.id && (
                      <span className="ml-auto rounded bg-amber-400 px-1 text-[9px] text-white">编</span>
                    )}
                  </button>
                ))}
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                {editingBranchId === branch.id && branchDraft ? (
                  <>
                    <div className="mb-3 flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-gray-800">{branchDraft.id}</span>
                      <span className="text-[12px] font-semibold text-gray-600">编辑分支配置</span>
                    </div>
                    <BranchEditForm
                      draft={branchDraft}
                      onChange={setBranchDraft}
                      onSave={saveBranch}
                      onCancel={cancelBranchEdit}
                      dirty={branchDraftDirty}
                    />
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold text-gray-800">{branch.id}</span>
                        <span className="text-base font-bold text-gray-900">{branch.name}</span>
                        <RuleBadge type={branch.ruleType} />
                      </div>
                      <button
                        type="button"
                        onClick={() => startEditBranch(branch)}
                        className="rounded-md border border-gray-400 bg-white px-2.5 py-1 text-[11px] font-medium text-gray-700 hover:bg-gray-100"
                      >
                        编辑分支
                      </button>
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
                  </>
                )}
              </div>
            </div>
          </div>
        )}

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

        {activeTab === 'mapping' && (
          <div className="space-y-3">
            <p className="text-[11px] text-gray-500">
              「类型」列：Hard=硬过滤排除 · Soft=软偏好排序 · Context=情境规则 · 组合类型见上方说明
            </p>
            <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-100">
                  {['输入域', '用户标签', '课程标签', '匹配规则', '规则类型'].map((h) => (
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
                    <td className="px-3 py-2"><RuleBadge type={m.ruleType} showLabel /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        )}

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
