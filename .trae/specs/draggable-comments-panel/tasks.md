# Tasks

- [x] Task 1: 安装 `react-draggable` 依赖
  - [x] SubTask 1.1: 在 `apps/desktop/package.json` 中添加 `react-draggable` 依赖
  - [x] SubTask 1.2: 运行 `pnpm install` 安装依赖

- [x] Task 2: 更新 Zustand store 添加面板位置状态
  - [x] SubTask 2.1: 在 `store.ts` 中添加 `commentsPanelPosition` 状态类型定义
  - [x] SubTask 2.2: 在 `comments.ts` slice 中添加 `setCommentsPanelPosition` action
  - [x] SubTask 2.3: 添加默认位置计算逻辑（首次打开时居右）

- [x] Task 3: 更新 `CommentsPanel` 组件集成 `react-draggable`
  - [x] SubTask 3.1: 引入 `react-draggable` 的 `Draggable` 组件
  - [x] SubTask 3.2: 使用 `handle` prop 指定标题栏为拖动手柄
  - [x] SubTask 3.3: 使用 `bounds` prop 限制拖动边界（保留最小可见区域）
  - [x] SubTask 3.4: 使用 `position` 和 `onStop` 实现位置持久化
  - [x] SubTask 3.5: 在标题栏添加 `GripVertical` 图标作为拖动手柄视觉提示
  - [x] SubTask 3.6: 确保拖动时列表滚动、点击等交互正常工作
  - [x] SubTask 3.7: 处理窗口 resize 时的位置调整（可选优化）

- [x] Task 4: 添加国际化文案
  - [x] SubTask 4.1: 在 `packages/i18n/src/locales/zh-CN.json` 添加拖动相关文案
  - [x] SubTask 4.2: 在 `packages/i18n/src/locales/en.json` 添加对应英文文案

- [x] Task 5: 编写组件测试
  - [x] SubTask 5.1: 更新或创建 `CommentsPanel.test.tsx` 测试拖动功能
  - [x] SubTask 5.2: 测试边界约束场景
  - [x] SubTask 5.3: 测试位置持久化

- [x] Task 6: 运行验证命令
  - [x] SubTask 6.1: 运行 `pnpm typecheck` 确保类型正确
  - [x] SubTask 6.2: 运行 `pnpm lint` 确保代码风格正确
  - [x] SubTask 6.3: 运行 `pnpm test` 确保测试通过

# Task Dependencies

- [Task 2] 可与 [Task 1] 并行
- [Task 3] depends on [Task 1, Task 2] (组件需要依赖和 store 状态)
- [Task 4] 可与 [Task 1-3] 并行
- [Task 5] depends on [Task 3] (测试需要完整实现)
- [Task 6] depends on [Task 3, Task 5] (验证需要代码和测试完成)