#!/usr/bin/env node

const program = require("commander");
const inquirer = require("inquirer");
const chalk = require("chalk");
const axios = require("axios");


program.version("0.0.1");

// 根据swagger文档生成 axios api文件 js
program
  .command("api <url>")
  .alias("a")
  .description("根据swagger文档,在src/api目录下生成axios可用的js文件")
  .action((option) => {
    require('./src/modules/generateApiFile/index.js')(option)
  });

// 获取天气
program
  .command("weather [city]")
  .alias("w")
  .description("查看天气预报")
  .action((option) => {
    require('./src/modules/weather/index.js')(option)
  });
// 批量重名文件
program
  .command("rename [b] [string]")
  .alias("rn")
  .description("批量重名当前目录文件")
  .action((option) => {
    require('./src/modules/rename/index.js')(option)
  });

// 创建vue页面 并添加路由
program
  .command("generate <pageName>")
  .alias("g")
  .description("在当前目录的src/view目录下创建vue开始页面 并添加路由")
  .action((option) => {
    require('./src/modules/addvuepage/index.js')(option)
  });

// 创建node开发服务器
program
  .command("dev [port]")
  .description("在当前目录,运行node express静态文件web服务器")
  .action((option) => {
    require('./src/modules/devsever/index.js')(option)
  });


// 更新host
program
  .command("sethost [domain]")
  .alias('sh')
  .description("获取github 最新DNS，更新host")
  .action((option) => {
    require('./src/modules/sethost/index.js')(option)
  });

// 获取当前IP
program
  .command("ip")
  .description("获取本机IP")
  .action(async (option) => {
    const externalIP = await axios.get('https://api.ipify.org?format=json');
    console.log(`externalIP:${externalIP.data.ip}`);
    const interfaces = require('os').networkInterfaces(); //服务器本机地址
    let IPAdress = '';
    for (var devName in interfaces) {
      var iface = interfaces[devName];
      for (var i = 0; i < iface.length; i++) {
        var alias = iface[i];
        if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
          IPAdress = alias.address;
          console.log(`${devName}: ${IPAdress}`);
        }
      }
    }

  });

  program
  .command("ports [action] [port]")
  .description("Retrieve information about currently occupied ports")
  .option("-l, --list", "List all open ports")
  .option("-u, --used", "List all used ports")
  .option("-c, --close", "Close a specified port")
  .action((action, port, options) => {
    const net = require('net');
    if (options.list) {
      console.log("List of open ports:");
      const server = net.createServer();
      server.listen(0, () => {
        const port = server.address().port;
        server.close(() => {
          console.log(port);
        });
      });
    } else if (options.used) {
      console.log("List of used ports:");
      const server = net.createServer();
      server.listen(0, () => {
        const port = server.address().port;
        server.close(() => {
          console.log(port - 1);
        });
      });
    } else if (options.close) {
      const server = net.createServer();
      server.listen(port, () => {
        server.close(() => {
          console.log(`Port ${port} has been closed`);
        });
      });
    } else {
      const server = net.createServer();
      server.listen(0, () => {
        const port = server.address().port;
        server.close(() => {
          console.log(`Port ${port} is available`);
        });
      });
    }
  });





program.parse(process.argv);
