// Clean Circle 管理后台线框原型 — 数据类型定义
// 与移动端线框工程（cleancircle-wireframe）同构，块类型适配桌面后台布局

export type FlowGroup = 'E' | 'A' | 'B' | 'C' | 'D' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K';

export interface WireBlock {
  kind:
    | 'chrome'          // 浏览器窗口栏（地址栏）
    | 'sidebar'         // 后台左侧菜单（label = 当前菜单项）
    | 'topbar'          // 顶部面包屑 + 角色
    | 'page-header'     // 页面标题
    | 'alert'           // 提示条（tone: info/warn/error/ok）
    | 'stat-row'        // KPI 卡（items）
    | 'filter-bar'      // 筛选工具栏
    | 'tabs'            // 页内标签页（items，activeStep 高亮）
    | 'steps'           // 向导步骤条（items，activeStep 高亮）
    | 'table'           // 表格（cols 表头，items 行，单元格用 ｜ 分隔；设 to 则整行可点）
    | 'form-row'        // 表单行（label 字段名，sub 控件/取值提示）
    | 'split'           // 左右分栏（label/sub 左右标题，items/right 左右行）
    | 'tag-row'         // 标签建议列表（items，首字符 ✓/✎/✗ 决定样式）
    | 'calendar-grid'   // 课表网格（30 天滚动模拟 / 用户课表）
    | 'progress'        // 进度条
    | 'panel'           // 通用灰卡
    | 'button-primary' | 'button-secondary' | 'button-danger'
    | 'text' | 'divider' | 'spacer';
  label?: string;
  sub?: string;
  items?: string[];      // 表格行 / KPI / 步骤 / tabs / 标签 / 分栏左列
  cols?: string[];       // 表格表头
  right?: string[];      // split 右列行
  tone?: 'info' | 'warn' | 'error' | 'ok';
  activeStep?: number;   // steps/tabs 当前高亮序号（0 起）
  marker?: number;       // 标注序号 ①②③，与标注面板对应
  patch?: boolean;       // true = 产品补全元素，amber 虚线框 + 「补」角标
  to?: string;           // 点击跳转的屏幕ID
  height?: number;
}

export interface ScreenState {
  id: string;
  label: string;
  blocks: WireBlock[];
}

export interface ScreenDef {
  id: string;            // 'B03'（沿用后台需求文档 §4 页面编号）
  name: string;
  reqCode: string;       // 需求文档编号，如 '§4 B03'
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
    deps: string[];      // 依赖的移动端屏幕（Sxx）/ 后台模块 / 审批流
    patches: string[];   // ['H-01', ...]
  };
}

export interface DecisionDef {
  id: string;            // 'H-01'
  title: string;
  question: string;
  conflict: string;
  decision: string;
  reason: string;
  screens: string[];
  status: string;
}

export interface PendingQuestion {
  id: string;            // 'B-Q01'
  question: string;
  impact: string;
  placeholder: string;
}

export const FLOW_NAMES: Record<FlowGroup, string> = {
  E: '工作台 · 运营总览',
  A: '内容中心 · 视频与课程',
  B: '问卷评测',
  C: '排课规则',
  D: '老用户迁移',
  F: '用户 CRM 与财务',
  G: '消息与触达',
  H: '训练与能量值',
  I: '社区与活动',
  J: '商城与履约',
  K: '基础配置与系统',
};

export const FLOW_ORDER: FlowGroup[] = ['E', 'A', 'B', 'C', 'D', 'F', 'G', 'H', 'I', 'J', 'K'];
