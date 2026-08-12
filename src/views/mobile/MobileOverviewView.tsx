import { screens } from '../../data/mobile';

interface Props {
  onNavigate: (screenId: string) => void;
}

const IA = [
  { tab: '今日 Today', desc: '定制服务核心首页（全量新建，P0）', screens: ['S09', 'S10', 'S19', 'S20', 'S21'] },
  { tab: '课程库 Library', desc: '视频库、搜索筛选（P1，参考 GWJ 原 App）', screens: ['S29', 'S30'] },
  { tab: '日历 Calendar', desc: '课表、打卡、自选加练（P0）', screens: ['S25'] },
  { tab: '社区 Homies', desc: '官方内容占位（P1，复用评估中）', screens: ['S31'] },
  { tab: '我的 Me', desc: '我的课程、打卡记录、能量值兑换、会员中心（P0）', screens: ['S26', 'S27', 'S28', 'S17', 'S24'] },
];

const SUPPORTING = [
  { title: '商品导购与分享（非独立 Tab）', desc: '今日页/我的页入口 → App 商品列表 → H5 分享页 → 第三方应用下单', screens: ['S32', 'S33', 'S34'] },
];

const FLOWS: { title: string; chain: string[]; note?: string }[] = [
  { title: '① 新用户首次使用', chain: ['S01', 'S02', 'S03', 'S04', 'S06', 'S08', 'S09', 'S10', 'S11', 'S12', 'S13'], note: '修改方案：不再生成长报告，S06 直接生成课表进入 S08' },
  { title: '② 老用户迁移', chain: ['S01', 'S14', 'S15', 'S16', 'S17', 'S04'], note: '迁移后进入评测主链路' },
  { title: '③ 每日使用', chain: ['S09', 'S19', 'S20', 'S10', 'S11', 'S12', 'S13'], note: 'S19 之后也可能直达 S10（无降级）' },
  { title: '④ 订阅转化', chain: ['S22', 'S23', 'S24'], note: '触发点：体验到期次日启动 / 点击锁定课程 / 今日页轻量入口' },
  { title: '⑤ 商品导购与分享', chain: ['S09', 'S32', 'S33', 'S34'], note: 'App/H5 仅提供商品介绍和入口；第三方平台完成支付、订单、物流与售后' },
];

export function OverviewView({ onNavigate }: Props) {
  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <h2 className="text-2xl font-bold text-gray-800">产品定位与 MVP 验证目标</h2>
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
      <p className="mt-2 text-xs text-gray-400">主链路流程页（S01–S08、S11–S16、S22–S23）不属于固定 Tab，由流程推进。</p>

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

      <h2 className="mt-10 text-2xl font-bold text-gray-800">五条核心流程</h2>
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
