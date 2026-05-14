# 评论面板可拖动功能 Spec

## Why

评论模式的评论列表弹窗（CommentsPanel）当前固定在屏幕右侧，用户无法调整其位置。当用户需要查看被面板遮挡的设计内容时，只能关闭面板或退出评论模式，影响工作效率。通过添加拖动功能，用户可以自由调整面板位置，同时保持评论模式的完整功能。

## What Changes

- 为 `CommentsPanel` 组件添加拖动功能（使用 `react-draggable` 库）
- 在 store 中持久化面板位置状态
- 添加拖动手柄视觉提示
- 确保面板不会拖出可视区域

## Impact

- Affected specs: 评论模式交互
- Affected code:
  - `apps/desktop/src/renderer/src/components/comment/CommentsPanel.tsx`
  - `apps/desktop/src/renderer/src/store/slices/comments.ts`
  - `apps/desktop/src/renderer/src/store.ts` (新增状态字段)
  - `apps/desktop/package.json` (新增依赖)

## ADDED Requirements

### Requirement: 评论面板拖动功能

系统应允许用户通过拖动评论面板的标题栏来移动面板位置。

#### Scenario: 用户拖动评论面板

- **WHEN** 用户在评论模式下，鼠标按下标题栏并移动
- **THEN** 面板跟随鼠标移动，实时更新位置

#### Scenario: 拖动边界限制

- **WHEN** 用户拖动面板接近屏幕边缘
- **THEN** 面板不会超出可视区域边界（保留最小可见区域 50px）

#### Scenario: 位置持久化

- **WHEN** 用户拖动面板到新位置后释放鼠标
- **THEN** 新位置被保存，下次打开面板时恢复到该位置

#### Scenario: 拖动不影响其他功能

- **WHEN** 用户拖动面板
- **THEN** 评论列表滚动、点击评论项、删除评论等功能正常工作

### Requirement: 拖动手柄视觉提示

系统应在评论面板标题栏提供视觉提示，表明面板可拖动。

#### Scenario: 拖动手柄显示

- **WHEN** 评论面板显示时
- **THEN** 标题栏显示拖动手柄图标（GripVertical），光标变为移动样式

#### Scenario: 拖动状态反馈

- **WHEN** 用户开始拖动面板
- **THEN** 光标变为抓取样式，面板可能有轻微的视觉反馈（如阴影加深）

## Implementation Approach

### 方案选择：使用 `react-draggable` 库

选择使用成熟的第三方库 `react-draggable`，原因：
1. 经过广泛验证的成熟库，避免自行实现的边界情况疏漏
2. 提供完整的拖动功能：边界约束、拖动手柄、事件回调等
3. 支持 React 16.3+，项目使用 React 19 完全兼容
4. 提供 TypeScript 类型定义
5. 轻量级，无额外依赖

### 技术实现要点

1. **安装依赖**：
   ```bash
   pnpm add react-draggable
   ```

2. **`react-draggable` 关键 API 使用**：
   - `handle=".drag-handle"` - 指定标题栏为拖动手柄
   - `bounds="body"` 或自定义边界 - 限制拖动范围
   - `position={{ x, y }}` - 受控模式，从 store 读取位置
   - `onStop={(e, data) => setPosition({ x: data.x, y: data.y })}` - 拖动结束时保存位置
   - `defaultPosition` - 首次打开时的默认位置（右侧）

3. **状态管理**：
   - 在 Zustand store 中添加 `commentsPanelPosition: { x: number; y: number } | null`
   - 位置变化时更新 store

4. **边界约束**：
   - 使用 `react-draggable` 的 `bounds` 属性限制拖动范围
   - 可通过 `bounds={{ left, top, right, bottom }}` 自定义边界

5. **无障碍性**：
   - 拖动手柄添加 `aria-label`
   - 保持现有键盘导航功能

### 代码示例

```tsx
import Draggable from 'react-draggable';

function CommentsPanel() {
  const position = useCodesignStore((s) => s.commentsPanelPosition);
  const setPosition = useCodesignStore((s) => s.setCommentsPanelPosition);
  
  const defaultPosition = { x: 0, y: 0 };
  const currentPosition = position ?? defaultPosition;

  return createPortal(
    <Draggable
      handle=".drag-handle"
      bounds="body"
      position={currentPosition}
      onStop={(_, data) => setPosition({ x: data.x, y: data.y })}
    >
      <aside className="fixed top-[80px] right-[16px] z-40 ...">
        <header className="drag-handle cursor-move ...">
          <GripVertical className="w-4 h-4" />
          {/* 标题内容 */}
        </header>
        {/* 列表内容 */}
      </aside>
    </Draggable>,
    document.body,
  );
}
```
