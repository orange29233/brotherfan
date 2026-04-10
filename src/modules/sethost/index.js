const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const axios = require('axios');
const chalk = require('chalk');

/**
 * 获取 hosts 文件路径（跨平台）
 */
function getHostsPath() {
  if (os.platform() === 'win32') {
    return 'C:/windows/system32/drivers/etc/hosts';
  }
  return '/etc/hosts';
}

/**
 * 获取 GitHub 最新 DNS 信息
 */
async function getGitHubDNS() {
  try {
    const res = await axios.get('https://gitlab.com/ineo6/hosts/-/raw/master/next-hosts');
    console.log(chalk.green('✓ 获取 GitHub DNS 成功'));
    return res.data;
  } catch (error) {
    throw new Error(`获取 GitHub DNS 失败: ${error.message}`);
  }
}

/**
 * 读取并更新本地 hosts 文件
 */
async function updateHostsFile(githubDns) {
  const hostPath = getHostsPath();

  try {
    // 读取 hosts 文件
    const data = await fs.readFile(hostPath, 'utf-8');

    // 替换 GitHub hosts 区域
    const regex = /^(\# 地址可能会变动|\# GitHub Host End).*$/gms;
    const newContent = data.replace(regex, githubDns);

    // 写回文件
    await fs.writeFile(hostPath, newContent, 'utf-8');
    console.log(chalk.green('✓ hosts 文件更新成功'));
    console.log(chalk.gray(`  文件路径: ${hostPath}`));
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`权限不足，请以管理员/root 权限运行此命令`);
    }
    throw new Error(`更新 hosts 文件失败: ${error.message}`);
  }
}

/**
 * 主函数
 */
module.exports = async function (option) {
  try {
    const githubDns = await getGitHubDNS();
    await updateHostsFile(githubDns);
  } catch (error) {
    console.error(chalk.red(`✗ ${error.message}`));
    process.exit(1);
  }
};
