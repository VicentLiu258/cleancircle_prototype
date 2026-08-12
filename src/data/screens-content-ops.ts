import type { ScreenDef, WireBlock } from './types';

const side = (label: string): WireBlock => ({ kind: 'sidebar', label });
const tabs = (activeStep: number): WireBlock => ({
  kind: 'tabs',
  items: ['专栏 Collections', '内容日历', '分类 Categories', '标签 Tags'],
  activeStep,
  tabStates: ['collections', 'calendar', 'categories', 'tags'],
  marker: 1,
});

export const screensContentOps: ScreenDef[] = [
  {
    id: 'B57',
    name: '内容编排',
    reqCode: '后端反馈§5·海外版参考',
    priority: 'P0',
    flow: 'A',
    states: [
      {
        id: 'collections',
        label: '专栏',
        blocks: [
          side('内容编排'),
          { kind: 'topbar', label: '内容中心 / 内容编排', sub: '角色：内容运营' },
          { kind: 'page-header', label: '内容专栏', sub: '借鉴海外版 Collections：把视频、课程、直播和文章按主题编排成可复用内容集' },
          tabs(0),
          { kind: 'stat-row', items: ['已发布 12', '草稿 3', '待审核 2', '关联内容 186'] },
          { kind: 'filter-bar', label: '搜索专栏 ｜ 状态：全部 ｜ 内容类型：全部 ｜ 创建人：全部', marker: 2 },
          {
            kind: 'table',
            cols: ['专栏', '内容类型', '内容数', '展示位置', '状态', '更新', '操作'],
            items: [
              'START HERE 新手 ｜ 视频+课程 ｜ 8 ｜ 课程库顶部 ｜ 已发布 ｜ 08-12 ｜ 编辑',
              '经期舒缓合集 ｜ 视频+文章 ｜ 12 ｜ 今日推荐/课程库 ｜ 已发布 ｜ 08-11 ｜ 编辑',
              '21 天塑形计划 ｜ 课程+直播 ｜ 24 ｜ 会员专区 ｜ 待审核 ｜ 08-10 ｜ 审核',
              '五分钟办公室恢复 ｜ 视频 ｜ 6 ｜ 搜索专题 ｜ 草稿 ｜ 08-09 ｜ 编辑',
            ],
            marker: 3,
          },
          { kind: 'button-primary', label: '+ 新建内容专栏' },
          { kind: 'button-secondary', label: '批量调整状态 / 排序' },
        ],
      },
      {
        id: 'calendar',
        label: '内容日历',
        blocks: [
          side('内容编排'),
          { kind: 'topbar', label: '内容中心 / 内容编排 / 日历', sub: 'Asia/Shanghai' },
          { kind: 'page-header', label: '内容日历 · 2026 年 8 月', sub: '借鉴海外版 Calendar：统一查看视频、直播、文章、活动和 App 页面计划' },
          tabs(1),
          { kind: 'filter-bar', label: '月份：2026-08 ｜ 类型：全部 ｜ 渠道：App/H5/Push ｜ 负责人：全部' },
          { kind: 'panel', label: '月历视图', sub: '蓝=已发布 · 灰=草稿 · 描边=待审核 · 每日可展开查看内容卡片', height: 150 },
          {
            kind: 'table',
            cols: ['日期/时间', '内容', '类型', '渠道', '负责人', '状态', '操作'],
            items: [
              '08-13 05:00 ｜ 经期舒缓合集 ｜ 专栏 ｜ App课程库 ｜ 运营A ｜ 定时 ｜ 编辑',
              '08-14 20:00 ｜ Live with Jo ｜ 直播 ｜ App/Push ｜ 运营B ｜ 待审核 ｜ 审核',
              '08-15 09:00 ｜ 女性日常营养清单 ｜ H5分享页 ｜ 微信/H5 ｜ 运营C ｜ 草稿 ｜ 编辑',
            ],
            marker: 2,
          },
          { kind: 'button-primary', label: '+ 添加排期' },
          { kind: 'button-secondary', label: '切换周视图 / 列表视图' },
        ],
      },
      {
        id: 'categories',
        label: '分类',
        blocks: [
          side('内容编排'),
          { kind: 'topbar', label: '内容中心 / 内容编排 / 分类', sub: '角色：内容管理员' },
          { kind: 'page-header', label: '内容分类', sub: '分类用于用户浏览导航；支持父子层级、排序和展示名称' },
          tabs(2),
          { kind: 'filter-bar', label: '搜索分类 ｜ 状态：全部 ｜ 仅看未关联内容' },
          {
            kind: 'table',
            cols: ['分类', '父级', '内容数', '排序', 'App展示', '状态', '操作'],
            items: [
              '新手入门 ｜ — ｜ 42 ｜ 1 ｜ START HERE ｜ 展示 ｜ 编辑',
              '周期训练 ｜ — ｜ 86 ｜ 2 ｜ 周期专区 ｜ 展示 ｜ 编辑',
              '经期舒缓 ｜ 周期训练 ｜ 24 ｜ 1 ｜ 经期 ｜ 展示 ｜ 编辑',
              '直播回放 ｜ — ｜ 18 ｜ 8 ｜ Live ｜ 隐藏 ｜ 编辑',
            ],
            marker: 2,
          },
          { kind: 'button-primary', label: '+ 新建分类' },
          { kind: 'button-secondary', label: '拖拽调整层级与排序' },
        ],
      },
      {
        id: 'tags',
        label: '标签',
        blocks: [
          side('内容编排'),
          { kind: 'topbar', label: '内容中心 / 内容编排 / 标签', sub: '与 B06 训练标签区分' },
          { kind: 'page-header', label: '运营标签', sub: '借鉴海外版 Tags：用于内容检索、集合和投放；训练与安全标签仍由 B06 管理' },
          tabs(3),
          { kind: 'filter-bar', label: '搜索标签名称 ｜ 类型：运营/活动/生命周期 ｜ 使用状态：全部' },
          {
            kind: 'table',
            cols: ['标签', '类型', '关联内容', '关联专栏', '创建时间', '状态', '操作'],
            items: [
              'new-user ｜ 生命周期 ｜ 32 ｜ 3 ｜ 05-12 ｜ 使用中 ｜ 编辑',
              'summer-challenge ｜ 活动 ｜ 18 ｜ 1 ｜ 07-20 ｜ 使用中 ｜ 编辑',
              'jo-pick ｜ 运营精选 ｜ 12 ｜ 2 ｜ 08-01 ｜ 使用中 ｜ 编辑',
              'legacy-import ｜ 系统 ｜ 240 ｜ — ｜ 02-10 ｜ 锁定 ｜ 查看',
            ],
            marker: 2,
          },
          { kind: 'button-primary', label: '+ 新建运营标签' },
          { kind: 'button-secondary', label: '合并重复标签' },
        ],
      },
      {
        id: 'loading',
        label: '加载中',
        blocks: [
          side('内容编排'),
          { kind: 'topbar', label: '内容中心 / 内容编排', sub: '正在加载' },
          { kind: 'page-header', label: '内容编排' },
          { kind: 'panel', label: '正在加载内容…', sub: '保留导航与筛选骨架，避免整页空白', height: 150 },
        ],
      },
      {
        id: 'error',
        label: '加载失败',
        blocks: [
          side('内容编排'),
          { kind: 'topbar', label: '内容中心 / 内容编排', sub: '请求失败' },
          { kind: 'page-header', label: '内容暂时无法加载' },
          { kind: 'alert', tone: 'error', label: '获取内容列表失败', sub: '已保留当前筛选和未提交草稿；可重试或复制错误编号给技术支持', marker: 1 },
          { kind: 'form-row', label: '错误编号', sub: 'CONTENT-LIST-20260812-1428' },
          { kind: 'button-primary', label: '重新加载' },
          { kind: 'button-secondary', label: '返回内容中心' },
        ],
      },
      {
        id: 'no-access',
        label: '无权限',
        blocks: [
          side('内容编排'),
          { kind: 'topbar', label: '内容中心 / 内容编排', sub: '权限不足' },
          { kind: 'page-header', label: '你没有访问内容编排的权限' },
          { kind: 'panel', label: '访问被拒绝', sub: '当前角色缺少 content:orchestration:read；请联系管理员或申请权限', height: 130 },
          { kind: 'button-primary', label: '申请访问权限' },
          { kind: 'button-secondary', label: '返回工作台', to: 'B02' },
        ],
      },
    ],
    annotations: {
      goal: '统一管理内容专栏、排期、分类和运营标签，并提供稳定的加载与异常恢复体验。',
      entry: '内容中心-内容编排 / B03 视频库',
      exit: ['B03', 'B31', 'B34', 'B38', 'B40'],
      role: '内容运营；内容负责人审核；审计只读',
      data: ['专栏及内容关系 — 内容编排服务', '排期 — 内容日历', '分类层级 — 分类配置', '运营标签 — 标签服务'],
      actions: { primary: '创建专栏/排期/分类/标签', secondary: ['批量调整状态', '拖拽排序', '多视图查看', '失败重试'] },
      statesDesc: ['专栏', '内容日历', '分类', '标签', '加载中', '加载失败', '无权限'],
      triggers: ['排期到时且审核通过 → 自动发布', '内容下架 → 从关联专栏隐藏但保留关系', '加载失败 → 保留筛选/草稿并允许重试'],
      deps: ['B03 视频库', 'B31 AI 课程组合', 'B34 官方内容', 'B38 活动投放', 'B40 H5 分享页'],
      patches: ['后端反馈5：参考海外版内容管理操作逻辑'],
    },
  },
];
