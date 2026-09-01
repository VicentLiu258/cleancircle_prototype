export const REVISION_0901 = {
  id: '0901',
  label: '0901',
  title: '2026-09-01 更新',
  notes: [
    'S02 改为非必须：仅从登录页《用户协议》《隐私政策》《健康数据处理说明》独立进入',
    '无 Tab 的次级页增加顶部「返回」',
    '一级页 Tab 纵向滚动时固定在底部，不再被卷走',
  ],
  screens: ['S01', 'S02', 'S03', 'S08', 'S09', 'S10', 'S25', 'S26', 'S29', 'S31'],
} as const;

export const MOBILE_REVISIONS = [REVISION_0901] as const;

const TAGS_BY_SCREEN: Record<string, string[]> = {};
for (const rev of MOBILE_REVISIONS) {
  for (const id of rev.screens) {
    TAGS_BY_SCREEN[id] = [...(TAGS_BY_SCREEN[id] ?? []), rev.id];
  }
}

export function tagsForScreen(screenId: string): string[] {
  return TAGS_BY_SCREEN[screenId] ?? [];
}
