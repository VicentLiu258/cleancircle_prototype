// 链路 A · 视频打标复核：B03 视频列表 → B04 视频编辑 → B07 AI 打标复核台
import type { ScreenDef, WireBlock } from './types';

const sideVideo: WireBlock = { kind: 'sidebar', label: '视频库' };
const sideReview: WireBlock = { kind: 'sidebar', label: 'AI 打标复核' };

export const screensVideo: ScreenDef[] = [
  {
    id: 'B03', name: '视频列表', reqCode: '§4 B03', priority: 'P0', flow: 'A',
    states: [
      { id: 'default', label: '默认列表', blocks: [
        sideVideo,
        { kind: 'topbar', label: '内容中心 / 视频库', sub: '角色：内容运营' },
        { kind: 'page-header', label: '视频库 · 312 条', sub: '状态流转：草稿 → 待打标 → 待复核 → 待审核 → 可用/已上架 → 已下架/已废弃（§5.1）' },
        { kind: 'stat-row', items: ['待复核 12', '待审核 5', '可用 280', '已上架 260', '必填标签缺失 8'] },
        { kind: 'filter-bar', label: '搜索 标题/ID ｜ 状态：全部 ｜ 标签维度：强度 ｜ 导入批次：2026-07 ｜ ☐ 只看标签缺失', marker: 1 },
        { kind: 'table', cols: ['标题', '时长', '状态', '标签完整度', '更新人', '操作'], items: [
          '清晨唤醒瑜伽 ｜ 18min ｜ 可用·已上架 ｜ 16/16 ｜ 运营A ｜ 编辑',
          '经期舒缓拉伸 ｜ 12min ｜ 待复核 ｜ 14/16 ｜ AI批次#42 ｜ 去复核 →B07',
          '大基数低冲击燃脂 ｜ 20min ｜ 待审核 ｜ 16/16 ｜ 运营B ｜ 查看审核',
          '睡前放松冥想 ｜ 10min ｜ 草稿 ｜ 6/16 ｜ 运营A ｜ 编辑',
        ], to: 'B04', marker: 2 },
        { kind: 'button-secondary', label: '批量导入（B05 · 后续批次）' },
        { kind: 'button-secondary', label: '批量上架 / 批量下架' },
        { kind: 'button-secondary', label: '导出（默认脱敏 + 水印）', patch: true, marker: 3 },
      ]},
      { id: 'empty', label: '首次空数据', blocks: [
        sideVideo,
        { kind: 'topbar', label: '内容中心 / 视频库', sub: '角色：内容运营' },
        { kind: 'page-header', label: '视频库', sub: '状态流转：草稿 → 待打标 → 待复核 → 待审核 → 可用/已上架' },
        { kind: 'panel', label: '还没有视频', sub: '先批量导入首批 300+ 视频（Excel 元数据 + 视频文件），或手动新建', height: 110 },
        { kind: 'button-primary', label: '批量导入（B05 · 后续批次）' },
        { kind: 'button-secondary', label: '+ 新建视频', to: 'B04' },
      ]},
      { id: 'no-result', label: '筛选无结果', blocks: [
        sideVideo,
        { kind: 'topbar', label: '内容中心 / 视频库', sub: '角色：内容运营' },
        { kind: 'page-header', label: '视频库 · 312 条' },
        { kind: 'filter-bar', label: '状态：已上架 ｜ 强度：5 ｜ 器械：哑铃 ｜ 经期可用：是' },
        { kind: 'alert', tone: 'info', label: '没有匹配的视频', sub: '当前筛选组合无结果（§7 空态要求）' },
        { kind: 'button-secondary', label: '清空筛选' },
      ]},
    ],
    annotations: {
      goal: '300+ 视频的台账管理：快速定位、掌握状态与打标进度，是打标复核链路的入口。',
      entry: '侧边栏-内容中心-视频库；B01 登录成功后的默认落地页',
      exit: ['B04', 'B07'],
      role: '内容运营（主操作）；课程/健康运营（查看安全标签）；只读审计（仅查看）',
      data: [
        '视频基础/媒体/训练/人群安全/展示/权益/系统七组字段 — 视频表（§5.1）',
        '状态机：草稿→待打标→待复核→待审核→可用/已上架→已下架/已废弃 — 状态流转服务',
        '标签完整度（必填标签组已填比例） — 标签库计算',
        '各状态数量统计 — 列表聚合',
      ],
      actions: {
        primary: '点击行进入 B04 视频编辑；状态为「待复核」的行操作列直达 B07 复核台',
        secondary: ['搜索与多维筛选', '批量导入（B05，后续批次）', '批量上架/下架', '导出（默认脱敏+水印，H-08）'],
        destructive: '批量下架：已用于课表的视频需逐条确认影响用户数（详见 B04 下架态，H-07）',
      },
      statesDesc: ['默认', '首次空数据（带创建/导入入口）', '筛选无结果（可清空）', '加载中', '加载失败', '无权限'],
      triggers: [
        '行操作「去复核」→ B07 并带入该视频与当前筛选上下文',
        '必填标签缺失的视频不允许置为「可用」，保存时被 B04 校验拦截',
      ],
      deps: ['移动端 S10 课程详情（展示字段同源）', '移动端 S29 浏览筛选（标签维度一致）', '标签库 B06（后续批次）'],
      patches: ['H-07', 'H-08'],
    },
  },
  {
    id: 'B04', name: '视频编辑', reqCode: '§4 B04', priority: 'P0', flow: 'A',
    states: [
      { id: 'editing', label: '编辑中', blocks: [
        sideVideo,
        { kind: 'topbar', label: '内容中心 / 视频库 / 编辑', sub: '← 返回列表 B03' },
        { kind: 'page-header', label: '编辑视频 · 清晨唤醒瑜伽（VID-0187）', sub: '状态：可用·已上架 ｜ 版本 v3 ｜ 标签来源：人工 + AI 复核' },
        { kind: 'tabs', items: ['基础', '媒体', '训练标签', '人群/安全', '展示与权益', '系统'], activeStep: 3 },
        { kind: 'form-row', label: '标题 / 副标题 / 简介', sub: '清晨唤醒瑜伽 ｜ 18 分钟温和启动 ｜ 文本框' },
        { kind: 'form-row', label: '媒体：视频文件 / 封面 / 竖版封面 / 字幕', sub: '已上传 ｜ 时长 18:24 ｜ 清晰度 1080p' },
        { kind: 'form-row', label: '训练：难度 3 ｜ 强度 中 ｜ 目标 塑形 ｜ 部位 全身 ｜ 器械 无 ｜ 跳跃 否', sub: '取值来自标签库（单选/多选受组约束）', marker: 1 },
        { kind: 'form-row', label: '人群/安全：经期可用 ✓ ｜ 大基数 ✓ ｜ 多囊 — ｜ 产后 ✗ ｜ 新手 ✓ ｜ 膝友好 ✓', sub: '安全类标签修改后需健康运营审核才生效（H-06）', marker: 2, patch: true },
        { kind: 'form-row', label: '展示：专区 新手启动 ｜ 排序 12 ｜ 推荐位 否', sub: '' },
        { kind: 'form-row', label: '权益：订阅课 ｜ 可访问人群 全部', sub: '' },
        { kind: 'button-primary', label: '保存', to: 'B03' },
        { kind: 'button-secondary', label: '提交安全审核（编辑人 ≠ 审核人）', patch: true },
        { kind: 'button-danger', label: '下架…', marker: 3 },
      ]},
      { id: 'off-shelf', label: '下架影响确认', blocks: [
        sideVideo,
        { kind: 'topbar', label: '内容中心 / 视频库 / 编辑 / 下架', sub: '角色：内容运营' },
        { kind: 'page-header', label: '下架确认 · 清晨唤醒瑜伽（VID-0187）' },
        { kind: 'alert', tone: 'warn', label: '该视频出现在 1,284 位用户的未完成课表中', sub: '下架后这些课表日显示「课程已下架」；MVP 不自动替换，需排课侧人工处理（H-07）', marker: 1, patch: true },
        { kind: 'table', cols: ['课表日', '影响用户数', '建议替换', '处理'], items: [
          'Day 4（经期舒缓段） ｜ 512 ｜ VID-0203 经期舒缓拉伸 ｜ 待人工确认',
          'Day 11（恢复日） ｜ 389 ｜ VID-0155 睡前放松冥想 ｜ 待人工确认',
          'Day 18（低冲击日） ｜ 383 ｜ 兜底池：低强度通用 ｜ 待人工确认',
        ] },
        { kind: 'button-danger', label: '确认下架（二次确认）', marker: 2 },
        { kind: 'button-secondary', label: '取消，返回编辑' },
      ]},
    ],
    annotations: {
      goal: '维护单个视频的全部结构化字段与上下架状态，保证排课引用的数据质量。',
      entry: 'B03 行点击「编辑」或「+ 新建视频」',
      exit: ['B03', 'B07'],
      role: '内容运营编辑；人群/安全类标签的修改需课程/健康运营审核（§6 审批流：视频安全标签）',
      data: [
        '七组字段（基础/媒体/训练/人群安全/展示/权益/系统） — 视频表（§5.1）',
        '标签可选值与互斥/必选约束 — 标签库（B06，后续批次）',
        '下架影响用户数与建议替换 — 排课引擎按未完成课表统计（H-07）',
      ],
      actions: {
        primary: '保存（校验必填标签组完整后写回，返回 B03）',
        secondary: ['切换六组字段 Tab', '提交安全审核（安全标签被修改时必走）', '预览移动端 S10 展示效果'],
        destructive: '下架：已用于课表 → 二次确认 + 影响用户明细（H-07）；废弃：仅草稿可废弃',
      },
      statesDesc: ['编辑中', '保存成功', '校验失败（必填标签缺失）', '下架影响确认', '数据已被他人修改（乐观锁，§7）', '审核中只读'],
      triggers: [
        '修改安全类标签 → 状态回退「待审核」，审核通过才恢复「可用」（§6）',
        '保存时校验必填标签组完整，缺失则拦截并定位到字段（§8-2 验收）',
      ],
      deps: ['移动端 S10 课程详情（字段同源展示）', '移动端 S09 今日课表卡（下架影响的用户侧表现）', '审批流 §6 视频安全标签'],
      patches: ['H-06', 'H-07'],
    },
  },
  {
    id: 'B07', name: 'AI 打标复核台', reqCode: '§4 B07', priority: 'P0', flow: 'A',
    states: [
      { id: 'single', label: '单条复核', blocks: [
        sideReview,
        { kind: 'topbar', label: '内容中心 / AI 打标复核', sub: '角色：内容运营 + 健康运营' },
        { kind: 'page-header', label: 'AI 打标复核台 · 待复核 12', sub: 'AI 结果不得自动发布为可排课状态（§5.1），必须人工复核', marker: 1 },
        { kind: 'filter-bar', label: '批次：#42 ｜ 置信度：全部 ｜ 标签组：人群/安全 ｜ 异常：全部' },
        { kind: 'split', label: '视频预览与基础信息', sub: 'AI 建议标签（置信度）→ 人工裁决', items: [
          '▶ 封面占位 · 经期舒缓拉伸 12min',
          '教练 Jo ｜ 语言 中 ｜ 清晰度 1080p',
          '已有标签：强度-低、目标-恢复、部位-髋部',
          '批次 #42 ｜ 打标时间 2026-07-29 22:14',
        ], right: [
          '逐条裁决右侧建议：',
          '接受 = 直接采用 ｜ 修改 = 换值并填理由',
          '驳回 = 丢弃并填理由 ｜ 安全类需健康运营终审',
        ] },
        { kind: 'tag-row', items: [
          '✓ 接受 · 经期可用 · 置信度 0.95',
          '✓ 接受 · 膝友好 · 置信度 0.91',
          '✎ 修改 · 强度 中→低 · 置信度 0.62 · 需填理由',
          '✗ 驳回 · 跳跃 · 置信度 0.31',
          '⚑ 安全类 · 产后适用 · 置信度 0.78 · 需健康运营终审（H-06）',
        ], marker: 2, patch: true },
        { kind: 'form-row', label: '修改理由（驳回/修改必填）', sub: '例：视频含跪姿，产后不适用 —— 写入审计日志', patch: true },
        { kind: 'button-primary', label: '提交复核结果 → 进入待审核', to: 'B03' },
        { kind: 'button-secondary', label: '跳过本条，下一条' },
      ]},
      { id: 'batch', label: '批量复核', blocks: [
        sideReview,
        { kind: 'topbar', label: '内容中心 / AI 打标复核', sub: '角色：内容运营' },
        { kind: 'page-header', label: '批量复核 · 批次 #42（86 条）' },
        { kind: 'alert', tone: 'info', label: '安全类标签不参与批量接受，必须逐条人工确认（H-06）', patch: true, marker: 1 },
        { kind: 'table', cols: ['视频', '建议标签数', '高置信(≥0.9)', '安全类', '异常', '操作'], items: [
          '☑ VID-0201 晨间拉伸 ｜ 14 ｜ 12 ｜ 0 ｜ — ｜ 单条复核',
          '☑ VID-0202 核心激活 ｜ 15 ｜ 11 ｜ 1（产后） ｜ — ｜ 单条复核',
          '☐ VID-0203 经期舒缓 ｜ 16 ｜ 9 ｜ 2 ｜ 置信度异常低 ｜ 单条复核',
        ] },
        { kind: 'button-primary', label: '批量接受勾选条目的高置信标签（2 条 · 23 个标签）', marker: 2 },
        { kind: 'button-secondary', label: '按标签维度批量复核（如只看「强度」）' },
      ]},
      { id: 'excel', label: 'AI 未就绪 · Excel 兜底', blocks: [
        sideReview,
        { kind: 'topbar', label: '内容中心 / AI 打标复核', sub: '角色：内容运营' },
        { kind: 'page-header', label: '结构化标签导入（Excel 兜底）' },
        { kind: 'alert', tone: 'warn', label: 'AI 打标能力未就绪（模型与输入未定，B-Q01）', sub: 'MVP 兜底路径：Excel 结构化标签导入 + 人工复核，与 AI 结果进入同一复核队列（H-03）', marker: 1, patch: true },
        { kind: 'steps', items: ['下载标签模板', '上传 Excel', '字段映射', '校验', '进入复核队列'], activeStep: 1 },
        { kind: 'table', cols: ['行', '视频ID', '标签列数', '校验', '问题'], items: [
          '12 ｜ VID-0203 ｜ 16 ｜ ✗ ｜ 「强度」取值不在标签库',
          '13 ｜ VID-0204 ｜ 16 ｜ ✓ ｜ —',
          '14 ｜ VID-0205 ｜ 15 ｜ ✗ ｜ 缺少必填组「人群/安全」',
        ] },
        { kind: 'button-primary', label: '导入通过行并进入复核队列' },
        { kind: 'button-secondary', label: '下载错误报告' },
      ]},
    ],
    annotations: {
      goal: '把 AI / Excel 产出的建议标签变成经人工确认的可排课标签，守住「300+ 视频标签质量」这一 MVP 上限。',
      entry: 'B03 行操作「去复核」；侧边栏-内容中心-AI 打标复核',
      exit: ['B03', 'B04'],
      role: '内容运营复核常规标签；安全类标签（经期/产后/多囊/大基数）仅课程/健康运营可终审（H-06）',
      data: [
        '视频预览与基础信息 — 视频表',
        'AI 建议标签 + 置信度 — 打标服务（模型未定，B-Q01）',
        'Excel 结构化标签 — 兜底导入（H-03）',
        '修改/驳回理由 — 复核记录（写审计日志，§5.11）',
      ],
      actions: {
        primary: '逐条接受/修改/驳回后提交，视频进入「待审核」',
        secondary: ['按批次/置信度/标签组/异常筛选', '批量接受高置信（安全类除外）', '导出复核报告'],
        destructive: '整批驳回：二次确认，驳回后该批回到「待打标」',
      },
      statesDesc: ['单条复核', '批量复核', 'AI 未就绪·Excel 兜底', '队列空（全部复核完成）', '无安全标签审核权限（安全行锁定）'],
      triggers: [
        '全部必填标签组复核通过 → 状态「待审核」→ 安全审核通过 →「可用」才进入排课候选（§8-2）',
        '复核动作全程写审计日志：操作人/前后值/理由（§5.11）',
      ],
      deps: ['移动端 S09 今日课程卡 / S10 课程详情（标签是 B12 排课规则硬性必须/排除的输入）', '审批流 §6 视频安全标签', '标签库 B06（后续批次）'],
      patches: ['H-03', 'H-06'],
    },
  },
];
