// 用户 CRM 与财务：B18 用户列表 / B19 用户详情 / B21 订阅订单 / B23 能量值调整审批 / B27 审计日志
import type { ScreenDef, WireBlock } from './types';

const sideUser: WireBlock = { kind: 'sidebar', label: '用户列表' };
const sideFin: WireBlock = { kind: 'sidebar', label: '订阅/订单' };
const sidePoints: WireBlock = { kind: 'sidebar', label: '能量值调整' };
const sideAudit: WireBlock = { kind: 'sidebar', label: '审计日志' };

export const screensUser: ScreenDef[] = [
  {
    id: 'B18', name: '用户列表', reqCode: '§4 B18', priority: 'P0', flow: 'F',
    states: [
      { id: 'default', label: '默认列表', blocks: [
        sideUser,
        { kind: 'topbar', label: '用户中心 / 用户列表', sub: '角色：用户运营/CRM' },
        { kind: 'page-header', label: '用户列表 · 24,860', sub: '筛选维度：ID/手机号、注册时间、新/老用户、迁移状态、订阅状态、周期阶段、打卡天数、最近活跃（§5.7）' },
        { kind: 'filter-bar', label: '搜索 用户ID/手机号 ｜ 新/老：全部 ｜ 迁移状态：全部 ｜ 订阅：全部 ｜ 周期阶段：全部 ｜ 最近活跃：7 日内', marker: 1 },
        { kind: 'table', cols: ['用户', '手机号', '来源', '订阅状态', '迁移状态', '周期阶段', '打卡', '最近活跃', '操作'], items: [
          'U-10231 ｜ 138****6688 ｜ 新注册 ｜ 体验第 5 天 ｜ — ｜ 卵泡期 ｜ 4 天 ｜ 10 分钟前 ｜ 详情',
          'U-08771 ｜ 139****2210 ｜ 迁移 ｜ 订阅中·月卡 ｜ 全部成功 ｜ 黄体期 ｜ 21 天 ｜ 2 小时前 ｜ 详情',
          'U-07890 ｜ 137****9012 ｜ 迁移 ｜ 已失效 ｜ 部分成功 ⚠ ｜ 经期 ｜ 0 ｜ 3 天前 ｜ 详情',
          'U-06554 ｜ 136****3345 ｜ 新注册 ｜ 未评测 ｜ — ｜ — ｜ 0 ｜ 1 天前 ｜ 详情',
        ], to: 'B19', marker: 2 },
        { kind: 'button-secondary', label: '导出（默认脱敏 + 水印，H-08）', patch: true, marker: 3 },
      ]},
      { id: 'masked', label: '客服脱敏视图', blocks: [
        sideUser,
        { kind: 'topbar', label: '用户中心 / 用户列表', sub: '角色：客服' },
        { kind: 'page-header', label: '用户列表（客服视图）' },
        { kind: 'alert', tone: 'info', label: '当前角色：客服 —— 手机号脱敏，健康明细不可见；能量值补发需审批（§2）', marker: 1 },
        { kind: 'table', cols: ['用户', '手机号', '订阅状态', '迁移状态', '健康数据', '操作'], items: [
          'U-08771 ｜ 139****2210 ｜ 订阅中·月卡 ｜ 全部成功 ｜ 🔒 无权限 ｜ 详情',
          'U-07890 ｜ 137****9012 ｜ 已失效 ｜ 部分成功 ⚠ ｜ 🔒 无权限 ｜ 详情',
        ], to: 'B19' },
      ]},
      { id: 'no-result', label: '筛选无结果', blocks: [
        sideUser,
        { kind: 'topbar', label: '用户中心 / 用户列表', sub: '角色：用户运营/CRM' },
        { kind: 'page-header', label: '用户列表 · 24,860' },
        { kind: 'filter-bar', label: '订阅：已失效 ｜ 迁移状态：失败 ｜ 最近活跃：24 小时内' },
        { kind: 'alert', tone: 'info', label: '没有匹配的用户', sub: '支持清空筛选（§7 空态要求）' },
        { kind: 'button-secondary', label: '清空筛选' },
      ]},
    ],
    annotations: {
      goal: 'CRM 主入口：按手机号/标签/订阅/迁移状态快速定位用户，进入详情。',
      entry: '侧边栏-用户中心-用户列表',
      exit: ['B19'],
      role: '用户运营/CRM（全量字段）；客服（脱敏视图）；财务（仅订阅字段）；只读审计',
      data: [
        '筛选与列表字段 — 用户表 + 订阅状态 + 迁移任务结果（§5.7）',
        '手机号 — 默认脱敏展示（中间 4 位掩码，H-08）',
        '迁移状态（全部成功/部分成功/失败） — 关联 B20 任务结果',
      ],
      actions: {
        primary: '点击行进入 B19 用户详情',
        secondary: ['多维筛选与搜索', '导出（脱敏+水印+24h 有效期，H-08）'],
        destructive: '无（列表页无写操作）',
      },
      statesDesc: ['默认', '客服脱敏视图', '筛选无结果', '加载中', '加载失败', '无权限'],
      triggers: [
        '迁移状态=部分成功的行 → 详情页置顶迁移待处理提示（联动 B20 失败重试）',
        '手机号完整值查看 → 敏感数据查看权限 + 二次确认 + 写审计（§5.11）',
      ],
      deps: ['移动端 S26 我的（订阅/能量值状态同源）', 'B20 迁移任务结果', 'B27 审计日志（敏感查看留痕）'],
      patches: ['H-08'],
    },
  },
  {
    id: 'B19', name: '用户详情', reqCode: '§4 B19', priority: 'P0', flow: 'F',
    states: (() => {
      const tabs = ['账户概览', '评测报告', '周期与课表', '运动打卡', '订阅订单', '能量值', '消息工单'];
      const tabStates = ['overview', 'report', 'schedule', 'workout', 'orders', 'energy', 'inbox'];
      const tabBar = (active: number): WireBlock => ({
        kind: 'tabs', items: tabs, activeStep: active, tabStates, marker: 1,
      });
      return [
      { id: 'overview', label: '账户概览', blocks: [
        sideUser,
        { kind: 'topbar', label: '用户中心 / 用户列表 / 详情', sub: '← 返回 B18' },
        { kind: 'page-header', label: '用户详情 · U-08771', sub: '七分栏均可点击切换 · 对齐后端§2.1 全景档案' },
        tabBar(0),
        { kind: 'form-row', label: '基础资料', sub: '昵称「小鹿」｜ 手机 139****2210 ｜ 注册 2026-06-12 ｜ 渠道：迁移 ｜ 设备 iOS ｜ App 2.3.0' },
        { kind: 'form-row', label: '活跃', sub: '最近登录 08-06 21:10 ｜ 最近活跃 2 小时前' },
        { kind: 'form-row', label: '迁移信息', sub: '批次 #20260725-01 · 全部成功 · 永久可查', marker: 2 },
        { kind: 'form-row', label: '用户状态', sub: '账号正常 ｜ 月卡生效至 2026-08-15 ｜ 自动续费开 ｜ 标签：大基数、减脂、新手 ｜ 周期：黄体期' },
        { kind: 'alert', tone: 'info', label: '健康/周期明细默认脱敏；特定角色二次确认后可在「评测报告」查看', marker: 3 },
      ]},
      { id: 'report', label: '评测报告', blocks: [
        sideUser,
        { kind: 'topbar', label: '用户中心 / 用户详情 / 评测报告', sub: '角色：健康运营' },
        { kind: 'page-header', label: '评测报告 · U-08771' },
        tabBar(1),
        { kind: 'form-row', label: '问卷版本与得分', sub: 'v3 · 2026-06-12 提交 ｜ 减脂 72 / 力量 45 / 柔韧 60' },
        { kind: 'form-row', label: '映射标签', sub: '用户：大基数、减脂 ｜ 训练：初级、低强度、无跳跃' },
        { kind: 'form-row', label: '推荐话术快照', sub: '（非长报告）今日起 30 天课表已生成 · 话术版本 B10-v4' },
        { kind: 'panel', label: '🔒 经期 / 情绪 / 身体答案（高敏感）', sub: '默认折叠；健康运营二次确认后查看，写审计 B27', marker: 2 },
        { kind: 'button-secondary', label: '申请查看敏感答案（二次确认 + 审计）', marker: 3 },
      ]},
      { id: 'schedule', label: '周期与课表', blocks: [
        sideUser,
        { kind: 'topbar', label: '用户中心 / 用户详情 / 周期与课表', sub: '角色：健康运营（受限权限）' },
        { kind: 'page-header', label: '周期与课表 · U-08771', sub: '当前阶段：黄体期第 19 天 ｜ 规则版本 v9 ｜ 今日起 30 天滚动（H-02）' },
        tabBar(2),
        { kind: 'calendar-grid', label: '30 天课表（已完成 ✓ / 今日 / 未来）', sub: '当前 Day 19' },
        { kind: 'alert', tone: 'warn', label: '人工重排为受限权限（H-09）', sub: '只改今日起未来课表，历史不动；二次确认 + 审计', marker: 2, patch: true },
        { kind: 'button-secondary', label: '人工重排未来课表（二次确认）', patch: true, marker: 3 },
      ]},
      { id: 'workout', label: '运动打卡', blocks: [
        sideUser,
        { kind: 'topbar', label: '用户中心 / 用户详情 / 运动打卡', sub: '角色：CRM / 健康运营' },
        { kind: 'page-header', label: '运动与打卡 · U-08771' },
        tabBar(3),
        { kind: 'stat-row', items: ['累计训练 86 次', '累计时长 1,720 min', '完成率 91%', '累计打卡 86 天', '当前连胜 3', '历史最高 7'] },
        { kind: 'form-row', label: '最近训练', sub: '08-06 18:32 · 舒缓瑜伽 20min · 完成度 100% · 反馈：刚好/舒适/平静' },
        { kind: 'table', cols: ['日期', '课程', '时长', '完成度', '是否打卡', '反馈'], items: [
          '08-06 ｜ 舒缓瑜伽 ｜ 20 ｜ 100% ｜ ✓ ｜ 刚好',
          '08-05 ｜ 核心激活 ｜ 25 ｜ 100% ｜ ✓ ｜ 有点累',
          '08-04 ｜ 休息日 ｜ — ｜ — ｜ — ｜ —',
          '08-03 ｜ 力量入门 ｜ 12 ｜ 55% ｜ ✗ ｜ 未完成',
        ], marker: 2 },
        { kind: 'button-secondary', label: '查看打卡数据看板', to: 'B29' },
      ]},
      { id: 'orders', label: '订阅订单', blocks: [
        sideUser,
        { kind: 'topbar', label: '用户中心 / 用户详情 / 订阅订单', sub: '角色：财务 / CRM' },
        { kind: 'page-header', label: '交易信息 · U-08771' },
        tabBar(4),
        { kind: 'form-row', label: '当前订阅', sub: '月卡 99 ｜ 微信 ｜ 生效中 ｜ 2026-07-15 ~ 08-15 ｜ 自动续费开 ｜ 下次扣费 08-15' },
        { kind: 'table', cols: ['类型', '单号', '金额', '渠道', '状态', '时间'], items: [
          '订单 ｜ O-20260715-001 ｜ 99 ｜ 微信 ｜ 成功 ｜ 07-15 10:02',
          '续费 ｜ O-20260615-008 ｜ 99 ｜ 微信 ｜ 成功 ｜ 06-15 10:01',
          '退款 ｜ — ｜ — ｜ — ｜ 无 ｜ —',
        ], marker: 2 },
        { kind: 'button-secondary', label: '打开订阅/订单模块', to: 'B21' },
        { kind: 'button-secondary', label: '退款队列', to: 'B24' },
      ]},
      { id: 'energy', label: '能量值', blocks: [
        sideUser,
        { kind: 'topbar', label: '用户中心 / 用户详情 / 能量值', sub: '角色：CRM / 客服' },
        { kind: 'page-header', label: '用户资产 · 能量值 · U-08771' },
        tabBar(5),
        { kind: 'stat-row', items: ['当前余额 1,300', '累计获得 2,580', '累计消耗 1,280', '最近变动 08-06'] },
        { kind: 'form-row', label: '已解锁课程', sub: '21天塑形营 · 经期舒缓系列 · 核心力量进阶（买断永久）' },
        { kind: 'form-row', label: '会员权益 / 活动奖励', sub: '定制课表生效中 ｜ 挑战赛勋章 ×1' },
        { kind: 'table', cols: ['时间', '变动', '类型', '关联', '余额'], items: [
          '08-06 ｜ +20 ｜ 完课 ｜ 舒缓瑜伽 ｜ 1,300',
          '08-05 ｜ +20 ｜ 完课 ｜ 核心激活 ｜ 1,280',
          '07-12 ｜ +1,280 ｜ 迁移入账 ｜ MIG-… ｜ 1,240',
        ], marker: 2 },
        { kind: 'button-primary', label: '发起能量值调整（审批）', to: 'B23' },
        { kind: 'button-secondary', label: '能量值规则', to: 'B30' },
      ]},
      { id: 'inbox', label: '消息工单', blocks: [
        sideUser,
        { kind: 'topbar', label: '用户中心 / 用户详情 / 触达', sub: '角色：CRM' },
        { kind: 'page-header', label: '触达与客服 · U-08771', sub: '完整工单 P2；当前展示消息触达 + 企微入口' },
        tabBar(6),
        { kind: 'form-row', label: '通知偏好', sub: '允许 Push ｜ 类型：打卡鼓励✓ 课程提醒✓ 断练召回✓ 订阅到期✓' },
        { kind: 'table', cols: ['时间', '渠道', '模板', '状态', '打开', '点击'], items: [
          '08-05 ｜ Push ｜ 连胜鼓励 ｜ 已送达 ｜ ✓ ｜ —',
          '08-01 ｜ 站内信 ｜ 会员到期提醒 ｜ 已送达 ｜ ✓ ｜ ✓',
          '07-28 ｜ Push ｜ 课程提醒 ｜ 失败·关通知 ｜ — ｜ —',
        ], marker: 2 },
        { kind: 'alert', tone: 'info', label: '私信/工单：MVP 接企微（B42）；本栏预留工单列表空态', marker: 3 },
        { kind: 'button-secondary', label: '查看触达任务', to: 'B28' },
        { kind: 'button-secondary', label: '企微配置', to: 'B42' },
      ]},
    ];
    })(),
    annotations: {
      goal: '单用户 360° 档案：账户、评测、周期课表、打卡、订阅、能量值、触达一屏可查，敏感数据按权限分层。',
      entry: 'B18 行点击「详情」',
      exit: ['B18', 'B21', 'B23', 'B24', 'B28', 'B29', 'B30', 'B42'],
      role: 'CRM/客服（基础档案）；健康运营（评测/课表分栏 + 敏感数据二次确认）；财务（订阅分栏）',
      data: [
        '七分栏字段 — 用户表 / 问卷快照 / 课表 / 打卡 / 订阅 / 能量值流水 / 触达（后端§2.1）',
        '报告快照（问卷版本+答案+得分+话术） — 非长报告',
        '迁移记录 — 关联 B20 批次，永久可查',
      ],
      actions: {
        primary: '点击七分栏 Tab 切换（页内可点）',
        secondary: ['申请查看敏感答案（二次确认+审计）', '跳转 B21/B23/B24/B28/B29'],
        destructive: '人工重排未来课表：受限权限 + 二次确认 + 审计，只改未来不改历史（H-09）',
      },
      statesDesc: ['账户概览', '评测报告', '周期与课表', '运动打卡', '订阅订单', '能量值', '消息工单'],
      triggers: [
        '查看高敏感数据 → 二次确认 → 写审计日志（§5.11）',
        '迁移部分成功用户 → 置顶提示并联动 B20 失败重试',
      ],
      deps: ['移动端 S08/S09/S26', 'B21 订阅订单', 'B23 能量值调整', 'B27 审计', 'B28 触达', 'B29 打卡'],
      patches: ['H-09', '七分栏补全'],
    },
  },
  {
    id: 'B21', name: '订阅/订单列表与详情', reqCode: '§4 B21', priority: 'P0', flow: 'F',
    states: [
      { id: 'subs', label: '订阅列表', blocks: [
        sideFin,
        { kind: 'topbar', label: '订阅与财务 / 订阅列表', sub: '角色：财务' },
        { kind: 'page-header', label: '订阅列表', sub: '渠道：Apple IAP / 微信 / 支付宝（B-Q07 范围待定）' },
        { kind: 'stat-row', items: ['有效订阅 8,420', '体验中 1,205', '今日新增 63', '续费成功率 87%', '退款率 1.2%'] },
        { kind: 'filter-bar', label: '渠道：全部 ｜ 状态：全部 ｜ 套餐：全部 ｜ 到期：7 日内 ｜ 老客优惠：全部' },
        { kind: 'table', cols: ['订阅 ID', '用户', '套餐', '渠道', '状态', '开始/到期', '自动续费', '操作'], items: [
          'SUB-88213 ｜ U-08771 ｜ 月卡 99 ｜ 微信 ｜ 生效中 ｜ 07-15 / 08-15 ｜ 开 ｜ 详情',
          'SUB-87902 ｜ U-07890 ｜ 月卡 99 ｜ Apple IAP ｜ 已取消 ｜ 06-20 / 07-20 ｜ 关 ｜ 详情',
          'SUB-88771 ｜ U-10231 ｜ 体验 7 天 ｜ — ｜ 体验中 ｜ 07-26 / 08-02 ｜ — ｜ 详情',
        ], marker: 1 },
      ]},
      { id: 'orders', label: '订单流水', blocks: [
        sideFin,
        { kind: 'topbar', label: '订阅与财务 / 订单流水', sub: '角色：财务' },
        { kind: 'page-header', label: '订单流水', sub: '状态：待支付/处理中/成功/失败/取消/部分退款/全额退款（§5.8）' },
        { kind: 'alert', tone: 'warn', label: '不允许人工修改原始流水', sub: '补单或权益修复必须以独立审批动作记录（§5.8）', marker: 1 },
        { kind: 'table', cols: ['内部订单号', '渠道流水号', '金额', '状态', '支付时间', '渠道回调', '关联订阅', '操作'], items: [
          'O-20260715-001 ｜ wx42000… ｜ 99.00 ｜ 成功 ｜ 07-15 10:02 ｜ 已回调 ｜ SUB-88213 ｜ 详情',
          'O-20260728-014 ｜ apple… ｜ 99.00 ｜ 支付处理中 ｜ 07-28 22:41 ｜ 未回调 ｜ — ｜ 详情',
          'O-20260720-006 ｜ wx42000… ｜ 99.00 ｜ 全额退款 ｜ 07-20 15:30 ｜ 已回调 ｜ SUB-87902 ｜ 详情',
        ], to: 'B21', marker: 2 },
        { kind: 'button-secondary', label: '受控导出（脱敏+水印，H-08）', patch: true },
      ]},
      { id: 'detail', label: '订单详情', blocks: [
        sideFin,
        { kind: 'topbar', label: '订阅与财务 / 订单流水 / 详情', sub: '角色：财务' },
        { kind: 'page-header', label: '订单详情 · O-20260728-014' },
        { kind: 'form-row', label: '订单信息', sub: '应付/实付 99.00 CNY ｜ 优惠：老友首月 5 折（移动端 B-01 关联）｜ 套餐：月卡' },
        { kind: 'form-row', label: '渠道回调', sub: 'Apple IAP · 未回调（支付处理中超 2 小时 → 异常告警）', marker: 1 },
        { kind: 'form-row', label: '关联订阅与权益', sub: 'SUB-88771 ｜ 权益：未开通（以服务端确认为准，用户端 S23「结果未知」态）' },
        { kind: 'split', label: '状态变更日志', sub: '可执行操作（独立审批）', items: [
          '07-28 22:41 创建订单（待支付）',
          '07-28 22:43 渠道扣款成功（用户侧已付款）',
          '07-28 22:43→ 回调未到达，状态滞留「处理中」',
        ], right: [
          '补单：以渠道流水为准补记成功（审批）',
          '权益修复：手动开通订阅（审批）',
          '发起退款：财务角色 + 二次确认',
        ], marker: 2 },
        { kind: 'button-secondary', label: '发起补单/权益修复（独立审批 + 审计）', marker: 3 },
        { kind: 'button-danger', label: '发起退款（二次确认）' },
      ]},
    ],
    annotations: {
      goal: '订单可关联渠道流水和订阅权益，支付成功、退款、续费和权益状态一致、可对账。',
      entry: '侧边栏-订阅与财务；B19 用户详情「订阅订单」分栏跳转',
      exit: ['B19'],
      role: '财务（订单/退款/导出）；客服（查看订阅状态，不可改流水）；只读审计',
      data: [
        '订阅字段：ID/用户/套餐/渠道/状态/起止/自动续费/体验期/老客优惠 — §5.8',
        '订单字段：内部订单号/渠道流水号/应付实付/状态/回调/关联订阅/退款 — §5.8',
        '状态变更日志 — 订单服务事件流',
      ],
      actions: {
        primary: '查询与对账（按时间/渠道/状态/套餐/用户）',
        secondary: ['受控导出（脱敏+水印）', '查看状态变更日志'],
        destructive: '发起退款（财务 + 二次确认）；补单/权益修复（独立审批动作，写审计，§5.8）',
      },
      statesDesc: ['订阅列表', '订单流水', '订单详情', '回调异常告警', '加载失败', '无权限'],
      triggers: [
        '支付处理中超时（占位 2 小时）→ 异常告警，联动工作台 B02（后续批次）',
        '渠道回调成功 → 更新订单状态 + 开通/续期权益（用户端 S23/S24 状态一致，§8-9 验收）',
        '退款成功 → 权益按规则回收，未来课表锁定（移动端 B-11）',
      ],
      deps: ['移动端 S22 付费墙 / S23 支付结果 / S24 订阅管理（用户侧状态一致）', 'B27 审计日志', '渠道回调对接（B-Q07）'],
      patches: ['H-08'],
    },
  },
  {
    id: 'B23', name: '能量值调整审批', reqCode: '§4 B23', priority: 'P0', flow: 'F',
    states: [
      { id: 'list', label: '申请列表', blocks: [
        sidePoints,
        { kind: 'topbar', label: '用户中心 / 能量值调整', sub: '角色：客服 / 运营·财务审批' },
        { kind: 'page-header', label: '人工能量值调整', sub: '审批流：客服申请 → 运营/财务审批 → 系统执行 → 结果记录（§6）' },
        { kind: 'stat-row', items: ['待审批 3', '本月已执行 28', '已驳回 2', '补发总分值 +9,400'] },
        { kind: 'table', cols: ['申请单', '用户', '调整', '原因', '证据/工单', '申请人', '状态', '操作'], items: [
          'PA-0331 ｜ U-07890 ｜ +500 ｜ 迁移能量值部分失败（批次 #20260728-02） ｜ 工单#331 ｜ 客服C ｜ 待审批 ｜ 审批',
          'PA-0330 ｜ U-09112 ｜ +20 ｜ 完课未到账（回调延迟） ｜ 截图×2 ｜ 客服A ｜ 已执行 ｜ 查看',
          'PA-0329 ｜ U-05501 ｜ -200 ｜ 活动误发回收 ｜ 运营单#18 ｜ 运营D ｜ 已驳回 ｜ 查看',
        ], marker: 1 },
        { kind: 'button-primary', label: '+ 新建调整申请', marker: 2 },
      ]},
      { id: 'apply', label: '客服提交申请', blocks: [
        sidePoints,
        { kind: 'topbar', label: '用户中心 / 能量值调整 / 新建', sub: '角色：客服' },
        { kind: 'page-header', label: '新建能量值调整申请' },
        { kind: 'form-row', label: '用户', sub: 'U-07890（137****9012）｜ 当前余额 1,240' },
        { kind: 'form-row', label: '调整类型与分值', sub: '增加 +500（减少需额外说明回收依据）' },
        { kind: 'form-row', label: '原因', sub: '迁移能量值部分失败 · 批次 #20260728-02（关联 B20 失败记录）' },
        { kind: 'form-row', label: '关联工单与证据', sub: '工单#331 ｜ 上传截图/流水证明' },
        { kind: 'alert', tone: 'info', label: '不允许直接修改余额', sub: '变更以新的流水记录实现，保留前后余额（§5.7）', marker: 1 },
        { kind: 'button-primary', label: '提交审批（提交后不可改）' },
        { kind: 'button-secondary', label: '保存草稿' },
      ]},
      { id: 'approve', label: '审批与执行', blocks: [
        sidePoints,
        { kind: 'topbar', label: '用户中心 / 能量值调整 / 审批', sub: '角色：运营/财务（审批人 ≠ 申请人）' },
        { kind: 'page-header', label: '审批 · PA-0331（U-07890 +500）' },
        { kind: 'steps', items: ['客服申请', '运营/财务审批', '系统执行', '结果记录'], activeStep: 1 },
        { kind: 'panel', label: '余额变动预览', sub: '当前 1,240 → 调整后 1,740 ｜ 生成新流水（业务类型：人工补发 · 关联 PA-0331）', marker: 1 },
        { kind: 'form-row', label: '审批意见', sub: '必填；驳回必须写明原因' },
        { kind: 'button-primary', label: '审批通过并执行（二次确认）', marker: 2 },
        { kind: 'button-danger', label: '驳回（必填原因）' },
        { kind: 'text', label: '执行后用户端 S27 能量值明细可见该笔流水；申请/审批/执行全程写审计日志（B27）', patch: false },
      ]},
    ],
    annotations: {
      goal: '人工能量值调整走审批制：可申请、可审批、可留痕，杜绝直接改余额。',
      entry: '侧边栏-用户中心-能量值调整；B19 用户详情「能量值」分栏',
      exit: ['B19'],
      role: '客服（提交申请）；运营/财务（审批，审批人 ≠ 申请人）',
      data: [
        '申请字段：用户/增减/分值/原因/关联工单/证据 — §5.7',
        '当前余额与前后余额预览 — 能量值账户',
        '流水记录（业务类型/关联 ID/前后余额） — 与移动端 B-10 明细规则一致',
      ],
      actions: {
        primary: '审批通过并执行（二次确认）',
        secondary: ['保存草稿', '查看关联工单/迁移批次', '导出审批记录'],
        destructive: '驳回（必填原因）；减分调整需额外回收依据说明',
      },
      statesDesc: ['申请列表', '提交申请', '待审批', '审批通过已执行', '已驳回', '无审批权限'],
      triggers: [
        '审批通过 → 系统生成新流水调整余额（前后余额留痕），用户端 S27 立即可查',
        '迁移失败补发场景 → 关联 B20 批次记录，防止重复补发（幂等键校验）',
      ],
      deps: ['移动端 S27 能量值明细（流水同源）', '移动端 B-10 能量值发放规则', 'B20 迁移失败记录', 'B27 审计日志'],
      patches: [],
    },
  },
  {
    id: 'B27', name: '操作审计日志', reqCode: '§4 B27', priority: 'P0', flow: 'K',
    states: [
      { id: 'default', label: '日志查询', blocks: [
        sideAudit,
        { kind: 'topbar', label: '系统管理 / 审计日志', sub: '角色：审计/只读 · 超管' },
        { kind: 'page-header', label: '操作审计日志', sub: '高敏感查看、导出、能量值调整、权益修复、规则发布均记录（§5.11）' },
        { kind: 'filter-bar', label: '操作人 ｜ 角色 ｜ 模块 ｜ 对象 ID ｜ 操作类型 ｜ 时间范围 ｜ IP', marker: 1 },
        { kind: 'table', cols: ['时间', '操作人', '角色', '模块', '对象', '操作', '前后差异', '结果', 'IP'], items: [
          '07-30 14:02 ｜ CRM-A ｜ 用户运营 ｜ 迁移 ｜ #20260730-01 ｜ 执行迁移 ｜ — ｜ 成功 ｜ 10.0.8.21',
          '07-30 11:20 ｜ 运营B ｜ 健康运营 ｜ 排课规则 ｜ 经期+大基数 v4 ｜ 发布 ｜ 待审核→已发布 ｜ 成功 ｜ 10.0.8.33',
          '07-29 18:44 ｜ 运营A ｜ 内容运营 ｜ 视频 ｜ VID-0187 ｜ 修改安全标签 ｜ 产后：✗→✓ ｜ 待审核 ｜ 10.0.8.15',
          '07-29 16:02 ｜ 客服C ｜ 客服 ｜ 用户 U-07890 ｜ 查看健康明细 ｜ 二次确认通过 ｜ 成功 ｜ 10.0.9.02',
          '07-29 15:40 ｜ 财务D ｜ 财务 ｜ 订单 ｜ O-20260720-006 ｜ 退款 ｜ 成功→全额退款 ｜ 成功 ｜ 10.0.8.40',
        ], to: 'B27', marker: 2 },
        { kind: 'alert', tone: 'info', label: '日志任何人（含超管）不可删除，MVP 永久保留（H-10）', sub: '回滚操作本身也记录审计（§5.11）', patch: true, marker: 3 },
        { kind: 'button-secondary', label: '导出（脱敏 + 水印，H-08）', patch: true },
      ]},
      { id: 'detail', label: '单条日志详情', blocks: [
        sideAudit,
        { kind: 'topbar', label: '系统管理 / 审计日志 / 详情', sub: '← 返回列表' },
        { kind: 'page-header', label: '日志详情 · 修改安全标签（VID-0187）' },
        { kind: 'form-row', label: '操作人 / 角色 / IP / 设备', sub: '运营A ｜ 内容运营 ｜ 10.0.8.15 ｜ Mac Chrome' },
        { kind: 'form-row', label: '模块 / 对象 / 操作类型', sub: '视频 ｜ VID-0187 ｜ 编辑（安全类标签）' },
        { kind: 'split', label: '修改前', sub: '修改后', items: [
          '产后适用：✗',
          '状态：可用·已上架',
        ], right: [
          '产后适用：✓（理由：全程跪姿无卷腹）',
          '状态：待审核（安全标签变更，需健康运营终审 H-06）',
        ], marker: 1 },
        { kind: 'text', label: '结果：待审核 → 审核通过后恢复「可用」；该条日志永久保留、不可删除（H-10）', patch: true },
      ]},
    ],
    annotations: {
      goal: '全部敏感操作可追溯：操作人、对象、前后值、IP、时间一条不少。',
      entry: '侧边栏-系统管理-审计日志',
      exit: [],
      role: '审计/只读（全局查询）；超管（查询，不可删除）；其他角色仅见自己操作',
      data: [
        '日志字段：操作人/角色/IP/设备/时间/模块/对象 ID/操作类型/前后差异/结果 — §5.11',
        '前后差异快照 — 各业务模块变更事件',
      ],
      actions: {
        primary: '多维查询与单条详情查看',
        secondary: ['导出（脱敏+水印+有效期，H-08）'],
        destructive: '无 —— 日志不提供删除入口（H-10）',
      },
      statesDesc: ['日志查询', '单条详情', '筛选无结果', '无权限'],
      triggers: [
        '高敏感数据查看/导出、能量值调整、权益修复、规则/问卷发布、回滚 → 自动写日志（§5.11）',
        '本批链路动作全覆盖：B07 复核、B10/B13 发布、B20 迁移执行、B21 退款、B23 审批',
      ],
      deps: ['全部后台模块（变更事件上报）', '移动端无直接对应屏（后台治理能力）'],
      patches: ['H-08', 'H-10'],
    },
  },
];
