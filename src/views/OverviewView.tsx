import { screens } from '../data';

interface Props {
  onNavigate: (screenId: string) => void;
}

// 后台信息架构（需求文档 §3），sid = 本批已建线框可跳转
const IA: { menu: string; prio: string; pages: { label: string; sid?: string }[] }[] = [
  { menu: '工作台', prio: 'P1', pages: [{ label: '核心数据/待办/异常告警 B02（后续）' }] },
  { menu: '内容中心', prio: 'P0/P1', pages: [
    { label: '视频库 B03', sid: 'B03' }, { label: '视频编辑 B04', sid: 'B04' }, { label: '批量导入 B05', sid: 'B05' },
    { label: '标签库 B06', sid: 'B06' }, { label: 'AI 打标复核 B07', sid: 'B07' }, { label: '知识库（后续）' },
  ]},
  { menu: '评测与排课', prio: 'P0', pages: [
    { label: '问卷版本 B08', sid: 'B08' }, { label: '问卷编辑器 B09', sid: 'B09' }, { label: '评分/报告话术 B10', sid: 'B10' },
    { label: '排课规则 B11', sid: 'B11' }, { label: '规则编辑 B12', sid: 'B12' }, { label: '模拟测试 B13', sid: 'B13' },
  ]},
  { menu: '周期建议', prio: 'P0', pages: [{ label: '阶段建议 B14', sid: 'B14' }] },
  { menu: '消息中心', prio: 'P0', pages: [
    { label: '消息模板 B15', sid: 'B15' }, { label: '触发器 B16', sid: 'B16' }, { label: '发送记录 B17（P1 后续）' },
  ]},
  { menu: '用户中心', prio: 'P0', pages: [
    { label: '用户列表 B18', sid: 'B18' }, { label: '用户详情 B19', sid: 'B19' },
    { label: '迁移任务 B20', sid: 'B20' }, { label: '积分调整 B23', sid: 'B23' },
  ]},
  { menu: '订阅与财务', prio: 'P0/P1', pages: [
    { label: '订阅/订单 B21', sid: 'B21' }, { label: '看板 B22（P1 后续）' },
  ]},
  { menu: '商城', prio: 'P1 延后', pages: [{ label: '商品/库存/兑换（B-Q08 待定）' }] },
  { menu: '社区与活动', prio: 'P1', pages: [{ label: '挑战赛 B24 / UGC 审核 B25（P1 后续）' }] },
  { menu: '系统管理', prio: 'P0', pages: [
    { label: '登录 B01', sid: 'B01' }, { label: '角色权限 B26', sid: 'B26' }, { label: '审计日志 B27', sid: 'B27' },
  ]},
];

const FLOWS: { title: string; chain: string[]; note?: string }[] = [
  { title: '链路 A · 视频打标复核', chain: ['B05', 'B06', 'B03', 'B04', 'B07'], note: '批量导入/标签库（供给）→ 视频列表 → 编辑 → AI 打标复核（AI 未就绪走 Excel 兜底 H-03）；复核通过 → 安全审核 → 可用才进排课候选' },
  { title: '链路 B · 问卷评分发布', chain: ['B08', 'B09', 'B10'], note: '问卷编辑 → 评分/报告话术 → 版本发布；已发布不可直接编辑，修改复制新草稿' },
  { title: '链路 C · 排课规则模拟', chain: ['B11', 'B12', 'B13'], note: '规则编辑 → 模拟用户 → 28 天结果解释 → 样本回归 → 二次审核 → 发布' },
  { title: '链路 D · 迁移管理', chain: ['B20'], note: '单屏 6 状态向导：上传 → 字段映射 → 预校验 → 审批/执行 → 结果汇总 → 失败重试（幂等）' },
  { title: '链路 E · 用户与账务', chain: ['B18', 'B19', 'B21', 'B23', 'B27'], note: '用户列表 → 用户详情（7 分栏、敏感数据分层）→ 订阅/订单与权益修复 → 积分调整审批 → 全程审计可查' },
  { title: '支撑模块 · P0 闭环（非链路）', chain: ['B14', 'B15', 'B16', 'B26'], note: '周期建议（S09 Tips 内容源）/ 消息模板与触发器（Jo 姐触达）/ 角色权限（三层模型）；配合 B05/B06 构成后台 P0 全集' },
];

const ROLES: { role: string; scope: string; limit: string }[] = [
  { role: '超级管理员', scope: '全部模块、角色和系统配置', limit: '不应直接删除审计日志' },
  { role: '内容运营', scope: '视频、文章、标签、挑战赛', limit: '无用户健康明细和财务导出权限' },
  { role: '课程/健康运营', scope: '问卷、评分、周期建议、排课规则', limit: '规则发布需二次审核（H-04）' },
  { role: '用户运营/CRM', scope: '用户查询、标签、消息、迁移结果', limit: '健康信息脱敏；不可修改支付流水' },
  { role: '客服', scope: '用户档案、订阅、迁移、工单', limit: '手机号脱敏；积分补发需审批' },
  { role: '财务', scope: '订单、订阅、退款、对账与导出', limit: '无问卷答案和内容编辑权限' },
  { role: '社区审核员', scope: 'UGC 审核、举报、禁言封禁', limit: '无支付、规则和健康档案权限' },
  { role: '审计/只读', scope: '全局只读、日志查询', limit: '不可发布或导出高敏感数据' },
];

// 移动端体验 ↔ 后台能力（总览文档 §3），仅列本批覆盖行
const XREF: { mobile: string; cap: string; mScreens: string; aScreens: string[] }[] = [
  { mobile: '问卷逐题作答', cap: '问卷题目、选项、跳题和版本发布', mScreens: 'S04/S05', aScreens: ['B08', 'B09'] },
  { mobile: '体质得分与周期报告', cap: '评分权重、报告话术、专业审核和快照', mScreens: 'S06/S07', aScreens: ['B10'] },
  { mobile: '28 天 AI 课表', cap: '视频标签、排课规则、优先级、兜底和版本', mScreens: 'S08/S09', aScreens: ['B06', 'B07', 'B11', 'B12', 'B13'] },
  { mobile: '「太累」/「来例假了」', cap: '当日降级规则和周期重排规则', mScreens: 'S19/S20/S21', aScreens: ['B12'] },
  { mobile: '当日饮食生活 Tips', cap: '周期阶段与人群话术配置', mScreens: 'S09', aScreens: ['B14'] },
  { mobile: 'Jo 姐鼓励/召回', cap: '消息模板、触发事件、频控和发送日志', mScreens: 'S09/S26', aScreens: ['B15', 'B16'] },
  { mobile: '老用户资产', cap: '迁移导入、幂等校验、失败重试和用户档案', mScreens: 'S14–S17', aScreens: ['B20', 'B19'] },
  { mobile: '订阅开通', cap: '订单流水、渠道回调、权益计算和退款状态', mScreens: 'S22–S24', aScreens: ['B21'] },
];

export function OverviewView({ onNavigate }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-800">管理后台定位与 MVP 边界</h2>
      <div className="mt-3 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm leading-relaxed text-gray-600">
          管理后台的 MVP 目标不是覆盖全部运营场景，而是<span className="font-semibold text-gray-800">保证移动端核心链路可配置、可发布、可追溯、可人工干预</span>。
          本线框为总览文档「第 3 批」：5 条主链路 + 支撑模块，共 22 屏，覆盖《管理后台 MVP 需求文档》§4 清单的全部 P0 页面。
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-1.5 text-[13px] text-gray-600 md:grid-cols-2">
          <li>① 视频可批量导入、结构化打标和人工复核</li>
          <li>② 问卷、评分、话术、排课规则可配置及版本化</li>
          <li>③ 老用户资产可批量导入、校验、执行和查询</li>
          <li>④ 用户、订阅、付款、打卡、积分记录可查</li>
          <li>⑤ Jo 姐口吻的 Push/站内信触发器可配置</li>
          <li>⑥ 内容、规则和运营动作有审批与操作审计</li>
        </ul>
        <p className="mt-3 text-xs text-gray-400">①–⑥ 的 P0 能力全部覆盖；P1 模块（工作台 B02、发送记录 B17、看板 B22、挑战赛 B24、UGC B25、知识库、商城）为后续批次。</p>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-gray-800">核心流程与支撑模块（第 3 批）</h2>
      <div className="mt-3 space-y-4">
        {FLOWS.map((f) => (
          <div key={f.title} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-bold text-gray-700">{f.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {f.chain.map((sid, i) => {
                const s = screens.find((x) => x.id === sid);
                return (
                  <span key={i} className="flex items-center gap-1">
                    <button
                      onClick={() => onNavigate(sid)}
                      className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-[11px] font-mono text-gray-700 hover:bg-gray-700 hover:text-white"
                      title={s ? `${s.name}（${s.reqCode} · ${s.priority}）` : sid}
                    >
                      {sid} {s?.name}
                    </button>
                    {i < f.chain.length - 1 && <span className="text-gray-300">→</span>}
                  </span>
                );
              })}
            </div>
            {f.note && <p className="mt-1.5 text-xs text-gray-400">{f.note}</p>}
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-bold text-gray-800">后台信息架构（需求文档 §3）</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        {IA.map((m) => (
          <div key={m.menu} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-gray-700">{m.menu}</p>
              <span className="rounded bg-gray-100 px-1.5 text-[10px] text-gray-400">{m.prio}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {m.pages.map((p) =>
                p.sid ? (
                  <button
                    key={p.label}
                    onClick={() => onNavigate(p.sid!)}
                    className="rounded border border-gray-400 bg-gray-50 px-1.5 py-0.5 font-mono text-[11px] text-gray-700 hover:bg-gray-700 hover:text-white"
                  >
                    {p.label}
                  </button>
                ) : (
                  <span key={p.label} className="rounded border border-gray-200 px-1.5 py-0.5 text-[11px] text-gray-300">
                    {p.label}
                  </span>
                ),
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-400">深色描边 = 本批已建线框（可点击跳转）；浅灰 = 后续批次（全部为 P1）。</p>

      <h2 className="mt-10 text-2xl font-bold text-gray-800">角色与权限（§2 摘要）</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[12px] text-gray-500">
              <th className="px-4 py-2.5 font-bold">角色</th>
              <th className="px-4 py-2.5 font-bold">主要权限</th>
              <th className="px-4 py-2.5 font-bold">敏感操作限制</th>
            </tr>
          </thead>
          <tbody>
            {ROLES.map((r) => (
              <tr key={r.role} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2.5 font-semibold text-gray-700">{r.role}</td>
                <td className="px-4 py-2.5 text-gray-600">{r.scope}</td>
                <td className="px-4 py-2.5 text-gray-500">{r.limit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-400">权限模型：模块 + 数据范围 + 操作类型（查看/新增/编辑/审核/发布/下架/导入/导出/敏感数据查看）—— 配置界面见 B26。</p>

      <h2 className="mt-10 text-2xl font-bold text-gray-800">与移动端的依赖对照（总览文档 §3）</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[12px] text-gray-500">
              <th className="px-4 py-2.5 font-bold">移动端体验</th>
              <th className="px-4 py-2.5 font-bold">依赖的后台能力</th>
              <th className="px-4 py-2.5 font-bold">移动端屏</th>
              <th className="px-4 py-2.5 font-bold">本批后台屏</th>
            </tr>
          </thead>
          <tbody>
            {XREF.map((x) => (
              <tr key={x.mobile} className="border-b border-gray-100 last:border-0">
                <td className="px-4 py-2.5 text-gray-700">{x.mobile}</td>
                <td className="px-4 py-2.5 text-gray-500">{x.cap}</td>
                <td className="px-4 py-2.5 font-mono text-gray-400">{x.mScreens}</td>
                <td className="px-4 py-2.5">
                  <span className="flex flex-wrap gap-1">
                    {x.aScreens.map((sid) => (
                      <button
                        key={sid}
                        onClick={() => onNavigate(sid)}
                        className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 font-mono text-[11px] text-gray-600 hover:bg-gray-700 hover:text-white"
                      >
                        {sid}
                      </button>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-gray-400">S 编号为移动端屏幕（顶栏切换「移动端 App」查看，后台标注面板中可点击直达）；B 编号为后台需求文档 §4 页面。</p>
    </div>
  );
}
