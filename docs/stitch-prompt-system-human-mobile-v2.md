# Clean Circle 移动端「去 AI 味」提示词工程 v2

> 适用：GPT / Stitch / 其他 UI 生成模型  
> 目标：让 AI 执行已经确定的产品与设计决策，而不是自由拼贴“女性健康 App”模板。  
> 范围：移动端 S01–S31（沿用现有编号，不补造 S07 / S18）。

---

## 0. 先说结论

现有提示词的问题不是信息不足，而是**审美形容词太多、可验证的设计决策太少**。

两份提示词中高频出现 `soft`、`card`、`Instagram-minimal`、`serif`、`moon`。模型会稳定生成一套“燕麦色背景 + 玫瑰色按钮 + 大圆角卡片 + 月相装饰 + 治愈文案”的通用 wellness 模板。它看起来完整，却缺少只有 Clean Circle 才会有的结构、内容与行为。

v2 的处理方式：

1. 不再用 `ins 极简风` 作为主设计概念，改为**「Jo 教练的周期训练手册」**。
2. GPT 只负责把产品事实编译成结构化执行提示，不负责自由选风格。
3. 先锁 3 张锚点屏和组件，再扩展状态；禁止逐屏从零生成。
4. 每屏设置“组件预算”和“首屏预算”，避免万物卡片化。
5. 用真实数据、具体因果和 Jo 的教练口吻替换空泛治愈文案。
6. 周期信息采用文字、位置、符号、颜色四重编码，不只靠四个相近的玫瑰色。

---

## 1. 现有提示词审计

### 1.1 为什么会显得像 AI

| 现象 | 当前写法 | 模型常见结果 | v2 修正 |
|---|---|---|---|
| 风格词泛化 | Instagram-minimal、premium、soft、airy、breathing space | 任意女性健康模板都成立 | 改成项目专属的版式母题和组件规则 |
| 万物卡片化 | 大圆角卡片、soft card、pill selector 反复出现 | 每段内容一个悬浮卡片，层级虚假 | 首屏最多 2 个实体容器；列表优先用留白与分隔线 |
| 装饰替代品牌 | moon、soft wash、abstract arcs | 月亮、光晕、渐变、抽象弧线到处重复 | 月相只用于阶段信息，不作为万能空态插画 |
| 字体“显高级” | 每屏 Serif 标题 + Sans 正文 | 像美妆模板或 AI 杂志封面 | 中文宋体仅用于 3 个品牌时刻，其余用系统黑体 |
| 颜色过度锁死 | 页面底和卡片面都是 `#f3efe8`，仅 6 色 | 层级不够，模型靠阴影和卡片补偿 | 默认扁平化；允许既有色透明度层级；交互不能只靠颜色 |
| 页面提示相互独立 | 每个状态单独生成 | 同一组件在不同屏幕不断变形 | 锚点屏 → 组件库 → 同屏变体；变体只能做差量修改 |
| 内容过满 | S09 首屏同时要求 12 个模块，又要求低密度 | 首屏拥挤或生成超长海报 | 明确首屏/折叠下方内容和像素区间 |
| 文案空泛 | “请允许自己慢下来”“温柔对待自己” | 通用疗愈文案，没有产品证据 | 写明“为什么调整、调整了什么、用户还能做什么” |
| AI 自我强调 | `AI 定制` badge | 产品主动散发 AI 标签感 | 改成“为你安排 / 周期定制 / 今日建议” |

### 1.2 配色中的可用性风险

- `#aa6459` 配 `#f3efe8` 的对比度约为 **3.92:1**，不适合作为普通字号按钮文字组合。
- `#aa6459`、`#68403e`、`#824d48`、`#ba7872` 彼此对比约为 **1.29–2.52:1**，日历阶段不能只靠色块区分。
- `#49352e` 配 `#f3efe8` 约为 **10:1**，适合作为主要文字和关键操作组合。

建议继续保留 6 个品牌基色，但调整用途：

- 关键按钮：`#49352e` 底 + `#f3efe8` 字。
- 品牌玫瑰 `#aa6459`：选中标记、进度、短线、数字强调，不承载小字号反白正文。
- 四阶段：颜色 + 阶段文字 + 固定位置 + 符号共同表达。
- 次级层级：允许使用 `#49352e` 的 8% / 12% / 20% / 60% 透明度，不再新增冷灰色 hex。

如果品牌方坚持主 CTA 必须使用 `#aa6459`，按钮标签需至少采用大字号粗体并另做真机对比度验收；更推荐将 `#aa6459` 用作按钮外侧品牌标记，把可点击主体改为深可可棕。

---

## 2. 唯一设计方向：Jo 教练的周期训练手册

### 2.1 设计人格

不是“神秘月相疗愈 App”，也不是“高强度健身商城”。它像一位有经验的女教练每天在训练手册上替用户写下：今天处于什么阶段、身体反馈如何、为什么这样练、可以怎样调整。

三个关键词只用于内部判断，不直接丢给模型自由联想：

- **具体**：所有建议都有阶段或 Check-in 依据。
- **克制**：一屏一个主要任务，一个主要动作。
- **有人在场**：文案像 Jo 在解释，不像营销机器。

### 2.2 5 个项目专属识别件

1. **周期尺 Cycle Ruler**  
   一条水平的 28/30 天细线标尺，固定显示阶段、今天位置和预测范围。替代反复出现的大月亮卡片。

2. **Day 标记**  
   页面标题区采用 `DAY 17` / `黄体期第 6 天` 的非对称排版。数字是信息，不是装饰。

3. **Jo 的一句话**  
   只在今日建议、课程推荐理由和关键确认中出现。格式固定为“观察 → 建议”，最多 2 行，不写鸡汤。

4. **训练影像**  
   只使用真实教练、真实动作、真实空间的品牌照片。自然侧光、轻微颗粒、非棚拍摆拍、不过度磨皮。没有正式素材时只放带比例的图片占位，不让模型生成假人物。

5. **完成印记**  
   完课页使用简洁日期印章 / Day 编号 / 训练名称，而不是烟花、彩带、3D 奖杯或通用月亮插画。

规则：每屏最多出现 1 个识别件作为视觉主角，不能把 5 个元素全部堆在一起。

---

## 3. 移动端设计宪法

### 3.1 设备与网格

- 基准画板：iPhone 15 Pro，393 × 852 pt，竖屏，Light Mode。
- 左右安全边距：20 pt；列表可视分隔线从正文基线开始。
- 8 pt 主网格，允许 4 pt 微调。
- 最小点击区域：44 × 44 pt。
- 底部固定操作区必须包含 Home Indicator 安全区。
- 先设计 393 pt，再检查 375 pt 宽度；中文不允许被硬截断。

### 3.2 字体

- UI 与正文：PingFang SC / SF Pro 系统栈。
- 品牌宋体：Source Han Serif SC 或项目已授权宋体。
- 宋体只允许出现在：S03 欢迎、S13 分享海报、S22 付费墙价值标题。其他页面标题使用系统黑体。
- 字级：
  - 品牌展示：32/40，最多 2 行；
  - 页面标题：24/32，Semibold；
  - 区块标题：18/26，Semibold；
  - 正文：16/24，Regular；
  - 次级：14/20，Regular；
  - 标注：12/18，Medium。
- 不使用全大写英文装饰词；`DAY 17` 是唯一允许的短英文信息标记。

### 3.3 形状与层级

- 圆角只设 3 档：8（小控件）、12（输入/列表容器）、16（主内容/底部弹层内部）。
- 底部弹层顶部圆角可用 24；禁止所有卡片统一 24–28。
- Pill 只用于 1–3 个字的状态标签和筛选，不用于主要按钮、整段选项或长文案。
- 默认无阴影。只有模态层、底部弹层可使用 `#49352e` 10% 透明度阴影。
- 禁止卡片嵌套卡片；禁止一段文字单独套卡片；禁止浮动 Tab Bar。

### 3.4 页面容器预算

- 首个 852 pt 视口内：最多 2 个实体卡片/面板。
- 同屏圆角实体总数：最多 4 个，不含按钮、头像和短标签。
- 一个页面最多 1 个主按钮；次级动作不超过 2 个。
- 同一行标签不超过 4 个；超过时改为文本列表或横向滚动筛选。
- 空态不自动配插画；优先用图标、标题、解释和一个动作。

### 3.5 导航

- 使用标准 iOS 全宽 Tab Bar，不做悬浮胶囊。
- 5 Tab：今日 / 课程库 / 日历 / 社区 / 我的。
- Tab 图标使用同一套 1.75 pt 线性图标；激活态通过填充/字重/品牌短线共同表达。
- 二级页用标准返回导航；页面标题不重复出现两次。

### 3.6 图片与图标

- 无品牌照片时，输出明确的 `4:3 IMAGE PLACEHOLDER — use approved Jo photo`，不得生成 AI 人像。
- 禁止：漂浮球体、柔光渐变 blob、3D 图标、星光、闪粉、无意义叶片、通用瑜伽剪影、每个空态都画月亮。
- 课程照片裁切优先展示动作与身体姿态，不把人脸居中当美妆广告。
- 图标必须表达功能，不承担装饰。

### 3.7 文案语气

采用“事实 → 判断 → 选择”的顺序：

- 不写：`今天你可能感到疲惫，请允许自己慢下来。`
- 改写：`昨晚睡眠偏少，今天建议降低强度。`
- 不写：`解锁专属旅程，遇见更好的自己。`
- 改写：`订阅后继续查看未来课表和每日调整。`
- 不写：`AI 定制课。`
- 改写：`为你安排` 或 `周期定制`。
- 不写模型推断不出的医学结论；健康建议注明依据和边界。

Jo 的一句话模板：

```text
观察：你昨晚睡了 5 小时 42 分，今早能量偏低。
建议：把核心训练换成 10 分钟舒缓拉伸；也可以保留原课。
```

---

## 4. 页面族，而不是 31 个自由发挥的页面

| 页面族 | 屏幕 | 固定骨架 | 允许变化 |
|---|---|---|---|
| 品牌入口 | S01、S03、S06、S13 | 单视觉焦点 + 单主动作 | 品牌照片/完成印记 |
| 问卷表单 | S02、S04、S05、S28 | 顶部进度/标题 + 中部输入 + 底部动作 | 题型、声明、确认 |
| 今日任务 | S08、S09、S10、S12 | 周期信息 + 主任务 + 解释 | 课态、Check-in、锁定 |
| 全屏训练 | S11 | 视频优先 + 最少控制 | 播放/续播/投屏 |
| 日历数据 | S25、S27 | 固定标题 + 数据区 + 扁平明细 | 完成/部分/锁定 |
| 资产/设置 | S14–S17、S24、S26 | 扁平分组列表 | 迁移/订阅状态 |
| 商业转化 | S22、S23 | 价值证据 + 方案 + 法务 | 新老用户/支付结果 |
| 探索内容 | S29–S31 | 搜索/筛选 + 内容列表 | 课程/官方内容 |
| 底部弹层 | S19–S21、S30 | 标题 + 事实 + 选择 | Check-in/确认/日期 |

先为每个页面族生成一个母版。后续页面只能复用母版并替换数据、状态和必要组件。

---

## 5. 提示词四层结构

### Layer 0：产品事实

直接引用现有 `screens-*.ts`、`decisions.ts` 和确认后的业务数值。产品事实优先级最高，模型不得补全未确认价格、权益或医学结论。

### Layer 1：全局设计宪法

使用本文件第 2–3 节。一个 Stitch 项目只输入一次，并固定为项目上下文。

### Layer 2：页面族母版

生成 9 个页面族的骨架，确认后作为 reference frame。母版阶段不追求全部页面，只确认栅格、字体、导航、按钮、列表、图片区和状态样式。

### Layer 3：单屏差量

每次只描述这个屏幕相对母版的差异：目标、状态、确切文案、数据、主动作、首屏顺序、禁止新增项。

冲突优先级固定为：

```text
产品事实 > 页面结构 > 组件复用 > 可用性 > 品牌规则 > 氛围形容词
```

---

## 6. 可直接复制：Stitch / GPT 全局总控提示词

```text
You are executing an approved mobile product design system for Clean Circle.
Do not invent an aesthetic direction. Do not redesign the product from scratch.
Your job is to apply the rules below consistently and render one production-ready iOS screen at a time.

PRODUCT
Clean Circle is a cycle-aware movement app led by coach Jo. It should feel like a precise personal training notebook, not a mystical moon app, beauty campaign, medical dashboard, or loud fitness marketplace.

DESIGN PRINCIPLES
1. Specific: every recommendation shows its product reason.
2. Restrained: one primary task and one primary action per screen.
3. Human: copy sounds like an experienced coach explaining a decision.

DEVICE AND GRID
- iPhone 15 Pro portrait, 393 x 852 pt, light mode.
- 20 pt horizontal margins, 8 pt grid, 44 pt minimum touch target.
- Respect status bar, navigation bar, tab bar, keyboard, and home indicator safe areas.
- Validate the same layout at 375 pt width. Never clip Chinese copy.

TYPOGRAPHY
- PingFang SC / SF Pro for all UI and body copy.
- Source Han Serif SC only on the Welcome screen, Share Poster, and Paywall value headline.
- Page title 24/32 semibold; section 18/26 semibold; body 16/24; secondary 14/20; caption 12/18.
- Do not add decorative English. DAY + number is allowed only as an information marker.

COLOR
- Base palette only: #aa6459, #68403e, #824d48, #ba7872, #49352e, #f3efe8.
- Use #49352e on #f3efe8 for primary text and accessible key actions.
- Use #aa6459 as brand accent, selection, progress, and small emphasis; do not place normal-size oat text on it as the only CTA treatment.
- Transparent tints of the six base colors are allowed for hierarchy. Do not introduce cool gray, pure black, or pure white hex values.
- Never encode cycle phase or status using color alone; add a label, fixed position, and symbol.

SHAPE AND ELEVATION
- Radius scale: 8, 12, 16 pt. Bottom sheet outer top radius may be 24 pt.
- Pills are only for short status or filter labels.
- No shadow by default. Shadows are allowed only for modal layers and bottom sheets.
- Maximum two solid cards/panels in the first viewport and four rounded containers on the entire screen, excluding buttons and short status chips.
- Never nest cards. Prefer whitespace, typography, and dividers for grouping.

SIGNATURE ELEMENTS
- Reuse the Cycle Ruler: a slim horizontal 28/30-day phase scale with today's position and text label.
- Reuse the asymmetric DAY marker for cycle-aware task screens.
- Jo's Note uses observation -> recommendation, maximum two lines.
- Approved real coach photography only. If no asset is supplied, show a labeled image placeholder; never generate a synthetic person.
- Completion uses a date/day typographic stamp, not confetti or trophies.
- Use at most one signature element as the visual protagonist of a screen.

NAVIGATION
- Standard full-width iOS tab bar: 今日 / 课程库 / 日历 / 社区 / 我的.
- Never use a floating pill tab bar.
- Use standard back navigation and platform-native sheets, pickers, switches, loading, and error behavior.

COPY
- Chinese UI copy only unless an approved brand phrase is explicitly provided.
- Prefer facts and actions over inspiration.
- Explain what changed, why it changed, and what the user can choose.
- Never add slogans, fake testimonials, made-up statistics, unsupported medical advice, or new features.
- Replace “AI 定制” with “为你安排” or “周期定制”.

ANTI-TEMPLATE RULES
- No gradients, glassmorphism, glow, blurred color blobs, floating orbs, sparkles, 3D icons, generic moon illustrations, generic yoga silhouettes, or decorative leaves.
- No giant centered serif headline on functional screens.
- No card for every paragraph, no all-pill UI, no excessive badges, no floating navigation.
- No fake photo, fake avatar, fake social proof, fake data, or filler English.
- Do not add decorative elements to compensate for whitespace.

CONSISTENCY
- Reuse the approved components and reference frames exactly.
- A state variant may change only copy, data, status, visibility, and enabled/disabled behavior. It may not change the component geometry.
- If required information is missing, show [待确认] in the spec instead of inventing it.

OUTPUT
- Generate exactly one screen and name it with its screen ID and state.
- Preserve all exact Chinese copy supplied in the screen contract.
- After rendering, check: hierarchy, component budget, text overflow, touch targets, contrast, safe area, state completeness, and prohibited AI-template motifs.
```

---

## 7. 单屏差量模板

每一屏只填下表，不再重复一整套风格词。

```text
[SCREEN CONTRACT]
Screen ID and state:
Page family / approved reference frame:

User goal:
Entry:
Primary exit:

First viewport order (top -> bottom):
1.
2.
3.
4.

Below fold:

Exact Chinese copy:
- Page title:
- Primary action:
- Secondary action:
- System/help copy:

Real data shown:
-

State logic:
-

Components that must be reused:
-

New components allowed:
- None / list exact component

Must not add:
-

Acceptance checks:
- One primary task is obvious within 3 seconds.
- First viewport contains no more than two solid panels.
- No copy, price, medical claim, metric, or feature was invented.
```

---

## 8. 可直接复制：S09 今日首页示例

这张屏幕应作为第一个锚点屏。先做默认态，再在同一 Frame 旁复制状态，不要分别从零生成。

```text
Apply the approved Clean Circle global system and the Today Task reference frame.

[SCREEN CONTRACT]
Screen ID and state: S09 · 今日首页 · 已 Check-in / 今日课未开始
Page family: Today Task

User goal:
In under three seconds, the user should understand today's cycle stage, why today's workout was selected, and how to start or adjust it.

Entry:
App launch after the user has completed today's Check-in.

Primary exit:
Tap “开始训练” -> S11 player.

First viewport order:
1. Standard navigation row: “早上好，小圆” on the left, “1月17日 周六” below it, message icon on the right. No large hero greeting.
2. Compact DAY marker + Cycle Ruler: “DAY 17” and “黄体期 · 第 6 天”; supporting text “预计 8 天后开始经期”. This is a flat typographic section, not a card and not a moon illustration.
3. Check-in summary as one flat tappable row: “能量中 · 情绪平稳 · 睡眠一般 · 轻微腹胀” with status “已记录”.
4. One dominant workout panel with approved real Jo photo placeholder in 4:3 ratio. Title “舒缓瑜伽”; metadata “20 分钟 · 低强度 · 全身放松”; status “未开始”.
5. Jo's Note below the workout title, maximum two lines: “今天处于黄体期，且睡眠一般。先做低强度恢复训练。”
6. One full-width primary button: “开始训练”.
7. One quiet text action below: “今天太累？调整为 10 分钟拉伸”.
8. Standard full-width five-tab iOS tab bar with 今日 active.

Below fold:
- A plain section titled “今天还可以做” with two list rows: “饮食建议” and “Ritual”.
- Do not show three Ritual cards in the first viewport.
- “来例假了” is a small utility text action at the end of the cycle section, not a colored promotional chip.

Exact copy:
- Greeting: 早上好，小圆
- Date: 1月17日 周六
- Stage: 黄体期 · 第 6 天
- Prediction: 预计 8 天后开始经期
- Check-in: 能量中 · 情绪平稳 · 睡眠一般 · 轻微腹胀
- Workout: 舒缓瑜伽
- Metadata: 20 分钟 · 低强度 · 全身放松
- Primary action: 开始训练
- Adjustment: 今天太累？调整为 10 分钟拉伸

Components to reuse:
- App navigation row
- DAY marker
- Cycle Ruler
- Check-in summary row
- Workout panel
- Jo's Note
- Primary button
- Standard tab bar

New components allowed:
- None.

Must not add:
- Trial banner in this state.
- Large moon, abstract arcs, gradient, glow, quote, English slogan, AI badge, kcal estimate, streak banner, extra CTA, floating tab bar, nested cards, or generated person.

Acceptance:
- The workout is the only dominant panel.
- Cycle summary and Check-in use flat layout with dividers, not cards.
- Primary CTA is visible above the tab bar on 393 x 852.
- The same geometry can support unchecked, in-progress, completed, downgraded, locked, and fallback states.
```

### S09 变体的正确生成方式

不要重新贴整屏 prompt。复制已通过的 S09 Frame，只输入差量：

```text
Create the S09 · 进行中 variant by duplicating the approved S09 frame.
Do not change layout, spacing, typography, image ratio, component geometry, or tab bar.
Change only:
- Status “未开始” -> “进行中”
- Add progress “08:32 / 20:00” inside the existing workout panel
- Primary action “开始训练” -> “继续训练”
- Quiet secondary action -> “重新开始”
- Hide the downgrade adjustment while the workout is in progress
No other visual or copy changes.
```

---

## 9. 可直接复制：让 GPT 生成 Stitch Prompt 的“编译器提示词”

GPT 不直接当视觉设计师，而是把产品资料编译成符合 v2 系统的执行指令。

```text
你是 Clean Circle 移动端设计系统的“提示词编译器”和设计 QA，不是自由创意设计师。

输入将包含：
1. 已批准的全局设计宪法；
2. 一个页面族母版；
3. 线框 ScreenDef / state / annotations；
4. 产品决策 B-01…B-13；
5. 已确认的中文文案和数据。

你的任务：把输入编译成一条可直接交给 Stitch 的单屏差量提示词。

硬性规则：
- 不得发明价格、权益、功能、医学判断、统计数据、用户评价或营销文案。
- 不得新增风格、颜色、字体、插画、卡片、badge 或导航。
- 业务事实与视觉规则冲突时，以业务事实和可用性优先。
- 先决定信息顺序，再引用现有组件；只有无法表达必要交互时才允许申请一个新组件。
- 默认使用扁平分组，不把每段信息包装成卡片。
- 精确保留提供的中文文案；未确认内容写 [待确认]。
- 状态变体只输出相对已批准 Frame 的变化，不重写整屏。

输出格式必须只有以下 8 段，不要解释：
1. SCREEN
2. USER GOAL
3. FIRST VIEWPORT ORDER
4. BELOW FOLD
5. EXACT COPY AND DATA
6. COMPONENT REUSE
7. STATE DELTA
8. DO NOT ADD + ACCEPTANCE

输出前静默自检：
- 是否 3 秒内能看出主任务？
- 是否首屏最多 2 个实体面板？
- 是否只有 1 个主 CTA？
- 是否出现任何空泛疗愈文案？
- 是否出现 AI badge、渐变、月亮装饰、万物卡片化或假数据？
- 是否与同页面族组件几何一致？
如有任一项不通过，先修正再输出。
```

如果通过 GPT API 批量生成，建议使用低随机度和结构化输出；模型只生成 Screen Contract，不直接一次生成 31 张视觉稿。

---

## 10. 三条修订提示词

### 10.1 去模板味修订

```text
Audit this frame against the approved Clean Circle anti-template rules.
Keep product content and navigation unchanged.
Remove gratuitous cards, pills, shadows, gradients, decorative moon/arc imagery, filler English, and duplicate headings.
Rebuild hierarchy using spacing, type weight, dividers, and one dominant content panel.
Do not introduce a new style. Return one revised frame plus a short list of removed template patterns.
```

### 10.2 组件一致性修订

```text
Compare this frame with the approved reference frame from the same page family.
Normalize margins, type scale, radius, button height, icon stroke, image ratio, row height, tab bar, and sheet geometry.
Do not change copy, data, feature scope, or state logic.
Any component not present in the approved library must be removed or explicitly flagged as [NEW COMPONENT REQUEST].
```

### 10.3 文案去 AI 味修订

```text
Rewrite only the UI copy in coach Jo's voice.
Use factual Chinese and the sequence observation -> recommendation -> user choice.
Delete generic healing language, self-improvement slogans, exaggerated personalization, filler English, and repeated “专属/解锁/更懂你/温柔”.
Do not add medical claims or new product facts.
Keep titles under 14 Chinese characters, body copy under 42 characters per block, and buttons under 8 characters where possible.
Show before/after pairs for approval; do not alter layout.
```

---

## 11. 生成顺序

### 第 1 轮：只做 3 个锚点屏

1. S03 欢迎：确定品牌时刻和唯一宋体用法。
2. S09 今日：确定主任务、周期尺、Jo's Note、训练影像和 Tab Bar。
3. S25 日历：确定周期和完成状态的多重编码。

客户先确认这 3 张，不生成 31 张。

### 第 2 轮：组件与页面族

- 从锚点屏抽出组件，不另外“凭空画组件库”。
- 完成问卷、列表、设置、商业化、底部弹层等页面族母版。
- 每个母版用一个真实业务屏验证。

### 第 3 轮：主态

- 按 P0 主路径生成。
- 每张屏必须注明复用了哪个母版和哪些组件。
- 未确认数值保留 `[待确认]`，不让 AI 自动补齐。

### 第 4 轮：状态差量

- 在已批准 Frame 旁复制变体。
- 只允许改数据、文案、状态、显隐和 enabled/disabled。
- 不允许状态变体自己长出新的视觉语言。

### 第 5 轮：真机验收

- 393 × 852 与 375 × 812 两档检查。
- 检查键盘、长中文、动态字体、Safe Area、滚动、单手操作、暗色图片上的控件。
- 对照度和颜色编码单独验收，不能只看展示稿。

---

## 12. 交付验收：AI 味检查表

### 视觉

- [ ] 首屏不超过 2 个实体面板。
- [ ] 没有渐变、玻璃拟态、发光、漂浮球、3D 图标。
- [ ] 没有为了“女性感”自动添加叶片、星星、花朵或大月亮。
- [ ] 功能页没有巨型居中宋体标题。
- [ ] Tab Bar、表单、Sheet 符合 iOS 常规行为。
- [ ] 圆角、按钮、图标、图片比例来自同一套组件。

### 内容

- [ ] 每条个性化建议能说清依据。
- [ ] 没有“遇见更好的自己”一类空泛句子。
- [ ] 没有 `AI 定制` 标签和无意义英文。
- [ ] 没有模型补造价格、人数、评分、疗效或用户评价。
- [ ] 用户能看懂系统做了什么，并能撤销高影响操作。

### 品牌

- [ ] 一眼能看到 Clean Circle 的周期尺、Day 标记或 Jo 的教练解释之一。
- [ ] 真实照片来自批准素材；没有 AI 生成人物。
- [ ] 月相是信息，不是万能装饰。
- [ ] 三张锚点屏看起来属于一个产品，但承担不同任务，不是同一模板换字。

### 可用性

- [ ] 主任务 3 秒内可识别。
- [ ] 一屏只有一个主 CTA。
- [ ] 触控区至少 44 pt。
- [ ] 颜色不是唯一的阶段/状态表达方式。
- [ ] 关键文字和按钮通过对比度与真机检查。
- [ ] 375 pt 宽度下中文不截断，底部动作不撞 Home Indicator。

---

## 13. 对客户的表达方式

可以直接说明：

> AI 的确可以快速生成一张“像 App 的图”，但它不会自动替项目做出稳定的业务优先级、状态继承、组件预算、可访问性、品牌影像和文案证据链。我们的交付不是一句“做得高级一点”，而是一套让 GPT / Stitch 只能在批准边界内执行的移动端设计系统。换模型仍能复现，换页面不会变风格，换状态不会重做结构，这才是设计工作的价值。

