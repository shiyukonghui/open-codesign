# Tasks

- [x] Task 1: 创建路径分隔符规范化工具函数
  - [x] SubTask 1.1: 在`packages/shared/src`中创建`path-utils.ts`文件
  - [x] SubTask 1.2: 实现`normalizePathSeparators`函数，将路径分隔符统一为`/`
  - [x] SubTask 1.3: 实现`pathsEqual`函数，用于跨平台路径比较
  - [x] SubTask 1.4: 实现`expectPathEqual`测试辅助函数
  - [x] SubTask 1.5: 在`packages/shared/src/index.ts`中导出新的工具函数

- [x] Task 2: 创建路径工具的单元测试
  - [x] SubTask 2.1: 创建`packages/shared/src/path-utils.test.ts`文件
  - [x] SubTask 2.2: 编写`normalizePathSeparators`的测试用例
  - [x] SubTask 2.3: 编写`pathsEqual`的测试用例
  - [x] SubTask 2.4: 编写`expectPathEqual`的测试用例
  - [x] SubTask 2.5: 确保测试在Windows和Linux/macOS模拟环境下通过

- [x] Task 3: 更新scaffold工具使用路径规范化
  - [x] SubTask 3.1: 在`packages/core/src/tools/scaffold.ts`中导入路径规范化工具
  - [x] SubTask 3.2: 更新路径比较逻辑使用`pathsEqual`函数
  - [x] SubTask 3.3: 确保scaffold功能不受影响

- [x] Task 4: 更新scaffold测试用例使用路径规范化
  - [x] SubTask 4.1: 在`packages/core/src/tools/scaffold.test.ts`中导入路径规范化工具
  - [x] SubTask 4.2: 更新路径断言使用`expectPathEqual`或`pathsEqual`
  - [x] SubTask 4.3: 确保测试在所有平台上通过

- [x] Task 5: 更新其他使用路径比较的测试文件
  - [x] SubTask 5.1: 搜索项目中其他使用路径比较的测试文件
  - [x] SubTask 5.2: 更新这些测试文件使用路径规范化工具
  - [x] SubTask 5.3: 确保所有测试通过

- [x] Task 6: 运行完整测试套件验证
  - [x] SubTask 6.1: 运行`pnpm test`确保所有单元测试通过
  - [x] SubTask 6.2: 运行`pnpm typecheck`确保类型检查通过
  - [x] SubTask 6.3: 运行`pnpm lint`确保代码风格一致

# Task Dependencies
- [Task 2] depends on [Task 1]
- [Task 3] depends on [Task 1]
- [Task 4] depends on [Task 1] and [Task 2]
- [Task 5] depends on [Task 1] and [Task 2]
- [Task 6] depends on [Task 1], [Task 2], [Task 3], [Task 4], [Task 5]
