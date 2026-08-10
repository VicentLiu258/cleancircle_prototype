# Clean Circle · Admin API 规格（Golang + PostgreSQL）

> **依据**：`docs/admin-prototype-v2-from-backend-req.md`（B01–B51）+ 《后端需求》  
> **技术栈建议**：Go（Gin/Echo）+ PostgreSQL + Redis + MQ（NATS/RabbitMQ）  
> **Base URL**：`/api/v1/admin`  
> **日期**：2026-08-10

---

## 1. 约定

### 1.1 统一响应

```json
{
  "code": 0,
  "message": "ok",
  "data": {},
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 100
  }
}
```

| code | 含义 |
|------|------|
| 0 | 成功 |
| 40001 | 参数错误 |
| 40101 | 未登录 / Token 失效 |
| 40301 | 无权限 |
| 40401 | 资源不存在 |
| 40901 | 冲突（幂等键重复、状态机非法迁移） |
| 42201 | 业务校验失败 |
| 42901 | 限流 |
| 50001 | 内部错误 |

### 1.2 分页与筛选

- Query：`page`（默认 1）、`page_size`（默认 20，最大 100）、`sort`（如 `-created_at`）
- 列表筛选统一 snake_case query 参数
- 导出类接口：`POST .../export` 返回异步任务或短期下载 URL（H-08：脱敏 + 水印 + 24h）

### 1.3 鉴权与幂等

- Header：`Authorization: Bearer <access_token>`
- 写操作敏感接口：`Idempotency-Key: <uuid>`
- 敏感字段默认掩码；完整查看需权限 `sensitive:read` 并写审计

### 1.4 金额与时间

- 金额：整数 **分**（CNY fen），字段名 `*_amount_fen`
- 时间：ISO 8601 / `timestamptz`；统计日切 `Asia/Shanghai`

---

## 2. Auth & System（B01 / B26 / B27）

| Method | Path | 屏 | 说明 |
|--------|------|-----|------|
| POST | `/auth/login` | B01 | body: `{ username, password, totp? }` → tokens |
| POST | `/auth/refresh` | B01 | refresh_token → 新 access |
| POST | `/auth/logout` | B01 | 作废 refresh |
| GET | `/auth/me` | — | 当前管理员 + 权限点 |
| GET | `/system/roles` | B26 | 角色列表 |
| POST | `/system/roles` | B26 | 创建角色 |
| PUT | `/system/roles/{id}` | B26 | 更新 |
| PUT | `/system/roles/{id}/permissions` | B26 | 模块权限树 |
| GET | `/system/admin-users` | B26 | 后台账号 |
| POST | `/system/admin-users` | B26 | 创建账号 |
| GET | `/system/audit-logs` | B27 | 审计查询 |
| POST | `/system/audit-logs/export` | B27 | 脱敏导出 |

**登录示例**

```http
POST /api/v1/admin/auth/login
Content-Type: application/json

{ "username": "ops", "password": "***", "totp": "123456" }
```

```json
{
  "code": 0,
  "data": {
    "access_token": "...",
    "refresh_token": "...",
    "expires_in": 7200,
    "admin": { "id": 1, "username": "ops", "roles": ["内容运营"] }
  }
}
```

---

## 3. Dashboard & Analytics（B02 / B48 / B49 / B50）

| Method | Path | 屏 | Query 要点 |
|--------|------|-----|------------|
| GET | `/dashboard/kpi` | B02 | `range=today\|yesterday\|7d\|30d\|custom&from=&to=` |
| GET | `/dashboard/todos` | B02 | 待审核/反馈(企微占位)/退款/发货计数 |
| GET | `/dashboard/metrics-definitions` | B02 | 附录 B 口径 |
| GET | `/analytics/funnel` | B48 | 渠道、新老、标签、会员类型、版本、时间 |
| GET | `/analytics/trends` | B49 | `tab=user\|training\|revenue&granularity=day\|week` |
| GET | `/analytics/behaviors/events` | B50 | 事件 UV/PV/渗透 |
| GET | `/analytics/behaviors/paths` | B50 | `start_event=&steps=5` |
| GET | `/analytics/behaviors/retention` | B50 | cohort 注册日 D1/D7/D30 |

**KPI 响应片段**

```json
{
  "range": "today",
  "users": { "new": 120, "dau": 8200, "wau": 21000, "mau": 68000, "new_members": 45 },
  "training": { "users": 3100, "sessions": 5200, "completed": 2800, "checkins": 2600 },
  "commerce": { "orders": 88, "subscribers": 42, "sub_amount_fen": 415800, "refund_users": 3, "refund_amount_fen": 29700 },
  "community": { "new_posts": 45, "new_comments": 120, "pending_moderation": 12, "pending_reports": 4 }
}
```

---

## 4. Users & CRM（B17–B20 / B18 / B19）

| Method | Path | 屏 |
|--------|------|-----|
| GET | `/users` | B18 |
| GET | `/users/{id}` | B19（`?section=profile\|quiz\|schedule\|checkin\|orders\|points\|messages`） |
| GET | `/users/{id}/trainings` | B19 |
| GET | `/users/{id}/orders` | B19 |
| GET | `/users/{id}/community` | B19 |
| GET | `/users/{id}/messages` | B19 |
| POST | `/users/{id}/sensitive-reveal` | B19 | 二次确认 + 审计 |
| POST | `/users/{id}/reschedule` | B19 | 人工重排未来课表（H-09） |
| POST | `/users/batch/tags` | B18 | `{ user_ids, tag_ids, action: add\|remove }` |
| POST | `/users/batch/segments` | B18 |
| POST | `/users/batch/message` | B18 → 创建触达任务 |
| POST | `/users/export` | B18 |
| GET/POST | `/tags` | B17 |
| PUT/DELETE | `/tags/{id}` | B17 |
| GET/POST | `/segments` | B17 |
| PUT | `/segments/{id}` | B17 |
| POST | `/segments/{id}/estimate` | B17 | 预估人数 |
| POST | `/migrations/template` | B20 | 下载模板 |
| POST | `/migrations/import` | B20 | multipart Excel |
| POST | `/migrations/import/{batch_id}/confirm` | B20 |
| GET | `/migrations/batches` | B20 |
| GET | `/migrations/batches/{id}` | B20 |
| GET | `/migrations/batches/{id}/failures` | B20 | 失败 CSV |

**用户列表筛选（B18）**

`q`（ID/昵称/手机）、`member_status`、`registered_from/to`、`active_from/to`、`training_status`、`cycle_phase`、`tag_ids`、`channel`、`app_version`、`migration_status`

---

## 5. Messaging（B15 / B16 / B28）

| Method | Path | 屏 |
|--------|------|-----|
| GET/POST | `/message-templates` | B15 |
| PUT | `/message-templates/{id}` | B15 |
| POST | `/message-templates/{id}/test-send` | B15 |
| GET/POST | `/message-triggers` | B16 |
| PUT | `/message-triggers/{id}` | B16 |
| POST | `/message-triggers/{id}/estimate` | B16 | 近 7 日回放预估（H-11） |
| POST | `/message-triggers/{id}/enable` | B16 |
| GET/POST | `/message-tasks` | B28 | 定向任务 |
| GET | `/message-tasks/{id}` | B28 |
| GET | `/message-tasks/{id}/stats` | B28 | 到达/打开/点击/转化 |

**触发事件枚举（B16）**

`register_no_quiz` · `quiz_done_no_train` · `checkin_streak_3` · `checkin_streak_7` · `checkin_break_2` · `no_train_7d` · `member_expiring` · `renew_failed` · `points_expiring` · `challenge_ending`

---

## 6. Quiz（B08–B10）

| Method | Path | 屏 |
|--------|------|-----|
| GET/POST | `/quizzes` | B08 |
| PUT | `/quizzes/{id}` | B08 |
| PUT | `/quizzes/{id}/republish-policy` | B08 | `{ days: 14\|28 }` |
| POST | `/quizzes/{id}/versions` | B08 |
| GET/POST | `/quizzes/{id}/questions` | B09 |
| PUT | `/questions/{id}` | B09 |
| PUT | `/questions/{id}/options/{opt_id}/tag-mappings` | B09 |
| GET/PUT | `/quizzes/{id}/result-copy` | B10 |
| POST | `/quizzes/{id}/submit-review` | B10 | 审批流（H-04） |

---

## 7. Content & Courses（B03–B07 / B31）

| Method | Path | 屏 |
|--------|------|-----|
| GET/POST | `/videos` | B03/B04 |
| PUT | `/videos/{id}` | B04 |
| PUT | `/videos/{id}/status` | B03 | 上下架（含影响预览） |
| PUT | `/videos/{id}/playback-protection` | B04 |
| POST | `/videos/batch-import` | B05 |
| GET | `/videos/batch-import/{job_id}` | B05 |
| GET/POST | `/video-tags` | B06 |
| GET | `/video-tags/reviews` | B07 |
| POST | `/video-tags/reviews/{id}` | B07 | 接受/驳回/改标 |
| POST | `/video-tags/excel-import` | B07 | H-03 双通道 |
| GET/POST | `/courses` | B31 |
| PUT | `/courses/{id}` | B31 |
| PUT | `/courses/{id}/sections` | B31 | 章节/视频序/休息 |
| PUT | `/courses/{id}/status` | B31 | 草稿→待发布→已发布→下架 |
| GET/POST | `/course-columns` | B31 | 专栏 |

---

## 8. Schedule（B11–B14）

| Method | Path | 屏 |
|--------|------|-----|
| GET/POST | `/schedule-rules` | B11 |
| PUT | `/schedule-rules/{id}` | B12 |
| POST | `/schedule-rules/{id}/submit-review` | B12 |
| POST | `/schedule-rules/{id}/simulate` | B13 | 30 天模拟 |
| POST | `/schedule-rules/{id}/publish` | B13 |
| GET/POST | `/phase-tips` | B14 |
| PUT | `/phase-tips/{id}` | B14 |

---

## 9. Training & Points（B29 / B30 / B23）

| Method | Path | 屏 |
|--------|------|-----|
| GET | `/checkins/stats` | B29 |
| GET | `/checkins/records` | B29 | 下钻用户/日 |
| GET/POST | `/point-rules` | B30 |
| PUT | `/point-rules/{id}` | B30 |
| GET | `/point-ledgers` | — | 流水只读 |
| GET/POST | `/point-adjustments` | B23 |
| POST | `/point-adjustments/{id}/approve` | B23 |
| POST | `/point-adjustments/{id}/reject` | B23 |

**能量值规则字段**：`scene`、`amount`、`daily_cap`、`weekly_cap`、`valid_from/to`、`points_ttl_days`、`allow_repeat`、`completion_threshold`（完课阈值，默认 0.8）

---

## 10. Membership & Finance（B21–B25 / B22）

| Method | Path | 屏 |
|--------|------|-----|
| GET/POST | `/membership-plans` | B22 |
| PUT | `/membership-plans/{id}` | B22 |
| PUT | `/membership-plans/{id}/shelf` | B22 | 上下架 |
| GET | `/subscriptions` | B21 |
| GET | `/subscriptions/{id}` | B21 |
| GET | `/orders` | B21 |
| GET | `/orders/{id}` | B21 |
| POST | `/orders/{id}/repair` | B21 | 补单审批 |
| POST | `/orders/{id}/entitlement-fix` | B21 | 权益修复 |
| GET/POST | `/refunds` | B24 |
| POST | `/refunds/{id}/review` | B24 | 通过/拒绝 |
| GET | `/finance/channel-records` | B25 | `channel=wechat\|alipay\|apple` |
| GET | `/finance/reconciliation` | B25 |
| GET | `/finance/reconciliation/{batch_id}` | B25 |
| POST | `/finance/reconciliation/run` | B25 |
| GET | `/finance/metrics` | B25 | 订阅收入/ARPU/LTV |

**订单状态**：`pending_pay` → `paid` \| `pay_failed` \| `cancelled`；其后 `refunding` → `refunded`

**退款状态**：`pending_review` → `approved` \| `rejected` → `processing` → `succeeded` \| `failed`

---

## 11. Community（B32–B38 / B47）

| Method | Path | 屏 |
|--------|------|-----|
| GET | `/community/posts` | B32 |
| PUT | `/community/posts/{id}` | B32 | 审核/下架/推荐/置顶/精选 |
| GET | `/community/comments` | B33 |
| POST | `/community/comments/{id}/official-reply` | B33 |
| PUT | `/community/comments/{id}` | B33 | 隐藏/删除/审核 |
| GET/POST | `/community/official-contents` | B34 |
| PUT | `/community/official-contents/{id}` | B34 |
| GET | `/community/moderation/queue` | B35 |
| POST | `/community/moderation/{id}/decide` | B35 |
| GET | `/community/reports` | B36 |
| POST | `/community/reports/{id}/handle` | B36 |
| GET | `/community/appeals` | B36 |
| POST | `/community/appeals/{id}/review` | B36 |
| GET/POST | `/community/challenges` | B37 |
| PUT | `/community/challenges/{id}` | B37 |
| GET | `/community/challenges/{id}/participants` | B37 |
| POST | `/community/challenges/{id}/participants/{uid}/actions` | B37 | 补录/补发/取消资格 |
| GET | `/community/challenges/{id}/analytics` | B37 |
| GET/POST | `/community/placements` | B38 |
| PUT | `/community/placements/{id}` | B38 |
| GET | `/community/analytics` | B47 |

**UGC 审核结果**：`pass` \| `reject` \| `request_edit` \| `escalate`  
**用户处置**：`warn` \| `delete_content` \| `mute` \| `ban` \| `limit_exposure` \| `lift`

---

## 12. Mall（B39–B41 / B51）

| Method | Path | 屏 |
|--------|------|-----|
| GET/POST | `/mall/products` | B39 |
| PUT | `/mall/products/{id}` | B39 |
| GET/POST | `/mall/skus` | B39 |
| POST | `/mall/skus/{id}/stock-ops` | B39 | `op=in\|out\|lock\|release\|adjust\|inventory` |
| GET | `/mall/stock-logs` | B39 |
| GET | `/mall/orders` | B40 |
| GET | `/mall/orders/{id}` | B40 |
| POST | `/mall/orders/{id}/ship` | B40 |
| POST | `/mall/orders/batch-ship` | B40 |
| POST | `/mall/orders/import-tracking` | B40 |
| GET | `/mall/orders/{id}/logistics` | B40 |
| GET/POST | `/mall/after-sales` | B41 |
| GET | `/mall/after-sales/{id}` | B41 |
| POST | `/mall/after-sales/{id}/review` | B41 |
| POST | `/mall/after-sales/{id}/receive` | B41 | 寄回收货+库存回补 |
| POST | `/mall/after-sales/{id}/refund` | B41 |
| POST | `/mall/after-sales/{id}/close` | B41 |
| GET/POST | `/mall/reconciliation` | B51 | 生成对账单 |
| GET | `/mall/reconciliation/{id}` | B51 |
| PUT | `/mall/reconciliation/{id}/items/{sku_id}` | B51 | 标记原因 |
| POST | `/mall/reconciliation/{id}/adjust` | B51 | 调账（写库存流水） |

### 12.1 售后状态机（H-15）

```
pending → pending_review → approved | rejected
approved → awaiting_return → received → refunding → completed   # 退货退款
approved → refunding → completed                                # 仅退款（可跳过寄回）
approved → awaiting_return → received → exchange_shipping → completed  # 换货
旁路：cancelled | closed
```

类型：`return_refund` \| `exchange` \| `refund_only`

### 12.2 库存操作请求

```json
{
  "op": "adjust",
  "quantity": -3,
  "reason": "盘点误差",
  "idempotency_key": "rc-0807-sku1",
  "ref_type": "stock_reconciliation",
  "ref_id": "RC-0807"
}
```

---

## 13. Support & Config（B42–B46）

| Method | Path | 屏 |
|--------|------|-----|
| GET/PUT | `/support/wecom-qrcode` | B42 |
| GET/POST | `/config/app-versions` | B43 |
| PUT | `/config/app-versions/{id}` | B43 |
| GET/POST | `/config/feature-flags` | B44 |
| PUT | `/config/feature-flags/{id}` | B44 | 含灰度：平台/版本/人群/时间 |
| GET/POST | `/config/announcements` | B45 |
| PUT | `/config/announcements/{id}` | B45 |
| GET | `/config/third-party-services` | B46 | 状态卡；密钥不明文 |

**功能开关 key 示例**：`quiz` · `training_recommend` · `community` · `messaging` · `challenge` · `mall` · `points` · `membership` · `ugc_pre_moderation`

---

## 14. Webhooks（非 Admin，建议独立入口）

Base：`/api/v1/webhooks`（验签 + 幂等 + 异步入队）

| Method | Path | 说明 |
|--------|------|------|
| POST | `/wechat-pay` | 支付/退款通知 |
| POST | `/alipay` | 支付/退款通知 |
| POST | `/apple-iap` | 订阅状态 / **App 外退款** |
| POST | `/logistics/{provider}` | 物流轨迹 / 签收 |

处理原则：

1. 验签失败 → 401/403，不落库  
2. 重复通知 → 按渠道流水号幂等，返回成功  
3. Apple 外退 → 写入 `refunds`（来源 `apple_external`）→ 更新订单/订阅 → 回收权益 → 财务流水 → 告警  
4. 业务失败 → 入补偿队列，渠道侧仍返回 200（避免风暴），内部告警

---

## 15. 文件上传

| Method | Path | 说明 |
|--------|------|------|
| POST | `/files/upload` | 图片/视频/Excel；返回 `file_id` + URL |
| GET | `/files/{id}` | 鉴权下载（导出链接 24h） |

---

## 16. Go 工程建议结构

```
cmd/
  admin-api/main.go
  worker/main.go
  webhook-api/main.go
internal/
  middleware/     # auth, rbac, audit, idempotency, ratelimit
  handler/admin/
  service/
  repository/     # sqlc
  domain/         # 状态机
  integration/    # wechat, alipay, apple, push, oss, logistics
  worker/
migrations/
api/openapi/admin.yaml
```

### 分期

| Phase | 范围 | 屏 |
|-------|------|-----|
| 1 | Auth, Users, Quiz, Content, Schedule, Points, Membership | B01,B08–B14,B17–B20,B22–B23,B26–B27,B29–B31 |
| 2 | Dashboard, Analytics, Messaging, Refunds, Finance | B02,B15–B16,B24–B25,B28,B48–B50 |
| 3 | Community, Mall, Config | B32–B41,B43–B47,B51 |
| 4 | Webhook 硬化、对账 Job、事件管道 | 生产稳定性 |

---

## 17. 与原型屏对照索引

| 屏 | 主要 API 前缀 |
|----|----------------|
| B01 | `/auth` |
| B02 | `/dashboard` |
| B03–B07 | `/videos`, `/video-tags` |
| B08–B10 | `/quizzes` |
| B11–B14 | `/schedule-rules`, `/phase-tips` |
| B15–B16,B28 | `/message-*` |
| B17–B20 | `/users`, `/tags`, `/segments`, `/migrations` |
| B21–B25,B22 | `/orders`, `/subscriptions`, `/refunds`, `/finance`, `/membership-plans` |
| B26–B27 | `/system` |
| B29–B30,B23 | `/checkins`, `/point-*` |
| B31 | `/courses` |
| B32–B38,B47 | `/community/*` |
| B39–B41,B51 | `/mall/*` |
| B42–B46 | `/support`, `/config` |
| B48–B50 | `/analytics` |

---

*实现时以 OpenAPI 生成客户端/校验；本文为架构级契约，字段可按 sqlc schema 细化。*
