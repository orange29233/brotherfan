#!/usr/bin/env node

const program = require('commander');
const commandConfig = require('./commandConfig.js');
const path = require('path');
const fs = require('fs');

// 从 package.json 读取版本号
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
program.version(packageJson.version);

// 注册命令配置中的命令
for (const item of commandConfig) {
  const cmd = program
    .command(item.command)
    .alias(item.alias)
    .description(item.description);

  // 注册选项（如果定义）
  if (item.options) {
    item.options.forEach(([flags, description]) => {
      cmd.option(flags, description);
    });
  }

  // commander 会根据命令定义传入不同的参数：
  // - 有位置参数时: (arg1, ..., options, command)
  // - 仅有选项时: (options, command)
  // 透传所有参数，让 action 自己决定如何取值
  cmd.action((...args) => {
    item.action(...args);
  });
}

program.parse(process.argv);

// 如果没有参数，显示帮助信息
if (!process.argv.slice(2).length) {
  program.outputHelp();
}