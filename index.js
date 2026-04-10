#!/usr/bin/env node

const program = require('commander');
const commandConfig = require('./commandConfig.js');
const { main } = require('./src/modules/report/index.js');
const path = require('path');
const fs = require('fs');

// 从 package.json 读取版本号
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
program.version(packageJson.version);

// 注册命令配置中的命令
for (const item of commandConfig) {
  program
    .command(item.command)
    .alias(item.alias)
    .description(item.description)
    .action((option) => {
      item.action(option);
    });
}

// 注册 generateReport 命令
program
  .command('generateReport')
  .alias('gr')
  .description('根据 git log 生成工作报告')
  .option('-s, --start-date <date>', '开始日期 (YYYY-MM-DD)')
  .option('-e, --end-date <date>', '结束日期 (YYYY-MM-DD)')
  .option('-a, --author <author>', '作者名称')
  .action((options) => {
    try {
      main(options);
    } catch (err) {
      console.error('执行失败:', err);
      process.exit(1);
    }
  });

program.parse(process.argv);

// 如果没有参数，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
