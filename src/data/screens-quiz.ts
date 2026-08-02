// 链路 B · 问卷评分发布：B08 问卷列表/版本 → B09 问卷编辑器 → B10 评分/报告话术
import type { ScreenDef, WireBlock } from './types';

const sideQuiz: WireBlock = { kind: 'sidebar', label: '问卷' };
const sideScore: WireBlock = { kind: 'sidebar', label: '评分规则' };

export const screensQuiz: ScreenDef[] = [
  {
    id: 'B08', name: '问卷列表与版本', reqCode: '§4 B08', priority: 'P0', flow: 'B',
    states: [
      { id: 'default', label: '版本列表', blocks: [
        sideQuiz,
        { kind: 'topbar', label: '评测与排课 / 问卷', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '问卷与版本', sub: '版本流转：草稿 → 内部测试 → 待审核 → 已发布 → 已停用（§5.3）' },
        { kind: 'stat-row', items: ['已发布 v3（线上）', '内部测试 v4', '待审核 0', '草稿 2', '已停用 2'] },
        { kind: 'table', cols: ['版本', '状态', '题目数', '累计提交', '更新人', '操作'], items: [
          'v4 ｜ 内部测试 ｜ 12 ｜ 38（测试） ｜ 运营B ｜ 继续编辑',
          'v3 ｜ 已发布·线上 ｜ 12 ｜ 12,480 ｜ 运营A ｜ 查看快照 / 复制新草稿',
          'v3.1-draft ｜ 草稿 ｜ 13 ｜ — ｜ 运营A ｜ 编辑',
          'v2 ｜ 已停用 ｜ 10 ｜ 8,203 ｜ 运营A ｜ 查看',
        ], to: 'B09', marker: 1 },
        { kind: 'button-primary', label: '+ 新建问卷（从空白 / 复制线上版本）', to: 'B09' },
      ]},
      { id: 'locked', label: '已发布不可编辑', blocks: [
        sideQuiz,
        { kind: 'topbar', label: '评测与排课 / 问卷 / v3', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '问卷 v3 · 已发布（线上运行中）' },
        { kind: 'alert', tone: 'warn', label: '已发布版本不可直接编辑（§5.3）', sub: '修改需复制为新草稿；新版本只影响新提交与明确触发重测的用户，历史报告快照不改写', marker: 1 },
        { kind: 'table', cols: ['题号', '题型', '文案（快照只读）', '必填'], items: [
          'Q1 ｜ 单选 ｜ 你的年龄段？ ｜ 是',
          'Q3 ｜ 单选 ｜ 你的核心目标是什么？ ｜ 是',
          'Q5 ｜ 日期 ｜ 上次经期开始日？ ｜ 是',
        ] },
        { kind: 'button-primary', label: '复制为新草稿 v3.2', to: 'B09', marker: 2 },
        { kind: 'button-secondary', label: '查看发布快照（题目+评分+话术）' },
        { kind: 'button-danger', label: '停用 v3（二次确认）' },
      ]},
    ],
    annotations: {
      goal: '管理问卷全生命周期版本，保证线上版本稳定、历史可追溯。',
      entry: '侧边栏-评测与排课-问卷',
      exit: ['B09', 'B10'],
      role: '课程/健康运营（编辑）；专业审核人（发布审核，B-Q03 人选待定）',
      data: [
        '版本号/状态/题目数/累计提交/更新人 — 问卷版本表',
        '线上运行版本 — 发布记录（移动端当前渲染版本）',
        '报告快照关联 — 用户报告保存当时的问卷版本（§5.3）',
      ],
      actions: {
        primary: '打开草稿/测试版本继续编辑（→B09）',
        secondary: ['新建问卷', '内部测试邀请', '查看发布快照', '复制为新草稿', '行操作进入 B10 评分规则'],
        destructive: '停用已发布版本：二次确认；影响新用户评测入口，历史报告不受影响',
      },
      statesDesc: ['默认', '首次空', '已发布锁定提示（只读快照）', '版本对比（后续）', '无发布权限'],
      triggers: [
        '点击已发布版本的「编辑」→ 拦截提示并引导复制新草稿（§5.3）',
        '新版本发布 → 移动端 S04 起新提交用户使用新版本；历史报告保留旧快照',
      ],
      deps: ['移动端 S04 问卷逐题页（渲染版本来源）', '移动端 S06 课表生成（问卷版本快照）', '审批流 §6 问卷与阶段话术'],
      patches: [],
    },
  },
  {
    id: 'B09', name: '问卷编辑器', reqCode: '§4 B09', priority: 'P0', flow: 'B',
    states: [
      { id: 'editing', label: '编辑中', blocks: [
        sideQuiz,
        { kind: 'topbar', label: '评测与排课 / 问卷 / v4 草稿', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '问卷编辑器 · v4 草稿', sub: '题型：单选/多选/数字/滑杆/日期/文本说明（§5.3）' },
        { kind: 'split', label: '题目列表（12 题）', sub: '当前选中：Q3 核心目标（单选）', items: [
          'Q1 年龄段 · 单选 · 必填',
          'Q2 运动基础 · 单选 · 必填',
          '▶ Q3 核心目标 · 单选 · 必填',
          'Q5 上次经期开始日 · 日期 · 必填',
          'Q6 周期是否规律 · 单选（不规律→跳 Q8）',
          '… Q12 当前身体状态 · 多选',
        ], right: [
          '题号 Q3 ｜ 题型 单选 ｜ 必填 是',
          '文案：你的核心目标是什么？',
          '帮助说明：选择最想改善的一项',
          '选项：减脂(+塑形维度2) / 塑形 / 增肌 / 调理身体 / 改善心情',
          '每个选项可贡献多维度分与用户标签 → 进入 B10',
          '条件跳转：Q3=调理身体 → 追加显示 Q7a',
        ] },
        { kind: 'form-row', label: '业务标签与得分权重', sub: '本选项 → 维度分 + 用户标签（评分的输入，详见 B10）', marker: 1 },
        { kind: 'button-primary', label: '保存草稿', to: 'B10' },
        { kind: 'button-secondary', label: '手机端即时预览（渲染同 S04）' },
        { kind: 'button-secondary', label: '提交校验', marker: 2 },
      ]},
      { id: 'validate-fail', label: '发布前校验失败', blocks: [
        sideQuiz,
        { kind: 'topbar', label: '评测与排课 / 问卷 / v4 草稿 / 校验', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '发布前校验 · v4', sub: '校验项：死循环、无出口、必填空值（§5.3）' },
        { kind: 'alert', tone: 'error', label: '校验未通过 · 3 个问题', sub: '修复前不允许进入「待审核」', marker: 1 },
        { kind: 'table', cols: ['级别', '位置', '问题', '操作'], items: [
          '✗ ｜ Q6→Q8→Q6 ｜ 条件跳转存在死循环 ｜ 定位修复',
          '✗ ｜ Q9（必填） ｜ Q6=不规律 路径下无出口到达 ｜ 定位修复',
          '⚠ ｜ Q11 选项 3 ｜ 缺少得分权重（默认按 0 计） ｜ 定位修复',
        ], marker: 2 },
        { kind: 'button-primary', label: '返回编辑器修复', to: 'B09' },
        { kind: 'button-secondary', label: '重新校验' },
      ]},
    ],
    annotations: {
      goal: '可视化编辑题目、选项、跳题逻辑与选项得分，发布前自动校验逻辑完整性。',
      entry: 'B08 打开草稿/测试版本，或复制线上版本为新草稿',
      exit: ['B08', 'B10'],
      role: '课程/健康运营',
      data: [
        '题目字段：题号/文案/帮助说明/必填/选项/校验/业务标签/得分权重 — §5.3',
        '题型六种：单选/多选/数字/滑杆/日期/文本说明 — §5.3',
        '条件跳转规则（上一题或组合答案显隐后续题） — 跳题配置',
        '选项得分与用户标签 — 评分规则输入（流向 B10）',
      ],
      actions: {
        primary: '保存草稿（通过后进入 B10 配置评分与话术）',
        secondary: ['手机端即时预览（与 S04 同渲染逻辑）', '提交校验', '排序/增删题目与选项'],
        destructive: '删除题目：已被跳题规则引用时拦截并提示引用位置',
      },
      statesDesc: ['编辑中', '保存成功', '校验失败（死循环/无出口/必填空值）', '预览态', '数据已被他人修改'],
      triggers: [
        '校验通过 → 允许提交「内部测试」→ 测试确认后进入「待审核」',
        '跳题规则改动 → 自动重检全部路径的出口完整性',
      ],
      deps: ['移动端 S04 问卷逐题页（题型/跳题/必填的渲染端）', '移动端 S05 提交确认', 'B10 评分与报告话术'],
      patches: [],
    },
  },
  {
    id: 'B10', name: '评分与报告话术', reqCode: '§4 B10', priority: 'P0', flow: 'B',
    states: [
      { id: 'weights', label: '评分权重与分段', blocks: [
        sideScore,
        { kind: 'topbar', label: '评测与排课 / 评分规则 / v4', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '评分规则 · 问卷 v4', sub: '选项可贡献一个或多个维度分数和用户标签（§5.3）' },
        { kind: 'table', cols: ['维度', '贡献题目', '权重合计', '分段配置'], items: [
          '减脂 ｜ Q3/Q7/Q9 ｜ 100 ｜ 0-40 初阶 / 40-70 进阶 / 70-100 高阶',
          '力量 ｜ Q3/Q8 ｜ 100 ｜ 同上三段',
          '柔韧/恢复 ｜ Q9/Q12 ｜ 100 ｜ 同上三段',
          '周期规律性 ｜ Q5/Q6 ｜ — ｜ 规律 / 不规律（影响跳题与阶段估算）',
        ], marker: 1 },
        { kind: 'form-row', label: '用户标签产出', sub: '如 Q2=大基数 → 标签「大基数」；标签直接进入 B12 排课规则适用条件', marker: 2 },
        { kind: 'button-primary', label: '保存并配置报告话术', to: 'B10' },
      ]},
      { id: 'copy', label: '话术与冲突校验', blocks: [
        sideScore,
        { kind: 'topbar', label: '评测与排课 / 评分规则 / v4 / 话术', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '报告话术库 · v4', sub: '按分数段、标签组合、周期阶段配置标题/解读/改善建议（§5.3）' },
        { kind: 'table', cols: ['命中条件', '话术', '优先级', '字数'], items: [
          '经期 + 大基数 ｜ #12 温和启动，先从低冲击开始 ｜ P1 ｜ 86',
          '经期（通用） ｜ #13 经期这样练更舒服 ｜ P2 ｜ 92',
          '卵泡期 + 减脂 ｜ #21 黄金燃脂期安排 ｜ P1 ｜ 78',
        ] },
        { kind: 'alert', tone: 'warn', label: '冲突提示：标签组合「经期+大基数」同时命中 #12 与 #13', sub: '已按优先级 P1 取 #12；多条命中需配置优先级、去重与字数上限 200（§5.3）', marker: 1 },
        { kind: 'button-primary', label: '保存话术并进入提交审核', to: 'B10' },
        { kind: 'button-secondary', label: '命中模拟试算（输入标签组合 → 输出最终话术）' },
      ]},
      { id: 'submit', label: '提交审核与发布', blocks: [
        sideScore,
        { kind: 'topbar', label: '评测与排课 / 评分规则 / v4 / 发布', sub: '角色：课程/健康运营 → 审核人' },
        { kind: 'page-header', label: '提交审核 · 问卷 v4（题目+评分+话术）' },
        { kind: 'steps', items: ['编辑', '内部测试', '待审核', '已发布'], activeStep: 2 },
        { kind: 'alert', tone: 'info', label: '审核人须 ≠ 编辑人（H-04）', sub: '审核要点：安全相关话术（经期/产后/多囊）需专业审核人确认（B-Q03，占位 H-06）', marker: 1, patch: true },
        { kind: 'panel', label: '发布说明', sub: '新版本只影响新提交与明确触发重测的用户；历史报告保留旧版本快照，不改写（§5.3）' },
        { kind: 'button-primary', label: '确认提交审核（提交后锁定编辑）', marker: 2 },
        { kind: 'button-secondary', label: '返回继续编辑' },
      ]},
    ],
    annotations: {
      goal: '配置维度权重、分数段与报告话术，保证多话术命中时结果可解释、可审计。',
      entry: 'B09 保存后进入；B08 行操作「评分规则」',
      exit: ['B08'],
      role: '课程/健康运营编辑；专业审核人审核发布（B-Q03 人选待定，占位 H-06）',
      data: [
        '维度与权重、分数段 — 评分规则表',
        '用户标签产出 — 流向 B12 排课规则适用条件',
        '话术（标题/解读/改善建议）+ 优先级/去重/字数上限 — 话术库（§5.3）',
        '命中模拟结果 — 规则引擎试算',
      ],
      actions: {
        primary: '提交审核（二次确认，提交后锁定）',
        secondary: ['保存草稿', '命中模拟试算', '导出话术表'],
        destructive: '停用线上话术：二次确认；停用后新报告不再命中该条',
      },
      statesDesc: ['权重编辑', '话术冲突提示', '提交审核', '审核驳回（原因回显）', '已发布只读'],
      triggers: [
        '审核通过 → 发布新版本；移动端 S06 新生成课表使用新版本快照',
        '审核驳回 → 回退草稿态并回显驳回原因',
      ],
      deps: ['移动端 S06 课表生成 / S08 本月课表（阶段话术渲染）', '移动端 S28 周期资料修改（触发重测）', '审批流 §6 问卷与阶段话术'],
      patches: ['H-04', 'H-06'],
    },
  },
];
