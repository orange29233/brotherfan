const simpleGit = require("simple-git");
const fs = require("fs");
const path = require("path");

// 获取指定日期范围内的提交日志
async function getGitLog(repositoryPath, fromDate, toDate) {
  const git = simpleGit(repositoryPath);
  try {
    const logOptions = {
      "--pretty": "format:%h - %an, %ar : %s",
      "--after": fromDate,
      "--before": toDate,
    };
    const log = await git.log(logOptions);
    return log.all;
  } catch (error) {
    console.error("获取 Git 日志时出错:", error);
    return [];
  }
}

// 生成报告文件
function generateReport(reportType, logs) {
  const reportFileName = `${reportType}_report_${new Date().toISOString().split("T")[0]}.txt`;
  const reportPath = path.join(process.cwd(), reportFileName);

  let reportContent = `# ${reportType} 提交报告 \n\n`;
  logs.forEach((log, index) => {
    reportContent += `${index + 1}. ${log.message}\n`;
  });

  fs.writeFile(reportPath, reportContent, (err) => {
    if (err) {
      console.error("生成报告文件时出错:", err);
    } else {
      console.log(`报告已生成: ${reportPath}`);
    }
  });
}

// 主函数
 async function main(reportType, repositoryPath) {
  let fromDate, toDate;
  const now = new Date();

  if (reportType === "日报") {
    fromDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    toDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  } else if (reportType === "周报") {
    // 计算本周一
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1)); // 周日为 0，需特殊处理
    fromDate = new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate());

    // 计算本周日
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    toDate = new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate() + 1);
  } else {
    console.error('不支持的报告类型，请输入 "日报" 或 "周报"。');
    return;
  }

  const logs = await getGitLog(
    repositoryPath,
    fromDate.toISOString().split("T")[0],
    toDate.toISOString().split("T")[0]
  );
  generateReport(reportType, logs);
}

// 导出 main 函数
module.exports = { main };
