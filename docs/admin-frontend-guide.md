# Clean Circle · 管理后台 Web 前端开发指南

> **依据**：`src/data/screens-*.ts`（B01–B51 线框原型）+ `docs/admin-api-spec.md` + `docs/admin-db-schema.md` + `docs/admin-prototype-v2-from-backend-req.md`
> **适用对象**：后台管理系统前端开发、联调、验收
> **日期**：2026-08-10 · v1

---

## 0. 这份文档怎么用

| 角色 | 必读 |
|------|------|
| 新人入职 | §1 范围 → §2 选型 → §3 工程结构 → §6 页面模板 |
| 写一个新页面 | §6 找模板 → §7 组件清单 → §8 状态映射 → 附录 A 查路由/API/权限 |
| 联调 | §4 基础设施 → §5 数据层 → §13 上传导出 → §15 Mock |
| 提测/验收 | §10 四态规范 → 附录 C 验收清单 |

**三条不可破的底线**（与后端 `admin-db-schema.md` 同源）：

1. **金额一律整数分**，前端不做浮点运算，只在展示层格式化。
2. **流水类数据只读**（能量值流水、库存流水、支付流水、审计日志），前端不提供任何"编辑/删除"入口。
3. **敏感与危险操作三件套**：权限校验 + 二次确认 + 幂等键。缺一不可。

---

## 1. 范围与分期

原型共 **51 屏**（B01–B51），P0 35 屏、P1 16 屏，分 11 个业务域：

| 域 | 屏 | 优先级 |
|----|-----|--------|
| 工作台（E） | B02 B48 B49 B50 | P0 |
| 内容中心（A） | B03 B04 B05 B06 B07 B31 | P0 |
| 问卷评测（B） | B08 B09 B10 | P0 |
| 排课规则（C） | B11 B12 B13 B14 | P0 |
| 老用户迁移（D） | B20 | P0 |
| 用户 CRM 与财务（F） | B17 B18 B19 B21 B22 B23 B24 B25 | P0 |
| 消息与触达（G） | B15 B16 B28 | P0 |
| 训练与能量值（H） | B29 B30 | P0 |
| 社区与活动（I） | B32–B38 B47 | P1 |
| 商城与履约（J） | B39 B40 B41 B51 | P1 |
| 基础配置与系统（K） | B01 B26 B27 B42 B43 B44 B45 B46 | P0 |

### 分期（与后端 `admin-api-spec.md` §16 对齐）

| Phase | 前端交付 | 屏 | 关键前置 |
|-------|----------|-----|----------|
| **P1 骨架期** | 登录、布局、路由、权限、请求层、DataTable、四态、Mock | B01 B26 B27 | 无（可先于后端启动） |
| **P2 核心业务** | 内容、问卷、排课、迁移、CRM、能量值、会员 | B03–B14 B17–B20 B22 B23 B29–B31 | 后端 Phase 1 |
| **P3 经营与触达** | 看板、漏斗、趋势、行为、消息、退款、对账 | B02 B15 B16 B24 B25 B28 B48–B50 | 后端 Phase 2 + 埋点仓 |
| **P4 社区商城** | 社区 8 屏、商城 4 屏、配置 5 屏 | B32–B47 B51 | 后端 Phase 3 + B-Q08/B-Q09 确认 |

> P4 是否进排期取决于 `B-Q08`（商城是否首发）与 `B-Q09`（社区是否首发），路由与菜单按**功能开关 B44** 动态显隐，代码可以先合入但默认关闭。

---

## 2. 技术选型

### 2.1 核心栈

| 领域 | 选型 | 理由 |
|------|------|------|
| 框架 | React 19 + TypeScript 5.9 | 与原型工程一致，团队已有积累 |
| 构建 | Vite 7 | 原型同构；后台无 SEO 需求，不上 Next.js |
| 路由 | React Router v7（Data Router 模式） | 支持 loader/action、嵌套布局、路由级权限 |
| 服务端状态 | **TanStack Query v5** | 后台 90% 是"列表+详情+变更"，需要缓存失效、轮询、乐观更新 |
| 客户端状态 | Zustand（仅存 auth/permission/布局偏好） | 避免 Redux 样板；业务数据一律交给 Query |
| 表格 | **TanStack Table v8**（headless）+ 自研 `DataTable` | 51 屏里 30+ 屏是表格，必须统一 |
| 表单 | react-hook-form + zod + `@hookform/resolvers` | 原型已有依赖 |
| UI | shadcn/ui + Radix + Tailwind CSS 3.4 | **直接复用原型 `src/components/ui/` 全套 57 个组件** |
| 图表 | Recharts | 原型已有；B02/B48/B49/B50/B25/B47 用 |
| 图标 | lucide-react | 原型已有 |
| 日期 | date-fns + `@date-fns/tz` | 涉及 `Asia/Shanghai` 日切 |
| 通知 | sonner | 原型已有 |
| Mock | MSW v2 | 前后端并行必需 |
| 类型生成 | openapi-typescript | 由后端 `api/openapi/admin.yaml` 生成 |

### 2.2 安装

```bash
# 在原型基础上新增
npm i @tanstack/react-query @tanstack/react-query-devtools @tanstack/react-table zustand ky
npm i -D msw openapi-typescript vitest @testing-library/react @testing-library/user-event jsdom
```

> HTTP 客户端用 `ky`（基于 fetch，体积小、hooks 机制适合统一拦截）。团队若更熟 axios 也可，但拦截器逻辑照 §4.1 实现。

### 2.3 工程边界

现有 `cleancircle_prototype` 是**线框评审站**，不要在里面写业务代码。新建独立仓库 / 目录：

```
cleancircle-admin-web/     # 新建，真实后台
cleancircle_prototype/     # 保留，评审与需求追溯用（只读参考）
```

从原型可直接复制过来的资产：`src/components/ui/**`、`src/lib/utils.ts`、`tailwind.config.js`、`components.json`、`src/hooks/use-mobile.ts`。

---

## 3. 工程结构

按**业务域**切分，不按技术类型切分。每个域是一个可独立开发、独立 code review 的单元。

```
src/
├── main.tsx
├── App.tsx                      # RouterProvider
├── router/
│   ├── index.tsx                # 路由树（懒加载）
│   ├── guards.tsx               # RequireAuth / RequirePermission
│   └── routes.meta.ts           # 路由元信息：title/permission/featureFlag/menu
├── app/
│   ├── providers.tsx            # QueryClient / Theme / Toaster / ErrorBoundary
│   └── layout/
│       ├── AdminLayout.tsx      # 侧边栏 + 顶栏 + 内容区（对应原型 sidebar/topbar 块）
│       ├── SideNav.tsx          # 按权限 + featureFlag 过滤菜单
│       └── Breadcrumb.tsx
├── shared/
│   ├── api/
│   │   ├── client.ts            # ky 实例 + 拦截器
│   │   ├── types.ts             # ApiResponse / Pagination / ErrorCode
│   │   ├── generated.ts         # openapi-typescript 产物（勿手改）
│   │   └── query-keys.ts        # 全局 queryKey 工厂
│   ├── auth/                    # token 存储、refresh、useAuth、usePermission
│   ├── components/              # 业务无关通用组件（§7）
│   ├── hooks/                   # useTableQuery / useConfirm / usePolling / useExport
│   ├── constants/               # 状态机映射、枚举字典、权限点常量
│   ├── lib/                     # money / datetime / mask / download / idempotency
│   └── types/
├── features/
│   ├── dashboard/               # B02 B48 B49 B50
│   ├── content/                 # B03–B07 B31
│   ├── quiz/                    # B08–B10
│   ├── schedule/                # B11–B14
│   ├── users/                   # B17–B20
│   ├── messaging/               # B15 B16 B28
│   ├── training/                # B29 B30 B23
│   ├── finance/                 # B21 B22 B24 B25
│   ├── community/               # B32–B38 B47
│   ├── mall/                    # B39–B41 B51
│   └── system/                  # B01 B26 B27 B42–B46
└── styles/
```

### 每个 feature 内部固定结构

```
features/users/
├── api.ts          # 该域全部请求函数（唯一允许 import api client 的地方）
├── queries.ts      # useXxxQuery / useXxxMutation（唯一允许 import api.ts 的地方）
├── schemas.ts      # zod schema + 由 schema 推导的 TS 类型
├── constants.ts    # 该域枚举、列定义、筛选项
├── components/     # 该域专用组件
└── pages/
    ├── UserListPage.tsx       # B18
    ├── UserDetailPage.tsx     # B19
    ├── TagSegmentPage.tsx     # B17
    └── MigrationPage.tsx      # B20
```

**依赖方向铁律**：`pages → components → queries → api → shared`。feature 之间**不允许**互相 import；需要共享就上提到 `shared/`。

---

## 4. 运行时基础设施

### 4.1 HTTP 客户端与统一响应

后端统一响应（`admin-api-spec.md` §1.1）：

```ts
// shared/api/types.ts
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  pagination?: { page: number; page_size: number; total: number };
}

export class ApiError extends Error {
  constructor(
    public code: number,
    message: string,
    public traceId?: string,
  ) { super(message); }
}
```

```ts
// shared/api/client.ts
import ky from 'ky';
import { authStore } from '@/shared/auth/store';
import { ApiError } from './types';

export const http = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE ?? '/api/v1/admin',
  timeout: 30_000,
  retry: { limit: 2, methods: ['get'] },
  hooks: {
    beforeRequest: [
      (req) => {
        const token = authStore.getState().accessToken;
        if (token) req.headers.set('Authorization', `Bearer ${token}`);
        req.headers.set('X-Request-Id', crypto.randomUUID());
      },
    ],
    afterResponse: [
      async (req, _opts, res) => {
        if (res.status === 401) return authStore.getState().handleUnauthorized(req);
        const body = await res.clone().json<ApiResponse<unknown>>();
        if (body.code !== 0) {
          throw new ApiError(body.code, body.message, res.headers.get('X-Trace-Id') ?? undefined);
        }
        return res;
      },
    ],
  },
});

/** 业务层只拿 data，不用每次解包 */
export async function request<T>(input: string, init?: Parameters<typeof http>[1]): Promise<T> {
  const body = await http(input, init).json<ApiResponse<T>>();
  return body.data;
}

/** 列表接口同时需要 pagination */
export async function requestPage<T>(input: string, init?: Parameters<typeof http>[1]) {
  const body = await http(input, init).json<ApiResponse<T[]>>();
  return { list: body.data, pagination: body.pagination! };
}
```

### 4.2 错误码 → UI 行为映射（必须逐条实现）

| code | 含义 | 前端行为 |
|------|------|----------|
| `0` | 成功 | — |
| `40001` | 参数错误 | 表单页：把 `message` 挂到对应字段；列表页：toast error |
| `40101` | 未登录 / Token 失效 | 静默 refresh 一次；失败则清 token → 跳 `/login?redirect=` |
| `40301` | 无权限 | **不 toast**，渲染 `<ForbiddenState>` 整页占位；按钮级则本就不该渲染 |
| `40401` | 资源不存在 | 详情页渲染 `<NotFoundState>` + 返回列表按钮 |
| `40901` | 冲突（幂等重复 / 状态机非法迁移） | **不当作错误闪红**：提示"该操作已处理，正在刷新最新状态"，并 `invalidateQueries` |
| `42201` | 业务校验失败 | 弹 `<AlertDialog>` 展示 `message`（这类文案是给运营看的，不要用 toast 一闪而过） |
| `42901` | 限流 | toast warning + 按钮进入 10s 冷却 |
| `50001` | 内部错误 | toast error + 展示 `traceId`，提供"复制排查码" |

> `40901` 的处理方式是这套系统的关键细节：后端对补单、退款、库存调整、迁移执行都做了幂等，前端重复提交时收到的是 `40901` 而不是二次执行成功，必须转化为"温和提示 + 刷新"，否则运营会以为操作失败而再点一次。

### 4.3 鉴权

- **存储**：`access_token` 存内存（Zustand）+ `sessionStorage` 兜底刷新；`refresh_token` 存 `httpOnly` Cookie（推动后端这样发）。若后端只能返回 JSON，则 `refresh_token` 存 `localStorage` 并接受风险，但必须配合 §4.4 的短过期。
- **静默续期**：`expires_in` 到期前 5 分钟主动 refresh；并发请求共享同一个 refresh Promise（防惊群）。
- **登录（B01）**：`username + password + totp?`。TOTP 字段按后端返回的 `require_totp` 动态显示，用原型已有的 `input-otp` 组件。
- **登出**：调 `/auth/logout` 作废 refresh → 清空 Query Cache（`queryClient.clear()`，防止下一个账号看到上一个账号的缓存）。

### 4.4 权限（RBAC）

权限点格式 `module:action`（见 `admin-db-schema.md` §3）。`/auth/me` 返回当前管理员的权限点数组，登录后写入 store。

```ts
// shared/auth/permissions.ts
export const PERM = {
  USERS_READ: 'users:read',
  USERS_SENSITIVE: 'users:sensitive',
  USERS_EXPORT: 'users:export',
  SCHEDULE_PUBLISH: 'schedule:publish',
  SCHEDULE_REVIEW: 'schedule:review',
  POINTS_APPROVE: 'points:approve',
  FINANCE_REFUND: 'finance:refund',
  FINANCE_EXPORT: 'finance:export',
  CONTENT_SAFETY_REVIEW: 'content:safety_review',
  AUDIT_READ: 'audit:read',
  // …完整清单见附录 B
} as const;
```

三层管控，**缺一层都算漏洞**：

```tsx
// ① 路由级：无权限直接不可达
<Route path="finance/refunds" element={
  <RequirePermission perm={PERM.FINANCE_REFUND}><RefundPage /></RequirePermission>
} />

// ② 组件级：按钮/菜单项不渲染（不是 disabled，是不渲染）
<Can perm={PERM.FINANCE_REFUND}>
  <Button variant="destructive" onClick={openRefund}>发起退款</Button>
</Can>

// ③ 字段级：敏感字段脱敏（§4.7）
<SensitiveField value={user.phone} type="phone" perm={PERM.USERS_SENSITIVE} objectId={user.id} />
```

> **不要用 `disabled` 表达"无权限"**。原型 B18「客服脱敏视图」的口径是：客服看到的是**另一套列**，而不是灰掉的按钮。灰掉的按钮会诱导运营去问"为什么点不了"，增加客服成本。

菜单同样按权限 + 功能开关过滤，两者都在 `routes.meta.ts` 声明：

```ts
export const ROUTE_META = {
  'community.posts': { title: '帖子管理', perm: 'community:read', flag: 'community' },
  'mall.orders':     { title: '商城订单', perm: 'mall:read',      flag: 'mall' },
} satisfies Record<string, RouteMeta>;
```

### 4.5 幂等键与防重复提交

所有**写操作中的敏感接口**（退款、补单、能量值执行、库存调整、迁移执行、批量发货、批量触达）必须带 `Idempotency-Key`。

```ts
// shared/lib/idempotency.ts
/** 同一个"业务意图"复用同一个 key：重试不会产生第二笔 */
export function useIdempotencyKey(deps: unknown[]) {
  return useMemo(() => crypto.randomUUID(), deps); // eslint-disable-line react-hooks/exhaustive-deps
}
```

```ts
const idemKey = useIdempotencyKey([orderId, 'refund']);
const mutation = useMutation({
  mutationFn: (body: RefundInput) =>
    request(`orders/${orderId}/refund`, {
      method: 'post', json: body, headers: { 'Idempotency-Key': idemKey },
    }),
});
```

配套：提交期间按钮 `loading` 且 `pointer-events-none`；`AlertDialog` 的确认按钮在 pending 时不可关闭弹层。

### 4.6 金额与时间

```ts
// shared/lib/money.ts
/** 分 → 展示字符串。永远不要把 fen 转成 number 做加减 */
export const fenToYuan = (fen: number) => (fen / 100).toFixed(2);
export const formatMoney = (fen: number, currency = '¥') =>
  `${currency}${fenToYuan(fen).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
/** 输入框：用户输入元 → 提交前转分，四舍五入到整数 */
export const yuanToFen = (yuan: string) => Math.round(Number(yuan) * 100);
```

```ts
// shared/lib/datetime.ts
import { TZDate } from '@date-fns/tz';
export const BIZ_TZ = 'Asia/Shanghai';   // 统计日切时区（后端 §1.4）
/** 报表/统计一律按业务时区渲染，不跟随浏览器时区 */
export const formatBizDate = (iso: string, fmt = 'yyyy-MM-dd HH:mm') =>
  format(new TZDate(iso, BIZ_TZ), fmt);
```

> **打卡日切例外**：`checkin_records` 按**用户本地时区**判定（`admin-db-schema.md` §7）。B29 打卡数据页展示时必须在表头标注"日切=用户本地自然日"，避免财务/运营按业务时区对不上数。

### 4.7 敏感字段与脱敏

统一规则（决策 **H-08**）：手机号中间 4 位掩码、健康数据不导出、导出带操作人水印、链接 24h 有效。

```tsx
// shared/components/SensitiveField.tsx
// 默认掩码；有权限者可"申请查看" → 二次确认 → 调 /sensitive-reveal → 写审计
<SensitiveField
  value="139****2210"
  type="phone"
  perm={PERM.USERS_SENSITIVE}
  reveal={() => revealApi(userId, 'phone')}   // 后端返回明文 + 落审计
  reason                                       // 要求填写查看原因
/>
```

行为约定：

- 无权限：只渲染掩码，**没有**"查看"入口。
- 有权限：掩码 + 眼睛图标 → 点击弹二次确认（含"本次查看将记入审计日志 B27"文案 + 原因输入）→ 明文展示 **60 秒**后自动复原。
- 健康类字段（经期/情绪/身体答案，B19「评测报告」分栏）：默认**折叠**，不是掩码；展开需 `content:safety_review` 或健康运营角色。

### 4.8 审计上下文

审计由后端写库，但前端要保证后端能写全：所有**变更类请求**必须携带业务上下文头，便于 `audit_logs.module/action` 归类。

```ts
headers: {
  'X-Audit-Module': 'finance',      // 对应 audit_logs.module
  'X-Audit-Action': 'refund_create',
  'X-Audit-Object': `order:${orderId}`,
}
```

在 `queries.ts` 层统一注入，不要散落在组件里。

---

## 5. 数据层规范

### 5.1 QueryKey 工厂

```ts
// shared/api/query-keys.ts
export const qk = {
  users: {
    all: ['users'] as const,
    list: (params: UserListParams) => [...qk.users.all, 'list', params] as const,
    detail: (id: string) => [...qk.users.all, 'detail', id] as const,
    section: (id: string, section: string) => [...qk.users.detail(id), section] as const,
  },
  orders: { all: ['orders'] as const, /* … */ },
} as const;
```

规则：**key 的第一段 = feature 名**，这样任意粒度的失效都能一行搞定（`invalidateQueries({ queryKey: qk.users.all })`）。

### 5.2 列表页状态与 URL 同步

所有列表页的筛选、分页、排序**必须同步到 URL query**。理由很实际：运营需要把"筛选后的用户列表"链接贴到企微群里给同事。

```ts
// shared/hooks/useTableQuery.ts
export function useTableQuery<TParams extends Record<string, unknown>>(defaults: TParams) {
  const [sp, setSp] = useSearchParams();
  const params = useMemo(() => parseParams(sp, defaults), [sp]);
  const setParams = (patch: Partial<TParams>) =>
    setSp(serializeParams({ ...params, ...patch, page: patch.page ?? 1 }), { replace: true });
  return { params, setParams, resetParams: () => setSp({}) };
}
```

约定：改任何筛选条件都**重置到第 1 页**；`page_size` 默认 20、可选 20/50/100（后端上限 100）。

### 5.3 缓存失效矩阵

变更后必须失效哪些查询，写在 `queries.ts` 里，不靠人记：

| 变更操作 | 必须 invalidate |
|----------|-----------------|
| 能量值调整审批通过（B23） | `qk.points.adjustments` + `qk.users.section(uid,'energy')` + `qk.users.detail(uid)` |
| 退款审核通过（B24） | `qk.refunds.all` + `qk.orders.all` + `qk.dashboard.todos` + `qk.dashboard.kpi` |
| 视频下架（B03） | `qk.videos.all` + `qk.schedule.affected`（受影响课表预览） |
| 排课规则发布（B13） | `qk.schedule.all` + `qk.users.all`（课表口径变了） |
| UGC 审核决策（B35） | `qk.community.queue` + `qk.dashboard.todos` |
| 库存调整（B39/B51） | `qk.mall.skus` + `qk.mall.stockLogs` + `qk.mall.reconciliation` |
| 功能开关变更（B44） | `queryClient.clear()` + 重新拉 `/auth/me`（菜单要重算） |

### 5.4 全局 Query 默认值

```ts
new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // 后台数据容忍 30s 陈旧
      gcTime: 5 * 60_000,
      retry: (count, err) => !(err instanceof ApiError) && count < 2,  // 业务错误不重试
      refetchOnWindowFocus: false, // 后台长时间停留，聚焦重拉会打断填表
    },
    mutations: { retry: false },
  },
});
```

**例外轮询**：`/dashboard/todos`（60s）、导入/导出/对账任务详情（3s，任务结束即停）。

---

## 6. 页面模板体系

原型的 `WireBlock.kind` 已经把页面拆成了积木。前端把每种积木固化成一个组件，51 屏就只是积木的不同排列。

### 6.1 线框块 → 组件映射

| WireBlock.kind | 组件 | 说明 |
|----------------|------|------|
| `sidebar` | `<SideNav>` | 布局级，页面不管 |
| `topbar` | `<PageBreadcrumb>` + `<RoleBadge>` | 布局级 |
| `page-header` | `<PageHeader title sub actions>` | 右侧插主操作按钮 |
| `alert` | `<Banner tone>` | tone: info/warn/error/ok |
| `stat-row` | `<StatCards items>` | 支持环比、点击下钻 |
| `filter-bar` | `<FilterBar>` | 与 `useTableQuery` 绑定 |
| `tabs` | `<Tabs>`（shadcn） | **Tab 切换写 URL**：`?tab=energy` |
| `steps` | `<StepBar activeStep>` | 审批/向导进度 |
| `table` | `<DataTable>` | §7.1 |
| `form-row` | `<FormRow label>` / `<DescriptionItem>` | 只读用后者 |
| `split` | `<SplitPanel left right>` | 常用于"变更前 / 变更后" |
| `tag-row` | `<TagReviewList>` | B07 AI 复核专用 |
| `calendar-grid` | `<ScheduleCalendar days={30}>` | B13/B19 |
| `progress` | `<Progress>`（shadcn） | 导入进度 |
| `panel` | `<Card>` | — |
| `button-*` | `<Button variant>` | danger → `variant="destructive"` |
| `patch: true` | `<PatchMark decision="H-09">` | 开发期显示"产品补全"角标，联调后可关 |
| `marker: n` | 无 | 仅评审用，不落地 |

### 6.2 六个页面模板

#### T1 · 列表页（最常用，约 30 屏）

结构：`PageHeader → StatCards? → FilterBar → BatchBar? → DataTable → Pagination`

```tsx
export function UserListPage() {
  const { params, setParams } = useTableQuery(DEFAULT_USER_PARAMS);
  const { data, isLoading, error } = useUserListQuery(params);
  const [selected, setSelected] = useState<string[]>([]);

  return (
    <PageContainer>
      <PageHeader
        title={`用户列表 · ${data?.pagination.total ?? '—'}`}
        sub="筛选：ID/昵称/手机、注册/活跃时间、会员状态、训练状态、周期阶段、标签、渠道、版本"
        actions={
          <Can perm={PERM.USERS_EXPORT}>
            <ExportButton scope="users" params={params} />
          </Can>
        }
      />
      <FilterBar schema={USER_FILTER_SCHEMA} value={params} onChange={setParams} />
      {selected.length > 0 && (
        <BatchBar count={selected.length} onClear={() => setSelected([])}>
          <BatchTagAction userIds={selected} />
          <BatchSegmentAction userIds={selected} />
          <BatchMessageAction userIds={selected} />
        </BatchBar>
      )}
      <DataTable
        columns={USER_COLUMNS}
        data={data?.list}
        loading={isLoading}
        error={error}
        rowSelection={{ value: selected, onChange: setSelected }}
        onRowClick={(row) => navigate(`/users/${row.id}`)}
        pagination={data?.pagination}
        onPaginationChange={setParams}
        empty={<EmptyState title="没有匹配的用户" action={<Button variant="outline" onClick={resetParams}>清空筛选</Button>} />}
      />
    </PageContainer>
  );
}
```

要点：

- 列定义 `USER_COLUMNS` 放 `constants.ts`，**列的可见性按权限过滤**（客服看不到"健康数据"列，而不是看到锁图标——见 B18 `masked` 状态）。
- 空态必须给"清空筛选"出口（原型 B18 `no-result` 明确要求）。
- 批量条只在有选中时出现，展示"已选 N 人"，并提供清空。

#### T2 · 详情多 Tab 页（B19 B21 B37 B40 B41）

B19 是最复杂的一个：七分栏（账户概览/评测报告/周期与课表/运动打卡/订阅订单/能量值/消息工单）。

```tsx
const TABS = [
  { key: 'profile',  label: '账户概览', perm: PERM.USERS_READ },
  { key: 'quiz',     label: '评测报告', perm: PERM.USERS_HEALTH },
  { key: 'schedule', label: '周期与课表', perm: PERM.USERS_HEALTH },
  { key: 'checkin',  label: '运动打卡', perm: PERM.USERS_READ },
  { key: 'orders',   label: '订阅订单', perm: PERM.FINANCE_READ },
  { key: 'points',   label: '能量值',   perm: PERM.POINTS_READ },
  { key: 'messages', label: '消息工单', perm: PERM.MESSAGE_READ },
] as const;

export function UserDetailPage() {
  const { id } = useParams();
  const [sp, setSp] = useSearchParams();
  const tab = sp.get('tab') ?? 'profile';
  const visible = TABS.filter((t) => hasPerm(t.perm));
  // 每个 Tab 独立请求 /users/{id}?section=xxx，懒加载，切回不重复请求（Query 缓存）
}
```

要点：

- **Tab 状态进 URL**，刷新/分享保持。
- 每个 Tab 独立数据源（后端 `?section=` 参数），不要一次拉全量——B19 全量拉会带出健康数据，等于绕过了字段级权限。
- 无权限的 Tab **不渲染**，不是渲染后禁用。

#### T3 · 编辑页（B04 B09 B12 B14 B15 B22 B30 B31 B39 B45）

```
PageHeader（含"未保存"标记）→ 分组表单 → 底部固定操作栏（保存草稿 / 提交审核 / 取消）
```

要点：

- 用 `react-hook-form` 的 `formState.isDirty` 驱动**离开页面拦截**（`useBlocker`）。运营填一半被打断是高频场景。
- **草稿与发布分离**：`保存草稿` 不触发校验，`提交审核` 才全量校验。
- 需二次审核的对象（问卷 B10、排课规则 B12/B13）走 §6.2-T5 审批模板，编辑页只到"提交审核"为止。

#### T4 · 向导页（B05 批量导入、B20 迁移、B07 Excel 导入）

固定五步：`下载模板 → 上传 → 字段映射 → 预校验 → 执行/结果`（决策 **H-01**）。

```tsx
<StepBar steps={['下载模板', '上传文件', '字段映射', '预校验', '执行']} activeStep={step} />
```

要点：

- **预校验结果必须可下载失败明细 CSV**，并允许"仅导入通过行"（H-12）。
- 执行阶段轮询 `/migrations/batches/{id}`（3s），展示 `<Progress>` + 成功/失败计数。
- **灰度批**（H-05）：创建任务时的"灰度批 ≤50 条"开关必须在列表页有显著标记，全量批在灰度批未确认前**禁用**创建入口并说明原因。
- 幂等键 = 原用户唯一 ID + 批次；前端在"重试失败项"时复用同一批次号，不生成新 key。

#### T5 · 审批页（B10 B12/B13 B23 B24 B36 B41）

结构：`StepBar → 变更前后对比（SplitPanel）→ 影响预览 → 审批意见（必填）→ 通过/驳回`

```tsx
<StepBar steps={['提交申请', '审批', '系统执行', '结果记录']} activeStep={1} />
<SplitPanel
  left={{ title: '变更前', items: before }}
  right={{ title: '变更后', items: after }}
/>
<Card title="影响预览">当前 1,240 → 调整后 1,740 · 生成新流水（人工补发 · PA-0331）</Card>
<Textarea label="审批意见" required />
<ConfirmButton
  variant="default"
  confirmTitle="确认审批通过并执行？"
  confirmDesc="执行后将生成能量值流水，用户端立即可见，且不可撤销（只能反向调整）。"
  onConfirm={approve}
>审批通过并执行</ConfirmButton>
<ConfirmButton variant="destructive" requireReason>驳回</ConfirmButton>
```

**硬约束（H-04）**：审核人 ≠ 编辑人/申请人。后端强制，但前端也要拦：当 `currentAdminId === record.submitted_by` 时不渲染审批按钮，改渲染提示 `<Banner tone="info">你是提交人，需由他人审批</Banner>`。这能避免运营在审批页填完意见才被后端拒绝。

#### T6 · 看板/分析页（B02 B25 B29 B47 B48 B49 B50）

结构：`时间范围选择 → StatCards（含环比）→ 图表区 → 明细表（可下钻）`

要点：

- **每个指标必须能查口径**。B02 的 `metrics-help` 状态是一张口径表，实现为 `StatCard` 上的 `?` 图标 → `<Sheet>` 抽屉展示 `/dashboard/metrics-definitions`。这是防止运营和财务吵架的关键功能，不要砍。
- 功能开关关闭时（B44 社区/商城关），对应 KPI **隐藏而非置 0**（原型 B02 `feature-off` 状态）。
- 时间范围统一组件 `<DateRangePicker presets={['今日','昨日','近7天','近30天','自定义']}>`，值同步 URL。
- 大数据量图表（B50 路径分析）先渲染骨架，数据超过阈值时提示"结果已截断至 Top 20"。

---

## 7. 通用业务组件清单

必须先建这一层再写页面。否则 51 屏会长出 51 套表格。

| 组件 | 用途 | 关键 props |
|------|------|-----------|
| `<DataTable>` | 全站表格 | `columns, data, loading, error, empty, rowSelection, pagination, onRowClick, stickyHeader, columnVisibility` |
| `<FilterBar>` | 声明式筛选 | `schema: FilterField[]`（text/select/multi-select/date-range/tag-picker），自动折叠"更多筛选" |
| `<StatCards>` | KPI 卡组 | `items: {label, value, delta?, hint?, onClick?}` |
| `<PageHeader>` | 页头 | `title, sub, actions, backTo` |
| `<Banner>` | 提示条 | `tone: info/warn/error/ok, title, desc, action` |
| `<StatusTag>` | 状态标签 | `domain, value` → 自动查 §8 映射表出文案与颜色 |
| `<MoneyText>` | 金额 | `fen, showSign?, muted?` |
| `<SensitiveField>` | 脱敏字段 | 见 §4.7 |
| `<ConfirmButton>` | 危险操作 | `confirmTitle, confirmDesc, requireReason?, requireTyping?`（高危要求手输对象编号） |
| `<ExportButton>` | 统一导出 | `scope, params` → 自动带 H-08 脱敏水印提示 + 任务轮询 + 24h 链接 |
| `<UploadField>` | 文件上传 | `accept, maxSize, onUploaded(file_id)`；走 `/files/upload` |
| `<StepBar>` | 步骤条 | `steps, activeStep, error?` |
| `<SplitPanel>` | 前后对比 | `left, right, diff?`（diff=true 时高亮变化行） |
| `<AuditTrail>` | 变更日志 | `objectType, objectId` → 拉 `/system/audit-logs` 渲染时间线 |
| `<ScheduleCalendar>` | 30 天课表 | `days, today, onDayClick`；历史日置灰锁定（H-02/H-09） |
| `<TagReviewList>` | 标签复核 | `items: {tag, confidence, source, isSafety}`；安全标签禁用批量接受（H-06） |
| `<JobProgress>` | 长任务 | `jobId, endpoint` → 轮询 + 进度 + 失败明细下载 |
| `<EmptyState>` / `<ErrorState>` / `<ForbiddenState>` / `<TableSkeleton>` | 四态 | §10 |
| `<PatchMark>` | 产品补全标记 | `decision: 'H-09'` → hover 展示决策内容，开发期用 |

---

## 8. 状态机与状态标签统一映射

状态文案和颜色**只在这一处定义**，任何页面不得硬编码中文状态。

```ts
// shared/constants/status.ts
type Tone = 'default' | 'success' | 'warning' | 'danger' | 'processing' | 'muted';

export const STATUS_MAP = {
  order: {
    pending_pay:  { label: '待支付',   tone: 'warning' },
    paid:         { label: '已支付',   tone: 'success' },
    pay_failed:   { label: '支付失败', tone: 'danger' },
    cancelled:    { label: '已取消',   tone: 'muted' },
    refunding:    { label: '退款中',   tone: 'processing' },
    refunded:     { label: '已退款',   tone: 'muted' },
  },
  refund: {
    pending_review: { label: '待审核', tone: 'warning' },
    approved:       { label: '已通过', tone: 'success' },
    rejected:       { label: '已拒绝', tone: 'danger' },
    processing:     { label: '退款中', tone: 'processing' },
    succeeded:      { label: '已退款', tone: 'success' },
    failed:         { label: '退款失败', tone: 'danger' },
  },
  afterSale: {   // H-15
    pending:           { label: '申请中',   tone: 'warning' },
    pending_review:    { label: '待审核',   tone: 'warning' },
    approved:          { label: '审核通过', tone: 'success' },
    rejected:          { label: '已拒绝',   tone: 'danger' },
    awaiting_return:   { label: '待寄回',   tone: 'processing' },
    received:          { label: '已收货',   tone: 'processing' },
    exchange_shipping: { label: '换货发货中', tone: 'processing' },
    refunding:         { label: '退款中',   tone: 'processing' },
    completed:         { label: '已完成',   tone: 'success' },
    cancelled:         { label: '已取消',   tone: 'muted' },
    closed:            { label: '已关闭',   tone: 'muted' },
  },
  mallOrder: {
    pending_pay: { label: '待支付', tone: 'warning' },
    pending_ship:{ label: '待发货', tone: 'warning' },
    shipped:     { label: '已发货', tone: 'processing' },
    received:    { label: '已收货', tone: 'success' },
    completed:   { label: '已完成', tone: 'success' },
    cancelled:   { label: '已取消', tone: 'muted' },
    after_sale:  { label: '售后中', tone: 'danger' },
  },
  // 同样方式补齐（键取自 admin-db-schema.md §14 状态机速查）：
  // course:     draft | pending_publish | published | offline
  // membership: trial | active | expiring | expired | renew_failed | cancelled_autorenew | refunded
  // ugc:        pending | pass | reject | request_edit | escalate
  // migration:  processing | success | partial | failed
} as const;
```

**允许的状态迁移**也在前端声明一份，用来决定操作按钮的显隐：

```ts
export const AFTER_SALE_TRANSITIONS: Record<string, string[]> = {
  pending_review: ['approved', 'rejected'],
  approved: ['awaiting_return', 'refunding'],        // 退货退款 vs 仅退款
  awaiting_return: ['received', 'cancelled'],
  received: ['refunding', 'exchange_shipping'],
  refunding: ['completed', 'failed'],
};
// 页面：只渲染 AFTER_SALE_TRANSITIONS[current] 里存在的动作按钮
```

这样后端返回 `40901 状态机非法迁移` 的概率会大幅下降。

---

## 9. 关键业务决策在前端的落地（H-01 ~ H-16）

每条决策都对应可验收的前端行为。**这一节是提测时逐条勾的**。

| 决策 | 前端必须做到 | 涉及屏 |
|------|--------------|--------|
| **H-01** 迁移=Excel 向导 | 五步向导；数据源抽象成 `<ImportWizard source="excel">`，未来换 API 直连只替换第 1–2 步 | B20 |
| **H-02** 今日起 30 天滚动课表 | `<ScheduleCalendar>` 固定 30 格；**不出现"28 天"字样**；历史日锁定不可点 | B11–B13 B19 |
| **H-03** AI + Excel 同队列 | B07 复核台的 `source` 只是一个筛选维度，两个来源共用同一套复核 UI 与规则 | B07 |
| **H-04** 单级审批 + 编辑≠审核 | 审批页检测同人则隐藏审批按钮并给出说明；发布型配置提供"回滚上一版"入口 | B10 B12 B13 |
| **H-05** 迁移灰度 ≤50 | 灰度批标记在列表**强制展示**；灰度未确认时全量批按钮禁用 + tooltip 说明 | B20 |
| **H-06** 安全标签专业终审 | 安全类标签**排除在"批量接受"之外**，只能逐条终审；无 `content:safety_review` 权限时该操作不渲染 | B04 B07 B10 |
| **H-07** 视频下架只展示影响 | 下架确认弹层必须先拉"受影响课表日 / 用户数 / 建议替换视频"，加载完才允许确认；**不提供自动替换按钮** | B03 B04 |
| **H-08** 导出统一脱敏 | 所有导出走 `<ExportButton>`；确认层固定文案"手机号掩码 · 健康数据不导出 · 文件含操作人水印 · 链接 24 小时有效" | 全站 |
| **H-09** 人工重排只改未来 | 重排入口二次确认；日历上今日之前的格子锁定；提交后展示前后差异 | B19 |
| **H-10** 审计不可删 | B27 **不存在**删除按钮、不存在批量选择；只有查询 + 详情 + 导出 | B27 |
| **H-11** 触发器预估人数 | 启用开关前**必须**先调 `/estimate`；试算失败则阻断启用并提示原因 | B16 |
| **H-12** 导入匹配键=文件名前缀 | 上传步骤显式提示命名规则示例 `VID-0077.mp4 ↔ VID-0077`；未匹配项进错误报告 | B05 |
| **H-13** 统一"能量值" | 全站文案禁用"积分"二字（加一条 ESLint/i18n 词表检查）；字段名可以是 `points` | B23 B30 B19 B20 |
| **H-14** 无长报告 | B10 命名为"评测结果与推荐话术"；B19 评测报告分栏展示话术快照，**不生成报告页链接** | B08–B10 B19 |
| **H-15** 售后状态机 | 按 §8 的 `AFTER_SALE_TRANSITIONS` 渲染动作；换货走换发子单跳 B40，**不出现现金退款按钮** | B39–B41 B25 |
| **H-16** 用户行为独立 | B50 三个 Tab（事件概览/路径/留存）；只读，无任何写操作 | B48–B50 |

---

## 10. 四态规范与交互细则

### 10.1 四态

每个数据区域（不只是整页）都要覆盖：

| 态 | 组件 | 规则 |
|----|------|------|
| Loading | `<TableSkeleton rows={8}>` / `<CardSkeleton>` | **用骨架屏不用 spinner**；表格骨架列数与真实列一致，避免布局跳动 |
| Empty | `<EmptyState>` | 必须区分"本来就没数据"（给创建入口）和"筛选无结果"（给清空筛选） |
| Error | `<ErrorState>` | 展示 `message` + `traceId` + 重试按钮 |
| Forbidden | `<ForbiddenState>` | 说明缺哪个权限、找谁申请，不要只写"无权限" |

### 10.2 危险操作分级

| 级别 | 场景 | 交互 |
|------|------|------|
| L1 一般 | 保存、启用/停用 | 直接执行 + toast |
| L2 需确认 | 下架、驳回、取消订单 | `AlertDialog` 二次确认 |
| L3 需理由 | 敏感数据查看、驳回审批、人工重排 | 二次确认 + **必填原因**（写审计） |
| L4 需手输校验 | 退款、库存调账、全量迁移执行、封禁用户 | 二次确认 + 必填原因 + **手动输入对象编号**（如订单号）才能提交 |

### 10.3 反馈

- 成功：`toast.success`，2 秒；涉及审批流的额外说明下一步（"已提交，等待运营/财务审批"）。
- 失败：按 §4.2 分级；`42201` 业务校验用弹层不用 toast。
- 长任务：不用 toast，用 `<JobProgress>` 常驻卡片，允许离开页面后回来继续看。

---

## 11. 表单规范

```ts
// features/finance/schemas.ts
export const membershipPlanSchema = z.object({
  name: z.string().min(1, '请输入套餐名称').max(32),
  type: z.enum(['month', 'quarter', 'year']),
  priceFen: z.number().int().positive('价格必须大于 0'),
  durationDays: z.number().int().positive(),
  autoRenew: z.boolean(),
  benefits: z.array(z.string()).min(1, '至少配置一项权益'),
});
export type MembershipPlanInput = z.infer<typeof membershipPlanSchema>;
```

规则：

- **schema 是唯一真相**，TS 类型由 `z.infer` 推导，不手写 interface。
- 金额字段在 schema 里就是 `fen: number.int()`；输入框组件 `<MoneyInput>` 负责元↔分转换，表单值永远是分。
- 跨字段校验用 `.superRefine()`（如"有效期结束 > 开始"、"减少能量值必须填回收依据"）。
- 服务端返回 `40001` 时用 `setError(field, { message })` 回填到具体字段。
- 提交按钮 `disabled={!isDirty || isSubmitting}`。

---

## 12. 图表规范

- 统一用 Recharts + 原型已有的 `components/ui/chart.tsx` 封装。
- 颜色走 Tailwind CSS 变量（`--chart-1..5`），不写死 hex。
- 折线/柱状：X 轴时间统一 `MM-DD`，hover 显示完整日期 + 业务时区标注。
- 漏斗（B48）：每一台阶显示 `人数 + 相对上一步转化率 + 相对首步转化率`，三个数都要，运营看的是不同问题。
- 留存（B50）：cohort 热力表，颜色深浅按留存率；空 cell（未来日期）留白不填 0。
- 所有图表旁必须有"导出图片/CSV"（走 `<ExportButton>` 同一套脱敏规则）。

---

## 13. 文件上传、导出与长任务

### 上传

```ts
// 1. POST /files/upload (multipart) → { file_id, url }
// 2. 业务表单只提交 file_id，不提交 URL
```

限制在前端先拦一遍：图片 ≤5MB（jpg/png/webp）、Excel ≤20MB（xlsx/csv）、视频走后端直传签名（≥100MB 不经业务服务）。

### 导出（H-08）

统一时序：`POST .../export` → 拿 `job_id` → 轮询 → 得到 24h 有效下载链接 → `window.open`。

确认弹层固定文案：

> 导出文件将包含 **{N}** 条记录。手机号中间 4 位掩码，健康数据不导出；文件带你的操作人水印，下载链接 24 小时后失效。本次导出会记入审计日志。

### 长任务

批量导入（B05）、迁移（B20）、对账（B25/B51）、批量发货（B40）、批量触达（B28）全部走 `<JobProgress>`：3s 轮询、进度条、成功/失败计数、失败明细 CSV 下载、任务结束停止轮询。

---

## 14. 设计与布局规范

| 项 | 规范 |
|----|------|
| 布局 | 左侧固定导航 240px（可折叠 64px）+ 顶栏 56px + 内容区 |
| 内容宽度 | 列表页 100%（`min-width: 1280px` 横向滚动）；表单页 `max-w-3xl` |
| 密度 | 表格行高 44px；紧凑模式 36px（用户可切换并记忆） |
| 间距 | 4 的倍数；卡片间距 16px，区块间距 24px |
| 字号 | 正文 14px / 次要 12px / 页标题 20px / 数字 KPI 28px（`tabular-nums`） |
| 色板 | 沿用 shadcn 默认 + `--chart-1..5`；语义色只用于状态标签，不用于装饰 |
| 表格数字 | 金额、数量右对齐 + `font-variant-numeric: tabular-nums` |
| 响应式 | 后台只保证 ≥1280px；1024–1280 侧栏自动折叠；不做移动端适配 |
| 暗色 | 组件层支持（Tailwind `dark:`），一期不开放切换入口 |

---

## 15. Mock 与联调

### MSW

`src/mocks/handlers/` 按 feature 拆分，**mock 数据直接从原型线框里搬**（`src/data/screens-*.ts` 里的表格行就是设计好的样例数据），保证 Mock 与评审一致。

```ts
// mocks/handlers/users.ts
http.get('/api/v1/admin/users', ({ request }) => {
  const url = new URL(request.url);
  return HttpResponse.json({
    code: 0, message: 'ok',
    data: filterUsers(url.searchParams),
    pagination: { page: 1, page_size: 20, total: 24860 },
  });
});
```

Mock 必须覆盖的**异常路径**（否则四态是假的）：每个列表至少一个 `空结果`、一个 `50001`、一个 `40301`；每个提交至少一个 `40901`、一个 `42201`。

### 类型生成

```bash
npx openapi-typescript ../api/openapi/admin.yaml -o src/shared/api/generated.ts
```

放进 CI，接口变更前端能第一时间编译报错。

### 联调约定

- 环境：`VITE_API_BASE`；`.env.development` 指 Mock，`.env.staging` 指测试环境。
- 接口未就绪时 Mock 优先，**不要用假数据写死在组件里**（后期清理成本极高）。

---

## 16. 质量保障

- **TypeScript**：`strict: true`，禁用 `any`（ESLint `@typescript-eslint/no-explicit-any: error`）。
- **ESLint**：在原型配置基础上加 `eslint-plugin-import`（限制 feature 跨域 import）+ 自定义规则禁止业务代码出现"积分"（H-13）。
- **测试**（按 ROI 排优先级）：
  1. `shared/lib` 纯函数 100%（money / datetime / mask / 状态机迁移）
  2. `shared/components` 关键组件（DataTable、ConfirmButton、SensitiveField）
  3. 审批与状态机页面的集成测试（B23 B24 B41）
  4. 不为普通 CRUD 页写单测
- **性能预算**：首屏 JS ≤300KB gzip；路由级懒加载；Recharts 单独 chunk；表格超 200 行启用虚拟滚动。
- **可访问性**：Radix 已保证键盘可达；额外要求表格支持 `Tab` 导航、危险操作弹层焦点锁定。

---

## 17. 排期建议

| 阶段 | 内容 | 人日（2 前端） |
|------|------|----------------|
| Phase 1 骨架 | 工程搭建、请求层、权限、布局、DataTable/FilterBar/四态、B01/B26/B27 | 15 |
| Phase 2 核心 | 内容 6 屏、问卷 3 屏、排课 4 屏、迁移 1 屏、CRM 4 屏、训练 3 屏、会员 2 屏 | 45 |
| Phase 3 经营 | 看板 4 屏、消息 3 屏、财务 3 屏 | 25 |
| Phase 4 社区商城 | 社区 8 屏、商城 4 屏、配置 5 屏 | 35 |
| 缓冲 | 联调、走查、修复 | 20 |

> 骨架期的 15 人日不能压缩。51 屏里 30 屏是表格页，`DataTable` 和 `FilterBar` 每省 1 天，后面要多花 10 天。

---

## 附录 A · 51 屏对照表

> 路由前缀 `/admin` 省略。API 前缀 `/api/v1/admin` 省略。模板见 §6.2。

| 屏 | 名称 | 路由 | 主要 API | 权限点 | 模板 |
|----|------|------|----------|--------|------|
| B01 | 后台登录 | `/login` | `POST /auth/login` `/auth/refresh` | — | 独立 |
| B02 | 运营总览 | `/dashboard` | `/dashboard/kpi` `/dashboard/todos` `/dashboard/metrics-definitions` | `dashboard:read` | T6 |
| B03 | 视频列表 | `/content/videos` | `GET /videos` `PUT /videos/{id}/status` | `content:read` `content:publish` | T1 |
| B04 | 视频编辑 | `/content/videos/:id` | `PUT /videos/{id}` `/playback-protection` | `content:write` `content:safety_review` | T3 |
| B05 | 批量导入 | `/content/videos/import` | `POST /videos/batch-import` `GET .../{job_id}` | `content:import` | T4 |
| B06 | 标签库 | `/content/tags` | `/video-tags` | `content:tag` | T1 |
| B07 | AI 打标复核台 | `/content/tag-reviews` | `/video-tags/reviews` `/excel-import` | `content:tag_review` `content:safety_review` | T1+审核 |
| B08 | 问卷列表与版本 | `/quiz` | `/quizzes` `/republish-policy` `/versions` | `quiz:read` `quiz:write` | T1 |
| B09 | 问卷编辑器 | `/quiz/:id/questions` | `/quizzes/{id}/questions` `/tag-mappings` | `quiz:write` | T3 |
| B10 | 评测结果与推荐话术 | `/quiz/:id/result-copy` | `GET/PUT /result-copy` `POST /submit-review` | `quiz:write` `quiz:review` | T3+T5 |
| B11 | 排课规则列表 | `/schedule/rules` | `/schedule-rules` | `schedule:read` | T1 |
| B12 | 排课规则编辑 | `/schedule/rules/:id` | `PUT /schedule-rules/{id}` `/submit-review` | `schedule:write` | T3 |
| B13 | 模拟用户测试 | `/schedule/rules/:id/simulate` | `POST /simulate` `POST /publish` | `schedule:review` `schedule:publish` | T5 |
| B14 | 阶段建议 | `/schedule/phase-tips` | `/phase-tips` | `schedule:write` | T1+T3 |
| B15 | 消息模板 | `/messaging/templates` | `/message-templates` `/test-send` | `message:write` | T1+T3 |
| B16 | 消息触发器 | `/messaging/triggers` | `/message-triggers` `/estimate` `/enable` | `message:write` `message:enable` | T1+T3 |
| B17 | 标签与分群 | `/users/segments` | `/tags` `/segments` `/estimate` | `users:tag` | T1 |
| B18 | 用户列表 | `/users` | `GET /users` `/users/batch/*` `/users/export` | `users:read` `users:export` | T1 |
| B19 | 用户详情 | `/users/:id` | `/users/{id}?section=` `/sensitive-reveal` `/reschedule` | `users:read` `users:sensitive` `users:reschedule` | T2 |
| B20 | 老用户迁移 | `/users/migrations` | `/migrations/*` | `migration:import` `migration:execute` | T4 |
| B21 | 订阅/订单 | `/finance/orders` | `/subscriptions` `/orders` `/repair` `/entitlement-fix` | `finance:read` `finance:repair` | T1+T2 |
| B22 | 会员套餐 | `/finance/plans` | `/membership-plans` `/shelf` | `finance:plan` | T1+T3 |
| B23 | 能量值调整审批 | `/training/point-adjustments` | `/point-adjustments` `/approve` `/reject` | `points:apply` `points:approve` | T5 |
| B24 | 退款管理 | `/finance/refunds` | `/refunds` `/review` | `finance:refund` | T5 |
| B25 | 财务对账 | `/finance/reconciliation` | `/finance/channel-records` `/reconciliation` `/metrics` | `finance:reconcile` `finance:export` | T6 |
| B26 | 管理员/角色权限 | `/system/roles` | `/system/roles` `/admin-users` `/permissions` | `system:rbac` | T1+T3 |
| B27 | 操作审计日志 | `/system/audit` | `/system/audit-logs` `/export` | `audit:read` | T1（只读） |
| B28 | 触达任务与效果 | `/messaging/tasks` | `/message-tasks` `/stats` | `message:read` | T1+T6 |
| B29 | 打卡数据 | `/training/checkins` | `/checkins/stats` `/checkins/records` | `training:read` | T6 |
| B30 | 能量值规则 | `/training/point-rules` | `/point-rules` | `points:rule` | T1+T3 |
| B31 | 课程组合 | `/content/courses` | `/courses` `/sections` `/status` `/course-columns` | `content:course` | T1+T3 |
| B32 | 帖子管理 | `/community/posts` | `/community/posts` | `community:read` `community:moderate` | T1 |
| B33 | 评论管理 | `/community/comments` | `/community/comments` `/official-reply` | `community:moderate` | T1 |
| B34 | 官方内容 | `/community/official` | `/community/official-contents` | `community:write` | T1+T3 |
| B35 | UGC 审核 | `/community/moderation` | `/moderation/queue` `/decide` | `community:moderate` | T1+T5 |
| B36 | 举报与申诉 | `/community/reports` | `/reports` `/appeals` `/handle` `/review` | `community:moderate` | T5 |
| B37 | 挑战赛管理 | `/community/challenges` | `/challenges` `/participants` `/analytics` | `community:activity` | T2 |
| B38 | 活动投放 | `/community/placements` | `/community/placements` | `community:activity` | T1+T3 |
| B39 | 商品与库存 | `/mall/products` | `/mall/products` `/skus` `/stock-ops` `/stock-logs` | `mall:product` `mall:stock` | T1+T3 |
| B40 | 商城订单与发货 | `/mall/orders` | `/mall/orders` `/ship` `/batch-ship` `/import-tracking` | `mall:order` `mall:ship` | T1+T2 |
| B41 | 售后管理 | `/mall/after-sales` | `/mall/after-sales/*` | `mall:after_sale` | T2+T5 |
| B42 | 企微与反馈入口 | `/system/support` | `GET/PUT /support/wecom-qrcode` | `config:write` | T3 |
| B43 | App 版本管理 | `/system/app-versions` | `/config/app-versions` | `config:write` | T1+T3 |
| B44 | 功能开关 | `/system/feature-flags` | `/config/feature-flags` | `config:flag` | T1+T3 |
| B45 | 公告与弹窗 | `/system/announcements` | `/config/announcements` | `config:write` | T1+T3 |
| B46 | 第三方服务配置 | `/system/third-party` | `/config/third-party-services` | `config:read` | T1（只读） |
| B47 | 社区数据 | `/community/analytics` | `/community/analytics` | `community:read` | T6 |
| B48 | 用户转化漏斗 | `/dashboard/funnel` | `/analytics/funnel` | `analytics:read` | T6 |
| B49 | 业务趋势 | `/dashboard/trends` | `/analytics/trends` | `analytics:read` | T6 |
| B50 | 用户行为分析 | `/dashboard/behaviors` | `/analytics/behaviors/{events,paths,retention}` | `analytics:read` | T6 |
| B51 | 库存对账 | `/mall/stock-reconciliation` | `/mall/reconciliation/*` | `mall:stock` `mall:reconcile` | T4+T6 |

---

## 附录 B · 权限点清单（前端常量）

按 `module:action` 组织，与 `admin_permissions` 表一一对应。**新增页面必须先在此登记权限点**，再写路由。

| 模块 | 权限点 |
|------|--------|
| dashboard | `dashboard:read` |
| analytics | `analytics:read` `analytics:export` |
| users | `users:read` `users:sensitive` `users:health` `users:tag` `users:export` `users:reschedule` `users:batch_message` |
| migration | `migration:import` `migration:execute` |
| content | `content:read` `content:write` `content:publish` `content:import` `content:tag` `content:tag_review` `content:safety_review` `content:course` |
| quiz | `quiz:read` `quiz:write` `quiz:review` |
| schedule | `schedule:read` `schedule:write` `schedule:review` `schedule:publish` |
| training | `training:read` |
| points | `points:read` `points:rule` `points:apply` `points:approve` |
| finance | `finance:read` `finance:plan` `finance:refund` `finance:repair` `finance:reconcile` `finance:export` |
| message | `message:read` `message:write` `message:enable` |
| community | `community:read` `community:write` `community:moderate` `community:activity` |
| mall | `mall:read` `mall:product` `mall:stock` `mall:order` `mall:ship` `mall:after_sale` `mall:reconcile` |
| config | `config:read` `config:write` `config:flag` |
| system | `system:rbac` `audit:read` |

角色 → 权限的映射由后端 `admin_role_permissions` 维护，前端**不硬编码角色**，只判断权限点。原型 OverviewView 里的 8 个角色只作为初始化种子参考。

---

## 附录 C · 单页验收清单

每个页面提测前逐条自检：

**通用**

- [ ] 四态齐全：Loading 骨架 / Empty（区分无数据与无结果）/ Error（含 traceId）/ Forbidden
- [ ] 筛选、分页、Tab 已同步到 URL，刷新与分享后状态保持
- [ ] 无权限的按钮/列/Tab 是**不渲染**，不是 disabled
- [ ] 所有状态文案取自 `STATUS_MAP`，无硬编码中文状态
- [ ] 金额来自 `<MoneyText>`，未出现浮点运算
- [ ] 全文无"积分"二字（H-13）
- [ ] 变更操作后相关 Query 已按 §5.3 失效
- [ ] 表格数字右对齐 + `tabular-nums`；长文本截断带 tooltip

**写操作页额外**

- [ ] 危险操作按 §10.2 分级正确（L4 需手输编号）
- [ ] 敏感接口带 `Idempotency-Key`，重复提交返回 `40901` 时提示友好并刷新
- [ ] 表单 `isDirty` 时离开有拦截
- [ ] 服务端字段错误能回填到对应输入框
- [ ] 审批类页面：同人提交/审批时按钮隐藏并有说明（H-04）

**导出/长任务页额外**

- [ ] 导出确认层含 H-08 完整文案
- [ ] 长任务轮询在任务结束/组件卸载时停止
- [ ] 失败明细可下载

---

## 附录 D · 待确认项对前端的影响

| 编号 | 待确认 | 前端预留做法 |
|------|--------|--------------|
| B-Q01 | AI 打标模型 | 复核台按 `{tag, confidence, source}` 抽象，不绑定模型 |
| B-Q02 | 视频存量文件现状 | 导入向导第 2 步的匹配方式做成配置项（文件名前缀 / 上传清单） |
| B-Q03 | 安全标签审核人 | 用权限点 `content:safety_review` 而非角色名判断 |
| B-Q06 | 客服工单形态 | B19「消息工单」分栏预留空态卡片，接企微跳转 |
| B-Q07 | 支付渠道范围 | 渠道枚举集中在 `constants/channel.ts`，新增渠道只改一处 |
| B-Q08 / B-Q09 | 商城/社区是否首发 | 路由与菜单受 B44 功能开关控制，代码可合入但默认关闭 |
| B-Q10 | 多语言/多区域 | 文案统一走 `t()` 包装（一期只有 zh-CN 词表），时间统一走 `formatBizDate` |

---

*本指南与原型 `src/data/screens-*.ts` 同源。原型改口径时，本文对应章节需同步更新；冲突时以《后端需求》+ `admin-api-spec.md` 为准。*
