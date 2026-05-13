# 路径分隔符规范化工具 Spec

## Why
在Windows和Linux/macOS平台上，路径分隔符不同（Windows使用`\`，Linux/macOS使用`/`），导致测试用例在不同平台上运行时可能失败。项目中已经存在一个`workspacePathComparisonKey`函数在renderer中，但packages/shared中没有统一的路径处理工具，导致代码重复和跨平台兼容性问题。

## What Changes
- 在`packages/shared/src`中创建新的`path-utils.ts`文件，提供跨平台路径分隔符规范化工具函数
- 在`packages/shared/src/index.ts`中导出新的工具函数
- 更新`packages/core/src/tools/scaffold.ts`中的路径比较逻辑，使用新的规范化函数
- 更新相关测试用例，使用规范化函数进行路径比较

## Impact
- Affected specs: 路径处理、跨平台兼容性
- Affected code:
  - `packages/shared/src/path-utils.ts` (新建)
  - `packages/shared/src/path-utils.test.ts` (新建)
  - `packages/shared/src/index.ts`
  - `packages/core/src/tools/scaffold.ts`
  - `packages/core/src/tools/scaffold.test.ts`
  - 其他使用路径比较的测试文件

## ADDED Requirements

### Requirement: 路径分隔符规范化
系统应提供路径分隔符规范化工具函数，用于统一处理跨平台路径问题。

#### Scenario: 规范化路径分隔符
- **WHEN** 调用`normalizePathSeparators`函数处理包含`\`或`/`的路径
- **THEN** 返回统一使用`/`作为分隔符的路径

#### Scenario: 路径比较
- **WHEN** 在不同平台上比较路径时使用`pathsEqual`函数
- **THEN** 能够正确识别`C:\Work\Project`和`C:/Work/Project`为相同路径（Windows平台）

#### Scenario: 测试断言辅助
- **WHEN** 在测试中使用`expectPathEqual`断言路径相等
- **THEN** 能够跨平台正确断言路径相等，避免因分隔符不同导致的测试失败

### Requirement: 向后兼容
系统应保持现有代码的向后兼容性。

#### Scenario: 现有功能不受影响
- **WHEN** 引入新的路径规范化工具
- **THEN** 现有的路径处理逻辑不受影响，仅增强跨平台兼容性

## MODIFIED Requirements

### Requirement: 测试用例跨平台兼容
测试用例应能够在Windows和Linux/macOS平台上正确运行。

#### Scenario: 路径断言跨平台一致
- **WHEN** 测试用例中包含路径比较断言
- **THEN** 使用路径规范化工具确保断言在不同平台上行为一致
