#!/usr/bin/env node

const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * 配置文件路径
 */
const CONFIG_FILE = path.join(os.homedir(), ".fanrc");

/**
 * 默认配置（repos 为空，首次运行时会自动创建示例配置）
 */
const DEFAULT_CONFIG = {
  repos: [],
  author: "",
};

/**
 * 读取配置文件
 */
function readConfig() {
  const fileExists = fs.existsSync(CONFIG_FILE);

  if (fileExists) {
    try {
      const content = fs.readFileSync(CONFIG_FILE, "utf-8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(content) };
    } catch (error) {
      // 文件存在但解析失败：只警告，不覆盖用户配置
      console.warn(`配置文件解析失败，使用默认配置: ${error.message}`);
      return DEFAULT_CONFIG;
    }
  }

  // 没有配置文件：自动创建示例，避免硬编码本机路径
  console.log("未找到配置文件，创建示例配置...");
  createExampleConfig();
  return DEFAULT_CONFIG;
}

/**
 * 创建示例配置文件
 */
function createExampleConfig() {
  const exampleConfig = {
    repos: ["D:/projects/your-project-1", "D:/projects/your-project-2"],
    author: "your-name",
  };

  try {
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify(exampleConfig, null, 2),
      "utf-8",
    );
    console.log(`配置文件已创建: ${CONFIG_FILE}`);
    console.log("请编辑配置文件后重新运行命令");
  } catch (error) {
    console.warn(`创建配置文件失败: ${error.message}`);
  }
}

/**
 * 获取默认时间范围（最近 10 天）
 */
function getDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 10);

  return {
    startDate: startDate.toISOString().split("T")[0],
    endDate: endDate.toISOString().split("T")[0],
  };
}

/**
 * 计算两个日期之间的天数（含起止两天）
 */
function daysBetween(start, end) {
  const diffDays = Math.round(
    (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24)
  );
  return diffDays + 1;
}

/**
 * 解析命令行参数
 */
function parseArgs(options = {}) {
  const params = {};

  if (options.startDate) params.startDate = options.startDate;
  if (options.endDate) params.endDate = options.endDate;
  if (options.author) params.author = options.author;

  return params;
}

/**
 * 检查仓库路径是否存在
 */
function checkRepoExists(repoPath) {
  return fs.existsSync(repoPath) && fs.existsSync(path.join(repoPath, ".git"));
}

/**
 * 执行 Git 命令获取提交记录
 * 使用 execFileSync 而非 execSync，避免 shell 解析用户输入造成命令注入
 */
function getGitLogs(repoPath, startDate, endDate, author) {
  try {
    const output = execFileSync(
      "git",
      [
        "log",
        "--pretty=format:%cd : %s",
        "--date=short",
        "--no-merges",
        `--after=${startDate}`,
        `--before=${endDate}`,
        `--author=${author}`,
        "--encoding=utf-8",
      ],
      {
        cwd: repoPath,
        encoding: "utf-8",
        maxBuffer: 1024 * 1024 * 10, // 10MB 缓冲区
      }
    );
    return output.trim();
  } catch (error) {
    throw new Error(`Git 命令执行失败: ${error.message}`);
  }
}

/**
 * 解析 Git 输出，按日期聚合提交信息
 */
function parseGitOutput(output, repoName) {
  const aggregated = {};

  if (!output) {
    return aggregated;
  }

  const lines = output.split("\n").filter((line) => line.trim());

  lines.forEach((line) => {
    // 格式: "2024-09-01 : feat: 添加用户登录功能"
    const match = line.match(/^(\d{4}-\d{2}-\d{2})\s*:\s*(.+)$/);
    if (match) {
      const [, date, message] = match;
      if (!aggregated[date]) {
        aggregated[date] = {};
      }
      if (!aggregated[date][repoName]) {
        aggregated[date][repoName] = [];
      }
      aggregated[date][repoName].push(message.trim());
    }
  });

  return aggregated;
}

/**
 * 根据日期跨度决定报告标题
 */
function reportTitle(startDate, endDate) {
  const days = daysBetween(startDate, endDate);
  if (days <= 1) return "工作日报";
  if (days <= 7) return "工作周报";
  return "工作报告";
}

/**
 * 生成 Markdown 格式的工作报告
 */
function generateReport(aggregatedData, startDate, endDate) {
  const title = reportTitle(startDate, endDate);
  let report = `# ${title} (${startDate} 至 ${endDate})\n\n`;

  // 获取所有日期并排序
  const dates = Object.keys(aggregatedData).sort();

  if (dates.length === 0) {
    report += "暂无工作记录。\n";
    return report;
  }

  dates.forEach((date) => {
    report += `## ${date}\n\n`;

    const projects = aggregatedData[date];
    const projectNames = Object.keys(projects).sort();

    projectNames.forEach((projectName) => {
      report += `- **${projectName}**\n`;
      projects[projectName].forEach((commit) => {
        report += `  - ${commit}\n`;
      });
      report += "\n";
    });
  });

  return report;
}

/**
 * 主函数
 */
function main(options = {}) {
  try {
    // 读取配置
    const CONFIG = readConfig();

    if (CONFIG.repos.length === 0) {
      console.log("请先配置 Git 仓库列表");
      console.log(`配置文件: ${CONFIG_FILE}`);
      process.exit(0);
    }

    // 解析命令行参数
    const args = parseArgs(options);
    const { startDate, endDate } = { ...getDefaultDateRange(), ...args };
    const author = args.author || CONFIG.author;

    if (!author) {
      console.error("错误: 请在配置文件中设置作者或通过 --author 参数指定");
      process.exit(1);
    }

    console.log(`生成工作报告: ${startDate} 至 ${endDate}`);
    console.log(`作者: ${author}`);
    console.log(`仓库数量: ${CONFIG.repos.length}`);

    // 创建空的聚合报告对象
    const aggregatedData = {};

    // 遍历仓库列表，收集结果（用于末尾状态汇总）
    const results = [];
    CONFIG.repos.forEach((repoPath) => {
      const repoName = path.basename(repoPath);

      // 检查仓库路径是否存在
      if (!checkRepoExists(repoPath)) {
        const error = `仓库路径不存在: ${repoPath}`;
        console.error(`✗ ${error}`);
        results.push({ repoName, ok: false, error });
        return;
      }

      try {
        // 执行 Git 命令查询提交记录
        const gitOutput = getGitLogs(repoPath, startDate, endDate, author);
        const repoData = parseGitOutput(gitOutput, repoName);

        // 将聚合后的记录合并到工作报告中
        Object.entries(repoData).forEach(([date, projects]) => {
          aggregatedData[date] = { ...aggregatedData[date], ...projects };
        });

        console.log(`✓ ${repoName}: 已完成`);
        results.push({ repoName, ok: true });
      } catch (error) {
        const errorMsg = `处理仓库 ${repoName} 时出错: ${error.message}`;
        console.error(`✗ ${errorMsg}`);
        results.push({ repoName, ok: false, error: errorMsg });
      }
    });

    // 生成最终的工作报告
    console.log("\n生成工作报告...");
    const report = generateReport(aggregatedData, startDate, endDate);

    // 输出报告
    console.log("\n" + "=".repeat(50));
    console.log(report);
    console.log("=".repeat(50));

    // 输出任务处理状态
    console.log("\n任务处理状态:");
    results.forEach(({ repoName, ok, error }) => {
      console.log(`  ${ok ? "✓" : "✗"} ${repoName}${error ? ` (${error})` : ""}`);
    });
  } catch (error) {
    console.error("程序执行出错:", error.message);
    process.exit(1);
  }
}

// 如果直接运行此脚本，则执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  getDefaultDateRange,
  parseArgs,
  daysBetween,
  checkRepoExists,
  getGitLogs,
  parseGitOutput,
  reportTitle,
  generateReport,
  main,
};