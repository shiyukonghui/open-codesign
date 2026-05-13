# 修复 Biome Lint 错误计划

## 问题概述

根据 `temp.md` 日志，git提交时 Biome lint 检查发现了以下问题：
- 8 个错误
- 11 个警告

涉及 6 个文件，需要修复以下类型的问题：

| 问题类型 | 数量 | 文件 |
|---------|------|------|
| 未使用的导入 (noUnusedImports) | 1 | done-verify.test.ts |
| 非空断言 (noNonNullAssertion) | 8 | 多个测试文件 |
| 导入排序 (organizeImports) | 3 | done-verify.test.ts, done-verify.ts, snapshots-ipc.workspace-naming.test.ts |
| 格式化问题 | 1 | done-verify.test.ts |
| 可选链后的非空断言 (noNonNullAssertedOptionalChain) | 4 | snapshots-ipc.workspace-naming.test.ts |

## 修复步骤

### 步骤 1: 修复 done-verify.test.ts

**文件**: `apps/desktop/src/main/done-verify.test.ts`

修复内容：
1. 删除未使用的导入 `normalizePathSeparators` (第5行)
2. 重新排序导入语句
3. 格式化第46-63行的 expect 调用

修改后的导入部分：
```typescript
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { normalizePathSeparators } from '@open-codesign/shared';
import { describe, expect, it } from 'vitest';
```

改为：
```typescript
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
```

格式化问题修复：将多行 expect 调用改为单行格式。

### 步骤 2: 修复 done-verify.ts

**文件**: `apps/desktop/src/main/done-verify.ts`

修复内容：
重新排序导入语句（第23-24行）

修改前：
```typescript
import { pathsEqual } from '@open-codesign/shared';
import { buildSrcdoc } from '@open-codesign/runtime';
```

改为：
```typescript
import { buildSrcdoc } from '@open-codesign/runtime';
import { pathsEqual } from '@open-codesign/shared';
```

### 步骤 3: 修复 exporter-ipc.test.ts

**文件**: `apps/desktop/src/main/exporter-ipc.test.ts`

修复内容：
修复第65、68、106行的非空断言

修改前（第65行）：
```typescript
expect(normalizePathSeparators(exportAssetOptions(result).assetRootPath!)).toContain('/workspace');
```

改为：
```typescript
const assetOptions = exportAssetOptions(result);
expect(assetOptions.assetRootPath).toBeDefined();
expect(normalizePathSeparators(assetOptions.assetRootPath!)).toContain('/workspace');
```

或者使用类型断言：
```typescript
expect(normalizePathSeparators(exportAssetOptions(result).assetRootPath as string)).toContain('/workspace');
```

类似修复第68行和第106行。

### 步骤 4: 修复 snapshots-ipc.workspace-naming.test.ts

**文件**: `apps/desktop/src/main/snapshots-ipc.workspace-naming.test.ts`

修复内容：
1. 重新排序导入语句（第4-5行）
2. 修复第92、93、113、131行的可选链后非空断言

导入排序修改前：
```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { normalizePathSeparators } from '@open-codesign/shared';
```

改为：
```typescript
import { normalizePathSeparators } from '@open-codesign/shared';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
```

非空断言修复（第92行）：
修改前：
```typescript
expectPathEqual(updated?.workspacePath!, expected);
```

改为：
```typescript
expect(updated?.workspacePath).toBeDefined();
expectPathEqual(updated!.workspacePath, expected);
```

或者：
```typescript
if (updated?.workspacePath) {
  expectPathEqual(updated.workspacePath, expected);
}
```

类似修复第93、113、131行。

### 步骤 5: 修复 generate.workspace-rename.test.ts

**文件**: `apps/desktop/src/main/ipc/generate.workspace-rename.test.ts`

修复内容：
修复第288行的非空断言

修改前：
```typescript
expectPathEqual(renamed.workspacePath!, path.join(defaultWorkspaceRoot, 'Hybrid-Workshop-Day-Agenda'));
```

改为：
```typescript
expect(renamed.workspacePath).toBeDefined();
expectPathEqual(renamed.workspacePath as string, path.join(defaultWorkspaceRoot, 'Hybrid-Workshop-Day-Agenda'));
```

### 步骤 6: 修复 snapshots-ipc.workspace-rename-race.test.ts

**文件**: `apps/desktop/src/main/snapshots-ipc.workspace-rename-race.test.ts`

修复内容：
修复第156、203行的非空断言

修改前（第156行）：
```typescript
expectPathEqual(updated.workspacePath!, path.join(root, 'General-Agent-Benchmark-Deck'));
```

改为：
```typescript
expect(updated.workspacePath).toBeDefined();
expectPathEqual(updated.workspacePath as string, path.join(root, 'General-Agent-Benchmark-Deck'));
```

类似修复第203行。

### 步骤 7: 运行 lint 检查验证

执行 `pnpm lint` 验证所有问题已修复。

## 修复策略说明

对于非空断言 (`!`) 的修复，采用以下策略：
1. 在使用非空断言前，先使用 `expect(xxx).toBeDefined()` 或 `expect(xxx).toBeTruthy()` 确保值存在
2. 然后使用类型断言 `as string` 替代非空��言 `!`
3. 对于可选链后的非空断言 (`?.xxx!`)，先检查值存在，再使用 `!.xxx` 或 `as string`

这样可以保持测试逻辑不变，同时满足 Biome 的 lint 规则要求。