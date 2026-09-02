import { useState } from 'react';
import { screens, screenMap, groupByFlow } from '../data';
import {
  COURSE_TAGGING_VIEW_ID,
  ONBOARDING_CONFIG_VIEW_ID,
  USER_TRAINING_PROFILE_VIEW_ID,
  FLOW_NAMES,
  FLOW_ORDER,
  type ScreenDef,
} from '../data/types';
import { AdminFrame } from '../components/AdminWireframe';
import { CourseTaggingDemoView } from './CourseTaggingDemoView';
import { OnboardingConfigView } from './OnboardingConfigView';
import { UserTrainingProfileView } from './UserTrainingProfileView';

const TAGGING_SCREEN: ScreenDef = {
  id: COURSE_TAGGING_VIEW_ID,
  name: '课程标签 & 能量估算',
  reqCode: '产品补全 · 排课依赖',
  priority: 'P0',
  flow: 'C',
  states: [{ id: 'workspace', label: '工作台', blocks: [] }],
  annotations: {
    goal: '将视频课程转换为可解释、可复核、可被排课规则读取的课程标签，并提供单次训练能量估算。',
    entry: '内容中心 > B06 标签库 / B07 AI 打标复核',
    exit: ['B11', 'B12', 'B13', 'B31'],
    role: '内容运营；安全类标签由健康运营终审。',
    data: ['课程视频、字幕 — B03 视频库', '标签字典与发布快照 — B06 标签库', 'MET 模型与体重输入 — 卡路里估算模块'],
    actions: { primary: 'AI 批量打标、人工复核、发布标签快照', secondary: ['查看卡路里估算', '按状态筛选课程池'] },
    statesDesc: ['待复核', '异常待处理', '可用于排课', '已发布快照'],
    triggers: ['只有通过普通标签复核和健康终审的课程，才允许 B12 排课规则读取。', '视频内容或标签字典变更后，需要重新运行打标并生成新版本。'],
    deps: ['B06 标签库', 'B07 AI 打标复核', 'B12 排课规则编辑'],
    patches: ['H-01'],
  },
};

const ONBOARDING_CONFIG_SCREEN: ScreenDef = {
  id: ONBOARDING_CONFIG_VIEW_ID,
  name: 'Onboarding 问卷配置',
  reqCode: 'V1 需求文档 · 统一联动版',
  priority: 'P0',
  flow: 'B',
  states: [{ id: 'config', label: '配置总览', blocks: [] }],
  annotations: {
    goal: '将 Onboarding 问卷需求文档 V1 中的题目矩阵、生命周期分支、标签映射和 Profile 输出结构可视化，供产品评审与研发字段对接。',
    entry: '问卷评测 > Onboarding 问卷配置；或 B08/B09 关联入口',
    exit: ['B08', 'B09', 'B10', 'S04'],
    role: '产品 / 课程健康运营 / 研发',
    data: [
      'Q01–Q15 主问卷题目与选项枚举 — onboarding-config.ts',
      'L1–L9 女性生命周期分支 — 条件跳转规则',
      '问卷→用户标签→课程标签映射 — User Training Profile 推导输入',
      'Profile 输出结构与 Check-in 边界 — V1 统一联动合同',
    ],
    actions: {
      primary: '浏览主问卷、分支、映射与 Profile 结构',
      secondary: ['展开题目详情', '切换生命周期分支', '查看 Check-in 覆盖规则'],
    },
    statesDesc: ['主问卷题目', '生命周期分支', '产后恢复', '标签映射', 'Profile 输出', 'Check-in 边界'],
    triggers: [
      'Q15 生命周期选择 → 进入 L1–L9 对应分支',
      'Q03=产后恢复 或 Q15=产后 → L6 产后细则',
      'Profile 推导规则变更需同步 B10 与 B12',
    ],
    deps: ['S04 Onboarding 问卷', 'B08 问卷版本', 'B09 编辑器', 'B10 Profile 推导', 'B06 Taxonomy'],
    patches: ['V1-ONBOARDING-CONFIG'],
  },
};

const USER_PROFILE_SCREEN: ScreenDef = {
  id: USER_TRAINING_PROFILE_VIEW_ID,
  name: '用户训练档案与标签',
  reqCode: 'V1 · B19/B10 联动',
  priority: 'P0',
  flow: 'F',
  states: [{ id: 'workspace', label: '档案与推导', blocks: [] }],
  annotations: {
    goal: '展示用户完成 Onboarding 问卷后推导的训练档案标签与排课课程标签，支持标签血缘追溯与样本批量推导验证。',
    entry: '用户与 CRM > 用户训练档案；或 B19 User Profile / B10 Profile 推导入口',
    exit: ['B19', 'B10', 'ONBOARDING_CONFIG', 'B12'],
    role: 'CRM / 健康运营 / 产品 / 安全审核',
    data: [
      'onboarding_submissions 原始答案 — 问卷提交',
      'User Training Profile vN — derive-user-profile 推导',
      '用户标签与课程标签血缘 — TAG_MAPPINGS + 题目来源',
      '样本用户 U-08771 / U-10231 / U-6102 — user-onboarding-samples.ts',
    ],
    actions: {
      primary: '选择用户查看标签与 Profile',
      secondary: ['查看标签血缘', '运行样本推导', '跳转 Onboarding 配置'],
    },
    statesDesc: ['用户档案 B19', 'Profile 推导 B10', '标签血缘', '样本 JSON'],
    triggers: [
      '问卷 SUMMARY 确认后生成 Profile 并打训练档案标签',
      '课程标签由 TAG_MAPPINGS 映射，供 B12 排课规则读取',
      '营销 CRM 标签与训练档案标签隔离',
    ],
    deps: ['S04 Onboarding', 'ONBOARDING_CONFIG', 'B10', 'B19', 'B12'],
    patches: ['V1-USER-PROFILE-TAGS'],
  },
};

const UPDATED_SCREEN_DATES: Record<string, string> = {
  B06: '260902',
  B12: '260902',
  B13: '260902',
  B19: '260902',
  [COURSE_TAGGING_VIEW_ID]: '260902',
};

interface Props {
  screenId: string;
  onNavigate: (screenId: string) => void;
  onShowDecisions: () => void;
  onOpenMobile: (screenId: string) => void;
  onOpenTagging: () => void;
}

// 把含 Bxx 的文本渲染成可点击引用；Sxx 可点击切换到移动端 App 对应屏
function ScreenRefs({
  text,
  onNavigate,
  onMobile,
}: {
  text: string;
  onNavigate: (id: string) => void;
  onMobile: (id: string) => void;
}) {
  const parts = text.split(/([BS]\d{2})/g);
  return (
    <>
      {parts.map((p, i) => {
        if (/^B\d{2}$/.test(p) && screenMap[p]) {
          return (
            <button key={i} onClick={() => onNavigate(p)} className="font-mono text-gray-800 underline decoration-gray-400 hover:bg-gray-200">
              {p}
            </button>
          );
        }
        if (/^S\d{2}$/.test(p)) {
          return (
            <button
              key={i}
              onClick={() => onMobile(p)}
              className="font-mono text-gray-500 underline decoration-dotted decoration-gray-400 hover:bg-gray-200 hover:text-gray-800"
              title="切换到移动端 App 查看该屏"
            >
              {p}
            </button>
          );
        }
        return <span key={i}>{p}</span>;
      })}
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

export function ScreensView({ screenId, onNavigate, onShowDecisions, onOpenMobile, onOpenTagging }: Props) {
  const [profileNav, setProfileNav] = useState<{ userId?: string; tab?: 'user' | 'derivation' }>({});

  const screen =
    screenId === COURSE_TAGGING_VIEW_ID ? TAGGING_SCREEN
    : screenId === ONBOARDING_CONFIG_VIEW_ID ? ONBOARDING_CONFIG_SCREEN
    : screenId === USER_TRAINING_PROFILE_VIEW_ID ? USER_PROFILE_SCREEN
    : screenMap[screenId] ?? screens[0];
  const isTagging = screen.id === COURSE_TAGGING_VIEW_ID;
  const isOnboardingConfig = screen.id === ONBOARDING_CONFIG_VIEW_ID;
  const isUserProfile = screen.id === USER_TRAINING_PROFILE_VIEW_ID;
  const [stateId, setStateId] = useState(screen.states[0].id);
  const curState = screen.states.find((s) => s.id === stateId) ?? screen.states[0];
  const groups = groupByFlow(screens);
  const a = screen.annotations;

  const selectScreen = (id: string) => {
    if (id === COURSE_TAGGING_VIEW_ID) {
      onOpenTagging();
      return;
    }
    if (id === ONBOARDING_CONFIG_VIEW_ID) {
      onNavigate(id);
      return;
    }
    if (id === USER_TRAINING_PROFILE_VIEW_ID || id.startsWith(`${USER_TRAINING_PROFILE_VIEW_ID}:`)) {
      const parts = id.split(':');
      setProfileNav({
        userId: parts[1],
        tab: parts[2] === 'derivation' ? 'derivation' : 'user',
      });
      onNavigate(USER_TRAINING_PROFILE_VIEW_ID);
      return;
    }
    onNavigate(id);
    setStateId((screenMap[id] ?? screens[0]).states[0].id);
  };

  const openUserProfile = (opts?: { userId?: string; tab?: 'user' | 'derivation' }) => {
    setProfileNav(opts ?? {});
    onNavigate(USER_TRAINING_PROFILE_VIEW_ID);
  };

  return (
    <div className="flex h-full min-h-0">
      {/* 左栏：屏幕列表 */}
      <aside className="w-60 shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50 py-3">
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
                {UPDATED_SCREEN_DATES[s.id] && <span className={`shrink-0 rounded px-1 font-mono text-[8px] ${s.id === screen.id ? 'bg-white text-gray-700' : 'bg-amber-100 text-amber-700'}`}>{UPDATED_SCREEN_DATES[s.id]}</span>}
                <span className={`rounded px-1 text-[10px] ${s.priority === 'P0' ? 'bg-gray-800 text-white' : 'bg-gray-300 text-gray-600'} ${s.id === screen.id ? '!bg-white !text-gray-700' : ''}`}>
                  {s.priority}
                </span>
              </button>
            ))}
            {f === 'B' && (
              <button
                type="button"
                onClick={() => selectScreen(ONBOARDING_CONFIG_VIEW_ID)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] ${isOnboardingConfig ? 'bg-gray-700 font-semibold text-white' : 'text-slate-700 hover:bg-gray-200'}`}
              >
                <span className="font-mono text-[11px]">CFG</span>
                <span className="min-w-0 flex-1 truncate">Onboarding 问卷配置</span>
                <span className={`rounded px-1 text-[10px] font-semibold ${isOnboardingConfig ? 'bg-white text-gray-700' : 'bg-amber-100 text-amber-700'}`}>新增</span>
              </button>
            )}
            {f === 'F' && (
              <button
                type="button"
                onClick={() => openUserProfile()}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] ${isUserProfile ? 'bg-gray-700 font-semibold text-white' : 'text-slate-700 hover:bg-gray-200'}`}
              >
                <span className="font-mono text-[11px]">UTP</span>
                <span className="min-w-0 flex-1 truncate">用户训练档案与标签</span>
                <span className={`rounded px-1 text-[10px] font-semibold ${isUserProfile ? 'bg-white text-gray-700' : 'bg-amber-100 text-amber-700'}`}>新增</span>
              </button>
            )}
            {f === 'C' && (
              <button
                type="button"
                onClick={() => selectScreen(COURSE_TAGGING_VIEW_ID)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] ${isTagging ? 'bg-gray-700 font-semibold text-white' : 'text-slate-700 hover:bg-gray-200'}`}
              >
                <span className="font-mono text-[11px]">TAG</span>
                <span className="min-w-0 flex-1 truncate">课程标签 & 能量估算</span>
                <span className={`shrink-0 rounded px-1 font-mono text-[8px] ${isTagging ? 'bg-white text-gray-700' : 'bg-amber-100 text-amber-700'}`}>{UPDATED_SCREEN_DATES[COURSE_TAGGING_VIEW_ID]}</span>
                <span className={`rounded px-1 text-[10px] font-semibold ${isTagging ? 'bg-white text-gray-700' : 'bg-amber-100 text-amber-700'}`}>新增</span>
              </button>
            )}
          </div>
        ))}
        <p className="px-3 pt-2 text-[10px] leading-relaxed text-gray-400">
          对齐《后端需求》与反馈全量 B 系列；页内 Tab 已补齐对应状态，可直接点击切换。
        </p>
      </aside>

      {/* 中栏：桌面线框 */}
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
        {isTagging ? (
          <div className="mt-4 w-full max-w-[1200px] px-4">
            <CourseTaggingDemoView embedded />
          </div>
        ) : isOnboardingConfig ? (
          <div className="mt-4 w-full max-w-[1200px] px-4">
            <OnboardingConfigView embedded onOpenUserProfile={() => openUserProfile()} />
          </div>
        ) : isUserProfile ? (
          <div className="mt-4 w-full max-w-[1200px] px-4">
            <UserTrainingProfileView
              embedded
              initialUserId={profileNav.userId}
              initialTab={profileNav.tab}
              onNavigateToOnboarding={() => selectScreen(ONBOARDING_CONFIG_VIEW_ID)}
            />
          </div>
        ) : (
          <div className="mt-4 w-full max-w-[920px] px-4">
            <AdminFrame
              screen={screen}
              stateId={curState.id}
              onNavigate={selectScreen}
              onSwitchState={setStateId}
            />
          </div>
        )}
        <p className="mt-3 text-[11px] text-gray-400">
          {isTagging ? '课程标签工作台已嵌入后台系统内容区 · 左侧可切换排课与内容相关页面 · 右侧查看页面目标、依赖与发布规则'
            : isOnboardingConfig ? 'Onboarding 问卷配置已嵌入内容区 · 7 个 Tab 可切换 · 点击题目行展开详情 · 右侧查看业务标注与依赖'
            : isUserProfile ? '用户训练档案与标签 · 选择样本用户查看问卷推导标签 · B19 用户档案 / B10 推导验证'
            : '页内 Tab 可点击切换对应状态 · 带跳转的按钮/表格行可点 · 左侧菜单可切换页面 · 灰色圆点数字对应右栏标注 · amber 虚线 = 产品补全 · 右栏 S 编号可切到移动端'}
        </p>
      </main>

      {/* 右栏：标注面板 */}
      <aside className="w-80 shrink-0 overflow-y-auto border-l border-gray-200 bg-white">
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-sm font-bold text-gray-700">业务标注 · {screen.id} {screen.name}</p>
        </div>
        <Field label="页面目标">{a.goal}</Field>
        <Field label="入口 / 出口">
          <p><span className="text-gray-400">入口：</span><ScreenRefs text={a.entry} onNavigate={selectScreen} onMobile={onOpenMobile} /></p>
          <p className="mt-1">
            <span className="text-gray-400">出口：</span>
            {a.exit.length === 0 ? '（单屏多状态向导，无页面出口）' : a.exit.map((e, i) => (
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
            {a.data.map((d, i) => <li key={i}><ScreenRefs text={d} onNavigate={selectScreen} onMobile={onOpenMobile} /></li>)}
          </ul>
        </Field>
        <Field label="操作">
          <p><span className="font-semibold">主操作：</span><ScreenRefs text={a.actions.primary} onNavigate={selectScreen} onMobile={onOpenMobile} /></p>
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
            {a.triggers.map((t, i) => <li key={i}><ScreenRefs text={t} onNavigate={selectScreen} onMobile={onOpenMobile} /></li>)}
          </ul>
        </Field>
        <Field label="依赖（移动端屏幕 / 后台模块）">
          <ul className="list-disc space-y-0.5 pl-4">
            {a.deps.map((d, i) => <li key={i}><ScreenRefs text={d} onNavigate={selectScreen} onMobile={onOpenMobile} /></li>)}
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
