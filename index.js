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
  .description("根据gitlog生成周报或日报")
  .option("-t, --type <type>", "报告类型（周报或日报）", "周报")
  .option("-p, --path <path>", "仓库路径", process.cwd())
  .action((options) => {
    const reportType = options.type;
    const repositoryPath = path.resolve(options.path);
    console.log(`生成${reportType}，仓库路径：${repositoryPath}`);
    main(reportType, repositoryPath).catch((err) => {
      console.error("执行失败:", err);
    });
  });
program.parse(process.argv);
