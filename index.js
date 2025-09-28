#!/usr/bin/env node

const program = require("commander");
const commandConfig = require("./commandConfig.js");
const { main } = require("./src/modules/report/index.js");
const path = require('path');
program.version("1.3.0");

for (const item of commandConfig) {
  program
    .command(item.command)
    .alias(item.alias)
    .description(item.description)
    .action((option) => {
      item.action(option);
    });
}
program
  .command("generateReport")
  .alias("gr")
  .description("根据gitlog生成工作报告")
  .option("-s, --start-date <date>", "开始日期 (YYYY-MM-DD)")
  .option("-e, --end-date <date>", "结束日期 (YYYY-MM-DD)")
  .option("-a, --author <author>", "作者名称")
  .action((options) => {
    try {
      main(options);
    } catch (err) {
      console.error("执行失败:", err);
    }
  });
program.parse(process.argv);
