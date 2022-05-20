const fs = require('fs');
const path = require('path');
const process = require('process');
var inquirer = require("inquirer");
const chalk = require("chalk");

//入口函数
module.exports = async (fileName) => {
    const tems = fs.readdirSync(path.join(__dirname, './templates')).map(v => {
        return {
            value: v,
            name: `模板:${v}`
        }
    });
    const templateFileName = await selectTemplate(tems)
    generateTemplate(templateFileName, fileName);
}

//选择模板
const selectTemplate = async (tems) => {
    const question = {
        type: "rawlist",
        name: "tems",
        message: chalk.green(`请选择模板`),
        choices: tems,
    }
    let answers = await inquirer.prompt(question);
    return answers.tems;
}

//生成模板
const generateTemplate = async (templateFileName, fileName) => {
    const srcPath = path.join(process.cwd(), '/src/views');
    if (!fs.existsSync(srcPath)) {
        mkdirsSync(srcPath);
        console.log(chalk.green(`创建目录成功：${srcPath}`));
    }
    const template = fs.readFileSync(path.join(__dirname, `./templates/${templateFileName}`), 'utf-8');
    const filePath = path.join(srcPath, `${fileName}.vue`);
    fs.writeFileSync(filePath, template, 'utf-8', (err) => {
        if (err) {
            console.log(chalk.red(`生成文件失败：${filePath}`));
            return
        }
    });
    console.log(chalk.green(`生成文件成功：${filePath}`));
}


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