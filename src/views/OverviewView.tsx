import { screens } from '../data';

interface Props {
  onNavigate: (screenId: string) => void;
}

// 后台 IA：对齐《后端需求.docx》（2026-08-07，冲突以后端为准）
const IA: { menu: string; prio: string; pages: { label: string; sid?: string }[] }[] = [
  { menu: '工作台', prio: 'P0', pages: [
    { label: '运营总览 B02', sid: 'B02' }, { label: '转化漏斗 B48', sid: 'B48' },
    { label: '业务趋势 B49', sid: 'B49' }, { label: '用户行为 B50', sid: 'B50' },
  ]},
  { menu: '用户与 CRM', prio: 'P0', pages: [
    { label: '用户列表 B18', sid: 'B18' }, { label: '用户详情 B19', sid: 'B19' },
    { label: '标签与分群 B17', sid: 'B17' }, { label: '迁移 B20', sid: 'B20' },
  ]},
  { menu: '消息与触达', prio: 'P0', pages: [
    { label: '模板 B15', sid: 'B15' }, { label: '触发器 B16', sid: 'B16' }, { label: '触达任务 B28', sid: 'B28' },
  ]},
  { menu: '问卷评测', prio: 'P0', pages: [
    { label: '问卷 B08', sid: 'B08' }, { label: '编辑器 B09', sid: 'B09' }, { label: '结果话术 B10', sid: 'B10' },
  ]},
  { menu: '内容中心', prio: 'P0', pages: [
    { label: '视频库 B03', sid: 'B03' }, { label: '编辑 B04', sid: 'B04' }, { label: '导入 B05', sid: 'B05' },
    { label: '标签库 B06', sid: 'B06' }, { label: 'AI 复核 B07', sid: 'B07' }, { label: '课程组合 B31', sid: 'B31' },
  ]},
  { menu: '排课与建议', prio: 'P0', pages: [
    { label: '规则 B11', sid: 'B11' }, { label: '编辑 B12', sid: 'B12' },
    { label: '模拟30天 B13', sid: 'B13' }, { label: '阶段建议 B14', sid: 'B14' },
  ]},
  { menu: '训练与能量值', prio: 'P0', pages: [
    { label: '打卡 B29', sid: 'B29' }, { label: '规则 B30', sid: 'B30' }, { label: '调整审批 B23', sid: 'B23' },
  ]},
  { menu: '会员与财务', prio: 'P0', pages: [
    { label: '套餐 B22', sid: 'B22' }, { label: '订阅订单 B21', sid: 'B21' },
    { label: '退款 B24', sid: 'B24' }, { label: '对账 B25', sid: 'B25' },
  ]},
  { menu: '社区与活动', prio: 'P1', pages: [
    { label: '帖子 B32', sid: 'B32' }, { label: '评论 B33', sid: 'B33' }, { label: '官方 B34', sid: 'B34' },
    { label: '审核 B35', sid: 'B35' }, { label: '举报 B36', sid: 'B36' }, { label: '挑战赛 B37', sid: 'B37' },
    { label: '投放 B38', sid: 'B38' }, { label: '社区数据 B47', sid: 'B47' },
  ]},
  { menu: '商城与履约', prio: 'P1', pages: [
    { label: '商品库存 B39', sid: 'B39' }, { label: '订单发货 B40', sid: 'B40' },
    { label: '售后 B41', sid: 'B41' }, { label: '库存对账 B51', sid: 'B51' },
  ]},
  { menu: '客服与配置', prio: 'P0', pages: [
    { label: '企微 B42', sid: 'B42' }, { label: '版本 B43', sid: 'B43' }, { label: '开关 B44', sid: 'B44' },
    { label: '公告 B45', sid: 'B45' }, { label: '三方 B46', sid: 'B46' },
  ]},
  { menu: '系统管理', prio: 'P0', pages: [
    { label: '登录 B01', sid: 'B01' }, { label: '角色 B26', sid: 'B26' }, { label: '审计 B27', sid: 'B27' },
  ]},
];

const FLOWS: { title: string; chain: string[]; note?: string }[] = [
  { title: '工作台 · 经营洞察', chain: ['B02', 'B48', 'B49', 'B50'], note: '核心 KPI + 待办；转化漏斗；趋势；用户行为（事件/路径/留存）' },
  { title: '内容 · 视频到课程', chain: ['B05', 'B06', 'B03', 'B04', 'B07', 'B31'], note: '导入/标签/视频/AI 复核 → 课程组合（权益与上下架）' },
  { title: '问卷评测发布', chain: ['B08', 'B09', 'B10'], note: '复评 14/28 天；选项映射用户/训练标签；结果话术（无长报告）' },
  { title: '排课规则模拟', chain: ['B11', 'B12', 'B13', 'B14'], note: '规则编辑 → 30 天模拟解释 → 回归发布；阶段建议' },
  { title: 'CRM 与触达', chain: ['B18', 'B19', 'B17', 'B15', 'B16', 'B28'], note: '用户档案 + 标签分群 + 模板/触发器 + 触达效果' },
  { title: '迁移', chain: ['B20'], note: 'Excel 向导：校验 → 执行 → 部分成功重试（幂等）' },
  { title: '训练与能量值', chain: ['B29', 'B30', 'B23'], note: '打卡统计；能量值规则；人工调整审批（统一称能量值）' },
  { title: '会员财务', chain: ['B22', 'B21', 'B24', 'B25'], note: '套餐 → 订阅订单 → 退款（含 Apple 外退）→ 三渠道对账' },
  { title: '社区（P1）', chain: ['B32', 'B35', 'B37', 'B38'], note: '帖子/审核/挑战赛/投放' },
  { title: '商城（P1）', chain: ['B39', 'B40', 'B41', 'B51'], note: '商品库存 → 订单发货 → 售后全流程 → 库存对账' },
  { title: '配置与系统', chain: ['B42', 'B43', 'B44', 'B45', 'B46', 'B26', 'B27'], note: '企微/版本/开关/公告/三方；角色与审计' },
];

const ROLES: { role: string; scope: string; limit: string }[] = [
  { role: '超级管理员', scope: '全部模块、角色和系统配置', limit: '不应直接删除审计日志' },
  { role: '内容运营', scope: '视频、课程、标签、挑战赛、投放', limit: '无用户健康明细和财务导出权限' },
  { role: '课程/健康运营', scope: '问卷、话术、周期建议、排课规则', limit: '规则发布需二次审核（H-04）' },
  { role: '用户运营/CRM', scope: '用户查询、标签分群、消息触达、迁移结果', limit: '健康信息脱敏；不可修改支付流水' },
  { role: '客服', scope: '用户档案、订阅、迁移、企微入口', limit: '手机号脱敏；能量值补发需审批' },
  { role: '财务', scope: '套餐、订单、订阅、退款、对账与导出', limit: '无问卷答案和内容编辑权限' },
  { role: '社区审核员', scope: 'UGC 审核、举报、禁言封禁', limit: '无支付、规则和健康档案权限' },
  { role: '审计/只读', scope: '全局只读、日志查询', limit: '不可发布或导出高敏感数据' },
];

const XREF: { mobile: string; cap: string; mScreens: string; aScreens: string[] }[] = [
  { mobile: '问卷逐题 / 复评', cap: '问卷版本、14/28 天复评、标签映射', mScreens: 'S04/S05', aScreens: ['B08', 'B09'] },
  { mobile: '评测后生成课表', cap: '结果话术 + 今日起 30 天课表（无长报告）', mScreens: 'S06/S08', aScreens: ['B10', 'B13'] },
  { mobile: '滚动 30 天 AI 课表', cap: '视频标签、课程组合、排课规则、兜底', mScreens: 'S08/S09', aScreens: ['B06', 'B07', 'B11', 'B12', 'B31'] },
  { mobile: '「太累」/「来例假了」', cap: '当日降级与周期重排规则', mScreens: 'S19/S20/S21', aScreens: ['B12'] },
  { mobile: '饮食 Tips / Ritual', cap: '周期阶段话术配置', mScreens: 'S09', aScreens: ['B14'] },
  { mobile: 'Push / 站内信', cap: '模板、触发器、触达任务与效果', mScreens: 'S09/S26', aScreens: ['B15', 'B16', 'B28'] },
  { mobile: '能量值发放', cap: '规则配置 + 人工调整审批', mScreens: 'S13/S27', aScreens: ['B30', 'B23'] },
  { mobile: '老用户资产', cap: '迁移导入、幂等、用户档案', mScreens: 'S14–S17', aScreens: ['B20', 'B19'] },
  { mobile: '订阅开通', cap: '套餐、订单、退款、对账', mScreens: 'S22–S24', aScreens: ['B22', 'B21', 'B24', 'B25'] },
  { mobile: '课程库 / 已购课', cap: '课程组合与权益', mScreens: 'S29/S17', aScreens: ['B31'] },
  { mobile: '社区 Homies', cap: '官方内容 / UGC（P1）', mScreens: 'S31', aScreens: ['B34', 'B32'] },
];

export function OverviewView({ onNavigate }: Props) {
  const total = screens.length;
  const p0 = screens.filter((s) => s.priority === 'P0').length;
  const p1 = screens.filter((s) => s.priority === 'P1').length;

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-800">管理后台 · 对齐《后端需求》</h2>
      <div className="mt-3 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm leading-relaxed text-gray-600">
          以《后端需求.docx》为权威规格；与旧后台原型冲突时<strong className="text-gray-800">以后端需求为准</strong>。
          线框目标：移动端核心链路<strong className="text-gray-800">可配置、可发布、可追溯、可人工干预</strong>，并覆盖经营看板、CRM、财务、社区与商城原型。
        </p>
        <p className="mt-2 text-sm text-gray-600">
          当前共 <span className="font-semibold text-gray-800">{total}</span> 屏线框
          （P0 <span className="font-semibold">{p0}</span> · P1 <span className="font-semibold">{p1}</span>）。
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-1.5 text-[13px] text-gray-600 md:grid-cols-2">
          <li>① 运营总览 / 漏斗 / 趋势与待办</li>
          <li>② 视频导入打标 + 课程组合</li>
          <li>③ 问卷复评、标签映射、结果话术（无长报告）</li>
          <li>④ 排课规则与 <strong>30 天</strong>模拟</li>
          <li>⑤ 用户标签分群、触达任务与效果</li>
          <li>⑥ 能量值规则与调整审批（统一命名）</li>
          <li>⑦ 会员套餐、订单、退款、三渠道对账</li>
          <li>⑧ 社区 / 商城 P1 原型；基础配置与审计</li>
        </ul>
        <p className="mt-3 text-xs text-gray-400">
          口径修订：H-02→今日起 30 天滚动；H-13 能量值；H-14 无长报告。详见「逻辑补全说明」。
        </p>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-gray-800">核心流程</h2>
      <div className="mt-3 space-y-4">
        {FLOWS.map((f) => (
          <div key={f.title} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-bold text-gray-700">{f.title}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {f.chain.map((sid, i) => {
                const s = screens.find((x) => x.id === sid);
                return (
                  <span key={`${f.title}-${sid}-${i}`} className="flex items-center gap-1">
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

      <h2 className="mt-10 text-2xl font-bold text-gray-800">后台信息架构</h2>
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

      <h2 className="mt-10 text-2xl font-bold text-gray-800">角色与权限（摘要）</h2>
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

      <h2 className="mt-10 text-2xl font-bold text-gray-800">与移动端依赖对照</h2>
      <div className="mt-3 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-[12px] text-gray-500">
              <th className="px-4 py-2.5 font-bold">移动端体验</th>
              <th className="px-4 py-2.5 font-bold">依赖的后台能力</th>
              <th className="px-4 py-2.5 font-bold">移动端屏</th>
              <th className="px-4 py-2.5 font-bold">后台屏</th>
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
    </div>
  );
}
