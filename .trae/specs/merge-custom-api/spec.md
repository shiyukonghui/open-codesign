# 合并 custom-api 分支功能 Spec

## Why
custom-api 分支包含两个重要功能：允许编辑内置提供商的 API 地址和协议，以及跨平台路径分隔符规范化。这些功能需要合并到 dev-0513 分支以便进行集成测试和后续开发。

## What Changes
- 合并 custom-api 分支的所有提交到 dev-0513 分支
- 解决可能的合并冲突
- 验证合并后的功能正常工作
- 确保所有测试通过

## Impact
- Affected specs: 提供商设置、跨平台路径处理
- Affected code:
  - `apps/desktop/src/renderer/src/components/AddCustomProviderModal.tsx`
  - `apps/desktop/src/renderer/src/components/settings/ModelsTab.tsx`
  - `packages/shared/src/path-utils.ts` (新建)
  - `packages/shared/src/path-utils.test.ts` (新建)
  - `packages/core/src/tools/scaffold.ts`
  - 多个测试文件

## ADDED Requirements

### Requirement: 合并 custom-api 分支
系统应成功将 custom-api 分支的所有变更合并到 dev-0513 分支。

#### Scenario: 成功合并
- **WHEN** 执行 git merge custom-api
- **THEN** 所有变更成功合并到当前分支
- **AND** 无合并冲突或冲突已解决

### Requirement: 功能验证
合并后应验证以下功能正常工作：

#### Scenario: 内置提供商 API 地址可编辑
- **WHEN** 用户编辑内置提供商（如 Anthropic、OpenAI）
- **THEN** API 地址（baseUrl）和协议（wire）字段可编辑
- **AND** 保存时更新成功

#### Scenario: 路径分隔符规范化
- **WHEN** 在 Windows 平台运行测试
- **THEN** 路径比较使用规范化函数
- **AND** 测试通过

## MODIFIED Requirements

### Requirement: 提供商设置界面
移除 `lockEndpoint` 限制，允许用户编辑所有提供商的 API 地址和协议。

### Requirement: 跨平台路径处理
在 `packages/shared` 中提供统一的路径分隔符规范化工具函数。

## REMOVED Requirements

无移除的需求。
