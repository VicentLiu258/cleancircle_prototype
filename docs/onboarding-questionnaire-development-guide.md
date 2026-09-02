# NOT A PHASE Onboarding 问卷与用户标签系统开发指导文档

**版本**：V1.0（开发基线）  
**日期**：2026-09-02  
**适用项目**：API、Web 管理后台、移动端、推荐/排课服务、数据分析  
**对应需求**：《NOT A PHASE Onboarding 问卷需求文档 V1（统一联动版）》

> 本文档是可供多个代码仓库共同使用的开发基线。字段、枚举、版本和决策边界优先于各端自己的页面实现。建议将本文档中的 API Schema、枚举和标签字典拆入共享包，并由 OpenAPI 生成各端类型。

## 0. 文档边界：哪些是源需求，哪些是本开发文档的实现方案

### 0.1 源需求文档中的业务要求（必须保留）

以下内容来自附件需求文档，属于产品规则，不应由某个端自行解释：

- Onboarding 建立长期、相对稳定的 `User Training Profile`；`Daily Check-in` 只判断当天状态，二者分开存储。
- 推荐优先级为：`Hard Filter` → `Context` 安全规则 → `Fitness Capacity / 时长` → `目标贡献` → `内容偏好`。
- 安全约束不能被目标、偏好、历史或当日状态覆盖；缺失安全信息时使用更保守候选。
- 孕期 V1 直接阻断自动推荐；有医嘱限制或警示症状时停止自动推荐并给出非诊断性专业咨询提示。
- 产后恢复既可以是 `primary_goal`，也可以是 `life_stage` / `postpartum context`；目标说明用户想要什么，生命周期和安全字段决定当前能安全做什么。
- 用户侧不采集器械条件作为 V1 主匹配条件；课程侧器械仅作为展示和运营元数据。
- BMI 只作参考，不能单独定义能力、大基数或降低强度；不做医学诊断、体质评分或治疗建议。
- 问题、选项、派生标签、课程标签和规则都需要稳定 ID、版本化、可回溯。
- 推荐结果必须能说明为何过滤、为何排序、为何因当日状态调整；历史计划保留生成时的版本。

### 0.2 本文档新增的工程实现方案

以下内容是为了让 API、Web、移动端可以并行开发而补充的技术设计：

- PostgreSQL 表结构、索引、唯一约束和敏感数据分区。
- `/api/v1/app` 与 `/api/v1/admin` 的资源、请求、响应和状态机。
- 标签的“双轴模型”：语义分组解决管理和分析，决策层解决推荐执行。
- `profile_version`、`taxonomy_version`、`questionnaire_version`、`rule_version` 的版本关系。
- Web 后台信息架构、权限、审核、模拟、发布和审计页面。
- 移动端草稿、分支问卷、幂等、并发 revision、离线和阻断态交互。

若产品评审修改源需求，先修改业务契约，再同步数据库、OpenAPI、后台配置和移动端文案；不得只修改单端代码。

## 1. 总体原则与端到端链路

### 1.1 六条开发原则

1. **字段先于页面**：先固定 technical key、枚举和值域，再做表单和标签文案。
2. **原始答案不可变**：用户每次提交保存答案快照；派生档案以新版本产生，不覆写历史。
3. **长期与当天分离**：`Onboarding` 不写入当天疲劳；`Daily Check-in` 不回写长期能力。
4. **Hard / Context / Soft 分层**：禁止把安全约束压缩成一个可被软分数抵消的综合分。
5. **规则可解释、可回放**：每次推荐记录输入版本、命中标签、排除原因、排序分项和 trace。
6. **敏感信息最小化**：周期、孕产、盆底、腹直肌分离、医嘱等分级保护；允许跳过、查看、更正、导出和删除。

### 1.2 领域链路

```text
Onboarding questionnaire version
        ↓  answers snapshot
Quiz submission / validation
        ↓  derivation rules + taxonomy version
User Training Profile version
        ↓  hard filters + context + preference
Monthly Training Structure / Daily Training Intent
        ↓  course profile + recommendation rule version
Primary Course + Backup A/B/C + explanation

Daily Check-in ──→ Daily Adapt（仅今天）
Cycle facts / profile change ──→ Re-plan（仅未来）
```

### 1.3 核心不变量

| 编号 | 不变量 | 服务端验收方式 |
|---|---|---|
| I-01 | `PREGNANT` 不进入 V1 自动推荐候选集 | 推荐前置过滤测试 |
| I-02 | `clearance=no/unknown` 或 warning signs 命中时，产后/孕产场景不自动排课 | 安全规则单测 + 回放 |
| I-03 | `unknown` 与 `no` 不得混用 | 枚举校验；数据库 CHECK |
| I-04 | Daily Adapt 不改历史和未来计划 | 作用域断言 |
| I-05 | 已发布版本不可原地编辑 | 发布后 UPDATE 拒绝或复制新 draft |
| I-06 | 缺失关键课程安全字段的课程不能进入相关候选集 | Course Profile publish gate |
| I-07 | 规则、画像、课程档案历史可还原 | 决策日志保存版本矩阵和快照 hash |

## 2. 统一领域模型与命名

### 2.1 命名约定

- 数据库、JSON、Query 参数、OpenAPI property 统一 `snake_case`。
- 展示文案可以中文；technical key 不随文案修改。
- ID 使用 `uuid` 或现有系统的 `bigint`，本文示例优先使用 `uuid`；如果现有用户表是 `bigint`，只需保持 FK 类型一致。
- 时间统一 ISO 8601；数据库使用 `timestamptz`；只存日期的字段使用 `date`，例如 `last_period_date`、`local_date`。
- 数组字段使用 JSON 数组或关联表；需要筛选/聚合的标签必须落关联表，不只存 JSON。
- 枚举优先存稳定字符串，不存前端显示文本、不存数组下标。

### 2.2 五层对象

| 对象 | 作用 | 是否可变 |
|---|---|---|
| `QuestionnaireVersion` | 一组可发布的题目、选项、分支和映射 | 发布后不可变 |
| `QuizSubmission` | 用户一次问卷的草稿/提交记录和答案快照 | 草稿可变，提交后答案快照不可变 |
| `UserTrainingProfileVersion` | 由答案派生出的长期训练画像 | 不可变；重新提交生成新版本 |
| `CourseProfileVersion` | 课程侧结构化标签和字段证据 | 发布后不可变 |
| `RecommendationDecision` | 某日某阶段的过滤、排序和解释快照 | 只追加 |

### 2.3 User Training Profile 统一字段

以下字段名尽量复用源需求中的后台字段。`field_key` 是跨 API、Web、移动端和推荐服务的稳定 key。

#### A. 身体基础

| field_key | 类型 | 来源 | 说明 |
|---|---|---|---|
| `age` | integer/null | Q01 | 原始年龄；不单独降低强度 |
| `age_band` | enum/null | Q01 | `18_24`、`25_34`、`35_44`、`45_54`、`55_plus` |
| `height_cm` | numeric/null | Q02 | 厘米，范围校验 100–250 |
| `weight_kg` | numeric/null | Q02 | 千克，范围校验 25–300 |
| `bmi` | numeric/null | Q02 | 内部计算值，可不下发移动端 |
| `bmi_band` | enum/null | Q02 | 仅参考；`reference_only` 语义必须保留 |

#### B. 目标

| field_key | 类型 | 允许值 |
|---|---|---|
| `primary_goal` | enum | `fat_loss`、`tone`、`healthy_habit`、`postpartum_recovery` |
| `secondary_goal` | enum/null | 同上；不得与 `primary_goal` 重复 |

#### C. 能力、负荷与偏好

| field_key | 类型 | 允许值/说明 |
|---|---|---|
| `exercise_frequency_4w` | enum | `none`、`once_weekly`、`two_three_weekly`、`four_plus_weekly` |
| `continuous_activity_20m` | enum | `very_hard`、`complete_with_breaks`、`fairly_easy`、`easy_can_continue` |
| `fitness_capacity` | enum | V1 只使用 `L1`–`L5`；推导规则必须版本化 |
| `jump_tolerance` | enum | `avoid`、`low`、`standard`、`unknown` |
| `movement_limitations` | string[] | `knee`、`back`、`wrist`、`shoulder`、`pelvic_floor`、`diastasis`、`other` |
| `limitation_severity` | enum/null | `mild`、`moderate`、`medical`、`unknown` |
| `preferred_duration_min` | integer[] | `10`、`15`、`20`、`30`、`40`；允许多选 |
| `planned_days_per_week` | enum | `2`、`3`、`4`、`5_plus` |
| `preferred_formats` | string[] | `walk_low_impact_cardio`、`dance`、`strength`、`pilates_yoga`、`stretch_recovery`、`mixed` |
| `avoid_formats` | string[] | 上述形式 + `jumping`、`floor_work`、`quick_direction_change` |

#### D. 生命周期与敏感安全字段

| field_key | 类型 | 允许值/说明 |
|---|---|---|
| `life_stage` | enum | `regular_cycle`、`irregular_cycle`、`hormonal_contraception`、`trying_to_conceive`、`pregnant`、`postpartum`、`perimenopause`、`postmenopause`、`unknown`、`prefer_not_to_answer` |
| `last_period_date` | date/null | 可跳过；只用于估算，不宣称精确阶段 |
| `avg_cycle_days` | integer/null | 可选；建议 15–60 |
| `cycle_variability` | enum/null | 周期不规律分支 |
| `hormonal_contraception_type` | enum/null | `oral`、`iud`、`implant`、`injection`、`other`、`prefer_not_to_answer` |
| `trying_to_conceive` | boolean/null | 备孕分支 |
| `medical_restriction` | enum/null | `yes`、`no`、`unknown`；有医嘱时优先级最高 |
| `pregnancy_stage` | enum/null | `early`、`middle`、`late`、`unknown` |
| `clearance` | enum/null | `yes`、`no`、`unknown` |
| `warning_signs` | string[] | `persistent_or_worsening_pain`、`abnormal_bleeding`、`dizziness_or_chest_pain`、`wound_issue`、`other` |
| `postpartum_weeks` | integer/null | 产后周数；不能单独决定难度 |
| `delivery_type` | enum/null | `vaginal`、`c_section`、`prefer_not_to_answer` |
| `symptoms` | string[] | 产后症状，至少支持 `leakage`、`heaviness`、`pain`、`bleeding`、`other` |
| `perimenopause_symptoms` | string[] | `sleep`、`hot_flashes`、`joint`、`fatigue`、`none` |
| `postmenopause_restrictions` | string[] | `bone`、`cardiovascular`、`joint`、`none`、`unknown` |
| `pcos_context` | enum/null | `marked`、`not_marked`、`unknown`；不是独立禁忌 |

#### E. 系统元数据

| field_key | 类型 | 说明 |
|---|---|---|
| `profile_version` | string | 例如 `utp_v1.0.0` |
| `taxonomy_version` | string | 例如 `taxonomy_v1.0.0` |
| `questionnaire_version` | string | 例如 `onboarding_v1.0.0` |
| `derivation_rule_version` | string | 例如 `profile_rules_v1.0.0` |
| `completed_at` | timestamptz | 本次画像生成时间 |
| `consent_version` | string | 敏感信息用途同意版本 |

### 2.4 Course Profile 统一字段

课程侧统一使用下列显示名和 technical key，不允许从标题或文案猜安全性：

| 显示名（源需求口径） | technical key | 类型 |
|---|---|---|
| Primary Workout Type | `primary_workout_type` | enum |
| Secondary Workout Type | `secondary_workout_type` | enum[] |
| Primary Body Area | `primary_body_area` | enum |
| Secondary Body Areas | `secondary_body_areas` | enum[] |
| Overall Intensity | `overall_intensity` | enum |
| Cardio Load | `cardio_load` | enum |
| Muscular Load | `muscular_load` | enum |
| Impact Load | `impact_load` | enum |
| Jump Level | `jump_level` | enum |
| Knee Load | `knee_load` | enum |
| Wrist Bearing | `wrist_bearing` | enum |
| Lower Back Load | `lower_back_load` | enum |
| Shoulder Load | `shoulder_load` | enum |
| 减脂贡献 | `fat_loss_contribution` | integer 0–100 |
| 塑形贡献 | `tone_contribution` | integer 0–100 |
| 健康生活贡献 | `healthy_habit_contribution` | integer 0–100 |
| 产后恢复贡献 | `postpartum_recovery_contribution` | integer 0–100 |
| 经期风险 | `cycle_risk` | enum |
| 产后风险 | `postpartum_risk` | enum |
| `supine_work` | `supine_work` | enum |
| `core_pressure` | `core_pressure` | enum |
| `pelvic_floor_load` | `pelvic_floor_load` | enum |
| `modification_available` | `modification_available` | boolean |

## 3. 标签分组系统：推荐实现逻辑

### 3.1 为什么不能只做一张平面 `user_tags`

“产后”“膝限制”“喜欢舞蹈”“低冲击”虽然都可以显示成标签，但它们在系统中的含义不同：

- 产后是生命周期 Context，可能同时触发安全 Hard Filter。
- 膝限制是身体安全约束，具备严重程度和来源题目。
- 喜欢舞蹈是 Soft Preference，只能排序，不能覆盖安全。
- 低冲击可能来自用户跳跃耐受，也可能来自课程的 `impact_load`，两侧方向相反。

因此标签需要至少两个维度：

1. **语义分组（`tag_group_key`）**：用于字典管理、用户详情、分组筛选和分析。
2. **决策层（`decision_layer`）**：用于推荐执行，值为 `hard_filter`、`context`、`soft_preference`。

同一标签可以属于一个语义组，但在不同场景中由不同规则消费；决策层不是标签的唯一身份，而是该标签在当前推荐规则中的作用。

### 3.2 V1 标签分组树

| tag_group_key | 中文分组 | 示例标签 | 默认决策层 | 敏感级别 |
|---|---|---|---|---|
| `body_foundation` | 身体基础 | `age_band:35_44`、`bmi_band:reference_only` | `context` | normal |
| `goal` | 核心目标 | `goal:fat_loss`、`goal:tone` | `soft_preference` | normal |
| `capacity` | 能力与训练基础 | `fitness_capacity:L1`、`activity_base:low` | `soft_preference` | normal |
| `impact_tolerance` | 冲击与跳跃耐受 | `impact:no_jump`、`impact:low` | hard + soft | normal/sensitive |
| `movement_constraint` | 身体限制 | `constraint:knee`、`constraint:wrist` | hard + context | sensitive |
| `constraint_severity` | 限制程度 | `severity:mild`、`severity:moderate`、`severity:medical` | hard | sensitive/restricted |
| `duration_frequency` | 时长与频率 | `duration_pref:15`、`frequency_pref:3` | `soft_preference` | normal |
| `format_preference` | 训练形式偏好 | `format_pref:dance`、`avoid:floor_work` | `soft_preference` | normal |
| `life_stage` | 女性生命周期 | `life_stage:postpartum`、`life_stage:perimenopause` | context | sensitive |
| `cycle_context` | 周期情境 | `cycle:regular`、`cycle:irregular` | context | sensitive |
| `pregnancy_context` | 孕期安全 | `pregnancy:blocked`、`clearance:unknown` | hard/context | restricted |
| `postpartum_context` | 产后恢复 | `postpartum:early`、`pelvic_floor:flagged` | hard/context | restricted |
| `medical_context` | 医嘱与警示 | `medical_restriction:yes`、`warning_signs:present` | hard | restricted |
| `analysis_context` | 分析辅助 | `context:pcos` | context | sensitive |
| `system_state` | 系统状态 | `profile:incomplete`、`recommendation:blocked` | system | normal/restricted |

### 3.3 标签元数据定义

每个 `tags` 字典项至少包含：

| 字段 | 说明 |
|---|---|
| `tag_key` | 稳定技术 key，例如 `constraint:knee` |
| `tag_group_key` | 语义分组，来自上表 |
| `scope` | `user`、`course`、`both`、`system` |
| `value_type` | `boolean`、`enum`、`integer`、`decimal`、`string`、`set` |
| `decision_layer` | 默认消费层；允许规则引用时覆盖，但要记录规则版本 |
| `sensitivity` | `normal`、`sensitive`、`restricted` |
| `unknown_policy` | `conservative`、`exclude_from_filter`、`not_applicable` |
| `display_name` / `description` | 多语言展示和定义 |
| `source_field_keys` | 产生该标签的字段，例如 `movement_limitations` |
| `is_user_visible` | 是否可以在用户档案页面展示 |
| `status` | `draft`、`published`、`deprecated` |
| `taxonomy_version_id` | 所属字典版本 |

技术上建议保留 `tag_id`（内部主键）和 `tag_key`（稳定外部 key）两层，禁止用中文名或排序位置作为 ID。

### 3.4 标签状态与来源

`user_tags` 不要只存 `(user_id, tag_id)`，需要保存标签为什么存在、是否仍生效：

| 字段 | 允许值/说明 |
|---|---|
| `state` | `active`、`unknown`、`suppressed`、`expired` |
| `source_type` | `onboarding_answer`、`derived_rule`、`daily_checkin`、`admin_manual`、`import` |
| `source_id` | 对应 answer、规则运行、check-in 或操作记录 ID |
| `source_question_key` | 例如 `Q08`，便于解释 |
| `value_json` | 多值、严重程度、数值或结构化补充信息 |
| `confidence` | 0–1；用户明确回答通常为 1，推导可低于 1 |
| `effective_from` / `effective_to` | 适用于生命周期和短期状态 |
| `profile_version_id` | 关联到生成该标签的画像版本 |
| `created_by` | 系统或后台管理员 ID |

规则：

- `unknown` 是已知“未确认”，不是 `false`，也不是缺行。
- 用户最新画像生成时，不删除旧标签；旧画像的标签保留在旧 `profile_version_id` 下。
- `Daily Check-in` 产生的标签必须设置 `effective_to`，不得写入长期画像的永久版本。
- 手工标签不能覆盖安全自动标签；冲突时由规则优先级处理并记录 `conflict_code`。

### 3.5 Q01–Q15 到标签的推导逻辑

| 题目 | 长期字段 | 典型用户标签 | 课程侧消费 |
|---|---|---|---|
| Q01 年龄 | `age`、`age_band` | `age_band:*` | 只作 Context/分析 |
| Q02 身高体重 | `height_cm`、`weight_kg`、`bmi`、`bmi_band` | `bmi_band:reference_only` | 与能力、跳跃和局部负荷联合排序 |
| Q03 主要目标 | `primary_goal` | `goal:fat_loss` 等 | 对应目标贡献排序 |
| Q04 次要目标 | `secondary_goal` | `secondary_goal:*` | 目标贡献次级加权 |
| Q05 近 4 周频率 | `exercise_frequency_4w` | `activity_base:low/mid/high` | 训练难度、训练负荷 |
| Q06 连续活动 20 分钟 | `continuous_activity_20m` | `fitness_capacity:L1–L5` | `overall_intensity`、`cardio_load` |
| Q07 跳跃耐受 | `jump_tolerance` | `impact:no_jump/low/standard/unknown` | `impact_load`、`jump_level` |
| Q08 身体限制 | `movement_limitations` | `constraint:*` | 对应局部负荷 Hard Filter |
| Q09 限制程度 | `limitation_severity` | `severity:*` | 中重度过滤；轻度降权 |
| Q10 单次时长 | `preferred_duration_min` | `duration_pref:*` | 精确命中，邻近档回退 |
| Q11 周计划频率 | `planned_days_per_week` | `frequency_pref:*` | 月度训练结构，不做单课过滤 |
| Q12 器械 | 无 | 无 | 课程侧仅元数据 |
| Q13 喜欢形式 | `preferred_formats` | `format_pref:*` | Soft 排序 |
| Q14 避免形式 | `avoid_formats` | `avoid:*` | 不喜欢降权；明确疼痛转安全规则 |
| Q15 生命周期 | `life_stage` | `life_stage:*` | 生命周期 Context、安全分支 |

### 3.6 关键安全推导伪代码

```text
derive_profile(answers, questionnaire_version, taxonomy_version):
  profile = normalize_answers(answers)
  tags = []

  tags += derive_goal_tags(profile.primary_goal, profile.secondary_goal)
  tags += derive_capacity_tags(profile.exercise_frequency_4w,
                               profile.continuous_activity_20m)
  tags += derive_impact_tags(profile.jump_tolerance)
  tags += derive_constraint_tags(profile.movement_limitations,
                                 profile.limitation_severity)
  tags += derive_preference_tags(profile.preferred_formats,
                                 profile.avoid_formats,
                                 profile.preferred_duration_min)

  if profile.life_stage == "pregnant":
      tags += ["pregnancy:blocked"]
      profile.recommendation_status = "blocked"

  if profile.clearance in ["no", "unknown"]:
      tags += ["clearance:unknown_or_no"]
      profile.recommendation_status = "blocked_or_manual_review"

  if has_warning_signs(profile.warning_signs):
      tags += ["warning_signs:present"]
      profile.recommendation_status = "blocked"

  if profile.life_stage == "postpartum":
      tags += derive_postpartum_stage(profile.postpartum_weeks)
      tags += derive_postpartum_safety_tags(profile.symptoms,
                                            profile.diastasis_flag,
                                            profile.clearance)

  return immutable_profile_version(profile, tags, source_and_rule_trace)
```

`recommendation_status` 建议值：`ready`、`incomplete`、`blocked`、`manual_review`。阻断时不允许使用“随便找一门低强度课”作为兜底。

### 3.7 用户分组（Segment）逻辑

标签是事实和派生状态；分组是可保存的查询。不要把“分组”复制成大量静态用户标签。

建议 DSL：

```json
{
  "version": 1,
  "operator": "and",
  "conditions": [
    {"field": "user_tag", "tag_key": "goal:fat_loss", "state": "active"},
    {
      "operator": "or",
      "conditions": [
        {"field": "user_tag", "tag_key": "fitness_capacity:L1", "state": "active"},
        {"field": "user_tag", "tag_key": "fitness_capacity:L2", "state": "active"}
      ]
    },
    {"field": "user_tag", "tag_key": "pregnancy:blocked", "state": "not_exists"}
  ]
}
```

分组执行规则：

- `user_tag` 条件只匹配 `state=active`，除非条件显式要求 `unknown`。
- 敏感标签分组需要 `users:sensitive:read` 或单独的受限分组权限；普通运营不能用“多囊/产后/盆底”做无授权导出。
- 分组预估先返回估算值；正式刷新异步生成 `segment_memberships` 快照。
- 分组规则版本变化不回写历史触达任务；发送任务保存当时的 `segment_id`、`segment_version` 和成员快照 hash。
- 任何跨标签分组都必须显示“命中了哪些条件”，不能只显示人数。

## 4. 数据库设计（PostgreSQL）

### 4.1 复用现有表的原则

现有项目已有 `users`、`tags`、`user_tags`、`quizzes`、`quiz_versions`、`quiz_questions`、`quiz_options`、`quiz_submissions`、`quiz_results`、`audit_logs` 等概念时，优先增量扩展，不要创建同义表。

推荐演进：

- 保留现有 `quizzes` / `quiz_*` 命名；把旧问卷记录标记为 `legacy`，新版本使用 `questionnaire_type=onboarding`。
- 保留现有 `tags` / `user_tags`，补齐 `tag_group_key`、`decision_layer`、版本和来源字段。
- 旧的平面 `user_tags` 查询接口继续兼容，但内部改为只读取当前有效 `profile_version_id` 的标签。
- 原始答案和派生档案分表保存，不把 `quiz_results` 当成唯一事实源。

### 4.2 核心表清单

| 表 | 用途 | 关键关系 |
|---|---|---|
| `taxonomy_versions` | 标签、字段和值域的版本 | 被问卷、画像、课程和规则引用 |
| `tag_groups` | 标签语义分组树 | `parent_id` 支持层级 |
| `tags` | 稳定标签字典 | `tag_key` 在版本内唯一 |
| `questionnaires` | 问卷主实体 | 多个版本 |
| `questionnaire_versions` | 发布/草稿版本 | 发布后不可变 |
| `quiz_questions` | 问题定义 | 复用已有表名 |
| `quiz_options` | 选项定义 | 复用已有表名 |
| `question_branch_rules` | 条件分支和 Block 动作 | 引用 question/option |
| `quiz_tag_mappings` | 选项到字段/标签的映射 | 可解释 |
| `profile_derivation_rules` | 多题推导规则 | 版本化 DSL |
| `quiz_submissions` | 用户问卷草稿/提交 | 绑定问卷版本 |
| `quiz_answers` | 规范化答案 | 一题一条或多条选项 |
| `user_training_profile_versions` | 长期画像快照 | 绑定 submission |
| `user_profile_fields` | 画像字段和来源 | 一字段一行，便于查询 |
| `user_tags` | 画像标签事实 | 绑定 profile version |
| `course_profile_versions` | 课程档案快照 | 绑定 taxonomy |
| `course_profile_fields` | 课程规范字段 | 可筛选、可审核 |
| `course_tag_evidence` | 标签证据/视频时间段 | 支持 AI 和人工审阅 |
| `user_segments` | 分组定义 | 规则 DSL |
| `segment_memberships` | 分组成员快照 | 可异步刷新 |
| `recommendation_rule_versions` | 过滤/排序规则 | 不可变发布版本 |
| `recommendation_decisions` | 推荐决策追踪 | 只追加 |
| `decision_exclusions` | 候选排除原因 | 多条对应一个 decision |
| `profile_consents` | 敏感数据同意/撤回 | 审计必需 |

### 4.3 表字段设计

#### `taxonomy_versions`

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| `id` | uuid PK | |
| `version` | varchar(32) | 唯一，例如 `taxonomy_v1.0.0` |
| `status` | varchar(16) | `draft`、`published`、`deprecated` |
| `definition_hash` | varchar(64) | 内容 hash |
| `published_at` | timestamptz | |
| `published_by` | uuid | 后台管理员 |
| `created_at` / `updated_at` | timestamptz | |

#### `tag_groups`

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| `id` | uuid PK | |
| `taxonomy_version_id` | uuid FK | |
| `group_key` | varchar(64) | 版本内唯一 |
| `parent_id` | uuid/null | 支持树形分组 |
| `display_name` | jsonb | `{"zh-CN":"身体限制","en-US":"Movement Constraint"}` |
| `sort_order` | integer | |
| `visibility` | varchar(16) | `admin`、`user`、`internal` |
| `created_at` / `updated_at` | timestamptz | |

#### `tags`

| 字段 | 类型 | 约束/说明 |
|---|---|---|
| `id` | uuid PK | |
| `taxonomy_version_id` | uuid FK | |
| `tag_key` | varchar(128) | 版本内唯一；如 `constraint:knee` |
| `tag_group_key` | varchar(64) | 冗余便于查询，必须引用分组 |
| `scope` | varchar(16) | `user`、`course`、`both`、`system` |
| `decision_layer` | varchar(24) | `hard_filter`、`context`、`soft_preference`、`system` |
| `value_type` | varchar(16) | `boolean`、`enum`、`integer`、`decimal`、`string`、`set` |
| `sensitivity` | varchar(16) | `normal`、`sensitive`、`restricted` |
| `unknown_policy` | varchar(32) | 默认缺失策略 |
| `display_name` / `description` | jsonb | 多语言 |
| `source_field_keys` | jsonb | 字段依赖 |
| `is_user_visible` | boolean | |
| `status` | varchar(16) | |
| `created_at` / `updated_at` | timestamptz | |

唯一约束：`UNIQUE (taxonomy_version_id, tag_key)`。已发布版本禁止修改 `tag_key`、`scope`、`decision_layer`、`value_type`。

#### `questionnaires` / `questionnaire_versions`

| 表 | 字段 | 说明 |
|---|---|---|
| `questionnaires` | `id`, `code`, `questionnaire_type`, `status` | `code=onboarding`；保留主实体 |
| `questionnaire_versions` | `id`, `questionnaire_id`, `version`, `taxonomy_version_id` | 绑定字典 |
|  | `status` | `draft`、`pending_review`、`published`、`archived` |
|  | `min_client_version` | 移动端兼容门槛 |
|  | `definition_hash` | 问卷定义 hash |
|  | `published_at`, `published_by` | 发布信息 |
|  | `privacy_notice_version`, `consent_version` | 敏感信息说明 |

#### `quiz_questions`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | uuid PK | |
| `questionnaire_version_id` | uuid FK | |
| `question_key` | varchar(32) | `Q01`–`Q15`，分支题用 `L1_Q01` |
| `field_key` | varchar(128) | 规范输入字段，可为空 |
| `question_type` | varchar(24) | `single`、`multi`、`number`、`date`、`text` |
| `display_order` | integer | |
| `required` | boolean | 允许由分支规则覆盖 |
| `sensitive_level` | varchar(16) | `normal`、`sensitive`、`restricted` |
| `help_text` | jsonb | 数据用途和提示 |
| `validation_json` | jsonb | 范围、最大选择数、格式 |
| `status` | varchar(16) | |

#### `quiz_options`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | uuid PK | |
| `question_id` | uuid FK | |
| `option_key` | varchar(64) | 稳定值，如 `avoid_jump` |
| `display_text` | jsonb | 前端展示 |
| `semantic_value` | jsonb | 规范化值；不让客户端猜含义 |
| `display_order` | integer | |
| `is_unknown` | boolean | “不确定”与普通选项区分 |
| `is_prefer_not_to_answer` | boolean | “不愿回答”与 unknown 区分 |
| `status` | varchar(16) | |

#### `question_branch_rules`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | uuid PK | |
| `questionnaire_version_id` | uuid FK | |
| `rule_key` | varchar(128) | 稳定规则 key |
| `condition_json` | jsonb | 只允许受限 DSL，不执行脚本 |
| `action` | varchar(24) | `show`、`hide`、`require`、`skip`、`block`、`notice` |
| `target_question_keys` | jsonb | 目标问题 |
| `reason_code` | varchar(64) | 例如 `PREGNANCY_V1_BLOCK` |
| `display_copy_key` | varchar(128) | 文案 key |
| `priority` | integer | 冲突裁决 |

#### `quiz_submissions` / `quiz_answers`

`quiz_submissions`：

| 字段 | 说明 |
|---|---|
| `id` | submission ID |
| `user_id` | 用户 ID |
| `questionnaire_version_id` | 本次作答版本 |
| `status` | `draft`、`validating`、`submitted`、`blocked`、`superseded` |
| `revision` | 乐观锁版本，PATCH 必须带 `If-Match` |
| `answers_snapshot` | jsonb；提交时不可变快照 |
| `completion_percent` | 展示进度，不作为业务事实 |
| `started_at`, `submitted_at`, `created_at`, `updated_at` | 时间 |
| `idempotency_key` | 提交幂等键；同用户同版本唯一 |

`quiz_answers`：

| 字段 | 说明 |
|---|---|
| `submission_id`, `question_id` | 复合关系 |
| `question_key` | 冗余快照，便于审计 |
| `value_json` | 数字、日期、单选或多选值 |
| `is_skipped` | 是否跳过 |
| `skip_reason` | `unknown`、`prefer_not_to_answer`、`not_applicable` |
| `answered_at` | |

#### `user_training_profile_versions`

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid/bigint | |
| `version` | varchar(32) | 用户内递增或 `utp_v1.0.0` |
| `source_submission_id` | uuid | 原始问卷提交 |
| `questionnaire_version_id` | uuid | |
| `taxonomy_version_id` | uuid | |
| `derivation_rule_version` | varchar(32) | |
| `profile_json` | jsonb | 全量快照；不作为唯一查询源 |
| `recommendation_status` | varchar(24) | `ready`、`incomplete`、`blocked`、`manual_review` |
| `profile_hash` | varchar(64) | |
| `effective_from` / `effective_to` | timestamptz | |
| `created_at` | timestamptz | |

#### `user_profile_fields`

用于后台筛选、解释和数据分析的规范化字段表：

| 字段 | 说明 |
|---|---|
| `profile_version_id`, `user_id` | 关系 |
| `field_key` | 例如 `fitness_capacity` |
| `value_json` | 实际字段值 |
| `value_text`, `value_numeric`, `value_date` | 可选投影列，便于索引 |
| `source_question_key` | 例如 `Q06` |
| `source_answer_id` | 原始答案 ID |
| `derivation_rule_key` | 多题推导时记录 |
| `confidence` | 0–1 |
| `sensitivity` | 与字典一致 |
| `created_at` | |

唯一约束：`UNIQUE (profile_version_id, field_key)`。

#### `user_tags`（在现有表上扩展）

| 字段 | 说明 |
|---|---|
| `user_id`, `tag_id` | 关系 |
| `profile_version_id` | 标签属于哪个长期画像版本 |
| `state` | `active`、`unknown`、`suppressed`、`expired` |
| `value_json` | 严重程度、数组或附加值 |
| `source_type`, `source_id` | 来源追踪 |
| `source_question_key` | Q08、L6 等 |
| `confidence` | |
| `effective_from`, `effective_to` | 生命周期/短期有效期 |
| `created_by`, `created_at` | |

当前有效查询建议：`WHERE user_id=? AND profile_version_id=? AND state='active' AND (effective_to IS NULL OR effective_to > now())`。

#### `course_profile_versions` / `course_profile_fields`

课程档案必须和用户档案使用同一 `taxonomy_version_id`：

| 字段 | 说明 |
|---|---|
| `course_profile_versions.id`, `course_id`, `version` | 课程档案版本 |
| `taxonomy_version_id` | 字典版本 |
| `status` | `draft`、`pending_review`、`approved`、`published`、`offline` |
| `profile_json` | 全量快照 |
| `safety_completeness` | `complete`、`incomplete`、`blocked` |
| `created_by`, `approved_by`, `published_at` | 审核发布 |
| `course_profile_fields.field_key` | 使用第 2.4 节字段 |
| `value_json` | 规范值 |
| `source` | `ai`、`excel`、`manual` |
| `confidence` | AI/人工证据置信度 |
| `review_status` | `pending`、`accepted`、`modified`、`rejected` |

#### `course_tag_evidence`

| 字段 | 说明 |
|---|---|
| `course_profile_field_id` | 对应课程字段 |
| `start_ms`, `end_ms` | 视频证据时间区间 |
| `basis` | `movement_observed`、`coach_text`、`metadata`、`manual_note` |
| `evidence_text` | 证据摘要 |
| `model_run_id` | AI 运行 ID |
| `created_by`, `created_at` | |

#### `user_segments` / `segment_memberships`

`user_segments`：`id`、`name`、`description`、`rule_json`、`rule_version`、`sensitivity_scope`、`status`、`estimated_count`、`refreshed_at`、`created_by`。  
`segment_memberships`：`segment_id`、`segment_version`、`user_id`、`matched_at`、`membership_hash`。

#### `recommendation_decisions` / `decision_exclusions`

| 表 | 关键字段 |
|---|---|
| `recommendation_decisions` | `id`、`user_id`、`local_date`、`stage`（`plan`/`replan`/`daily_adapt`）、`profile_version_id`、`course_profile_version_ids`、`questionnaire_version`、`taxonomy_version`、`rule_version_matrix`、`result_json`、`reason_codes`、`trace_id`、`created_at` |
| `decision_exclusions` | `decision_id`、`course_id`、`rule_key`、`reason_code`、`decision_layer`、`details_json` |

历史解释必须从这些快照读取，不从当前最新标签重新计算。

### 4.4 索引和约束

```sql
CREATE UNIQUE INDEX uq_tags_version_key
  ON tags (taxonomy_version_id, tag_key);

CREATE INDEX idx_user_tags_current
  ON user_tags (user_id, profile_version_id, state, tag_id)
  WHERE state = 'active';

CREATE INDEX idx_profile_fields_lookup
  ON user_profile_fields (field_key, value_text, value_numeric);

CREATE INDEX idx_submission_user_status
  ON quiz_submissions (user_id, status, updated_at DESC);

CREATE INDEX idx_decision_user_day
  ON recommendation_decisions (user_id, local_date DESC, stage);

ALTER TABLE quiz_options
  ADD CONSTRAINT quiz_options_unknown_distinct
  CHECK (NOT (is_unknown AND is_prefer_not_to_answer));
```

敏感字段建议：普通画像字段与受限字段分区或至少分列存储；手机号、医疗/医嘱自由文本等需要加密或脱敏。后台查看完整敏感字段必须二次确认并写 `audit_logs`。

## 5. API 设计

### 5.1 统一协议

Base URL：

- 移动端：`/api/v1/app`
- Web 管理后台：`/api/v1/admin`

统一响应：

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "request_id": "req_01...",
  "meta": {"api_version": "v1"}
}
```

错误码建议：

| code | 含义 |
|---|---|
| `40001` | 参数错误 |
| `40101` | 未登录或 token 失效 |
| `40301` | 无权限 |
| `40401` | 资源不存在 |
| `40901` | revision/幂等/状态冲突 |
| `42201` | 业务校验失败 |
| `42211` | 推荐被安全阻断 |
| `42212` | 无安全候选课程 |
| `42901` | 限流 |
| `50001` | 内部错误 |

写接口：

- 支持 `Idempotency-Key`，特别是提交问卷、确认 Check-in、触发 Re-plan、发布版本、批量打标签。
- 草稿更新使用 `If-Match: <revision>`；冲突返回 `40901` 和服务端最新 revision。
- 异步任务统一返回 `job_id`、`status`：`queued`、`processing`、`partially_ready`、`success`、`failed`。

### 5.2 移动端 Onboarding API

| Method | Path | 用途 |
|---|---|---|
| `GET` | `/onboarding/active` | 返回当前发布问卷、分支、字典版本和隐私说明 |
| `POST` | `/onboarding/submissions` | 创建草稿；返回 `submission_id`、`revision` |
| `GET` | `/onboarding/submissions/{id}` | 恢复草稿 |
| `PATCH` | `/onboarding/submissions/{id}` | 保存一个或多个答案 |
| `POST` | `/onboarding/submissions/{id}/validate` | 提交前校验必答、冲突、Block |
| `POST` | `/onboarding/submissions/{id}/submit` | 生成画像任务；幂等 |
| `GET` | `/onboarding/profile` | 当前有效 `User Training Profile` 摘要 |
| `GET` | `/onboarding/profile/versions` | 用户查看历史版本 |
| `POST` | `/onboarding/profile/preview` | 修改前预览新画像，不落库 |
| `PATCH` | `/onboarding/profile/fields` | 用户主动修正字段，生成新版本 |

`GET /onboarding/active` 响应示例：

```json
{
  "questionnaire": {
    "code": "onboarding",
    "version": "onboarding_v1.0.0",
    "taxonomy_version": "taxonomy_v1.0.0",
    "privacy_notice_version": "privacy_v1.0.0",
    "questions": [
      {
        "question_key": "Q07",
        "field_key": "jump_tolerance",
        "question_type": "single",
        "required": true,
        "options": [
          {"option_key": "avoid", "display_text": "我希望避免跳跃"},
          {"option_key": "low", "display_text": "少量可以"},
          {"option_key": "standard", "display_text": "没问题"},
          {"option_key": "unknown", "display_text": "不确定", "is_unknown": true}
        ]
      }
    ],
    "branch_rules": []
  }
}
```

`PATCH /onboarding/submissions/{id}` 请求示例：

```json
{
  "revision": 7,
  "answers": [
    {"question_key": "Q03", "value": "postpartum_recovery"},
    {"question_key": "Q08", "value": ["pelvic_floor", "diastasis"]},
    {"question_key": "Q09", "value": "moderate"}
  ]
}
```

`POST /submit` 返回：

```json
{
  "submission_id": "sub_...",
  "status": "processing",
  "profile_job_id": "job_...",
  "questionnaire_version": "onboarding_v1.0.0"
}
```

处理完成后，客户端轮询 `GET /onboarding/profile` 或订阅现有任务通道。不要在移动端本地推导 `fitness_capacity`、Block 或推荐排序。

### 5.3 Daily Check-in 与计划 API

| Method | Path | 用途 |
|---|---|---|
| `GET` | `/daily-checkins/today` | 今天是否已填、可用选项和当前计划 |
| `POST` | `/daily-checkins/preview` | 生成 PUSH/SOFT/WARM 和动作预览，不立即确认 |
| `POST` | `/daily-checkins/{id}/confirm` | 确认状态和今日调整 |
| `GET` | `/plans/current` | 当前 30 天计划摘要 |
| `GET` | `/plans/{id}/days/{date}` | 当日原计划、备选、调整解释 |
| `POST` | `/cycle-facts` | 用户确认实际周期事实 |
| `GET` | `/replans/{id}` | Re-plan 进度和未来 diff |
| `POST` | `/plans/{id}/replan` | 由长期档案/周期事实变化触发未来重排 |

Daily Adapt 请求必须带 `preview_id` 和 `preview_revision`，服务端发现过期返回 `PREVIEW_STALE`，客户端重新预览，不得直接提交旧预览。

动作枚举：`KEEP`、`ADJUST`、`REPLACE`、`REST`。`PUSH`、`SOFT`、`WARM` 是当天状态，不与周期阶段合并。

### 5.4 管理后台 API

#### 标准字典与问卷

| Method | Path | 用途 |
|---|---|---|
| `GET/POST` | `/taxonomy/versions` | 查看/创建字典版本 |
| `GET/POST` | `/taxonomy/versions/{id}/groups` | 标签分组树 |
| `GET/POST` | `/taxonomy/versions/{id}/tags` | 标签字典 |
| `PUT` | `/taxonomy/tags/{id}` | 编辑 draft 标签 |
| `POST` | `/taxonomy/versions/{id}/validate` | 引用、值域、弃用校验 |
| `POST` | `/taxonomy/versions/{id}/publish` | 发布字典版本 |
| `GET/POST` | `/quizzes` | 问卷主实体 |
| `POST` | `/quizzes/{id}/versions` | 创建新版本 |
| `GET/POST` | `/quizzes/{id}/questions` | 问题列表/新增 |
| `PUT` | `/questions/{id}` | 编辑问题 |
| `PUT` | `/questions/{id}/options/{option_id}` | 编辑选项 |
| `PUT` | `/questions/{id}/tag-mappings` | 选项到字段/标签映射 |
| `GET/POST` | `/questionnaire-versions/{id}/branch-rules` | 分支规则 |
| `POST` | `/questionnaire-versions/{id}/validate` | 可达性、死循环、Block 校验 |
| `POST` | `/questionnaire-versions/{id}/submit-review` | 提交评审 |
| `POST` | `/questionnaire-versions/{id}/publish` | 发布问卷版本 |

#### 用户、标签和分组

| Method | Path | 用途 |
|---|---|---|
| `GET` | `/users` | 用户列表，支持标签/画像/版本筛选 |
| `GET` | `/users/{id}` | 用户基本信息和脱敏画像 |
| `GET` | `/users/{id}/training-profile` | 当前画像、历史版本、来源 |
| `GET` | `/users/{id}/training-profile/trace` | 字段 → 题目 → 标签 → 规则链路 |
| `POST` | `/users/{id}/sensitive-reveal` | 二次确认后查看敏感字段 |
| `POST` | `/users/{id}/tags` | 单用户手工标签；必须记录 reason |
| `POST` | `/users/batch/tags` | 批量增加/移除标签 |
| `GET/POST` | `/segments` | 分组列表/创建 |
| `GET/PUT` | `/segments/{id}` | 查看/更新 draft 分组 |
| `POST` | `/segments/{id}/estimate` | 人数预估 |
| `POST` | `/segments/{id}/refresh` | 异步刷新成员快照 |
| `GET` | `/segments/{id}/members` | 成员列表，受敏感权限限制 |
| `POST` | `/users/export` | 脱敏、加水印、短期下载 URL |

#### 课程标签、规则和模拟

| Method | Path | 用途 |
|---|---|---|
| `GET/POST` | `/courses/{id}/profile-versions` | 课程档案版本 |
| `PUT` | `/course-profile-fields/{id}` | 编辑字段 |
| `GET` | `/course-profile-versions/{id}/evidence` | 查看视频证据 |
| `POST` | `/course-profile-versions/{id}/submit-review` | 提交审核 |
| `POST` | `/course-profile-versions/{id}/approve` | 安全字段终审 |
| `GET/POST` | `/recommendation/rule-sets` | 规则集 |
| `POST` | `/recommendation/rule-sets/{id}/versions` | 创建 draft 规则 |
| `POST` | `/recommendation/rule-versions/{id}/validate` | DSL 静态校验和影响预估 |
| `POST` | `/recommendation/rule-versions/{id}/publish` | 发布规则 |
| `POST` | `/recommendation/simulations` | Plan/Re-plan/Daily Adapt/Combined 模拟 |
| `GET` | `/recommendation/simulations/{id}` | 模拟结果和命中解释 |
| `GET` | `/recommendation/decisions/{id}` | 生产决策追踪 |

### 5.5 推荐决策响应最小结构

```json
{
  "decision_id": "dec_...",
  "stage": "daily_adapt",
  "local_date": "2026-09-02",
  "input_versions": {
    "profile_version": "utp_12",
    "taxonomy_version": "taxonomy_v1.0.0",
    "rule_version": "rules_v1.2.0",
    "course_profile_versions": ["cp_91_v3", "cp_44_v2"]
  },
  "result": {
    "state": "SOFT",
    "action": "REPLACE",
    "primary_course_id": "course_91",
    "backup_course_ids": ["course_44", "course_17"]
  },
  "reason_codes": ["LOW_ENERGY", "KEEP_TRAINING_INTENT", "LOWER_IMPACT"],
  "explanations": [
    {"key": "daily_energy_low", "params": {"from": "standard", "to": "low"}}
  ]
}
```

## 6. Web 管理后台设计

### 6.1 信息架构

```text
工作台
├─ 推荐系统健康度
标准与问卷
├─ 标签/字段标准字典
├─ Onboarding 版本
├─ 分支流程图
└─ User Profile 推导规则
课程中心
├─ Course Profile
├─ AI/Excel 打标任务
├─ 标签审核队列
└─ 字段覆盖率与缺口
用户与分组
├─ 用户列表
├─ 用户 Training Profile
├─ 用户标签与来源追踪
└─ Segment 分组
推荐系统
├─ Hard Filter / Priority
├─ Plan / Re-plan / Daily Adapt
├─ 模拟与回归
├─ 发布与回滚
└─ 推荐决策追踪
系统
├─ 权限与角色
├─ 敏感字段访问记录
└─ 审计日志
```

### 6.2 页面和功能要求

#### A. 标签/字段标准字典

页面必须同时展示：`tag_key`、中文/英文名称、语义分组、决策层、scope、值类型、unknown 策略、敏感级别、来源字段、被哪些问卷/规则引用。

操作：

- draft 中可新增、复制、弃用；已发布 technical key 不可修改。
- 弃用必须指定 `replacement_tag_key`，并检查问卷、课程档案、分组、规则引用。
- “预览影响”列出受影响的客户端最低版本、规则数量、课程缺口和用户分组。
- 不允许普通运营直接调整安全标签的 Hard Filter 语义。

#### B. Onboarding 版本编辑器

采用“题目树 + 预览 + 字段/标签映射”的三栏布局：

- 左：Q01–Q15 和 L1–L9 分支树；显示必答、敏感、Block、未完成状态。
- 中：移动端题目预览；单选/多选/数字/日期交互和进度。
- 右：`field_key`、`option_key`、标签映射、来源题目、unknown 策略、展示条件。

发布前自动检查：

- 所有问题有稳定 `question_key`；所有选项有稳定 `option_key`。
- 不存在不可达必答题、死循环、无出口分支。
- Q12 器械题不进入用户 Profile 和 V1 主匹配。
- Q06 只产生 `fitness_capacity=L1–L5`，不生成自由的 Fitness Level 文案值。
- `PREGNANT` 触发 `PREGNANCY_V1_BLOCK`。
- `unknown`、`prefer_not_to_answer`、`no` 的语义没有混用。
- 所有敏感问题存在用途说明和可跳过策略。

#### C. User Profile 推导工作台

输入固定测试回答，后台显示：

- 原始答案；
- 规范化字段；
- 派生标签及 `decision_layer`；
- 每个字段的来源题目、推导规则、版本和置信度；
- Hard Filter 命中、缺失安全字段、`recommendation_status`；
- 生成的候选课程及排除原因。

禁止继续使用单一“测评分数/长报告”作为后台事实源。

#### D. 用户列表与详情

用户列表支持：

- 基本筛选：ID、昵称、注册时间、活跃时间、App 版本。
- 画像筛选：`primary_goal`、`fitness_capacity`、`preferred_duration_min`、`life_stage`、`recommendation_status`。
- 标签筛选：按 `tag_group_key`、`tag_key`、`state`、`source_type`。
- 敏感筛选/导出：单独权限、二次确认、审计、脱敏和水印。

用户详情分 Tab：

1. 基本资料；
2. `User Training Profile` 当前版本；
3. 画像字段来源追踪；
4. 标签分组和有效期；
5. Onboarding 原始答案（默认掩码）；
6. 30 天计划、主备候选和推荐决策；
7. Daily Check-in 与周期事实；
8. 审计和敏感访问记录。

详情中必须区分“用户明确回答”“系统推导”“后台手工标记”“当日临时状态”。

#### E. Segment 分组

创建分组时用条件构建器生成 DSL，支持：

- AND/OR 嵌套；
- 标签 active/unknown/not exists；
- 画像字段等于/包含/范围；
- 时间条件，如 `completed_at within 30d`；
- 敏感条件权限校验；
- 预估人数、命中样例、条件解释。

成员页面显示“命中条件摘要”，不允许把静态标签复制成永久用户属性。

#### F. Course Profile 与标签审核

三栏审核：视频/时间轴证据、结构化字段、字典定义和历史版本。

- `Overall Intensity`、`Impact Load`、`Knee Load`、`Wrist Bearing`、`Lower Back Load`、`Shoulder Load`、`Jump Level` 等安全字段必须终审。
- 字段可逐个接受、修改、设为 unknown 或退回重跑。
- 缺少关键安全字段时显示“不可进入相关候选集”，而不是默认低风险。
- `塑形`只能作为 `tone_contribution` 或目标相关字段，不要继续当作 `Secondary Workout Type`。

#### G. 规则、模拟、发布与回滚

规则编辑器使用受限 JSON DSL/决策表，不允许运行任意脚本。每条规则显示：

- 输入字段和标签；
- 输出动作和原因码；
- 决策层；
- unknown 行为；
- 影响范围和命中统计；
- 前后依赖；
- 示例用户与课程。

发布流程：`draft → pending_review → published → archived`。安全规则至少双人评审；编辑人与审批人不能是同一人。发布前必须跑回归夹具：普通用户、低能力、膝限制、产后、周期不规律、孕期 Block、矛盾回答、缺失回答。

### 6.3 Web 前端实现建议

- React + TypeScript；表单使用 `react-hook-form + zod`。
- 服务端状态使用 TanStack Query；不要把画像和规则数据长期放在全局 store。
- 从 OpenAPI 生成 `generated.ts`；从共享 `domain-contracts` 生成枚举和 Zod schema。
- 所有页面支持 `loading / ready / empty / blocked / stale / error`；异步任务增加 `queued / processing / partially_ready / failed`。
- 所有发布、批量打标签、敏感查看、导出、重排操作必须有权限校验、二次确认、幂等键和成功后审计。

## 7. 移动端设计

### 7.1 Onboarding 交互

- 单题一屏或小组一屏；自动保存；返回不丢失；退出后可继续。
- 分支只显示相关题；分支变化时进度条不出现倒退感。
- 不要求用户自评抽象 Fitness Level；Q05 + Q06 由服务端推导 `fitness_capacity`。
- Q08 选中限制后显示 Q09；持续/严重疼痛只展示安全提示，不作诊断。
- 进入敏感问题前展示用途、最小化收集、可跳过/修改/删除说明。
- 孕期选择进入清晰的 Block 页面；允许返回修改误选，不继续收集无用途的详细信息。

### 7.2 客户端状态机

```text
idle
  → loading_definition
  → editing_draft
  → validating
  → validation_error
  → submitting
  → profile_processing
  → profile_ready | profile_blocked | profile_manual_review | failed
```

本地只缓存：当前草稿答案、`submission_id`、`revision`、问卷版本、未上传事件。不要在客户端缓存完整敏感画像到明文日志或埋点。

### 7.3 客户端与服务端边界

客户端负责：展示题目、收集答案、基础格式校验、分支页面渲染、进度显示、网络重试。  
服务端负责：字段规范化、推导标签、Hard Filter、推荐排序、Block、解释文案 key、画像版本和推荐日志。

服务端返回的 `reason_code` 由客户端映射为多语言文案；客户端不重复实现规则。

### 7.4 隐私和用户自助能力

“我的”中至少提供：

- 查看当前 `User Training Profile` 摘要；
- 修改年龄/目标/能力/限制/生命周期等字段；
- 查看哪些信息用于推荐；
- 导出个人数据；
- 申请删除或撤回敏感信息同意；
- 查看推荐解释和版本更新时间。

撤回敏感信息后，画像生成新版本并按保守策略处理；不删除推荐历史快照，除非执行合法删除流程。

## 8. 多项目共享与工程落地

建议仓库/包结构：

```text
packages/
  domain-contracts/
    enums.ts
    onboarding.schema.ts
    profile.schema.ts
    course-profile.schema.ts
    recommendation.schema.ts
  taxonomy/
    taxonomy-v1.0.0.json
    tag-groups.json
    field-definitions.json
  api-client/
    app-client.ts
    admin-client.ts
  copy-keys/
    zh-CN.json
    en-US.json
services/
  profile-derivation/
  recommendation-engine/
apps/
  admin-web/
  mobile/
```

### 8.1 单一事实源

推荐顺序：

1. 产品字段和枚举进入 `taxonomy` / `domain-contracts`；
2. 后端用 OpenAPI 描述资源和错误码；
3. Web 和移动端生成类型和校验器；
4. 数据库迁移由后端维护；
5. 推荐服务只读取已发布版本；
6. 后台编辑器只能生成 draft，发布后成为不可变版本。

### 8.2 版本矩阵

每次画像或推荐都记录：

```json
{
  "questionnaire_version": "onboarding_v1.0.0",
  "taxonomy_version": "taxonomy_v1.0.0",
  "derivation_rule_version": "profile_rules_v1.0.0",
  "course_profile_version": "course_profile_v1.0.0",
  "recommendation_rule_version": "recommendation_rules_v1.0.0",
  "client_version": "ios_1.0.0"
}
```

发布兼容策略：客户端可以向后兼容读取新题目中的未知字段，但不能猜测新枚举含义；若 `min_client_version` 不满足，后台发布时必须阻断或提示强制升级。

## 9. 安全、权限、审计与可观测性

### 9.1 权限点

建议最小权限：

- `taxonomy:read` / `taxonomy:write` / `taxonomy:publish`
- `questionnaire:read` / `questionnaire:write` / `questionnaire:publish`
- `profile:read` / `profile:sensitive_read`
- `tags:read` / `tags:write` / `tags:batch_write`
- `segments:read` / `segments:write` / `segments:sensitive`
- `course_profile:read` / `course_profile:review` / `course_profile:publish`
- `recommendation_rules:read` / `recommendation_rules:write` / `recommendation_rules:publish`
- `recommendation:simulate` / `recommendation:decision_trace`
- `data:export` / `audit:read`

### 9.2 审计事件

至少记录：敏感字段查看、问卷发布、标签弃用、批量打标签、分组导出、课程安全字段修改、规则发布/回滚、画像人工修正、用户数据导出/删除。

审计字段：`admin_id`、`action`、`object_type`、`object_id`、`before_json`、`after_json`、`reason`、`ip`、`request_id`、`created_at`。审计日志只追加，不允许后台删除。

### 9.3 推荐可观测指标

- Profile 生成成功率、阻断率、缺失字段率、unknown 率；
- 课程安全字段完整率、待审队列积压、审核平均时长；
- `NO_SAFE_COURSE_MATCH` 比例；
- Hard Filter 各 `reason_code` 命中量；
- Plan / Re-plan / Daily Adapt 成功率和耗时；
- 推荐结果中 Keep/Adjust/Replace/Rest 分布；
- 版本发布后候选覆盖率和安全回归差异。

## 10. 测试与验收

### 10.1 数据契约测试

- 所有 `question_key`、`option_key`、`tag_key`、`field_key` 稳定且唯一。
- OpenAPI 示例能被共享 schema 解析。
- `unknown`、`no`、`prefer_not_to_answer` 三者在 API、DB、Web、移动端一致。
- 发布版本不可更新；只能复制新 draft。

### 10.2 问卷分支测试

必须覆盖：

- 普通用户无生命周期分支；
- 周期规律、不规律、激素避孕、备孕；
- 孕期 Block、无许可、警示症状；
- 产后早期、已许可、盆底/腹直肌分离、警示症状；
- 围绝经、绝经后限制、多囊 Context；
- 返回、退出恢复、重复提交、并发 revision 冲突；
- Q04 跳过、Q12 不展示、Q14 最多选择约束。

### 10.3 标签和推荐回归

固定夹具至少包含：

| 夹具 | 预期 |
|---|---|
| `normal_beginner` | `fitness_capacity=L1/L2`，低负荷候选优先 |
| `fat_loss_steady` | 减脂贡献排序高，但安全优先 |
| `knee_moderate_no_jump` | 高 `knee_load`/高冲击课程过滤 |
| `postpartum_10w_clearance_yes` | 产后阶段+许可+症状联合判断 |
| `postpartum_clearance_unknown` | 不进入常规计划，展示提示 |
| `pregnant` | `recommendation_status=blocked` |
| `irregular_cycle` | 周期阶段推断低置信，更多依赖 Check-in |
| `contradictory_answers` | 进入校验错误或 conservative/manual review |
| `missing_safety_fields` | 不以“低强度兜底”，显示缺失/阻断原因 |

### 10.4 端到端验收

验收必须能从一条用户链路还原：

```text
Q08 选中 pelvic_floor
  → movement_limitations=[pelvic_floor]
  → tag constraint:pelvic_floor + severity:moderate
  → Hard Filter 命中课程 A 的 pelvic_floor_load=high
  → 课程 A 被排除，课程 B 进入候选
  → 推荐解释包含 reason_code 和版本矩阵
```

## 11. 实施顺序

### Phase 1：契约与基础数据

- 冻结 `field_key`、枚举、`tag_group_key`、`tag_key`；
- 建 `taxonomy_versions`、问卷版本、答案、画像和标签表；
- 建共享 schema 和 OpenAPI；
- 完成 Q01–Q15、L1–L9 的配置化定义。

### Phase 2：画像与移动端 Onboarding

- 完成草稿、分支、校验、提交、画像异步任务；
- 完成 `fitness_capacity`、安全标签和 Block；
- 移动端只消费服务端定义和 reason code；
- 建立画像来源追踪。

### Phase 3：Course Profile 与推荐服务

- 课程安全标签字段和审核队列；
- Hard Filter / Context / Soft 排序；
- 决策日志、主备候选、解释和回放；
- Daily Check-in 与 Re-plan 分离。

### Phase 4：Web 管理后台

- 字典、问卷、画像推导工作台；
- 用户画像/标签/Segment；
- 课程标签审核；
- 规则模拟、回归、发布与回滚。

### Phase 5：灰度与治理

- 使用固定夹具和脱敏生产样本灰度；
- 监控 `NO_SAFE_COURSE_MATCH`、阻断率和规则漂移；
- 每次版本变更生成差异报告；
- 旧字段和旧问卷保留只读兼容期，再按迁移计划下线。

## 附录 A：开发前必须冻结的枚举

### A.1 决策层

`hard_filter` · `context` · `soft_preference` · `system`

### A.2 来源

`onboarding_answer` · `derived_rule` · `daily_checkin` · `admin_manual` · `import`

### A.3 状态

标签：`active` · `unknown` · `suppressed` · `expired`  
画像：`ready` · `incomplete` · `blocked` · `manual_review`  
问卷/规则/课程版本：`draft` · `pending_review` · `published` · `archived`  
当天状态：`PUSH` · `SOFT` · `WARM`  
当天动作：`KEEP` · `ADJUST` · `REPLACE` · `REST`

### A.4 必须保留的“不确定”语义

| 场景 | 正确值 | 不要替换成 |
|---|---|---|
| 用户不确定跳跃耐受 | `jump_tolerance=unknown` | `avoid` 或 `standard` |
| 用户未确认运动许可 | `clearance=unknown` | `no` 或 `yes` |
| 用户不愿回答敏感问题 | `prefer_not_to_answer` | 空字符串 |
| 无该分支问题 | `not_applicable` | `unknown` |

## 附录 B：字段与标签消费关系

| 用户字段/标签 | 课程字段 | 推荐动作 |
|---|---|---|
| `goal:fat_loss` | `fat_loss_contribution` | 候选集内排序 |
| `fitness_capacity:L1–L5` | `overall_intensity`、`cardio_load`、`muscular_load` | 能力匹配和排序 |
| `impact:no_jump` | `impact_load`、`jump_level` | 高频跳跃 Hard Filter |
| `constraint:knee` + `severity:moderate` | `knee_load` | 中高膝负荷过滤 |
| `constraint:wrist` | `wrist_bearing` | 手腕承重过滤或降权 |
| `constraint:back` | `lower_back_load` | 腰背高负荷过滤 |
| `constraint:shoulder` | `shoulder_load` | 肩部/过顶负荷过滤 |
| `pelvic_floor:flagged` | `pelvic_floor_load`、`impact_load`、`core_pressure` | 高冲击/高腹压过滤 |
| `diastasis:*` | `core_pressure`、`modification_available` | 优先可修改课程 |
| `life_stage:postpartum` | `postpartum_risk`、`postpartum_stage` | 阶段+许可+症状联合判断 |
| `cycle:*` | `cycle_risk` | 仅 Context/解释，不覆盖 Check-in |
| `format_pref:*` / `avoid:*` | `primary_workout_type`、`secondary_workout_type` | 同等安全候选内排序 |

## 附录 C：交付 Definition of Done

- [ ] 数据库迁移、索引、敏感字段权限已完成。
- [ ] OpenAPI、共享枚举、移动端和 Web 类型已同步。
- [ ] Q01–Q15 和 L1–L9 的分支可达性测试通过。
- [ ] 画像字段、标签、来源题目和推导规则可追踪。
- [ ] 孕期/产后/医嘱/警示症状安全测试通过。
- [ ] 课程关键安全标签终审通过，缺失字段不能进入相关候选集。
- [ ] 推荐决策能还原版本、过滤原因、排序分项和解释。
- [ ] Daily Check-in 只影响当天，Re-plan 只影响未来，历史不可变。
- [ ] Web 后台具备草稿、审核、发布、回滚和审计。
- [ ] 移动端具备断点恢复、revision 冲突处理、阻断页和隐私说明。
- [ ] 脱敏导出、敏感查看、删除/撤回流程已验收。

