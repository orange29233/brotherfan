const inquirer = require('inquirer');
module.exports = async (projectName) => {

    // 定义项目模板选项
    const projectTemplates = [
        { name: 'vite-vue3-starter', gitUrl: 'https://github.com/orange29233/vite-vue3-starter.git' },
        { name: 'Template 2', gitUrl: 'https://github.com/your_username/template2.git' },
    ];

    inquirer
        .prompt([
            {
                type: 'list',
                name: 'selectedTemplate',
                message: '请选择项目模板:',
                choices: projectTemplates.map(template => template.name)
            }
        ])
        .then(answers => {
            const selectedTemplate = projectTemplates.find(template => template.name === answers.selectedTemplate);

            if (selectedTemplate) {
                // 克隆 Git 仓库到项目文件夹
                const exec = require('child_process').exec;
                exec(`git clone ${selectedTemplate.gitUrl} ${projectName}`, (error) => {
                    if (error) {
                        console.error(`执行 git 克隆时出错: ${error}`);
                        return;
                    }
                    console.log(`项目创建成功，位于: ${projectName}`);
                });
            } else {
                console.error('无效的选择，请重新运行脚本。');
            }
        });
}