#!/usr/bin/env node

const program = require("commander");
const commandConfig = require("./commandConfig.js");

program.version("1.3.0");

for (const item of commandConfig) {
  program
    .command(item.command)
    .alias(item.alias)
    .description(item.description)
    .action(option=>{
      item.action(option)
    });
}
program.parse(process.argv);








