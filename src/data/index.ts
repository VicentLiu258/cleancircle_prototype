import type { ScreenDef } from './types';
import { screensVideo } from './screens-video';
import { screensQuiz } from './screens-quiz';
import { screensSchedule } from './screens-schedule';
import { screensMigration } from './screens-migration';
import { screensUser } from './screens-user';
import { screensSupportA, screensSupportG } from './screens-support';

export const screens: ScreenDef[] = [
  ...screensMigration,
  ...screensSupportA,
  ...screensVideo,
  ...screensQuiz,
  ...screensSchedule,
  ...screensUser,
  ...screensSupportG,
];

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
