# 计划：允许自定义模型 API 地址

## 问题分析

当前设置页面中，内置提供商（如 Anthropic、OpenAI 等）的 API 地址（baseUrl）被锁定，无法修改。这是通过以下机制实现的：

1. **ModelsTab.tsx** 第773行：编辑内置提供商时传递 `lockEndpoint: editingRow.builtin`
2. **AddCustomProviderModal.tsx**：
   - 第105行：`const lockEndpoint = editTarget?.lockEndpoint === true`
   - 第314-337行：当 `lockEndpoint` 为 true 时，隐藏 wire 协议选择
   - 第353行：当 `lockEndpoint` 为 true 时，禁用 baseUrl 输入框
   - 第236-241行：保存时跳过 baseUrl 和 wire 的更新

## 修改方案

移除 `lockEndpoint` 限制，允许用户编辑所有提供商的 API 地址。

### 需要修改的文件

#### 1. `apps/desktop/src/renderer/src/components/AddCustomProviderModal.tsx`

- 移除 `lockEndpoint` 相关逻辑
- 始终允许编辑 baseUrl 和 wire 字段
- 保存时始终处理 baseUrl 和 wire 的更新

#### 2. `apps/desktop/src/renderer/src/components/settings/ModelsTab.tsx`

- 编辑时不再传递 `lockEndpoint: editingRow.builtin`

### 详细修改步骤

#### 步骤 1：修改 AddCustomProviderModal.tsx

1. 移除 `lockEndpoint` 变量定义（第105行）
2. 移除 wire 协议选择区域的 `{!lockEndpoint && ...}` 条件包裹（第314-337行）
3. 移除 baseUrl 输入框的 `disabled={lockEndpoint}` 属性（第353行）
4. 移除兼容性提示区域的 `{!lockEndpoint && ...}` 条件包裹（第355-386行）
5. 修改保存逻辑，移除 `{!lockEndpoint && ...}` 条件（第236-241行）
6. 移除 name 输入框的 `disabled={lockEndpoint}` 属性（第344行）

#### 步骤 2：修改 ModelsTab.tsx

1. 移除编辑时传递的 `lockEndpoint: editingRow.builtin`（第773行）

#### 步骤 3：更新类型定义（如需要）

检查 `editTarget` 接口中的 `lockEndpoint` 字段是否可以移除（AddCustomProviderModal.tsx 第37行）

## 验证方法

1. 启动应用：`pnpm dev`
2. 打开设置页面 → 模型设置
3. 点击编辑内置提供商（如 Anthropic）
4. 验证 baseUrl 字段可编辑
5. 修改 baseUrl 并保存
6. 验证修改生效

## 注意事项

- 此修改允许用户将内置提供商指向自定义端点，适用于代理、私有部署等场景
- 用户需要自行确保端点兼容性
- 保留现有的兼容性提示 UI，提醒用户注意端点兼容性
