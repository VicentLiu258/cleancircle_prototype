// v2 P0 扩展屏：按《后端需求.docx》补齐（冲突以后端需求为准）
// B02/B48/B49 工作台 · B17/B28 CRM 触达 · B22/B24/B25 会员财务 · B29/B30/B31 训练课程 · B42–B46 基础配置
// P1 占位：B32–B40 社区/商城主路径
import type { ScreenDef, WireBlock } from './types';

const side = (label: string): WireBlock => ({ kind: 'sidebar', label });

function listScreen(
  id: string,
  name: string,
  reqCode: string,
  flow: ScreenDef['flow'],
  priority: 'P0' | 'P1',
  menu: string,
  header: string,
  sub: string,
  extras: Partial<ScreenDef['annotations']> & { table?: { cols: string[]; items: string[] }; stats?: string[]; filters?: string; alerts?: string; primary?: string; statesExtra?: ScreenDef['states'] },
): ScreenDef {
  const blocks: WireBlock[] = [
    side(menu),
    { kind: 'topbar', label: header, sub: '角色：运营 / 按权限' },
    { kind: 'page-header', label: name, sub },
  ];
  if (extras.stats) blocks.push({ kind: 'stat-row', items: extras.stats });
  if (extras.filters) blocks.push({ kind: 'filter-bar', label: extras.filters });
  if (extras.alerts) blocks.push({ kind: 'alert', tone: 'info', label: extras.alerts, marker: 1 });
  if (extras.table) blocks.push({ kind: 'table', cols: extras.table.cols, items: extras.table.items, marker: 2 });
  if (extras.primary) blocks.push({ kind: 'button-primary', label: extras.primary });

  return {
    id,
    name,
    reqCode,
    priority,
    flow,
    states: [
      { id: 'default', label: '默认', blocks },
      ...(extras.statesExtra ?? []),
    ],
    annotations: {
      goal: extras.goal ?? name,
      entry: extras.entry ?? `侧边栏 · ${header}`,
      exit: extras.exit ?? [],
      role: extras.role ?? '运营',
      data: extras.data ?? [],
      actions: extras.actions ?? { primary: extras.primary ?? '查看', secondary: [] },
      statesDesc: extras.statesDesc ?? ['默认'],
      triggers: extras.triggers ?? [],
      deps: extras.deps ?? [],
      patches: extras.patches ?? ['后端需求对齐 2026-08-07'],
    },
  };
}

export const screensV2P0: ScreenDef[] = [
  // ——— 工作台 ———
  {
    id: 'B02',
    name: '运营总览',
    reqCode: '后端§1',
    priority: 'P0',
    flow: 'E',
    states: [
      {
        id: 'default',
        label: '看板+待办',
        blocks: [
          side('运营总览'),
          { kind: 'topbar', label: '工作台 / 运营总览', sub: '角色：运营负责人' },
          { kind: 'page-header', label: '运营总览', sub: '时间：今日｜昨日｜近7天｜近30天｜自定义 · 指标口径见「?」' },
          { kind: 'filter-bar', label: '时间范围：今日 ｜ 对比：上一周期', marker: 1 },
          {
            kind: 'stat-row',
            items: ['新增用户 128', '日活 3,420', '周活 12.1k', '月活 48.6k', '新增会员 63'],
          },
          {
            kind: 'stat-row',
            items: ['训练人数 1,802', '训练次数 2,410', '完成人数 1,655', '打卡人数 1,490'],
          },
          {
            kind: 'stat-row',
            items: ['新增订单 71', '订阅人数 63', '订阅金额 ¥6,237', '退款人数 2', '退款金额 ¥198'],
          },
          {
            kind: 'stat-row',
            items: ['新增帖子 45', '新增评论 210', '待审核 12', '待处理举报 3'],
          },
          {
            kind: 'alert',
            tone: 'warn',
            label: '运营待办',
            sub: '待审核社区 12 · 待处理反馈 5 · 待处理退款 2 · 待发货 8 → 点击跳转对应模块',
            marker: 2,
          },
          {
            kind: 'split',
            label: '快捷入口',
            sub: '说明',
            items: ['转化漏斗 B48', '业务趋势 B49', '退款队列 B24', '发货 B40'],
            right: ['退款金额含 Apple 渠道外退；App 端不开退款入口', '社区/商城关闭时 KPI 灰显（B44）'],
          },
        ],
      },
      {
        id: 'feature-off',
        label: '社区/商城关闭',
        blocks: [
          side('运营总览'),
          { kind: 'topbar', label: '工作台 / 运营总览', sub: '功能开关：社区关 · 商城关' },
          { kind: 'page-header', label: '运营总览' },
          { kind: 'alert', tone: 'info', label: '社区与商城 KPI 已隐藏（B44 功能开关）', marker: 1 },
          { kind: 'stat-row', items: ['新增用户 128', '日活 3,420', '训练完成 1,655', '订阅金额 ¥6,237'] },
        ],
      },
    ],
    annotations: {
      goal: '快速了解平台经营情况，并进入待办处理。',
      entry: '登录后默认 / 侧边栏-工作台-运营总览',
      exit: ['B48', 'B49', 'B24', 'B35', 'B40', 'B42'],
      role: '运营负责人；财务只读交易 KPI；社区运营见社区 KPI',
      data: [
        '用户/训练/交易/社区指标 — 统一统计服务（后端§1.1）',
        '待办计数 — 审核队列/反馈/退款/发货',
      ],
      actions: {
        primary: '切换时间范围查看 KPI',
        secondary: ['打开口径说明', '跳转漏斗/趋势', '跳转待办处理页'],
      },
      statesDesc: ['看板+待办', '社区/商城功能关闭', '无模块权限'],
      triggers: ['功能开关变更 → KPI 显隐', '待办点击 → 对应列表'],
      deps: ['B44 功能开关', 'B48 漏斗', 'B49 趋势', '各业务列表'],
      patches: ['后端需求§1'],
    },
  },
  {
    id: 'B48',
    name: '用户转化漏斗',
    reqCode: '后端§1.2',
    priority: 'P0',
    flow: 'E',
    states: [
      {
        id: 'default',
        label: '默认漏斗',
        blocks: [
          side('转化漏斗'),
          { kind: 'topbar', label: '工作台 / 转化漏斗', sub: '角色：运营 / 增长' },
          { kind: 'page-header', label: '用户转化漏斗', sub: '注册→问卷→试用→付费；含支付失败/关闭/超时流失节点' },
          {
            kind: 'filter-bar',
            label: '渠道：全部 ｜ 新老：全部 ｜ 标签：全部 ｜ 会员类型：全部 ｜ 版本：全部 ｜ 时间：近30天',
            marker: 1,
          },
          {
            kind: 'table',
            cols: ['台阶', '用户数', '步间转化', '总体转化', '环比'],
            items: [
              '注册成功 ｜ 10,000 ｜ — ｜ 100% ｜ +3%',
              '开始问卷 ｜ 8,200 ｜ 82% ｜ 82% ｜ +1%',
              '完成问卷 ｜ 6,100 ｜ 74% ｜ 61% ｜ -2%',
              '评测结果 ｜ 5,900 ｜ 97% ｜ 59% ｜ 0%',
              '推荐课曝光/点击 ｜ 4,800 ｜ 81% ｜ 48% ｜ +2%',
              '课程详情 ｜ 3,200 ｜ 67% ｜ 32% ｜ +1%',
              '会员入口 ｜ 2,100 ｜ 66% ｜ 21% ｜ +4%',
              '套餐选择 ｜ 1,400 ｜ 67% ｜ 14% ｜ +2%',
              '创建订单 ｜ 980 ｜ 70% ｜ 9.8% ｜ +1%',
              '发起支付 ｜ 900 ｜ 92% ｜ 9.0% ｜ 0%',
              '支付成功 ｜ 720 ｜ 80% ｜ 7.2% ｜ +3%',
            ],
            marker: 2,
          },
          {
            kind: 'alert',
            tone: 'info',
            label: '流失旁路：支付失败 90 · 关闭支付 60 · 订单超时 30（需移动端埋点对齐）',
            marker: 3,
          },
        ],
      },
    ],
    annotations: {
      goal: '展示注册到付费核心转化，支持多维筛选与环比。',
      entry: '工作台-转化漏斗 / B02 快捷入口',
      exit: ['B02', 'B18'],
      role: '运营 / 增长',
      data: ['漏斗台阶 UV — 行为埋点仓', '筛选维度 — 用户档案与标签'],
      actions: { primary: '筛选并导出漏斗', secondary: ['下钻某台阶用户列表（→B18）'] },
      statesDesc: ['默认漏斗', '无数据', '埋点未齐警告'],
      triggers: ['支付失败/关闭/超时记入流失节点'],
      deps: ['移动端全链路埋点', 'B18 用户列表'],
      patches: ['后端需求§1.2'],
    },
  },
  {
    id: 'B49',
    name: '业务趋势',
    reqCode: '后端§1.3',
    priority: 'P0',
    flow: 'E',
    states: [
      {
        id: 'default',
        label: '趋势三 Tab',
        blocks: [
          side('业务趋势'),
          { kind: 'topbar', label: '工作台 / 业务趋势', sub: '角色：运营 / 财务' },
          { kind: 'page-header', label: '业务趋势分析', sub: '日/周粒度折线（示意）' },
          { kind: 'tabs', items: ['用户趋势', '训练趋势', '收入趋势'], activeStep: 0, marker: 1 },
          {
            kind: 'panel',
            label: '折线图占位：新增 / 活跃 / 留存 / 流失',
            sub: '切换 Tab：训练人数·次数·完成率·打卡·连胜 ｜ 订阅人数·订阅收入·续费收入·退款金额',
            height: 160,
            marker: 2,
          },
          { kind: 'button-secondary', label: '导出 CSV' },
        ],
      },
    ],
    annotations: {
      goal: '观察用户、训练、收入变化趋势。',
      entry: '工作台-业务趋势',
      exit: ['B02'],
      role: '运营 / 财务',
      data: ['时序指标 — 统计服务'],
      actions: { primary: '切换指标组与时间粒度', secondary: ['导出'] },
      statesDesc: ['用户/训练/收入 Tab'],
      triggers: [],
      deps: ['B02'],
      patches: ['后端需求§1.3'],
    },
  },

  // ——— 用户标签 / 触达 ———
  {
    id: 'B17',
    name: '用户标签与分群',
    reqCode: '后端§2.3',
    priority: 'P0',
    flow: 'F',
    states: [
      {
        id: 'tags',
        label: '标签库',
        blocks: [
          side('用户标签'),
          { kind: 'topbar', label: '用户与 CRM / 标签与分群', sub: '角色：CRM 运营' },
          { kind: 'page-header', label: '用户标签', sub: '系统 / 会员 / 周期 / 自定义（后端§2.3）' },
          { kind: 'tabs', items: ['系统标签', '会员标签', '周期标签', '自定义标签', '用户分群'], activeStep: 3, marker: 1 },
          {
            kind: 'table',
            cols: ['标签名', '分类', '覆盖人数', '来源', '更新', '操作'],
            items: [
              '连续打卡 ｜ 系统 ｜ 2,104 ｜ 规则日更 ｜ 今日 ｜ 查看规则',
              '即将到期会员 ｜ 会员 ｜ 318 ｜ 权益同步 ｜ 实时 ｜ 查看用户',
              '黄体期 ｜ 周期 ｜ 1,560 ｜ 周期算法 ｜ 实时 ｜ 查看用户',
              '大基数 ｜ 自定义 ｜ 890 ｜ 人工/问卷映射 ｜ 03-02 ｜ 编辑/打标',
            ],
            marker: 2,
          },
          { kind: 'button-primary', label: '+ 新建自定义标签' },
          { kind: 'button-secondary', label: '批量打标' },
        ],
      },
      {
        id: 'segment',
        label: '用户分群',
        blocks: [
          side('用户标签'),
          { kind: 'topbar', label: '用户与 CRM / 分群', sub: '角色：CRM 运营' },
          { kind: 'page-header', label: '用户分群', sub: '条件组合 → 预估人数 → 用于触达 B28' },
          {
            kind: 'form-row',
            label: '分群条件',
            sub: '会员=即将到期 AND 标签含训练中断 AND 近7日未打开',
            marker: 1,
          },
          { kind: 'stat-row', items: ['预估人数 426', '可触达（允许通知） 391'] },
          { kind: 'button-primary', label: '保存分群并创建触达任务', to: 'B28' },
        ],
      },
    ],
    annotations: {
      goal: '管理用户标签与分群，支撑触达与运营分层。',
      entry: '用户与 CRM-标签与分群',
      exit: ['B18', 'B28'],
      role: 'CRM 运营',
      data: ['四类标签 — 规则引擎/权益/周期/运营配置', '分群定义 — CRM'],
      actions: {
        primary: '新建自定义标签 / 保存分群',
        secondary: ['批量打标', '查看覆盖用户', '查看系统标签规则'],
      },
      statesDesc: ['标签库', '用户分群', '规则说明只读'],
      triggers: ['标签变更记来源与历史'],
      deps: ['B18', 'B28', 'B09 答案标签映射'],
      patches: ['后端需求§2.3'],
    },
  },
  {
    id: 'B28',
    name: '触达任务与效果',
    reqCode: '后端§2.4',
    priority: 'P0',
    flow: 'G',
    states: [
      {
        id: 'list',
        label: '任务列表',
        blocks: [
          side('触达任务'),
          { kind: 'topbar', label: '消息中心 / 触达任务', sub: '角色：CRM 运营' },
          { kind: 'page-header', label: '触达任务与效果', sub: '定向发送 + 触发器实例；避免重复触达' },
          {
            kind: 'table',
            cols: ['任务', '渠道', '人群', '计划/实际', '状态', '到达率', '打开率', '操作'],
            items: [
              '会员到期提醒 ｜ Push ｜ 即将到期 ｜ 500/498 ｜ 已完成 ｜ 96% ｜ 41% ｜ 效果',
              '断练召回 ｜ 站内信 ｜ 分群A ｜ 800/— ｜ 定时中 ｜ — ｜ — ｜ 编辑',
              '触发:续费失败 ｜ Push ｜ 自动 ｜ 12/12 ｜ 已完成 ｜ 100% ｜ 55% ｜ 效果',
            ],
            marker: 1,
          },
          { kind: 'button-primary', label: '+ 新建定向任务' },
        ],
      },
      {
        id: 'create',
        label: '新建定向任务',
        blocks: [
          side('触达任务'),
          { kind: 'topbar', label: '消息中心 / 新建触达', sub: '角色：CRM 运营' },
          { kind: 'page-header', label: '新建定向发送' },
          { kind: 'form-row', label: '对象', sub: '指定用户 / 标签 / 分群 / 会员状态 / 流失风险 / 活动参与', marker: 1 },
          { kind: 'form-row', label: '模板', sub: '来自 B15 · 预览真实变量' },
          { kind: 'form-row', label: '发送', sub: '立即 / 定时 / 周期 ｜ 频控 ｜ 免打扰 ｜ 失败重试' },
          { kind: 'button-primary', label: '提交发送', marker: 2 },
        ],
      },
      {
        id: 'effect',
        label: '效果详情',
        blocks: [
          side('触达任务'),
          { kind: 'topbar', label: '消息中心 / 任务效果', sub: '← 返回列表' },
          { kind: 'page-header', label: '效果 · 会员到期提醒' },
          {
            kind: 'stat-row',
            items: ['发送 498', '到达 478', '打开 204', '点击 88', '训练转化 31', '付费转化 12', '取消通知 6'],
            marker: 1,
          },
          {
            kind: 'alert',
            tone: 'info',
            label: '打点链：发送→到达→打开→点击→深链落地→课程/会员/活动→参与/支付（后端§2.4）',
          },
        ],
      },
    ],
    annotations: {
      goal: '管理定向触达任务并衡量到达/打开/转化效果。',
      entry: '消息中心-触达任务；B17 分群创建',
      exit: ['B15', 'B16', 'B17', 'B18'],
      role: 'CRM 运营',
      data: ['任务与发送结果 — 消息服务', '转化 — 行为仓'],
      actions: {
        primary: '新建定向任务并发送',
        secondary: ['查看效果', '停止任务', '跳转触发器 B16'],
      },
      statesDesc: ['任务列表', '新建定向', '效果详情'],
      triggers: ['触发器 B16 产生的实例也在此展示'],
      deps: ['B15 模板', 'B16 触发器', 'B17 分群'],
      patches: ['后端需求§2.4'],
    },
  },

  // ——— 会员财务 ———
  {
    id: 'B22',
    name: '会员套餐',
    reqCode: '后端§7.1',
    priority: 'P0',
    flow: 'F',
    states: [
      {
        id: 'default',
        label: '套餐列表',
        blocks: [
          side('会员套餐'),
          { kind: 'topbar', label: '会员与财务 / 套餐管理', sub: '角色：财务 / 运营' },
          { kind: 'page-header', label: '会员套餐', sub: '驱动移动端 S22；支持月/季/年' },
          {
            kind: 'table',
            cols: ['套餐', '类型', '价格', '有效期', '自动续费', '状态', '购买人数', '操作'],
            items: [
              '月度会员 ｜ 月 ｜ ¥99 ｜ 30 天 ｜ 是 ｜ 上架 ｜ 6,210 ｜ 编辑',
              '季度会员 ｜ 季 ｜ ¥259 ｜ 90 天 ｜ 是 ｜ 上架 ｜ 820 ｜ 编辑',
              '年度会员 ｜ 年 ｜ ¥899 ｜ 365 天 ｜ 是 ｜ 草稿 ｜ 0 ｜ 编辑/上架',
              '老友首月 ｜ 月 ｜ ¥49.5 首月 ｜ 30 天 ｜ 次月99 ｜ 上架 ｜ 430 ｜ 编辑',
            ],
            marker: 1,
          },
          { kind: 'button-primary', label: '+ 新建套餐' },
        ],
      },
      {
        id: 'edit',
        label: '编辑套餐',
        blocks: [
          side('会员套餐'),
          { kind: 'topbar', label: '会员与财务 / 套餐 / 编辑', sub: '角色：财务' },
          { kind: 'page-header', label: '编辑套餐 · 季度会员' },
          { kind: 'form-row', label: '名称/类型/价格/有效期', sub: '季度会员 · 季 · ¥259 · 90 天' },
          { kind: 'form-row', label: '自动续费', sub: '● 开启  可随时取消（用户侧展示）' },
          {
            kind: 'form-row',
            label: '权益',
            sub: '每日定制课 · 周期建议 · 课表动态调整 · 饮食 Tips',
            marker: 1,
          },
          { kind: 'form-row', label: '上架状态', sub: '○ 草稿  ● 上架  ○ 下架' },
          { kind: 'button-primary', label: '保存' },
        ],
      },
    ],
    annotations: {
      goal: '配置会员商品，驱动 App 付费墙与订阅权益。',
      entry: '会员与财务-套餐管理',
      exit: ['B21', 'B18'],
      role: '财务 / 运营',
      data: ['套餐与权益 — 商品配置'],
      actions: { primary: '新建/编辑/上下架', secondary: ['查看购买与续费'] },
      statesDesc: ['套餐列表', '编辑套餐'],
      triggers: ['上架后移动端 S22 可读'],
      deps: ['移动端 S22/S24', 'B21'],
      patches: ['后端需求§7.1'],
    },
  },
  {
    id: 'B24',
    name: '退款管理',
    reqCode: '后端§7.5',
    priority: 'P0',
    flow: 'F',
    states: [
      {
        id: 'list',
        label: '退款列表',
        blocks: [
          side('退款管理'),
          { kind: 'topbar', label: '会员与财务 / 退款', sub: '角色：财务' },
          {
            kind: 'page-header',
            label: '退款管理',
            sub: 'App 不开退款口；兼容 Apple 渠道外退通知',
          },
          {
            kind: 'filter-bar',
            label: '状态：全部 ｜ 渠道：全部 ｜ 时间：近30天',
          },
          {
            kind: 'table',
            cols: ['退款单', '原订单', '用户', '原金额', '申请额', '渠道', '状态', '操作'],
            items: [
              'R-10021 ｜ O-…001 ｜ U-08771 ｜ 99 ｜ 99 ｜ 微信 ｜ 待审核 ｜ 审核',
              'R-10018 ｜ O-…882 ｜ U-07890 ｜ 99 ｜ 99 ｜ Apple ｜ 成功 ｜ 详情',
              'R-10015 ｜ O-…660 ｜ U-10200 ｜ 259 ｜ 100 ｜ 支付宝 ｜ 处理中 ｜ 详情',
            ],
            marker: 1,
          },
        ],
      },
      {
        id: 'review',
        label: '审核退款',
        blocks: [
          side('退款管理'),
          { kind: 'topbar', label: '会员与财务 / 退款 / 审核', sub: '二次确认' },
          { kind: 'page-header', label: '审核退款 · R-10021' },
          { kind: 'form-row', label: '原因', sub: '用户误购 / 体验不佳 / 其他…' },
          {
            kind: 'alert',
            tone: 'warn',
            label: '通过后将：原路退款 → 回收会员权益 → 写财务流水 B25 → 审计 B27',
            marker: 1,
          },
          { kind: 'button-primary', label: '审核通过' },
          { kind: 'button-danger', label: '审核拒绝' },
        ],
      },
    ],
    annotations: {
      goal: '统一处理退款申请与渠道退款通知，同步权益与账务。',
      entry: 'B02 待办 / 会员与财务-退款 / B21 订单',
      exit: ['B21', 'B25', 'B27'],
      role: '财务',
      data: ['退款单状态机 — 支付与权益服务'],
      actions: {
        primary: '审核通过/拒绝',
        secondary: ['查看原订单', 'Apple 回调详情'],
        destructive: '通过退款（权益回收）',
      },
      statesDesc: ['列表', '审核', 'Apple 外退自动入账'],
      triggers: ['Apple 退款通知 → 自动建单并同步'],
      deps: ['B21', 'B25', 'B27', '移动端无退款入口'],
      patches: ['后端需求§7.5'],
    },
  },
  {
    id: 'B25',
    name: '财务对账',
    reqCode: '后端§7.6',
    priority: 'P0',
    flow: 'F',
    states: [
      {
        id: 'default',
        label: '对账总览',
        blocks: [
          side('财务对账'),
          { kind: 'topbar', label: '会员与财务 / 对账', sub: '角色：财务' },
          { kind: 'page-header', label: '财务流水与对账', sub: '金额最小货币单位存储；明确币种/时区/结算周期' },
          { kind: 'tabs', items: ['微信流水', '支付宝流水', 'Apple 流水', '差异单'], activeStep: 0, marker: 1 },
          {
            kind: 'stat-row',
            items: ['订阅收入 ¥182k', '续费收入 ¥96k', '退款 ¥3.2k', '实际收入 ¥274.8k', 'ARPU ¥42', 'LTV ¥186'],
          },
          {
            kind: 'table',
            cols: ['日期', '系统订单', '渠道支付', '系统退款', '渠道退款', '手续费', '差异', '原因'],
            items: [
              '08-01 ｜ 12,300 ｜ 12,300 ｜ 198 ｜ 198 ｜ 62 ｜ 0 ｜ —',
              '08-02 ｜ 9,800 ｜ 9,701 ｜ 0 ｜ 0 ｜ 49 ｜ -99 ｜ 回调延迟',
            ],
            marker: 2,
          },
          { kind: 'button-secondary', label: '生成对账单' },
        ],
      },
    ],
    annotations: {
      goal: '三渠道流水对账与财务指标。',
      entry: '会员与财务-对账',
      exit: ['B21', 'B24'],
      role: '财务',
      data: ['渠道账单 / 系统订单退款'],
      actions: { primary: '生成对账单', secondary: ['标记差异原因', '导出'] },
      statesDesc: ['对账总览', '差异处理'],
      triggers: [],
      deps: ['B21', 'B24'],
      patches: ['后端需求§7.6'],
    },
  },

  // ——— 训练与课程 ———
  {
    id: 'B29',
    name: '打卡数据',
    reqCode: '后端§5.1',
    priority: 'P0',
    flow: 'H',
    states: [
      {
        id: 'default',
        label: '打卡统计',
        blocks: [
          side('打卡数据'),
          { kind: 'topbar', label: '训练与能量值 / 打卡', sub: '角色：运营' },
          { kind: 'page-header', label: '打卡数据', sub: '日切=用户本地自然日；不支持补卡（移动端 B-04/B-05）' },
          {
            kind: 'stat-row',
            items: ['当日打卡 1,490', '累计打卡人数 28.4k', '人均次数 12.3', '连3天 620', '连7天 210', '连30天 44', '中断 380'],
            marker: 1,
          },
          {
            kind: 'table',
            cols: ['用户', '日期', '课程', '主课', '完成度', '是否计打卡'],
            items: [
              'U-08771 ｜ 08-06 ｜ 舒缓瑜伽 ｜ 是 ｜ 100% ｜ 是',
              'U-07890 ｜ 08-06 ｜ 核心激活 ｜ 是 ｜ 50% ｜ 否（未达完课）',
            ],
            to: 'B19',
            marker: 2,
          },
        ],
      },
    ],
    annotations: {
      goal: '统计打卡并下钻到用户记录。',
      entry: '训练与能量值-打卡数据',
      exit: ['B19'],
      role: '运营',
      data: ['打卡记录 — 完课与打卡服务'],
      actions: { primary: '查看统计与下钻', secondary: ['导出（脱敏 H-08）'] },
      statesDesc: ['打卡统计'],
      triggers: [],
      deps: ['移动端 S12/S13/S25', 'B19'],
      patches: ['后端需求§5.1'],
    },
  },
  {
    id: 'B30',
    name: '能量值规则',
    reqCode: '后端§5.2',
    priority: 'P0',
    flow: 'H',
    states: [
      {
        id: 'default',
        label: '规则列表',
        blocks: [
          side('能量值规则'),
          { kind: 'topbar', label: '训练与能量值 / 规则', sub: '角色：运营' },
          {
            kind: 'page-header',
            label: '能量值规则',
            sub: '统一命名「能量值」（H-13）；默认主课+20 / 加练+10 / 连7天+50 可改',
          },
          {
            kind: 'table',
            cols: ['场景', '单次', '日上限', '周上限', '有效期', '可重复', '状态'],
            items: [
              '完成主课训练 ｜ +20 ｜ 40 ｜ — ｜ 永久 ｜ 是 ｜ 启用',
              '加练 ｜ +10 ｜ 30 ｜ — ｜ 永久 ｜ 是 ｜ 启用',
              '连续打卡7天 ｜ +50 ｜ — ｜ 50 ｜ 永久 ｜ 否/周期 ｜ 启用',
              '挑战赛 ｜ 按活动 ｜ — ｜ — ｜ 活动期 ｜ 否 ｜ 启用',
              '人工奖励 ｜ 审批 ｜ — ｜ — ｜ — ｜ — ｜ 走 B23',
            ],
            marker: 1,
          },
          { kind: 'button-primary', label: '+ 新建规则' },
          {
            kind: 'alert',
            tone: 'info',
            label: '流水不可直接覆盖；记录来源/增减/过期/余额/撤销关系',
            marker: 2,
          },
        ],
      },
    ],
    annotations: {
      goal: '配置能量值发放规则，驱动移动端奖励与对账。',
      entry: '训练与能量值-规则',
      exit: ['B23', 'B19'],
      role: '运营',
      data: ['规则配置 — 积分/能量值服务'],
      actions: { primary: '新建/编辑规则', secondary: ['停用规则'] },
      statesDesc: ['规则列表', '编辑规则'],
      triggers: ['人工发放走 B23 审批'],
      deps: ['移动端 S13/S27', 'B23', 'H-13'],
      patches: ['后端需求§5.2', 'H-13'],
    },
  },
  {
    id: 'B31',
    name: '课程组合',
    reqCode: '后端§4 课程组合',
    priority: 'P0',
    flow: 'A',
    states: [
      {
        id: 'list',
        label: '课程列表',
        blocks: [
          side('课程组合'),
          { kind: 'topbar', label: '内容中心 / 课程组合', sub: '角色：课程运营' },
          { kind: 'page-header', label: '课程组合', sub: '多视频组成课程；权益与上下架；对齐移动端 S10/S29' },
          {
            kind: 'table',
            cols: ['课程', '视频数', '权益', '状态', '更新', '操作'],
            items: [
              '舒缓瑜伽·黄体期 ｜ 1 ｜ 会员 ｜ 已发布 ｜ 08-01 ｜ 编辑',
              '21天塑形营 ｜ 21 ｜ 单独购买/永久 ｜ 已发布 ｜ 07-12 ｜ 编辑',
              '新手 START HERE ｜ 5 ｜ 免费 ｜ 已发布 ｜ 06-20 ｜ 编辑',
              '手臂塑形10min ｜ 1 ｜ 能量值兑换 ｜ 草稿 ｜ 08-05 ｜ 编辑',
            ],
            to: 'B31',
            marker: 1,
          },
          { kind: 'button-primary', label: '+ 新建课程' },
        ],
      },
      {
        id: 'edit',
        label: '课程编辑',
        blocks: [
          side('课程组合'),
          { kind: 'topbar', label: '内容中心 / 课程 / 编辑', sub: '角色：课程运营' },
          { kind: 'page-header', label: '编辑课程 · 21天塑形营' },
          { kind: 'form-row', label: '基础信息', sub: '标题 / 介绍 / 封面' },
          {
            kind: 'table',
            cols: ['序', '视频', '章节', '休息'],
            items: [
              '1 ｜ 热身 ｜ 第1周 ｜ 0',
              '2 ｜ 核心激活 ｜ 第1周 ｜ 30s',
              '3 ｜ 拉伸 ｜ 第1周 ｜ 0',
            ],
            marker: 1,
          },
          {
            kind: 'form-row',
            label: '权益',
            sub: '○免费 ●会员 ○能量值兑换 ○单独购买 ○永久解锁',
            marker: 2,
          },
          { kind: 'form-row', label: '状态', sub: '○草稿 ○待发布 ●已发布 ○已下架' },
          { kind: 'form-row', label: '展示', sub: '☑ 课程库  ☑ 老用户专栏位' },
          { kind: 'button-primary', label: '保存' },
        ],
      },
    ],
    annotations: {
      goal: '将视频组装为可售卖/可推荐的课程实体。',
      entry: '内容中心-课程组合',
      exit: ['B03', 'B04', 'B10'],
      role: '课程运营',
      data: ['课程与视频关系 — 内容服务', '权益 — 商品/会员'],
      actions: {
        primary: '新建/编辑课程并发布',
        secondary: ['添加删除排序视频', '设置章节与休息'],
      },
      statesDesc: ['课程列表', '课程编辑'],
      triggers: ['下架前评估影响用户（对齐 H-07）'],
      deps: ['B03 视频库', '移动端 S10/S17/S29'],
      patches: ['后端需求§4 课程组合'],
    },
  },

  // ——— 基础配置 ———
  listScreen('B42', '企微与反馈入口', '后端§9', 'K', 'P0', '企微配置', '客服 / 企微', '接入企业微信；可更换二维码。完整工单 P2。', {
    goal: '配置 App 帮助中心展示的企微客服二维码。',
    stats: ['当前码：已配置', '最近更新：08-01', '生效中'],
    primary: '上传并更换二维码',
    alerts: '完整反馈工单系统未纳入本批，仅二维码配置。',
    data: ['二维码资源 — 配置中心'],
    deps: ['移动端帮助中心'],
  }),
  listScreen('B43', 'App 版本管理', '后端§10.1', 'K', 'P0', 'App 版本', '基础配置 / App 版本', '最新版本、最低支持、强更、文案、下载地址、生效时间', {
    table: {
      cols: ['平台', '最新', '最低', '强更', '生效', '操作'],
      items: [
        'iOS ｜ 2.3.0 ｜ 2.0.0 ｜ 否 ｜ 08-01 ｜ 编辑',
        'Android ｜ 2.3.1 ｜ 2.0.0 ｜ 是 ｜ 08-03 ｜ 编辑',
      ],
    },
    primary: '+ 发布版本配置',
    goal: '控制客户端升级策略。',
  }),
  listScreen('B44', '功能开关', '后端§10.2', 'K', 'P0', '功能开关', '基础配置 / 功能开关', '问卷/训练推荐/社区/消息/挑战赛/商城/能量值/会员；支持平台·版本·人群·时间灰度', {
    table: {
      cols: ['功能', '总开关', '灰度', '平台', '状态'],
      items: [
        '问卷 ｜ 开 ｜ 100% ｜ 全 ｜ 生效',
        '社区 ｜ 开 ｜ 20% 分群 ｜ iOS ｜ 灰度中',
        '商城 ｜ 关 ｜ — ｜ 全 ｜ 关闭',
        '挑战赛 ｜ 开 ｜ 50% ｜ 全 ｜ 灰度中',
        '会员 ｜ 开 ｜ 100% ｜ 全 ｜ 生效',
      ],
    },
    primary: '保存开关',
    goal: '按维度灰度控制功能暴露。',
    deps: ['B02 KPI 显隐', '移动端 Tab/入口'],
  }),
  listScreen('B45', '公告与弹窗', '后端§10.3', 'K', 'P0', '公告弹窗', '基础配置 / 公告与弹窗', '标题/正文/图/跳转/人群/时间/频率/状态', {
    table: {
      cols: ['标题', '位置', '人群', '时间', '状态', '操作'],
      items: [
        '体验到期提醒 ｜ 今日弹窗 ｜ 体验第7天 ｜ 08-01~08-31 ｜ 发布 ｜ 编辑',
        '社区上线 ｜ 开屏 ｜ 全量 ｜ 定时 ｜ 草稿 ｜ 编辑',
      ],
    },
    primary: '+ 新建公告/弹窗',
    goal: '运营配置 App 内公告与弹窗。',
  }),
  listScreen('B46', '第三方服务配置', '后端§10.4', 'K', 'P0', '第三方服务', '基础配置 / 第三方服务', '支付/Push/短信/视频/审核/物流/数据；密钥不明文展示', {
    table: {
      cols: ['服务', '状态', '最近心跳', '说明'],
      items: [
        '微信支付 ｜ 已接入 ｜ 正常 ｜ 密钥掩码',
        '支付宝 ｜ 已接入 ｜ 正常 ｜ 密钥掩码',
        'Apple IAP ｜ 已接入 ｜ 正常 ｜ 共享密钥掩码',
        'Push ｜ 已接入 ｜ 正常 ｜ —',
        '内容审核 ｜ 已接入 ｜ 延迟↑ ｜ 告警',
        '物流 ｜ 未配置 ｜ — ｜ 商城 P1',
      ],
    },
    goal: '查看与管理第三方接入状态（密钥由运维注入）。',
    alerts: '敏感配置加密存储，页面仅掩码。',
  }),

  // ——— P1 社区 / 商城 占位（后端需求纳入原型，可点进） ———
  listScreen('B32', '帖子管理', '后端§6.1', 'I', 'P1', '帖子管理', '社区 / 帖子', '审核/下架/删除/推荐/置顶/精选/举报', {
    table: {
      cols: ['ID', '用户', '摘要', '审核', '赞/评', '展示', '操作'],
      items: ['P-100 ｜ U-01 ｜ 经期训练打卡 ｜ 待审 ｜ 12/3 ｜ 是 ｜ 审核'],
    },
    primary: '进入审核队列',
    goal: 'UGC 帖子运营与审核入口。',
  }),
  listScreen('B33', '评论管理', '后端§6.2', 'I', 'P1', '评论管理', '社区 / 评论', '官方回复/隐藏/删除/审核', {
    table: {
      cols: ['评论', '用户', '帖子', '状态', '操作'],
      items: ['很有用！ ｜ U-02 ｜ P-100 ｜ 正常 ｜ 回复/隐藏'],
    },
    goal: '评论审核与官方回复。',
  }),
  listScreen('B34', '官方内容', '后端§6.3', 'I', 'P1', '官方内容', '社区 / 官方内容', '专栏/单篇；话题标签；位置置顶推荐', {
    table: {
      cols: ['标题', '类型', '位置', '状态', '操作'],
      items: ['经期训练3误区 ｜ 单篇 ｜ 信息流 ｜ 已发布 ｜ 编辑'],
    },
    primary: '+ 发布官方内容',
    goal: '官方账号内容与专栏。',
    deps: ['移动端 S31'],
  }),
  listScreen('B35', 'UGC 审核', '后端§6.4', 'I', 'P1', 'UGC 审核', '社区 / 审核风控', '机审+人审；通过/拒绝/修改/转人工；处罚', {
    stats: ['待人审 12', '机审拒绝 4', '今日通过 88'],
    table: {
      cols: ['内容', '类型', '机审', '人审', '操作'],
      items: ['帖子P-100 ｜ 文本+图 ｜ 可疑 ｜ 待审 ｜ 处理'],
    },
    goal: '内容审核与用户处置。',
  }),
  listScreen('B36', '举报与申诉', '后端§6.5', 'I', 'P1', '举报申诉', '社区 / 举报与申诉', '举报处理与申诉审核，联动内容与处罚', {
    table: {
      cols: ['类型', '举报人', '被举报', '原因', '状态', '操作'],
      items: ['举报 ｜ U-a ｜ U-b ｜ 广告 ｜ 待处理 ｜ 处理'],
    },
    goal: '举报与申诉闭环。',
  }),
  listScreen('B37', '挑战赛管理', '后端§6.7', 'I', 'P1', '挑战赛', '社区 / 挑战赛', '目标/奖励/用户进度/补录补发/复盘', {
    table: {
      cols: ['活动', '时间', '报名', '完成率', '状态', '操作'],
      items: ['7日连打卡 ｜ 08-01~08-07 ｜ 1,200 ｜ 42% ｜ 进行中 ｜ 管理'],
    },
    primary: '+ 创建挑战赛',
    goal: '社区挑战赛运营。',
  }),
  listScreen('B38', '活动投放', '后端§6.7 投放', 'I', 'P1', '活动投放', '社区 / 活动投放', '开屏/Banner 等资源位；曝光点击 CTR', {
    table: {
      cols: ['资源位', '素材', '时间', '曝光', 'CTR', '状态'],
      items: ['首页Banner ｜ 挑战赛 ｜ 08-01~08-10 ｜ 20k ｜ 3.1% ｜ 投放中'],
    },
    primary: '+ 新建投放',
    goal: '资源位活动投放与数据。',
  }),
  listScreen('B47', '社区数据', '后端§6.6', 'I', 'P1', '社区数据', '社区 / 数据分析', '发帖用户/新增帖/互动/审核通过率/举报率/活跃趋势', {
    stats: ['发帖用户 320', '新增帖 45', '互动 1.2k', '审核通过率 92%', '举报率 0.8%'],
    goal: '社区经营数据。',
  }),
  listScreen('B39', '商品与库存', '后端§8.1-8.2', 'J', 'P1', '商品库存', '商城 / 商品与库存', '实物/能量值/现金/混合；SKU 与库存操作', {
    table: {
      cols: ['商品', '类型', 'SKU', '可用库存', '锁定', '状态'],
      items: ['品牌水杯 ｜ 能量值+现金 ｜ SKU-1 ｜ 120 ｜ 8 ｜ 上架'],
    },
    primary: '+ 新建商品',
    goal: '商城商品与库存管理。',
  }),
  listScreen('B40', '商城订单与发货', '后端§8.3-8.4', 'J', 'P1', '商城订单', '商城 / 订单发货', '待支付→完成状态机；批量发货与物流', {
    stats: ['待发货 8', '已发货 40', '售后中 2'],
    table: {
      cols: ['订单', '用户', '商品', '实付', '状态', '操作'],
      items: ['M-2001 ｜ U-01 ｜ 水杯 ｜ ¥9.9 ｜ 待发货 ｜ 发货'],
    },
    primary: '批量发货',
    goal: '商城订单与物流履约。',
  }),
  listScreen('B41', '售后管理', '后端§8.5', 'J', 'P1', '售后管理', '商城 / 售后', '类型与流程待产品补全；占位列表', {
    alerts: '原目录售后信息不全：需补退货/换货/仅退款等类型与状态机后再细化。',
    table: {
      cols: ['售后单', '订单', '类型', '状态', '操作'],
      items: ['AS-01 ｜ M-1990 ｜ 待定 ｜ 待处理 ｜ 查看'],
    },
    goal: '商城售后占位（流程待确认）。',
  }),
];
