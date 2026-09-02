/**
 * Onboarding 问卷需求文档 V1 结构化配置
 * 来源：NOT A PHASE Onboarding 问卷需求文档 V1（统一联动版）
 */

export type RuleType = 'Hard' | 'Soft' | 'Context' | 'Hard/Soft' | 'Hard/Context' | 'Context/Soft' | 'Context/Hard';

export interface QuestionDef {
  id: string;
  title: string;
  options: string;
  branch: string;
  backendField: string;
  userTags: string;
  courseTags: string;
  ruleType: RuleType;
  note: string;
  layer: 'A' | 'B' | 'C' | 'D' | 'E';
  required: boolean;
}

export interface LifecycleBranch {
  id: string;
  name: string;
  trigger: string;
  extraQuestions: string[];
  backendFields: string[];
  userTags: string[];
  courseConstraints: string[];
  ruleType: RuleType;
  note: string;
}

export interface PostpartumDetail {
  item: string;
  options: string;
  ruleOutput: string;
  courseAction: string;
}

export interface TagMapping {
  inputDomain: string;
  userTag: string;
  courseTag: string;
  ruleSummary: string;
  ruleType: RuleType;
}

export interface ProfileFieldGroup {
  group: string;
  example: string;
  requirement: string;
}

export interface CheckinBoundary {
  category: string;
  items: string[];
}

export const ONBOARDING_VERSION = 'onboarding_v1.0';
export const PROFILE_VERSION = 'v1';

export const RULE_PRIORITY = [
  { order: 1, name: 'Hard Filter', desc: '安全与明确禁忌优先；不满足即不进入候选集' },
  { order: 2, name: 'Context', desc: '在特定生命周期/身体情境下启用额外过滤或降级规则' },
  { order: 3, name: 'Soft Preference', desc: '在安全候选集内排序，兼顾目标、偏好、时长与可坚持性' },
];

export const CONFLICT_ORDER = 'Hard Filter > Context 安全规则 > Fitness Capacity / 时长 > 目标贡献 > 内容偏好';

export const FRAMEWORK_LAYERS = [
  { layer: 'A', name: '身体基础', scope: '年龄、身高体重、运动限制/不适', outputs: 'age_band、bmi_band（仅参考）、impact/joint constraints', usage: '安全边界与辅助分层' },
  { layer: 'B', name: '核心目标', scope: '减脂、塑形、健康生活、产后恢复', outputs: 'primary_goal、secondary_goal', usage: '决定月度计划结构和课程贡献排序' },
  { layer: 'C', name: '能力与偏好', scope: '频率、连续活动能力、跳跃耐受、时长、形式偏好', outputs: 'fitness_capacity、duration_pref、format_pref', usage: '负荷、形式和依从性匹配' },
  { layer: 'D', name: '女性生命周期', scope: '周期、避孕、备孕、孕期、产后、围绝经、绝经后、多囊', outputs: 'life_stage、cycle_context、pregnancy/postpartum context', usage: '启用阶段性适配和安全规则' },
  { layer: 'E', name: '输出层', scope: '以上字段合并', outputs: 'User Training Profile + recommendation constraints', usage: '月度计划、候选集过滤、排序与解释' },
];

export const MAIN_QUESTIONS: QuestionDef[] = [
  {
    id: 'Q01', title: '年龄', layer: 'A', required: true,
    options: '数字或年龄段：18–24 / 25–34 / 35–44 / 45–54 / 55+',
    branch: '否',
    backendField: 'age / age_band',
    userTags: 'age_band:*',
    courseTags: '不直接匹配；用于分析与生命周期提示',
    ruleType: 'Context',
    note: '年龄不得单独降低强度',
  },
  {
    id: 'Q02', title: '身高与体重', layer: 'A', required: true,
    options: 'cm、kg',
    branch: '否',
    backendField: 'height_cm / weight_kg / bmi',
    userTags: 'bmi_band:*',
    courseTags: '仅与 Fitness Capacity、Jump Tolerance、Body Limitation 联合影响 Impact Load / Jump Level / Knee Load 排序',
    ruleType: 'Context',
    note: 'BMI 非能力标签；不得单独定义「大基数」',
  },
  {
    id: 'Q03', title: '主要目标', layer: 'B', required: true,
    options: '减脂 / 塑形变紧实 / 健康生活与建立习惯 / 产后恢复（单选）',
    branch: '产后恢复 → L6',
    backendField: 'primary_goal',
    userTags: 'goal:fat_loss / tone / healthy_habit / postpartum_recovery',
    courseTags: 'goal_contribution:*',
    ruleType: 'Soft',
    note: '核心目标必答；产后同时触发 Context',
  },
  {
    id: 'Q04', title: '次要目标', layer: 'B', required: false,
    options: '同 Q03',
    branch: '否',
    backendField: 'secondary_goal',
    userTags: 'secondary_goal:*',
    courseTags: 'goal_contribution:*',
    ruleType: 'Soft',
    note: '不得与主要目标重复；可跳过',
  },
  {
    id: 'Q05', title: '过去4周运动频率', layer: 'C', required: true,
    options: '几乎不运动 / 每周1次 / 每周2–3次 / 每周4次+',
    branch: '否',
    backendField: 'exercise_frequency_4w',
    userTags: 'activity_base:low/mid/high',
    courseTags: 'difficulty；training_load',
    ruleType: 'Soft',
    note: '与 Q06 联合推导 fitness_capacity',
  },
  {
    id: 'Q06', title: '连续活动20分钟感受', layer: 'C', required: true,
    options: '很吃力 / 可完成但需要休息 / 比较轻松 / 轻松且可更久',
    branch: '否',
    backendField: 'continuous_activity_20m',
    userTags: 'Fitness Capacity L1–L5（V1 工作假设/待验证）',
    courseTags: 'Overall Intensity；Cardio Load',
    ruleType: 'Soft',
    note: '用户语言替代抽象 Fitness Level',
  },
  {
    id: 'Q07', title: '跳跃耐受', layer: 'C', required: true,
    options: '避免跳跃 / 少量可以 / 没问题 / 不确定',
    branch: '否',
    backendField: 'jump_tolerance',
    userTags: 'impact:no_jump/low/standard/unknown',
    courseTags: 'impact_level；jumping_frequency',
    ruleType: 'Hard/Soft',
    note: '「避免」= 过滤高冲击；「不确定」默认低冲击优先',
  },
  {
    id: 'Q08', title: '运动时身体限制', layer: 'A', required: true,
    options: '多选：膝 / 腰背 / 手腕承重 / 肩颈 / 盆底或漏尿 / 腹直肌分离 / 其他 / 无',
    branch: '有选择 → Q09',
    backendField: 'movement_limitations[]',
    userTags: 'constraint:knee/back/wrist/shoulder/pelvic_floor/diastasis',
    courseTags: 'knee_load；lower_back_load；wrist_bearing；overhead_load；core_pressure',
    ruleType: 'Hard/Context',
    note: '持续或严重疼痛提示就医；不作诊断',
  },
  {
    id: 'Q09', title: '限制程度', layer: 'A', required: true,
    options: '仅偶尔 / 会影响动作 / 医嘱限制运动',
    branch: '仅 Q08 非「无」显示',
    backendField: 'limitation_severity',
    userTags: 'severity:mild/moderate/medical',
    courseTags: 'contraindication；load level；modification_available',
    ruleType: 'Hard',
    note: '医嘱限制 → 不自动推荐并展示安全提示',
  },
  {
    id: 'Q10', title: '单次训练时长', layer: 'C', required: true,
    options: '10 / 15 / 20 / 30 / 40+ 分钟（可多选）',
    branch: '否',
    backendField: 'preferred_duration_min[]',
    userTags: 'duration_pref:*',
    courseTags: 'duration_min',
    ruleType: 'Soft',
    note: '可设置默认首选值',
  },
  {
    id: 'Q11', title: '每周计划频率', layer: 'C', required: true,
    options: '2 / 3 / 4 / 5+ 天',
    branch: '否',
    backendField: 'planned_days_per_week',
    userTags: 'frequency_pref:*',
    courseTags: 'program_frequency / recovery_spacing',
    ruleType: 'Soft',
    note: '用于计划结构，不作为单课过滤',
  },
  {
    id: 'Q12', title: '器械（V1 取消）', layer: 'C', required: false,
    options: '不展示',
    branch: '否',
    backendField: '无',
    userTags: '无',
    courseTags: '课程侧器械仅作展示/运营元数据',
    ruleType: 'Context',
    note: '器械不作为用户输入或 V1 主匹配条件',
  },
  {
    id: 'Q13', title: '喜欢的训练方式', layer: 'C', required: true,
    options: '步行/低冲击有氧 / 舞蹈 / 力量 / 普拉提瑜伽 / 拉伸恢复 / 混合（最多3项）',
    branch: '否',
    backendField: 'preferred_formats[]',
    userTags: 'format_pref:*',
    courseTags: 'workout_format / modality',
    ruleType: 'Soft',
    note: '偏好只排序，不覆盖安全规则',
  },
  {
    id: 'Q14', title: '不喜欢/希望避免', layer: 'C', required: true,
    options: '同 Q13 + 跳跃 / 地面动作 / 快速转向（多选）',
    branch: '否',
    backendField: 'avoid_formats[]',
    userTags: 'avoid:*',
    courseTags: 'workout_format / impact / floor_work / coordination',
    ruleType: 'Hard/Soft',
    note: '避免与「禁忌」需区分；明确疼痛相关转 Hard',
  },
  {
    id: 'Q15', title: '女性生命周期', layer: 'D', required: true,
    options: '规律周期 / 周期不规律 / 激素避孕 / 备孕 / 孕期 / 产后 / 围绝经 / 绝经后 / 不确定 / 不愿回答',
    branch: '按选择进入 L1–L9',
    backendField: 'life_stage',
    userTags: 'life_stage:*',
    courseTags: 'female_life_stage_suitability',
    ruleType: 'Context',
    note: '允许跳过；多状态按优先级进入相应分支',
  },
];

export const LIFECYCLE_BRANCHES: LifecycleBranch[] = [
  {
    id: 'L1', name: '规律周期', trigger: 'Q15 = 规律周期',
    extraQuestions: ['最近一次月经首日', '平均周期长度（可选）'],
    backendFields: ['last_period_date', 'avg_cycle_days'],
    userTags: ['cycle:regular', 'phase_estimate'],
    courseConstraints: ['cycle_phase_suitability'],
    ruleType: 'Context',
    note: '仅用于估算；不宣称精确排卵/激素水平',
  },
  {
    id: 'L2', name: '周期不规律', trigger: 'Q15 = 周期不规律',
    extraQuestions: ['周期通常差异', '最近一次月经（均可跳过）'],
    backendFields: ['cycle_variability', 'last_period_date'],
    userTags: ['cycle:irregular'],
    courseConstraints: ['cycle_phase_suitability=low_confidence'],
    ruleType: 'Context',
    note: '降低阶段推断权重；更多依赖 Daily Check-in',
  },
  {
    id: 'L3', name: '激素避孕', trigger: 'Q15 = 激素避孕',
    extraQuestions: ['方式：口服/宫内/植入/注射/其他/不愿回答'],
    backendFields: ['hormonal_contraception_type'],
    userTags: ['cycle:hormonal_contraception'],
    courseConstraints: ['cycle_phase_suitability=not_primary'],
    ruleType: 'Context',
    note: '不套用自然周期阶段假设',
  },
  {
    id: 'L4', name: '备孕', trigger: 'Q15 = 备孕',
    extraQuestions: ['是否有医生给出的运动限制：是/否'],
    backendFields: ['trying_to_conceive', 'medical_restriction'],
    userTags: ['life_stage:ttc'],
    courseConstraints: ['pregnancy_possible_safety', 'contraindication'],
    ruleType: 'Hard/Context',
    note: '有医嘱限制按医嘱；不推断是否怀孕',
  },
  {
    id: 'L5', name: '孕期', trigger: 'Q15 = 孕期',
    extraQuestions: ['孕周或孕早/中/晚期', '医生是否允许运动', '是否出现警示症状'],
    backendFields: ['pregnancy_stage', 'clearance', 'warning_signs[]'],
    userTags: ['pregnancy:trimester_*', 'clearance:*'],
    courseConstraints: ['prenatal_suitability', 'supine_work', 'impact', 'core_pressure', 'contraindication'],
    ruleType: 'Hard/Context',
    note: '无许可或有警示症状：停止自动推荐并提示咨询专业人士',
  },
  {
    id: 'L6', name: '产后', trigger: 'Q15 = 产后 或 Q03 = 产后恢复',
    extraQuestions: ['距分娩时间', '分娩方式', '是否获运动许可', '盆底/漏尿', '腹直肌分离', '疼痛/出血等警示'],
    backendFields: ['postpartum_weeks', 'delivery_type', 'clearance', 'symptoms[]'],
    userTags: ['postpartum:early/returning/rebuilt', 'pelvic_floor:*', 'diastasis:*'],
    courseConstraints: ['postpartum_stage', 'impact', 'core_pressure', 'pelvic_floor_load', 'modification_available'],
    ruleType: 'Hard/Context',
    note: '产后恢复既可为目标，也可为 life_stage；安全字段优先',
  },
  {
    id: 'L7', name: '围绝经', trigger: 'Q15 = 围绝经',
    extraQuestions: ['是否经历周期变化', '主要训练相关困扰：睡眠/潮热/关节/疲劳/无'],
    backendFields: ['perimenopause_symptoms[]'],
    userTags: ['life_stage:perimenopause', 'context:*'],
    courseConstraints: ['recovery_demand', 'impact', 'strength/bone_health contribution'],
    ruleType: 'Context/Soft',
    note: '当日波动交给 Daily Check-in',
  },
  {
    id: 'L8', name: '绝经后', trigger: 'Q15 = 绝经后',
    extraQuestions: ['是否有医生给出的骨骼/心血管/关节运动限制'],
    backendFields: ['postmenopause_restrictions[]'],
    userTags: ['life_stage:postmenopause', 'constraint:*'],
    courseConstraints: ['impact', 'balance', 'bone_health', 'contraindication'],
    ruleType: 'Context/Hard',
    note: '不因绝经自动低强度；按限制与能力匹配',
  },
  {
    id: 'L9', name: '多囊 Context', trigger: 'Q15 = 多囊相关情况',
    extraQuestions: ['是否愿意标记「多囊相关情况」', '当前是否有明确医嘱限制'],
    backendFields: ['pcos_context', 'medical_restriction'],
    userTags: ['context:pcos'],
    courseConstraints: ['不产生专属禁忌；用于计划解释与数据分析'],
    ruleType: 'Context',
    note: '多囊不是独立训练禁忌；不诊断、不推断激素状态',
  },
];

export const POSTPARTUM_DETAILS: PostpartumDetail[] = [
  { item: '距分娩时间', options: '0–6周 / 7–12周 / 3–6月 / 6–12月 / 12月+', ruleOutput: 'postpartum_stage', courseAction: '阶段适配仅为初筛；必须结合运动许可与症状' },
  { item: '运动许可', options: '已获得 / 尚未 / 不确定', ruleOutput: 'clearance:yes/no/unknown', courseAction: 'no/unknown：不进入常规计划；显示咨询专业人士提示' },
  { item: '分娩方式', options: '顺产 / 剖宫产 / 不愿回答', ruleOutput: 'delivery_type', courseAction: '仅作恢复情境；不单独决定课程难度' },
  { item: '盆底相关', options: '漏尿 / 下坠感 / 疼痛 / 无 / 不确定', ruleOutput: 'pelvic_floor_flag', courseAction: '存在症状：过滤高冲击、高腹压；优先可修改课程' },
  { item: '腹部恢复', options: '已知腹直肌分离 / 不确定 / 无', ruleOutput: 'diastasis_flag', courseAction: '过滤不适合的高腹压核心动作；优先呼吸与深层核心' },
  { item: '警示症状', options: '持续/加重疼痛、异常出血、头晕胸痛、伤口异常等', ruleOutput: 'warning_signs', courseAction: '命中：停止自动推荐并展示医疗安全提示' },
];

export const TAG_MAPPINGS: TagMapping[] = [
  { inputDomain: '目标', userTag: 'goal:fat_loss / tone / healthy_habit / postpartum_recovery', courseTag: 'goal_contribution:fat_loss/tone/habit/postpartum', ruleSummary: '候选集内按贡献度排序', ruleType: 'Soft' },
  { inputDomain: '综合能力', userTag: 'fitness_capacity:starter/basic/steady/strong', courseTag: 'difficulty；training_load；cardio_load', ruleSummary: 'Q05+Q06 推导，不由单题决定', ruleType: 'Soft' },
  { inputDomain: '跳跃耐受', userTag: 'impact:no_jump/low/standard', courseTag: 'impact_level；jumping_frequency', ruleSummary: 'no_jump 过滤含频繁跳跃课程', ruleType: 'Hard/Soft' },
  { inputDomain: '膝/腰/腕/肩限制', userTag: 'constraint:* + severity:*', courseTag: 'knee_load；lower_back_load；wrist_bearing；overhead_load', ruleSummary: '中重度限制过滤高负荷；轻度降低排序', ruleType: 'Hard/Context' },
  { inputDomain: '盆底/腹直肌', userTag: 'pelvic_floor_flag / diastasis_flag', courseTag: 'core_pressure；pelvic_floor_load；impact；modification_available', ruleSummary: '过滤高腹压/高冲击；优先可修改课程', ruleType: 'Hard/Context' },
  { inputDomain: '时长', userTag: 'duration_pref:*', courseTag: 'duration_min', ruleSummary: '优先精确命中，允许临近档回退', ruleType: 'Soft' },
  { inputDomain: '器械（V1 边界）', userTag: '用户侧不生成', courseTag: '课程侧可保留展示元数据', ruleSummary: '不进入 V1 主匹配与过滤', ruleType: 'Context' },
  { inputDomain: '训练形式', userTag: 'format_pref:* / avoid:*', courseTag: 'workout_format；modality；floor_work；coordination', ruleSummary: '喜欢加权；不喜欢降权；明确限制转安全规则', ruleType: 'Soft' },
  { inputDomain: '周期情境', userTag: 'cycle:* / phase_estimate', courseTag: 'cycle_phase_suitability', ruleSummary: '仅作排序解释；不覆盖 Daily Check-in', ruleType: 'Context' },
  { inputDomain: '孕期', userTag: 'pregnancy:* / clearance / warning_signs', courseTag: 'prenatal_suitability；contraindication；impact；supine_work', ruleSummary: '按孕期与许可执行安全过滤', ruleType: 'Hard/Context' },
  { inputDomain: '产后', userTag: 'postpartum:* / clearance / symptoms', courseTag: 'postpartum_stage；core_pressure；impact；pelvic_floor_load', ruleSummary: '阶段+许可+症状联合执行', ruleType: 'Hard/Context' },
  { inputDomain: '围绝经/绝经后', userTag: 'life_stage:* + constraint:*', courseTag: 'recovery_demand；balance；bone_health；impact', ruleSummary: '生命周期不自动降级，结合能力/限制排序', ruleType: 'Context/Soft' },
  { inputDomain: '多囊', userTag: 'context:pcos', courseTag: '无独立禁忌标签', ruleSummary: '用于解释与分析；个体状态由 Check-in 决定', ruleType: 'Context' },
];

export const PROFILE_OUTPUT: ProfileFieldGroup[] = [
  { group: '基础', example: 'age_band=35_44；bmi_band=reference_only', requirement: '保留原始值与派生值；BMI 标记不可单独决策' },
  { group: '目标', example: 'primary_goal=postpartum_recovery；secondary_goal=healthy_habit', requirement: '主目标唯一；次目标可空' },
  { group: '能力', example: 'fitness_capacity=starter；jump_tolerance=no_jump', requirement: '推导规则需版本化并可解释' },
  { group: '限制', example: 'constraints=[pelvic_floor]；severity=moderate', requirement: '安全字段需可追踪来源题目与更新时间' },
  { group: '偏好', example: 'duration=[15,20]；format=[walk,strength]', requirement: '用于排序；不得覆盖 Hard Filter' },
  { group: '生命周期', example: 'life_stage=postpartum；postpartum_weeks=10；clearance=yes', requirement: '敏感字段最小化收集、允许跳过与修改' },
  { group: '系统元数据', example: 'profile_version=v1；completed_at；consent_version', requirement: '推荐日志记录应用了哪些规则' },
];

export const PROFILE_EXAMPLE = {
  profile_version: 'v1',
  completed_at: '2026-08-28T10:30:00Z',
  consent_version: 'consent_2026_08',
  age_band: '35_44',
  bmi_band: 'reference_only',
  primary_goal: 'FAT_LOSS',
  secondary_goal: 'HEALTHY_HABIT',
  fitness_capacity: 'L2',
  jump_tolerance: 'no_jump',
  movement_limitations: [{ area: 'knee', severity: 'moderate' }],
  preferred_duration_min: [15, 20],
  planned_days_per_week: 4,
  preferred_formats: ['WALK', 'STRENGTH'],
  avoid_formats: ['JUMPING'],
  life_stage: 'REGULAR',
  last_period_date: '2026-08-01',
  cycle_context: 'regular',
};

export const CHECKIN_BOUNDARY = {
  inputs: ['精力', '睡眠', '情绪', '压力', '身体不适', '可用时间', '可选周期/症状反馈'],
  outputs: ['today_state=PUSH / SOFT / WARM', 'today_constraints'],
  canAdjust: ['当日强度', '时长', '冲击', '恢复需求', '课程替换'],
  cannotOverride: ['医嘱限制', '孕产安全 Hard Filter', '既有安全与身体限制'],
  mergeLogic: '最终推荐 = Onboarding Hard Filters ∩ 生命周期 Context 安全集 ∩ 当日可行集；然后用目标贡献、能力匹配、时长与偏好做排序。Daily Check-in 只能收紧安全边界或改变当天排序，不得放宽既有禁忌。',
};

export const CHECKIN_VS_ONBOARDING: CheckinBoundary[] = [
  { category: 'Onboarding', items: ['长期我是谁、目标是什么、可练什么、有哪些安全边界', '产出 User Training Profile', '不承担当日疲劳/睡眠/情绪判断'] },
  { category: 'Daily Check-in', items: ['我今天是什么状态', '产出 today_state: PUSH/SOFT/WARM', '不改写长期目标；不永久覆盖 Onboarding 标签'] },
];

export const V1_INTERACTION_RULES = [
  { item: '基础主路径', value: '15 题，其中 Q04 可跳过；预计 3–5 分钟', acceptance: '非生命周期追加题不超过 15 屏' },
  { item: '生命周期分支', value: '常规 1–3 题；孕期/产后 4–6 题', acceptance: '只展示相关分支；允许「不确定/不愿回答」' },
  { item: '交互', value: '单题单页；进度条；多选上限；返回不丢失；可稍后完善', acceptance: '条件分支无死循环；所有选项有稳定枚举值' },
  { item: '敏感信息', value: '明确用途；最小化收集；支持跳过、修改、删除', acceptance: '前台不展示 BMI 判定或诊断性措辞' },
  { item: '安全提示', value: '严重/持续疼痛、医嘱限制、孕产警示症状触发', acceptance: '触发后停止自动推荐，并给出非诊断性专业咨询提示' },
  { item: '默认策略', value: '缺失安全信息时选择更保守候选；偏好缺失不影响推荐', acceptance: 'unknown 与 no 必须为不同枚举' },
  { item: '可解释性', value: '推荐结果可说明：为何过滤、为何排序、为何今日调整', acceptance: '日志包含 profile_version、rule_version、命中标签' },
];
