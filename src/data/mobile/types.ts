// Clean Circle 线框原型 — 数据类型定义（依据规格说明 §6）

export type FlowGroup = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';

export interface WireBlock {
  kind:
    | 'statusbar' | 'header' | 'image' | 'text' | 'input'
    | 'button-primary' | 'button-secondary' | 'button-danger'
    | 'card' | 'list-item' | 'chip-row' | 'tabbar' | 'divider'
    | 'calendar-grid' | 'cycle-grid' | 'progress' | 'spacer';
  label: string;
  sub?: string;
  marker?: number;   // 标注序号，与标注面板对应
  patch?: boolean;   // true = 产品补全元素，amber 虚线框 + 「补」角标
  to?: string;       // 点击跳转的屏幕ID
  height?: number;   // 可选高度提示 px
}

export interface ScreenState {
  id: string;
  label: string;
  blocks: WireBlock[];
}

export interface ScreenDef {
  id: string;
  name: string;
  reqCode: string;
  priority: 'P0' | 'P1';
  flow: FlowGroup;
  states: ScreenState[];
  annotations: {
    goal: string;
    entry: string;
    exit: string[];      // 目标屏幕ID列表
    role: string;
    data: string[];      // '字段 — 来源'
    actions: { primary: string; secondary: string[]; destructive?: string };
    statesDesc: string[];
    triggers: string[];
    deps: string[];
    patches: string[];   // ['B-01','B-08']
  };
}

export interface DecisionDef {
  id: string;            // 'B-01'
  title: string;
  question: string;      // 问题
  conflict: string;      // 文档原文冲突或缺失
  decision: string;      // 原型采用的决策
  reason: string;        // 理由
  screens: string[];     // 影响的屏幕
  status: string;        // '产品补全 · 待业务确认'
}

export interface PendingQuestion {
  id: string;            // 'M-Q01'
  question: string;
  impact: string;        // 对原型/开发的影响
  placeholder: string;   // 原型当前占位方案
}

export const FLOW_NAMES: Record<FlowGroup, string> = {
  A: 'A · 新用户主链路',
  B: 'B · 老用户迁移',
  C: 'C · 每日使用',
  D: 'D · 订阅转化',
  E: 'E · Tab 页',
  F: 'F · P1 页面',
  G: 'G · 商品导购与分享',
};

export const FLOW_ORDER: FlowGroup[] = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
