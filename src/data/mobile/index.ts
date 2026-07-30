import type { ScreenDef } from './types';
import { screensA } from './screens-a';
import { screensB } from './screens-b';
import { screensC } from './screens-c';

export const screens: ScreenDef[] = [...screensA, ...screensB, ...screensC];

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
