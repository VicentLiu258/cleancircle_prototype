import { screens, REVISION_0901 } from '../../data/mobile';

interface Props {
  onNavigate: (screenId: string) => void;
}

const IA = [
  { tab: '今日 Today', desc: '定制服务核心首页 · Work/Fuel/Care 资源位 · 9 态（P0）', screens: ['S09', 'S10', 'S19', 'S20', 'S21'] },
  { tab: '课程库 Library', desc: '视频库、搜索筛选（P1，参考 GWJ 原 App）', screens: ['S29', 'S30'] },
  { tab: '日历 Calendar', desc: '课表、打卡、自选加练（P0）', screens: ['S25'] },
  { tab: '社区 Homies', desc: '官方内容占位（P1，复用评估中）', screens: ['S31'] },
  { tab: '我的 Me', desc: '用户档案、我的课程、我的能量、设置与帮助（P0）', screens: ['S26', 'S27', 'S28', 'S17', 'S24'] },
];

const SUPPORTING = [
  { title: '登录页协议查阅（非必须）', desc: '不进入主链路。仅从 S01 登录页三项协议名称独立进入 S02 对应全文，阅读后返回登录页，不会自动勾选', screens: ['S02'] },
  { title: '商品导购与分享（非独立 Tab）', desc: '今日页/我的页入口 → App 商品列表 → H5 分享页 → 第三方应用下单', screens: ['S32', 'S33', 'S34'] },
];

const FLOWS: { title: string; chain: string[]; note?: string }[] = [
  { title: '① 新用户首次使用', chain: ['S01', 'S03', 'S04', 'S19', 'S06', 'S08', 'S09', 'S10', 'S11', 'S12', 'S13'], note: 'S02 协议全文为非必须，仅从 S01 登录页《用户协议》《隐私政策》《健康数据处理说明》独立进入；勾选协议后登录直接进入 S03。首次 Check-in 确认 Push / Soft / Warm Day 后，进入 S06 生成课表，再到 S08' },
  { title: '② 老用户迁移', chain: ['S01', 'S14', 'S15', 'S16', 'S17', 'S04', 'S05', 'S19', 'S06', 'S08', 'S09'], note: '迁移完成后进入问卷提交，再完成首次 Check-in 后生成课表' },
  { title: '③ 每日使用', chain: ['S09', 'S19', 'S21', 'S20', 'S10', 'S11', 'S12', 'S13'], note: 'S09 九态：未 Check-in → 已确认 → 进行中 → 已完成；S21 仅在记录生理期首日后的第 3 天触发；S20 保持独立调整入口' },
  { title: '④ 订阅转化', chain: ['S09', 'S22', 'S23', 'S09', 'S24'], note: '触发点：S09 trial-strip 体验条 / locked Work 槽位 / 体验到期次日启动；S23 成功返回 S09 checked-not-started' },
  { title: '⑤ 商品导购与分享', chain: ['S09', 'S32', 'S33', 'S34'], note: 'S09 Commerce 资源位（折叠区 Jo 姐好物）→ App/H5 商品介绍 → 第三方平台下单' },
  { title: '⑥ 资源位运营', chain: ['B55', 'S09', 'B41', 'B14'], note: 'B55 配置 S09 页面 Work/Fuel/Care/Commerce 槽位排序与规则；Work 关联 D03 排课；Fuel 关联 B14 阶段话术；Commerce 关联 B41 商品入口' },
];

export function OverviewView({ onNavigate }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="rounded-lg border border-rose-200 bg-rose-50 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded bg-rose-600 px-1.5 py-0.5 text-[11px] font-bold text-white">{REVISION_0901.label}</span>
          <h2 className="text-lg font-bold text-gray-800">{REVISION_0901.title}</h2>
        </div>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-gray-600">
          {REVISION_0901.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {REVISION_0901.screens.map((sid) => {
            const s = screens.find((x) => x.id === sid);
            return (
              <button
                key={sid}
                onClick={() => onNavigate(sid)}
                className="rounded border border-rose-300 bg-white px-2 py-1 text-[11px] font-mono text-rose-800 hover:bg-rose-600 hover:text-white"
                title={s ? `${s.name}（${s.reqCode} · ${s.priority}）` : sid}
              >
                {sid}
              </button>
            );
          })}
        </div>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-gray-800">产品定位与 MVP 验证目标</h2>
      <div className="mt-3 rounded-lg border border-gray-200 bg-white p-5">
        <p className="text-sm leading-relaxed text-gray-600">
          Clean Circle 是一款面向女性的周期健康与运动 App，根据用户的生理周期、体质、运动习惯和身心状态，
          为其生成今日起 30 天滚动定制课表，并提供当日饮食、营养和生活方式建议（无长报告）。
        </p>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          <span className="font-semibold text-gray-700">MVP 仅验证一条核心付费链路：</span>
          注册/老用户识别 → 体质与周期问卷 → 评测结果话术 + 30 天课表 → 每日反馈、跟练与打卡 → 体验期结束订阅转化；
          老用户承接历史打卡、能量值与买断课程。
        </p>
      </div>

      <h2 className="mt-10 text-2xl font-bold text-gray-800">信息架构（5 Tab）</h2>
      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-5">
        {IA.map((t) => (
          <div key={t.tab} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-bold text-gray-700">{t.tab}</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">{t.desc}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {t.screens.map((sid) => (
                <button
                  key={sid}
                  onClick={() => onNavigate(sid)}
                  className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[11px] font-mono text-gray-600 hover:bg-gray-700 hover:text-white"
                >
                  {sid}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-gray-400">主链路流程页（S01、S03–S08、S11–S16、S22–S23）不属于固定 Tab，由流程推进。S02 为登录页协议查阅，非必须。</p>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {SUPPORTING.map((item) => (
          <div key={item.title} className="rounded-lg border border-gray-200 bg-white p-4">
            <p className="text-sm font-bold text-gray-700">{item.title}</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-400">{item.desc}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {item.screens.map((sid) => (
                <button key={sid} onClick={() => onNavigate(sid)} className="rounded border border-gray-300 bg-gray-50 px-1.5 py-0.5 text-[11px] font-mono text-gray-600 hover:bg-gray-700 hover:text-white">
                  {sid}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-2xl font-bold text-gray-800">六条核心流程</h2>
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
                      {sid}
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
    </div>
  );
}
