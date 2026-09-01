import type { ScreenDef } from './types';
import { screensA } from './screens-a';
import { screensB } from './screens-b';
import { screensC } from './screens-c';
import { screensCommerce } from './screens-commerce';
import { applyMobileV1Overlay } from '../v1Overlay';
import { tagsForScreen } from './revisions';

export { REVISION_0901, MOBILE_REVISIONS } from './revisions';

export const screens: ScreenDef[] = applyMobileV1Overlay([...screensA, ...screensB, ...screensC, ...screensCommerce]).map((s) => {
  const tags = [...new Set([...(s.tags ?? []), ...tagsForScreen(s.id)])];
  return tags.length > 0 ? { ...s, tags } : s;
});

export const screenMap: Record<string, ScreenDef> = Object.fromEntries(
  screens.map((s) => [s.id, s]),
);

export function groupByFlow(screens: ScreenDef[]) {
  const groups = new Map<string, ScreenDef[]>();
  for (const s of screens) {
    if (!groups.has(s.flow)) groups.set(s.flow, []);
    groups.get(s.flow)!.push(s);
  }
  return groups;
}

/** 入口文案未写出上级页时的兜底（无 Tab 的次级页才使用）。 */
const BACK_FALLBACK: Record<string, string> = {
  S21: 'S09',
};

/** 无浏览历史时，次级页返回的默认上级。优先取入口中第一个其他屏幕 ID。 */
export function defaultBackTarget(screen: ScreenDef): string | undefined {
  if (screen.id === 'S01') return undefined;
  const ids = [...screen.annotations.entry.matchAll(/\bS\d{2}\b/g)].map((m) => m[0]);
  const parent = ids.find((id) => id !== screen.id && screenMap[id]);
  if (parent) return parent;
  const fallback = BACK_FALLBACK[screen.id];
  return fallback && screenMap[fallback] ? fallback : undefined;
}
