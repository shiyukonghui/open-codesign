# 修复跨平台路径测试失败计划

## 问题分析

这些测试文件使用了硬编码的 POSIX 路径（如 `/tmp/open-codesign-tests`），在 Windows 上运行时无法通过绝对路径验证。问题主要出现在：

### 问题根源

1. **Mock 返回硬编码 POSIX 路径**
   - `app.getPath` 被模拟返回 `/tmp/open-codesign-tests` 等 POSIX 路径
   - 在 Windows 上，`path.join` 会生成反斜杠路径，导致路径比较失败

2. **路径断言使用硬编码路径**
   - 测试中的 `expect(...).toBe('/tmp/...')` 断言在 Windows 上失败
   - 路径分隔符不匹配（`\` vs `/`）

### 受影响的文件

| 文件 | 问题类型 |
|------|---------|
| `snapshots-ipc.workspace-rename-race.test.ts` | Mock 返回 POSIX 路径，路径断言失败 |
| `snapshots-ipc.workspace-files.test.ts` | Mock 返回 POSIX 路径，路径断言失败 |
| `generate.workspace-rename.test.ts` | Mock 返回 POSIX 路径，路径断言失败 |
| `exporter-ipc.test.ts` | 硬编码 POSIX 路径断言 |

## 解决方案：使用 `path-utils.ts` 工具

### 可用工具函数（来自 `@open-codesign/shared`）

```typescript
// 将路径分隔符统一为 `/`
normalizePathSeparators(path: string): string

// 跨平台路径比较（Windows 忽略大小写）
pathsEqual(path1: string, path2: string, platform?: string): boolean

// 测试断言辅助函数
expectPathEqual(actual: string, expected: string, platform?: string): void
```

## 实施步骤

### Step 1: 修复 `snapshots-ipc.workspace-rename-race.test.ts`

**修改内容**：
1. 导入 `normalizePathSeparators` 和 `expectPathEqual`
2. Mock 中的 `'/tmp/open-codesign-tests'` 改为使用 `os.tmpdir()`
3. 路径断言使用 `expectPathEqual` 或 `normalizePathSeparators`

**具体修改**：
```typescript
// 添加导入
import os from 'node:os';
import { normalizePathSeparators, expectPathEqual } from '@open-codesign/shared';

// 修改 Mock
vi.mock('./electron-runtime', () => ({
  app: {
    getPath: vi.fn(() => path.join(os.tmpdir(), 'open-codesign-tests')),
  },
  // ...
}));

// 修改 documentsRoot
const documentsRoot = path.join(os.tmpdir(), 'open-codesign-tests');

// 修改路径断言
expectPathEqual(updated.workspacePath, path.join(root, 'General-Agent-Benchmark-Deck'));
```

### Step 2: 修复 `snapshots-ipc.workspace-files.test.ts`

**修改内容**：
1. 导入 `normalizePathSeparators`
2. Mock 中的 `'/tmp/open-codesign-tests'` 改为使用 `os.tmpdir()`
3. 路径断言使用 `normalizePathSeparators`

**具体修改**：
```typescript
// 添加导入
import { normalizePathSeparators } from '@open-codesign/shared';

// 修改 Mock
vi.mock('./electron-runtime', () => ({
  app: {
    getPath: vi.fn(() => path.join(os.tmpdir(), 'open-codesign-tests')),
  },
  // ...
}));

// 修改路径断言
expect(normalizePathSeparators(result.workspacePath)).toBe(
  normalizePathSeparators(expected)
);
```

### Step 3: 修复 `generate.workspace-rename.test.ts`

**修改内容**：
1. 导入 `os` 模块和 `normalizePathSeparators`、`expectPathEqual`
2. Mock 中的 `'/tmp/open-codesign-generate-rename-tests'` 改为使用 `os.tmpdir()`
3. 路径断言使用 `expectPathEqual`

**具体修改**：
```typescript
// 添加导入
import os from 'node:os';
import { normalizePathSeparators, expectPathEqual } from '@open-codesign/shared';

// 修改 Mock
vi.mock('../electron-runtime', () => ({
  app: {
    getPath: vi.fn(() => path.join(os.tmpdir(), 'open-codesign-generate-rename-tests')),
  },
  // ...
}));

// 修改 documentsRoot
const documentsRoot = path.join(os.tmpdir(), 'open-codesign-generate-rename-tests');

// 修改路径断言
expectPathEqual(renamed.workspacePath, path.join(defaultWorkspaceRoot, 'Hybrid-Workshop-Day-Agenda'));
```

### Step 4: 修复 `exporter-ipc.test.ts`

**修改内容**：
1. 导入 `normalizePathSeparators`
2. 路径断言使用 `normalizePathSeparators` 规范化后比较

**具体修改**：
```typescript
// 添加导入
import { normalizePathSeparators } from '@open-codesign/shared';

// 修改路径断言
expect(normalizePathSeparators(result.workspacePath)).toBe('/workspace');
expect(normalizePathSeparators(exportAssetOptions(result).assetRootPath)).toBe('/workspace');
```

### Step 5: 运行测试验证

运行 `pnpm test` 确保所有测试在 Windows 上通过。

## 修改对照表

| 文件 | 导入 | Mock 修改 | 断言修改 |
|------|------|----------|---------|
| `snapshots-ipc.workspace-rename-race.test.ts` | `os`, `normalizePathSeparators`, `expectPathEqual` | `os.tmpdir()` | `expectPathEqual` |
| `snapshots-ipc.workspace-files.test.ts` | `normalizePathSeparators` | `os.tmpdir()` | `normalizePathSeparators` |
| `generate.workspace-rename.test.ts` | `os`, `normalizePathSeparators`, `expectPathEqual` | `os.tmpdir()` | `expectPathEqual` |
| `exporter-ipc.test.ts` | `normalizePathSeparators` | 无需修改 | `normalizePathSeparators` |

## 注意事项

1. **保持测试语义不变**：修改仅涉及路径处理，不改变测试逻辑
2. **复用已有工具**：使用 `@open-codesign/shared` 中的 `normalizePathSeparators` 和 `expectPathEqual`
3. **确保向后兼容**：修改后的测试在 Linux/macOS 上仍能通过
