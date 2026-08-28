import type { ScreenDef } from './types';
import { screensVideo } from './screens-video';
import { screensQuiz } from './screens-quiz';
import { screensSchedule } from './screens-schedule';
import { screensMigration } from './screens-migration';
import { screensUser } from './screens-user';
import { screensSupportA, screensSupportG } from './screens-support';
import { screensV2P0 } from './screens-v2-p0';
import { screensAppEditor } from './screens-app-editor';
import { externalCommerceScreenIds, screensExternalCommerce } from './screens-external-commerce';
import { screensContentOps } from './screens-content-ops';
import { applyAdminV1Overlay } from './v1Overlay';

/** 管理后台全量线框：B01–B57（外链商品覆盖旧自营商城屏；含 App/H5 商品入口与内容编排） */
export const screens: ScreenDef[] = applyAdminV1Overlay([
  ...screensMigration,
  ...screensSupportA,
  ...screensVideo,
  ...screensQuiz,
  ...screensSchedule,
  ...screensUser,
  ...screensSupportG,
  ...screensV2P0.filter((screen) => !externalCommerceScreenIds.has(screen.id)),
  ...screensExternalCommerce,
  ...screensAppEditor,
  ...screensContentOps,
]);

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
