/**
 * Onboarding 答卷 → User Training Profile / 用户标签 / 课程标签 推导（原型级）
 */

import {
  LIFECYCLE_BRANCHES,
  MAIN_QUESTIONS,
  ONBOARDING_VERSION,
  TAG_MAPPINGS,
  type RuleType,
} from '../data/onboarding-config';
import type { UserOnboardingSubmission } from '../data/user-onboarding-samples';

export interface MovementLimitation {
  area: string;
  severity: string;
}

export interface UserTrainingProfile {
  profile_version: string;
  completed_at: string;
  consent_version: string;
  age_band: string;
  bmi_band: string;
  primary_goal: string;
  secondary_goal?: string;
  fitness_capacity: string;
  jump_tolerance: string;
  movement_limitations: MovementLimitation[];
  preferred_duration_min: number[];
  planned_days_per_week: number;
  preferred_formats: string[];
  avoid_formats: string[];
  life_stage: string;
  last_period_date?: string;
  cycle_context?: string;
  postpartum_weeks?: string;
  postpartum_clearance?: string;
}

export interface DerivedTag {
  key: string;
  label: string;
  /** 中文释义，展示为 key（释义） */
  labelZh: string;
  group: string;
}

export interface TagLineage {
  field: string;
  inputDomain: string;
  userTag: string;
  /** 用户标签中文释义 */
  userTagZh: string;
  courseTags: string[];
  sourceQuestionId: string;
  sourceAnswer: string;
  ruleType: RuleType;
  profileGroup: string;
}

function getAnswer(sub: UserOnboardingSubmission, qId: string): string | string[] | undefined {
  const main = sub.answers.find((a) => a.questionId === qId);
  if (main) return main.value;
  const life = sub.lifecycleAnswers?.find((a) => a.questionId.startsWith(qId) || a.questionId.includes(qId));
  return life?.value;
}

function str(v: string | string[] | undefined): string {
  if (v === undefined) return '';
  return Array.isArray(v) ? v.join('、') : v;
}

function mapGoal(q03: string): string {
  const m: Record<string, string> = {
    减脂: 'FAT_LOSS',
    塑形变紧实: 'TONING',
    健康生活与建立习惯: 'HEALTHY_HABIT',
    产后恢复: 'POSTPARTUM',
  };
  return m[q03] ?? 'HEALTHY_HABIT';
}

function mapAgeBand(q01: string): string {
  const m: Record<string, string> = {
    '18–24': '18_24',
    '25–34': '25_34',
    '35–44': '35_44',
    '45–54': '45_54',
    '55+': '55_plus',
  };
  return m[q01] ?? 'reference_only';
}

/** V1 工作假设：Q05 + Q06 联合推导 fitness_capacity */
function deriveFitnessCapacity(sub: UserOnboardingSubmission): string {
  const freq = str(getAnswer(sub, 'Q05'));
  const feel = str(getAnswer(sub, 'Q06'));
  if (freq === '几乎不运动' || feel === '很吃力') return 'L1';
  if (feel === '可完成但需要休息' || freq === '每周1次') return 'L2';
  if (feel === '比较轻松' || freq === '每周2–3次') return 'L3';
  if (feel === '轻松且可更久' || freq === '每周4次+') return 'L4';
  return 'L2';
}

function mapJump(q07: string): string {
  if (q07.includes('避免')) return 'no_jump';
  if (q07.includes('少量')) return 'low';
  if (q07.includes('不确定')) return 'unknown';
  return 'standard';
}

function mapLimitations(sub: UserOnboardingSubmission): MovementLimitation[] {
  const areas = getAnswer(sub, 'Q08');
  const severity = str(getAnswer(sub, 'Q09')) || 'mild';
  const sevMap: Record<string, string> = {
    仅偶尔: 'mild',
    会影响动作: 'moderate',
    医嘱限制运动: 'medical',
  };
  const sev = sevMap[severity] ?? 'mild';
  const areaMap: Record<string, string> = {
    膝: 'knee',
    腰背: 'back',
    手腕承重: 'wrist',
    肩颈: 'shoulder',
    盆底或漏尿: 'pelvic_floor',
    腹直肌分离: 'diastasis',
    其他: 'other',
  };
  if (!areas || (Array.isArray(areas) && areas.length === 1 && areas[0] === '无')) return [];
  const list = Array.isArray(areas) ? areas : [areas];
  return list
    .filter((a) => a !== '无')
    .map((a) => {
      const key = Object.entries(areaMap).find(([k]) => a.includes(k))?.[1] ?? 'other';
      return { area: key, severity: sev };
    });
}

function mapFormats(q13: string | string[]): string[] {
  const list = Array.isArray(q13) ? q13 : [q13];
  const m: Record<string, string> = {
    '步行/低冲击有氧': 'WALK',
    舞蹈: 'DANCE',
    力量: 'STRENGTH',
    普拉提瑜伽: 'PILATES_YOGA',
    '拉伸恢复': 'STRETCH',
    混合: 'MIXED',
  };
  return list.map((x) => m[x] ?? x.toUpperCase());
}

function mapAvoid(q14: string | string[]): string[] {
  const list = Array.isArray(q14) ? q14 : [q14];
  const m: Record<string, string> = {
    跳跃: 'JUMPING',
    地面动作: 'FLOOR_WORK',
    快速转向: 'COORDINATION',
  };
  return list.map((x) => m[x] ?? x.toUpperCase());
}

function mapLifeStage(q15: string): string {
  const m: Record<string, string> = {
    规律周期: 'REGULAR',
    周期不规律: 'IRREGULAR',
    激素避孕: 'HORMONAL_CONTRACEPTION',
    备孕: 'TTC',
    孕期: 'PREGNANT',
    产后: 'POSTPARTUM',
    围绝经: 'PERIMENOPAUSE',
    绝经后: 'POSTMENOPAUSE',
    多囊: 'PCOS',
    不确定: 'UNKNOWN',
    不愿回答: 'DECLINED',
  };
  return m[q15] ?? 'UNKNOWN';
}

function parseDurations(q10: string | string[]): number[] {
  const list = Array.isArray(q10) ? q10 : [q10];
  return list.map((x) => parseInt(x.replace(/\D/g, ''), 10)).filter((n) => !Number.isNaN(n));
}

export function deriveUserProfile(sub: UserOnboardingSubmission): UserTrainingProfile {
  const q15 = str(getAnswer(sub, 'Q15'));
  const profile: UserTrainingProfile = {
    profile_version: 'v1',
    completed_at: sub.completedAt,
    consent_version: sub.consentVersion,
    age_band: mapAgeBand(str(getAnswer(sub, 'Q01'))),
    bmi_band: 'reference_only',
    primary_goal: mapGoal(str(getAnswer(sub, 'Q03'))),
    secondary_goal: getAnswer(sub, 'Q04') ? mapGoal(str(getAnswer(sub, 'Q04'))) : undefined,
    fitness_capacity: deriveFitnessCapacity(sub),
    jump_tolerance: mapJump(str(getAnswer(sub, 'Q07')) || '不确定'),
    movement_limitations: mapLimitations(sub),
    preferred_duration_min: parseDurations(getAnswer(sub, 'Q10') ?? ['15']),
    planned_days_per_week: parseInt(str(getAnswer(sub, 'Q11')), 10) || 3,
    preferred_formats: mapFormats(getAnswer(sub, 'Q13') ?? []),
    avoid_formats: mapAvoid(getAnswer(sub, 'Q14') ?? []),
    life_stage: mapLifeStage(q15),
  };

  if (sub.lifecycleBranchId === 'L1') {
    profile.last_period_date = str(getAnswer(sub, 'L1-last_period')) || undefined;
    profile.cycle_context = 'regular';
  }
  if (sub.lifecycleBranchId === 'L2') {
    profile.cycle_context = 'irregular';
  }
  if (sub.lifecycleBranchId === 'L6') {
    profile.postpartum_weeks = str(getAnswer(sub, 'L6-weeks'));
    profile.postpartum_clearance = str(getAnswer(sub, 'L6-clearance'));
  }

  return profile;
}

function findLifecycle(id: string) {
  return LIFECYCLE_BRANCHES.find((b) => b.id === id);
}

function courseTagsForDomain(domain: string): string[] {
  const row = TAG_MAPPINGS.find((m) => m.inputDomain === domain || m.inputDomain.includes(domain.split('/')[0]));
  if (!row) return [];
  return row.courseTag.split('；').map((s) => s.trim()).filter(Boolean);
}

const FIELD_ZH: Record<string, string> = {
  age_band: '年龄段',
  bmi_band: 'BMI 区间',
  primary_goal: '主要目标',
  secondary_goal: '次要目标',
  activity_base: '活动基础',
  fitness_capacity: '训练能力',
  jump_tolerance: '跳跃耐受',
  duration_pref: '时长偏好',
  frequency_pref: '每周计划频率',
  format_pref: '训练形式偏好',
  avoid: '避免项',
  life_stage: '生命周期阶段',
  'constraint.knee': '膝盖限制',
  'constraint.back': '腰背限制',
  'constraint.wrist': '手腕限制',
  'constraint.shoulder': '肩颈限制',
  'constraint.pelvic_floor': '盆底限制',
  'constraint.diastasis': '腹直肌分离',
  'constraint.other': '其他身体限制',
  pelvic_floor: '盆底标记',
  diastasis: '腹直肌分离标记',
};

const CAPACITY_ZH: Record<string, string> = {
  L1: '很吃力/几乎不运动',
  L2: '可完成但需休息',
  L3: '比较轻松',
  L4: '轻松且可更久',
  L5: '高活动量',
};

const GOAL_ZH: Record<string, string> = {
  FAT_LOSS: '减脂',
  TONING: '塑形变紧实',
  HEALTHY_HABIT: '健康生活与建立习惯',
  POSTPARTUM: '产后恢复',
};

const IMPACT_ZH: Record<string, string> = {
  no_jump: '避免跳跃',
  low: '少量跳跃可以',
  standard: '跳跃没问题',
  unknown: '跳跃耐受不确定',
};

const LIFE_STAGE_ZH: Record<string, string> = {
  REGULAR: '规律周期',
  IRREGULAR: '周期不规律',
  HORMONAL_CONTRACEPTION: '激素避孕',
  TTC: '备孕',
  PREGNANT: '孕期',
  POSTPARTUM: '产后',
  PERIMENOPAUSE: '围绝经',
  POSTMENOPAUSE: '绝经后',
  PCOS: '多囊相关',
  UNKNOWN: '不确定',
  DECLINED: '不愿回答',
};

const AGE_BAND_ZH: Record<string, string> = {
  '18_24': '18–24 岁',
  '25_34': '25–34 岁',
  '35_44': '35–44 岁',
  '45_54': '45–54 岁',
  '55_plus': '55 岁以上',
  reference_only: '仅作参考',
};

const FORMAT_ZH: Record<string, string> = {
  WALK: '步行/低冲击有氧',
  DANCE: '舞蹈',
  STRENGTH: '力量',
  PILATES_YOGA: '普拉提瑜伽',
  STRETCH: '拉伸恢复',
  MIXED: '混合',
  JUMPING: '跳跃',
  FLOOR_WORK: '地面动作',
  COORDINATION: '快速转向',
};

function describeCourseTagZh(courseTag: string, inputDomain: string): string {
  const parts = courseTag.match(/（([^）]+)）/g);
  if (parts?.length) return parts.map((s) => s.slice(1, -1)).join('；');
  return inputDomain;
}

/** 从标签字符串或字段/答案生成中文释义 */
export function describeUserTagZh(
  field: string,
  userTag: string,
  sourceAnswer: string,
  inputDomain: string,
): string {
  const embedded = userTag.match(/（([^）]+)）/g);
  if (embedded?.length) {
    return embedded.map((s) => s.slice(1, -1)).join('；');
  }

  const fieldLabel = FIELD_ZH[field] ?? inputDomain;
  const colonIdx = userTag.indexOf(':');
  const tagKey = colonIdx >= 0 ? userTag.slice(0, colonIdx) : userTag;
  const tagVal = colonIdx >= 0 ? userTag.slice(colonIdx + 1) : '';

  if (field === 'age_band' || tagKey === 'age_band') return AGE_BAND_ZH[tagVal] ?? sourceAnswer ?? fieldLabel;
  if (tagKey === 'bmi_band') return 'BMI 仅作参考，不单独决策';
  if (field === 'primary_goal' || tagKey === 'goal') return GOAL_ZH[tagVal.toUpperCase()] ?? sourceAnswer ?? fieldLabel;
  if (field === 'secondary_goal') return GOAL_ZH[tagVal.toUpperCase()] ?? sourceAnswer ?? '次要目标';
  if (tagKey === 'activity_base') return `过去4周运动频率·${sourceAnswer || tagVal}`;
  if (tagKey === 'fitness_capacity') return `训练能力 ${tagVal}（${CAPACITY_ZH[tagVal] ?? sourceAnswer}）`;
  if (tagKey === 'impact') return IMPACT_ZH[tagVal] ?? sourceAnswer ?? fieldLabel;
  if (tagKey === 'constraint') {
    const areaZh: Record<string, string> = { knee: '膝', back: '腰背', wrist: '手腕', shoulder: '肩颈', pelvic_floor: '盆底', diastasis: '腹直肌', other: '其他' };
    const area = areaZh[tagVal] ?? tagVal;
    return sourceAnswer.includes('·') ? `身体限制·${sourceAnswer}` : `身体限制·${area}`;
  }
  if (tagKey === 'pelvic_floor_flag') return '盆底或漏尿相关限制';
  if (tagKey === 'diastasis_flag') return '腹直肌分离相关限制';
  if (tagKey === 'duration_pref') return `偏好 ${tagVal.replace(/,/g, '/')} 分钟训练`;
  if (tagKey === 'frequency_pref') return `每周计划 ${tagVal} 天`;
  if (tagKey === 'format_pref') {
    const parts = tagVal.split(',').map((v) => FORMAT_ZH[v] ?? v);
    return `喜欢·${parts.join('、')}`;
  }
  if (tagKey === 'avoid') {
    const parts = tagVal.split(',').map((v) => FORMAT_ZH[v] ?? v);
    return `希望避免·${parts.join('、')}`;
  }
  if (tagKey === 'life_stage') return LIFE_STAGE_ZH[tagVal] ?? sourceAnswer ?? fieldLabel;

  if (sourceAnswer && !sourceAnswer.includes('Q')) return `${fieldLabel}·${sourceAnswer}`;
  return fieldLabel;
}

export function formatUserTagDisplay(userTag: string, labelZh: string): string {
  return `${userTag}（${labelZh}）`;
}

export function getTagLineage(sub: UserOnboardingSubmission): TagLineage[] {
  const profile = deriveUserProfile(sub);
  const rows: TagLineage[] = [];

  const push = (
    field: string,
    inputDomain: string,
    userTag: string,
    courseTags: string[],
    sourceQuestionId: string,
    sourceAnswer: string,
    ruleType: RuleType,
    profileGroup: string,
  ) => {
    const userTagZh = describeUserTagZh(field, userTag, sourceAnswer, inputDomain);
    rows.push({ field, inputDomain, userTag, userTagZh, courseTags, sourceQuestionId, sourceAnswer, ruleType, profileGroup });
  };

  push('age_band', '基础', `age_band:${profile.age_band}`, [], 'Q01', str(getAnswer(sub, 'Q01')), 'Context', '基础');
  push('bmi_band', '基础', 'bmi_band:reference_only', [], 'Q02', str(getAnswer(sub, 'Q02')), 'Context', '基础');

  const q03 = str(getAnswer(sub, 'Q03'));
  push('primary_goal', '目标', `goal:${profile.primary_goal.toLowerCase()}`, courseTagsForDomain('目标'), 'Q03', q03, 'Soft', '目标');

  const q04 = getAnswer(sub, 'Q04');
  if (q04) {
    push('secondary_goal', '目标', `secondary_goal:${profile.secondary_goal}`, courseTagsForDomain('目标'), 'Q04', str(q04), 'Soft', '目标');
  }

  push('activity_base', '综合能力', `activity_base:${str(getAnswer(sub, 'Q05'))}`, courseTagsForDomain('综合能力'), 'Q05', str(getAnswer(sub, 'Q05')), 'Soft', '能力');
  push('fitness_capacity', '综合能力', `fitness_capacity:${profile.fitness_capacity}`, courseTagsForDomain('综合能力'), 'Q05+Q06', `${str(getAnswer(sub, 'Q05'))} + ${str(getAnswer(sub, 'Q06'))}`, 'Soft', '能力');

  const q07 = str(getAnswer(sub, 'Q07'));
  if (q07) {
    push('jump_tolerance', '跳跃耐受', `impact:${profile.jump_tolerance}`, courseTagsForDomain('跳跃耐受'), 'Q07', q07, 'Hard/Soft', '能力');
  }

  const limitations = mapLimitations(sub);
  limitations.forEach((lim) => {
    push(
      `constraint.${lim.area}`,
      '膝/腰/腕/肩限制',
      `constraint:${lim.area}`,
      courseTagsForDomain('膝/腰/腕/肩限制'),
      limitations.length ? 'Q08+Q09' : 'Q08',
      `${str(getAnswer(sub, 'Q08'))} · ${str(getAnswer(sub, 'Q09'))}`,
      'Hard/Context',
      '限制',
    );
  });

  const q08 = getAnswer(sub, 'Q08');
  const q08List = Array.isArray(q08) ? q08 : q08 ? [q08] : [];
  if (q08List.some((a) => a.includes('盆底'))) {
    push('pelvic_floor', '盆底/腹直肌', 'pelvic_floor_flag:true', courseTagsForDomain('盆底/腹直肌'), 'Q08', q08List.join('、'), 'Hard/Context', '限制');
  }
  if (q08List.some((a) => a.includes('腹直肌'))) {
    push('diastasis', '盆底/腹直肌', 'diastasis_flag:true', courseTagsForDomain('盆底/腹直肌'), 'Q08', q08List.join('、'), 'Hard/Context', '限制');
  }

  push('duration_pref', '时长', `duration_pref:${profile.preferred_duration_min.join(',')}`, courseTagsForDomain('时长'), 'Q10', str(getAnswer(sub, 'Q10')), 'Soft', '偏好');
  push('frequency_pref', '训练形式', `frequency_pref:${profile.planned_days_per_week}`, ['program_frequency'], 'Q11', str(getAnswer(sub, 'Q11')), 'Soft', '偏好');
  push('format_pref', '训练形式', `format_pref:${profile.preferred_formats.join(',')}`, courseTagsForDomain('训练形式'), 'Q13', str(getAnswer(sub, 'Q13')), 'Soft', '偏好');
  push('avoid', '训练形式', `avoid:${profile.avoid_formats.join(',')}`, courseTagsForDomain('训练形式'), 'Q14', str(getAnswer(sub, 'Q14')), 'Hard/Soft', '偏好');

  push('life_stage', '周期情境', `life_stage:${profile.life_stage}`, courseTagsForDomain('周期情境'), 'Q15', str(getAnswer(sub, 'Q15')), 'Context', '生命周期');

  if (sub.lifecycleBranchId) {
    const branchId = sub.lifecycleBranchId;
    const branch = findLifecycle(branchId);
    branch?.userTags.forEach((tag, i) => {
      push(
        `lifecycle.${branchId}`,
        branch.name,
        tag,
        branch.courseConstraints,
        branchId,
        str(sub.lifecycleAnswers?.[i]?.value) || branch.trigger,
        branch.ruleType,
        '生命周期',
      );
    });
  }

  return rows;
}

export function deriveUserTags(sub: UserOnboardingSubmission): DerivedTag[] {
  return getTagLineage(sub).map((l) => ({
    key: l.userTag,
    label: formatUserTagDisplay(l.userTag, l.userTagZh),
    labelZh: l.userTagZh,
    group: l.profileGroup,
  }));
}

export function deriveCourseTags(sub: UserOnboardingSubmission): DerivedTag[] {
  const seen = new Set<string>();
  const tags: DerivedTag[] = [];
  getTagLineage(sub).forEach((l) => {
    l.courseTags.forEach((ct) => {
      if (!seen.has(ct)) {
        seen.add(ct);
        tags.push({
          key: ct,
          label: ct,
          labelZh: describeCourseTagZh(ct, l.inputDomain),
          group: l.inputDomain,
        });
      }
    });
  });
  return tags;
}

export interface DerivationRuleRow {
  field: string;
  source: string;
  ruleType: RuleType;
  description: string;
}

export function getDerivationRules(): DerivationRuleRow[] {
  const rules: DerivationRuleRow[] = [];
  MAIN_QUESTIONS.forEach((q) => {
    if (q.userTags && q.userTags !== '无') {
      rules.push({
        field: q.backendField,
        source: q.id,
        ruleType: q.ruleType,
        description: q.userTags,
      });
    }
  });
  LIFECYCLE_BRANCHES.forEach((b) => {
    rules.push({
      field: b.backendFields.join(', '),
      source: b.id,
      ruleType: b.ruleType,
      description: b.userTags.join('；'),
    });
  });
  return rules;
}

export interface SampleDerivationResult {
  userId: string;
  nickname: string;
  profile: UserTrainingProfile;
  lineageCount: number;
  status: 'ok' | 'warn';
  statusNote?: string;
}

export function runSampleDerivations(subs: UserOnboardingSubmission[]): SampleDerivationResult[] {
  return subs.map((sub) => {
    const profile = deriveUserProfile(sub);
    const lineage = getTagLineage(sub);
    const warn = !profile.primary_goal || lineage.length < 5;
    return {
      userId: sub.userId,
      nickname: sub.nickname,
      profile,
      lineageCount: lineage.length,
      status: warn ? 'warn' : 'ok',
      statusNote: warn ? '部分字段缺少来源或推导不完整' : undefined,
    };
  });
}

export function formatProfileJson(profile: UserTrainingProfile): string {
  return JSON.stringify(profile, null, 2);
}

export const DEFAULT_QUESTIONNAIRE_VERSION = ONBOARDING_VERSION;
