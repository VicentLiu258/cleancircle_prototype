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
    { kind: 'chip-row', label: 'Overall 2/5 · Impact 1/5 · Jump 1 · Equipment：仅课程元数据', marker: 1 },
    { kind: 'card', label: '为什么今天推荐给你', sub: '匹配今日训练意图 + 符合 L2 能力与膝盖限制；周期仅作为上下文', marker: 2, patch: true },
    { kind: 'card', label: '安全说明', sub: '课程字段来自 Course Profile v7，状态 APPROVED；不是医疗诊断' },
    { kind: 'button-primary', label: '开始跟练', to: 'S11' }, { kind: 'button-secondary', label: '投屏' }, { kind: 'button-secondary', label: '查看备选课程' },
  ]}], {
    goal: '区分课程客观属性与个性化推荐理由，避免课程级周期适用结论。', entry: 'S09 / S25 / S29', exit: ['S11', 'S29'], role: baseMobileNotes.role,
    data: mobileData(['Course Profile 版本 — approved course_profile_versions', 'decision_id 与 reason_codes — recommendation_decisions', '播放/反馈 — course_sessions/feedback']),
    actions: { primary: '开始跟练', secondary: ['投屏', '查看备选', '反馈太难/不适'] }, statesDesc: ['默认', '加载', '无审核版本', '课程已下架'], triggers: ['只有 APPROVED Course Profile 可被推荐'], deps: [...baseMobileNotes.deps, '播放/投屏服务'], patches: ['V1-COURSE-DETAIL'],
  }),
  mobileScreen('S19', '每日 / 首次 Check-in 与状态确认', 'A10', 'C', [
    { id: 'daily-checkin', label: '一问 Check-in', blocks: [mStatus(), { kind: 'card', label: '每日 Check-in · 今天一次', sub: '首 7 次显示简短解释；之后可跳过', marker: 1, patch: true }, { kind: 'header', label: '今天感觉怎么样？' }, { kind: 'button-secondary', label: 'Yes, I feel great · FEEL_GREAT', toState: 'recommendation' }, { kind: 'button-secondary', label: 'Energy is low · ENERGY_LOW', toState: 'recommendation' }, { kind: 'button-secondary', label: 'I got my period · PERIOD_STARTED', toState: 'period-confirm', marker: 2 }, { kind: 'button-secondary', label: '跳过今天', to: 'S09', toState: 'unchecked' }]},
    { id: 'recommendation', label: '系统建议与用户确认', blocks: [mStatus(), { kind: 'header', label: '系统建议：Soft Day', sub: '原因：能量低 → 先降低冲击并保留训练意图', marker: 1, patch: true }, { kind: 'card', label: '今天只会调整今天；未来 29 天不变', sub: '建议：ADJUST；备选：Backup A / B / C' }, { kind: 'button-primary', label: '确认 Soft Day', to: 'S09', toState: 'checked-not-started' }, { kind: 'button-secondary', label: '我想改成 Push / Warm', toState: 'state-selection' }]},
    { id: 'state-selection', label: '自主选择状态', blocks: [mStatus(), { kind: 'header', label: '选择今天的状态' }, { kind: 'button-secondary', label: 'Push Day · 保持原安排', to: 'S09', toState: 'checked-not-started' }, { kind: 'button-secondary', label: 'Soft Day · 适度训练', to: 'S09', toState: 'checked-not-started' }, { kind: 'button-secondary', label: 'Warm Day · 温柔照顾', to: 'S09', toState: 'checked-not-started' }]},
    { id: 'period-confirm', label: '确认周期事实', blocks: [mStatus(), { kind: 'header', label: '确认今天是生理期开始日？' }, { kind: 'card', label: '周期事实与当天状态分开保存', sub: '确认后将预览未来受影响日期；今天仍需单独确认 Push/Soft/Warm', marker: 1, patch: true }, { kind: 'button-primary', label: '确认并预览未来变化', to: 'S21' }, { kind: 'button-secondary', label: '返回修改', toState: 'daily-checkin' }]},
  ], {
    goal: '用一个问题获取当天输入，先给出系统建议，再由用户确认或修改状态。', entry: 'S09 / 首次提交后的首个 Check-in', exit: ['S09', 'S21'], role: baseMobileNotes.role,
    data: mobileData(['checkin_answer — daily_checkins', 'suggested_state/confirmed_state — recommendation preview/confirm', '首 7 次说明展示计数 — 用户体验配置']),
    actions: { primary: '确认建议或自主选择状态', secondary: ['跳过', '查看状态解释', '确认周期事实'] }, statesDesc: ['一问', '系统建议', '自主选择', '周期事实确认', '预览过期'], triggers: ['确认时使用 preview_revision；过期返回 PREVIEW_STALE', 'Check-in 不能放宽长期限制'], deps: [...baseMobileNotes.deps], patches: ['V1-CHECKIN', 'D01', 'D10'],
  }),
  mobileScreen('S20', '当天调整与撤销', 'A09', 'C', [{ id: 'preview', label: '调整预览', blocks: [mStatus(), { kind: 'header', label: '先保护今天的训练意图', sub: 'Soft：先降低负荷/冲击，再尝试同意图备选', marker: 1, patch: true }, { kind: 'card', label: '原安排：核心力量 25min', sub: '当前结果：ADJUST → 低冲击核心 15min' }, { kind: 'card', label: '如果仍不合适：Backup A / B / C → 或今天休息', sub: '不会直接跨到无关课程；所有排除原因可查看' }, { kind: 'button-primary', label: '确认今天调整', to: 'S09', toState: 'downgraded' }, { kind: 'button-secondary', label: '保持原课', to: 'S09', toState: 'checked-not-started' }]}, { id: 'undo', label: '已调整可撤销', blocks: [mStatus(), { kind: 'card', label: '今天已调整：ADJUST', sub: 'decision_id dec_204 · 仅今天生效', marker: 1 }, { kind: 'button-secondary', label: '撤销调整，恢复原课程', to: 'S09', toState: 'checked-not-started' }] }], {
    goal: '把 Daily Adapt 的 Keep/Adjust/Replace/Rest 顺序变成可理解、可撤销的交互。', entry: 'S09 Check-in 建议', exit: ['S09'], role: baseMobileNotes.role,
    data: mobileData(['原课程与候选快照 — candidate_snapshots', '变更类型 — daily_adapt_runs', '撤销窗口 — 服务端状态']), actions: { primary: '确认当天调整', secondary: ['保持原课', '查看 Backup A/B/C', '撤销调整'] }, statesDesc: ['预览', '已调整', '可撤销', '无安全候选→Rest'], triggers: ['PUSH 默认 Keep；SOFT 先 Adjust 再 Replace；WARM 温和/替换/休息'], deps: [...baseMobileNotes.deps], patches: ['V1-ADAPT'],
  }),
  mobileScreen('S21', '周期事实与未来 Re-plan', 'A09', 'C', [{ id: 'preview', label: '未来变化预览', blocks: [mStatus(), { kind: 'header', label: '实际周期已更新', sub: '今天：Check-in；未来：Re-plan', marker: 1, patch: true }, { kind: 'card', label: '将影响未来 6 个尚未发生的日期', sub: '已完成和过去日期不变；Keep / Adjust / Replace 逐日可查看' }, { kind: 'button-primary', label: '确认并更新未来计划', to: 'S08' }, { kind: 'button-secondary', label: '暂不更新', to: 'S09' }]}, { id: 'done', label: 'Re-plan 完成', blocks: [mStatus(), { kind: 'card', label: '未来计划已更新 · Plan v4', sub: '保持 21 天 · 调整 4 天 · 替换 2 天', marker: 1 }, { kind: 'button-primary', label: '查看日历差异', to: 'S08' }] }], {
    goal: '将用户确认的周期事实与当天状态分离，并只重排未来受影响日期。', entry: 'S19 PERIOD_STARTED / S28 档案修改', exit: ['S08', 'S09'], role: baseMobileNotes.role,
    data: mobileData(['cycle_facts — 用户确认事实与预测分开', 'replan_runs — affected_range、前后计划版本', '日期级 Keep/Adjust/Replace diff']), actions: { primary: '确认未来 Re-plan', secondary: ['查看差异', '暂不更新', '纠正日期'] }, statesDesc: ['预览', '处理中', '完成', '失败可重试'], triggers: ['同日先 Re-plan 未来，再 Adapt 今天'], deps: [...baseMobileNotes.deps], patches: ['V1-REPLAN'],
  }),
  mobileScreen('S25', '日历与训练回顾', 'A16', 'E', [{ id: 'default', label: '默认', blocks: [mStatus(), { kind: 'header', label: '日历 · 30 天滚动' }, { kind: 'calendar-grid', label: '颜色表示周期阶段；角标与图标表示训练状态', sub: '过去日期锁定；颜色不是唯一状态信号', height: 240, marker: 1 }, { kind: 'card', label: '本月已完成 8 次 · 160 分钟', sub: '非惩罚式训练回顾，不显示中断归零的 streak', marker: 2, patch: true }, { kind: 'header', label: '1月17日（今日）课程', sub: '点击日期展开' }, { kind: 'list-item', label: '定制课：低冲击核心 15min [开始]', sub: 'AI 定制标识', to: 'S10', marker: 3 }, { kind: 'list-item', label: '自选加练：手臂塑形 10min [删除↩可撤销]', sub: '自选标识（P1）', to: 'S10', marker: 4 }, { kind: 'button-secondary', label: '+ 加练', sub: '从课程库自选 · 仅计时长与能量，不计打卡连胜', to: 'S29', marker: 5 }, { kind: 'text', label: '当日无自选课时，仍可从课程库探索加练', sub: 'B-04 关联提示' }, { kind: 'resource-slot', slot: 'commerce', source: 'B41 场景化 SKU / B55 投放规则', label: '恢复较慢？试试 Jo 姐电解质冲剂', sub: '根据近期训练与恢复状态推荐 · 第三方平台下单', to: 'S32', patch: true, marker: 6 }, mTab('日历')] }], {
    goal: '以 30 天日历展示计划、完成和变更，不制造连续打卡压力。', entry: 'Tab 日历 / S08 / S21', exit: ['S09', 'S10', 'S29', 'S32'], role: baseMobileNotes.role,
    data: mobileData(['training_plan/days — 计划服务', '完成记录/反馈 — course_sessions', 'Re-plan diff — replan_runs', '场景化 SKU — B41/B55 投放规则']), actions: { primary: '查看某日课程', secondary: ['查看变更原因', '加练（→ S29）', '场景化商品推荐（→ S32）'] }, statesDesc: ['默认', '单日展开', 'Re-plan 标记', '无计划'], triggers: ['不支持补打历史日期；Daily Adapt 不改未来', '场景化销售：连续 Soft/休息→恢复类 SKU；黄体期高训练量→镁/蛋白类；经期→暖饮类'], deps: [...baseMobileNotes.deps], patches: ['V1-CALENDAR'],
  }),
  mobileScreen('S28', '健康档案修改与影响预览', 'A25', 'E', [{ id: 'edit', label: '修改档案', blocks: [mStatus(), { kind: 'header', label: '健康档案' }, { kind: 'card', label: '问卷内容总结', sub: '主目标·减脂 / 能力 L2 / 周期规律 / 膝盖中度限制 / 生命周期·规律', marker: 1 }, { kind: 'input', label: '主目标', sub: 'FAT_LOSS · 可修改' }, { kind: 'input', label: '训练能力', sub: 'L2 · 可修改' }, { kind: 'input', label: '可训练时长', sub: '20 分钟' }, { kind: 'chip-row', label: '训练限制：膝盖（中度） · 跳跃耐受：低' }, { kind: 'input', label: '周期状态', sub: '规律 · 上次经期 2026-01-01' }, { kind: 'card', label: '修改后会生成 Profile v5，并仅影响未来日期', sub: '已完成历史不覆盖；确认后启动 Re-plan', marker: 2, patch: true }, { kind: 'button-primary', label: '预览对未来计划的影响', toState: 'preview' }, { kind: 'button-secondary', label: '取消', to: 'S26' }]}, { id: 'preview', label: '影响预览', blocks: [mStatus(), { kind: 'header', label: '确认健康档案变化' }, { kind: 'card', label: '保持 18 天 · 调整 8 天 · 替换 4 天', sub: '变化来自新的能力/限制/周期字段和规则版本' }, { kind: 'button-primary', label: '确认并开始 Re-plan', to: 'S21' }, { kind: 'button-secondary', label: '返回修改', toState: 'edit' }] }], {
    goal: '展示问卷内容总结并支持修改；变更可预览、可确认、可审计。', entry: 'S26 健康档案卡片', exit: ['S21', 'S26'], role: baseMobileNotes.role,
    data: mobileData(['问卷总结字段 — 问卷评测服务（user_training_profiles）', '变更 diff — change_previews', '未来计划影响 — replan_runs']), actions: { primary: '确认并 Re-plan', secondary: ['预览影响', '返回修改'], destructive: '删除敏感数据进入独立删除流程' }, statesDesc: ['编辑', '影响预览', '提交中', '失败可恢复'], triggers: ['只影响未来日期；不生成长报告'], deps: [...baseMobileNotes.deps], patches: ['V1-HEALTH-PROFILE'],
  }),
  mobileScreen('S29', '课程库（V1 浏览）', 'A17', 'F', [{ id: 'default', label: '浏览', blocks: [mStatus(), { kind: 'header', label: '课程库' }, { kind: 'input', label: '搜索课程 / ID' }, { kind: 'chip-row', label: '筛选：时长 · Workout Type · Body Area', sub: '设备只作为课程元数据展示；难度/空间/协调度不进入 V1 主筛选', marker: 1, patch: true }, { kind: 'list-item', label: '低冲击全身活动 · MOBILITY · FULL_BODY · 20min', to: 'S10' }, { kind: 'list-item', label: '温和力量 · STRENGTH · LOWER_BODY · 25min', to: 'S10' }, { kind: 'list-item', label: '恢复拉伸 · STRETCH_RECOVERY · FULL_BODY · 10min', to: 'S10' }, mTab('课程库')] }], {
    goal: '提供不绕过安全规则的自由浏览与兴趣探索。', entry: 'Tab 课程库 / S10', exit: ['S10'], role: baseMobileNotes.role,
    data: mobileData(['正式 taxonomy 的时长/类型/部位', 'Approved Course Profile 客观字段', '用户收藏/历史']), actions: { primary: '查看课程详情', secondary: ['搜索', '按正式字段筛选', '收藏'] }, statesDesc: ['默认', '搜索结果', '空结果', '课程已下架'], triggers: ['浏览筛选不等于推荐资格；播放前仍按课程状态校验'], deps: [...baseMobileNotes.deps], patches: ['V1-LIBRARY'],
  }, 'P1'),
];

const aSide = (label: string): WireBlock => ({ kind: 'sidebar', label });
const aShell = (label: string, sub: string): WireBlock[] => [aSide(label), { kind: 'topbar', label: `V1 控制面 / ${label}`, sub }, { kind: 'page-header', label }];

const adminV1Screens: ScreenDef[] = [
  adminScreen('B03', '课程列表与 Profile 覆盖', '§4 B03', 'A', [{ id: 'default', label: '课程列表', blocks: [
    ...aShell('课程中心 / 课程列表', '角色：课程运营'), { kind: 'page-header', label: '课程列表 · Course Profile 覆盖', sub: '只允许 APPROVED Profile 进入推荐候选；未审核/unknown 安全字段单独统计', patch: true }, { kind: 'stat-row', items: ['312 节课程', '已批准 280', '待审核 24', '高风险待复核 8', '安全字段缺失 6'] }, { kind: 'filter-bar', label: '搜索 ID/标题 ｜ Profile：全部 ｜ Review：全部 ｜ 安全完整度：全部 ｜ 主类型 ｜ 主部位' }, { kind: 'table', cols: ['课程', '主类型', '主部位', '负荷摘要', 'Profile', '审核', '操作'], items: ['VID-0187 ｜ PILATES ｜ CORE ｜ Overall 2 / Impact 1 ｜ v7 ｜ APPROVED ｜ 查看', 'VID-0203 ｜ STRETCH_RECOVERY ｜ FULL_BODY ｜ Overall 1 / Impact 1 ｜ v3 ｜ NEEDS_REVIEW ｜ 去审核', 'VID-0211 ｜ STRENGTH ｜ LOWER_BODY ｜ Wrist unknown ｜ v1 ｜ BLOCKED ｜ 补充字段'], to: 'B04' }, { kind: 'button-primary', label: '+ 新建课程', to: 'B04' }, { kind: 'button-secondary', label: '查看 AI 打标任务', to: 'B07' }] }], {
    goal: '管理 300+ 课程的 Profile 状态、覆盖度和审核入口。', entry: '后台侧边栏-课程中心', exit: ['B04', 'B07'], role: '课程运营 / 审核员', data: adminData(['课程基础与媒体 — courses', 'Course Profile A–E — course_profile_versions', '覆盖率与审核统计 — quality aggregates']), actions: { primary: '进入课程 Profile', secondary: ['筛选', '批量创建打标任务', '查看缺口'] }, statesDesc: ['默认', '空', '筛选无结果', '加载失败', '无权限'], triggers: ['Profile 未批准不允许上架为推荐候选'], deps: ['B04 Course Profile', 'B06 taxonomy', 'B07 审核队列'], patches: ['V1-ADMIN-COURSE'],
  }),
  adminScreen('B04', 'Course Profile 详情与版本', '§4 B04', 'A', [{ id: 'profile', label: 'Profile 详情', blocks: [
    ...aShell('课程中心 / Course Profile / VID-0187', '角色：课程运营 · 安全审核'), { kind: 'tabs', items: ['Identity', 'Loads', 'Movement', 'Goals & Risks', 'Evidence', 'Versions'], activeStep: 0, tabStates: ['identity', 'loads', 'movement', 'risk', 'evidence', 'versions'], marker: 1 }, { kind: 'form-row', label: 'Identity', sub: 'duration 1200s · primary_workout_type PILATES · secondary STRENGTH · primary_body_area CORE · equipment 仅元数据' }, { kind: 'form-row', label: 'Governance', sub: 'Profile v7 · taxonomy_2026_08_28 · APPROVED · 最后审核：安全审核员' }, { kind: 'panel', label: 'Course Profile 是课程客观属性；周期适用性不作为课程级标签', sub: '用户端的“为什么推荐”由 decision_id + User Profile + 当天状态动态生成', patch: true }, { kind: 'button-primary', label: '保存新 Profile 版本', to: 'B03' }, { kind: 'button-secondary', label: '打开 B07 证据审核', to: 'B07' }] }, { id: 'loads', label: 'Loads', blocks: [...aShell('Course Profile / Loads', '字段级编辑需审核'), { kind: 'form-row', label: 'Overall / Cardio / Muscular / Impact', sub: '2 / 1 / 3 / 1（均为 1–5，unknown 不得默认为低风险）' }, { kind: 'form-row', label: 'Local Loads', sub: 'knee 1 · wrist 2 · lower_back 2 · shoulder 1 · pelvic_floor 2 · core_pressure 3' }, { kind: 'alert', tone: 'warn', label: '高风险字段修改会回到 NEEDS_REVIEW', sub: '变更原因、证据、审核人和版本必须写入审计', patch: true }, { kind: 'button-primary', label: '提交字段审核', to: 'B07' }] }, { id: 'evidence', label: 'Evidence', blocks: [...aShell('Course Profile / Evidence', '可定位到视频片段'), { kind: 'split', label: '字段：wrist_bearing = 2', sub: '置信度 0.91 · basis VISION + TRANSCRIPT', items: ['02:10–03:40', '持续四点跪姿', '观察事实：手腕承重出现'], right: ['查看字典锚点', '接受 / 修改 / 设 unknown', '填写修改理由'] }, { kind: 'button-primary', label: '保存审核意见', to: 'B03' }] }], {
    goal: '用 Course Profile A–E、证据、置信度、审核和不可变版本替换旧二值标签。', entry: 'B03 课程列表', exit: ['B03', 'B06', 'B07'], role: '课程运营 / 安全审核员', data: adminData(['Course Profile vN — course_profile_versions', '字段级证据 — course_tag_evidence', '审核与纠正 — course_profile_reviews']), actions: { primary: '查看/编辑 Profile Tab', secondary: ['预览用户端 S10', '查看版本差异', '提交审核'] }, statesDesc: ['Identity', 'Loads', 'Movement', 'Goals/Risks', 'Evidence', 'Versions', '未批准/已回滚'], triggers: ['媒体内容变化或 taxonomy 不兼容时创建新 Profile 版本'], deps: ['B06 taxonomy', 'B07 审核', 'S10 课程详情'], patches: ['V1-COURSE-PROFILE', 'D04', 'D06'],
  }),
  adminScreen('B06', 'Taxonomy 标准字典', '§4 B06', 'A', [{ id: 'default', label: '字典版本', blocks: [
    ...aShell('标准与问卷 / Taxonomy', '角色：配置管理员'), { kind: 'page-header', label: '标准字典 · taxonomy_2026_08_28', sub: '技术键、展示文案、值域、正反例、unknown、依赖和弃用替代项', patch: true }, { kind: 'table', cols: ['Domain', 'Technical key', '展示值', '值域', '引用方', '状态'], items: ['Workout Type ｜ STRENGTH ｜ 力量 ｜ enum ｜ Course/Profile/规则 ｜ active', 'Workout Type ｜ YOGA ｜ 瑜伽 ｜ enum ｜ 问卷/课程/浏览 ｜ active', 'Body Area ｜ FULL_BODY ｜ 全身 ｜ enum ｜ Course/Intent ｜ active', 'Fitness ｜ L1–L5 ｜ 训练能力 ｜ enum ｜ User Profile ｜ active', 'Day State ｜ PUSH/SOFT/WARM ｜ 当天状态 ｜ enum ｜ Check-in/Adapt ｜ active'], marker: 1 }, { kind: 'alert', tone: 'warn', label: '已发布 technical key 不可原地改语义', sub: '引用它的问卷、Course Profile、规则和客户端必须通过兼容校验', patch: true }, { kind: 'button-primary', label: '创建新字典草稿' }, { kind: 'button-secondary', label: '校验引用关系' }] }], {
    goal: '让问卷、课程、规则、APP 和后台共享唯一标准字典。', entry: '后台侧边栏-标准与问卷', exit: ['B04', 'B09', 'B12'], role: '配置管理员 / 产品 / 安全审核员', data: adminData(['taxonomy_versions/terms', 'schema 与引用关系', '发布/弃用审计']), actions: { primary: '查看/创建字典版本', secondary: ['校验引用', '查看差异', '弃用条目'] }, statesDesc: ['版本列表', '草稿编辑', '校验失败', '已发布只读'], triggers: ['发布需二次审批；旧版本历史可读'], deps: ['User/Course Profile Schema', 'B09 问卷', 'B12 规则'], patches: ['V1-TAXONOMY', 'D03', 'D05', 'D06'],
  }),
  adminScreen('B07', 'AI 打标与字段证据审核', '§4 B07', 'A', [{ id: 'queue', label: '审核队列', blocks: [
    ...aShell('课程中心 / AI 打标审核', '角色：内容运营 + 安全审核'), { kind: 'page-header', label: 'AI 打标复核队列 · 高风险与低置信优先', sub: 'AI 只生成 Course Profile 草稿；未 APPROVED 不进入推荐候选', marker: 1, patch: true }, { kind: 'filter-bar', label: '批次 #42 ｜ confidence < 0.75 ｜ 安全字段 ｜ unknown ｜ 输入质量异常' }, { kind: 'split', label: '视频证据', sub: '字段级建议', items: ['VID-0203 · 12:10–13:40', '播放器/字幕/关键帧', '点击证据定位动作'], right: ['Impact Load 4 · 0.82 · 接受/修改/unknown', 'wrist_bearing unknown · 0.61 · 必须复核', 'risk postpartum MEDIUM · 原因：core pressure'], marker: 2 }, { kind: 'form-row', label: '审核意见', sub: '修改/驳回/unknown 必填 reason_code；高风险双人复核' }, { kind: 'button-primary', label: '提交审核结果并生成 Profile 草稿' }, { kind: 'button-secondary', label: '退回 AI 重跑' }] }], {
    goal: '把 AI/Excel 建议变成带证据、置信度、审核和版本的 Approved Course Profile。', entry: 'B03 / AI 打标任务', exit: ['B03', 'B04'], role: '内容运营复核员 / 安全审核员', data: adminData(['model_runs/tagging_jobs', '字段级 evidence/confidence', 'review decisions 与审计']), actions: { primary: '逐字段接受/修改/驳回/unknown', secondary: ['按证据定位', '退回重跑', '批量接受低风险高置信字段'] }, statesDesc: ['队列', '单课复核', '高风险双审', 'Excel 兜底', '队列空'], triggers: ['高风险/unknown 不可批量接受；安全审核通过后才能发布'], deps: ['AI Worker', 'B04 Profile', 'B06 taxonomy'], patches: ['V1-AI-REVIEW'],
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
  adminScreen('B12', '四阶段规则编辑器', '§4 B12', 'C', [{ id: 'priority', label: 'Priority / Hard Filter', blocks: [...aShell('推荐规则 / Priority', 'Safety 规则需安全审批'), { kind: 'form-row', label: '优先级（固定）', sub: 'Safety > Daily Check-in > Goal/Training Intent > Fitness Capacity > Cycle Context > Preference > History', marker: 1 }, { kind: 'form-row', label: 'Hard Filter', sub: 'Unknown 安全字段不默认放行；PREGNANT → Block；无安全课程 → NO_SAFE_COURSE_MATCH' }, { kind: 'button-primary', label: '保存并运行回归', to: 'B13' }]}, { id: 'plan', label: 'Plan', blocks: [...aShell('推荐规则 / Plan', '不读取 Daily Check-in'), { kind: 'form-row', label: '训练结构', sub: 'Training Structure → Daily Training Intent → Primary + Backup A/B/C' }, { kind: 'form-row', label: '排序输入', sub: 'Goal → Capacity → Cycle → Frequency/Duration → Preference → History' }, { kind: 'form-row', label: '候选约束', sub: '只读取 APPROVED Course Profile；equipment 不参与用户主匹配' }, { kind: 'button-primary', label: '保存并模拟', to: 'B13' }]}, { id: 'replan', label: 'Re-plan', blocks: [...aShell('推荐规则 / Re-plan', '只影响未来受影响日期'), { kind: 'form-row', label: '触发源', sub: '周期事实 / User Profile 新版本 / 规则或课程 Profile 失效' }, { kind: 'form-row', label: '变更类型', sub: 'Keep > Adjust > Replace；过去/已完成日期不变' }, { kind: 'button-primary', label: '保存并模拟', to: 'B13' }]}, { id: 'adapt', label: 'Daily Adapt', blocks: [...aShell('推荐规则 / Daily Adapt', '只影响今天'), { kind: 'form-row', label: 'Push', sub: '默认 Keep，不自动升级' }, { kind: 'form-row', label: 'Soft', sub: '先降低冲击/负荷/跳跃，保留训练意图，再使用 Backup' }, { kind: 'form-row', label: 'Warm', sub: '温和化 → 替换 → Rest' }, { kind: 'button-primary', label: '保存并模拟', to: 'B13' }]}], {
    goal: '用受限 DSL/决策表编辑四阶段规则，明确输入、作用域、动作、原因码和版本。', entry: 'B11 规则集', exit: ['B11', 'B13'], role: '规则配置 / 安全审核', data: adminData(['rule definition JSON/DSL', 'reason_codes 与解释文案', '输入字段依赖与版本']), actions: { primary: '保存并运行回归', secondary: ['查看候选/排除原因', '复制草稿', '提交审核'], destructive: '已发布规则只能停用/回滚，不能删除' }, statesDesc: ['Priority', 'Plan', 'Re-plan', 'Daily Adapt', '冲突检测失败'], triggers: ['禁止任意脚本；发布前静态校验 + 典型夹具回归'], deps: ['B06 taxonomy', 'B07 approved Profile', 'B13 模拟'], patches: ['V1-RULE-ENGINE', 'D09', 'D10'],
  }),
  adminScreen('B13', '规则模拟与回归测试', '§4 B13', 'C', [{ id: 'input', label: '样本输入', blocks: [...aShell('推荐系统 / 模拟与回归', '角色：规则配置 / QA'), { kind: 'tabs', items: ['Plan', 'Re-plan', 'Daily Adapt', 'Combined'], activeStep: 0, tabStates: ['plan', 'replan', 'adapt', 'combined'], marker: 1 }, { kind: 'split', label: '典型用户夹具', sub: '共享 fixtures · 不写真实用户计划', items: ['L2 + 膝盖 MODERATE', '目标 FAT_LOSS', '周期事实：实际开始', '课程池：Approved 280'], right: ['孕期 Block', '所有候选被 Hard Filter', '低能量 → Soft', '同日 Re-plan → Adapt'], marker: 2 }, { kind: 'button-primary', label: '运行模式模拟' }, { kind: 'button-secondary', label: '全部样本回归' }]}, { id: 'result', label: '结果与解释', blocks: [...aShell('推荐系统 / 模拟结果', '显示完整决策 trace'), { kind: 'calendar-grid', label: '30 天：训练意图 / Primary / Backup / Re-plan diff', sub: '过去/完成日期不变；点击日期查看阶段', height: 200 }, { kind: 'split', label: 'Day 3 · 决策 trace', sub: '候选排除与原因', items: ['stage: PLAN', 'Profile v4 × Course Profile v7 × rules_v1.0', 'Primary + Backup A/B/C 快照'], right: ['VID-0192：Impact 超限 → 排除', 'VID-0201：7 日重复 → 排除', '无安全候选 → Rest/No Match'], marker: 3 }, { kind: 'alert', tone: 'ok', label: '不变量通过：Daily Adapt 只改今天；Re-plan 不改历史', patch: true }, { kind: 'button-primary', label: '提交回归结果并申请发布', to: 'B11' }] }], {
    goal: '用 Plan/Re-plan/Daily Adapt/Combined 四种模式验证结果、作用域、候选和解释。', entry: 'B12 规则草稿 / B11 行模拟', exit: ['B11', 'B12'], role: '规则配置 / QA / 安全审核', data: adminData(['fixtures 与版本矩阵', 'candidate_snapshots/decision_exclusions', '回归不变量与 diff']), actions: { primary: '运行模拟/回归', secondary: ['导出 trace', '与线上版本对比', '提交发布审批'] }, statesDesc: ['样本输入', '结果解释', '回归通过', '回归失败', '无安全匹配'], triggers: ['Combined 固定先 Re-plan 未来，再 Adapt 今天'], deps: ['B12', 'S08/S09/S20/S21'], patches: ['V1-SIMULATION'],
  }),
  adminScreen('B17', '营销标签与训练档案隔离', '§4 B17', 'F', [{ id: 'default', label: '标签分区', blocks: [
    ...aShell('用户与 CRM / 标签分区', '角色：CRM 运营'), { kind: 'page-header', label: '标签与分群', sub: '营销标签可运营；健康/训练条件只读来自 User Training Profile，不允许自由创建', patch: true }, { kind: 'tabs', items: ['营销标签', '训练档案（只读）', '分群规则'], activeStep: 0, tabStates: ['marketing', 'profile', 'segments'] }, { kind: 'table', cols: ['分区', '示例', '可编辑', '可导出'], items: ['营销 ｜ 来源：内容活动 ｜ 运营活动人群 ｜ 是 ｜ 脱敏后', '训练档案 ｜ fitness_capacity L2、knee MODERATE ｜ 只能由问卷/Profile 产生 ｜ 否（服务端字段）', '敏感生命周期 ｜ POSTPARTUM/PCOS ｜ 受限查看 ｜ 默认否'], marker: 1 }, { kind: 'alert', tone: 'warn', label: '禁止创建「大基数友好/PCOS 友好/产后风险」等自由健康标签', sub: '这些条件必须通过结构化 Profile 和权限审计管理', patch: true }] }], {
    goal: '防止 CRM 自定义标签污染安全规则，并隔离营销与敏感训练数据。', entry: '后台侧边栏-用户与 CRM', exit: ['B19'], role: 'CRM 运营 / 健康审核 / 审计员', data: adminData(['marketing tags', 'User Training Profile 只读摘要', '分群规则与权限']), actions: { primary: '管理营销标签/分群', secondary: ['查看 Profile 摘要（受限）', '导出脱敏营销人群'] }, statesDesc: ['营销标签', 'Profile 只读', '无权限', '导出待审批'], triggers: ['敏感字段默认不导出、不进入通用埋点'], deps: ['User Profile 服务', '权限/审计'], patches: ['V1-RBAC', 'D04'],
  }),
  adminScreen('B19', '用户 Profile 与推荐决策追踪', '§4 B19', 'F', [{ id: 'overview', label: 'Profile 概览', blocks: [
    ...aShell('用户与 CRM / 用户详情 / U-08771', '角色：CRM / 健康运营（受限）'), { kind: 'tabs', items: ['账户', 'User Profile', '30 天计划', 'Check-in/Re-plan', 'Decision Trace', '敏感访问'], activeStep: 1, tabStates: ['account', 'profile', 'plan', 'events', 'trace', 'audit'], marker: 1 }, { kind: 'form-row', label: 'User Training Profile', sub: 'v4 · primary_goal FAT_LOSS · capacity L2 · knee MODERATE · lifecycle REGULAR' }, { kind: 'form-row', label: '来源与同意', sub: 'Onboarding v1.0 · 字段来源可追溯 · 敏感数据查看需目的+审计' }, { kind: 'panel', label: '30 天计划：Plan v3 · 训练意图/Primary/Backup A/B/C 可展开', sub: '过去日期锁定；未来变更显示 Re-plan 版本 diff', patch: true }, { kind: 'button-secondary', label: '查看完整标签与血缘', to: 'USER_TRAINING_PROFILE:U-08771:user' }, { kind: 'button-secondary', label: '查看最近一次 Decision Trace', to: 'B19' }]}, { id: 'trace', label: 'Decision Trace', blocks: [...aShell('用户详情 / Decision Trace', '只读审计视图'), { kind: 'steps', items: ['输入快照', 'Hard Filter', '候选池', '最终决策'], activeStep: 3 }, { kind: 'split', label: '今日推荐 · dec_204', sub: '最终：ADJUST / Soft', items: ['Profile v4', 'Course Profile v7', 'rules_v1.0', 'Check-in ENERGY_LOW'], right: ['Keep：原课程', 'Adjust：低冲击核心', '排除：Impact/重复/unknown', '解释 reason_codes 可回到 APP'], marker: 2 }, { kind: 'button-secondary', label: '查看候选与排除明细' }, { kind: 'button-secondary', label: '查看敏感访问审计', to: 'B19' }]}, { id: 'audit', label: '敏感访问审计', blocks: [...aShell('用户详情 / 敏感访问审计', '只读审计员'), { kind: 'table', cols: ['时间', '角色', '目的', '字段范围', '结果'], items: ['08-28 10:15 ｜ 健康审核员 ｜ 复核 Profile ｜ limitations/lifecycle ｜ 已记录', '08-27 18:42 ｜ 客服 ｜ 查看账户 ｜ 无敏感字段 ｜ 已拒绝'], marker: 3 }, { kind: 'alert', tone: 'info', label: '营销标签与敏感 Profile 分区；导出默认不包含敏感字段', patch: true }] }], {
    goal: '查看用户长期 Profile、30 天计划、Check-in/Re-plan 和推荐决策全链路。', entry: 'B18 用户列表', exit: ['B18', 'B17'], role: 'CRM / 健康运营 / 审计员', data: adminData(['user_training_profiles/field_sources', 'plans/intents/candidate snapshots', 'checkins/cycle facts/replans/decisions', '敏感访问审计']), actions: { primary: '查看 Profile 与 Decision Trace', secondary: ['查看计划 diff', '查看推荐原因', '申请敏感字段访问'] }, statesDesc: ['Profile', '计划', '事件', 'trace', '敏感审计', '无权限'], triggers: ['所有推荐可通过 trace id 回溯版本与排除原因'], deps: ['User/Profile/Recommendation API', 'B17 权限隔离'], patches: ['V1-USER-TRACE'],
  }),
  adminScreen('B31', '课程池与推荐质量抽查', '后端§4 课程组合抽查', 'C', [{ id: 'list', label: '质量抽查池', blocks: [
    ...aShell('推荐系统 / 质量抽查', '角色：课程运营 / 安全审核'), { kind: 'page-header', label: '推荐决策抽查池', sub: '抽查的是 Plan/Re-plan/Adapt 决策快照，不把 AI 当最终推荐模型', patch: true }, { kind: 'stat-row', items: ['今日决策 1,280', '抽查 64', 'No Match 1.2%', '高风险待看 8', '证据完整 97%'] }, { kind: 'filter-bar', label: '阶段：全部 ｜ 高风险 ｜ No Match ｜ 用户撤销 ｜ 规则版本 ｜ Course Profile 缺口' }, { kind: 'table', cols: ['trace', '输入版本', '结果', '排除原因', '抽查', '操作'], items: ['dec_204 ｜ Profile v4 × Course v7 × rules v1 ｜ Soft/Adjust ｜ Impact 超限 3 ｜ 待抽查 ｜ 诊断', 'dec_205 ｜ Profile v2 × Course v3 ｜ Rest ｜ 安全字段 unknown ｜ 高风险 ｜ 诊断', 'dec_206 ｜ Profile v4 × Course v7 ｜ Keep ｜ 无 ｜ 已通过 ｜ 查看'], to: 'B31', marker: 1 }, { kind: 'button-primary', label: '运行高风险深度抽查' }, { kind: 'button-secondary', label: '打开 B13 回归', to: 'B13' }]}, { id: 'review', label: '抽查诊断', blocks: [...aShell('推荐系统 / 抽查诊断 / dec_204', '只读决策快照'), { kind: 'steps', items: ['Profile', 'Priority', '候选', 'Adapt 结果'], activeStep: 3 }, { kind: 'split', label: '推荐结果', sub: '规则与 Course Profile 版本', items: ['Today：Energy low', 'Soft → Adjust', '目标/部位保持', 'Backup A 被选中'], right: ['排除 VID-0192：impact 4', '排除 VID-0201：重复限制', 'unknown：不放行', '完整 trace 可导出（脱敏）'] }, { kind: 'button-primary', label: '提交抽查结论' }, { kind: 'button-secondary', label: '标记为 Bad Case → B12', to: 'B12' }] }], {
    goal: '按风险、No Match、用户撤销和规则版本抽查真实决策，反哺规则与课程缺口。', entry: '推荐系统侧边栏', exit: ['B12', 'B13'], role: '课程运营 / 安全审核 / QA', data: adminData(['recommendation_decisions', 'candidate_snapshots/exclusions', '抽查与 Bad Case']), actions: { primary: '诊断并提交抽查结论', secondary: ['提高高风险采样', '跳转规则回归', '导出脱敏 trace'] }, statesDesc: ['抽查池', '诊断', 'Bad Case', '空队列'], triggers: ['Bad Case 只能创建规则/标签修复任务，不直接改用户历史决策'], deps: ['B12/B13', 'Course Profile 审核', '决策日志'], patches: ['V1-QUALITY'],
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
