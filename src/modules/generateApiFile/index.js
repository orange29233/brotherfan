#!/usr/bin/env node
//引入依赖
var fs = require("fs");
var path = require("path");
var axios = require("axios");
var inquirer = require("inquirer");
var chalk = require('chalk')
//启动函数
module.exports = async function run() {
  const url = "http://39.98.132.24:8282/v3/api-docs"; //请求json地址
  const apiPath = path.join("src", "api"); //存放api文件地址
  const choices = []; //存储所有重复性文件

  console.log(chalk.blue(`读取json数据......`));
  const res = await getData(url);
  const { paths, tags } = res.data;
  console.log(chalk.blue(`获取tag分类数据成功......`));

  const answers = await getTags(tags);
  answers.forEach((e) => {
    const urls = tagPaths(paths, e);
    const tpl = tagTemp(urls);
    tagFiles(apiPath, tpl, e, choices);
  });
  repeatConfirm(choices);
};

//获取swagger.json数据
async function getData(url) {
  return await axios({ url: url, method: "get" });
}

//选取需要生成的Tag对象
async function getTags(tags) {
  //选择要生成的Tag对象
  const question = {
    type: "checkbox",
    name: "tags",
    message: chalk.green(`请选择要生成的tag对象`),
    choices: tags,
  };
  let answers = await inquirer.prompt(question);
  return answers.tags;
}

function tagPaths(paths, tag) {
  let tagPaths = [];
  Object.keys(paths).forEach((e) => {
    Object.keys(paths[e]).forEach((j) => {
      if (paths[e][j] && paths[e][j].tags[0] == tag) {
        paths[e][j].url = e.replace(/{/, "${");
        tagPaths.push(paths[e]);
      }
    });
  });
  return tagPaths;
}

function tagTemp(urls) {
  let template = `import axios from 'axios'`;
  urls.forEach((e) => {
    Object.keys(e).forEach((j) => {
      var obj = e[j];
      var body = j == "get" ? "params" : "data";
      var path = [];
      obj.parameters?.forEach((e) => {
        if (e.in == "path") {
          path.push(e.name);
        }
      });
      if (path.length) {
        var url = obj.url.replace(/[${}]/g, "");
        var name = url.substring(url.lastIndexOf("/") + 1);
        var query =
          j == "get" ? `${path.toString()},params` : `${path.toString()},data`;
      } else {
        var name = obj.url.substring(obj.url.lastIndexOf("/") + 1);
        var query = j == "get" ? "params" : "data";
      }

      template += `\n// ${obj.summary} 
export function ${j + titleCase(name)}(${query}) {  
return axios({    
    url:\`${obj.url}\`,    
    method:'${j}',    
    ${body}  
})}\n`;
    });
  });
  return template;
}

//首字母大写
const titleCase = (str) => {
  let tmp = str.toLowerCase();
  tmp = tmp.substring(0, 1).toUpperCase() + tmp.substring(1);
  return tmp;
};

//创建目标目录
function mkdirsSync(dirpath, mode) {
  try {
    if (!fs.existsSync(dirpath)) {
      let pathtmp;
      dirpath.split(/[/\\]/).forEach(function (dirname) {
        //这里指用/ 或\ 都可以分隔目录  如  linux的/usr/local/services   和windows的 d:\temp\aaaa
        if (pathtmp) {
          pathtmp = path.join(pathtmp, dirname);
        } else {
          pathtmp = dirname;
        }
        if (!fs.existsSync(pathtmp)) {
          if (!fs.mkdirSync(pathtmp, mode)) {
            return false;
          }
        }
      });
    }
    return true;
  } catch (e) {
    log.error("create director fail! path=" + dirpath + " errorMsg:" + e);
    return false;
  }
}

//把单个tag tpl模板生成文件
async function tagFiles(apiPath, tpl, fileName, choices) {
  var fPath = path.join(process.cwd(), apiPath); //生成目录
  if (!fs.existsSync(fPath)) {
    mkdirsSync(fPath);
    console.log(chalk.green(`创建api目录成功：${fPath}`));
  }
  // 要生成的文件完整路径
  fPath = path.join(fPath, tf(fileName).replace("Controller", "") + ".js");
  const ex = fs.existsSync(fPath);
  if (ex) {
    choices.push({ name: fPath, value: { tpl: tpl, path: fPath } });
  } else {
    fs.writeFileSync(fPath, tpl);
    console.log(chalk.green(`超棒的代码生成成功^_^：${fPath}`));
  }
}
//-转驼峰
function tf(str) {
  var arr = str.split("-");
  for (var i = 1; i < arr.length; i++) {
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
  }
  return arr.join("");
}

//多个文件
function repeatConfirm(choices) {
  if (choices.length > 0) {
    const question = {
      type: "checkbox",
      name: "cover",
      message: chalk.yellow(`以下文件已存在，请勾选要覆盖的文件`),
      choices: choices,
    };
    inquirer.prompt(question).then((answers) => {
      answers.cover.forEach((e) => {
        fs.writeFileSync(e.path, e.tpl);
        console.log(
          chalk.green(`超棒的代码生成成功^_^：${e.path}`.green, "已覆盖")
        );
      });
    });
  }
}
