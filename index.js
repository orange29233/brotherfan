#!/usr/bin/env node

const program = require("commander");
const inquirer = require("inquirer");
const chalk = require("chalk");


program.version("0.0.1");

// 根据swagger文档生成 axios api文件 js
program
  .command("api")
  .alias("a")
  .description("根据swagger文档生成 axios api文件")
  .action((option) => {
    require('./src/modules/generateApiFile/index.js')()
  });

// 获取天气
program
  .command("weather [city]")
  .alias("w")
  .description("查看天气预报")
  .action((option) => {
    require('./src/modules/weather/index.js')(option)
  });

// 创建vue页面 并添加路由
program
  .command("generate <pageName>")
  .alias("g")
  .description("创建vue页面 并添加路由")
  .action((option) => {
    require('./src/modules/addvuepage/index.js')(option)
  });

// 创建node开发服务器
program
  .command("dev [port]")
  .description("运行node服务器")
  .action((option) => {
    require('./src/modules/devsever/index.js')(option)
  });

program.parse(process.argv);
