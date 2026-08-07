// 链路 C · 排课规则模拟：B11 排课规则列表 → B12 排课规则编辑 → B13 模拟用户测试
import type { ScreenDef, WireBlock } from './types';

const sideRule: WireBlock = { kind: 'sidebar', label: '排课规则' };
const sideSim: WireBlock = { kind: 'sidebar', label: '模拟测试' };

export const screensSchedule: ScreenDef[] = [
  {
    id: 'B11', name: '排课规则列表', reqCode: '§4 B11', priority: 'P0', flow: 'C',
    states: [
      { id: 'default', label: '默认列表', blocks: [
        sideRule,
        { kind: 'topbar', label: '评测与排课 / 排课规则', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '排课规则 · 版本 v9（线上）', sub: '固定优先级：安全禁忌 ＞ 周期安全 ＞ 当日降级 ＞ 难度/时长 ＞ 目标 ＞ 偏好 ＞ 内容多样性（§5.4）', marker: 1 },
        { kind: 'stat-row', items: ['启用 14', '草稿 3', '待审核 2', '近 7 日平均命中率 91%', '兜底触发 0.8%'] },
        { kind: 'table', cols: ['规则名', '优先级层', '条件摘要', '命中率', '版本', '状态', '操作'], items: [
          '经期+大基数 ｜ 周期安全 ｜ 经期 AND 大基数 ｜ 8.2% ｜ v3 ｜ 启用 ｜ 编辑/模拟',
          '当日太累降级 ｜ 当日降级 ｜ Check-in 能量低 ｜ 5.1% ｜ v2 ｜ 启用 ｜ 编辑/模拟',
          '新手难度保护 ｜ 难度/时长 ｜ 新手 AND 难度≤2 ｜ 22.4% ｜ v5 ｜ 启用 ｜ 编辑/模拟',
          '内容多样性 ｜ 内容多样性 ｜ 7 日内部位不重复 ｜ 61% ｜ v1 ｜ 启用 ｜ 编辑/模拟',
          '产后禁忌（修订） ｜ 安全禁忌 ｜ 产后 AND 腹直肌分离 ｜ — ｜ v4-draft ｜ 待审核 ｜ 查看',
        ], to: 'B12', marker: 2 },
        { kind: 'button-primary', label: '+ 新建规则', to: 'B12' },
      ]},
      { id: 'empty', label: '首次空数据', blocks: [
        sideRule,
        { kind: 'topbar', label: '评测与排课 / 排课规则', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '排课规则' },
        { kind: 'panel', label: '还没有排课规则', sub: '建议从「安全禁忌」层开始创建第一条规则；没有规则时排课退化为通用兜底池', height: 110 },
        { kind: 'button-primary', label: '+ 新建第一条规则', to: 'B12' },
      ]},
    ],
    annotations: {
      goal: '总览全部排课规则的健康度（命中率/冲突/版本/状态），是排课链路的入口。',
      entry: '侧边栏-评测与排课-排课规则',
      exit: ['B12', 'B13'],
      role: '课程/健康运营（编辑）；审核人（发布）；只读审计（查看）',
      data: [
        '规则七部分结构（命名/条件/硬性必须/硬性排除/软性偏好/课表限制/兜底） — §5.4',
        '命中率与兜底触发率 — 近 7 日排课日志统计',
        '版本与状态 — 发布记录',
      ],
      actions: {
        primary: '编辑规则（→B12）；新建规则',
        secondary: ['行内直达 B13 模拟', '停用/启用', '查看版本历史'],
        destructive: '停用安全层规则：二次确认 + 展示当前生效用户数（§5.4 紧急安全规则影响评估）',
      },
      statesDesc: ['默认', '空', '加载失败', '重叠规则警告', '无发布权限'],
      triggers: [
        '规则编辑保存后命中率清零重计',
        '停用/修改安全层规则 → 触发已生成未来课表的影响评估（§5.4 重排触发）',
      ],
      deps: ['移动端 S08 课表预览 / S09 今日课程卡（规则输出端）', 'B07 复核通过的标签才可被规则引用', 'B20 迁移（老用户首次排课）'],
      patches: [],
    },
  },
  {
    id: 'B12', name: '排课规则编辑', reqCode: '§4 B12', priority: 'P0', flow: 'C',
    states: [
      { id: 'editing', label: '条件组编辑', blocks: [
        sideRule,
        { kind: 'topbar', label: '评测与排课 / 排课规则 / 编辑', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '编辑规则 · 经期+大基数（v4 草稿）' },
        { kind: 'form-row', label: '命名与说明', sub: '经期+大基数 ｜ 业务说明：经期大基数用户的低冲击保护' },
        { kind: 'form-row', label: '优先级层', sub: '周期安全（下拉，固定七层，不可自定义顺序）', marker: 1 },
        { kind: 'form-row', label: '适用条件', sub: '周期 = 经期 AND 大基数 = 是（条件组：用户标签/周期/目标/当日状态）', marker: 2 },
        { kind: 'form-row', label: '硬性必须', sub: '标签：大基数友好、经期可用 —— 候选视频必须全部满足' },
        { kind: 'form-row', label: '硬性排除', sub: '标签：跳跃、高强度 —— 命中即剔除并记录原因' },
        { kind: 'form-row', label: '软性偏好', sub: '低冲击 +5 ｜ 15-20 分钟 +3（命中加分，影响排序）' },
        { kind: 'form-row', label: '课表限制', sub: '每日 1 课 ｜ 总时长 ≤20min ｜ 强度 ≤2 ｜ 同一视频 7 日内不重复 ｜ 经期第 1 天可排休息' },
        { kind: 'form-row', label: '兜底', sub: '无结果时 → 指定课程池「经期低强度兜底池」（用户端显示兜底标识，移动端 B-09）', marker: 3 },
        { kind: 'panel', label: '实时候选集', sub: '当前条件+硬性标签 → 候选视频 23 个（来自复核通过标签）' },
        { kind: 'button-primary', label: '保存并去模拟（→B13）', to: 'B13' },
        { kind: 'button-secondary', label: '仅保存草稿' },
      ]},
      { id: 'conflict', label: '矛盾检测失败', blocks: [
        sideRule,
        { kind: 'topbar', label: '评测与排课 / 排课规则 / 编辑 / 检测', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '保存检测 · 经期+大基数（v4 草稿）', sub: '编辑时检测：矛盾标签、空候选集、重叠规则（§5.4）' },
        { kind: 'alert', tone: 'error', label: '检测未通过 · 3 个问题', sub: '可保存草稿，但不允许提交审核', marker: 1 },
        { kind: 'table', cols: ['级别', '位置', '问题', '操作'], items: [
          '✗ ｜ 硬性必须 vs 硬性排除 ｜ 「高强度」同时在必须(经引用组)与排除中，矛盾 ｜ 定位修复',
          '✗ ｜ 适用条件 ｜ 经期 AND 产后 = 候选集为空（0 个视频） ｜ 定位修复',
          '⚠ ｜ 规则重叠 ｜ 与「经期通用」条件覆盖率 92%，注意优先级顺序 ｜ 查看对比',
        ], marker: 2 },
        { kind: 'button-primary', label: '返回修复', to: 'B12' },
        { kind: 'button-secondary', label: '仍要保存草稿（不可提交审核）' },
      ]},
    ],
    annotations: {
      goal: '用「条件组 + 硬性必须/排除 + 软偏好 + 课表限制 + 兜底」七部分结构化表达排课策略。',
      entry: 'B11 编辑/新建',
      exit: ['B11', 'B13'],
      role: '课程/健康运营',
      data: [
        '标签取值 — 仅可引用 B07 复核通过的视频标签',
        '候选集规模 — 规则引擎实时试算',
        '兜底课程池 — 运营配置（对应移动端 B-09 兜底卡）',
      ],
      actions: {
        primary: '保存并去模拟（→B13 验证 30 天结果）',
        secondary: ['仅保存草稿', '复制规则', '查看候选集明细'],
        destructive: '删除规则：仅草稿可删除；已发布规则只能停用（B11 二次确认）',
      },
      statesDesc: ['编辑中', '矛盾检测失败', '候选集为空警告', '保存成功', '提交审核'],
      triggers: [
        '检测通过才允许提交审核；引用被废弃标签 → 保存时拦截',
        '安全层规则发布需二次审核（H-04）；发布后按 B13 发布选项决定是否影响已生成课表',
      ],
      deps: ['移动端 S09 排课失败兜底卡（B-09）', '移动端 S20 太累降级（当日降级层）', '移动端 S21 经期重排（周期安全层）', 'B07 标签来源'],
      patches: ['H-04'],
    },
  },
  {
    id: 'B13', name: '模拟用户测试', reqCode: '§4 B13', priority: 'P0', flow: 'C',
    states: [
      { id: 'input', label: '样本输入', blocks: [
        sideSim,
        { kind: 'topbar', label: '评测与排课 / 模拟测试', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '模拟用户测试 · 规则 v4 草稿', sub: '模拟不产生真实课表数据，只用于验证与回归' },
        { kind: 'split', label: '样本配置（手动）', sub: '预设典型样本库（回归用）', items: [
          '用户标签：大基数 / 新手',
          '周期：经期第 2 天（周期 28 天）',
          '目标：调理身体 ｜ 当日状态：正常',
          '问卷版本：v3 ｜ 视频池：当前可用 280',
        ], right: [
          '样本A 经期 + 大基数（安全层回归）',
          '样本B 卵泡期 + 减脂 + 中级（目标层回归）',
          '样本C 黄体期 + 太累当日降级（降级层回归）',
          '样本D 产后 + 腹直肌分离（禁忌层回归）',
          '样本E 无匹配极端组合（兜底回归）',
        ], marker: 1 },
        { kind: 'button-primary', label: '生成 30 天课表（模拟）', to: 'B13', marker: 2 },
        { kind: 'button-secondary', label: '全部样本一键回归' },
      ]},
      { id: 'result', label: '30 天结果与解释', blocks: [
        sideSim,
        { kind: 'topbar', label: '评测与排课 / 模拟测试 / 结果', sub: '样本A · 经期+大基数' },
        { kind: 'page-header', label: '30 天模拟结果 · 逐日可解释', sub: '展示每天课程、命中规则、被排除视频及原因（§5.4）' },
        { kind: 'calendar-grid', label: 'Day 1-28 网格：训练日 / 休息日 / 兜底日（amber 标记）', sub: '当前选中 Day 3', marker: 1 },
        { kind: 'split', label: 'Day 3 · 命中解释', sub: 'Day 3 · 被排除视频及原因', items: [
          '入选：VID-0203 经期舒缓拉伸 12min（得分 96）',
          '命中链：安全禁忌(通过) → 周期安全[经期+大基数 v4](命中) → 难度/时长(≤20min) → 偏好[低冲击 +5]',
          '课表限制校验：当日 1 课、强度 1、7 日内未重复 ✓',
          '规则版本：v4 草稿 ｜ 视频标签版本：2026-07-29 复核批次#42',
        ], right: [
          'VID-0188 燃脂操 — 排除：含「跳跃」（硬性排除）',
          'VID-0192 HIIT — 排除：强度 4 超限',
          'VID-0201 晨间拉伸 — 排除：Day 1 已使用（7 日重复限制）',
        ], marker: 2 },
        { kind: 'alert', tone: 'info', label: 'Day 12 无匹配 → 命中兜底池（经期低强度兜底池）', sub: '用户端 S09 显示兜底标识「补」（移动端 B-09），异常上报', patch: true },
        { kind: 'button-primary', label: '导出解释报告' },
        { kind: 'button-secondary', label: '与线上 v9 版本对比差异' },
      ]},
      { id: 'regression', label: '回归通过 · 待发布', blocks: [
        sideSim,
        { kind: 'topbar', label: '评测与排课 / 模拟测试 / 回归', sub: '角色：课程/健康运营 → 审核人' },
        { kind: 'page-header', label: '典型样本回归 · 规则 v4 草稿', sub: '发布前必须用预设典型用户样本执行回归测试（§5.4）' },
        { kind: 'table', cols: ['样本', '结果', '与线上 v9 差异', '明细'], items: [
          '样本A 经期+大基数 ｜ ✓ 通过 ｜ Day 3/11 课程更换（预期内） ｜ 查看',
          '样本B 卵泡期+减脂 ｜ ✓ 通过 ｜ 无差异 ｜ 查看',
          '样本C 当日降级 ｜ ✓ 通过 ｜ 无差异 ｜ 查看',
          '样本D 产后禁忌 ｜ ✓ 通过 ｜ 禁忌剔除增加 2 个视频（安全增强） ｜ 查看',
          '样本E 兜底 ｜ ✓ 通过 ｜ 兜底触发 2 天 → 1 天 ｜ 查看',
        ], marker: 1 },
        { kind: 'stat-row', items: ['通过率 5/5', '差异 2 处（均预期内）', '耗时 42s'] },
        { kind: 'alert', tone: 'ok', label: '回归通过，可提交审核（编辑 → 样本回归 → 专业审核 → 发布，H-04）', patch: true },
        { kind: 'form-row', label: '发布选项', sub: '☐ 同时重排已生成的未来课表（默认仅对新课表生效；紧急安全规则可勾选，§5.4）', marker: 2 },
        { kind: 'button-primary', label: '提交审核（二次确认）', to: 'B11' },
        { kind: 'button-secondary', label: '返回 B12 继续编辑' },
      ]},
    ],
    annotations: {
      goal: '发布前用样本用户生成并解释 30 天课表，让规则「可解释、可回归、可发布」。',
      entry: 'B12 保存后去模拟；B11 行操作「模拟」',
      exit: ['B11', 'B12'],
      role: '课程/健康运营（模拟与回归）；审核人（发布）',
      data: [
        '样本输入（标签/周期/目标/当日状态） — 手动配置 + 预设典型样本库',
        '30 天模拟结果 — 规则引擎试算（不写真实用户课表）',
        '命中规则链与被排除视频及原因 — 引擎决策日志',
        '回归差异 — 与线上版本对比',
      ],
      actions: {
        primary: '生成 30 天课表（模拟）；回归全过后提交审核',
        secondary: ['逐日查看解释', '导出解释报告', '与线上版本对比', '一键全样本回归'],
        destructive: '提交审核（二次确认）；发布时可选「同时重排已生成未来课表」',
      },
      statesDesc: ['样本输入', '结果与逐日解释', '回归通过待发布', '回归失败（差异高亮）', '兜底日标记'],
      triggers: [
        '回归 5/5 通过 → 允许提交审核；任一失败 → 阻断并定位差异日',
        '发布 → 新版本对新课表生效；已生成课表按发布选项处理（§5.4）',
        '排课节奏：评测后一次生成今日起 30 天滚动课表（与移动端 B-08 对齐，H-02 已按新需求修订）',
      ],
      deps: ['移动端 S08 30 天预览 / S09 今日课程卡与兜底（B-09）', '移动端 S19/S20 Check-in 降级（当日重排触发）', '移动端 S21 经期重排', 'B12 规则来源'],
      patches: ['H-02', 'H-04'],
    },
  },
];
