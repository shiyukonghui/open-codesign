# Checklist

- [x] `react-draggable` 依赖已安装并添加到 `apps/desktop/package.json`
- [x] Zustand store 中正确添加 `commentsPanelPosition` 状态和 `setCommentsPanelPosition` action
- [x] `CommentsPanel` 组件正确集成 `react-draggable`，使用 `handle` 指定拖动手柄
- [x] 拖动边界正确限制（使用 `bounds` prop），面板不会拖出可视区域
- [x] 拖动位置正确持久化（使用 `position` 和 `onStop`）
- [x] 拖动手柄有清晰的视觉提示（GripVertical 图标和 cursor: move 样式）
- [x] 拖动过程中评论列表滚动、点击等交互正常工作
- [x] 面板位置在关闭后重新打开时正确恢复
- [x] 国际化文案已添加（中英文）
- [x] 组件测试覆盖拖动功能、边界约束、位置持久化场景
- [x] `pnpm typecheck` 通过
- [x] `pnpm lint` 通过
- [x] `pnpm test` 通过（新增测试全部通过，预先存在的测试失败与本次改动无关）