import type { ScreenDef, WireBlock } from './types';
import type { ScreenDef as MobileScreenDef, WireBlock as MobileWireBlock } from './mobile/types';
import { s09TodayScreen } from './mobile/s09Today';

/**
 * V1 统一联动合同：问卷、课程标签、规则和两端原型共用的技术值。
 * 这里是评审站 fixture，不承担生产推荐计算；生产端应从 API/Schema 读取同一份字典。
 */
export const V1_TAXONOMY = {
  goals: ['FAT_LOSS', 'TONING', 'HEALTHY_HABIT', 'POSTPARTUM'],
  fitnessCapacity: ['L1', 'L2', 'L3', 'L4', 'L5'],
  dayStates: ['PUSH', 'SOFT', 'WARM'],
  checkinAnswers: ['FEEL_GREAT', 'ENERGY_LOW', 'PERIOD_STARTED'],
  workoutTypes: ['STRENGTH', 'PILATES', 'YOGA', 'CARDIO', 'MOBILITY', 'STRETCH_RECOVERY'],
  bodyAreas: ['FULL_BODY', 'CORE', 'LOWER_BODY', 'UPPER_BODY', 'GLUTES', 'BACK'],
  lifecycle: ['REGULAR', 'IRREGULAR', 'HORMONAL_CONTRACEPTION', 'TTC', 'PREGNANT', 'POSTPARTUM', 'PERIMENOPAUSE', 'POSTMENOPAUSE', 'PCOS'],
} as const;

export const V1_VERSION_MATRIX = {
  taxonomy: 'taxonomy_2026_08_28',
  questionnaire: 'onboarding_v1.0',
  ruleSet: 'rules_v1.0',
  courseProfileSchema: 'course_profile_v1.0',
};

/** V2 Course Profile 版本矩阵（与打标细则 V2 对齐；迁移期保留 V1 对照） */
export const V2_VERSION_MATRIX = {
  taxonomy: 'taxonomy_2026_08_28',
  courseProfileSchema: 'course_profile_v2',
  taggingRules: 'course_tagging_rules_v2.1',
  eligibilityRules: 'course_eligibility_rules_v2.0',
  ruleSet: 'rules_v2.0',
};

const mobileData = (items: string[]) => items;
const adminData = (items: string[]) => items;

function mobileScreen(
  id: string,
  name: string,
  reqCode: string,
  flow: MobileScreenDef['flow'],
  states: MobileScreenDef['states'],
  annotations: MobileScreenDef['annotations'],
  priority: MobileScreenDef['priority'] = 'P0',
): MobileScreenDef {
  return { id, name, reqCode, priority, flow, states, annotations };
}

function adminScreen(
  id: string,
  name: string,
  reqCode: string,
  flow: ScreenDef['flow'],
  states: ScreenDef['states'],
  annotations: ScreenDef['annotations'],
  priority: ScreenDef['priority'] = 'P0',
): ScreenDef {
  return { id, name, reqCode, priority, flow, states, annotations };
}

const mStatus = (): MobileWireBlock => ({ kind: 'statusbar', label: '' });
const mTab = (label: string): MobileWireBlock => ({ kind: 'tabbar', label });

const baseMobileNotes = {
  role: '体验用户 / 订阅用户',
  deps: ['V1 App API：User Training Profile、Course Profile、规则决策快照', 'V1 taxonomy 与文案版本'],
};

const mobileV1Screens: MobileScreenDef[] = [
  mobileScreen('S04', 'Onboarding 问卷与安全分支', 'A05', 'A', [
    { id: 'main', label: '主问题（15题）', blocks: [
      mStatus(),
      { kind: 'progress', label: 'Onboarding · 主问题 3 / 15 · 自动保存', marker: 1 },
      { kind: 'header', label: '你的主要训练目标是什么？' },
      { kind: 'list-item', label: '○ 减脂 · FAT_LOSS' },
      { kind: 'list-item', label: '○ 塑形 · TONING' },
      { kind: 'list-item', label: '○ 健康习惯 · HEALTHY_HABIT' },
      { kind: 'list-item', label: '○ 产后恢复 · POSTPARTUM' },
      { kind: 'card', label: '主问题之外会根据答案出现生命周期和安全分支', sub: '连续训练能力、跳跃耐受、受限部位/严重程度、时长/频次、偏好等共 15 个主问题', patch: true },
      { kind: 'button-secondary', label: '← 返回上题' },
      { kind: 'button-primary', label: '下一题' },
    ]},
    { id: 'safety', label: '安全限制分支', blocks: [
      mStatus(),
      { kind: 'progress', label: 'Onboarding · 安全分支 · 根据回答展开' },
      { kind: 'header', label: '是否有需要我们避开的身体限制？' },
      { kind: 'chip-row', label: '膝盖 · 手腕 · 下背 · 肩部 · 盆底/腹直肌分离', sub: '可多选；另选严重程度；信息只用于训练安全' },
      { kind: 'card', label: '资料用途说明', sub: '不会诊断或治疗；你可以在「我的」查看、更正、删除或导出', patch: true },
      { kind: 'button-primary', label: '继续' },
    ]},
    { id: 'pregnancy-block', label: '孕期 V1 Block', blocks: [
      mStatus(),
      { kind: 'card', label: '当前无法提供孕期自动排课', sub: 'V1 为安全边界：不会用通用低强度课程绕过限制。你可以修改答案或查看安全说明。', marker: 1, patch: true },
      { kind: 'button-secondary', label: '修改刚才的答案' },
      { kind: 'button-primary', label: '查看安全说明' },
    ]},
    { id: 'summary', label: '档案摘要确认', blocks: [
      mStatus(),
      { kind: 'header', label: '确认你的训练档案' },
      { kind: 'card', label: '目标：减脂 + 健康习惯', sub: 'Profile v1 · 来源：Onboarding v1.0' },
      { kind: 'card', label: '能力：L2 · 可训练 20 分钟 · 每周 4 次', sub: '跳跃耐受：低 · 膝盖限制：中度', marker: 2 },
      { kind: 'card', label: '生命周期：IRREGULAR（周期预测会标注估算）', sub: '长期档案与当天 Check-in 分开保存', patch: true },
      { kind: 'button-primary', label: '确认并生成 30 天计划', to: 'S06' },
      { kind: 'button-secondary', label: '返回修改', toState: 'main' },
    ]},
  ], {
    goal: '用 15 个主问题和条件分支生成可版本化的 User Training Profile。',
    entry: 'S03 欢迎页 / 老用户迁移补充资料',
    exit: ['S05', 'S06'],
    role: '新用户 / 需要补充资料的老用户',
    data: mobileData(['问卷版本、题目、选项、分支 — 后台 Questionnaire API', '原始答案 — onboarding_submissions/answers', 'User Training Profile vN — 服务端推导规则', '敏感字段同意 — profile_consents']),
    actions: { primary: '完成主问题/分支并确认 Profile 摘要', secondary: ['自动保存并稍后继续', '返回修改', '查看数据用途'], destructive: '删除健康数据需进入隐私设置二次确认' },
    statesDesc: ['15 个主问题', '安全/生命周期分支', '孕期 V1 Block', '档案摘要确认', '断点续答', '过期问卷版本'],
    triggers: ['PREGNANT → PREGNANCY_V1_BLOCK；不生成自动课程', 'Profile 修改生成新版本并只影响未来计划', '设备不作为用户输入或主匹配字段'],
    deps: [...baseMobileNotes.deps, '敏感数据同意与导出/删除服务'],
    patches: ['V1-ONBOARDING', 'D01', 'D02', 'D03'],
  }),
  mobileScreen('S05', '数据用途与档案确认', 'A05', 'A', [{ id: 'default', label: '提交前确认', blocks: [
    mStatus(),
    { kind: 'header', label: '确认生成你的 30 天计划？' },
    { kind: 'card', label: '我们会保存你的 User Training Profile', sub: '用于选择符合安全限制的课程、生成 30 天训练意图，并在必要时调整未来计划。' },
    { kind: 'card', label: '不用于医疗诊断；当天 Check-in 不会修改长期档案', sub: '你可以在「我的 → 训练档案」查看、更正、导出或删除', patch: true },
    { kind: 'button-primary', label: '确认提交并生成计划', to: 'S06' },
    { kind: 'button-secondary', label: '返回修改答案', to: 'S04' },
  ]}], {
    goal: '提交前明确敏感数据用途、保存边界和用户控制权。', entry: 'S04 Profile 摘要', exit: ['S04', 'S06'],
    role: baseMobileNotes.role, data: mobileData(['答案摘要 — 本次提交草稿', '同意版本 — profile_consents', '问卷/Profile 版本 — 服务端']),
    actions: { primary: '确认提交', secondary: ['返回修改', '打开隐私说明'] }, statesDesc: ['默认', '提交中', '提交失败可重试'],
    triggers: ['确认后生成 User Training Profile，再异步创建 Plan', '不生成长报告'], deps: [...baseMobileNotes.deps], patches: ['V1-PRIVACY'],
  }),
  mobileScreen('S06', '30 天计划生成状态', 'A06', 'A', [
    { id: 'loading', label: '生成中', blocks: [mStatus(), { kind: 'progress', label: '正在生成 30 天计划 · 规则版本 rules_v1.0', marker: 1 }, { kind: 'header', label: '先建立训练结构，再为每天准备主课和备选' }, { kind: 'text', label: 'Plan 不读取当天 Check-in；安全过滤、训练意图和 Primary + Backup A/B/C 均会写入计划快照' }, { kind: 'card', label: '预计几秒完成；离开页面后可从「我的」继续查看', patch: true }]},
    { id: 'blocked', label: '安全阻断', blocks: [mStatus(), { kind: 'card', label: '暂时无法生成安全计划', sub: '缺少必要安全字段或当前没有通过审核的课程。请补充资料或选择休息，不会绕过 Hard Filter。', marker: 1, patch: true }, { kind: 'button-primary', label: '回到训练档案', to: 'S26' }, { kind: 'button-secondary', label: '查看安全说明' }]},
    { id: 'failed', label: '生成失败', blocks: [mStatus(), { kind: 'card', label: '计划生成失败', sub: '请稍后重试；你的答案和 Profile 草稿已保存。', marker: 1 }, { kind: 'button-primary', label: '重试生成' }, { kind: 'button-secondary', label: '联系客服' }]},
  ], {
    goal: '承接异步 Plan 任务，明确版本、安全阻断和恢复路径。', entry: 'S05 提交 / S26 档案确认', exit: ['S08', 'S26'], role: baseMobileNotes.role,
    data: mobileData(['plan_job 状态 — 服务端异步任务', 'Profile/规则/taxonomy 版本矩阵 — training_plans', 'Block/No Match reason code — recommendation_decisions']),
    actions: { primary: '生成成功进入 S08', secondary: ['重试', '回到档案', '联系客服'] }, statesDesc: ['生成中', '安全阻断', '失败可恢复', '成功'], triggers: ['成功只进入 30 天计划，不生成长报告'], deps: [...baseMobileNotes.deps, '异步任务/通知服务'], patches: ['V1-PLAN'],
  }),
  mobileScreen('S08', '30 天计划与训练意图', 'A08', 'A', [{ id: 'default', label: '当前计划', blocks: [
    mStatus(),
    { kind: 'header', label: '你的 30 天计划', sub: 'Training Structure → Daily Training Intent → Primary + Backup A/B/C', marker: 1, patch: true },
    { kind: 'cycle-grid', label: '周期只是上下文；计划版本与训练意图按天保存', sub: '已完成/过去日期锁定；未来变化显示 Re-plan 标记', height: 210 },
    { kind: 'list-item', label: '今天 · FULL_BODY / MOBILITY · Primary + A/B/C', sub: 'Plan v3 · 规则 rules_v1.0' },
    { kind: 'list-item', label: '明天 · CORE / STRENGTH · Primary + A/B/C' },
    { kind: 'list-item', label: '第 4 天 · REST / RECOVERY · 不强制训练' },
    { kind: 'card', label: '每日 Check-in 只调整今天；周期事实或档案变化才会 Re-plan 未来', sub: '查看变更原因和受影响日期', patch: true },
    { kind: 'button-primary', label: '了解今天的自己', to: 'S09' },
    mTab('今日'),
  ]}], {
    goal: '展示稳定的 30 天训练结构、每日训练意图与主备候选。', entry: 'S06 生成成功 / Tab 日历', exit: ['S09', 'S25'], role: baseMobileNotes.role,
    data: mobileData(['training_plan vN — Profile/规则/课程版本矩阵', 'training_intents — 目标类型、部位、时长和负荷', 'candidate_snapshots — Primary + Backup A/B/C']),
    actions: { primary: '进入 Today', secondary: ['查看某日候选与解释', '查看 Re-plan 差异'] }, statesDesc: ['默认', 'Re-plan 后差异', '部分计划可用', '无安全课程'],
    triggers: ['Daily Adapt 不改未来；Re-plan 只改尚未发生且受影响日期'], deps: [...baseMobileNotes.deps], patches: ['V1-PLAN-SCOPE'],
  }),
  s09TodayScreen,
  mobileScreen('S10', '课程详情与推荐原因', 'A11', 'A', [{ id: 'default', label: '详情', blocks: [
    mStatus(), { kind: 'image', label: '课程封面占位', height: 140 }, { kind: 'header', label: '低冲击全身活动', sub: '20min · PRIMARY BODY AREA: FULL_BODY · TYPE: MOBILITY' },
    { kind: 'chip-row', label: 'Overall 2/5 · Run NONE · Jump NONE · Ankle LOW · Equipment：仅课程元数据', marker: 1 },
    { kind: 'card', label: '为什么今天推荐给你', sub: '匹配今日训练意图 + 符合 L2 能力与膝盖限制；周期仅作为上下文', marker: 2, patch: true },
    { kind: 'card', label: '安全说明', sub: '字段来自 course_profile_v2，状态 APPROVED；Menstrual/Postpartum Eligibility 非医学诊断' },
    { kind: 'button-primary', label: '开始跟练', to: 'S11' }, { kind: 'button-secondary', label: '投屏' }, { kind: 'button-secondary', label: '查看备选课程' },
  ]}], {
    goal: '区分课程客观属性与个性化推荐理由，避免课程级周期适用结论。', entry: 'S09 / S25 / S29', exit: ['S11', 'S29'], role: baseMobileNotes.role,
    data: mobileData(['Course Profile V2 — approved course_profile_versions', 'decision_id 与 reason_codes — recommendation_decisions', '播放/反馈 — course_sessions/feedback']),
    actions: { primary: '开始跟练', secondary: ['投屏', '查看备选', '反馈太难/不适'] }, statesDesc: ['默认', '加载', '无审核版本', '课程已下架'], triggers: ['只有 APPROVED Course Profile V2 可被推荐'], deps: [...baseMobileNotes.deps, '播放/投屏服务'], patches: ['V2-COURSE-DETAIL'],
  }),
  mobileScreen('S19', '每日 / 首次 Check-in 与状态确认', 'A10', 'C', [
    { id: 'daily-checkin', label: '一问 Check-in', blocks: [mStatus(), { kind: 'card', label: '每日 Check-in · 今天一次', sub: '首 7 次显示简短解释；之后可跳过', marker: 1, patch: true }, { kind: 'header', label: '今天感觉怎么样？' }, { kind: 'button-secondary', label: 'Yes, I feel great · FEEL_GREAT', toState: 'recommendation' }, { kind: 'button-secondary', label: 'Energy is low · ENERGY_LOW', toState: 'recommendation' }, { kind: 'button-secondary', label: 'I got my period · PERIOD_STARTED', toState: 'period-confirm', marker: 2 }, { kind: 'button-secondary', label: '跳过今天', to: 'S09', toState: 'unchecked' }]},
    { id: 'recommendation', label: '系统建议与用户确认', blocks: [mStatus(), { kind: 'header', label: '系统建议：Soft Day', sub: '原因：能量低 → 先 Soften，保留训练意图与身体部位', marker: 1, patch: true }, { kind: 'card', label: '今天只会调整今天；未来 29 天不变', sub: '建议：SOFTEN；仍不适时再用 Backup A / B / C 或 Rest' }, { kind: 'button-primary', label: '确认 Soft Day', to: 'S09', toState: 'checked-not-started' }, { kind: 'button-secondary', label: '我想改成 Push / Warm', toState: 'state-selection' }]},
    { id: 'state-selection', label: '自主选择状态', blocks: [mStatus(), { kind: 'header', label: '选择今天的状态' }, { kind: 'button-secondary', label: 'Push Day · 保持原安排', to: 'S09', toState: 'checked-not-started' }, { kind: 'button-secondary', label: 'Soft Day · 适度训练', to: 'S09', toState: 'checked-not-started' }, { kind: 'button-secondary', label: 'Warm Day · 温柔照顾', to: 'S09', toState: 'checked-not-started' }]},
    { id: 'period-confirm', label: '确认周期事实', blocks: [mStatus(), { kind: 'header', label: '确认今天是生理期开始日？' }, { kind: 'card', label: '周期事实与当天状态分开保存', sub: '确认后将预览未来受影响日期；今天仍需单独确认 Push/Soft/Warm', marker: 1, patch: true }, { kind: 'button-primary', label: '确认并预览未来变化', to: 'S21' }, { kind: 'button-secondary', label: '返回修改', toState: 'daily-checkin' }]},
  ], {
    goal: '用一个问题获取当天输入，先给出系统建议，再由用户确认或修改状态。', entry: 'S09 / 首次提交后的首个 Check-in', exit: ['S09', 'S21'], role: baseMobileNotes.role,
    data: mobileData(['checkin_answer — daily_checkins', 'suggested_state/confirmed_state — recommendation preview/confirm', '首 7 次说明展示计数 — 用户体验配置']),
    actions: { primary: '确认建议或自主选择状态', secondary: ['跳过', '查看状态解释', '确认周期事实'] }, statesDesc: ['一问', '系统建议', '自主选择', '周期事实确认', '预览过期'], triggers: ['确认时使用 preview_revision；过期返回 PREVIEW_STALE', 'Check-in 不能放宽长期限制'], deps: [...baseMobileNotes.deps], patches: ['V1-CHECKIN', 'D01', 'D10'],
  }),
  mobileScreen('S20', '当天调整与撤销', 'A09', 'C', [{ id: 'preview', label: '调整预览', blocks: [mStatus(), { kind: 'header', label: '先保护今天的训练意图', sub: 'Soft：先降低 Overall / Running / Jump / 局部负荷，再尝试同意图备选', marker: 1, patch: true }, { kind: 'card', label: '原安排：核心力量 25min', sub: '第一步：SOFTEN → 同目标/类型/部位，降低 Overall / Running / Jump' }, { kind: 'card', label: '如果仍不合适：Backup A / B / C → 或今天休息', sub: '不会直接跨到无关课程；所有排除原因可查看' }, { kind: 'button-primary', label: '先降低负荷', toState: 'soften' }, { kind: 'button-secondary', label: '保持原课', to: 'S09', toState: 'checked-not-started' }]}, { id: 'soften', label: 'Soften结果', blocks: [mStatus(), { kind: 'card', label: '今日课程已温和化', sub: 'Daily Adapt · SOFTEN · 只影响今天 · course_profile_v2', marker: 1, patch: true }, { kind: 'list-item', label: '核心力量 20min · Overall 2 · Run NONE · Jump NONE · Ankle LOW' }, { kind: 'list-item', label: '保留目标：塑形 · 类型：力量 · 部位：核心/下肢' }, { kind: 'button-primary', label: '开始调整后课程', to: 'S10' }, { kind: 'button-secondary', label: '仍不适，查看备选', toState: 'swap' }]}, { id: 'swap', label: 'Swap/Rest备选', blocks: [mStatus(), { kind: 'header', label: '选择更温和的备选' }, { kind: 'list-item', label: 'Backup A：低冲击核心 · 15min · 同目标/部位' }, { kind: 'list-item', label: 'Backup B：下肢活动度 · 12min · Overall 1' }, { kind: 'button-primary', label: '使用 Backup A', to: 'S09', toState: 'downgraded' }, { kind: 'button-secondary', label: '今天 Rest', to: 'S09', toState: 'checked-not-started' }]}, { id: 'undo', label: '已调整可撤销', blocks: [mStatus(), { kind: 'card', label: '今天已调整：SOFTEN', sub: 'decision_id dec_204 · 仅今天生效 · 原课程可恢复', marker: 1 }, { kind: 'button-secondary', label: '撤销调整，恢复原课程', to: 'S09', toState: 'checked-not-started' }] }], {
    goal: '把 Daily Adapt 的 Keep/Soften/Swap/Rest 顺序变成可理解、可撤销的交互。', entry: 'S09 Check-in 建议', exit: ['S09'], role: baseMobileNotes.role,
    data: mobileData(['原课程与候选快照 — candidate_snapshots', '变更类型 — daily_adapt_runs', '撤销窗口 — 服务端状态']), actions: { primary: '确认当天调整', secondary: ['保持原课', '先 Soften', '查看 Backup A/B/C', '撤销调整'] }, statesDesc: ['预览', 'Soften 后', 'Swap/Rest', '可撤销', '无安全候选→Rest'], triggers: ['PUSH 默认 Keep；SOFT 先降 Overall/Running/Jump/局部负荷再 Swap；WARM 温和化/替换/休息'], deps: [...baseMobileNotes.deps], patches: ['V2-ADAPT'],
  }),
  mobileScreen('S21', '周期事实与未来 Re-plan', 'A09', 'C', [{ id: 'preview', label: '未来变化预览', blocks: [mStatus(), { kind: 'header', label: '实际周期已更新', sub: '今天：Check-in；未来：Re-plan', marker: 1, patch: true }, { kind: 'card', label: '将影响未来 6 个尚未发生的日期', sub: '已完成和过去日期不变；Keep / Adjust / Replace 逐日可查看' }, { kind: 'button-primary', label: '确认并更新未来计划', to: 'S08' }, { kind: 'button-secondary', label: '暂不更新', to: 'S09' }]}, { id: 'done', label: 'Re-plan 完成', blocks: [mStatus(), { kind: 'card', label: '未来计划已更新 · Plan v4', sub: '保持 21 天 · 调整 4 天 · 替换 2 天', marker: 1 }, { kind: 'button-primary', label: '查看日历差异', to: 'S08' }] }], {
    goal: '将用户确认的周期事实与当天状态分离，并只重排未来受影响日期。', entry: 'S19 PERIOD_STARTED / S28 档案修改', exit: ['S08', 'S09'], role: baseMobileNotes.role,
    data: mobileData(['cycle_facts — 用户确认事实与预测分开', 'replan_runs — affected_range、前后计划版本', '日期级 Keep/Adjust/Replace diff']), actions: { primary: '确认未来 Re-plan', secondary: ['查看差异', '暂不更新', '纠正日期'] }, statesDesc: ['预览', '处理中', '完成', '失败可重试'], triggers: ['同日先 Re-plan 未来，再 Adapt 今天'], deps: [...baseMobileNotes.deps], patches: ['V1-REPLAN'],
  }),
  mobileScreen('S25', '日历与训练回顾', 'A16', 'E', [{ id: 'default', label: '默认', blocks: [mStatus(), { kind: 'header', label: '日历 · 30 天滚动' }, { kind: 'calendar-grid', label: '颜色表示周期阶段；角标与图标表示训练状态', sub: '过去日期锁定；颜色不是唯一状态信号', height: 240, marker: 1 }, { kind: 'card', label: '本月已完成 8 次 · 160 分钟', sub: '非惩罚式训练回顾，不显示中断归零的 streak', marker: 2, patch: true }, { kind: 'header', label: '1月17日（今日）课程', sub: '点击日期展开' }, { kind: 'list-item', label: '定制课：低冲击核心 15min [开始]', sub: 'AI 定制标识', to: 'S10', marker: 3 }, { kind: 'list-item', label: '自选加练：手臂塑形 10min [删除↩可撤销]', sub: '自选标识（P1）', to: 'S10', marker: 4 }, { kind: 'button-secondary', label: '+ 加练', sub: '从课程库自选 · 仅计时长与能量，不计打卡连胜', to: 'S29', marker: 5 }, { kind: 'text', label: '当日无自选课时，仍可从课程库探索加练', sub: 'B-04 关联提示' }, { kind: 'resource-slot', slot: 'commerce', source: 'B41 场景化 SKU / B55 投放规则', label: '恢复较慢？试试 Jo 姐电解质冲剂', sub: '根据近期训练与恢复状态推荐 · 第三方平台下单', to: 'S32', patch: true, marker: 6 }, mTab('日历')] }], {
    goal: '以 30 天日历展示计划、完成和变更，不制造连续打卡压力。', entry: 'Tab 日历 / S08 / S21', exit: ['S09', 'S10', 'S29', 'S32'], role: baseMobileNotes.role,
    data: mobileData(['training_plan/days — 计划服务', '完成记录/反馈 — course_sessions', 'Re-plan diff — replan_runs', '场景化 SKU — B41/B55 投放规则']), actions: { primary: '查看某日课程', secondary: ['查看变更原因', '加练（→ S29）', '场景化商品推荐（→ S32）'] }, statesDesc: ['默认', '单日展开', 'Re-plan 标记', '无计划'], triggers: ['不支持补打历史日期；Daily Adapt 不改未来', '场景化销售：连续 Soft/休息→恢复类 SKU；黄体期高训练量→镁/蛋白类；经期→暖饮类'], deps: [...baseMobileNotes.deps], patches: ['V1-CALENDAR'],
  }),
  mobileScreen('S28', '健康档案修改与影响预览', 'A25', 'E', [{ id: 'edit', label: '修改档案', blocks: [mStatus(), { kind: 'header', label: '健康档案' }, { kind: 'card', label: '问卷内容总结', sub: '主目标·减脂 / 能力 L2 / 周期规律 / 膝盖中度限制 / 生命周期·规律', marker: 1 }, { kind: 'input', label: '主目标', sub: 'FAT_LOSS · 可修改' }, { kind: 'input', label: '训练能力', sub: 'L2 · 可修改' }, { kind: 'input', label: '可训练时长', sub: '20 分钟' }, { kind: 'chip-row', label: '训练限制：膝盖（中度） · 跳跃耐受：低' }, { kind: 'input', label: '预测经期首日：2026-01-10', sub: '系统预测，可被实际记录覆盖' }, { kind: 'input', label: '实际经期首日：未记录', sub: '实际首日 = Cycle Day 1', marker: 2 }, { kind: 'card', label: '修改后生成 Profile v5；实际周期事实会触发未来 Re-plan', sub: '只影响未来未完成日期；已完成历史不覆盖', patch: true }, { kind: 'button-primary', label: '预览对未来计划的影响', toState: 'preview' }, { kind: 'button-secondary', label: '取消', to: 'S26' }]}, { id: 'preview', label: '影响预览', blocks: [mStatus(), { kind: 'header', label: '确认健康档案变化' }, { kind: 'card', label: '保持 18 天 · 调整 8 天 · 替换 4 天', sub: '变化来自新的能力/限制/周期字段和规则版本' }, { kind: 'list-item', label: 'Cycle Day 1：实际首日优先于预测首日' }, { kind: 'list-item', label: '历史日期锁定；未来日期展示 Keep / Adjust / Replace diff' }, { kind: 'button-primary', label: '确认并开始 Re-plan', to: 'S21' }, { kind: 'button-secondary', label: '返回修改', toState: 'edit' }] }], {
    goal: '展示问卷内容总结并支持修改；实际周期事实变更可预览、可确认、可审计。', entry: 'S26 健康档案卡片', exit: ['S21', 'S26'], role: baseMobileNotes.role,
    data: mobileData(['问卷总结字段 — 问卷评测服务（user_training_profiles）', '预测/实际周期事实 — cycle_facts 与 Cycle Timeline', '变更 diff — change_previews', '未来计划影响 — replan_runs']), actions: { primary: '确认并 Re-plan', secondary: ['预览影响', '返回修改'], destructive: '删除敏感数据进入独立删除流程' }, statesDesc: ['编辑', '影响预览', '提交中', '失败可恢复'], triggers: ['实际经期首日作为 Cycle Day 1；只影响未来日期；不生成长报告'], deps: [...baseMobileNotes.deps], patches: ['V1-HEALTH-PROFILE', 'V1-REPLAN'],
  }),
  mobileScreen('S29', '课程库（V1 浏览）', 'A17', 'F', [{ id: 'default', label: '浏览', blocks: [mStatus(), { kind: 'header', label: '课程库' }, { kind: 'input', label: '搜索课程 / ID' }, { kind: 'chip-row', label: '筛选：时长 · Workout Type · Body Area', sub: '设备只作为课程元数据展示；难度/空间/协调度不进入 V1 主筛选', marker: 1, patch: true }, { kind: 'list-item', label: '低冲击全身活动 · MOBILITY · FULL_BODY · 20min', to: 'S10' }, { kind: 'list-item', label: '温和力量 · STRENGTH · LOWER_BODY · 25min', to: 'S10' }, { kind: 'list-item', label: '恢复拉伸 · STRETCH_RECOVERY · FULL_BODY · 10min', to: 'S10' }, mTab('课程库')] }], {
    goal: '提供不绕过安全规则的自由浏览与兴趣探索。', entry: 'Tab 课程库 / S10', exit: ['S10'], role: baseMobileNotes.role,
    data: mobileData(['正式 taxonomy 的时长/类型/部位', 'Approved Course Profile 客观字段', '用户收藏/历史']), actions: { primary: '查看课程详情', secondary: ['搜索', '按正式字段筛选', '收藏'] }, statesDesc: ['默认', '搜索结果', '空结果', '课程已下架'], triggers: ['浏览筛选不等于推荐资格；播放前仍按课程状态校验'], deps: [...baseMobileNotes.deps], patches: ['V1-LIBRARY'],
  }, 'P1'),
];

const aSide = (label: string): WireBlock => ({ kind: 'sidebar', label });
const aShell = (label: string, sub: string): WireBlock[] => [aSide(label), { kind: 'topbar', label: `V1 控制面 / ${label}`, sub }, { kind: 'page-header', label }];

const B12_TAB_ITEMS = ['Priority / Hard Filter', 'Plan', 'Re-plan', 'Daily Adapt'];
const B12_TAB_STATES = ['priority', 'plan', 'replan', 'adapt'];
const b12Tabs = (activeStep: number): WireBlock => ({ kind: 'tabs', items: B12_TAB_ITEMS, activeStep, tabStates: B12_TAB_STATES, marker: 1 });

const B13_TAB_ITEMS = ['Plan', 'Re-plan', 'Daily Adapt', 'Combined'];
const B13_TAB_STATES = ['plan', 'replan', 'adapt', 'combined'];
const b13State = (id: string, label: string, activeStep: number, stage: string, detail: string, decision: string, right: string[]): ScreenDef['states'][number] => ({
  id,
  label,
  blocks: [
    ...aShell(`推荐系统 / 模拟 / ${stage}`, '角色：规则配置 / QA'),
    { kind: 'tabs', items: B13_TAB_ITEMS, activeStep, tabStates: B13_TAB_STATES, marker: 1 },
    { kind: 'split', label: `${stage} · 典型用户夹具`, sub: '共享 fixtures · 展示 profile_schema_version + 规则版本', items: ['L2 + knee MODERATE', '目标 FAT_LOSS', '周期事实：实际开始', '课程池：V2 APPROVED 268'], right: [detail, 'Profile v4 × course_profile_v2', 'rules_v2.0 · tagging_rules_v2.1 · eligibility_rules_v2.0'], marker: 2 },
    { kind: 'calendar-grid', label: stage === 'Daily Adapt' ? '今天：Training Intent / Keep / Soften / Backup' : '30 天：训练意图 / Primary / Backup / Re-plan diff', sub: stage === 'Daily Adapt' ? '仅今天可变；未来计划保持不变' : '过去/完成日期不变；点击日期查看阶段', height: 200 },
    { kind: 'split', label: `${stage} · 决策 trace`, sub: 'Hard Filter 读 Eligibility + 局部负荷；不用 Overall 反推旧 Cardio/Impact', items: [`stage: ${stage.toUpperCase()}`, decision, 'Primary + Backup A/B/C 快照', 'profile_schema_version: course_profile_v2'], right, marker: 3 },
    { kind: 'alert', tone: 'ok', label: stage === 'Daily Adapt' ? '不变量：Daily Adapt 只改今天；SOFT/WARM 优先降 Overall/Running/Jump/局部负荷' : '不变量：历史日期不变；无安全候选 → Rest/No Match', patch: true },
    { kind: 'button-primary', label: '提交回归结果并申请发布', to: 'B11' },
  ],
});

const B19_TAB_ITEMS = ['账户', 'User Profile', '30 天计划', 'Check-in/Re-plan', 'Decision Trace', '敏感访问'];
const B19_TAB_STATES = ['account', 'profile', 'plan', 'events', 'trace', 'audit'];
const b19State = (id: string, label: string, activeStep: number, content: WireBlock[]): ScreenDef['states'][number] => ({
  id,
  label,
  blocks: [
    ...aShell('用户与 CRM / 用户详情 / U-08771', '角色：CRM / 健康运营（受限）'),
    { kind: 'tabs', items: B19_TAB_ITEMS, activeStep, tabStates: B19_TAB_STATES, marker: 1 },
    ...content,
  ],
});

const adminV1Screens: ScreenDef[] = [
  adminScreen('B03', '课程列表与 Profile 覆盖', '§4 B03', 'A', [{ id: 'default', label: '课程列表', blocks: [
    ...aShell('课程中心 / 课程列表', '角色：课程运营'),
    { kind: 'page-header', label: '课程列表 · Course Profile V2', sub: '只允许 APPROVED V2 Profile 进入推荐；FORBIDDEN / REVIEW / 安全字段缺失单独统计；保留 V1 对照列', patch: true },
    { kind: 'stat-row', items: ['312 节', 'V2 APPROVED 268', 'NEEDS_REVIEW 28', 'FORBIDDEN 8', '仅 V1 / 不一致 12'] },
    { kind: 'filter-bar', label: '搜索 ｜ Elig: FORBIDDEN/REVIEW/缺失 ｜ POSTPARTUM_RECOVERY ｜ 低置信/冲突 ｜ 仅V1 / 已生成V2 / V1≠V2' },
    { kind: 'table', cols: ['课程', 'Content', 'Workout', 'Body', 'Overall', 'M/P Elig', '动作摘要', 'V1/V2', '审核'], items: [
      'WALK_001 健走 ｜ WORKOUT ｜ WALKING ｜ FULL_BODY ｜ 3 ｜ A/A ｜ Run SOME / Jump NONE / Ankle LOW ｜ v1+v2 ｜ APPROVED',
      'HIIT_014 跳跃 ｜ WORKOUT ｜ HIIT ｜ FULL_BODY ｜ 5 ｜ F/F ｜ Run SOME / Jump FREQ / Ankle HIGH ｜ v1+v2 ｜ NEEDS_REVIEW',
      'PIL_CORE_008 ｜ WORKOUT ｜ PILATES ｜ CORE ｜ 2 ｜ R/R ｜ Jump NONE / Wrist SOME ｜ v1+v2 ｜ NEEDS_REVIEW',
      'PP_REC_003 产后 ｜ WORKOUT ｜ POSTPARTUM_RECOVERY ｜ CORE ｜ 2 ｜ A/R ｜ 白名单覆盖·双审 ｜ v1≠v2 ｜ NEEDS_REVIEW',
      'UNK_099 ｜ WORKOUT ｜ CARDIO ｜ FULL_BODY ｜ — ｜ R/R ｜ Run/Jump/Ankle UNKNOWN ｜ 仅V2 ｜ NEEDS_REVIEW',
    ], to: 'B04' },
    { kind: 'alert', tone: 'warn', label: '列表不再用单个 Impact 数字概括动作风险', sub: '改为 Running / Jump / Ankle 摘要；UNKNOWN 不显示为 Low', patch: true },
    { kind: 'button-primary', label: '+ 新建课程', to: 'B04' },
    { kind: 'button-secondary', label: '打开 B07 字段证据复核', to: 'B07' },
  ] }], {
    goal: '管理课程 V2 Profile 覆盖度、Eligibility 与审核入口；迁移期展示 V1/V2 版本。', entry: '后台侧边栏-课程中心', exit: ['B04', 'B07'], role: '课程运营 / 审核员',
    data: adminData(['courses', 'course_profile_v2 versions', 'eligibility + action_exposure 摘要', 'V1/V2 对照状态']),
    actions: { primary: '进入 Course Profile V2', secondary: ['按 FORBIDDEN/REVIEW/缺失筛选', 'POSTPARTUM_RECOVERY', 'V1/V2 不一致'] },
    statesDesc: ['默认', 'FORBIDDEN 筛选', '仅 V1', 'V1≠V2', '空'],
    triggers: ['未 APPROVED 或 Eligibility=REVIEW/FORBIDDEN 的安全字段不可作推荐候选'],
    deps: ['B04 Course Profile V2', 'B06 taxonomy/rules', 'B07 审核'], patches: ['V2-ADMIN-COURSE'],
  }),
  adminScreen('B04', 'Course Profile 详情与版本', '§4 B04', 'A', [
    { id: 'identity', label: 'Identity', blocks: [
      ...aShell('课程中心 / Course Profile V2 / WALK_001', '角色：课程运营 · 安全审核'),
      { kind: 'tabs', items: ['Identity', 'Intensity', 'Movement & Loads', 'Goals', 'Eligibility', 'Evidence & Versions'], activeStep: 0, tabStates: ['identity', 'intensity', 'movement', 'goals', 'eligibility', 'evidence'], marker: 1 },
      { kind: 'form-row', label: 'Identity', sub: 'content_type WORKOUT · primary_workout_type WALKING · primary_body_area FULL_BODY · duration_sec 1200' },
      { kind: 'form-row', label: 'Governance', sub: 'schema course_profile_v2 · tagging_rules_v2.1 · eligibility_rules_v2.0 · APPROVED' },
      { kind: 'panel', label: '字段链路', sub: '字段值 → 原始指标 → 命中规则 → 证据片段 → 来源/版本 → 审核状态', patch: true },
      { kind: 'button-primary', label: '保存为不可变 Profile 版本', to: 'B03' },
      { kind: 'button-secondary', label: '打开 B07 证据审核', to: 'B07' },
    ]},
    { id: 'intensity', label: 'Intensity', blocks: [
      ...aShell('Course Profile V2 / Intensity', '字段级编辑需审核'),
      { kind: 'tabs', items: ['Identity', 'Intensity', 'Movement & Loads', 'Goals', 'Eligibility', 'Evidence & Versions'], activeStep: 1, tabStates: ['identity', 'intensity', 'movement', 'goals', 'eligibility', 'evidence'] },
      { kind: 'form-row', label: 'overall / met / met_source / calorie_type / status', sub: '3 · 3.5 · CURATED_LOOKUP · GROSS · CONFIRMED（overall null → REVIEW，不得默认为低）' },
      { kind: 'alert', tone: 'info', label: '不要用 Overall 反推旧 Cardio / Muscular / Impact', patch: true },
      { kind: 'button-primary', label: '提交字段审核', to: 'B07' },
    ]},
    { id: 'movement', label: 'Movement & Loads', blocks: [
      ...aShell('Course Profile V2 / Movement & Loads', 'ObservationLevel + LocalLoadLevel'),
      { kind: 'tabs', items: ['Identity', 'Intensity', 'Movement & Loads', 'Goals', 'Eligibility', 'Evidence & Versions'], activeStep: 2, tabStates: ['identity', 'intensity', 'movement', 'goals', 'eligibility', 'evidence'] },
      { kind: 'form-row', label: 'action_exposure', sub: 'running SOME · jump NONE · wrist_bearing NONE（值域 NONE/SOME/FREQUENT/UNKNOWN）' },
      { kind: 'form-row', label: 'local_load', sub: 'knee LOW · ankle LOW · lower_back LOW · shoulder LOW（LOW/MEDIUM/HIGH/UNKNOWN）' },
      { kind: 'split', label: '原始指标', sub: 'Motion 观察事实', items: ['jump_ratio 0%', 'running_ratio 18%', 'standing 100%'], right: ['规则 TAG_JUMP_OBS_V2', '证据 02:10–05:30', 'UNKNOWN → NEEDS_REVIEW'] },
      { kind: 'button-primary', label: '提交字段审核', to: 'B07' },
    ]},
    { id: 'goals', label: 'Goals', blocks: [
      ...aShell('Course Profile V2 / Goals', '查表规则来源'),
      { kind: 'tabs', items: ['Identity', 'Intensity', 'Movement & Loads', 'Goals', 'Eligibility', 'Evidence & Versions'], activeStep: 3, tabStates: ['identity', 'intensity', 'movement', 'goals', 'eligibility', 'evidence'] },
      { kind: 'form-row', label: 'goal_contributions (1–5)', sub: 'fat_loss 4 · body_shaping 2 · healthy_living 5 · postpartum_recovery 3 · 规则 TAG_GOAL_LOOKUP_V2' },
      { kind: 'button-secondary', label: '查看查表来源' },
    ]},
    { id: 'eligibility', label: 'Eligibility', blocks: [
      ...aShell('Course Profile V2 / Eligibility', 'ALLOWED / FORBIDDEN / REVIEW'),
      { kind: 'tabs', items: ['Identity', 'Intensity', 'Movement & Loads', 'Goals', 'Eligibility', 'Evidence & Versions'], activeStep: 4, tabStates: ['identity', 'intensity', 'movement', 'goals', 'eligibility', 'evidence'] },
      { kind: 'form-row', label: 'menstrual / postpartum / inversion', sub: 'ALLOWED · ALLOWED · NONE · triggered_rule_ids: ELIG_MENST_LOW_IMPACT, ELIG_PP_STANDING_OK' },
      { kind: 'alert', tone: 'warn', label: 'POSTPARTUM_RECOVERY 类型命中 ≠ 自动 ALLOWED', sub: '须展示覆盖了哪些普通禁用规则，并经健康运营终审', patch: true },
      { kind: 'button-primary', label: '打开 B07 终审', to: 'B07' },
    ]},
    { id: 'evidence', label: 'Evidence & Versions', blocks: [
      ...aShell('Course Profile V2 / Evidence & Versions', '不可变版本 diff'),
      { kind: 'tabs', items: ['Identity', 'Intensity', 'Movement & Loads', 'Goals', 'Eligibility', 'Evidence & Versions'], activeStep: 5, tabStates: ['identity', 'intensity', 'movement', 'goals', 'eligibility', 'evidence'] },
      { kind: 'split', label: '字段：action_exposure.jump = NONE', sub: '置信度 0.95 · Motion mj_walk_42', items: ['02:10–05:30', '连续站立走步', '观察：无跳跃落地'], right: ['接受 / 修改 / 设 UNKNOWN / 驳回', 'reason_code 必填', '生成版本 diff'] },
      { kind: 'panel', label: 'V1/V2 只读对照', sub: 'Impact 1 ≠ Running SOME / Jump NONE / Ankle LOW（非一对一）；无可靠映射显示「不可自动迁移」', patch: true },
      { kind: 'button-primary', label: '保存审核意见', to: 'B03' },
    ]},
  ], {
    goal: '用 Course Profile V2 分组结构、字段证据链路和不可变版本替代 V1 扁平字段。', entry: 'B03 课程列表', exit: ['B03', 'B06', 'B07'], role: '课程运营 / 安全审核员',
    data: adminData(['course_profile_v2', 'course_tag_evidence', 'course_profile_reviews', 'V1 snapshot 只读对照']),
    actions: { primary: '按 Identity→Evidence 六页签查看/编辑', secondary: ['版本 diff', 'V1/V2 对照', '提交审核'] },
    statesDesc: ['Identity', 'Intensity', 'Movement & Loads', 'Goals', 'Eligibility', 'Evidence & Versions'],
    triggers: ['媒体变化或规则版本不兼容时创建新 Profile 版本；不覆盖历史'],
    deps: ['B06 taxonomy/rules', 'B07 审核', 'S10'], patches: ['V2-COURSE-PROFILE'],
  }),
  adminScreen('B06', 'Taxonomy 与规则版本', '§4 B06', 'A', [
    { id: 'default', label: '字典与规则版本', blocks: [
      ...aShell('标准与问卷 / Taxonomy & Rules V2', '角色：配置管理员'),
      { kind: 'page-header', label: '标准字典与规则版本', sub: 'course_profile_v2 · course_tagging_rules_v2 · course_eligibility_rules_v2 · taxonomy_2026_08_28', patch: true },
      { kind: 'tabs', items: ['course_profile_v2', 'tagging_rules_v2', 'eligibility_rules_v2', 'Taxonomy'], activeStep: 0, tabStates: ['profile', 'tagging', 'eligibility', 'taxonomy'], marker: 1 },
      { kind: 'table', cols: ['版本对象', 'Technical key 示例', '值域', '状态'], items: [
        'course_profile_v2 ｜ action_exposure.jump ｜ NONE/SOME/FREQUENT/UNKNOWN ｜ published',
        'course_profile_v2 ｜ eligibility.menstrual ｜ ALLOWED/FORBIDDEN/REVIEW ｜ published',
        'course_profile_v2 ｜ local_load.knee ｜ LOW/MEDIUM/HIGH/UNKNOWN ｜ published',
        'course_tagging_rules_v2 ｜ TAG_JUMP_OBS_V2 ｜ 阈值→ObservationLevel ｜ published',
        'course_eligibility_rules_v2 ｜ ELIG_MENST_JUMP_FREQ ｜ Jump FREQUENT → FORBIDDEN ｜ published',
      ], marker: 2 },
      { kind: 'split', label: '待决项（需求冻结前）', sub: '已发布 key 不可原地改语义', items: ['BACK_SHOULDER 命名', 'Recovery Content Type vs Workout Type 双重含义', 'Postpartum Recovery 白名单覆盖范围'], right: ['unknown ≠ 低风险', 'Pregnancy 仅用户侧 Block', 'equipment 不参与主匹配', '弃用须提供替代 key'], marker: 3 },
      { kind: 'alert', tone: 'warn', label: '已发布 technical key 不允许原地改语义', sub: '问卷、Course Profile、规则、客户端须兼容校验后发新版本', patch: true },
      { kind: 'button-primary', label: '创建规则/字典草稿' },
      { kind: 'button-secondary', label: '校验引用关系' },
    ]},
    { id: 'tagging', label: 'tagging_rules_v2', blocks: [
      ...aShell('Taxonomy / course_tagging_rules_v2', '强度 · 动作暴露 · 局部负荷'),
      { kind: 'tabs', items: ['course_profile_v2', 'tagging_rules_v2', 'eligibility_rules_v2', 'Taxonomy'], activeStep: 1, tabStates: ['profile', 'tagging', 'eligibility', 'taxonomy'] },
      { kind: 'table', cols: ['Rule ID', '输入', '输出', '版本'], items: [
        'TAG_INTENSITY_OVERALL_V2 ｜ Motion 节奏/密度 ｜ overall 1–5 | null ｜ v2.1',
        'TAG_JUMP_OBS_V2 ｜ jump_ratio ｜ NONE/SOME/FREQUENT/UNKNOWN ｜ v2.1',
        'TAG_KNEE_LOAD_V2 ｜ 下肢动作事实 ｜ LOW/MEDIUM/HIGH/UNKNOWN ｜ v2.1',
        'TAG_GOAL_LOOKUP_V2 ｜ type × overall ｜ goal_contributions ｜ v2.1',
      ] },
      { kind: 'button-secondary', label: '返回总览' },
    ]},
    { id: 'eligibility', label: 'eligibility_rules_v2', blocks: [
      ...aShell('Taxonomy / course_eligibility_rules_v2', '经期 · 产后 · 白名单'),
      { kind: 'tabs', items: ['course_profile_v2', 'tagging_rules_v2', 'eligibility_rules_v2', 'Taxonomy'], activeStep: 2, tabStates: ['profile', 'tagging', 'eligibility', 'taxonomy'] },
      { kind: 'table', cols: ['Rule ID', '条件', '结果', '覆盖'], items: [
        'ELIG_MENST_JUMP_FREQ ｜ Jump FREQUENT ｜ menstrual FORBIDDEN ｜ —',
        'ELIG_PP_KNEE_HIGH ｜ Knee HIGH ｜ postpartum FORBIDDEN ｜ —',
        'ELIG_UNKNOWN_BLOCK ｜ 任意 UNKNOWN ｜ REVIEW ｜ 禁止当 Allowed',
        'ELIG_PP_WHITELIST_OVERRIDE ｜ POSTPARTUM_RECOVERY ｜ 覆盖普通禁用 ｜ 仍需终审 ≠ ALLOWED',
      ] },
      { kind: 'alert', tone: 'warn', label: '白名单只覆盖普通禁用规则，不自动 ALLOWED', patch: true },
    ]},
  ], {
    goal: '可视化 course_profile_v2 / tagging_rules_v2 / eligibility_rules_v2 三套版本对象。', entry: '后台侧边栏-标准与问卷', exit: ['B04', 'B09', 'B12'], role: '配置管理员 / 产品 / 安全审核员',
    data: adminData(['taxonomy_versions', 'course_tagging_rules_v2', 'course_eligibility_rules_v2', '发布审计']),
    actions: { primary: '查看三版本对象', secondary: ['校验引用', '创建草稿', '标记待决项'] },
    statesDesc: ['profile schema', 'tagging rules', 'eligibility rules', 'taxonomy'],
    triggers: ['发布需二次审批；已发布 key 不可改语义'],
    deps: ['B04', 'B09', 'B12'], patches: ['V2-TAXONOMY-RULES'],
  }),
  adminScreen('B07', 'AI 打标与字段证据审核', '§4 B07', 'A', [{ id: 'queue', label: '三栏复核', blocks: [
    ...aShell('课程中心 / B07 字段证据复核', '角色：内容运营 + 健康运营终审'),
    { kind: 'page-header', label: '字段证据复核 · 播放器 + 字段表单 + 规则解释', sub: 'Motion/Go 只生成草稿；UNKNOWN/冲突进 REVIEW；未 APPROVED 不进候选', marker: 1, patch: true },
    { kind: 'filter-bar', label: '批次 #42 ｜ confidence < 0.75 ｜ Eligibility REVIEW/FORBIDDEN ｜ UNKNOWN ｜ POSTPARTUM_RECOVERY 双审' },
    { kind: 'split', label: '左：视频 / 时间轴 / 证据', sub: '中：正式字段 · AI建议 · 裁决｜右：指标 · 阈值 · 规则', items: [
      'HIIT_014 · 03:00–05:10 连续跳跃',
      '播放器 / 字幕 / 关键帧',
      '点击证据定位 Jump FREQUENT',
    ], right: [
      'jump FREQUENT · 接受/修改/设 UNKNOWN/驳回',
      'knee HIGH · ankle HIGH · 必填 reason_code',
      'menstrual FORBIDDEN · ELIG_MENST_JUMP_FREQ',
      'postpartum FORBIDDEN · 健康运营终审',
    ], marker: 2 },
    { kind: 'form-row', label: '裁决与原因码', sub: '接受 / 修改 / 设 Unknown / 驳回 / 提交终审；修改或驳回必填 EVIDENCE_MISMATCH | RULE_CONFLICT | LOW_CONFIDENCE | CLINICAL_OVERRIDE' },
    { kind: 'alert', tone: 'warn', label: 'POSTPARTUM_RECOVERY：展示覆盖了哪些普通禁用规则；类型命中 ≠ 自动 ALLOWED', sub: '必须健康运营终审', patch: true },
    { kind: 'button-primary', label: '提交终审并生成不可变 Profile 版本' },
    { kind: 'button-secondary', label: '退回 Motion/Go 重跑' },
  ] }], {
    goal: '三栏布局完成字段级证据复核；支持 Unknown 与终审，不把 UNKNOWN 当安全结论。', entry: 'B03 / 打标任务', exit: ['B03', 'B04'], role: '内容运营复核员 / 健康运营',
    data: adminData(['motion_jobs', 'go rule drafts', 'field evidence/confidence', 'reason_codes', 'review audit']),
    actions: { primary: '接受/修改/设 Unknown/驳回/提交终审', secondary: ['证据定位', '退回重跑', '仅低风险高置信可批量'] },
    statesDesc: ['三栏复核', '高风险双审', 'POSTPARTUM 白名单终审', '队列空'],
    triggers: ['UNKNOWN/FORBIDDEN 安全字段不可批量接受'],
    deps: ['Motion', 'Go 规则', 'B04', 'B06'], patches: ['V2-AI-REVIEW'],
  }),
  adminScreen('B08', 'Onboarding 问卷版本', '§4 B08', 'B', [{ id: 'default', label: '版本列表', blocks: [
    ...aShell('标准与问卷 / Onboarding', '角色：问卷编辑 / 发布审批'), { kind: 'page-header', label: 'Onboarding 问卷版本', sub: '15 个主问题 + 条件分支；已发布版本不可原地编辑', patch: true }, { kind: 'stat-row', items: ['线上 onboarding_v1.0', '草稿 2', '待审核 1', '安全分支 8', '迁移补充待办 324'] }, { kind: 'table', cols: ['版本', '状态', '主问题', '分支', '提交', '操作'], items: ['v1.1 ｜ 草稿 ｜ 15 ｜ 12 ｜ — ｜ 编辑', 'v1.0 ｜ 已发布 ｜ 15 ｜ 10 ｜ 12,480 ｜ 查看快照/复制', 'v0.9 ｜ 已停用 ｜ 12 ｜ 4 ｜ 8,203 ｜ 只读'], to: 'B09' }, { kind: 'button-primary', label: '+ 新建/复制问卷', to: 'B09' }] }], {
    goal: '管理问卷、分支和 Profile 推导版本，保证草稿/已发布/历史快照稳定。', entry: '后台侧边栏-标准与问卷', exit: ['B09', 'B10'], role: '问卷编辑 / 发布审批人', data: adminData(['questionnaire_versions', 'questions/options/branch_rules', '提交与 Profile 版本关联']), actions: { primary: '编辑或复制版本', secondary: ['查看快照', '查看迁移覆盖', '配置里程碑'] }, statesDesc: ['版本列表', '草稿', '已发布只读', '校验失败'], triggers: ['已开始的草稿固定问卷版本；发布新版本不改历史答案'], deps: ['S04 Onboarding', 'B09 编辑器', 'B10 Profile 推导'], patches: ['V1-QUESTIONNAIRE', 'D07'],
  }),
  adminScreen('B09', '问卷编辑器与分支校验', '§4 B09', 'B', [{ id: 'editing', label: '编辑中', blocks: [
    ...aShell('标准与问卷 / Onboarding / 编辑器', '角色：问卷编辑'), { kind: 'page-header', label: '问卷编辑器 · onboarding_v1.1 草稿', sub: '主问题、条件分支、敏感字段、技术值与 Profile 推导规则', patch: true }, { kind: 'split', label: '题目列表（15 个主问题）', sub: '当前 Q08：受限部位/严重程度', items: ['Q01 年龄', 'Q03 主目标', 'Q06 连续训练 20min 能力', 'Q08 身体限制 + severity', 'Q12 设备：已取消，不写 User Profile', 'Q15 生命周期分支'], right: ['Q08 → limitations[]', 'Q15=PREGNANT → Block', 'Q06 → fitness_capacity L1–L5', 'Q13 Pilates/Yoga → PILATES/YOGA', '所有安全字段有推导或 Block'], marker: 1 }, { kind: 'form-row', label: '复测里程碑', sub: 'Check-in：30/60/90/180/365 天；首次登录：90/180/365 天（可配置版本）' }, { kind: 'alert', tone: 'info', label: '发布前自动检查分支可达性、死循环、必答出口、字典引用和安全映射', patch: true }, { kind: 'button-primary', label: '校验并提交审核' }, { kind: 'button-secondary', label: '手机端预览 S04' }] }, { id: 'blocked', label: '校验失败', blocks: [...aShell('Onboarding / 校验失败', '不允许发布'), { kind: 'alert', tone: 'error', label: '校验未通过 · 3 项', sub: '分支死循环、PREGNANT 未映射 Block、存在已弃用 technical key', marker: 1 }, { kind: 'button-primary', label: '返回修复', to: 'B09' }] }], {
    goal: '编辑 15 个主问题、条件分支、Profile 字段映射并在发布前自动校验。', entry: 'B08 草稿', exit: ['B08', 'B10'], role: '问卷编辑', data: adminData(['questions/options/branch_rules', 'profile_derivation_rules', 'sensitivity/consent flags']), actions: { primary: '校验并提交审核', secondary: ['手机端预览', '查看路径图', '保存草稿'] }, statesDesc: ['编辑中', '校验失败', '预览', '他人修改冲突'], triggers: ['安全问题没有推导/Block 结果时禁止提交'], deps: ['S04/S05', 'B06 taxonomy', 'B10 Profile 推导'], patches: ['V1-QUESTIONNAIRE'],
  }),
  adminScreen('B10', 'User Profile 推导与安全校验', '§4 B10', 'B', [{ id: 'mapping', label: '字段推导', blocks: [
    ...aShell('标准与问卷 / Profile 推导', '角色：产品 / 安全审核'), { kind: 'page-header', label: 'User Training Profile 推导 · onboarding_v1.1', sub: '替代旧版加权分与长报告：结构化字段、来源、冲突与安全结果', patch: true }, { kind: 'table', cols: ['目标字段', '来源问题', '推导结果', '安全校验', '状态'], items: ['primary_goal ｜ Q03 ｜ FAT_LOSS ｜ — ｜ ✓', 'fitness_capacity ｜ Q06 ｜ L2 ｜ 值域 L1–L5 ｜ ✓', 'limitations.knee ｜ Q08 ｜ MODERATE ｜ Hard Filter 输入 ｜ ✓', 'lifecycle.stage ｜ Q15 ｜ PREGNANT ｜ V1 Block ｜ ⚠', 'equipment ｜ Q12 ｜ 不生成 ｜ 已从用户档案移除 ｜ ✓'], marker: 1 }, { kind: 'split', label: '回答快照', sub: 'Profile JSON + 字段来源', items: ['问卷提交 sub_1042', 'Profile v4', '字段来源可点击回到题目'], right: ['冲突：主/次目标均未选择', '冲突：盆底字段缺少课程标签', '动作：阻止发布/要求补字段'], marker: 2 }, { kind: 'button-primary', label: '保存推导规则并提交审核' }, { kind: 'button-secondary', label: '打开互动推导工作台', to: 'USER_TRAINING_PROFILE:U-08771:derivation' }, { kind: 'button-secondary', label: '运行典型夹具回归', to: 'B13' }] }], {
    goal: '将回答推导为 User Training Profile，并在发布前完成安全/冲突校验。', entry: 'B09 编辑器', exit: ['B08', 'B13'], role: '产品 / 安全审核', data: adminData(['profile_derivation_rules', 'profile_field_sources', 'safety validation results']), actions: { primary: '提交推导规则审核', secondary: ['运行典型样本', '查看字段来源', '查看版本差异'] }, statesDesc: ['编辑', '冲突', '孕期 Block', '回归通过', '已发布只读'], triggers: ['不再生成长评测报告；Profile 版本供 Plan/Re-plan 使用'], deps: ['B09', 'S04', 'B12'], patches: ['V1-PROFILE-DERIVATION', 'D01', 'D02', 'D03'],
  }),
  adminScreen('B11', '四阶段规则集列表', '§4 B11', 'C', [{ id: 'default', label: '规则列表', blocks: [
    ...aShell('推荐系统 / 规则版本', '角色：规则配置 / 发布审批'), { kind: 'page-header', label: '推荐规则 · rules_v1.0', sub: '全局优先级：Safety > Daily Check-in > Goal/Intent > Capacity > Cycle > Preference > History', marker: 1, patch: true }, { kind: 'stat-row', items: ['Priority 1', 'Plan 3', 'Re-plan 2', 'Daily Adapt 4', '回归失败 0'] }, { kind: 'table', cols: ['阶段', '规则集', '作用域', '版本', '状态', '操作'], items: ['Priority ｜ Hard Filter ｜ 全阶段 ｜ v1 ｜ 启用 ｜ 查看', 'Plan ｜ 30 天结构/候选 ｜ 未来 30 天 ｜ v1 ｜ 启用 ｜ 模拟', 'Re-plan ｜ 周期/Profile 变化 ｜ 未来受影响日 ｜ v1 ｜ 启用 ｜ 模拟', 'Daily Adapt ｜ Push/Soft/Warm ｜ 仅今天 ｜ v1 ｜ 草稿 ｜ 编辑'], to: 'B12', marker: 2 }, { kind: 'button-primary', label: '+ 创建规则集', to: 'B12' }] }], {
    goal: '把 Priority、Plan、Re-plan、Daily Adapt 拆成可独立回归、发布和回滚的规则集。', entry: '后台侧边栏-推荐系统', exit: ['B12', 'B13'], role: '规则配置 / 发布审批', data: adminData(['recommendation_rule_sets/versions', '命中率与 No Match 监控', '发布/回滚审计']), actions: { primary: '查看/编辑规则集', secondary: ['模拟', '查看影响评估', '发布/回滚'], destructive: '停用安全规则需二次确认和影响评估' }, statesDesc: ['默认', '草稿', '待审核', '已发布', '回滚'], triggers: ['规则发布记录最低客户端/Schema/taxonomy 兼容版本'], deps: ['B06', 'B07', 'B12', 'B13'], patches: ['V1-RULE-STAGE'],
  }),
  adminScreen('B12', '四阶段规则编辑器', '§4 B12', 'C', [
    { id: 'priority', label: 'Priority / Hard Filter', blocks: [...aShell('推荐规则 / Priority', 'Safety 规则需安全审批'), b12Tabs(0),
      { kind: 'form-row', label: '优先级（固定）', sub: 'Safety > Daily Check-in > Goal/Training Intent > Fitness Capacity > Cycle Context > Preference > History' },
      { kind: 'form-row', label: 'Hard Filter（V2）', sub: '读 Eligibility(menstrual/postpartum) + 用户限制 + local_load；UNKNOWN/REVIEW 不默认放行；PREGNANT → Block；无安全课 → NO_SAFE_COURSE_MATCH' },
      { kind: 'form-row', label: '输入版本', sub: 'profile_schema_version=course_profile_v2 · eligibility_rules_v2.0 · 保留 Primary Workout Type / Body Area / 目标意图' },
      { kind: 'button-primary', label: '保存并运行回归', to: 'B13' }]},
    { id: 'plan', label: 'Plan', blocks: [...aShell('推荐规则 / Plan', '不读取 Daily Check-in'), b12Tabs(1),
      { kind: 'form-row', label: '训练结构', sub: 'Training Structure → Daily Training Intent → Primary + Backup A/B/C' },
      { kind: 'form-row', label: 'Fitness Capacity', sub: '读取 Overall，并结合 primary_workout_type；不用 Overall 反推旧 Cardio/Muscular/Impact' },
      { kind: 'form-row', label: '匹配矩阵', sub: 'User Training Profile × Course Profile V2；只读 APPROVED；保留 Workout Type / Body Area / 目标意图' },
      { kind: 'button-primary', label: '保存并模拟', to: 'B13' }]},
    { id: 'replan', label: 'Re-plan', blocks: [...aShell('推荐规则 / Re-plan', '只影响未来受影响日期'), b12Tabs(2),
      { kind: 'form-row', label: '触发源', sub: '周期事实 / User Profile 新版本 / 规则或 Course Profile V2 失效' },
      { kind: 'form-row', label: '变更类型', sub: 'Keep > Adjust > Replace；过去/已完成日期不变' },
      { kind: 'button-primary', label: '保存并模拟', to: 'B13' }]},
    { id: 'adapt', label: 'Daily Adapt', blocks: [...aShell('推荐规则 / Daily Adapt', '只影响今天'), b12Tabs(3),
      { kind: 'form-row', label: 'Push', sub: '默认 Keep，不自动升级' },
      { kind: 'form-row', label: 'Soft / Warm（V2）', sub: '优先降低 Overall、Running、Jump 及相关 local_load，保留训练意图；再 Backup；无安全候选 → Rest' },
      { kind: 'form-row', label: '版本展示', sub: '迁移期展示 profile_schema_version 与规则版本差异（V1 vs V2 输入）' },
      { kind: 'button-primary', label: '保存并模拟', to: 'B13' }]},
  ], {
    goal: '用 V2 Eligibility / Overall / Running / Jump / local_load 编辑四阶段规则。', entry: 'B11 规则集', exit: ['B11', 'B13'], role: '规则配置 / 安全审核',
    data: adminData(['rule definition JSON/DSL', 'reason_codes', 'course_profile_v2 字段依赖', '规则版本矩阵']),
    actions: { primary: '保存并运行回归', secondary: ['查看候选/排除', '复制草稿', '提交审核'], destructive: '已发布规则只能停用/回滚' },
    statesDesc: ['Priority', 'Plan', 'Re-plan', 'Daily Adapt', '冲突检测失败'],
    triggers: ['禁止任意脚本；发布前静态校验 + 夹具回归'],
    deps: ['B06 V2 rules', 'B07 APPROVED Profile', 'B13'], patches: ['V2-RULE-ENGINE'],
  }),
  adminScreen('B13', '规则模拟与回归测试', '§4 B13', 'C', [
    b13State('plan', 'Plan', 0, 'Plan', 'Hard Filter：Eligibility FORBIDDEN/REVIEW → 排除；Pregnancy → Block', 'Goal / Capacity(Overall+Type) / Cycle → Primary + Backup', ['HIIT_014：Jump FREQUENT + menstrual FORBIDDEN → 排除', 'UNK_099：UNKNOWN 安全字段 → 排除', '无安全候选 → Rest / No Match']),
    b13State('replan', 'Re-plan', 1, 'Re-plan', '实际周期首日或 Profile 发生变化', '未来受影响日期：Keep / Adjust / Replace', ['已完成日期：锁定不变', '只更新未来未完成日期', '保留前后计划版本 + schema 版本 diff']),
    b13State('adapt', 'Daily Adapt', 2, 'Daily Adapt', 'ENERGY_LOW / Soft Day', 'Keep → Soften(Overall/Running/Jump/local_load) → Backup → Rest', ['只改今天', '保留目标 / Workout Type / Body Area', '展示 V1/V2 输入版本差异']),
    b13State('combined', 'Combined', 3, 'Combined', '先 Re-plan 未来，再 Adapt 今天', '周期事实 + 当日状态；匹配输入为 course_profile_v2', ['历史不覆盖', '未来显示 Re-plan diff', '今日 Soften 不读旧 Impact']),
  ], {
    goal: '验证 V2 输入版本下的 Plan/Re-plan/Adapt 结果、作用域与解释。', entry: 'B12 规则草稿 / B11', exit: ['B11', 'B12'], role: '规则配置 / QA / 安全审核',
    data: adminData(['fixtures 与 V2 版本矩阵', 'candidate_snapshots', 'eligibility/local_load 排除原因']),
    actions: { primary: '运行模拟/回归', secondary: ['导出 trace', '对比 V1/V2 输入结果', '提交发布'] },
    statesDesc: ['样本输入', '结果解释', '回归通过', '回归失败', '无安全匹配'],
    triggers: ['Combined 固定先 Re-plan 未来，再 Adapt 今天'],
    deps: ['B12', 'S08/S09/S20/S21'], patches: ['V2-SIMULATION'],
  }),
  adminScreen('B17', '营销标签与训练档案隔离', '§4 B17', 'F', [{ id: 'default', label: '标签分区', blocks: [
    ...aShell('用户与 CRM / 标签分区', '角色：CRM 运营'), { kind: 'page-header', label: '标签与分群', sub: '营销标签可运营；健康/训练条件只读来自 User Training Profile，不允许自由创建', patch: true }, { kind: 'tabs', items: ['营销标签', '训练档案（只读）', '分群规则'], activeStep: 0, tabStates: ['marketing', 'profile', 'segments'] }, { kind: 'table', cols: ['分区', '示例', '可编辑', '可导出'], items: ['营销 ｜ 来源：内容活动 ｜ 运营活动人群 ｜ 是 ｜ 脱敏后', '训练档案 ｜ fitness_capacity L2、knee MODERATE ｜ 只能由问卷/Profile 产生 ｜ 否（服务端字段）', '敏感生命周期 ｜ POSTPARTUM/PCOS ｜ 受限查看 ｜ 默认否'], marker: 1 }, { kind: 'alert', tone: 'warn', label: '禁止创建「大基数友好/PCOS 友好/产后风险」等自由健康标签', sub: '这些条件必须通过结构化 Profile 和权限审计管理', patch: true }] }], {
    goal: '防止 CRM 自定义标签污染安全规则，并隔离营销与敏感训练数据。', entry: '后台侧边栏-用户与 CRM', exit: ['B19'], role: 'CRM 运营 / 健康审核 / 审计员', data: adminData(['marketing tags', 'User Training Profile 只读摘要', '分群规则与权限']), actions: { primary: '管理营销标签/分群', secondary: ['查看 Profile 摘要（受限）', '导出脱敏营销人群'] }, statesDesc: ['营销标签', 'Profile 只读', '无权限', '导出待审批'], triggers: ['敏感字段默认不导出、不进入通用埋点'], deps: ['User Profile 服务', '权限/审计'], patches: ['V1-RBAC', 'D04'],
  }),
  adminScreen('B19', '用户 Profile 与推荐决策追踪', '§4 B19', 'F', [
    b19State('account', '账户', 0, [
      { kind: 'form-row', label: '账号', sub: 'U-08771 · 体验用户 · 订阅有效至 2026-06-20' },
      { kind: 'form-row', label: '隐私与同意', sub: '健康数据查看需目的+权限；敏感访问自动写入审计' },
      { kind: 'panel', label: '营销标签与训练档案隔离', sub: 'CRM 运营标签可编辑；User Training Profile 由问卷/Profile 服务生成并只读。', patch: true },
    ]),
    b19State('profile', 'User Profile', 1, [
      { kind: 'form-row', label: 'User Training Profile', sub: 'v4 · primary_goal FAT_LOSS · capacity L2 · knee MODERATE · lifecycle REGULAR' },
      { kind: 'form-row', label: '字段来源', sub: 'Onboarding v1.0 · 字段来源可追溯 · 敏感数据查看需目的+审计' },
      { kind: 'split', label: '结构化标签摘要', sub: '来源与规则', items: ['primary_goal：FAT_LOSS', 'fitness_capacity：L2', 'limitations.knee：MODERATE', 'lifecycle.stage：REGULAR'], right: ['Profile v4', 'Profile 推导 B10', '问卷答案可回溯', '冲突字段需安全审核'], marker: 2 },
      { kind: 'button-secondary', label: '查看完整标签与血缘', to: 'USER_TRAINING_PROFILE:U-08771:user' },
    ]),
    b19State('plan', '30 天计划', 2, [
      { kind: 'panel', label: '30 天计划：Plan v3', sub: '训练意图 / Primary / Backup A/B/C 可展开；过去日期锁定，未来变更显示 Re-plan 版本 diff。', patch: true },
      { kind: 'calendar-grid', label: '30 天：训练意图 / Primary / Backup / Re-plan diff', sub: '点击日期查看课程、候选和变更原因', height: 190 },
      { kind: 'split', label: '今日计划', sub: '候选快照', items: ['Training Intent：FAT_LOSS · CORE', 'Primary：核心激活 25min', 'Backup A/B/C：同意图备选'], right: ['课程 Profile v7', '规则 rules_v1.0', '今日不适进入 Daily Adapt', '历史完成记录不改'], marker: 2 },
    ]),
    b19State('events', 'Check-in/Re-plan', 3, [
      { kind: 'table', cols: ['时间', '事件', '作用域', '结果'], items: ['今日 08:10 ｜ ENERGY_LOW ｜ 仅今天 ｜ Soft → Soften', '今日 08:11 ｜ PERIOD_STARTED ｜ 未来未完成日 ｜ Re-plan 预览', '昨日 ｜ FEEL_GREAT ｜ 仅今天 ｜ Keep'], marker: 2 },
      { kind: 'panel', label: '事件边界', sub: 'Daily Adapt 只改今天；周期事实、Profile 版本或规则失效才触发未来 Re-plan。', patch: true },
    ]),
    b19State('trace', 'Decision Trace', 4, [
      { kind: 'steps', items: ['输入快照', 'Hard Filter', '候选池', '最终决策'], activeStep: 3 },
      { kind: 'split', label: '今日推荐 · dec_204', sub: '最终：SOFTEN / Soft · course_profile_v2', items: ['Profile v4', 'course_profile_v2', 'rules_v2.0', 'Check-in ENERGY_LOW'], right: ['Keep：保留目标/Workout Type/部位', 'Soften：降低 Overall/Running/Jump/local_load', 'Backup A：仍不适时才启用', '排除：Eligibility FORBIDDEN / Jump FREQ / UNKNOWN · reason_codes 可回到 APP'], marker: 2 },
      { kind: 'panel', label: '作用域边界', sub: '今日 SOFTEN 属于 Daily Adapt；周期实际首日变化属于 Re-plan，只影响未来未完成日期。', patch: true },
      { kind: 'button-secondary', label: '查看候选与排除明细' },
    ]),
    b19State('audit', '敏感访问', 5, [
      { kind: 'table', cols: ['时间', '角色', '目的', '字段范围', '结果'], items: ['08-28 10:15 ｜ 健康审核员 ｜ 复核 Profile ｜ limitations/lifecycle ｜ 已记录', '08-27 18:42 ｜ 客服 ｜ 查看账户 ｜ 无敏感字段 ｜ 已拒绝'], marker: 3 },
      { kind: 'alert', tone: 'info', label: '营销标签与敏感 Profile 分区；导出默认不包含敏感字段', patch: true },
    ]),
  ], {
    goal: '查看用户长期 Profile、30 天计划、Check-in/Re-plan 和推荐决策全链路。', entry: 'B18 用户列表', exit: ['B18', 'B17'], role: 'CRM / 健康运营 / 审计员', data: adminData(['user_training_profiles/field_sources', 'plans/intents/candidate snapshots', 'checkins/cycle facts/replans/decisions', '敏感访问审计']), actions: { primary: '查看 Profile 与 Decision Trace', secondary: ['查看计划 diff', '查看推荐原因', '申请敏感字段访问'] }, statesDesc: ['Profile', '计划', '事件', 'trace', '敏感审计', '无权限'], triggers: ['所有推荐可通过 trace id 回溯版本与排除原因'], deps: ['User/Profile/Recommendation API', 'B17 权限隔离'], patches: ['V1-USER-TRACE'],
  }),
  adminScreen('B31', '课程池与推荐质量抽查', '后端§4 课程组合抽查', 'C', [{ id: 'list', label: '质量抽查池', blocks: [
    ...aShell('推荐系统 / 质量抽查', '角色：课程运营 / 安全审核'), { kind: 'page-header', label: '推荐决策抽查池', sub: '抽查的是 Plan/Re-plan/Adapt 决策快照，不把 AI 当最终推荐模型', patch: true }, { kind: 'stat-row', items: ['今日决策 1,280', '抽查 64', 'No Match 1.2%', '高风险待看 8', '证据完整 97%'] }, { kind: 'filter-bar', label: '阶段：全部 ｜ 高风险 ｜ No Match ｜ 用户撤销 ｜ 规则版本 ｜ Course Profile 缺口' }, { kind: 'table', cols: ['trace', '输入版本', '结果', '排除原因', '抽查', '操作'], items: ['dec_204 ｜ Profile v4 × course_profile_v2 × rules_v2 ｜ Soft/Soften ｜ Jump FREQ + Elig FORBIDDEN ｜ 待抽查 ｜ 诊断', 'dec_205 ｜ Profile v2 × course_profile_v2 ｜ Rest ｜ 安全字段 UNKNOWN ｜ 高风险 ｜ 诊断', 'dec_206 ｜ Profile v4 × course_profile_v2 ｜ Keep ｜ 无 ｜ 已通过 ｜ 查看'], to: 'B31', marker: 1 }, { kind: 'button-primary', label: '运行高风险深度抽查' }, { kind: 'button-secondary', label: '打开 B13 回归', to: 'B13' }]}, { id: 'review', label: '抽查诊断', blocks: [...aShell('推荐系统 / 抽查诊断 / dec_204', '只读决策快照'), { kind: 'steps', items: ['Profile', 'Priority', '候选', 'Adapt 结果'], activeStep: 3 }, { kind: 'split', label: '推荐结果', sub: '规则与 course_profile_v2 版本', items: ['Today：Energy low', 'Soft → Soften(Overall/Running/Jump)', '目标/类型/部位保持', 'Backup A 作为第二路径'], right: ['排除 HIIT_014：Jump FREQUENT + menstrual FORBIDDEN', '排除 UNK_099：UNKNOWN', 'unknown：不放行', '完整 trace 可导出（脱敏）'] }, { kind: 'button-primary', label: '提交抽查结论' }, { kind: 'button-secondary', label: '标记为 Bad Case → B12', to: 'B12' }] }], {
    goal: '按风险、No Match、用户撤销和规则版本抽查真实决策，反哺规则与课程缺口。', entry: '推荐系统侧边栏', exit: ['B12', 'B13'], role: '课程运营 / 安全审核 / QA', data: adminData(['recommendation_decisions', 'candidate_snapshots/exclusions', '抽查与 Bad Case']), actions: { primary: '诊断并提交抽查结论', secondary: ['提高高风险采样', '跳转规则回归', '导出脱敏 trace'] }, statesDesc: ['抽查池', '诊断', 'Bad Case', '空队列'], triggers: ['Bad Case 只能创建规则/标签修复任务，不直接改用户历史决策'], deps: ['B12/B13', 'Course Profile 审核', '决策日志'], patches: ['V2-QUALITY'],
  }),
];

function replaceById<T extends { id: string }>(screens: T[], replacements: T[]): T[] {
  const replacementMap = new Map(replacements.map((screen) => [screen.id, screen]));
  return screens.map((screen) => replacementMap.get(screen.id) ?? screen);
}

export function applyMobileV1Overlay(screens: MobileScreenDef[]): MobileScreenDef[] {
  return replaceById(screens, mobileV1Screens);
}

export function applyAdminV1Overlay(screens: ScreenDef[]): ScreenDef[] {
  return replaceById(screens, adminV1Screens);
}
