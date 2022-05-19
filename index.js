#!/usr/bin/env node

const program = require("commander");
const inquirer = require("inquirer");
const chalk = require("chalk");


program.version("0.0.1");

// 根据swagger文档生成 axios api文件 js
const getApiFiles = require('./src/modules/generateApiFile/index.js')
program
  .command("api")
  .alias("a")
  .description("根据swagger文档生成 axios api文件")
  .action((option) => {
    getApiFiles()
  });

// 获取天气
program
  .command("weather")
  .alias("w")
  .description("查看天气预报")
  .option('-c, --city [cityName]', '城市名称', '武汉')
  .action((option) => {
    require('./src/modules/weather/index.js')(option.city)
  });

// 获取天气
program
  .command("add")
  .description("创建vue页面 并添加路由")
  .option('-n, --name <pageName>', '页面文件名称')
  .action((option) => {
    require('./src/modules/addvuepage/index.js')(option.name)
  });

program.parse(process.argv);
