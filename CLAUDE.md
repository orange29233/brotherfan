# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

brotherfan 是一个前端工具箱 CLI 项目，提供日常开发中常用的工具命令。

**入口命令**: `fan`（通过 npm 安装后的 bin 命令）

## 常用命令

```bash
# 开发调试
node index.js

# 运行 CLI（需全局安装或 link）
fan <command>
```

## CLI 命令架构

项目使用 `commander.js` 实现命令行入口，命令配置集中在 `commandConfig.js`。

**命令定义方式**:
```javascript
// commandConfig.js
module.exports = [
  {
    command: "sethost [domain]",  // commander 语法
    alias: "sh",
    description: "描述",
    action: (option) => { require("./src/modules/xxx/index.js")(option); }
  },
];
```

**内置命令**:
| 命令 | 别名 | 功能 |
|------|------|------|
| `sethost [domain]` | `sh` | 从 GitHub 获取最新 DNS 并更新本地 hosts 文件 |
| `generateReport` | `gr` | 根据 Git log 生成工作报告（支持 -s 开始日期, -e 结束日期, -a 作者筛选） |

## 目录结构

```
src/modules/          # 各命令的独立实现
  ├── sethost/index.js           # GitHub hosts 更新
  └── report/index.js            # Git 工作报告生成
```

## 配置文件

报告生成器使用 `~/.fanrc` 配置文件：
```json
{
  "repos": [
    "/path/to/repo1",
    "/path/to/repo2"
  ],
  "author": "your-name"
}
```

## 关键依赖

- **commander** - CLI 参数解析
- **axios** - HTTP 请求
- **chalk** - 命令行彩色输出
