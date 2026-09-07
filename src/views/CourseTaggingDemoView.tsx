import { useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDashed,
  ClipboardCheck,
  Clock3,
  FileVideo,
  Flame,
  Gauge,
  GitCompare,
  Layers3,
  Play,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
  UserRound,
  Video,
} from 'lucide-react';
import { cn } from '../lib/utils';

/* ─────────────── V2 Domain Model ─────────────── */

type TabId = 'portrait' | 'ai' | 'review' | 'governance' | 'diff' | 'calories';
type PortraitSub = 'identity' | 'intensity' | 'movement' | 'goals' | 'eligibility' | 'evidence';
type CourseStatus = '待复核' | '可用于排课' | '异常待处理';
type CourseFilter = 'all' | CourseStatus | 'FORBIDDEN' | 'REVIEW' | 'POSTPARTUM_RECOVERY' | 'V2_ONLY';
type Decision = 'accept' | 'edit' | 'unknown' | 'reject';

type ReviewStatus = 'DRAFT' | 'AI_GENERATED' | 'NEEDS_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUPERSEDED';
type TernaryEligibility = 'ALLOWED' | 'FORBIDDEN' | 'REVIEW';
type ObservationLevel = 'NONE' | 'SOME' | 'FREQUENT' | 'UNKNOWN';
type LocalLoadLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'UNKNOWN';
type InversionState = 'NONE' | 'PRESENT' | 'UNKNOWN';

interface Evidence {
  time: string;
  title: string;
  detail: string;
  field?: string;
}

interface RawMetrics {
  jump_ratio_pct: number;
  running_ratio_pct: number;
  wrist_bearing_ratio_pct: number;
  standing_ratio_pct: number;
  floor_ratio_pct: number;
  confidence: number;
  motion_job_id: string;
}

/** V1 snapshot kept only for read-only diff — not formal V2 fields */
interface V1Snapshot {
  cardio: number;
  muscle: number;
  impact: number;
  menstrualRisk: string;
  postpartumRisk: string;
  secondaryType: string;
}

interface CourseProfileV2 {
  schema_version: 'course_profile_v2';
  tagging_rule_version: string;
  eligibility_rule_version: string;
  identity: {
    content_type: 'WORKOUT' | 'RECOVERY' | 'REST_REFLECTION' | 'EDUCATION_TALK' | 'ASSESSMENT_TEST';
    primary_workout_type?:
      | 'WALKING'
      | 'CARDIO'
      | 'HIIT'
      | 'STRENGTH'
      | 'PILATES'
      | 'MOBILITY'
      | 'STRETCH'
      | 'RECOVERY'
      | 'POSTPARTUM_RECOVERY';
    primary_body_area?:
      | 'FULL_BODY'
      | 'UPPER_BODY'
      | 'LOWER_BODY'
      | 'CORE'
      | 'GLUTES'
      | 'LEGS'
      | 'ARMS'
      | 'BACK_SHOULDER';
    duration_sec: number;
  };
  intensity: {
    overall: 1 | 2 | 3 | 4 | 5 | null;
    met?: number | null;
    met_source?: 'CURATED_LOOKUP' | 'CALORIE_NORMALIZED' | 'MANUAL' | 'UNKNOWN';
    calorie_type?: 'GROSS' | 'ACTIVE' | 'UNKNOWN';
    status: 'DERIVED' | 'CONFIRMED' | 'REVIEW';
  };
  action_exposure: {
    running: ObservationLevel;
    jump: ObservationLevel;
    wrist_bearing: ObservationLevel;
  };
  local_load: {
    knee: LocalLoadLevel;
    ankle: LocalLoadLevel;
    lower_back: LocalLoadLevel;
    shoulder: LocalLoadLevel;
  };
  goal_contributions: {
    fat_loss: 1 | 2 | 3 | 4 | 5;
    body_shaping: 1 | 2 | 3 | 4 | 5;
    healthy_living: 1 | 2 | 3 | 4 | 5;
    postpartum_recovery: 1 | 2 | 3 | 4 | 5;
  };
  eligibility: {
    menstrual: TernaryEligibility;
    postpartum: TernaryEligibility;
    inversion: InversionState;
    triggered_rule_ids: string[];
    override_notes?: string;
  };
  governance: {
    review_status: ReviewStatus;
    motion_job_id?: string;
    model_version?: string;
    taxonomy_version: string;
  };
}

interface Course {
  id: string;
  name: string;
  subtitle: string;
  equipment: string[];
  price: number;
  status: CourseStatus;
  keyActions: string[];
  evidence: Evidence[];
  rawMetrics: RawMetrics;
  profile: CourseProfileV2;
  v1: V1Snapshot;
  lastRun: string;
  hasV1: boolean;
  hasV2: boolean;
  v1v2Conflict?: boolean;
}

/* ─────────────── Demo Data (7 courses) ─────────────── */

const COURSES: Course[] = [
  {
    id: 'WALK_001',
    name: '20分钟低冲击全身健走',
    subtitle: '连续走步 · 无器械 · 适合日常训练',
    equipment: ['无器械'],
    price: 0,
    status: '可用于排课',
    keyActions: ['原地走', '侧步', 'Knee Drive', '轻度深蹲'],
    evidence: [
      { time: '02:10–05:30', title: '连续站立走步', detail: '动作密度稳定，未检测到跳跃或落地冲击。', field: 'jump' },
      { time: '11:40–15:20', title: '抬膝与摆臂', detail: '心肺刺激中等，走步持续出现，Running=SOME。', field: 'running' },
      { time: '18:00–19:40', title: '收尾放松', detail: '节奏下降，作为恢复段处理。', field: 'intensity' },
    ],
    rawMetrics: { jump_ratio_pct: 0, running_ratio_pct: 18, wrist_bearing_ratio_pct: 0, standing_ratio_pct: 100, floor_ratio_pct: 0, confidence: 0.92, motion_job_id: 'mj_walk_42' },
    profile: {
      schema_version: 'course_profile_v2',
      tagging_rule_version: 'course_tagging_rules_v2.1',
      eligibility_rule_version: 'course_eligibility_rules_v2.0',
      identity: { content_type: 'WORKOUT', primary_workout_type: 'WALKING', primary_body_area: 'FULL_BODY', duration_sec: 1200 },
      intensity: { overall: 3, met: 3.5, met_source: 'CURATED_LOOKUP', calorie_type: 'GROSS', status: 'CONFIRMED' },
      action_exposure: { running: 'SOME', jump: 'NONE', wrist_bearing: 'NONE' },
      local_load: { knee: 'LOW', ankle: 'LOW', lower_back: 'LOW', shoulder: 'LOW' },
      goal_contributions: { fat_loss: 4, body_shaping: 2, healthy_living: 5, postpartum_recovery: 3 },
      eligibility: { menstrual: 'ALLOWED', postpartum: 'ALLOWED', inversion: 'NONE', triggered_rule_ids: ['ELIG_MENST_LOW_IMPACT', 'ELIG_PP_STANDING_OK'] },
      governance: { review_status: 'APPROVED', motion_job_id: 'mj_walk_42', model_version: 'motion_v3.2', taxonomy_version: 'taxonomy_2026_08_28' },
    },
    v1: { cardio: 3, muscle: 2, impact: 1, menstrualRisk: '低', postpartumRisk: '低', secondaryType: '有氧' },
    lastRun: '今天 09:42',
    hasV1: true,
    hasV2: true,
  },
  {
    id: 'HIIT_014',
    name: '20分钟跳跃 HIIT',
    subtitle: '高密度间歇 · 跳跃与复合动作',
    equipment: ['无器械'],
    price: 9.9,
    status: '待复核',
    keyActions: ['Jumping Jack', 'Burpee', 'Mountain Climber', '深蹲跳'],
    evidence: [
      { time: '03:00–05:10', title: '连续跳跃间歇', detail: '跳跃占比 35%，Jump=FREQUENT，落地冲击持续。', field: 'jump' },
      { time: '08:20–10:05', title: 'Burpee + 登山者', detail: '膝/踝局部负荷 HIGH；腕部承重 SOME。', field: 'knee' },
      { time: '14:30–17:00', title: '高心肺峰值', detail: '休息比例低，Overall=5。', field: 'intensity' },
    ],
    rawMetrics: { jump_ratio_pct: 35, running_ratio_pct: 12, wrist_bearing_ratio_pct: 22, standing_ratio_pct: 78, floor_ratio_pct: 22, confidence: 0.78, motion_job_id: 'mj_hiit_14' },
    profile: {
      schema_version: 'course_profile_v2',
      tagging_rule_version: 'course_tagging_rules_v2.1',
      eligibility_rule_version: 'course_eligibility_rules_v2.0',
      identity: { content_type: 'WORKOUT', primary_workout_type: 'HIIT', primary_body_area: 'FULL_BODY', duration_sec: 1200 },
      intensity: { overall: 5, met: 8, met_source: 'CURATED_LOOKUP', calorie_type: 'GROSS', status: 'DERIVED' },
      action_exposure: { running: 'SOME', jump: 'FREQUENT', wrist_bearing: 'SOME' },
      local_load: { knee: 'HIGH', ankle: 'HIGH', lower_back: 'MEDIUM', shoulder: 'MEDIUM' },
      goal_contributions: { fat_loss: 5, body_shaping: 3, healthy_living: 2, postpartum_recovery: 1 },
      eligibility: {
        menstrual: 'FORBIDDEN',
        postpartum: 'FORBIDDEN',
        inversion: 'NONE',
        triggered_rule_ids: ['ELIG_MENST_JUMP_FREQ', 'ELIG_PP_JUMP_HIGH', 'ELIG_PP_KNEE_HIGH'],
      },
      governance: { review_status: 'NEEDS_REVIEW', motion_job_id: 'mj_hiit_14', model_version: 'motion_v3.2', taxonomy_version: 'taxonomy_2026_08_28' },
    },
    v1: { cardio: 5, muscle: 4, impact: 5, menstrualRisk: '高', postpartumRisk: '高', secondaryType: '有氧' },
    lastRun: '今天 09:37',
    hasV1: true,
    hasV2: true,
    v1v2Conflict: false,
  },
  {
    id: 'PIL_CORE_008',
    name: '15分钟普拉提核心',
    subtitle: '垫上核心激活 · 腹压与经期规则验证',
    equipment: ['瑜伽垫'],
    price: 0,
    status: '待复核',
    keyActions: ['百次拍击', '单腿伸展', '侧平板', '骨盆卷动'],
    evidence: [
      { time: '01:00–04:00', title: '仰卧核心激活', detail: 'Core 为主部位；腹压动作需经期/产后规则复核。', field: 'eligibility' },
      { time: '07:20–09:10', title: '侧平板承重', detail: 'Wrist Bearing=SOME；肩部负荷 MEDIUM。', field: 'wrist_bearing' },
      { time: '12:00–14:00', title: '骨盆控制段', detail: '下背负荷 MEDIUM；无跳跃。', field: 'lower_back' },
    ],
    rawMetrics: { jump_ratio_pct: 0, running_ratio_pct: 0, wrist_bearing_ratio_pct: 28, standing_ratio_pct: 15, floor_ratio_pct: 85, confidence: 0.84, motion_job_id: 'mj_pil_08' },
    profile: {
      schema_version: 'course_profile_v2',
      tagging_rule_version: 'course_tagging_rules_v2.1',
      eligibility_rule_version: 'course_eligibility_rules_v2.0',
      identity: { content_type: 'WORKOUT', primary_workout_type: 'PILATES', primary_body_area: 'CORE', duration_sec: 900 },
      intensity: { overall: 2, met: 3.0, met_source: 'CURATED_LOOKUP', calorie_type: 'GROSS', status: 'DERIVED' },
      action_exposure: { running: 'NONE', jump: 'NONE', wrist_bearing: 'SOME' },
      local_load: { knee: 'LOW', ankle: 'LOW', lower_back: 'MEDIUM', shoulder: 'MEDIUM' },
      goal_contributions: { fat_loss: 2, body_shaping: 4, healthy_living: 4, postpartum_recovery: 2 },
      eligibility: {
        menstrual: 'REVIEW',
        postpartum: 'REVIEW',
        inversion: 'NONE',
        triggered_rule_ids: ['ELIG_MENST_CORE_PRESSURE', 'ELIG_PP_CORE_PRESSURE'],
      },
      governance: { review_status: 'NEEDS_REVIEW', motion_job_id: 'mj_pil_08', model_version: 'motion_v3.2', taxonomy_version: 'taxonomy_2026_08_28' },
    },
    v1: { cardio: 1, muscle: 3, impact: 1, menstrualRisk: '中', postpartumRisk: '中', secondaryType: '核心' },
    lastRun: '今天 08:15',
    hasV1: true,
    hasV2: true,
  },
  {
    id: 'STR_022',
    name: '25分钟哑铃全身力量',
    subtitle: '持续抗阻 · 膝/下背/肩局部负荷验证',
    equipment: ['哑铃'],
    price: 19.9,
    status: '异常待处理',
    keyActions: ['深蹲', '弓步', '哑铃划船', '肩上推举'],
    evidence: [
      { time: '04:20–07:40', title: '持续抗阻组', detail: '肌肉疲劳明显；Knee=MEDIUM。', field: 'knee' },
      { time: '12:00–14:20', title: '弓步与深蹲组合', detail: '膝部承重需人工确认；Ankle=MEDIUM。', field: 'ankle' },
      { time: '19:10–21:00', title: '过头推举', detail: 'Shoulder=HIGH；器械识别与肩负荷标签冲突。', field: 'shoulder' },
    ],
    rawMetrics: { jump_ratio_pct: 0, running_ratio_pct: 0, wrist_bearing_ratio_pct: 5, standing_ratio_pct: 62, floor_ratio_pct: 38, confidence: 0.61, motion_job_id: 'mj_str_22' },
    profile: {
      schema_version: 'course_profile_v2',
      tagging_rule_version: 'course_tagging_rules_v2.1',
      eligibility_rule_version: 'course_eligibility_rules_v2.0',
      identity: { content_type: 'WORKOUT', primary_workout_type: 'STRENGTH', primary_body_area: 'FULL_BODY', duration_sec: 1500 },
      intensity: { overall: 4, met: 5, met_source: 'CURATED_LOOKUP', calorie_type: 'GROSS', status: 'REVIEW' },
      action_exposure: { running: 'NONE', jump: 'NONE', wrist_bearing: 'NONE' },
      local_load: { knee: 'MEDIUM', ankle: 'MEDIUM', lower_back: 'MEDIUM', shoulder: 'HIGH' },
      goal_contributions: { fat_loss: 3, body_shaping: 5, healthy_living: 3, postpartum_recovery: 1 },
      eligibility: {
        menstrual: 'REVIEW',
        postpartum: 'REVIEW',
        inversion: 'NONE',
        triggered_rule_ids: ['ELIG_MENST_SHOULDER_HIGH', 'ELIG_PP_SHOULDER_HIGH', 'TAG_CONFLICT_SHOULDER'],
      },
      governance: { review_status: 'NEEDS_REVIEW', motion_job_id: 'mj_str_22', model_version: 'motion_v3.2', taxonomy_version: 'taxonomy_2026_08_28' },
    },
    v1: { cardio: 2, muscle: 5, impact: 1, menstrualRisk: '中', postpartumRisk: '中', secondaryType: 'STRENGTH' },
    lastRun: '昨天 18:26',
    hasV1: true,
    hasV2: true,
    v1v2Conflict: true,
  },
  {
    id: 'REC_005',
    name: '12分钟恢复拉伸',
    subtitle: 'Content Type=RECOVERY · Workout Type=RECOVERY 组合验证',
    equipment: ['瑜伽垫'],
    price: 0,
    status: '可用于排课',
    keyActions: ['猫牛式', '髋屈肌拉伸', '胸椎旋转', '深呼吸'],
    evidence: [
      { time: '00:30–03:00', title: '呼吸与放松', detail: '低强度拉伸，无跳跃、无跑动。', field: 'intensity' },
      { time: '05:00–08:00', title: '髋与下背拉伸', detail: 'Local load 全 LOW；Content Type=RECOVERY。', field: 'lower_back' },
      { time: '09:00–11:30', title: '收尾静卧', detail: 'Rest reflection 片段，Overall=1。', field: 'identity' },
    ],
    rawMetrics: { jump_ratio_pct: 0, running_ratio_pct: 0, wrist_bearing_ratio_pct: 0, standing_ratio_pct: 40, floor_ratio_pct: 60, confidence: 0.95, motion_job_id: 'mj_rec_05' },
    profile: {
      schema_version: 'course_profile_v2',
      tagging_rule_version: 'course_tagging_rules_v2.1',
      eligibility_rule_version: 'course_eligibility_rules_v2.0',
      identity: { content_type: 'RECOVERY', primary_workout_type: 'RECOVERY', primary_body_area: 'FULL_BODY', duration_sec: 720 },
      intensity: { overall: 1, met: 2.0, met_source: 'CURATED_LOOKUP', calorie_type: 'GROSS', status: 'CONFIRMED' },
      action_exposure: { running: 'NONE', jump: 'NONE', wrist_bearing: 'NONE' },
      local_load: { knee: 'LOW', ankle: 'LOW', lower_back: 'LOW', shoulder: 'LOW' },
      goal_contributions: { fat_loss: 1, body_shaping: 1, healthy_living: 5, postpartum_recovery: 4 },
      eligibility: { menstrual: 'ALLOWED', postpartum: 'ALLOWED', inversion: 'NONE', triggered_rule_ids: ['ELIG_RECOVERY_WHITELIST'] },
      governance: { review_status: 'APPROVED', motion_job_id: 'mj_rec_05', model_version: 'motion_v3.2', taxonomy_version: 'taxonomy_2026_08_28' },
    },
    v1: { cardio: 1, muscle: 1, impact: 1, menstrualRisk: '低', postpartumRisk: '低', secondaryType: '拉伸' },
    lastRun: '今天 07:50',
    hasV1: true,
    hasV2: true,
  },
  {
    id: 'PP_REC_003',
    name: '18分钟产后恢复基础',
    subtitle: 'POSTPARTUM_RECOVERY 白名单 · 覆盖规则与双审',
    equipment: ['瑜伽垫'],
    price: 0,
    status: '待复核',
    keyActions: ['盆底激活', '腹横肌呼吸', '臀桥', '猫式'],
    evidence: [
      { time: '01:00–04:00', title: '盆底与呼吸', detail: '白名单课程；覆盖普通 Core 禁用规则，仍需健康运营终审。', field: 'eligibility' },
      { time: '06:00–09:00', title: '臀桥激活', detail: 'Jump=NONE；Knee=LOW；无倒立。', field: 'jump' },
      { time: '12:00–16:00', title: '轻核心控制', detail: '覆盖 ELIG_PP_CORE_PRESSURE；override 待双审。', field: 'eligibility' },
    ],
    rawMetrics: { jump_ratio_pct: 0, running_ratio_pct: 0, wrist_bearing_ratio_pct: 8, standing_ratio_pct: 20, floor_ratio_pct: 80, confidence: 0.88, motion_job_id: 'mj_pp_03' },
    profile: {
      schema_version: 'course_profile_v2',
      tagging_rule_version: 'course_tagging_rules_v2.1',
      eligibility_rule_version: 'course_eligibility_rules_v2.0',
      identity: { content_type: 'WORKOUT', primary_workout_type: 'POSTPARTUM_RECOVERY', primary_body_area: 'CORE', duration_sec: 1080 },
      intensity: { overall: 2, met: 2.5, met_source: 'CURATED_LOOKUP', calorie_type: 'GROSS', status: 'DERIVED' },
      action_exposure: { running: 'NONE', jump: 'NONE', wrist_bearing: 'NONE' },
      local_load: { knee: 'LOW', ankle: 'LOW', lower_back: 'LOW', shoulder: 'LOW' },
      goal_contributions: { fat_loss: 1, body_shaping: 2, healthy_living: 4, postpartum_recovery: 5 },
      eligibility: {
        menstrual: 'ALLOWED',
        postpartum: 'REVIEW',
        inversion: 'NONE',
        triggered_rule_ids: ['ELIG_PP_WHITELIST_OVERRIDE', 'ELIG_PP_CORE_PRESSURE'],
        override_notes: '类型命中白名单仅覆盖普通禁用规则，不自动 ALLOWED；需健康运营终审。',
      },
      governance: { review_status: 'NEEDS_REVIEW', motion_job_id: 'mj_pp_03', model_version: 'motion_v3.2', taxonomy_version: 'taxonomy_2026_08_28' },
    },
    v1: { cardio: 1, muscle: 2, impact: 1, menstrualRisk: '低', postpartumRisk: '低', secondaryType: '恢复' },
    lastRun: '今天 10:05',
    hasV1: true,
    hasV2: true,
    v1v2Conflict: true,
  },
  {
    id: 'UNK_099',
    name: '画面不足样本 · 规则冲突',
    subtitle: '证据不足 / 规则冲突 → Eligibility 必须为 REVIEW',
    equipment: ['未知'],
    price: 0,
    status: '异常待处理',
    keyActions: ['无法可靠识别'],
    evidence: [
      { time: '00:00–02:00', title: '画面遮挡', detail: '关键帧置信度 < 0.4；Running/Jump 均为 UNKNOWN。', field: 'running' },
      { time: '05:00–07:00', title: '规则冲突片段', detail: '字幕称「无跳跃」但视觉检测到落地；进入 REVIEW。', field: 'jump' },
      { time: '10:00–12:00', title: '局部负荷未知', detail: 'Knee/Ankle=UNKNOWN；禁止显示为 Low 或 Allowed。', field: 'knee' },
    ],
    rawMetrics: { jump_ratio_pct: -1, running_ratio_pct: -1, wrist_bearing_ratio_pct: -1, standing_ratio_pct: -1, floor_ratio_pct: -1, confidence: 0.38, motion_job_id: 'mj_unk_99' },
    profile: {
      schema_version: 'course_profile_v2',
      tagging_rule_version: 'course_tagging_rules_v2.1',
      eligibility_rule_version: 'course_eligibility_rules_v2.0',
      identity: { content_type: 'WORKOUT', primary_workout_type: 'CARDIO', primary_body_area: 'FULL_BODY', duration_sec: 900 },
      intensity: { overall: null, met: null, met_source: 'UNKNOWN', calorie_type: 'UNKNOWN', status: 'REVIEW' },
      action_exposure: { running: 'UNKNOWN', jump: 'UNKNOWN', wrist_bearing: 'UNKNOWN' },
      local_load: { knee: 'UNKNOWN', ankle: 'UNKNOWN', lower_back: 'UNKNOWN', shoulder: 'UNKNOWN' },
      goal_contributions: { fat_loss: 1, body_shaping: 1, healthy_living: 1, postpartum_recovery: 1 },
      eligibility: {
        menstrual: 'REVIEW',
        postpartum: 'REVIEW',
        inversion: 'UNKNOWN',
        triggered_rule_ids: ['ELIG_UNKNOWN_BLOCK', 'ELIG_RULE_CONFLICT', 'TAG_LOW_CONFIDENCE'],
      },
      governance: { review_status: 'NEEDS_REVIEW', motion_job_id: 'mj_unk_99', model_version: 'motion_v3.2', taxonomy_version: 'taxonomy_2026_08_28' },
    },
    v1: { cardio: 0, muscle: 0, impact: 0, menstrualRisk: '未知', postpartumRisk: '未知', secondaryType: '—' },
    lastRun: '今天 11:20',
    hasV1: false,
    hasV2: true,
  },
];

/* ─────────────── Constants / Helpers ─────────────── */

const TABS: { id: TabId; label: string; hint: string }[] = [
  { id: 'portrait', label: '课程画像', hint: 'V2 Profile 六页签' },
  { id: 'ai', label: 'AI 初次打标', hint: '事实识别与批次' },
  { id: 'review', label: '字段证据复核', hint: 'B07 三栏布局' },
  { id: 'governance', label: '版本与证据治理', hint: '审核 × 发布快照' },
  { id: 'diff', label: 'V1/V2 对照', hint: '只读迁移 diff' },
  { id: 'calories', label: '卡路里估算', hint: '实验性展示' },
];

const PORTRAIT_SUBS: { id: PortraitSub; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'intensity', label: 'Intensity' },
  { id: 'movement', label: 'Movement & Loads' },
  { id: 'goals', label: 'Goals' },
  { id: 'eligibility', label: 'Eligibility' },
  { id: 'evidence', label: 'Evidence & Versions' },
];

const COURSE_FILTERS: { id: CourseFilter; label: string; count: string }[] = [
  { id: 'all', label: '全部', count: '7' },
  { id: '待复核', label: '待复核', count: '3' },
  { id: '异常待处理', label: '异常', count: '2' },
  { id: 'FORBIDDEN', label: 'FORBIDDEN', count: '1' },
  { id: 'REVIEW', label: 'Elig.REVIEW', count: '4' },
  { id: 'POSTPARTUM_RECOVERY', label: '产后恢复', count: '1' },
];

const REASON_CODES = ['EVIDENCE_MISMATCH', 'RULE_CONFLICT', 'LOW_CONFIDENCE', 'CLINICAL_OVERRIDE', 'TAXONOMY_PENDING'];

function formatCoursePrice(price: number) {
  return price === 0 ? '免费' : `¥${price.toFixed(1)}`;
}

function getCourseFilterLabel(filter: CourseFilter) {
  return COURSE_FILTERS.find((item) => item.id === filter)?.label ?? '全部';
}

function eligibilityTone(v: TernaryEligibility): 'safe' | 'warn' | 'danger' {
  if (v === 'ALLOWED') return 'safe';
  if (v === 'REVIEW') return 'warn';
  return 'danger';
}

function loadTone(v: LocalLoadLevel | ObservationLevel): string {
  if (v === 'UNKNOWN') return 'border-slate-300 bg-slate-100 text-slate-600';
  if (v === 'HIGH' || v === 'FREQUENT') return 'border-rose-200 bg-rose-50 text-rose-700';
  if (v === 'MEDIUM' || v === 'SOME') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-emerald-200 bg-emerald-50 text-emerald-700';
}

function reviewStatusLabel(s: ReviewStatus) {
  const map: Record<ReviewStatus, string> = {
    DRAFT: '草稿',
    AI_GENERATED: 'AI 已生成',
    NEEDS_REVIEW: '待复核',
    APPROVED: '已批准',
    REJECTED: '已驳回',
    SUPERSEDED: '已替代',
  };
  return map[s];
}

function matchesFilter(course: Course, filter: CourseFilter): boolean {
  if (filter === 'all') return true;
  if (filter === '待复核' || filter === '可用于排课' || filter === '异常待处理') return course.status === filter;
  if (filter === 'FORBIDDEN') return course.profile.eligibility.menstrual === 'FORBIDDEN' || course.profile.eligibility.postpartum === 'FORBIDDEN';
  if (filter === 'REVIEW') return course.profile.eligibility.menstrual === 'REVIEW' || course.profile.eligibility.postpartum === 'REVIEW';
  if (filter === 'POSTPARTUM_RECOVERY') return course.profile.identity.primary_workout_type === 'POSTPARTUM_RECOVERY';
  if (filter === 'V2_ONLY') return course.hasV2 && !course.hasV1;
  return true;
}

/* ─────────────── UI Atoms ─────────────── */

function StatusBadge({ status }: { status: CourseStatus }) {
  const styles = {
    可用于排课: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    待复核: 'border-amber-200 bg-amber-50 text-amber-700',
    异常待处理: 'border-rose-200 bg-rose-50 text-rose-700',
  };
  const icons = { 可用于排课: CheckCircle2, 待复核: CircleDashed, 异常待处理: AlertTriangle };
  const Icon = icons[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold', styles[status])}>
      <Icon size={12} />
      {status}
    </span>
  );
}

function ScoreBar({ value, color = 'bg-slate-700' }: { value: number; color?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-1.5 flex-1 gap-0.5 rounded-full bg-slate-100">
        {[1, 2, 3, 4, 5].map((step) => (
          <span key={step} className={cn('h-full flex-1 rounded-full', step <= value ? color : 'bg-slate-100')} />
        ))}
      </div>
      <span className="w-4 text-right text-xs font-bold text-slate-700">{value}</span>
    </div>
  );
}

function MetricCard({ label, value, suffix, note, color }: { label: string; value: string; suffix?: string; note: string; color: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <span className={cn('h-2 w-2 rounded-full', color)} />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
        {value}
        <span className="ml-1 text-sm font-medium text-slate-400">{suffix}</span>
      </p>
      <p className="mt-1 text-[11px] text-slate-400">{note}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, title, detail, action }: { icon: typeof Activity; title: string; detail: string; action?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon size={16} />
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          <p className="mt-0.5 text-[11px] text-slate-400">{detail}</p>
        </div>
      </div>
      {action && <span className="text-[11px] font-medium text-slate-400">{action}</span>}
    </div>
  );
}

function LevelPill({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn('flex items-center justify-between rounded-xl border px-3 py-2.5', loadTone(value as LocalLoadLevel))}>
      <span className="text-[11px] font-medium">{label}</span>
      <span className="text-xs font-bold">{value}</span>
    </div>
  );
}

function EligibilityPill({ label, value }: { label: string; value: TernaryEligibility }) {
  const tone = eligibilityTone(value);
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-xl border px-3 py-2.5',
        tone === 'safe' ? 'border-emerald-100 bg-emerald-50/60' : tone === 'warn' ? 'border-amber-100 bg-amber-50/60' : 'border-rose-100 bg-rose-50/60',
      )}
    >
      <span className="text-[11px] text-slate-600">{label}</span>
      <span className={cn('text-xs font-bold', tone === 'safe' ? 'text-emerald-700' : tone === 'warn' ? 'text-amber-700' : 'text-rose-700')}>{value}</span>
    </div>
  );
}

function FieldChain({
  field,
  value,
  metric,
  rule,
  evidence,
  source,
  review,
}: {
  field: string;
  value: string;
  metric: string;
  rule: string;
  evidence: string;
  source: string;
  review: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3 text-[11px]">
      <div className="flex flex-wrap items-center gap-1.5 font-semibold text-slate-800">
        <span>{field}</span>
        <ChevronRight size={11} className="text-slate-300" />
        <span className="font-mono text-violet-700">{value}</span>
      </div>
      <p className="mt-2 text-slate-500">
        原始指标 <b className="text-slate-700">{metric}</b>
        <span className="mx-1.5 text-slate-300">→</span>
        命中规则 <b className="font-mono text-slate-700">{rule}</b>
        <span className="mx-1.5 text-slate-300">→</span>
        证据 <b className="text-slate-700">{evidence}</b>
      </p>
      <p className="mt-1 text-slate-400">
        来源/版本 {source} · 审核 {review}
      </p>
    </div>
  );
}

/* ─────────────── Main View ─────────────── */

export function CourseTaggingDemoView({ embedded = false }: { embedded?: boolean }) {
  const [activeTab, setActiveTab] = useState<TabId>('portrait');
  const [portraitSub, setPortraitSub] = useState<PortraitSub>('identity');
  const [selectedId, setSelectedId] = useState('WALK_001');
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState<CourseFilter>('all');
  const [weight, setWeight] = useState('60');
  const [completion, setCompletion] = useState(100);
  const [evidenceIndex, setEvidenceIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [toast, setToast] = useState('');
  const [reasonCode, setReasonCode] = useState(REASON_CODES[0]);
  const [decisions, setDecisions] = useState<Record<string, Decision>>({
    overall: 'accept',
    running: 'accept',
    jump: 'accept',
    knee: 'accept',
    menstrual: 'edit',
    postpartum: 'edit',
  });

  const selectedCourse = COURSES.find((c) => c.id === selectedId) ?? COURSES[0];
  const p = selectedCourse.profile;

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    return COURSES.filter((course) => {
      const matchesSearch =
        !query ||
        `${course.id} ${course.name} ${course.profile.identity.primary_workout_type ?? ''}`.toLowerCase().includes(query);
      return matchesSearch && matchesFilter(course, courseFilter);
    });
  }, [courseFilter, search]);

  const met = p.intensity.met ?? 0;
  const durationMin = p.identity.duration_sec / 60;
  const parsedWeight = Math.max(Number(weight) || 60, 30);
  const effectiveMinutes = durationMin * (completion / 100);
  const grossKcal = 0.0175 * met * parsedWeight * effectiveMinutes;
  const activeKcal = 0.0175 * Math.max(met - 1, 0) * parsedWeight * effectiveMinutes;
  const roundedGross = Math.max(0, Math.round(grossKcal / 5) * 5);
  const roundedActive = Math.max(0, Math.round(activeKcal / 5) * 5);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const selectCourseFilter = (filter: CourseFilter) => {
    setCourseFilter(filter);
    const next = COURSES.find((c) => matchesFilter(c, filter));
    if (next) {
      setSelectedId(next.id);
      setEvidenceIndex(0);
      setReviewSubmitted(false);
    }
    showToast(`已切换至「${getCourseFilterLabel(filter)}」`);
  };

  const runAiBatch = () => {
    setIsRunning(true);
    window.setTimeout(() => {
      setIsRunning(false);
      showToast('批次 #42 已完成；UNKNOWN/冲突课程进入 REVIEW，未显示为低风险');
    }, 1000);
  };

  const setDecision = (key: string, decision: Decision) => {
    setDecisions((cur) => ({ ...cur, [key]: decision }));
    setReviewSubmitted(false);
    if (decision === 'edit' || decision === 'reject' || decision === 'unknown') {
      showToast(`已标记为 ${decision.toUpperCase()}，请确认原因码 ${reasonCode}`);
    }
  };

  const actionSummary = `Run ${p.action_exposure.running} / Jump ${p.action_exposure.jump} / Ankle ${p.local_load.ankle}`;

  return (
    <div className={cn('text-slate-900', embedded ? 'bg-transparent' : 'min-h-full bg-[#f6f8fb]')}>
      <div className={cn('mx-auto max-w-[1440px]', embedded ? 'px-2 py-2' : 'px-6 py-6 lg:px-8')}>
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <span>Content Ops</span>
              <ChevronRight size={12} />
              <span>Course Profile V2</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Course Profile V2 治理工作台</h1>
            <p className="mt-1 text-sm text-slate-500">
              Motion 观察事实 → Go 规则草稿 → B07 逐字段复核 → B04 不可变版本；UNKNOWN/冲突进入 REVIEW，不暗示医学判断。
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-violet-500" />
            course_profile_v2 · tagging_rules_v2.1 · eligibility_rules_v2.0
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <MetricCard label="演示课程" value="7" suffix="节" note="含 Walking→Unknown 全覆盖" color="bg-slate-700" />
          <MetricCard label="NEEDS_REVIEW" value="4" suffix="节" note="含安全与 UNKNOWN" color="bg-amber-400" />
          <MetricCard label="FORBIDDEN" value="1" suffix="节" note="HIIT 经期/产后禁用" color="bg-rose-400" />
          <MetricCard label="APPROVED" value="2" suffix="节" note="可被 B12 规则读取" color="bg-emerald-500" />
        </div>

        {/* Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
          <div className="flex flex-wrap gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative rounded-t-xl px-4 py-3 text-left transition',
                  activeTab === tab.id ? 'bg-white text-slate-900 shadow-[0_-1px_0_0_rgba(226,232,240,1)]' : 'text-slate-400 hover:text-slate-700',
                )}
              >
                <span className="block text-xs font-bold">{tab.label}</span>
                <span className="mt-0.5 block text-[10px]">{tab.hint}</span>
                {activeTab === tab.id && <span className="absolute inset-x-4 -bottom-px h-0.5 rounded-full bg-violet-600" />}
              </button>
            ))}
          </div>
          <span className="mb-2 text-[11px] text-slate-400">B06 字典 → B07 复核 → B04 版本 → B12/B13 匹配</span>
        </div>

        {toast && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
            <CheckCircle2 size={15} />
            {toast}
          </div>
        )}

        <div className="mt-5 grid min-w-0 gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm xl:sticky xl:top-5">
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-sm font-bold text-slate-900">课程池 · V2</p>
                <p className="mt-0.5 text-[11px] text-slate-400">按 Eligibility / 类型筛选</p>
              </div>
              <button type="button" onClick={() => showToast('已打开批量导入向导')} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50">
                <UploadCloud size={15} />
              </button>
            </div>
            <label className="mt-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <Search size={15} className="text-slate-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="搜索课程 / ID" className="w-full bg-transparent text-xs outline-none placeholder:text-slate-400" />
            </label>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {COURSE_FILTERS.map((filter) => {
                const isActive = courseFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => selectCourseFilter(filter.id)}
                    className={cn(
                      'rounded-full border px-2.5 py-1 text-[10px] font-semibold transition',
                      isActive ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
                    )}
                  >
                    {filter.label} {filter.count}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 space-y-1.5">
              {filteredCourses.map((course) => {
                const cp = course.profile;
                return (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(course.id);
                      setEvidenceIndex(0);
                      setReviewSubmitted(false);
                    }}
                    className={cn(
                      'w-full rounded-xl border p-3 text-left transition',
                      selectedCourse.id === course.id ? 'border-slate-900 bg-slate-900 text-white shadow-sm' : 'border-transparent hover:border-slate-200 hover:bg-slate-50',
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-bold">{course.name}</p>
                        <p className={cn('mt-1 font-mono text-[10px]', selectedCourse.id === course.id ? 'text-slate-300' : 'text-slate-400')}>
                          {course.id} · {cp.identity.duration_sec / 60} min
                        </p>
                      </div>
                      <span
                        className={cn(
                          'mt-0.5 h-2 w-2 shrink-0 rounded-full',
                          course.status === '可用于排课' ? 'bg-emerald-400' : course.status === '待复核' ? 'bg-amber-400' : 'bg-rose-400',
                        )}
                      />
                    </div>
                    <div className={cn('mt-2 text-[10px]', selectedCourse.id === course.id ? 'text-slate-300' : 'text-slate-400')}>
                      {cp.identity.primary_workout_type} · Overall {cp.intensity.overall ?? '—'}
                    </div>
                    <div className={cn('mt-1 text-[10px]', selectedCourse.id === course.id ? 'text-slate-400' : 'text-slate-400')}>
                      M:{cp.eligibility.menstrual.slice(0, 3)} / P:{cp.eligibility.postpartum.slice(0, 3)} · {reviewStatusLabel(cp.governance.review_status)}
                    </div>
                  </button>
                );
              })}
              {filteredCourses.length === 0 && <p className="px-2 py-6 text-center text-xs text-slate-400">没有匹配课程</p>}
            </div>
          </aside>

          <main className="min-w-0 space-y-5">
            {/* ──── Portrait Tab ──── */}
            {activeTab === 'portrait' && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                        <Video size={20} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-bold tracking-tight text-slate-950">{selectedCourse.name}</h2>
                          <StatusBadge status={selectedCourse.status} />
                          <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700">
                            {reviewStatusLabel(p.governance.review_status)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{selectedCourse.subtitle}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span className="font-mono text-slate-400">{selectedCourse.id}</span>
                          <span>·</span>
                          <span>{p.identity.content_type}</span>
                          <span>·</span>
                          <span>{p.identity.primary_workout_type}</span>
                          <span>·</span>
                          <span>{p.identity.primary_body_area}</span>
                          <span>·</span>
                          <span>{durationMin} 分钟</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => showToast('已打开视频预览')} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
                        <Play size={14} />
                        预览视频
                      </button>
                      <button type="button" onClick={() => setActiveTab('review')} className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800">
                        <ClipboardCheck size={14} />
                        去复核
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    {[
                      { label: 'Overall Intensity', value: p.intensity.overall != null ? `${p.intensity.overall}/5` : 'UNKNOWN', icon: Gauge },
                      { label: 'Action Exposure', value: actionSummary, icon: Activity },
                      { label: 'Menstrual', value: p.eligibility.menstrual, icon: ShieldCheck },
                      { label: 'Postpartum', value: p.eligibility.postpartum, icon: ShieldCheck },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
                            <Icon size={13} className="text-slate-400" />
                          </div>
                          <p className="mt-2 text-sm font-bold leading-snug text-slate-900">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-1.5 border-b border-slate-100 pb-0">
                    {PORTRAIT_SUBS.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => setPortraitSub(sub.id)}
                        className={cn(
                          'rounded-t-lg px-3 py-2 text-[11px] font-semibold transition',
                          portraitSub === sub.id ? 'bg-violet-50 text-violet-800' : 'text-slate-400 hover:text-slate-700',
                        )}
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                </section>

                {portraitSub === 'identity' && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionTitle icon={Layers3} title="Identity" detail="内容类型 · 主训练类型 · 主部位 · 时长" />
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ['content_type', p.identity.content_type],
                        ['primary_workout_type', p.identity.primary_workout_type ?? '—'],
                        ['primary_body_area', p.identity.primary_body_area ?? '—'],
                        ['duration_sec', String(p.identity.duration_sec)],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <p className="font-mono text-[10px] text-slate-400">{k}</p>
                          <p className="mt-1 text-sm font-bold text-slate-800">{v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 space-y-2">
                      <FieldChain
                        field="primary_workout_type"
                        value={p.identity.primary_workout_type ?? '—'}
                        metric={`关键动作：${selectedCourse.keyActions.join('、')}`}
                        rule="TAG_IDENTITY_FROM_MOTION"
                        evidence={selectedCourse.evidence[0]?.time ?? '—'}
                        source={`${p.tagging_rule_version}`}
                        review={reviewStatusLabel(p.governance.review_status)}
                      />
                    </div>
                    {p.identity.primary_workout_type === 'POSTPARTUM_RECOVERY' && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-800">
                        <b>白名单注意：</b>POSTPARTUM_RECOVERY 类型命中不能自动 ALLOWED；须展示覆盖规则并经健康运营终审。
                      </div>
                    )}
                  </section>
                )}

                {portraitSub === 'intensity' && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionTitle icon={Gauge} title="Intensity" detail="Overall · MET · 来源 · 热量口径 · 状态" />
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                      {[
                        ['overall', p.intensity.overall != null ? String(p.intensity.overall) : 'null / REVIEW'],
                        ['met', p.intensity.met != null ? String(p.intensity.met) : 'UNKNOWN'],
                        ['met_source', p.intensity.met_source ?? '—'],
                        ['calorie_type', p.intensity.calorie_type ?? '—'],
                        ['status', p.intensity.status],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <p className="font-mono text-[10px] text-slate-400">{k}</p>
                          <p className="mt-1 text-sm font-bold text-slate-800">{v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <FieldChain
                        field="overall"
                        value={p.intensity.overall != null ? `${p.intensity.overall}/5` : 'UNKNOWN'}
                        metric={`置信度 ${Math.round(selectedCourse.rawMetrics.confidence * 100)}%`}
                        rule="TAG_INTENSITY_OVERALL_V2"
                        evidence={selectedCourse.evidence.find((e) => e.field === 'intensity')?.time ?? '—'}
                        source={`${p.intensity.met_source} · ${p.tagging_rule_version}`}
                        review={p.intensity.status}
                      />
                    </div>
                    <p className="mt-3 text-[11px] text-slate-400">不要用 Overall 反推旧 Cardio / Muscular / Impact。</p>
                  </section>
                )}

                {portraitSub === 'movement' && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionTitle icon={Activity} title="Movement & Loads" detail="三项动作暴露 · 四项局部负荷 · 原始指标" />
                    <div className="mt-5 grid gap-4 lg:grid-cols-2">
                      <div>
                        <p className="mb-2 text-[11px] font-semibold text-slate-400">action_exposure</p>
                        <div className="space-y-2">
                          <LevelPill label="running" value={p.action_exposure.running} />
                          <LevelPill label="jump" value={p.action_exposure.jump} />
                          <LevelPill label="wrist_bearing" value={p.action_exposure.wrist_bearing} />
                        </div>
                      </div>
                      <div>
                        <p className="mb-2 text-[11px] font-semibold text-slate-400">local_load</p>
                        <div className="space-y-2">
                          <LevelPill label="knee" value={p.local_load.knee} />
                          <LevelPill label="ankle" value={p.local_load.ankle} />
                          <LevelPill label="lower_back" value={p.local_load.lower_back} />
                          <LevelPill label="shoulder" value={p.local_load.shoulder} />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[11px] font-semibold text-slate-400">原始指标（Motion 观察事实）</p>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
                        {[
                          ['jump_ratio', selectedCourse.rawMetrics.jump_ratio_pct < 0 ? 'UNKNOWN' : `${selectedCourse.rawMetrics.jump_ratio_pct}%`],
                          ['running_ratio', selectedCourse.rawMetrics.running_ratio_pct < 0 ? 'UNKNOWN' : `${selectedCourse.rawMetrics.running_ratio_pct}%`],
                          ['wrist_bearing', selectedCourse.rawMetrics.wrist_bearing_ratio_pct < 0 ? 'UNKNOWN' : `${selectedCourse.rawMetrics.wrist_bearing_ratio_pct}%`],
                          ['standing', selectedCourse.rawMetrics.standing_ratio_pct < 0 ? 'UNKNOWN' : `${selectedCourse.rawMetrics.standing_ratio_pct}%`],
                          ['floor', selectedCourse.rawMetrics.floor_ratio_pct < 0 ? 'UNKNOWN' : `${selectedCourse.rawMetrics.floor_ratio_pct}%`],
                          ['confidence', `${Math.round(selectedCourse.rawMetrics.confidence * 100)}%`],
                        ].map(([k, v]) => (
                          <div key={k} className="rounded-lg bg-white px-2.5 py-2">
                            <p className="text-[10px] text-slate-400">{k}</p>
                            <p className="font-bold text-slate-800">{v}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <FieldChain
                        field="jump"
                        value={p.action_exposure.jump}
                        metric={`jump_ratio ${selectedCourse.rawMetrics.jump_ratio_pct < 0 ? 'UNKNOWN' : selectedCourse.rawMetrics.jump_ratio_pct + '%'}`}
                        rule="TAG_JUMP_OBS_V2"
                        evidence={selectedCourse.evidence.find((e) => e.field === 'jump')?.time ?? '—'}
                        source={p.tagging_rule_version}
                        review={p.action_exposure.jump === 'UNKNOWN' ? 'NEEDS_REVIEW' : reviewStatusLabel(p.governance.review_status)}
                      />
                    </div>
                  </section>
                )}

                {portraitSub === 'goals' && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionTitle icon={Target} title="Goals" detail="四项目标贡献及查表规则来源" />
                    <div className="mt-5 space-y-3">
                      {(
                        [
                          ['fat_loss', p.goal_contributions.fat_loss],
                          ['body_shaping', p.goal_contributions.body_shaping],
                          ['healthy_living', p.goal_contributions.healthy_living],
                          ['postpartum_recovery', p.goal_contributions.postpartum_recovery],
                        ] as const
                      ).map(([label, value]) => (
                        <div key={label} className="grid grid-cols-[140px_1fr] items-center gap-3">
                          <span className="font-mono text-[11px] text-slate-500">{label}</span>
                          <ScoreBar value={value} color={value >= 4 ? 'bg-slate-800' : 'bg-slate-400'} />
                        </div>
                      ))}
                    </div>
                    <div className="mt-4">
                      <FieldChain
                        field="goal_contributions"
                        value={`FL${p.goal_contributions.fat_loss}/BS${p.goal_contributions.body_shaping}/HL${p.goal_contributions.healthy_living}/PP${p.goal_contributions.postpartum_recovery}`}
                        metric={`${p.identity.primary_workout_type} × Overall ${p.intensity.overall ?? '—'}`}
                        rule="TAG_GOAL_LOOKUP_V2"
                        evidence="查表 · 非 AI 医学推断"
                        source={p.tagging_rule_version}
                        review={reviewStatusLabel(p.governance.review_status)}
                      />
                    </div>
                  </section>
                )}

                {portraitSub === 'eligibility' && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionTitle icon={ShieldCheck} title="Eligibility" detail="经期 · 产后 · Inversion · 命中规则与覆盖" />
                    <div className="mt-5 grid gap-2 sm:grid-cols-3">
                      <EligibilityPill label="menstrual" value={p.eligibility.menstrual} />
                      <EligibilityPill label="postpartum" value={p.eligibility.postpartum} />
                      <LevelPill label="inversion" value={p.eligibility.inversion} />
                    </div>
                    <div className="mt-5">
                      <p className="text-[11px] font-semibold text-slate-400">triggered_rule_ids</p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {p.eligibility.triggered_rule_ids.map((id) => (
                          <span key={id} className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] text-slate-600">
                            {id}
                          </span>
                        ))}
                      </div>
                    </div>
                    {p.eligibility.override_notes && (
                      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] leading-relaxed text-amber-900">
                        <b>覆盖关系：</b>
                        {p.eligibility.override_notes}
                      </div>
                    )}
                    {(p.eligibility.menstrual === 'REVIEW' || p.eligibility.postpartum === 'REVIEW' || p.action_exposure.jump === 'UNKNOWN') && (
                      <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[11px] text-rose-800">
                        <b>硬约束：</b>UNKNOWN / 证据不足 / 规则冲突必须进入 REVIEW，不能显示为 ALLOWED 或 Low。
                      </div>
                    )}
                    <div className="mt-4 space-y-2">
                      <FieldChain
                        field="menstrual"
                        value={p.eligibility.menstrual}
                        metric={actionSummary}
                        rule={p.eligibility.triggered_rule_ids[0] ?? '—'}
                        evidence={selectedCourse.evidence.find((e) => e.field === 'eligibility' || e.field === 'jump')?.time ?? '—'}
                        source={p.eligibility_rule_version}
                        review={reviewStatusLabel(p.governance.review_status)}
                      />
                    </div>
                  </section>
                )}

                {portraitSub === 'evidence' && (
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionTitle icon={FileVideo} title="Evidence & Versions" detail="时间片 · 置信度 · 审核记录 · 版本" action={`置信 ${Math.round(selectedCourse.rawMetrics.confidence * 100)}%`} />
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      {[
                        ['schema_version', p.schema_version],
                        ['tagging_rule_version', p.tagging_rule_version],
                        ['eligibility_rule_version', p.eligibility_rule_version],
                        ['taxonomy_version', p.governance.taxonomy_version],
                        ['motion_job_id', p.governance.motion_job_id ?? '—'],
                        ['model_version', p.governance.model_version ?? '—'],
                        ['review_status', p.governance.review_status],
                        ['价格', formatCoursePrice(selectedCourse.price)],
                      ].map(([k, v]) => (
                        <div key={k} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{k}</p>
                          <p className="mt-1 break-words text-xs font-bold text-slate-800">{v}</p>
                        </div>
                      ))}
                    </div>
                    <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
                      <div className="flex min-h-[160px] items-center justify-center rounded-2xl bg-slate-950 p-6 text-white">
                        <div className="text-center">
                          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10">
                            <Play size={22} fill="currentColor" />
                          </div>
                          <p className="mt-3 text-xs font-semibold">视频预览占位</p>
                          <p className="mt-1 text-[10px] text-slate-400">
                            {selectedCourse.name} · {durationMin}:00
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        {selectedCourse.evidence.map((item, index) => (
                          <button
                            type="button"
                            key={item.time}
                            onClick={() => setEvidenceIndex(index)}
                            className={cn('w-full rounded-xl border p-3 text-left transition', evidenceIndex === index ? 'border-slate-900 bg-slate-50' : 'border-slate-100 hover:border-slate-300')}
                          >
                            <div className="flex items-start gap-3">
                              <span className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold', evidenceIndex === index ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500')}>
                                {index + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="font-mono text-[11px] font-bold text-slate-700">{item.time}</span>
                                  <span className="text-[11px] font-semibold text-slate-800">{item.title}</span>
                                  {item.field && <span className="rounded bg-violet-50 px-1.5 py-0.5 font-mono text-[9px] text-violet-700">{item.field}</span>}
                                </div>
                                <p className="mt-1 text-[11px] leading-relaxed text-slate-400">{item.detail}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
              </>
            )}

            {/* ──── AI Tab ──── */}
            {activeTab === 'ai' && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionTitle icon={Sparkles} title="AI / Motion 初次打标批次 #42" detail="Motion 观察事实 → Go 规则推导 V2 草稿" />
                    <button type="button" onClick={runAiBatch} disabled={isRunning} className="flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-70">
                      {isRunning ? <RefreshCw size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                      {isRunning ? '重新识别中…' : '重新运行批次'}
                    </button>
                  </div>
                  <div className="mt-6 grid gap-3 md:grid-cols-4">
                    {[
                      { label: '素材准备', value: '7 / 7', done: true },
                      { label: 'Motion 事实', value: '7 / 7', done: true },
                      { label: 'Go 规则推导', value: '6 / 7', done: false },
                      { label: '进入 REVIEW', value: '4 节', done: false },
                    ].map((step, index) => (
                      <div key={step.label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-semibold text-slate-600">
                            0{index + 1} · {step.label}
                          </span>
                          {step.done ? <CheckCircle2 size={15} className="text-emerald-500" /> : <CircleDashed size={15} className="text-amber-500" />}
                        </div>
                        <p className="mt-3 text-lg font-bold text-slate-900">{step.value}</p>
                      </div>
                    ))}
                  </div>
                </section>
                <div className="grid gap-5 lg:grid-cols-2">
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionTitle icon={Activity} title="Motion 观察事实" detail="只负责「看到了什么」" />
                    <div className="mt-5 space-y-2">
                      {[
                        `Running 比例：${selectedCourse.rawMetrics.running_ratio_pct < 0 ? 'UNKNOWN' : selectedCourse.rawMetrics.running_ratio_pct + '%'} → ${p.action_exposure.running}`,
                        `Jump 比例：${selectedCourse.rawMetrics.jump_ratio_pct < 0 ? 'UNKNOWN' : selectedCourse.rawMetrics.jump_ratio_pct + '%'} → ${p.action_exposure.jump}`,
                        `Wrist Bearing：${selectedCourse.rawMetrics.wrist_bearing_ratio_pct < 0 ? 'UNKNOWN' : selectedCourse.rawMetrics.wrist_bearing_ratio_pct + '%'} → ${p.action_exposure.wrist_bearing}`,
                        `姿态：站立 ${selectedCourse.rawMetrics.standing_ratio_pct < 0 ? 'UNKNOWN' : selectedCourse.rawMetrics.standing_ratio_pct + '%'} / 地面 ${selectedCourse.rawMetrics.floor_ratio_pct < 0 ? 'UNKNOWN' : selectedCourse.rawMetrics.floor_ratio_pct + '%'}`,
                        `关键动作：${selectedCourse.keyActions.join('、')}`,
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-2 rounded-xl border border-slate-100 px-3 py-2.5 text-xs text-slate-600">
                          <Check size={14} className="mt-0.5 shrink-0 text-emerald-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </section>
                  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SectionTitle icon={BarChart3} title="Go 规则推导结果（V2）" detail="不用 Overall 反推旧 Cardio/Muscular/Impact" />
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {[
                        ['Overall Intensity', p.intensity.overall != null ? String(p.intensity.overall) : 'REVIEW', 'TAG_INTENSITY_OVERALL_V2'],
                        ['Workout Type', p.identity.primary_workout_type ?? '—', 'TAG_IDENTITY_FROM_MOTION'],
                        ['Menstrual Elig.', p.eligibility.menstrual, p.eligibility.triggered_rule_ids[0] ?? '—'],
                        ['Postpartum Elig.', p.eligibility.postpartum, p.eligibility.triggered_rule_ids[1] ?? p.eligibility.triggered_rule_ids[0] ?? '—'],
                        ['Knee Load', p.local_load.knee, 'TAG_KNEE_LOAD_V2'],
                        ['Jump Exposure', p.action_exposure.jump, 'TAG_JUMP_OBS_V2'],
                      ].map(([label, value, rule]) => (
                        <div key={label} className="rounded-xl bg-slate-50 p-3">
                          <p className="text-[10px] font-semibold text-slate-400">{label}</p>
                          <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
                          <p className="mt-1 font-mono text-[10px] text-slate-400">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                </div>
                <section className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle size={17} className="mt-0.5 shrink-0 text-amber-600" />
                    <div>
                      <p className="text-sm font-bold text-amber-900">自动分流规则</p>
                      <p className="mt-1 text-xs leading-relaxed text-amber-800">
                        UNKNOWN、证据不足、规则冲突、低置信度（&lt;75%）不进入批量接受；Eligibility 安全字段必须人工终审。原型不暗示 AI 能给出医学判断。
                      </p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* ──── Review Tab (B07 三栏) ──── */}
            {activeTab === 'review' && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionTitle icon={ClipboardCheck} title="B07 字段证据复核" detail="播放器 + 字段表单 + 规则解释" />
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">NEEDS_REVIEW</span>
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        原因码
                        <select value={reasonCode} onChange={(e) => setReasonCode(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-2 py-1 font-mono text-[10px]">
                          {REASON_CODES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)_minmax(0,0.9fr)]">
                    {/* Left: player + timeline */}
                    <div className="space-y-3">
                      <div className="rounded-2xl bg-slate-950 p-5 text-white">
                        <div className="flex min-h-[200px] flex-col items-center justify-center text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/20 bg-white/10">
                            <Play size={22} fill="currentColor" />
                          </div>
                          <p className="mt-3 text-sm font-semibold">{selectedCourse.name}</p>
                          <p className="mt-1 text-[11px] text-slate-400">点击证据片段跳转时间点</p>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <span className="font-mono text-[10px] text-slate-400">{selectedCourse.evidence[evidenceIndex]?.time}</span>
                          <div className="h-1.5 flex-1 rounded-full bg-white/10">
                            <div className="h-1.5 w-2/5 rounded-full bg-amber-300" />
                          </div>
                          <span className="font-mono text-[10px] text-slate-400">{durationMin}:00</span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        {selectedCourse.evidence.map((item, index) => (
                          <button
                            type="button"
                            key={item.time}
                            onClick={() => setEvidenceIndex(index)}
                            className={cn('w-full rounded-xl border px-3 py-2 text-left text-xs', evidenceIndex === index ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50')}
                          >
                            <span className="font-mono text-[10px]">{item.time}</span>
                            <span className="ml-2 font-semibold">{item.title}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Middle: fields + decisions */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">正式字段 · AI/规则建议 · 人工裁决</p>
                      {(
                        [
                          ['overall', 'Overall Intensity', p.intensity.overall != null ? `${p.intensity.overall}/5` : 'UNKNOWN'],
                          ['running', 'Running Exposure', p.action_exposure.running],
                          ['jump', 'Jump Exposure', p.action_exposure.jump],
                          ['knee', 'Knee Load', p.local_load.knee],
                          ['menstrual', 'Menstrual Eligibility', p.eligibility.menstrual],
                          ['postpartum', 'Postpartum Eligibility', p.eligibility.postpartum],
                        ] as const
                      ).map(([key, label, value]) => (
                        <div key={key} className="rounded-xl border border-slate-100 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="text-xs font-semibold text-slate-700">{label}</p>
                              <p className="mt-0.5 font-mono text-[11px] text-violet-700">{value}</p>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {(['accept', 'edit', 'unknown', 'reject'] as Decision[]).map((d) => (
                              <button
                                key={d}
                                type="button"
                                onClick={() => setDecision(key, d)}
                                className={cn(
                                  'rounded-lg px-2 py-1.5 text-[10px] font-semibold',
                                  decisions[key] === d
                                    ? d === 'accept'
                                      ? 'bg-emerald-100 text-emerald-700'
                                      : d === 'edit'
                                        ? 'bg-amber-100 text-amber-700'
                                        : d === 'unknown'
                                          ? 'bg-slate-200 text-slate-700'
                                          : 'bg-rose-100 text-rose-700'
                                    : 'bg-slate-100 text-slate-400',
                                )}
                              >
                                {d === 'accept' ? '接受' : d === 'edit' ? '修改' : d === 'unknown' ? '设 Unknown' : '驳回'}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                      {p.identity.primary_workout_type === 'POSTPARTUM_RECOVERY' && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-[11px] text-amber-900">
                          <b>双审提醒：</b>覆盖规则 {p.eligibility.triggered_rule_ids.join(', ')}；类型命中 ≠ 自动 ALLOWED。
                        </div>
                      )}
                    </div>

                    {/* Right: metrics + rules */}
                    <div className="space-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">原始指标 · 阈值 · 命中规则</p>
                      <div className="space-y-2 text-xs text-slate-600">
                        <p>
                          jump_ratio：<b>{selectedCourse.rawMetrics.jump_ratio_pct < 0 ? 'UNKNOWN' : `${selectedCourse.rawMetrics.jump_ratio_pct}%`}</b>
                        </p>
                        <p>
                          running_ratio：<b>{selectedCourse.rawMetrics.running_ratio_pct < 0 ? 'UNKNOWN' : `${selectedCourse.rawMetrics.running_ratio_pct}%`}</b>
                        </p>
                        <p>
                          置信度：<b>{Math.round(selectedCourse.rawMetrics.confidence * 100)}%</b>
                        </p>
                        <p>
                          阈值：Jump FREQUENT ≥ 20% · Knee HIGH ≥ 规则表
                        </p>
                      </div>
                      <div className="border-t border-slate-200 pt-3">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">命中规则</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {p.eligibility.triggered_rule_ids.map((id) => (
                            <span key={id} className="rounded bg-white px-2 py-1 font-mono text-[9px] text-slate-600 ring-1 ring-slate-200">
                              {id}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500">
                        <p>版本：{p.schema_version}</p>
                        <p className="mt-1">打标：{p.tagging_rule_version}</p>
                        <p className="mt-1">适用性：{p.eligibility_rule_version}</p>
                        <p className="mt-1">历史差异：V1 Impact {selectedCourse.v1.impact} ≠ V2 Jump/Ankle（不可自动等价）</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <UserRound size={14} className="text-slate-400" />
                      内容运营复核 · 安全类需健康运营终审 · 修改/驳回必填原因码
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setReviewSubmitted(true);
                        showToast(`已提交终审 · 原因码 ${reasonCode} · 将生成不可变 Profile 版本`);
                      }}
                      className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      <CheckCircle2 size={14} />
                      {reviewSubmitted ? '已提交终审' : '提交终审'}
                    </button>
                  </div>
                </section>
              </>
            )}

            {/* ──── Governance Tab ──── */}
            {activeTab === 'governance' && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionTitle icon={ShieldCheck} title="Course Profile V2 发布快照" detail="字段级证据 × 审核 × 不可变版本" />
                    <StatusBadge status={selectedCourse.status} />
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                      ['Profile Schema', p.schema_version],
                      ['Review Status', p.governance.review_status],
                      ['证据完整度', selectedCourse.rawMetrics.confidence >= 0.8 ? '完整' : '待补证据 / UNKNOWN'],
                      ['排课可读', p.governance.review_status === 'APPROVED' ? '是' : '否'],
                    ].map(([label, value]) => (
                      <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
                        <p className="mt-1 break-words text-sm font-bold text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
                    <div className="grid grid-cols-[minmax(0,1fr)_140px_100px_140px] gap-3 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>字段 (technical key)</span>
                      <span>当前值</span>
                      <span>置信度</span>
                      <span>审核状态</span>
                    </div>
                    {[
                      ['identity.primary_workout_type', p.identity.primary_workout_type ?? '—', selectedCourse.rawMetrics.confidence],
                      ['intensity.overall', p.intensity.overall != null ? String(p.intensity.overall) : 'UNKNOWN', selectedCourse.rawMetrics.confidence],
                      ['action_exposure.jump', p.action_exposure.jump, selectedCourse.rawMetrics.confidence],
                      ['local_load.knee', p.local_load.knee, selectedCourse.rawMetrics.confidence - 0.05],
                      ['eligibility.menstrual', p.eligibility.menstrual, selectedCourse.rawMetrics.confidence - 0.08],
                      ['eligibility.postpartum', p.eligibility.postpartum, selectedCourse.rawMetrics.confidence - 0.08],
                    ].map(([label, value, conf]) => {
                      const confidence = conf as number;
                      const status =
                        String(value) === 'UNKNOWN' || confidence < 0.75
                          ? 'NEEDS_REVIEW'
                          : p.governance.review_status === 'APPROVED'
                            ? 'APPROVED'
                            : p.governance.review_status;
                      return (
                        <div key={label as string} className="grid grid-cols-[minmax(0,1fr)_140px_100px_140px] items-center gap-3 border-t border-slate-100 px-4 py-3 text-xs">
                          <p className="font-mono font-semibold text-slate-700">{label as string}</p>
                          <span className="truncate text-slate-600">{value as string}</span>
                          <span className={cn('font-mono font-bold', confidence < 0.75 ? 'text-rose-600' : 'text-slate-600')}>{Math.round(confidence * 100)}%</span>
                          <span className={cn('font-semibold', status === 'NEEDS_REVIEW' ? 'text-amber-600' : status === 'APPROVED' ? 'text-emerald-600' : 'text-slate-500')}>{status}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3 text-[11px] leading-relaxed text-blue-800">
                    APPROVED 与未批准 Profile 视觉状态清晰区分；修改形成新版本差异，不覆盖历史。MET/卡路里为实验性展示，不参与 Hard Filter。
                  </div>
                </section>
              </>
            )}

            {/* ──── V1/V2 Diff Tab ──── */}
            {activeTab === 'diff' && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <SectionTitle icon={GitCompare} title="V1 / V2 只读对照" detail={`当前课程 ${selectedCourse.id} · 迁移期不伪造映射`} />
                  <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
                    <span className="rounded-full border border-slate-200 px-2.5 py-1">V1 schema: course_profile_v1.0</span>
                    <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-violet-700">V2 schema: {p.schema_version}</span>
                    <span className="rounded-full border border-slate-200 px-2.5 py-1">hasV1: {String(selectedCourse.hasV1)}</span>
                    <span className="rounded-full border border-slate-200 px-2.5 py-1">冲突: {String(!!selectedCourse.v1v2Conflict)}</span>
                  </div>
                  <div className="mt-5 overflow-hidden rounded-xl border border-slate-100">
                    <div className="grid grid-cols-3 gap-3 bg-slate-50 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      <span>V1 字段</span>
                      <span>V2 表达</span>
                      <span>说明</span>
                    </div>
                    {[
                      {
                        v1: `Impact ${selectedCourse.v1.impact}`,
                        v2: `Running ${p.action_exposure.running} / Jump ${p.action_exposure.jump} / Ankle ${p.local_load.ankle}`,
                        note: '非一对一转换',
                      },
                      {
                        v1: `Cardio ${selectedCourse.v1.cardio}`,
                        v2: `${p.identity.primary_workout_type ?? '—'} + Overall ${p.intensity.overall ?? '—'}`,
                        note: '仅对照，不自动等价',
                      },
                      {
                        v1: `Muscular ${selectedCourse.v1.muscle}`,
                        v2: `${p.identity.primary_workout_type === 'STRENGTH' ? 'STRENGTH' : p.identity.primary_workout_type ?? '—'} + Knee ${p.local_load.knee}`,
                        note: '仅对照，不自动等价',
                      },
                      {
                        v1: `经期风险 ${selectedCourse.v1.menstrualRisk}`,
                        v2: `Menstrual ${p.eligibility.menstrual}`,
                        note: '展示命中规则',
                      },
                      {
                        v1: `产后风险 ${selectedCourse.v1.postpartumRisk}`,
                        v2: `Postpartum ${p.eligibility.postpartum}`,
                        note: selectedCourse.v1v2Conflict ? '不可自动迁移（结果不一致）' : '展示命中规则',
                      },
                      {
                        v1: `secondaryType ${selectedCourse.v1.secondaryType}`,
                        v2: '（V2 已移除）',
                        note: '不可自动迁移',
                      },
                    ].map((row) => (
                      <div key={row.v1} className="grid grid-cols-3 gap-3 border-t border-slate-100 px-4 py-3 text-xs">
                        <span className="text-slate-600">{row.v1}</span>
                        <span className="font-medium text-slate-800">{row.v2}</span>
                        <span className={cn('text-[11px]', row.note.includes('不可') ? 'font-semibold text-amber-700' : 'text-slate-400')}>{row.note}</span>
                      </div>
                    ))}
                  </div>
                  {!selectedCourse.hasV1 && (
                    <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[11px] text-amber-800">
                      本课程仅有 V2；不存在可靠 V1 映射时显示「不可自动迁移」，不要伪造 V2 值。
                    </div>
                  )}
                </section>
              </>
            )}

            {/* ──── Calories Tab ──── */}
            {activeTab === 'calories' && (
              <>
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <SectionTitle icon={Flame} title="课程卡路里估算（实验性）" detail="不参与 Hard Filter / 排序；MET 来自 intensity.met_source" />
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">{p.intensity.met_source ?? 'UNKNOWN'}</span>
                  </div>
                  <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
                    <div className="space-y-4">
                      <div className="rounded-2xl bg-slate-900 p-5 text-white">
                        <p className="text-xs text-slate-400">当前课程</p>
                        <p className="mt-1 text-lg font-bold">{selectedCourse.name}</p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          {p.identity.primary_workout_type} · Overall {p.intensity.overall ?? '—'} · MET {met || '—'}
                        </p>
                        <div className="mt-6 grid grid-cols-2 gap-3">
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-[10px] text-slate-400">总消耗</p>
                            <p className="mt-1 text-3xl font-bold">
                              {met ? roundedGross : '—'}
                              <span className="ml-1 text-xs text-slate-400">kcal</span>
                            </p>
                          </div>
                          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                            <p className="text-[10px] text-slate-400">活动消耗</p>
                            <p className="mt-1 text-3xl font-bold">
                              {met ? roundedActive : '—'}
                              <span className="ml-1 text-xs text-slate-400">kcal</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-4">
                        <p className="text-xs font-bold text-slate-700">估算输入</p>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          <label className="rounded-xl bg-slate-50 p-3">
                            <span className="block text-[10px] font-semibold text-slate-400">体重</span>
                            <div className="mt-1 flex items-center gap-1">
                              <input value={weight} onChange={(e) => setWeight(e.target.value)} inputMode="decimal" className="w-16 bg-transparent text-lg font-bold text-slate-800 outline-none" />
                              <span className="text-xs text-slate-400">kg</span>
                            </div>
                          </label>
                          <div className="rounded-xl bg-slate-50 p-3">
                            <span className="block text-[10px] font-semibold text-slate-400">有效时长</span>
                            <p className="mt-1 text-lg font-bold text-slate-800">
                              {effectiveMinutes.toFixed(1)}
                              <span className="ml-1 text-xs font-medium text-slate-400">min</span>
                            </p>
                          </div>
                        </div>
                        <label className="mt-4 block">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400">
                            <span>完成度</span>
                            <span className="text-slate-700">{completion}%</span>
                          </div>
                          <input type="range" min="20" max="100" step="5" value={completion} onChange={(e) => setCompletion(Number(e.target.value))} className="mt-3 w-full accent-slate-900" />
                        </label>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                      <div className="flex items-center gap-2">
                        <Clock3 size={16} className="text-slate-500" />
                        <p className="text-sm font-bold text-slate-800">运营提示</p>
                      </div>
                      <ul className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600">
                        <li>• calorie_type = {p.intensity.calorie_type ?? 'UNKNOWN'}；MET UNKNOWN 时不估算。</li>
                        <li>• 卡路里结果不能绕过 Menstrual / Postpartum Eligibility。</li>
                        <li>• 不用 Overall 反推旧 Cardio / Muscular / Impact。</li>
                      </ul>
                      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-3 font-mono text-[10px] leading-relaxed text-slate-500">
                        总消耗 = 0.0175 × MET × 体重kg × 有效分钟数
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
