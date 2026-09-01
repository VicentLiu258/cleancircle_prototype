import type { ScreenDef, WireBlock } from './types';

const mStatus = (): WireBlock => ({ kind: 'statusbar', label: '' });
const mTab = (): WireBlock => ({ kind: 'tabbar', label: '今日' });

const mCycleRuler = (): WireBlock => ({
  kind: 'cycle-ruler',
  label: 'DAY 19 · 黄体期第 6 天',
  sub: '预计 8 天后开始经期 · 周期仅作推荐上下文',
  marker: 2,
});

const mGreet = (greeting = '早上好，{昵称}'): WireBlock => ({
  kind: 'header',
  label: greeting,
  sub: '1月17日 周六 · 消息入口',
});

const mCheckinRow = (done: boolean, sub?: string): WireBlock => ({
  kind: 'checkin-row',
  label: done ? 'Check-in 已完成 ✓' : '今日状态：待记录',
  sub: sub ?? (done ? '能量中 · 情绪平稳 · 睡眠一般 · 无不适' : '完成后显示 Push / Soft / Warm Day'),
  to: 'S19',
  toState: 'daily-checkin',
  marker: done ? undefined : 3,
});

const mWorkPanel = (
  title: string,
  sub: string,
  opts: { to?: string; locked?: boolean; fallback?: boolean; marker?: number } = {},
): WireBlock => ({
  kind: 'course-panel',
  slot: 'work',
  source: '排课引擎 D03',
  label: title,
  sub: opts.locked ? `${sub} · 订阅后恢复` : opts.fallback ? `${sub} · 兜底标识（B-09）` : sub,
  to: opts.to ?? (opts.locked ? 'S22' : 'S10'),
  marker: opts.marker ?? 4,
  patch: opts.fallback || opts.locked,
});

const mJosNote = (observe: string, suggest: string): WireBlock => ({
  kind: 'jos-note',
  label: `观察：${observe}`,
  sub: `建议：${suggest}`,
  marker: 5,
});

const mBelowFold = (): WireBlock[] => [
  { kind: 'divider', label: '' },
  { kind: 'text', label: '今天还可以做', sub: '折叠下方 · 资源位区' },
  {
    kind: 'resource-slot',
    slot: 'fuel',
    source: '建议库 B14',
    label: '今日饮食营养建议',
    sub: '黄体期：补充优质蛋白与镁；避免过度节食',
    patch: true,
    marker: 6,
  },
  {
    kind: 'resource-slot',
    slot: 'care',
    source: 'Ritual 内容库',
    label: '经期暖饮 · 淋巴按摩 · 自我肯定冥想',
    sub: '音视频内容 · 后期可插入商品 SKU',
    patch: true,
    marker: 7,
  },
  {
    kind: 'resource-slot',
    slot: 'commerce',
    source: 'B41 / B55 运营配置',
    label: 'Jo 姐好物 · 精选训练补给',
    sub: '商品导购入口 · 第三方平台下单',
    to: 'S32',
    patch: true,
    marker: 8,
  },
];

const mTrialStrip = (label: string, sub?: string): WireBlock => ({
  kind: 'trial-strip',
  label,
  sub,
  to: 'S22',
  patch: true,
  marker: 1,
});

export const s09TodayScreen: ScreenDef = {
  id: 'S09',
  name: '今日首页',
  reqCode: 'A09',
  priority: 'P0',
  flow: 'A',
  states: [
    { id: 'unchecked', label: '未 Check-in', blocks: [
      mStatus(), mTrialStrip('体验第 3 天 / 共 7 天'), mGreet(), mCycleRuler(),
      mCheckinRow(false, '去记录 · 不会在你输入前预判疲劳'),
      mWorkPanel('原计划：全身活动 20min', 'MOBILITY · FULL_BODY · 低强度 · 完成 Check-in 后只调整今天'),
      mJosNote('周期黄体期第 6 天', '先完成 Check-in，再确认今天练什么'),
      { kind: 'button-primary', label: '完成 Check-in 后再开始', sub: 'Check-in 待完成', to: 'S19', toState: 'daily-checkin' },
      { kind: 'button-secondary', label: '今天太累，调整训练', to: 'S20', marker: 9 },
      ...mBelowFold(), mTab(),
    ]},
    { id: 'checked-not-started', label: '已确认·未开始', blocks: [
      mStatus(), mTrialStrip('体验第 3 天 / 共 7 天'), mGreet('下午好，{昵称}'), mCycleRuler(),
      mCheckinRow(true, '状态：Soft Day · 能量低'),
      mWorkPanel('低冲击核心活动 15min', 'ADJUST · MOBILITY · CORE · 20min · 原课可撤销'),
      mJosNote('你选择了 Soft Day · 能量低', '先降低冲击，保留今日训练意图'),
      { kind: 'button-primary', label: '开始训练', to: 'S10' },
      { kind: 'button-secondary', label: '今天太累，调整训练', to: 'S20' },
      ...mBelowFold(), mTab(),
    ]},
    { id: 'in-progress', label: '进行中', blocks: [
      mStatus(), mGreet('下午好，{昵称}'), mCycleRuler(),
      mCheckinRow(true, '状态：Soft Day · 训练中'),
      { kind: 'course-panel', slot: 'work', source: '排课引擎 D03', label: '低冲击核心活动 15min', sub: '进行中 · 已完成 8 / 15 min · 38%', marker: 4 },
      { kind: 'progress', label: '训练进度 53%' },
      mJosNote('你已训练 8 分钟', '继续完成剩余环节，或暂停后稍后继续'),
      { kind: 'button-primary', label: '继续训练', to: 'S11' },
      ...mBelowFold(), mTab(),
    ]},
    { id: 'completed', label: '已完成', blocks: [
      mStatus(), mGreet('晚上好，{昵称}'), mCycleRuler(),
      mCheckinRow(true, '状态：Soft Day · 已完成'),
      { kind: 'course-panel', slot: 'work', source: '排课引擎 D03', label: '低冲击核心活动 · 已完成', sub: '实际 16 min · +20 能量值已到账', marker: 4 },
      mJosNote('今日训练已完成 16 分钟', '好好休息，明天见'),
      { kind: 'button-secondary', label: '查看训练回顾', to: 'S25' },
      ...mBelowFold(), mTab(),
    ]},
    { id: 'downgraded', label: '已降级', blocks: [
      mStatus(), mGreet('晚上好，{昵称}'), mCycleRuler(),
      mCheckinRow(true, '状态：Warm Day · 已降级'),
      mWorkPanel('放松拉伸 10min · 低强度', 'ADJUST → 原课程：核心激活 25min（留痕）', { marker: 4 }),
      mJosNote('今天训练负担已降低', '若感觉恢复可撤销，恢复原课程'),
      { kind: 'button-primary', label: '开始降级课程', to: 'S10' },
      { kind: 'button-secondary', label: '撤销降级，恢复原课程', to: 'S20', toState: 'undo' },
      ...mBelowFold(), mTab(),
    ]},
    { id: 'trial-expiring', label: '体验临期', blocks: [
      mStatus(), mTrialStrip('体验第 7 天 / 共 7 天 · 明日到期', '点击开启订阅'),
      mGreet('早上好，{昵称}'), mCycleRuler(),
      mCheckinRow(true, '状态：Warm Day · 经期第 1 天'),
      mWorkPanel('经期舒缓 · 15min', 'STRETCH_RECOVERY · FULL_BODY · 低强度'),
      mJosNote('体验期明日到期', '订阅后可继续每日定制课程与状态建议'),
      { kind: 'button-primary', label: '开始训练', to: 'S10' },
      { kind: 'button-secondary', label: '开启订阅', to: 'S22' },
      ...mBelowFold(), mTab(),
    ]},
    { id: 'locked', label: '订阅锁定', blocks: [
      mStatus(),
      { kind: 'card', label: '体验已到期 · 定制内容已锁定', sub: '点击续订恢复每日状态建议（B-11）', to: 'S22', patch: true, marker: 1 },
      mGreet('早上好，{昵称}'), mCycleRuler(),
      { kind: 'checkin-row', label: '历史状态可见 · 定制建议已锁定', sub: '订阅后恢复', to: 'S22' },
      mWorkPanel('定制课程已锁定', '历史课表与打卡记录仍可查看', { locked: true, marker: 4 }),
      mJosNote('体验期已结束', '续订后恢复 Work/Fuel/Care 个性化推荐'),
      { kind: 'button-primary', label: '立即续订', to: 'S22' },
      { kind: 'card', label: '打卡记录 / 已购课程仍可查看', sub: 'B-11 权益锁定规则', patch: true },
      ...mBelowFold(), mTab(),
    ]},
    { id: 'fallback', label: '兜底课', blocks: [
      mStatus(), mGreet('早上好，{昵称}'), mCycleRuler(),
      mCheckinRow(true, '状态：Soft Day'),
      mWorkPanel('安全兜底课 · 全身放松 15min', '无可匹配课程 · 异常已上报后台 · 绝不留空白', { fallback: true, marker: 4 }),
      mJosNote('今天没有更合适的匹配课程', '先完成安全兜底课，或选择今天休息'),
      { kind: 'button-primary', label: '开始兜底课', to: 'S10' },
      { kind: 'button-secondary', label: '今天休息', to: 'S09', toState: 'completed' },
      ...mBelowFold(), mTab(),
    ]},
    { id: 'assessment-incomplete', label: '评测未完成', blocks: [
      mStatus(),
      { kind: 'card', label: '继续完成体质与周期评测', sub: '完成后才能生成 30 天定制课表（B-11）', to: 'S04', patch: true, marker: 1 },
      mGreet('你好，{昵称}'), mCycleRuler(),
      { kind: 'checkin-row', label: '评测未完成 · 暂无法 Check-in', sub: '先完成问卷评测' },
      { kind: 'course-panel', slot: 'work', source: '—', label: '课表尚未生成', sub: '完成评测后将为你匹配今日起 30 天训练', marker: 4 },
      mJosNote('你尚未完成训练档案', '完成评测后即可看到今日推荐'),
      { kind: 'button-primary', label: '继续评测', to: 'S04' },
      mTab(),
    ]},
  ],
  annotations: {
    goal: '定制服务核心首页：让用户 1 分钟内知道今天练什么、为什么，以及是否已确认当天状态。',
    entry: 'S08 了解今天的自己 / S19 状态确认后 / 日常启动 App / S13 返回今日 / S23 订阅成功',
    exit: ['S10', 'S19', 'S20', 'S21', 'S22', 'S23', 'S25', 'S26', 'S29', 'S31', 'S32', 'S04'],
    role: '体验用户 / 订阅用户 / 失效用户（锁定态）',
    data: [
      '问候/日期 — 本地时区',
      'Cycle Ruler — cycle_facts/prediction',
      'Check-in 状态 — daily_checkins',
      'work_slot — 排课引擎 D03 / decision_id',
      'fuel_slot — B14 阶段话术',
      'care_slot — Ritual 内容库',
      'commerce_slot — B41/B55 运营配置',
      'Jo\'s Note — 推荐服务 reason_codes',
      '体验天数 — trialDays（B-01）',
    ],
    actions: {
      primary: '完成 Check-in 或开始/继续训练（S10/S11）',
      secondary: ['调整训练（S20）', '开启订阅（S22）', 'Jo 姐好物（S32）', '查看日历（S25）', '继续评测（S04）'],
      destructive: '「开始生理期了」更新周期资料，并在满足条件时触发第 3 天检查（S21）',
    },
    statesDesc: ['未 Check-in', '已确认·未开始', '进行中', '已完成', '已降级', '体验临期', '订阅锁定', '兜底课', '评测未完成'],
    triggers: [
      '未 Check-in 不预判 Push/Soft/Warm',
      '进行中隐藏降级入口',
      '已完成弱化主 CTA，显示能量到账',
      '体验条点击 → S22；S23 成功 → 返回 S09 checked-not-started',
      'Work/Fuel/Care 资源位由 GET /today 聚合下发',
    ],
    deps: ['D03 排课规则/兜底', 'B14 阶段话术', 'B41 商品入口', 'B55 页面编辑', 'Ritual 内容配置', 'V1 App API'],
    patches: ['V1-TODAY', 'D10', 'B-01', 'B-02', 'B-06', 'B-09', 'B-11', 'B-14'],
  },
};
