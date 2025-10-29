#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * 预设配置
 */
const CONFIG = {
  // Git 仓库列表
  repos: [
    'D:\\projects\\whdc\\dics-app',
    'D:\\projects\\whdc\\dics-frontend',
    'D:\\projects\\whdc\\dics-pad',
    'D:\\projects\\whdc\\smart-ops-frontend',
    'D:\\projects\\dms\\dms-frontend',
    'D:\\projects\\wms\\wms-frontend',
    'D:\\projects\\wms\\wms-pad',
    'D:\\projects\\wflow-pro-next-mobile',
    'D:\\projects\\wflow-pro-web-next',
    'D:\\projects\\workshop\\workshop-frontend',
    'D:\\projects\\sh\\wms-frontend',
    'D:\\projects\\sh\\dms-frontend',
    'D:\\projects\\sh\\system-frontend',
  ],
  // 默认作者
  author: 'wangfan'
};

/**
 * 获取默认时间范围（最近一周）
 * @returns {Object} 包含 startDate 和 endDate 的对象
 */
function getDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 10);

  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

/**
 * 解析命令行参数
 * @param {Object} options 从commander.js传递的参数选项
 * @returns {Object} 解析后的参数对象
 */
function parseArgs(options = {}) {
  const params = {};

  // 从options中提取参数
  if (options.startDate) params.startDate = options.startDate;
  if (options.endDate) params.endDate = options.endDate;
  if (options.author) params.author = options.author;

  return params;
}

/**
 * 初始化任务清单
 * @param {Array} repos 仓库列表
 * @returns {Object} 任务清单对象
 */
function initTaskList(repos) {
  const taskList = {};
  repos.forEach(repo => {
    const repoName = path.basename(repo);
    taskList[repoName] = {
      path: repo,
      status: 'pending', // pending, processing, completed, error
      error: null
    };
  });
  return taskList;
}

/**
 * 检查仓库路径是否存在
 * @param {string} repoPath 仓库路径
 * @returns {boolean} 是否存在
 */
function checkRepoExists(repoPath) {
  return fs.existsSync(repoPath) && fs.existsSync(path.join(repoPath, '.git'));
}

/**
 * 执行 Git 命令获取提交记录
 * @param {string} repoPath 仓库路径
 * @param {string} startDate 开始日期
 * @param {string} endDate 结束日期
 * @param {string} author 作者
 * @returns {string} Git 命令输出
 */
function getGitLogs(repoPath, startDate, endDate, author) {
  const command = `git log --pretty=format:"%cd : %s" --date=short --no-merges --after="${startDate}" --before="${endDate}" --author="${author}" --encoding="utf-8"`;

  try {
    const output = execSync(command, {
      cwd: repoPath,
      encoding: 'utf8',
      maxBuffer: 1024 * 1024 * 10 // 10MB 缓冲区
    });
    return output.trim();
  } catch (error) {
    throw new Error(`Git 命令执行失败: ${error.message}`);
  }
}

/**
 * 解析 Git 输出，按日期聚合提交信息
 * @param {string} output Git 命令输出
 * @param {string} repoName 仓库名称
 * @returns {Object} 按日期聚合的数据
 */
function parseGitOutput(output, repoName) {
  const aggregated = {};

  if (!output) {
    return aggregated;
  }

  const lines = output.split('\n').filter(line => line.trim());

  lines.forEach(line => {
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
 * 更新任务状态
 * @param {Object} taskList 任务清单
 * @param {string} repoName 仓库名称
 * @param {string} status 状态
 * @param {string} error 错误信息
 */
function updateTaskStatus(taskList, repoName, status, error = null) {
  if (taskList[repoName]) {
    taskList[repoName].status = status;
    if (error) {
      taskList[repoName].error = error;
    }
  }
}

/**
 * 生成 Markdown 格式的工作周报
 * @param {Object} aggregatedData 聚合的数据
 * @param {string} startDate 开始日期
 * @param {string} endDate 结束日期
 * @returns {string} Markdown 格式的报告
 */
function generateReport(aggregatedData, startDate, endDate) {
  let report = `# 工作周报 (${startDate} 至 ${endDate})\n\n`;

  // 获取所有日期并排序
  const dates = Object.keys(aggregatedData).sort();

  if (dates.length === 0) {
    report += '本周暂无工作记录。\n';
    return report;
  }

  dates.forEach(date => {
    report += `## ${date}\n\n`;

    const projects = aggregatedData[date];
    const projectNames = Object.keys(projects).sort();

    projectNames.forEach(projectName => {
      report += `- **${projectName}**\n`;
      projects[projectName].forEach(commit => {
        report += `  - ${commit}\n`;
      });
      report += '\n';
    });
  });

  return report;
}

/**
 * 主函数
 * @param {Object} options 命令行选项参数
 */
function main(options = {}) {
  try {
    // 解析命令行参数
    const args = parseArgs(options);
    const { startDate, endDate } = { ...getDefaultDateRange(), ...args };

    console.log(`生成工作报告: ${startDate} 至 ${endDate}`);

    // 初始化任务清单
    const taskList = initTaskList(CONFIG.repos);
    console.log('任务清单已初始化');

    // 创建空的工作报告对象
    let aggregatedData = {};

    // 遍历仓库列表
    CONFIG.repos.forEach(repoPath => {
      const repoName = path.basename(repoPath);
      updateTaskStatus(taskList, repoName, 'processing');

      try {
        // 检查仓库路径是否存在
        if (!checkRepoExists(repoPath)) {
          const error = `仓库路径不存在: ${repoPath}`;
          console.error(error);
          updateTaskStatus(taskList, repoName, 'error', error);
          return;
        }

        // 执行 Git 命令查询提交记录
        const author = args.author || CONFIG.author;
        const gitOutput = getGitLogs(repoPath, startDate, endDate, author);

        // 解析命令输出，按日期聚合提交信息
        const repoData = parseGitOutput(gitOutput, repoName);

        // 将聚合后的记录添加到工作报告中
        Object.keys(repoData).forEach(date => {
          if (!aggregatedData[date]) {
            aggregatedData[date] = {};
          }
          Object.assign(aggregatedData[date], repoData[date]);
        });

        // 更新任务清单，标记该仓库为已完成
        updateTaskStatus(taskList, repoName, 'completed');

      } catch (error) {
        const errorMsg = `处理仓库 ${repoName} 时出错: ${error.message}`;
        console.error(errorMsg);
        updateTaskStatus(taskList, repoName, 'error', errorMsg);
      }
    });

    // 生成最终的工作周报
    console.log('\n生成工作周报...');
    const report = generateReport(aggregatedData, startDate, endDate);

    // 输出报告
    console.log('\n' + '='.repeat(50));
    console.log(report);
    console.log('='.repeat(50));

    // 输出任务清单状态
    console.log('\n任务处理状态:');
    Object.entries(taskList).forEach(([repoName, task]) => {
      console.log(`${repoName}: ${task.status}${task.error ? ` (${task.error})` : ''}`);
    });

  } catch (error) {
    console.error('程序执行出错:', error.message);
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
  initTaskList,
  checkRepoExists,
  getGitLogs,
  parseGitOutput,
  updateTaskStatus,
  generateReport,
  main
};
