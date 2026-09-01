# Clean Circle · Stitch 界面提示词包

## 方案一：ins 极简风

> 用途：按模块 / 页面在 Stitch 中生成高保真移动端界面。  
> 依据：当前仓库移动端线框（`src/data/mobile/*`，S01–S31，缺 S07 / S18）。  
> 风格：方案一「ins 极简风」——呼吸感、留白、圆角卡片、衬线+无衬线混排、月相辅助图形、轻量数据可视化。

---

## 使用方式

1. **先跑一次「0. 全局 Design System」**，在 Stitch 中固定视觉语言。
2. **按模块逐屏粘贴**下方「界面提示词」；关键状态另起一条（文中标注为 *变体*）。
3. 每条提示词默认约定：**iPhone 15 Pro 竖屏 · UI mockup · 非线框 · 可交付高保真**。
4. 避免：霓虹色、厚重阴影、过度渐变、卡通吉祥物、医疗冷感蓝、信息堆砌。
5. **配色以正式品牌色板为准（见下表）**。所有界面 **仅允许使用色板内色值**，禁止引入色板外 hex（含纯白、纯黑、灰阶、绿/紫/琥珀等）。

---

## 设计约束摘要

| 项 | 说明 |
|---|---|
| 理念 | 以「呼吸感」为核心隐喻；健康、温暖、轻盈；极简高级感女性用户 |
| 字体 | 衬线标题（情绪/品牌）+ 无衬线正文与控件 |
| 形态 | 大圆角卡片（约 20–28px）、充裕边距与卡片间距 |
| 图形 | 月相 / 周期阶段作辅助元素，克制使用 |
| 数据 | 日历阶段着色 **仅用品牌玫瑰辅色阶**，细进度环/条，避免仪表盘感 |
| 语言 | 界面文案以中文为主，品牌英文 slogan 可点缀 |
| 配色 | **严格执行正式色板**，不得自由发挥 |

---

## 0. 全局 Design System（先生成 / 全项目复用）

### 正式品牌色板（唯一合法色值 · 禁止增删）

| 角色 | 色值 | 色名 | 用途（严格） |
|---|---|---|---|
| 品牌色 | `#aa6459` | 干枯玫瑰 | 主 CTA 填充、选中态、关键强调、进度条/环、Tab 激活、品牌点缀 |
| 辅色1 | `#68403e` | 玫瑰色系1 | 最深玫瑰辅色；黄体期阶段；破坏性/严肃操作描边或文字（禁止纯红） |
| 辅色2 | `#824d48` | 玫瑰色系2 | 中深玫瑰辅色；排卵期阶段；次强调描边/图标 |
| 辅色3 | `#ba7872` | 玫瑰色系3 | 最浅玫瑰辅色；卵泡期阶段；浅强调底、未强选中描边、弱标签 |
| 强调 | `#49352e` | 可可棕 | 强调色；与深色文字同值；标题/重要数字/深描边 |
| 背景 | `#f3efe8` | 燕麦白 | 页面底、卡片/表面底（色板无独立 surface，统一用燕麦白） |
| 深色文字 | `#49352e` | 可可棕 | 主文案（与「强调」同色值） |
| 次级文字 | `#49352e` / `#f3efe8` | 可可棕 / 燕麦白 | 浅底上次级文案用可可棕；深底/深色块上次级文案用燕麦白 |

#### 色值白名单（仅此 6 个 hex）

`#aa6459` · `#68403e` · `#824d48` · `#ba7872` · `#49352e` · `#f3efe8`

#### 语义映射（不得另造色）

| 原暂定语义 | 正式映射 |
|---|---|
| 页面底 / 卡片底 / 弹层底 | 背景 `#f3efe8` 燕麦白 |
| 主文案 / 强调文字 | 深色文字 / 强调 `#49352e` 可可棕 |
| 次级文案（浅底） | `#49352e` 可可棕 |
| 次级文案（深底） | `#f3efe8` 燕麦白 |
| 主 CTA / Accent | 品牌色 `#aa6459` 干枯玫瑰 |
| 浅强调底 / muted | 辅色3 `#ba7872` 玫瑰色系3 |
| 描边 / 次按钮描边 | 辅色2 `#824d48` 或 辅色3 `#ba7872` |
| 破坏性（非报警红） | 辅色1 `#68403e` 玫瑰色系1 |
| 月经期 | 品牌色 `#aa6459` 干枯玫瑰 |
| 卵泡期 | 辅色3 `#ba7872` 玫瑰色系3 |
| 排卵期 | 辅色2 `#824d48` 玫瑰色系2 |
| 黄体期 | 辅色1 `#68403e` 玫瑰色系1 |
| 成功 / 警告 / 信息 | **无独立色**；成功用品牌色 `#aa6459`；提示/警告用辅色2 `#824d48`；禁止绿、琥珀、纯红 |

```text
Design a complete mobile UI design system for "Clean Circle", a cycle-aware women’s wellness & movement app.

Design philosophy: Instagram-minimal "breathing space". Generous whitespace, calm vertical rhythm, light and warm atmosphere. Premium but soft — not clinical, not loud fitness, not cute cartoon.

Audience: modern women 22–40 seeking minimal luxury and self-care.

Visual language:
- Serif display for emotional titles (e.g. Canela / Freight / elegant modern serif)
- Clean sans-serif for UI and body (e.g. SF Pro / Inter / Plus Jakarta Sans)
- Large corner radius cards (20–28px)
- Soft moon-phase motifs as secondary graphics (outline or soft fill, never busy)
- Gentle data visualization: thin rings, cycle calendar cells colored ONLY with brand rose scale, subtle progress bars
- Airy layout: 20–24px screen padding, 12–16px card gaps, low visual density
- Thin 1px hairline borders, soft shadows only (blur 20–30, opacity ≤8%; shadow tint must stay within brand browns/roses, no blue-gray)
- Icon style: outline, 1.5–2px stroke, rounded caps

OFFICIAL brand color palette ONLY — do not invent or use any other hex:
- Brand / primary CTA: Dried Rose 干枯玫瑰 #aa6459
- Aux rose 1 (deepest): #68403e
- Aux rose 2: #824d48
- Aux rose 3 (lightest rose): #ba7872
- Emphasis / dark text: Cocoa Brown 可可棕 #49352e
- Background / page / card surface: Oat White 燕麦白 #f3efe8
- Secondary text: #49352e on light surfaces; #f3efe8 on dark rose/brown fills

Cycle phase colors (strict mapping, no sage/violet/sand outside palette):
- Menstrual 月经期: #aa6459
- Follicular 卵泡期: #ba7872
- Ovulatory 排卵期: #824d48
- Luteal 黄体期: #68403e

Success accents use brand #aa6459; warnings use #824d48; destructive uses #68403e. Never pure red, never green, never amber outside palette, never pure white #FFFFFF, never pure black, never cool gray.

Components: primary pill button filled #aa6459 with label #f3efe8; secondary ghost/outline using #824d48 or #ba7872 stroke and #49352e label; bottom sheets 28px top radius on #f3efe8; segmented chips; soft list rows; floating tab bar with 5 tabs — active #aa6459, inactive #49352e or #68403e.

Device: iPhone 15 Pro, light mode only for MVP, Chinese UI copy, status bar included.
Style references: modern wellness apps + Instagram aesthetic editorial layouts + Airbnb-level whitespace. High-fidelity product UI, not wireframe.
STRICT: every screen must use only the six hex values listed above.
```

### 正式 Design Tokens 对照表

| Token | 色值 | 色名 | 用途 |
|---|---|---|---|
| brand | `#aa6459` | 干枯玫瑰 | 主 CTA / 品牌强调 / 月经期 / 成功点缀 |
| aux-1 | `#68403e` | 玫瑰色系1 | 黄体期 / 破坏性 / 最深辅色 |
| aux-2 | `#824d48` | 玫瑰色系2 | 排卵期 / 次强调 / 警告语义 |
| aux-3 | `#ba7872` | 玫瑰色系3 | 卵泡期 / 浅强调底 / 弱标签 |
| emphasis | `#49352e` | 可可棕 | 强调色（与深色文字同值） |
| bg / surface | `#f3efe8` | 燕麦白 | 页面底与卡片底 |
| text-primary | `#49352e` | 可可棕 | 主文案 |
| text-secondary | `#49352e` 或 `#f3efe8` | 可可棕 / 燕麦白 | 浅底 / 深底次级文案 |
| phase-menstrual | `#aa6459` | 干枯玫瑰 | 月经期 |
| phase-follicular | `#ba7872` | 玫瑰色系3 | 卵泡期 |
| phase-ovulatory | `#824d48` | 玫瑰色系2 | 排卵期 |
| phase-luteal | `#68403e` | 玫瑰色系1 | 黄体期 |

---

## 推荐生成顺序

| 优先级 | 屏幕 | 原因 |
|---|---|---|
| P0-1 | 0 全局 Design System | 锁定视觉语言 |
| P0-2 | S09 今日 + 2–3 变体 | 产品核心首页 |
| P0-3 | S03 欢迎 · S08 课表 · S13 海报 | 品牌情绪高点 |
| P0-4 | S01–S06 onboarding 链 | 转化入口 |
| P0-5 | S10–S12 训练闭环 | 完课体验 |
| P0-6 | S19–S21 弹层 | 差异化能力 |
| P0-7 | S22–S24 订阅 | 商业化 |
| P0-8 | S25–S28 Tab | 日常 |
| P1 | S14–S17 迁移 · S29–S31 | 完善 |

---

## 与线框一致的关键文案约束

- 欢迎页主 CTA：**「我会开始按照周期照顾自己」**
- 生成路径：**直接生成课表**，不做长报告（S07 已移除）
- 课表：**今日起滚动 30 天**，日历按四阶段着色
- Check-in 四维：**能量 / 情绪 / 睡眠 / 身体不适**
- 今日页含 **Ritual** 与 **月亮** 周期表达
- 付费墙 **可关闭**，买断课不可被墙死
- Tab：**今日 · 课程库 · 日历 · 社区 · 我的**
- 编号空缺：无 **S07**、无 **S18**（设计时勿补造这两屏，除非产品重新定义）

---

# 模块 A · 新用户主链路

> Flow A · S01–S06, S08–S13  
> 叙事：登录（协议勾选，全文按需查阅） → 欢迎 → 问卷 → 确认 → 生成课表 → 本月总览 → 今日 → 详情 → 播放 → 反馈 → 打卡海报

### A-00 模块叙事（可选，生成关键屏前用）

```text
Clean Circle onboarding flow screens in Instagram-minimal style: login (optional legal document links) → welcome → multi-step quiz → confirm → generating schedule → monthly cycle calendar → Today home. Consistent serif+sans mix, moon motifs, rounded cards, breathing whitespace, Oat White background #f3efe8, CTA brand Dried Rose #aa6459. Palette-only six hex. Chinese UI.
```

---

## S01 · 启动与登录

**线框要点：** Logo、Slogan、微信一键登录主 CTA、手机号/验证码、Apple 登录、协议默认未勾选。

### 主态 · 默认

```text
iPhone 15 Pro UI screen for Clean Circle app login.

Style: Instagram-minimal wellness, generous top whitespace, Oat White background #f3efe8.

Layout top → bottom:
1. Status bar
2. Large soft moon/cycle brand mark or wordmark "Clean Circle" centered in upper third (elegant, not loud)
3. Serif Chinese tagline: 「更懂你的周期运动伙伴」
4. Primary CTA pill: 「微信一键登录」 (filled brand Dried Rose #aa6459)
5. Thin divider with tiny sans text 「或」
6. Two minimal fields: 手机号 / 验证码 (underline or soft rounded input, secondary style)
7. Secondary outline button: 「手机号登录」
8. Tertiary text button: 「Apple 登录（仅 iOS）」
9. Bottom checkbox (unchecked by default): 「已阅读并同意」 plus three independent tiny legal links: 《用户协议》 / 《隐私政策》 / 《健康数据处理说明》. Tapping a name opens S02 full-text reader (optional, not a login gate). Checking the box is still required to login.

No clutter, no social proof carousels. Soft shadow on primary only. Chinese UI, high-fidelity mockup.
```

### 变体 · 验证码错误

```text
Same Clean Circle login layout as default. Phone prefilled 138****0000. Verification code field in gentle error state with helper text 「验证码错误或已过期，请重新获取」. Soft toast at bottom: 「验证码错误或已过期」. Primary becomes 「重新登录」. Instagram-minimal, no pure red; use palette only.
```

### 变体 · 未勾选协议

```text
Clean Circle login screen, agreement checkbox still unchecked and slightly highlighted. Soft toast: 「请先阅读并勾选协议」. Primary login button visually active but blocked by toast. Calm, non-aggressive compliance UX.
```

---

## S02 · 协议全文查看（非必须）

**线框要点：** 从登录页三项协议名称独立进入对应全文；顶部返回 + 标题 + 可滚动正文；底部「返回登录页」。无「同意并继续」，不阻断登录。

```text
iPhone legal document reader for Clean Circle, opened independently from a login-page link (not a mandatory onboarding gate).

Top nav: back chevron + title 《用户协议》 (variants: 《隐私政策》 / 《健康数据处理说明》)
Subtitle tiny sans: 独立查阅 · 非登录必经步骤
Scrollable long-form body in readable sans, generous line-height, section cards:
- 用户协议: 服务范围 / 账号与使用规范 / 免责声明
- 隐私政策: 收集信息 / 使用目的 / 共享与披露 / 用户权利
- 健康数据处理说明: 收集目的 / 范围 / 存储时间 / 删除方式 / 第三方共享
Helper caption: 阅读本页不会自动勾选登录页协议
Sticky bottom outline button: 「返回登录页」 → S01
Not a dark wall of text — section headers medium weight. Calm compliance UI, Instagram-minimal Chinese. No primary "同意并继续".
```

---

## S03 · 专属欢迎页

**线框要点：** 品牌插画、Hi 昵称、双语文案、主 CTA「我会开始按照周期照顾自己」。

```text
Emotional welcome screen for Clean Circle after login (agreements were checked on the login page; S02 full-text is optional).

Hero: soft abstract moon-phase illustration (4 phases as delicate arcs) in upper half, lots of breathing space.
Serif headline: 「Hi 小圆，」 (personalized nickname)
Body (serif or soft sans, large leading):
「每个月，有些日子可以冲，也总有些日子需要温柔照顾」
English brand line in light italic sans: 「Wellness with your cycle in mind」
Bottom primary pill CTA: 「我会开始按照周期照顾自己」

Editorial Instagram aesthetic, almost magazine-like. Minimal UI chrome. Chinese primary language.
```

---

## S04 · 问卷逐题页

**线框要点：** 进度条、多题型模板；含单选/日期/跳题/设备末题。

### S04a · 单选题（核心目标）

```text
Clean Circle quiz single-choice screen.

Top: thin elegant progress bar + sans label 「第 3 / 12 题」
Serif question title large: 「你的核心目标是什么？」
Options as tall rounded cards (not clinical radio lists): 减脂 / 塑形 / 增肌 / 调理身体 / 改善心情 — unselected border aux-3 #ba7872, selected fill or ring brand Dried Rose #aa6459
Bottom sticky bar: secondary 「← 返回上题」 + primary 「下一题」

Breathing space between options, Instagram-minimal. Chinese UI.
```

### S04b · 日期题（上次经期）

```text
Quiz date picker screen for Clean Circle.
Progress 「第 5 / 12 题」
Serif title: 「上次经期第一天是哪天？」
Center: soft iOS-style wheel date picker inside large rounded card (2026 / 01 / 15)
Secondary text button: 「我不记得了 / 周期不规律」
Primary: 「下一题」
Gentle wellness aesthetic, not medical form. Oat White #f3efe8, accent brand Dried Rose #aa6459.
```

### S04c · 跳题提示（周期不规律）

```text
Clean Circle quiz after user selects 「不规律」.
Progress 「第 5 / 12 题」
Title: 「你的周期规律吗？」 with option 不规律 selected
Soft info card: 已选择「不规律」：将跳过精确日期题，课表中的周期预测将标注「估算」
Primary 「继续」
Calm explanatory tone, Instagram-minimal.
```

### S04d · 设备题（最后一题）

```text
Final quiz question screen for Clean Circle.
Progress 「第 12 / 12 题 · 最后一题」
Serif title: 「你有智能穿戴设备吗？」
Options: 没有 / Apple Watch / 小米 / 华为手环 / 其他设备
Helper card: 选择设备后可链接设备（系统健康授权），用于同步睡眠 / 心率，优化每日建议
Secondary: 「跳过，暂不链接」
Primary: 「完成评测」
Optional-feeling, no pressure. Minimal wellness UI.
```

---

## S05 · 问卷提交确认

**线框要点：** 数据用途摘要；确认生成课表（不再生成长报告）。

```text
Confirmation screen before generating personalized plan for Clean Circle.

Serif title: 「确认生成你的专属运动课表？」
Rounded card on Oat White #f3efe8 「数据用途摘要」 with soft bullets (text #49352e):
- 计算周期阶段
- 生成今日起 30 天运动课表
- 匹配每日建议
Footer note: 数据仅用于上述用途，可随时在隐私设置中删除
Primary: 「确认生成我的课表」
Secondary: 「返回修改答案」

Trust-forward, airy layout. No long medical report language. Instagram-minimal.
```

---

## S06 · 课表生成中 / 生成失败

### 主态 · 生成中

```text
Loading screen with brand emotion for Clean Circle: 「正在生成顺应您周期的运动课表」

Center visual: refined illustration of 4 cycle phases (月经期 · 卵泡期 · 排卵期 · 黄体期) as soft moon/circle motif — static frame for UI design
Subtitle: 根据您的周期阶段与作答，从 300+ 课程库中匹配今日起 30 天训练
Subtle indeterminate progress ring brand Dried Rose #aa6459
No cancel button clutter. Pure waiting ritual. Oat White background #f3efe8.
```

### 变体 · 生成失败

```text
Clean Circle failure state for schedule generation.
Soft empty/failure illustration (not alarming).
Title 「课表生成失败」
Body: 网络或服务异常，请重试
Primary 「重试」 / Secondary 「联系客服」
Destructive/serious accents only aux-1 #68403e if needed, never pure red, never off-palette. Instagram-minimal.
```

---

## S08 · 本月课表

**线框要点：** 今日起 30 天滚动；周期阶段着色日历；预览列表；进入今日。

```text
First post-onboarding schedule overview screen for Clean Circle.

Header serif: 「你的本月课表」
Sans caption: 「从今日起滚动 30 天」

Main: calendar/grid visualization colored by cycle phase (ONLY brand rose scale: menstrual #aa6459 / follicular #ba7872 / ovulatory #824d48 / luteal #68403e). Today ringed with Cocoa Brown #49352e outline. Moon legend chips under grid for 月经期 / 卵泡期 / 排卵期 / 黄体期.

Below: 3–4 list rows of upcoming days
- 今天 · 舒缓瑜伽 · 20min · 低强度
- 明天 · 核心激活 · 25min · 中强度
- 后天 · 休息日 · 拉伸建议
- 第 4 天 · 力量入门 · 30min · 中强度（锁定样式）

Primary CTA bottom: 「了解今天的自己」

Instagram-minimal data viz, readable legend, breathing margins. Chinese UI.
```

---

## S09 · 今日首页（核心 · 优先出图）

**线框要点：** 体验条、问候、周期月亮卡、Check-in、推荐运动、太累/来例假了、饮食 Tips、Ritual、5 Tab。

### 主态 · 未 Check-in

```text
Clean Circle "Today" home — the most important screen.

iPhone 15 Pro, Instagram-minimal wellness.

Structure:
1. Soft top trial strip: 「体验第 3 天 / 共 7 天」 (subtle brand Dried Rose #aa6459 tint bar)
2. Greeting row: serif 「早上好，小圆」 + date 「1月17日 周六」 + outline message icon top-right
3. Cycle status card (hero): large moon glyph + 「你处于 黄体期 · 第 6 天」 + secondary 「预计 8 天后开始经期」. Luteal wash using aux-1 #68403e only
4. Check-in card (empty state, tappable): 「Check-in 今天的身体状态」 sub 能量 / 情绪 / 睡眠 / 身体不适 · 未完成
5. Soft emotional copy line: 「今天你可能感到疲惫，请允许自己慢下来」
6. Workout recommendation card with thumbnail: 舒缓瑜伽 · 20min · 低强度 · 约 90 kcal · 全身放松
7. Primary CTA 「开始训练」
8. Secondary outline 「今天太累，运动降级」
9. Text chip link 「来例假了」
10. Card 「今日饮食营养建议」 short stage-based copy
11. Ritual card row: 经期暖饮 · 淋巴按摩 · 自我肯定冥想
12. Bottom tab bar 5 items: 今日(active) / 课程库 / 日历 / 社区 / 我的

Low density, elegant serif+sans, rounded 24px cards on #f3efe8, soft shadows, moon motif only as accent. Colors STRICT: brand #aa6459, text #49352e, bg #f3efe8, aux roses only. Chinese UI high-fidelity.
```

### 变体 · 已 Check-in

```text
Same Clean Circle Today home as default, but Check-in card shows completed state: 「Check-in 已完成 ✓ 能量中 · 情绪平稳 · 睡眠一般 · 轻微腹胀」 and 「今日课程已按状态确认」. Hide or de-emphasize 「今天太累」 primary push. Keep workout card + Ritual + tab bar. Instagram-minimal.
```

### 变体 · 已降级

```text
Clean Circle Today home evening greeting 「晚上好，小圆」.
Cycle card 黄体期 · 第 6 天.
Check-in completed with 能量低 · 情绪不佳.
Workout card labeled 今日课表（已降级）：放松拉伸 10min · 低强度；sub shows 原课程：核心激活 25min（留痕）.
Secondary button 「撤销降级，恢复原课程」.
Tab bar 今日 active. Soft, calm, not alarming.
```

### 变体 · 体验临期

```text
Clean Circle Today home with trial strip 「体验第 7 天 / 共 7 天 · 明日到期」 plus lightweight closable subscribe entry.
Greeting 早上好, cycle 月经期 · 第 1 天, soft copy 经期第 1 天，请温柔对待自己.
Workout: 经期舒缓 · 15min · 低强度.
Minimal, non-pushy conversion.
```

### 变体 · 订阅锁定

```text
Clean Circle Today locked state after trial expired.
Top bar: 「体验已到期 · 定制内容已锁定 [立即续订]」
Greeting + historical cycle status visible.
Workout card locked style 「定制课程已锁定」
Helper card: 打卡记录 / 已购课程仍可查看
No hard dark pattern blocking bought content. Instagram-minimal.
```

### 变体 · 排课兜底

```text
Clean Circle Today fallback schedule state.
Cycle card normal.
Recommendation card: 「今日为你安排：安全兜底课 · 全身放松 15min」 with subtle badge 兜底, helper 异常已上报 · 绝不留空白.
Primary 「开始兜底课」.
Reassuring tone, soft visuals.
```

---

## S10 · 课程详情

**线框要点：** 封面、元信息、适用/不适用、推荐理由、开始跟练/投屏/加入日历。

```text
Workout detail screen for Clean Circle.

Hero image top (calm yoga / movement, soft natural light, warm tones compatible with Dried Rose / Cocoa Brown palette) with large bottom radius
Title serif: 「舒缓瑜伽 · 黄体期放松」
Meta chips: 20min · 低难度 · 低强度 · 约 90 kcal · 全身 · 教练 Jo
Tags: 适用 黄体期/疲劳恢复 · 不适用 急性腰伤 (soft pills)
Reason card: 「为你推荐的理由」 body 今日黄体期第 6 天 + 你 Check-in 能量中 → 推荐低强度恢复训练
Primary 「开始跟练」 / Secondary 「投屏」 / Tertiary text 「加入日历」
Lots of whitespace, premium editorial feel. Chinese UI.
```

---

## S11 · 视频播放与投屏

### 主态 · 播放中

```text
In-workout video player UI for Clean Circle, minimal chrome.
Video area upper 50%, soft dark overlay controls when active
Progress 「08:32 / 20:00」 thin bar brand Dried Rose #aa6459
Control row: play · ±10s · volume · quality · fullscreen · cast
Subtle helper: 播放进度 ≥80% 自动判定完课，也可手动「我已完成」
Bottom primary text button 「我已完成」
Clean, not YouTube-cluttered. Instagram-minimal wellness.
```

### 变体 · 投屏设备搜索

```text
Clean Circle cast sheet over mini player.
Title 「正在搜索设备…」 AirPlay / DLNA
List rows: 客厅电视（DLNA） / 卧室投影仪（AirPlay）
Link 「连接失败？查看投屏帮助」
Soft bottom sheet 28px radius, dimmed background.
```

### 变体 · 投屏遥控页

```text
Clean Circle cast remote control screen.
Header 「正在投屏：客厅电视」
Large remote card: pause/play, seekable progress 12:05 / 20:00
Danger outline 「断开投屏」
Primary 「我已完成」
Phone-as-remote aesthetic, minimal.
```

---

## S12 · 完课反馈

**线框要点：** 强度/身体/心情三组；完成打卡或跳过。

```text
Post-workout feedback screen for Clean Circle: 「完成啦！感觉怎么样？」
Subtitle: 反馈用于优化后续排课
Three soft question groups as segmented pills:
- 实际强度：太轻松 / 刚好 / 有点累
- 身体感受：舒适 / 一般 / 不适
- 心情：愉悦 / 平静 / 低落
Primary 「完成打卡」 / Secondary 「跳过反馈直接打卡」
Celebratory but quiet — no confetti explosion. Oat White #f3efe8, CTA brand Dried Rose #aa6459.
```

---

## S13 · 打卡成功海报 + 能量值

**线框要点：** Day N 海报、+20 能量、连胜、保存长图、返回今日。

```text
Check-in success share moment for Clean Circle.
Large vertical share card (poster) center: Day 3 · 课程名 · 连胜 3 天 · soft moon + brand mark · serif quiet quote
Below: energy toast-like pill 「+20 能量值 已到账」
Caption: 连续打卡 3 天 · 历史最高 7 天
Secondary 「保存长图」 / Primary 「返回今日」
Instagram-story ready aesthetic, poster tints only from brand palette hex values, UI chrome still minimal.
```

---

# 模块 B · 老用户迁移

> Flow B · S14–S17  
> 叙事：匹配资产 → 确认 → 结果 → 我的资产 / 引导评测

---

## S14 · 匹配到原小程序资产

```text
Asset discovery screen after phone match for Clean Circle.
Soft illustration (archive / moon gift motif) top
Serif: 「找到了你的历史资产！」
Sub: 手机号 138****0000 匹配到原小程序账号
Summary card: 历史打卡 86 天 · 能量值 1,280 · 已购课程 3 门 (three mini stats in one card)
Primary 「查看并迁移」 / Secondary 「不是我的账号」
Warm welcome-back tone, trustworthy. Instagram-minimal Chinese UI.
```

---

## S15 · 迁移确认

```text
Confirm migration checklist for Clean Circle.
Title 「确认迁移以下资产？」
Three clean list rows with icons: 历史打卡记录 · 86 天 / 能量值余额 · 1,280 / 已购课程 · 3 门（永久可见）
Rules info card (surface Oat White #f3efe8 with aux-3 #ba7872 hairline if needed): 迁移仅为数据复制与账号绑定，不赠送定制服务权益；买断课程永久可见；迁移记录可追溯
Primary 「确认迁移」 / Secondary 「再想想」
Serious but calm; not a scary legal wall of text.
```

---

## S16 · 迁移结果

### 主态 · 成功

```text
Clean Circle migration success screen.
Soft success illustration + serif 「迁移成功！」
Checklist: ✓ 历史打卡 · 86 天已入账 / ✓ 能量值 · +1,280 已到账 / ✓ 已购课程 · 3 门已绑定
Tiny mono caption: 迁移批次号 MIG-20260115-0042 · 可在「我的-迁移记录」查询
Primary 「查看我的资产」
Warm, reassuring Instagram-minimal UI.
```

### 变体 · 部分成功

```text
Clean Circle partial migration result.
Title 「部分资产迁移成功」
Mixed list: two checkmarks success, one ✗ 已购课程 · 1 门迁移失败
Secondary 「单独重试失败项」
Primary 「先进入应用」
Batch number tiny footer. Calm problem-solving tone.
```

### 变体 · 失败

```text
Clean Circle migration failed.
Soft failure illustration.
Title 「迁移失败」
Body: 数据校验异常，你的原账号资产不受影响
Primary 「重试迁移」 / Secondary 「联系客服」
No pure red; destructive only aux-1 #68403e if needed.
```

---

## S17 · 已购课程与历史资产

```text
"My assets" for migrated users in Clean Circle.
Header 「我的资产」
Two stat cards: 能量值余额 1,280 (tappable) · 历史打卡 86 天
Section 「已购课程（买断 · 永久可见）」 three course rows: 21 天塑形营 / 经期舒缓系列 / 核心力量进阶
Soft lock notice card: 定制课表与日建议需订阅后解锁
Primary 「完成评测，解锁定制服务」 / Secondary 「了解订阅权益」
Balance of pride in ownership + gentle conversion. Instagram-minimal.
```

---

# 模块 C · 每日动态调整

> Flow C · S19–S21（多为底部弹层 / 确认层）

---

## S19 · 每日 Check-in（底部弹层）

### 主态 · 填写中

```text
Bottom sheet over dimmed Today page for Clean Circle.
Handle bar, title 「今日 Check-in」 subtitle 「今天的身体状态」
Four question rows with soft pill selectors (single choice each):
- 能量：低 / 中 / 高
- 情绪：不佳 / 一般 / 平稳 / 愉快
- 睡眠：差 / 一般 / 好
- 身体不适：无 / 轻微腹胀 / 明显不适
Large primary 「提交」
Rounded top 28px sheet, Instagram-style bottomsheet, Chinese UI.
```

### 变体 · 提交后降级建议

```text
Clean Circle Check-in result bottom sheet after low energy submission.
Header 「今日 Check-in 已提交 ✓」 sub 能量低 · 心情不佳 · 睡眠差
Suggestion card: 「建议为你降级今日课程」 reason 今日能量低+睡眠差
Compare rows: 原课程 核心激活 · 25min · 中强度 vs 新课程 放松拉伸 · 10min · 低强度
Primary 「确认更换」 / Secondary 「保持原课程」
Soft, user-in-control tone.
```

---

## S20 · 「今天太累」降级确认

```text
Clean Circle confirm card/sheet over dimmed Today:
Title 「将今日课程替换为低强度版？」
Note: 不改变周期阶段，仅当日有效
Before/after course rows: 核心激活 25min → 舒缓拉伸 10min
Primary 「确认替换」 / Secondary 「取消」
Optional helper for post-action toast design note: 已为你降级 · [撤销]
Instagram-minimal bottomsheet.
```

---

## S21 · 「来例假了」二次确认与重排

### 主态 · 确认前

```text
Clean Circle sensitive confirm sheet:
Title 「今天是经期首日吗？」
Subtitle 二次确认（破坏性操作）
Body: 确认后将立即重算当前周期阶段，并重排今日起的未来课表；已完成的历史记录不受影响
Primary 「确认，是经期首日」 / Secondary 「取消」
Gentle, serious, trustworthy. No medical scare language.
```

### 变体 · 重排完成（可撤销）

```text
Clean Circle reschedule complete sheet.
Title 「已为你重排今日起的课表」
Badge: 当前阶段 月经期 · 第 1 天
List: 今日新课表 经期舒缓 · 15min · 低强度
Secondary 「撤销（按原预测重算）」
Primary 「返回今日」
Menstrual accent brand #aa6459 only, calm success.
```

---

# 模块 D · 订阅转化

> Flow D · S22–S24

---

## S22 · 订阅付费墙

### 主态 · 新用户

```text
Paywall screen for Clean Circle, closable (X top-left) — never dark-pattern full lock of buyouts.

Serif title: 「体验已结束，解锁完整定制服务」
Value recap card: 黄体期第 6 天 · 已生成专属课表 · 已完成 5 天训练
Benefit checklist (minimal checkmarks): 每日定制课程与动态调整 / 周期阶段建议与饮食 Tips / 课表随周期实时重排
Plan cards: selected monthly 「99 元/月」 ring brand #aa6459 + 自动续费，可随时取消; quarterly/annual placeholder 「待确认」 de-emphasized with aux-3 #ba7872 text/stroke only (no cool gray, no off-palette)
Primary CTA 「立即订阅 99 元/月」
Legal footer tiny: 自动续费说明 · 取消方式 · 《订阅协议》 · 恢复购买

Premium editorial paywall, not flashy sales. Breathing space. Instagram-minimal.
```

### 变体 · 老用户（老友权益）

```text
Clean Circle returning-user paywall.
X close top-left.
Serif 「老朋友，欢迎回来」
Promo card 「老朋友专属：首月 5 折」
Asset retained card: 打卡 86 天 · 能量值 1,280 · 买断课 3 门
Selected plan: 首月 49.5 元，次月起 99 元/月
Primary 「以老友价订阅」
Legal footer 自动续费说明 · 订阅协议 · 恢复购买
Warm, respectful, not spammy.
```

---

## S23 · 支付结果

### 成功

```text
Clean Circle payment success.
Soft success illustration.
Title 「订阅成功！」
Body: 定制服务已开通 · 有效期至 2026-02-22
Primary 「返回今日继续训练」 / Secondary 「管理订阅」
Airy, calm celebration.
```

### 失败

```text
Clean Circle payment failed/cancelled.
Soft failure illustration.
Title 「支付未完成」
Body: 支付被取消或扣款失败，未产生扣费
Primary 「重试支付」 / Secondary 「联系客服」
```

### 结果未知

```text
Clean Circle payment pending confirmation.
Soft waiting illustration.
Title 「支付结果确认中…」
Body: 已付款未到账？支付结果以服务端确认为准
Primary 「恢复购买」 / Secondary 「联系客服」
```

---

## S24 · 订阅管理

### 主态 · 生效中

```text
Subscription management for Clean Circle.
Header 「订阅管理」
Card: 当前套餐：99 元/月 · 自动续费中 · 下次扣费 2026-02-22
Benefits card: 每日定制课程 · 周期建议 · 课表动态调整
Secondary 「恢复购买」
Destructive outline 「取消订阅」
Helper text: 取消后有效期至本周期末，到期后锁定定制内容
Transparent, Apple-guideline friendly, Instagram-minimal.
```

### 变体 · 已取消

```text
Clean Circle subscription cancelled state.
Card: 已取消自动续费 · 有效期至 2026-02-22，到期后锁定定制内容
Primary 「重新订阅」 / Secondary 「恢复购买」
```

---

# 模块 E · Tab 页（日常）

> Flow E · S25–S28

---

## S25 · 日历月视图 + 单日课程

```text
Calendar tab for Clean Circle: monthly cycle + workout status.

Header 「日历 · 2026 年 1 月」
Month grid with dual encoding:
- Phase background colors STRICT: 月经期 #aa6459 / 卵泡期 #ba7872 / 排卵期 #824d48 / 黄体期 #68403e
- Status marks: ✓ complete, ◐ partial, ● today, ■ future task, □ rest
Legend chips under grid
Streak card: 连续打卡 3 天 · 本月累计 220 分钟
Day detail panel: 「1月17日（今日）课程」
  - 定制课 row with AI badge + [开始]: 舒缓瑜伽 20min
  - 自选加练 row with different badge + delete: 手臂塑形 10min
Secondary 「+ 加练」
Bottom tab bar 日历 active

Beautiful soft data viz, not dense spreadsheet. Chinese UI high-fidelity.
```

---

## S26 · 我的首页

### 主态 · 体验中

```text
Profile home 「我的」 for Clean Circle trial user.
Header with settings gear top-right.
Top profile card: avatar circle, nickname, 「体验第 3 天 / 共 7 天」, tappable to membership
Tools section 2x2 icon grid: 我的课程 / 打卡记录 / 能量值兑换 / 周期资料
List more services: 邀请好友 / 帮助中心·客服 / 迁移记录 / 设置·隐私·注销
Tab bar 我的 active
Clean settings-style Instagram aesthetic, Oat White #f3efe8.
```

### 变体 · 订阅中

```text
Same Clean Circle profile home, subscribed state.
Profile card: 会员有效期至 2026-06-20, tappable manage subscription
Energy card: 能量值 1,300 · 可兑换好礼
List includes 历史最高连胜 7 天 and 设置（含 Push 类型开关）
```

### 变体 · 已失效

```text
Clean Circle profile expired state.
Profile card: 订阅已失效 [续订], note 定制内容已锁定
Tools still show 我的课程（永久可见） / 打卡记录 / 能量值 / 周期资料
Calm re-subscribe path, no shame language.
```

---

## S27 · 能量值明细与兑换

```text
Energy points ledger for Clean Circle.
Header 「能量值」
Big balance number serif 「1,300」
Exchange zone card: 能量值兑换专区 · 兑换优惠券 / 品牌周边
Transaction list rows with +amount, type, related item, time, running balance examples:
- +20 完课奖励 · 舒缓瑜伽
- +50 连续 7 天打卡
- +10 加练
- +1,280 老用户迁移入账
Muted footnote: 数值为占位，待运营确认 · 主课 +20 / 加练 +10 / 连 7 天 +50
Airy finance-lite UI, not cold banking.
```

---

## S28 · 周期资料修改

```text
Form screen 「周期资料」 for Clean Circle.
Soft fields:
- 上次经期首日：2026-01-01
- 平均周期长度：28 天
- 经期长度：5 天
- 规律性：规律
Warning info card: 保存后将重新生成报告与未来课表，已完成的历史记录保留
Primary 「保存」
Danger-text button 「申请删除我的健康数据」
Privacy-respecting form UI, Instagram-minimal wellness.
```

---

# 模块 F · P1 探索

> Flow F · S29–S31

---

## S29 · 课程库

```text
Explore / course library for Clean Circle, premium but quieter than loud fitness apps.

Header 「课程库」 + search & notification icons
Top capability chips: 目录 · 收藏 · 播放列表 · 笔记 · 下载 · 观看历史
Search field 「搜索课程」
Filter chips: 时长 · 难度 · 强度 · 器械 · 场景
Live banner card soft: Live Workout with Jo
Horizontal carousel 「UPCOMING CHALLENGE」: 30 min Walk And Weights · 生日主题 Shred 挑战
Section 「START HERE 新手专区」 for the new homies · horizontal cards
Vertical course list: 全身燃脂 20min 中强度 / 睡前拉伸 10min 低强度
Tab 课程库 active
Editorial wellness explore feed, not cluttered marketplace. Chinese UI.
```

---

## S30 · 视频加入日历弹层

```text
Bottom sheet for Clean Circle:
Title 将「手臂塑形 10min」加入日历
Mini calendar pick future 28 days (past dates disabled)
Primary 「确认加入 1 月 20 日」
Helper: 自选课程不计入打卡连胜，仅计时长与能量值
Dimmed background, 28px top radius sheet, Instagram-minimal.
```

---

## S31 · 社区 Homies（官方内容占位）

```text
Community tab simplified to official content for Clean Circle MVP.
Header 「社区 Homies」
Soft banner: 社区完整能力评估中，当前展示官方内容
Feed cards magazine-like spacing:
- Jo 姐 · 官方 · 经期训练 3 个常见误区 + soft photo
- Jo 姐 · 官方 · 黄体期为什么总想吃东西？ + soft photo
No noisy UGC composer chrome for MVP
Tab 社区 active
Calm editorial feed, Instagram-minimal.
```

---

# 组件 / 系统级补充提示词

## 底部 Tab Bar

```text
Design only a 5-tab iOS tab bar for Clean Circle: 今日 / 课程库 / 日历 / 社区 / 我的.
Outline icons, active state brand Dried Rose #aa6459 + medium weight label, inactive Cocoa Brown #49352e or aux-1 #68403e.
Floating on Oat White #f3efe8 with top hairline aux-3 #ba7872. Instagram-minimal wellness. Palette-only. Export as component sheet.
```

## 周期阶段色例与月相组件

```text
UI component sheet for Clean Circle: moon phase badge set + 4 cycle phase color chips STRICT (月经期 #aa6459 / 卵泡期 #ba7872 / 排卵期 #824d48 / 黄体期 #68403e) + sample calendar cell states (complete / partial / today / rest / locked). Style: fills only from brand palette, thin strokes, serif labels for phase names, sans for metrics.
```

## 空态 / Toast / 二次确认

```text
Component set for Clean Circle: toast (success energy +20), destructive confirm dialog (经期首日), empty state illustration style (thin line moon + soft wash). Match Instagram-minimal system, Oat White #f3efe8, accent brand Dried Rose #aa6459, never pure red or off-palette colors.
```

## 按钮与表单规范条

```text
Clean Circle mobile component kit strip: primary pill CTA, secondary outline, tertiary text, destructive outline, soft input fields, checkbox legal row, progress bar thin, chip/segment control, list row with chevron. Serif only on display samples; UI chrome sans-serif. Large radius, hairline borders, soft shadows ≤8% opacity.
```

---

# 附录

## A. 屏幕索引

| ID | 名称 | 模块 | 优先级 |
|---|---|---|---|
| S01 | 启动与登录 | A 新用户 | P0 |
| S02 | 协议全文查看（非必须） | A | P0 |
| S03 | 专属欢迎页 | A | P0 |
| S04 | 问卷逐题页 | A | P0 |
| S05 | 问卷提交确认 | A | P0 |
| S06 | 课表生成中 / 失败 | A | P0 |
| S08 | 本月课表 | A | P0 |
| S09 | 今日首页 | A | P0 |
| S10 | 课程详情 | A | P0 |
| S11 | 视频播放与投屏 | A | P0 |
| S12 | 完课反馈 | A | P0 |
| S13 | 打卡成功海报 + 能量值 | A | P0 |
| S14 | 匹配到原小程序资产 | B 迁移 | P0 |
| S15 | 迁移确认 | B | P0 |
| S16 | 迁移结果 | B | P0 |
| S17 | 已购课程与历史资产 | B | P0 |
| S19 | 每日 Check-in | C 每日 | P0 |
| S20 | 今天太累 | C | P0 |
| S21 | 来例假了 | C | P0 |
| S22 | 订阅付费墙 | D 订阅 | P0 |
| S23 | 支付结果 | D | P0 |
| S24 | 订阅管理 | D | P0 |
| S25 | 日历 | E Tab | P0 |
| S26 | 我的 | E | P0 |
| S27 | 能量值明细与兑换 | E | P0 |
| S28 | 周期资料修改 | E | P0 |
| S29 | 课程库 | F P1 | P1 |
| S30 | 视频加入日历弹层 | F | P1 |
| S31 | 社区 Homies | F | P1 |

## B. 与线框数据文件对照

| 模块 | 数据源 |
|---|---|
| A | `src/data/mobile/screens-a.ts` |
| B / C | `src/data/mobile/screens-b.ts` |
| D / E / F | `src/data/mobile/screens-c.ts` |
| 类型与 Flow 名 | `src/data/mobile/types.ts` |
| 逻辑补全决策 | `src/data/mobile/decisions.ts` |

## C. 后续待替换

- [x] 已用正式品牌色板替换 Design Tokens（干枯玫瑰/玫瑰辅色/可可棕/燕麦白）
- [ ] 重跑「0. 全局 Design System」并同步到 Stitch 项目（必须带正式色板）
- [ ] 品牌 Logo / 插画资产到位后，在 S01 / S03 / S06 / S13 提示词中改为「use brand asset」
- [ ] （可选）补写管理后台 B01–B27 桌面端 Stitch 提示词

---

*文档版本：v1 · 方案一 ins 极简风 · 对齐当前移动端线框原型*
