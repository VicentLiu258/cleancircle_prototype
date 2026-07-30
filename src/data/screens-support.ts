// 链路 A 供给端：B05 批量导入 / B06 标签库
// 支撑模块：B14 阶段建议 / B15 消息模板 / B16 消息触发器 / B26 角色权限
import type { ScreenDef, WireBlock } from './types';

const sideImport: WireBlock = { kind: 'sidebar', label: '批量导入' };
const sideTag: WireBlock = { kind: 'sidebar', label: '标签库' };
const sideTips: WireBlock = { kind: 'sidebar', label: '阶段建议' };
const sideTpl: WireBlock = { kind: 'sidebar', label: '消息模板' };
const sideTrig: WireBlock = { kind: 'sidebar', label: '触发器' };
const sideRole: WireBlock = { kind: 'sidebar', label: '角色权限' };

// ——— 链路 A 供给端 ———
export const screensSupportA: ScreenDef[] = [
  {
    id: 'B05', name: '批量导入/任务详情', reqCode: '§4 B05', priority: 'P0', flow: 'A',
    states: [
      { id: 'upload', label: '上传与字段映射', blocks: [
        sideImport,
        { kind: 'topbar', label: '内容中心 / 批量导入', sub: '角色：内容运营' },
        { kind: 'page-header', label: '视频批量导入', sub: '目标：300+ 视频批量建档，错误数据可定位到行和字段（§8-1 验收）' },
        { kind: 'steps', items: ['下载模板', '上传元数据 Excel', '字段映射', '校验', '导入'], activeStep: 2 },
        { kind: 'form-row', label: '元数据文件', sub: 'videos_20260730.xlsx（312 行）｜ 视频文件目录：已挂载 298 个文件' },
        { kind: 'alert', tone: 'info', label: 'Excel 行与视频文件的匹配键 = 文件名前缀（占位，H-12）', sub: '如 VID-0001.mp4 ↔ 行内视频 ID VID-0001；未匹配文件进入错误报告', marker: 1, patch: true },
        { kind: 'table', cols: ['Excel 列', '→ 目标字段（§5.1 七组）', '校验规则'], items: [
          'video_id → 视频 ID ｜ 必填 + 全局唯一',
          'title / coach → 基础：标题/教练 ｜ 必填',
          'duration → 媒体：时长 ｜ 格式 mm:ss',
          'difficulty → 训练：难度 ｜ 取值 1-5',
          'tags_safety → 人群/安全标签 ｜ 取值必须在标签库（B06）',
        ], marker: 2 },
        { kind: 'button-primary', label: '开始校验' },
        { kind: 'button-secondary', label: '重新下载模板（含标签库最新取值）' },
      ]},
      { id: 'validate', label: '校验错误报告', blocks: [
        sideImport,
        { kind: 'topbar', label: '内容中心 / 批量导入 / 校验', sub: '批次 IMP-0730' },
        { kind: 'page-header', label: '校验结果 · 312 行' },
        { kind: 'stat-row', items: ['通过 298', '失败 14', '标签取值错误 8', '文件未匹配 4', '格式错误 2'] },
        { kind: 'table', cols: ['行号', '字段', '失败原因', '原始值'], items: [
          '023 ｜ tags_safety ｜ 「孕妇适用」不在标签库 ｜ 孕妇适用',
          '041 ｜ duration ｜ 时长格式错误 ｜ 18分24秒',
          '077 ｜ video_id ｜ 视频文件未匹配（缺 VID-0077.mp4） ｜ VID-0077',
          '102 ｜ difficulty ｜ 取值超出 1-5 ｜ 7',
        ], marker: 1 },
        { kind: 'button-primary', label: '仅导入通过行（298 条）', marker: 2 },
        { kind: 'button-secondary', label: '下载错误报告（Excel，定位到行和字段）' },
        { kind: 'button-secondary', label: '返回修正文件' },
      ]},
      { id: 'running', label: '任务详情（导入中）', blocks: [
        sideImport,
        { kind: 'topbar', label: '内容中心 / 批量导入 / 任务', sub: '角色：内容运营' },
        { kind: 'page-header', label: '导入任务列表' },
        { kind: 'table', cols: ['批次', '条数', '状态', '操作人', '时间', '操作'], items: [
          'IMP-0730 ｜ 298 ｜ 导入中 71% ｜ 运营A ｜ 07-30 16:20 ｜ 查看进度',
          'IMP-0728 ｜ 150 ｜ 已完成（14 条失败已重试成功） ｜ 运营A ｜ 07-28 11:02 ｜ 详情',
        ], marker: 1 },
        { kind: 'progress', label: 'IMP-0730 导入进度 71%（212 / 298）' },
        { kind: 'text', label: '导入完成后视频进入「待打标 / 待复核」状态 → 进入 B07 复核队列；导入动作写审计日志（B27）', marker: 2 },
      ]},
    ],
    annotations: {
      goal: '首批 300+ 视频批量建档：可映射、可校验、错误可定位到行和字段。',
      entry: '侧边栏-内容中心-批量导入；B03 空态/工具栏入口',
      exit: ['B03', 'B07'],
      role: '内容运营',
      data: [
        '元数据 Excel（七组字段列） — 上传文件（§5.1 字段为准）',
        '视频文件目录 — 文件存储（现状待确认 B-Q02）',
        '匹配键：文件名前缀 = 视频 ID（占位，H-12）',
        '校验结果 — 校验服务（格式/必填/唯一/标签取值/文件匹配）',
      ],
      actions: {
        primary: '仅导入通过行；失败行下载错误报告',
        secondary: ['下载模板（含标签库最新取值）', '查看任务进度', '失败行修正后重新导入'],
        destructive: '取消导入中任务：二次确认，已建档部分保留',
      },
      statesDesc: ['上传与映射', '校验错误报告', '导入中', '已完成', '部分成功（失败可重试）', '已取消'],
      triggers: [
        '导入完成 → 视频状态「待打标/待复核」→ 进入 B07 复核队列（AI 或 Excel 标签通道，H-03）',
        '重新导入同批次 → 按视频 ID 幂等覆盖，不重复建档',
      ],
      deps: ['B06 标签库（取值校验来源）', 'B03 视频列表（建档结果）', 'B07 复核队列（下游）', 'B27 审计日志'],
      patches: ['H-12'],
    },
  },
  {
    id: 'B06', name: '标签库', reqCode: '§4 B06', priority: 'P0', flow: 'A',
    states: [
      { id: 'default', label: '分组列表', blocks: [
        sideTag,
        { kind: 'topbar', label: '内容中心 / 标签库', sub: '角色：内容运营 + 健康运营' },
        { kind: 'page-header', label: '标签库', sub: '按维度分组：单选/多选、必填/可选、数据类型、适用范围（§5.1）' },
        { kind: 'table', cols: ['分组', '类型', '必填', '标签数', '被引用（视频/规则）', '状态', '操作'], items: [
          '强度 ｜ 单选 ｜ 必填 ｜ 5 ｜ 280 / 14 ｜ 启用 ｜ 编辑',
          '人群/安全 ⚑ ｜ 多选 ｜ 必填 ｜ 8 ｜ 280 / 9 ｜ 启用（安全类） ｜ 编辑',
          '目标 ｜ 多选 ｜ 必填 ｜ 6 ｜ 276 / 11 ｜ 启用 ｜ 编辑',
          '器械 ｜ 多选 ｜ 可选 ｜ 7 ｜ 190 / 3 ｜ 启用 ｜ 编辑',
          '身体部位 ｜ 多选 ｜ 可选 ｜ 9 ｜ 265 / 6 ｜ 启用 ｜ 编辑',
        ], to: 'B06', marker: 1 },
        { kind: 'alert', tone: 'info', label: '⚑ 安全类分组的标签只能由指定角色（健康运营，H-06）审核', patch: true },
        { kind: 'button-primary', label: '+ 新建分组' },
      ]},
      { id: 'edit', label: '分组编辑（互斥/废弃保护）', blocks: [
        sideTag,
        { kind: 'topbar', label: '内容中心 / 标签库 / 人群/安全', sub: '角色：健康运营' },
        { kind: 'page-header', label: '编辑分组 · 人群/安全（多选 · 必填）' },
        { kind: 'form-row', label: '分组设置', sub: '多选 ｜ 必填 ｜ 数据类型：布尔 ｜ 适用范围：视频 + 用户（双向匹配）', marker: 1 },
        { kind: 'table', cols: ['标签', '被引用（视频/规则）', '状态', '操作'], items: [
          '经期可用 ｜ 210 / 6 ｜ 启用 ｜ 编辑/废弃',
          '大基数友好 ｜ 88 / 4 ｜ 启用 ｜ 编辑/废弃',
          '产后适用 ｜ 42 / 2 ｜ 启用 ｜ 编辑/废弃',
          '孕期适用（旧） ｜ 0 / 0 ｜ 已废弃 ｜ 查看',
        ] },
        { kind: 'form-row', label: '互斥 / 依赖', sub: '互斥：「高强度」×「经期推荐」｜ 依赖：「产后适用」→ 必须同时有「低冲击」', marker: 2 },
        { kind: 'alert', tone: 'warn', label: '不允许删除已被规则/视频引用的标签（§5.1）', sub: '只能「废弃」：废弃后不再可被新引用，历史引用保留并可筛选', marker: 3 },
        { kind: 'button-primary', label: '保存（安全类变更需健康运营二审，H-06）', patch: true },
      ]},
    ],
    annotations: {
      goal: '维护全站标签体系：分组约束、互斥依赖、启停用与废弃，是打标与排课规则的数据底座。',
      entry: '侧边栏-内容中心-标签库',
      exit: ['B03'],
      role: '内容运营（常规分组）；健康运营（安全类分组审核，H-06）',
      data: [
        '分组设置：单选/多选、必填/可选、数据类型、适用范围 — §5.1',
        '标签互斥/依赖关系 — 标签库配置',
        '被引用统计（视频数/规则数） — 引用索引',
      ],
      actions: {
        primary: '编辑分组与标签；新建分组',
        secondary: ['查看被引用明细', '废弃标签'],
        destructive: '删除标签：已被规则/视频引用时禁止，仅允许废弃（§5.1）',
      },
      statesDesc: ['分组列表', '分组编辑', '引用中（删除拦截）', '已废弃只读', '无安全组审核权限'],
      triggers: [
        '标签废弃 → B04/B07 不再可选，B12 引用该标签的规则保存时预警',
        '安全类标签变更 → 二审通过后生效（写审计）',
      ],
      deps: ['B04 视频编辑 / B07 复核台（标签取值来源）', 'B12 排课规则（硬性必须/排除引用）', '移动端 S29 浏览筛选（标签维度一致）'],
      patches: ['H-06'],
    },
  },
];

// ——— 支撑模块 ———
export const screensSupportG: ScreenDef[] = [
  {
    id: 'B14', name: '阶段建议列表/编辑', reqCode: '§4 B14', priority: 'P0', flow: 'G',
    states: [
      { id: 'list', label: '建议列表', blocks: [
        sideTips,
        { kind: 'topbar', label: '周期建议 / 阶段建议', sub: '角色：课程/健康运营' },
        { kind: 'page-header', label: '周期阶段建议', sub: 'P0：周期阶段 + 简单人群标签的非商品化建议（饮食/睡眠/生活）；营养 SKU 闭环为 V3.0（§5.5）' },
        { kind: 'stat-row', items: ['已发布 24', '待审核 3', '草稿 5', '已过期 2'] },
        { kind: 'filter-bar', label: '建议类型：全部 ｜ 周期阶段：全部 ｜ 人群：全部 ｜ 审核状态：全部' },
        { kind: 'table', cols: ['标题', '类型', '周期阶段', '适用人群', '排除人群', '有效期', '审核状态', '操作'], items: [
          '经期前三天这样吃 ｜ 饮食 ｜ 经期 D1-3 ｜ 全部 ｜ — ｜ 长期 ｜ 已发布 ｜ 编辑',
          '黄体期睡不好怎么办 ｜ 睡眠 ｜ 黄体期 ｜ 睡眠差标签 ｜ — ｜ 长期 ｜ 已发布 ｜ 编辑',
          '大基数经期运动提醒 ｜ 生活 ｜ 经期 ｜ 大基数 ｜ 产后 ｜ 至 08-31 ｜ 待审核 ｜ 查看',
        ], to: 'B14', marker: 1 },
        { kind: 'button-primary', label: '+ 新建建议' },
      ]},
      { id: 'edit', label: '编辑与审核', blocks: [
        sideTips,
        { kind: 'topbar', label: '周期建议 / 阶段建议 / 编辑', sub: '角色：健康运营' },
        { kind: 'page-header', label: '编辑建议 · 大基数经期运动提醒' },
        { kind: 'form-row', label: '建议类型 / 周期阶段', sub: '生活 ｜ 经期（D1-5）' },
        { kind: 'form-row', label: '适用 / 排除人群', sub: '适用：大基数 ｜ 排除：产后（安全边界）', marker: 1 },
        { kind: 'form-row', label: '标题 / 短文案 / 详细文案 / 图片', sub: '用户端 S09 Tips 卡展示短文案，点击展开详细文案' },
        { kind: 'form-row', label: '排序 / 有效期', sub: '排序 3 ｜ 有效期至 2026-08-31（过期自动下线）' },
        { kind: 'form-row', label: '发布方式', sub: '定时发布 08-01 09:00 / 立即发布（审核通过后）' },
        { kind: 'alert', tone: 'info', label: '健康建议类发布前需专业审核（H-06 占位健康运营），记录审核人和版本（§5.2/§6）', marker: 2, patch: true },
        { kind: 'button-primary', label: '提交审核（编辑人 ≠ 审核人，H-04）', patch: true },
        { kind: 'button-secondary', label: '保存草稿并预览用户端效果' },
      ]},
    ],
    annotations: {
      goal: '配置移动端「当日饮食生活 Tips」的阶段化内容：可按阶段+人群匹配、可审核、有时效。',
      entry: '侧边栏-周期建议-阶段建议',
      exit: [],
      role: '课程/健康运营（编辑）；专业审核人（发布，H-06 占位）',
      data: [
        '建议类型/周期阶段/适用与排除人群/标题/短文案/详细文案/图片/排序/有效期/审核状态 — §5.5 P0 字段',
        '人群标签 — 问卷评分产出（B10）',
      ],
      actions: {
        primary: '提交审核（H-04：编辑人 ≠ 审核人）',
        secondary: ['保存草稿', '预览用户端 S09 展示效果', '定时发布'],
        destructive: '下线已发布建议：二次确认；不影响历史已展示记录',
      },
      statesDesc: ['建议列表', '编辑', '待审核', '已发布', '已过期（自动下线）', '审核驳回'],
      triggers: [
        '用户周期阶段切换 → S09 Tips 卡按「阶段+人群」匹配新建议（总览 §3 依赖行）',
        '有效期截止 → 自动下线；审核驳回 → 回退草稿并回显原因',
      ],
      deps: ['移动端 S09 当日饮食生活 Tips 卡（展示端）', 'B10 用户标签来源', '审批流 §6 周期建议', 'B27 审计'],
      patches: ['H-04', 'H-06'],
    },
  },
  {
    id: 'B15', name: '消息模板', reqCode: '§4 B15', priority: 'P0', flow: 'G',
    states: [
      { id: 'list', label: '模板列表', blocks: [
        sideTpl,
        { kind: 'topbar', label: '消息中心 / 消息模板', sub: '角色：用户运营/CRM' },
        { kind: 'page-header', label: '消息模板', sub: '渠道：App Push / 站内信（MVP 不默认纳入短信，§5.6）' },
        { kind: 'table', cols: ['模板名', '渠道', '使用变量', '版本', '状态', '操作'], items: [
          'Jo 姐鼓励 · 连胜 3 天 ｜ Push ｜ {昵称}{连胜天数} ｜ v3 ｜ 启用 ｜ 编辑',
          '课程提醒 · 训练前 30 分钟 ｜ Push+站内信 ｜ {当日课程} ｜ v2 ｜ 启用 ｜ 编辑',
          '断练召回 · 连续 2 天未完课 ｜ Push ｜ {昵称}{Day N} ｜ v1 ｜ 启用 ｜ 编辑',
          '体验到期提醒 ｜ Push+站内信 ｜ {订阅到期日} ｜ v2 ｜ 停用 ｜ 编辑',
        ], to: 'B15', marker: 1 },
        { kind: 'button-primary', label: '+ 新建模板' },
      ]},
      { id: 'edit', label: '编辑与真实数据预览', blocks: [
        sideTpl,
        { kind: 'topbar', label: '消息中心 / 消息模板 / 编辑', sub: '角色：用户运营/CRM' },
        { kind: 'page-header', label: '编辑模板 · Jo 姐鼓励（v4 草稿）' },
        { kind: 'form-row', label: '渠道', sub: '☑ App Push ｜ ☑ 站内信/私信' },
        { kind: 'form-row', label: '标题 / 正文', sub: '插入变量下拉：{昵称}{连续打卡天数}{Day N}{当日课程}{订阅到期日}（白名单，§5.6）', marker: 1 },
        { kind: 'form-row', label: '按钮与跳转', sub: '按钮「去看看」→ 跳转类型：页面 ｜ 目标：今日页（S09）' },
        { kind: 'split', label: '正文配置', sub: '真实数据预览（测试用户 U-08771）', items: [
          '{昵称}，连续 {连续打卡天数} 天啦！',
          '今天的 {当日课程} 也很适合你，练完记得打卡～—— Jo 姐',
        ], right: [
          '小鹿，连续 7 天啦！',
          '今天的 经期舒缓拉伸 也很适合你，练完记得打卡～—— Jo 姐',
        ], marker: 2 },
        { kind: 'button-primary', label: '保存新版本' },
        { kind: 'button-secondary', label: '测试发送（选择测试用户）' },
        { kind: 'button-secondary', label: '版本历史（v1-v3）' },
      ]},
    ],
    annotations: {
      goal: '维护 Jo 姐口吻的消息内容：变量白名单、真实数据预览、可测试发送、有版本历史。',
      entry: '侧边栏-消息中心-消息模板',
      exit: ['B16'],
      role: '用户运营/CRM',
      data: [
        '渠道/标题/正文/图片/按钮/跳转类型与目标 ID — §5.6',
        '变量白名单：昵称/连续打卡天数/Day N/当日课程/订阅到期日 — §5.6',
        '版本历史 — 模板版本表',
      ],
      actions: {
        primary: '保存新版本（被触发器引用后立即生效于下次发送）',
        secondary: ['测试发送（真实数据渲染）', '版本历史与回滚'],
        destructive: '停用模板：引用它的触发器（B16）需先停用或换绑',
      },
      statesDesc: ['模板列表', '编辑', '测试发送', '已停用', '变量非法（非白名单拦截）'],
      triggers: [
        '正文含非白名单变量 → 保存拦截并提示',
        '模板被 B16 触发器引用 → 停用前提示引用位置',
      ],
      deps: ['移动端 S09 消息入口 / S26 设置（接收端）', 'B16 触发器（调用方）', 'B27 审计'],
      patches: [],
    },
  },
  {
    id: 'B16', name: '消息触发器', reqCode: '§4 B16', priority: 'P0', flow: 'G',
    states: [
      { id: 'list', label: '触发器列表', blocks: [
        sideTrig,
        { kind: 'topbar', label: '消息中心 / 触发器', sub: '角色：用户运营/CRM' },
        { kind: 'page-header', label: '消息触发器', sub: '事件 + 条件 + 延时 + 频控 + 模板（§5.6）' },
        { kind: 'table', cols: ['触发器', '事件', '条件', '延时/时段', '频控', '模板', '预估人数', '状态', '操作'], items: [
          '连胜鼓励 ｜ 完课 ｜ 连续打卡=3 ｜ 即时 ｜ 同类型每日≤1 ｜ Jo姐鼓励 ｜ ~420/日 ｜ 启用 ｜ 编辑',
          '断练召回 ｜ 未完课 ｜ 连续 2 天无打卡 ｜ +1 天 09:00-21:00 ｜ 每周≤2 ｜ 断练召回 ｜ ~1,800/日 ｜ 启用 ｜ 编辑',
          '课程提醒 ｜ 课程将开始 ｜ 用户设定时间 ｜ 前 30 分钟 ｜ 每日≤1 ｜ 课程提醒 ｜ ~6,200/日 ｜ 启用 ｜ 编辑',
          '体验到期 ｜ 体验到期 ｜ 前 1 天+当天 ｜ 10:00 ｜ 共 2 条 ｜ 到期提醒 ｜ ~90/日 ｜ 停用 ｜ 编辑',
        ], to: 'B16', marker: 1 },
        { kind: 'alert', tone: 'info', label: '系统通知权限关闭的用户不发 Push，仅在站内信保留（§5.6）' },
      ]},
      { id: 'edit', label: '编辑与频控', blocks: [
        sideTrig,
        { kind: 'topbar', label: '消息中心 / 触发器 / 编辑', sub: '角色：用户运营/CRM' },
        { kind: 'page-header', label: '编辑触发器 · 断练召回' },
        { kind: 'form-row', label: '触发事件', sub: '未完课（每日 21:00 评估当日打卡状态）' },
        { kind: 'form-row', label: '条件组合', sub: '连续 2 天无打卡 AND 订阅有效 AND 近 7 天未接收召回' },
        { kind: 'form-row', label: '延时 / 允许时段', sub: '延时 1 天 ｜ 仅 09:00-21:00 发送（用户本地时区）' },
        { kind: 'form-row', label: '频控与去重', sub: '每周 ≤2 ｜ 与全局频控合并计算：Push 每日 ≤2、按类型可关（移动端 B-13）', marker: 1 },
        { kind: 'form-row', label: '实验分组（预留）', sub: 'A/B 分组字段预留，MVP 不启用（§5.6）' },
        { kind: 'form-row', label: '关联模板', sub: '断练召回 v1（B15）→ 降级课程入口（S09）' },
        { kind: 'panel', label: '预估人数：~1,800 人/日', sub: '口径：近 7 日事件回放量 × 条件命中率（占位算法，H-11）；开启前必看（§5.6）', marker: 2, patch: true },
        { kind: 'button-primary', label: '保存并启用（写审计日志 B27）' },
        { kind: 'button-secondary', label: '保存草稿（不启用）' },
      ]},
    ],
    annotations: {
      goal: '配置自动化触达：什么事件、什么条件、什么时间、给多少人、发什么——开启前人数可预估。',
      entry: '侧边栏-消息中心-触发器',
      exit: ['B15'],
      role: '用户运营/CRM；启停用记录进审计（§5.6）',
      data: [
        '触发事件六类：完课/未完课/课程将开始/体验到期/订阅将到期/支付失败 — §5.6',
        '条件组合/延时/允许时段/频控/去重/实验分组预留 — §5.6',
        '预估人数 — 近 7 日事件回放试算（H-11 占位口径）',
      ],
      actions: {
        primary: '保存并启用（二次确认 + 审计）',
        secondary: ['保存草稿', '查看关联模板', '查看发送预估明细'],
        destructive: '停用触发器：二次确认；停用即写审计日志',
      },
      statesDesc: ['触发器列表', '编辑', '启用', '停用', '预估人数试算失败'],
      triggers: [
        '开启前必须展示预估人数（§5.6）',
        '频控与移动端 B-13 合并：Push 每日 ≤2、按类型关闭、系统权限关闭不发 Push',
      ],
      deps: ['移动端 S09 消息接收 / B-13 频控决策', 'B15 消息模板', 'B27 审计日志', '发送记录 B17（P1 后续）'],
      patches: ['H-11'],
    },
  },
  {
    id: 'B26', name: '管理员/角色权限', reqCode: '§4 B26', priority: 'P0', flow: 'G',
    states: [
      { id: 'roles', label: '角色列表', blocks: [
        sideRole,
        { kind: 'topbar', label: '系统管理 / 角色权限', sub: '角色：超级管理员' },
        { kind: 'page-header', label: '角色与权限', sub: '三层模型：模块 + 数据范围 + 操作类型（查看/新增/编辑/审核/发布/下架/导入/导出/敏感数据查看，§2）' },
        { kind: 'table', cols: ['角色', '成员', '模块范围', '数据范围', '敏感操作限制', '操作'], items: [
          '超级管理员 ｜ 2 ｜ 全部 ｜ 全部 ｜ 不删审计日志 ｜ 编辑',
          '内容运营 ｜ 4 ｜ 内容中心 ｜ 全部 ｜ 无健康明细/财务导出 ｜ 编辑',
          '课程/健康运营 ｜ 3 ｜ 评测排课+周期建议 ｜ 全部 ｜ 发布需二次审核 ｜ 编辑',
          '用户运营/CRM ｜ 3 ｜ 用户中心+消息 ｜ 全部 ｜ 健康脱敏/不可改流水 ｜ 编辑',
          '客服 ｜ 6 ｜ 用户档案/订阅/迁移/工单 ｜ 全部 ｜ 手机号脱敏/积分需审批 ｜ 编辑',
          '财务 ｜ 2 ｜ 订阅与财务 ｜ 全部 ｜ 无问卷答案/内容编辑 ｜ 编辑',
          '审计/只读 ｜ 1 ｜ 全局只读+日志 ｜ 全部 ｜ 不可发布/导出高敏 ｜ 编辑',
        ], to: 'B26', marker: 1 },
        { kind: 'button-primary', label: '+ 新建角色 / + 添加管理员' },
      ]},
      { id: 'edit', label: '权限树编辑', blocks: [
        sideRole,
        { kind: 'topbar', label: '系统管理 / 角色权限 / 编辑', sub: '角色：超级管理员' },
        { kind: 'page-header', label: '编辑角色 · 客服' },
        { kind: 'split', label: '角色信息与成员', sub: '权限树（模块 × 操作类型）', items: [
          '角色：客服 ｜ 成员 6 人',
          '数据范围：全部用户（手机号脱敏）',
          '说明：一线查询与工单处理',
        ], right: [
          '☑ 用户中心：查看 / 导出（脱敏）',
          '☑ 订阅与财务：仅查看',
          '☑ 迁移任务：仅查看',
          '☑ 积分调整：新增（申请）｜ ☐ 审批',
          '☐ 内容中心 ｜ ☐ 评测与排课',
          '☐ 敏感数据查看（健康明细）',
        ], marker: 1 },
        { kind: 'form-row', label: '数据范围', sub: '全部 / 本部门 / 仅本人创建（按模块可配）' },
        { kind: 'alert', tone: 'warn', label: '权限变更即时生效并写审计日志（操作人/前后值，B27）', marker: 2 },
        { kind: 'button-primary', label: '保存（二次确认）' },
        { kind: 'button-secondary', label: '复制角色新建' },
      ]},
    ],
    annotations: {
      goal: '用「模块 + 数据范围 + 操作类型」三层模型管理后台账号能看什么、能做什么。',
      entry: '侧边栏-系统管理-角色权限',
      exit: ['B27'],
      role: '超级管理员（唯一可管理角色与成员）',
      data: [
        '角色矩阵（8 个预置角色） — §2',
        '权限树：模块 × 9 种操作类型 — §2 三层模型',
        '成员与数据范围 — 管理员表',
      ],
      actions: {
        primary: '编辑角色权限（二次确认后即时生效）',
        secondary: ['新建/复制角色', '添加/停用管理员', '查看成员列表'],
        destructive: '停用管理员：二次确认；停用即踢出会话并写审计',
      },
      statesDesc: ['角色列表', '权限树编辑', '保存成功', '无权限（非超管不可见）'],
      triggers: [
        '权限变更 → 即时生效 + 写审计日志（§5.11）',
        '「敏感数据查看」为独立开关，控制 B18/B19 的脱敏解锁',
      ],
      deps: ['全部后台模块（权限生效面）', 'B27 审计日志（变更留痕）', 'B01 登录（角色渲染菜单）'],
      patches: [],
    },
  },
];
