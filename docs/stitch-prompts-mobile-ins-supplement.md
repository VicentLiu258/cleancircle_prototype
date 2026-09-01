# Clean Circle · Stitch 提示词补充包（状态缺口）

> **用途**：补齐主文档 `stitch-prompts-mobile-ins.md` 中未单独出稿、但线框数据 / `statesDesc` / 决策（B-01…B-13）已要求的状态与次级页面。  
> **依据**：`src/data/mobile/screens-a.ts` · `screens-b.ts` · `screens-c.ts` · `decisions.ts`  
> **风格**：与主文档一致——方案一「ins 极简风」；配色 **严格执行** 主文档正式品牌色板（仅 `#aa6459` `#68403e` `#824d48` `#ba7872` `#49352e` `#f3efe8`），禁止色板外色值。  
> **编号空缺**：仍不补造 **S07 / S18**。

---

## 一、完整度总览

### 1.1 主文档已覆盖较好（主态 + 关键变体齐）

| 屏幕 | 主文档已写状态 | 评价 |
|---|---|---|
| S01 | 默认 / 验证码错误 / 未勾选协议 | 缺 loading、老用户跳转瞬间 |
| S04 | 单选 / 日期 / 跳题 / 设备末题 | 缺题型模板、敏感声明、题间 loading |
| S06 | 生成中 / 失败 | 成功跳转可并入 loading 文案 |
| S09 | 未 Check-in / 已 Check-in / 已降级 / 体验临期 / 订阅锁定 / 兜底 | 缺「今日课进度三态」「评测未完成引导」 |
| S11 | 播放中 / 投屏搜索 / 投屏遥控 | 缺无设备/失败、中断续播 |
| S16 | 成功 / 部分成功 / 失败 | 缺迁移中 |
| S19 | 填写中 / 提交后降级建议 | 缺「提交后无降级」 |
| S21 | 确认前 / 重排完成 | 缺重排中 |
| S22 | 新用户 / 老用户 | 基本完整 |
| S23 | 成功 / 失败 / 结果未知 | 完整 |
| S24 | 生效中 / 已取消 | 缺「已失效」独立态 |
| S26 | 体验中 / 订阅中 / 已失效 | 完整（子页见补充） |

### 1.2 建议补写（按优先级）

| 优先级 | 缺口类型 | 屏幕 / 主题 |
|---|---|---|
| **P0** | 今日页核心业务态 | S09 今日课进度（未开始/进行中/已完成）、评测未完成引导卡 |
| **P0** | 权益与锁定 | S10 锁定定制课、S25 失效用户未来锁定、S24 已失效 |
| **P0** | 迁移完整闭环 | S15 二次确认 + 迁移中、S16 迁移中、S17 无已购课空态 |
| **P0** | 打卡与日历规则 | S13 连胜里程碑、S25 部分完成日、S12 双主课部分完成提示 |
| **P1** | 播放与投屏异常 | S11 无设备 / 连接失败、中断续播 |
| **P1** | 问卷题型与合规 | S04 多选·数字·滑杆模板、敏感选项健康声明、题间 loading |
| **P1** | 登录与协议 | S01 登录 loading、S02 协议全文 |
| **P1** | 空态 / 确认 | S27 空明细、S28 保存确认、S30 加入成功、S19 无降级关闭 |
| **P1** | 课程库探索 | S29 搜索结果 / 空结果 / 直播进行中 |
| **P2** | 我的子链路 | 迁移记录、打卡记录、设置·隐私·注销、健康数据删除、消息中心、邀请好友 |
| **P2** | 系统级 | 全局 Toast / 空态 / 网络错误 / 权限弹窗（HealthKit、通知） |

### 1.3 线框 `states` 数组 vs 主文档对照

| ID | 线框 `states` | 主文档 | 缺口 |
|---|---|---|---|
| S01 | default, code-error, no-agree | 3 态 | annotations 另有 loading / →S14 |
| S02 | user-agreement / privacy-policy / health-data | 3 态 | 三份协议独立全文（非必须） |
| S03 | default | 1 态 | 无 |
| S04 | single, date, skip, device | 4 态 | 多选/数字/滑杆、敏感声明、loading |
| S05 | default | 1 态 | 无 |
| S06 | loading, failed | 2 态 | 无（成功自动跳转可不单独出图） |
| S08 | default | 1 态 | 可选：滚动到「今日」高亮强调 |
| S09 | unchecked, checked, downgraded, trial, locked, fallback | 6 态 | 今日课进度三态、评测未完成 |
| S10 | default | 1 态 | loading、定制/自选标识、锁定 |
| S11 | playing, cast-search, cast-remote | 3 态 | 无设备/失败、续播 |
| S12 | default | 1 态 | 双主课「部分完成」说明（可选） |
| S13 | default | 1 态 | 连胜 7 天里程碑 |
| S14 | default | 1 态 | 无（无匹配直接跳过） |
| S15 | default | 1 态 | 二次确认弹窗、迁移中 |
| S16 | success, partial, failed | 3 态 | 迁移中 |
| S17 | default | 1 态 | 无已购课程空态 |
| S19 | editing, downgrade-suggest | 2 态 | 提交后无降级 |
| S20 | default | 1 态 | Toast 撤销已在文内备注，可单独组件 |
| S21 | confirm, done | 2 态 | 重排中 |
| S22 | new, old | 2 态 | 无 |
| S23 | success, failed, unknown | 3 态 | 无 |
| S24 | active, cancelled | 2 态 | 已失效 |
| S25 | default | 1 态 | 部分完成日、失效锁定、单日展开强调 |
| S26 | trial, subscribed, expired | 3 态 | 子页见 P2 |
| S27 | default | 1 态 | 空明细 |
| S28 | default | 1 态 | 保存确认 |
| S29 | default | 1 态 | 搜索/空结果/直播中 |
| S30 | default | 1 态 | 加入成功 |
| S31 | default | 1 态 | 完整 UGC 为 V2，可不补 |

---

## 二、使用说明

1. 本文件中的提示词 **依赖主文档全局 Design System**，生成前请先在 Stitch 中固定 tokens。  
2. 标注 `*变体*` 的条目建议 **单独一条 Stitch prompt** 生成，便于与主态对照。  
3. 标注 `*组件*` 的可合并到一张组件 sheet。  
4. 文案与规则以线框 + B-xx 决策为准；数值仍为占位（能量 +20 / +10 / +50 等）。

---

# 模块补充 · P0

## S09 · 今日首页 · 补充变体

### 变体 · 今日课 · 未开始

```text
Clean Circle "Today" home — workout not started yet (same shell as main Today).

Trial strip optional (体验第 3 天 / 共 7 天).
Greeting serif 「下午好，小圆」 + date.
Cycle card: 黄体期 · 第 6 天 with soft moon.
Check-in completed: 能量中 · 情绪平稳 · 睡眠一般 · 无不适.
Workout card status badge: 「未开始」
- Title 舒缓瑜伽 · 20min · 低强度 · 约 90 kcal
- Meta line: 建议时段 今晚 19:00 前完成
Primary CTA 「开始训练」
Secondary outline 「今天太累，运动降级」
Text chip 「来例假了」
Ritual row + 5-tab bar 今日 active.
Instagram-minimal wellness; Oat White #f3efe8 bg; CTA Dried Rose #aa6459; text Cocoa Brown #49352e; palette-only. Chinese UI.
```

### 变体 · 今日课 · 进行中（中断续练）

```text
Clean Circle Today home — workout in progress / resume.

Cycle + Check-in as completed states.
Workout card with progress:
- Badge 「进行中」
- Title 舒缓瑜伽
- Thin progress bar 08:32 / 20:00 (brand #aa6459)
- Sub: 上次看到这里 · 可继续
Primary 「继续训练」
Secondary ghost 「重新开始」
Hide heavy downgrade push; keep Ritual light.
Tab 今日 active. Calm resume UX, not alarmist.
```

### 变体 · 今日课 · 已完成

```text
Clean Circle Today home after main workout completed for the day.

Success treatment using brand #aa6459 accents only:
- Badge 「已完成 ✓」
- 舒缓瑜伽 · 实际 20min · 打卡已记
- Energy line 「+20 能量值已到账」
Primary becomes secondary style 「再看一遍」 or hidden
Optional card: 「今日还可加练」→ 课程库 / 日历
Streak strip: 连续打卡 3 天
Ritual still visible.
Quiet celebration, Instagram-minimal, no confetti explosion.
```

### 变体 · 评测未完成引导（B-11）

```text
Clean Circle Today for user who entered without finishing quiz.

Top info strip using aux-3 #ba7872 or aux-2 #824d48 (palette only, not harsh):
「定制课表尚未生成 · 完成评测后解锁每日建议」
Hero card empty-ish:
- Title 「继续完成评测」
- Body: 还差几题就能生成今日起 30 天专属课表
Primary 「继续评测」 (to quiz)
Secondary 「先逛逛课程库」（买断/公开内容可进）
No fake cycle prediction. Tab bar present.
Trustworthy onboarding recovery, Instagram-minimal Chinese UI.
```

---

## S10 · 课程详情 · 补充变体

### 变体 · 加载中

```text
Clean Circle workout detail loading skeleton.
Hero image placeholder soft wash, rounded bottom.
Shimmer lines for title + meta chips + reason card.
No harsh spinners — thin brand #aa6459 indeterminate ring tiny top-right.
Oat White #f3efe8, Instagram-minimal, palette-only.
```

### 变体 · 定制课 vs 自选课标识

```text
Clean Circle workout detail dual-badge comparison layout (can be one screen with two stacked cards OR two sibling frames).

Frame A · AI 定制课:
- Badge pill 「AI 定制」 aux-3 #ba7872 or brand #aa6459 (palette only)
- Title 舒缓瑜伽 · 黄体期放松
- Reason card 「为你推荐的理由」 fully visible
- Primary 开始跟练

Frame B · 自选加练:
- Badge pill 「自选」 outline aux-2 #824d48 (palette only, no green/sage)
- Title 手臂塑形 · 10min
- Helper: 自选课不计入打卡连胜，仅计时长与能量值
- Primary 开始跟练 · Secondary 加入日历 · Tertiary 从日历删除（if scheduled）

Same visual system, clear differentiation. Chinese UI.
```

### 变体 · 锁定定制课（点进付费墙）

```text
Clean Circle workout detail locked state after trial/subscription expired.
Hero dimmed within palette; thin outline lock #49352e or #68403e (not scary).
Title still readable.
Meta chips using aux-3 #ba7872 / #49352e (no cool gray hex).
Reason card replaced by lock card:
「定制课程已锁定 · 订阅后可继续今日建议」
Primary 「解锁完整定制服务」 (paywall)
Secondary 「查看我的买断课程」
Helper: 已购买断课不受影响
Closable back chevron. Never dark-pattern full block of buyouts. Instagram-minimal.
```

---

## S12 · 完课反馈 · 补充变体

### 变体 · 双主课仅完成 1 节（部分完成说明）

```text
Clean Circle post-workout feedback with partial-day note (B-04).

Title 「完成啦！感觉怎么样？」
Soft info chip above feedback groups:
「今日安排 2 节主课 · 已完成 1/2 · 全部完成才计当日打卡」
Same three segmented groups: 强度 / 身体 / 心情
Primary 「完成本节反馈」
Secondary 「跳过反馈」
Footer note: 日历将显示「部分完成 ◐」，今日 24:00 前可继续第二节
Calm instructional tone, Instagram-minimal.
```

---

## S13 · 打卡成功 · 补充变体

### 变体 · 连胜里程碑（连续 7 天 +50）

```text
Clean Circle check-in success milestone variant (B-10 placeholder).

Center poster larger: Day 7 · 连胜 7 天 · soft moon arc celebration (quiet, no fireworks)
Energy pills stacked:
- 「+20 完课奖励」
- 「+50 连续 7 天打卡额外奖励」 highlighted badge aux-3 #ba7872 or brand #aa6459 only
Caption: 历史最高连胜刷新 · 7 天
Secondary 保存长图 · Primary 返回今日
Editorial Instagram-story ready poster, UI chrome still minimal. Chinese UI.
```

---

## S15 · 迁移确认 · 补充变体

### 变体 · 二次确认弹窗

```text
Clean Circle destructive confirm dialog over S15 migration confirm screen.

Dimmed background of checklist.
Centered soft dialog (28px radius card):
Title 「确认绑定并迁移？」
Body: 一个原小程序账号仅可绑定一个 App 账号；迁移后不可解绑。买断课永久可见，不赠送定制订阅权益。
Primary filled 「确认迁移」
Secondary ghost 「再想想」
Serious, calm, high trust. No pure red — only aux-1 #68403e if needed. Palette-only. Instagram-minimal.
```

### 变体 · 迁移中

```text
Clean Circle migration in-progress full screen or sheet.
Soft moon/archive illustration
Serif 「正在迁移你的资产…」
Three progress rows with soft pending states:
- 历史打卡 · 同步中
- 能量值 · 排队中
- 已购课程 · 排队中
Subtle indeterminate brand #aa6459 ring
Tiny caption: 请勿关闭应用 · 批次创建后可在迁移记录查询
No cancel clutter. Pure waiting ritual.
```

---

## S16 · 迁移结果 · 补充变体

### 变体 · 迁移中（结果页前）

```text
Clean Circle migration loading result intermediate (if not covered by S15).
Same system as S15 loading but with batch number skeleton appearing:
「批次号生成中…」
Then auto-transition note in caption (for designers): success → S16 success; partial → S16 partial; fail → S16 failed.
Oat White #f3efe8, Instagram-minimal, palette-only.
```

---

## S17 · 我的资产 · 补充变体

### 变体 · 无已购课程空态

```text
Clean Circle "My assets" empty purchased courses.
Header 「我的资产」
Two stat cards still: 能量值 860 · 历史打卡 40 天
Section 「已购课程」
Empty state illustration (thin moon line + soft wash):
「暂无买断课程」
Sub: 订阅后可解锁每日定制课表；公开探索课可在课程库浏览
Primary 「完成评测，解锁定制服务」
Secondary 「去课程库看看」
Airy empty state, not sad. Instagram-minimal Chinese UI.
```

---

## S24 · 订阅管理 · 补充变体

### 变体 · 已失效

```text
Clean Circle subscription management fully expired state (distinct from cancelled-but-still-valid).

Header 「订阅管理」
Card with muted surface:
「订阅已失效」
Sub: 定制内容已锁定 · 历史打卡与买断课仍可查看
Benefits list de-emphasized with aux-3 #ba7872 / #49352e lock micro-icons (no cool gray)
Primary 「重新订阅」
Secondary 「恢复购买」
Tertiary text 「联系客服」
No shame language. Calm re-subscribe path. Instagram-minimal.
```

---

## S25 · 日历 · 补充变体

### 变体 · 部分完成日（◐）

```text
Clean Circle calendar tab focused on partial completion day (B-04).

Header 日历 · 2026 年 1 月
Month grid: one day marked ◐ ring aux-2 #824d48 (palette only)
Legend includes ◐ 部分完成
Day detail panel expanded for that day:
「1月17日 · 部分完成」
- 主课 1 ✓ 舒缓瑜伽 20min 已完成
- 主课 2 ○ 核心激活 25min 未完成 [开始]
Helper: 全部完成才计当日打卡 · 今日 24:00 前可继续 · 不支持补打历史日
Primary on unfinished row 「开始第二节」
Tab 日历 active. Soft data viz, not spreadsheet. Chinese UI.
```

### 变体 · 失效用户 · 未来课表锁定

```text
Clean Circle calendar for expired trial/subscription (B-11).

Month grid:
- Past days: history visible with ✓ / ◐ / rest marks
- Future days: lock pattern using aux-1 #68403e / aux-3 #ba7872 cells on #f3efe8, not blank, no off-palette gray
Top bar: 「定制未来课表已锁定 [续订]」
Day detail for a future date:
「定制课程已锁定」
Secondary list: 已购买断课仍可打开
Primary 「解锁订阅」
History streak card still readable.
Respectful lock UX, Instagram-minimal.
```

### 变体 · 单日展开强调（默认深化）

```text
Clean Circle calendar with day drawer / expanded bottom panel (default interaction deep dive).

Month grid compact upper 40%.
Selected day ring Cocoa Brown #49352e.
Bottom sheet-like panel (not full modal):
Date title + phase chip 黄体期
Rows:
- 定制课 AI badge + 开始
- 自选加练 badge + 删除（可撤销）
Footer + 加练
Tab 日历 active. Breathing space between rows.
```

---

# 模块补充 · P1

## S01 · 登录 · 补充变体

### 变体 · 登录请求 Loading

```text
Same Clean Circle login layout as default, with soft overlay or button loading state.
Primary pill 「微信一键登录」 shows thin spinner + label 「登录中…」
Fields disabled lightly.
No full-screen blocking spinner if avoidable — prefer button-level loading.
Calm, Instagram-minimal.
```

### 变体 · 匹配到旧账号（过渡）

```text
Clean Circle brief transitional screen after login success when phone matches mini-program account.
Soft success check + moon motif
Serif 「发现历史账号」
Sub: 正在为你准备资产信息…
Auto-advance caption (design note): → S14 资产发现
Keep under 1–2 seconds feel. Oat White #f3efe8 only.
```

---

## S02 · 协议 · 补充说明

S02 已从登录后必经授权页改为登录页三项协议的独立全文阅读页（用户协议 / 隐私政策 / 健康数据处理说明）。主稿见 `stitch-prompts-mobile-ins.md` S02，不再需要「同意并继续」consent 变体。

---

## S04 · 问卷 · 补充变体

### 变体 · 多选题模板

```text
Clean Circle quiz multi-select template screen.
Progress 「第 6 / 12 题」
Serif title 「你希望重点改善的部位？（可多选）」
Tall option cards with multi-check: 核心 / 臀腿 / 上肢 / 柔韧 / 心肺 — selected = brand #aa6459 ring + check
Helper: 最多选 3 项
Bottom: ← 返回上题 · 下一题
Instagram-minimal, breathing gaps.
```

### 变体 · 数字题模板

```text
Clean Circle quiz number input screen.
Progress 「第 7 / 12 题」
Serif 「你的身高是？」
Large centered number field in rounded card: 165 cm with stepper − / +
Optional unit toggle cm
Primary 下一题
Gentle wellness form, not medical chart.
```

### 变体 · 滑杆题模板

```text
Clean Circle quiz slider screen.
Progress 「第 8 / 12 题」
Serif 「近一个月运动频率？」
Soft horizontal slider in Oat White #f3efe8 card (no pure white): 几乎不运动 ——— 每周 5 次+ track/fill brand #aa6459
Labels under ends, current value chip 「每周 2–3 次」
Primary 下一题
Airy, Instagram-minimal.
```

### 变体 · 敏感选项健康声明

```text
Clean Circle quiz after selecting sensitive option (e.g. 产后恢复 / 多囊 / 明显疼痛).
Same quiz chrome.
Soft info card on Oat White #f3efe8 with border aux-3 #ba7872 (palette only, no sand/violet/off-palette):
Title 「温馨说明」 color #49352e
Body: Clean Circle 提供的是运动与生活方式建议，不能替代医疗诊断或治疗。如有不适请咨询专业医生。
Primary 「我已知晓，继续」 filled brand #aa6459
Secondary 「返回修改」
Trust-forward, calm. Chinese UI. Palette-only hex.
```

### 变体 · 加载下一题

```text
Clean Circle quiz interstitial loading.
Progress bar advances slightly.
Center tiny brand #aa6459 ring + sans 「加载下一题…」
Keep previous question softly faded. Minimal chrome.
```

---

## S11 · 播放与投屏 · 补充变体

### 变体 · 投屏无设备 / 连接失败

```text
Clean Circle cast sheet failure states (can be two frames).

Frame A · 无设备:
Title 「未发现可投屏设备」
Empty thin-line TV/moon icon
Tips: 确认电视与手机同一 Wi-Fi · 已打开投屏接收
Link 查看投屏帮助
Secondary 取消

Frame B · 连接失败:
Title 「连接失败」
Body: 无法连接到「客厅电视」
Primary 「重试」
Secondary 「选择其他设备」
Soft bottomsheet 28px radius on #f3efe8, dimmed player behind within palette. Never pure red or off-palette colors.
```

### 变体 · 中断续播

```text
Clean Circle video player resume state.
Video upper half at last frame soft blur
Center overlay card:
「继续上次进度？」
08:32 / 20:00
Primary 「继续播放」
Secondary 「从头开始」
Same minimal control chrome as playing state. Instagram-minimal wellness player.
```

---

## S19 · Check-in · 补充变体

### 变体 · 提交后无降级（直接关闭）

```text
Clean Circle Check-in success without downgrade.
Brief success toast over Today:
「今日 Check-in 已提交 ✓」
Sub: 能量中 · 情绪平稳 · 睡眠好 · 无不适
Optional one-line: 今日课程保持原计划
Sheet already dismissed; Today Check-in card flips to completed state.
Design as toast + Today checked state pair. Calm micro-interaction.
```

---

## S21 · 来例假了 · 补充变体

### 变体 · 重排中

```text
Clean Circle reschedule loading sheet after confirming period start.
Handle bar bottomsheet
Title 「正在重排今日起的课表…」
Body: 优先以经期首日更新阶段，历史已完成记录不受影响
Thin brand #aa6459 progress ring
Phase chip skeleton → becomes 月经期
No cancel. Then auto to 重排完成 state.
Gentle, serious, trustworthy.
```

---

## S27 · 能量值 · 补充变体

### 变体 · 空明细

```text
Clean Circle energy ledger empty state.
Header 「能量值」
Big serif balance 「0」 or small balance with no history
Empty illustration thin moon + soft wash
Title 「还没有能量值记录」
Sub: 完成今日训练即可获得能量值 · 主课 +20（占位）
Primary 「返回今日去训练」
Exchange zone card muted disabled or still tappable with empty catalog note.
Airy finance-lite empty UI.
```

---

## S28 · 周期资料 · 补充变体

### 变体 · 保存确认

```text
Clean Circle confirm dialog on saving cycle profile.

Title 「保存并重新生成课表？」
Body: 将按新的周期资料重算阶段与未来课表；已完成的历史记录保留。
Primary 「确认保存」
Secondary 「继续编辑」
Destructive note none unless deleting data.
After confirm design note: → S06 生成中
Calm form confirmation, Instagram-minimal.
```

---

## S29 · 课程库 · 补充变体

### 变体 · 搜索结果

```text
Clean Circle course library search results.
Header with search field active query 「拉伸」
Filter chips still visible
Results count 「12 门课程」
Vertical list cards: 睡前拉伸 10min / 经期舒缓拉伸 15min / …
Tab 课程库 active
Editorial list density low-medium. Chinese UI.
```

### 变体 · 空结果

```text
Clean Circle course library empty search.
Query 「水下芭蕾」 retained in field
Empty moon illustration
「没有找到相关课程」
Sub: 换个关键词，或看看新手专区
Secondary chips: 清除搜索 · 浏览 START HERE
Soft, helpful empty state.
```

### 变体 · 直播进行中

```text
Clean Circle course library with live banner active.
Top Live card elevated:
Badge LIVE using brand #aa6459 only (subtle, no extra colors)
「Live Workout with Jo · 进行中」
Meta 已有 128 人 · 预计 30min
Primary 「进入直播」
Rest of explore feed still on #f3efe8; no off-palette dim overlays.
Premium quiet live treatment, not loud streamer UI.
```

---

## S30 · 加入日历 · 补充变体

### 变体 · 加入成功

```text
Clean Circle after confirming add-to-calendar.
Bottomsheet morphs to success:
Check mark soft
Title 「已加入 1 月 20 日」
Sub: 自选课不计入打卡连胜，仅计时长与能量值
Primary 「查看日历」
Secondary 「完成」
Dimmed background. 28px radius. Instagram-minimal.
```

---

# 模块补充 · P2 · 我的子链路 & 系统级

> 线框主屏未全部拆独立 `Sxx`，但 annotations / 决策多次引用。建议 Stitch 按「子页」生成，便于研发对齐。

## P2-01 · 迁移记录

```text
Clean Circle migration history list under Profile.
Header 「迁移记录」
List rows:
- MIG-20260115-0042 · 成功 · 2026-01-15 14:22
  打卡 86 天 · 能量 +1280 · 课程 3 门
- MIG-20260110-0008 · 部分成功 · 查看详情
Empty optional: 暂无迁移记录
Tappable row → detail sheet with per-asset success/fail.
Batch/time/source/result permanent (B-12). Instagram-minimal settings aesthetic.
```

## P2-02 · 打卡记录

```text
Clean Circle check-in history.
Header 「打卡记录」
Summary card: 累计 86 天 · 当前连胜 3 · 历史最高 7
Month sections with day rows: 日期 · 课程名 · 时长 · 能量 +20
Partial days marked ◐
No make-up check-in CTA (B-04 不支持补打)
Airy list, Chinese UI.
```

## P2-03 · 设置 / 隐私 / 注销

```text
Clean Circle settings screen.
Groups:
1. 通知：Push 总开关 + 类型开关（打卡鼓励 / 课程提醒 / 断练召回 / 订阅到期）B-13
2. 隐私：用户协议 / 隐私政策 / 健康数据处理说明 / 下载我的数据
3. 账号：手机号 · 第三方绑定 · 注销账号（destructive text）
4. 关于：版本号 · 开源许可
Oat White #f3efe8 grouped list iOS style; text #49352e; palette-only. Instagram-minimal.
```

## P2-04 · 注销账号二次确认

```text
Clean Circle account deletion confirm.
Title 「确定注销账号？」
Body: 注销后个性化课表与偏好将清除；法律要求的订单与日志按规定保留。此操作不可恢复。
Input confirm phrase optional 「输入 注销 确认」
Primary destructive outline 「确认注销」
Secondary 「取消」
Use aux-1 #68403e only for destructive; never pure red or off-palette.
```

## P2-05 · 申请删除健康数据

```text
Clean Circle privacy right flow from S28.
Title 「申请删除健康数据」
Body: 将删除周期、Check-in、身体状态等健康相关数据；可能影响课表个性化。账号与买断订单可保留。
Primary 「提交删除申请」
Secondary 「取消」
Success toast design note: 将在法定期限内处理并通知你
Calm GDPR/PIPL-like trust UI.
```

## P2-06 · 消息中心（今日页入口）

```text
Clean Circle simple inbox from Today message icon.
Header 「消息」
Tabs or filters: 全部 / 训练 / 订阅
Rows:
- 今日训练提醒 · 2 小时前
- 体验明日到期 · 昨天
- 连胜鼓励 · 3 天前
Empty: 暂无消息 · 我们会克制推送（每日 ≤2，B-13）
No noisy red badge spam. Instagram-minimal.
```

## P2-07 · 邀请好友（占位）

```text
Clean Circle invite friends placeholder.
Header 「邀请好友」
Serif 「一起变得更好」
Share card with brand moon + referral code placeholder
Primary 「分享给微信好友」
Rules card: 权益数值待运营确认
Soft, non-spammy growth UI.
```

## P2-08 · 帮助中心 / 客服

```text
Clean Circle help center.
Search FAQ
Categories: 账号与迁移 / 课表与周期 / 订阅与支付 / 播放与投屏
Bottom 「联系客服」 primary
Article list minimal. Instagram-minimal support UI.
```

## *组件* · 全局空态 / 网络错误 / 权限

```text
Clean Circle system component sheet (Instagram-minimal):

1) Empty states: thin-line moon + soft wash + short title + one secondary action
2) Toast set: success (+20 能量) brand #aa6459; info aux-2 #824d48; gentle error text aux-1 #68403e (no pure red banner)
3) Network error full-page on #f3efe8: 「网络异常」 body #49352e · Primary filled #aa6459 重试 · Secondary outline 联系客服
4) iOS permission pre-prompt cards: only palette colors
   - 健康数据（睡眠/心率）
   - 通知推送
   Copy calm and optional-feeling
STRICT six hex only. Export as one component board for Stitch reuse.
```

## *组件* · Ritual 食谱详情（今日页入口）

```text
Clean Circle Ritual recipe detail (from Today Ritual row 「经期暖饮」).
Hero soft food photo warm tones within Dried Rose / Oat White family
Serif title 「经期暖饮」
Meta 5min · 简易
Ingredients chips + short steps
Disclaimer tiny: 非医疗建议
Primary 「完成仪式」 optional energy +0 placeholder
Back to Today. Editorial wellness, magazine-like.
```

---

# 三、建议生成顺序（补充包）

| 顺序 | 条目 | 原因 |
|---|---|---|
| 1 | S09 今日课三态 + 评测未完成 | 首页状态机闭环 |
| 2 | S10 锁定 / 定制·自选 | 付费与课型差异 |
| 3 | S25 部分完成 + 失效锁定 | 打卡规则可视化 |
| 4 | S15/S16 迁移中 + S15 二次确认 + S17 空态 | 老用户信任 |
| 5 | S13 里程碑 + S24 已失效 | 激励与商业化 |
| 6 | S11 投屏失败·续播 + S04 题型模板 | 体验完整 |
| 7 | S01/S02/S19/S21/S27/S28/S29/S30 余下变体 | 扫尾 |
| 8 | P2 子链路 + 系统组件 | 研发对齐与组件库 |

---

# 四、与主文档的合并建议

1. **不修改主文档编号体系**；本补充包以「变体 / P2 子页」挂靠原 Sxx。  
2. 主文档附录 A 屏幕索引可增加一列「补充状态」指向本文件章节。  
3. 若 Stitch 项目采用「一屏一 Frame」：  
   - 主文档 = Frame 主态 + 已写变体  
   - 本文件 = 追加 Frame，命名建议 `S09 · 今日课-已完成` 这种模式  
4. 配色已与主文档正式色板对齐；本文件提示词中的颜色描述亦仅允许色板内 hex。

---

# 五、检查清单（交付验收）

生成 Stitch 后，可用此表勾选：

### 今日闭环
- [ ] S09 未开始 / 进行中 / 已完成  
- [ ] S09 评测未完成引导  
- [ ] S19 无降级成功 Toast  
- [ ] S20 降级后 Toast 撤销（主文档已备注）  
- [ ] S21 重排中  

### 训练闭环
- [ ] S10 锁定 / 定制 vs 自选  
- [ ] S11 无设备·失败 / 续播  
- [ ] S12 双主课部分完成（可选）  
- [ ] S13 7 日里程碑  

### 迁移与资产
- [ ] S15 二次确认 + 迁移中  
- [ ] S16 迁移中  
- [ ] S17 无已购课空态  
- [ ] P2 迁移记录  

### 订阅与日历
- [ ] S24 已失效  
- [ ] S25 部分完成日  
- [ ] S25 失效未来锁定  

### 问卷与合规
- [ ] S04 多选 / 数字 / 滑杆  
- [ ] S04 敏感声明  
- [ ] S02 协议全文  
- [ ] S28 保存确认  
- [ ] P2 健康数据删除 / 注销  

### 探索与系统
- [ ] S29 搜索 / 空结果 / 直播中  
- [ ] S27 空明细  
- [ ] S30 加入成功  
- [ ] 全局空态·网络错误·权限预提示组件  

---

# 六、结论摘要

| 维度 | 结论 |
|---|---|
| **主路径是否可出图** | 可以。主文档对 S01–S31 主态与多数关键变体已足够支撑 P0 高保真。 |
| **状态机是否完整** | **不完整。** 尤其是 **S09 今日课进度**、**S10 锁定与课型**、**S25 部分完成/失效锁定**、**迁移中/二次确认**、**S24 已失效**、**问卷题型模板** 在主文档中缺失或仅口头提及。 |
| **线框 annotations 多出的状态** | 多数落在「加载 / 空态 / 二次确认 / 子页」，主文档未系统展开。 |
| **本补充包定位** | 作为 `stitch-prompts-mobile-ins.md` 的 **状态补丁**，不是第二套视觉方案。 |

---

*生成依据仓库线框数据；产品数值与季卡/年卡、老友权益方案仍以 M-Q01…M-Q10 待确认为准。*
