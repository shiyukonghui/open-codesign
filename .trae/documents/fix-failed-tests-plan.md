# 修复失败测试问题的计划

## 问题概述

需要修复两个失败的测试：
1. `preview-runtime.test.ts` - Chrome 导航超时 (15秒超时)
2. `generate.workspace-rename.test.ts` - 重命名协调测试 (异步时序问题)

---

## 问题 1: preview-runtime.test.ts - Chrome 导航超时

### 问题分析

**文件位置**: `apps/desktop/src/main/preview-runtime.test.ts`

**相关实现**: `apps/desktop/src/main/preview-runtime.ts`

**问题根源**:

1. **超时配置**: 在 `preview-runtime.ts` 第 36 行定义了 `LOAD_TIMEOUT_MS = 15_000`（15秒），这是 Puppeteer 的 `page.goto()` 导航超时时间。

2. **测试超时**: 测试用例设置了 30 秒超时（第 204、221、241 等行），但实际的 Chrome 导航超时是 15 秒。

3. **Chrome 启动开销**: 测试需要：
   - 调用 `findSystemChrome()` 发现系统 Chrome
   - 启动 Puppeteer 浏览器实例
   - 创建临时用户数据目录
   - 导航到预览文件

4. **CI 环境问题**: 在 CI 环境中，Chrome 可能：
   - 首次启动需要更长时间
   - 资源受限导致启动缓慢
   - 需要下载或初始化组件

### 修复方案

**方案 A: 增加导航超时时间** (推荐)

修改 `preview-runtime.ts` 中的 `LOAD_TIMEOUT_MS` 常量：

```typescript
// 从 15_000 增加到 30_000
const LOAD_TIMEOUT_MS = 30_000;
```

**方案 B: 使超时可配置**

在 `RunPreviewOptions` 接口中添加可选的 `timeoutMs` 参数：

```typescript
export interface RunPreviewOptions {
  path: string;
  vision: boolean;
  workspaceRoot: string;
  timeoutMs?: number; // 可选超时配置
}
```

**方案 C: 测试中跳过慢速测试**

在测试中增加超时时间或使用 `describe.skip` 跳过需要 Chrome 的测试（当 Chrome 不可用时）。

### 推荐方案

采用 **方案 A**，将 `LOAD_TIMEOUT_MS` 从 15 秒增加到 30 秒。理由：
- 简单直接，不需要修改接口
- 30 秒对于大多数环境足够
- 与测试用例的超时设置一致

---

## 问题 2: generate.workspace-rename.test.ts - 重命名协调测试

### 问题分析

**文件位置**: `apps/desktop/src/main/ipc/generate.workspace-rename.test.ts`

**相关实现**:
- `apps/desktop/src/main/workspace-path-lock.ts` - 工作区路径锁定机制
- `apps/desktop/src/main/snapshots-ipc.ts` - 重命名 IPC 处理
- `apps/desktop/src/main/ipc/generate.ts` - 生成 IPC 处理

**问题根源**:

测试用例 `allows set_title rename to settle while the agent generation is still running` 的关键代码：

```typescript
// 第 261-272 行：启动生成操作
const generatePromise = Promise.resolve(
  generate(null, { ... }),
);
await generateControl.started; // 等待生成开始

// 第 274-283 行：启动重命名操作
let renameSettled = false;
const renamePromise = Promise.resolve(
  renameDesign(null, { ... }),
).finally(() => {
  renameSettled = true;
});

// 第 285-287 行：等待 20ms 后检查重命名是否完成
await new Promise((resolve) => setTimeout(resolve, 20));
expect(renameSettled).toBe(true);
```

**时序问题**:

1. **协调机制**: 
   - `runWithWorkspaceRenameQueue` (workspace-path-lock.ts:56-78) 负责协调重命名操作
   - 它需要等待 `waitForStableWorkspacePathLeases` 完成
   - `withStableWorkspacePath` 在生成过程中持有 lease

2. **问题所在**:
   - 测试期望重命名在 20ms 内完成
   - 但 `runWithWorkspaceRenameQueue` 需要等待所有 `stableWorkspacePathLeases` 释放
   - 生成过程中 `withStableWorkspacePath` 持有 lease，阻止重命名完成

3. **关键代码路径**:
   - `generate.ts` 第 444 行：`withStableWorkspacePath(designId, () => readWorkspaceFilesAt(...))`
   - `generate.ts` 第 531 行：`withStableWorkspacePath(designId, async () => { ... })`
   - 这些调用在生成过程中持有 lease

4. **测试模拟问题**:
   - 测试中 `generateControl.started` 只标记生成开始
   - 但 `withStableWorkspacePath` 的 lease 在生成开始后立即获取
   - 重命名操作被阻塞等待 lease 释放

### 修复方案

**方案 A: 修改测试期望** (推荐)

测试应该验证重命名操作被正确阻塞，而不是期望它在生成过程中完成：

```typescript
// 修改测试：验证重命名被阻塞直到生成完成
it('blocks rename until generation completes', async () => {
  // ... 启动生成 ...
  
  let renameSettled = false;
  const renamePromise = ...;
  
  // 等待一小段时间，验证重命名被阻塞
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(renameSettled).toBe(false); // 重命名应该被阻塞
  
  // 完成生成
  generateControl.release();
  await Promise.allSettled([generatePromise, renamePromise]);
  
  // 现在重命名应该完成
  expect(renameSettled).toBe(true);
});
```

**方案 B: 修改协调机制**

修改 `runWithWorkspaceRenameQueue` 使其不等待 lease，而是直接执行重命名：

这会破坏协调机制的设计目的，不推荐。

**方案 C: 增加等待时间**

将等待时间从 20ms 增加到更长时间：

```typescript
await new Promise((resolve) => setTimeout(resolve, 100));
```

这只是掩盖问题，不是真正的修复。

### 推荐方案

采用 **方案 A**，修改测试期望以正确验证协调行为：

1. 测试应该验证重命名在生成过程中被阻塞
2. 测试应该验证重命名在生成完成后成功执行
3. 这符合协调机制的设计目的

---

## 实施步骤

### 步骤 1: 修复 preview-runtime.test.ts 超时问题

1. 修改 `apps/desktop/src/main/preview-runtime.ts`
2. 将 `LOAD_TIMEOUT_MS` 从 `15_000` 改为 `30_000`

### 步骤 2: 修复 generate.workspace-rename.test.ts 时序问题

1. 修改 `apps/desktop/src/main/ipc/generate.workspace-rename.test.ts`
2. 更新测试用例 `allows set_title rename to settle while the agent generation is still running`
3. 验证重命名在生成过程中被正确阻塞
4. 验证重命名在生成完成后成功执行

### 步骤 3: 运行测试验证

1. 运行 `pnpm test` 验证修复
2. 确保所有测试通过

---

## 风险评估

### preview-runtime.test.ts 修复风险

- **低风险**: 增加超时时间不影响功能正确性
- **潜在影响**: 预览操作可能需要更长时间才能超时

### generate.workspace-rename.test.ts 修复风险

- **低风险**: 修改测试期望以匹配实际行为
- **潜在影响**: 需要确保协调机制工作正常

---

## 验证清单

- [ ] `LOAD_TIMEOUT_MS` 已增加到 30 秒
- [ ] 重命名协调测试已更新
- [ ] 所有测试通过
- [ ] 没有引入新的测试失败
