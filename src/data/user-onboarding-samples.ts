/**
 * 样本用户 Onboarding 答卷 — 用于后台标签展示与 Profile 推导演示
 */

export interface OnboardingAnswer {
  questionId: string;
  value: string | string[];
}

export interface UserOnboardingSubmission {
  userId: string;
  nickname: string;
  questionnaireVersion: string;
  completedAt: string;
  consentVersion: string;
  answers: OnboardingAnswer[];
  lifecycleBranchId?: string;
  lifecycleAnswers?: OnboardingAnswer[];
  pathTaken: string[];
}

function ans(id: string, value: string | string[]): OnboardingAnswer {
  return { questionId: id, value };
}

/** U-08771：减脂 + 膝限制 + 规律周期 — 对齐 PROFILE_EXAMPLE */
const U08771: UserOnboardingSubmission = {
  userId: 'U-08771',
  nickname: '小鹿',
  questionnaireVersion: 'onboarding_v1.0',
  completedAt: '2026-08-28T10:30:00Z',
  consentVersion: 'consent_2026_08',
  pathTaken: [
    'Q01', 'Q02', 'Q03', 'Q04', 'Q05', 'Q06', 'Q07', 'Q08', 'Q09', 'Q10',
    'Q11', 'Q13', 'Q14', 'Q15', 'L1', 'SUMMARY',
  ],
  answers: [
    ans('Q01', '35–44'),
    ans('Q02', '165cm / 68kg'),
    ans('Q03', '减脂'),
    ans('Q04', '健康生活与建立习惯'),
    ans('Q05', '每周2–3次'),
    ans('Q06', '可完成但需要休息'),
    ans('Q07', '避免跳跃'),
    ans('Q08', ['膝']),
    ans('Q09', '会影响动作'),
    ans('Q10', ['15', '20']),
    ans('Q11', '4'),
    ans('Q13', ['步行/低冲击有氧', '力量']),
    ans('Q14', ['跳跃']),
    ans('Q15', '规律周期'),
  ],
  lifecycleBranchId: 'L1',
  lifecycleAnswers: [
    ans('L1-last_period', '2026-08-01'),
    ans('L1-cycle_days', '28'),
  ],
};

/** U-10231：新手 + 周期不规律 — 能力偏低、跨题快速路径 */
const U10231: UserOnboardingSubmission = {
  userId: 'U-10231',
  nickname: '阿宁',
  questionnaireVersion: 'onboarding_v1.0',
  completedAt: '2026-08-15T14:20:00Z',
  consentVersion: 'consent_2026_08',
  pathTaken: [
    'Q01', 'Q02', 'Q03', 'Q05', 'Q06', 'Q10', 'Q11', 'Q13', 'Q14', 'Q15', 'L2', 'SUMMARY',
  ],
  answers: [
    ans('Q01', '25–34'),
    ans('Q02', '160cm / 55kg'),
    ans('Q03', '健康生活与建立习惯'),
    ans('Q05', '几乎不运动'),
    ans('Q06', '很吃力'),
    ans('Q10', ['10', '15']),
    ans('Q11', '2'),
    ans('Q13', ['拉伸恢复', '步行/低冲击有氧']),
    ans('Q14', ['快速转向']),
    ans('Q15', '周期不规律'),
  ],
  lifecycleBranchId: 'L2',
  lifecycleAnswers: [
    ans('L2-variability', '7–14天差异'),
  ],
};

/** U-6102：产后恢复 — Q03 产后 + Q15 产后 → L6 */
const U6102: UserOnboardingSubmission = {
  userId: 'U-6102',
  nickname: '沐沐',
  questionnaireVersion: 'onboarding_v1.0',
  completedAt: '2026-07-20T09:00:00Z',
  consentVersion: 'consent_2026_08',
  pathTaken: [
    'Q01', 'Q02', 'Q03', 'Q04', 'Q05', 'Q06', 'Q07', 'Q08', 'Q14', 'Q15', 'L6', 'SUMMARY',
  ],
  answers: [
    ans('Q01', '25–34'),
    ans('Q02', '162cm / 62kg'),
    ans('Q03', '产后恢复'),
    ans('Q04', '塑形变紧实'),
    ans('Q05', '每周1次'),
    ans('Q06', '可完成但需要休息'),
    ans('Q07', '避免跳跃'),
    ans('Q08', ['盆底或漏尿', '腹直肌分离']),
    ans('Q14', ['跳跃', '地面动作']),
    ans('Q15', '产后'),
  ],
  lifecycleBranchId: 'L6',
  lifecycleAnswers: [
    ans('L6-weeks', '7–12周'),
    ans('L6-delivery', '顺产'),
    ans('L6-clearance', '已获得'),
    ans('L6-pelvic', '轻度漏尿'),
    ans('L6-diastasis', '2指以内'),
  ],
};

export const USER_ONBOARDING_SAMPLES: UserOnboardingSubmission[] = [U08771, U10231, U6102];

export function getSubmissionByUserId(userId: string): UserOnboardingSubmission | undefined {
  return USER_ONBOARDING_SAMPLES.find((s) => s.userId === userId);
}
