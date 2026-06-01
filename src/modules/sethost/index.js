/**
 * name:一键更新本地 hosts 文件，访问 GitHub更快。
 * auth:wangfan
 * email:orange29233@126.com
 * 
 * ## 功能
  - 自动从网络获取 GitHub 最新 DNS 解析
  - 支持 Windows / Linux / macOS
  - 更新后自动刷新 DNS 缓存
  - 首次使用自动添加标记，后续运行智能替换

  ## 使用方法
  node sethost.js 需要管理员/root 权限。

  ## 原理
  1. 从 `https://gitlab.com/ineo6/hosts` 获取 GitHub hosts 数据
  2. 匹配本地 hosts 文件中的 `# GitHub Host Start` 和 `# GitHub Host End` 标记
  3. 替换标记之间的内容（或首次运行时自动追加）
  4. 刷新系统 DNS 缓存使更改生效

  ## 致谢
  感谢 [ineo6/hosts](https://github.com/ineo6/hosts) 仓库提供的 hosts 数据。
*/


const fs = require("fs").promises;
const os = require("os");
const https = require("https");
const { execSync } = require("child_process");

/**
 * 获取 hosts 文件路径（跨平台）
 */
function getHostsPath() {
  if (os.platform() === "win32") {
    return "C:/windows/system32/drivers/etc/hosts";
  }
  return "/etc/hosts";
}

/**
 * 彩色输出（兼容 Windows 和 Unix）
 */
const color = process.stdout.isTTY ? {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  gray: (text) => `\x1b[90m${text}\x1b[0m`,
} : {
  green: (text) => text,
  red: (text) => text,
  gray: (text) => text,
};

/**
 * 获取 GitHub 最新 DNS 信息
 */
async function getGitHubDNS() {
  return new Promise((resolve, reject) => {
    https
      .get("https://gitlab.com/ineo6/hosts/-/raw/master/next-hosts", (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          console.log(color.green("✓ 获取 GitHub DNS 成功"));
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(new Error(`获取 GitHub DNS 失败: ${err.message}`));
      });
  });
}

// GitHub hosts 区域的标记
const START_MARKER = "# GitHub Host Start by sethost";
const END_MARKER = "# GitHub Host End by sethost";

/**
 * 读取并更新本地 hosts 文件
 */
async function updateHostsFile(githubDns) {
  const hostPath = getHostsPath();

  try {
    const data = await fs.readFile(hostPath, "utf-8");
    let newContent;

    // 检查是否有现有标记
    const regex = new RegExp(`${START_MARKER}[\\s\\S]*?${END_MARKER}`, "g");
    const matched = data.match(regex);

    if (matched) {
      // 有标记：替换现有区块
      newContent = data.replace(regex, `${START_MARKER}\n${githubDns.trim()}\n${END_MARKER}`);
    } else {
      // 无标记：追加新内容（首次使用场景）
      newContent = data.trim() + "\n\n" + START_MARKER + "\n" + githubDns.trim() + "\n" + END_MARKER + "\n";
    }

    await fs.writeFile(hostPath, newContent, "utf-8");
    console.log(color.green("✓ hosts 文件更新成功"));
    console.log(color.gray(`  文件路径: ${hostPath}`));

    // 刷新 DNS 缓存
    try {
      execSync(os.platform() === "win32" ? "ipconfig /flushdns" : "systemd-resolve --flush-caches", {
        stdio: "ignore",
      });
      console.log(color.green("✓ DNS 缓存已刷新"));
    } catch (e) {
      // 忽略刷新失败
    }
  } catch (error) {
    if (error.code === "EACCES") {
      throw new Error(`权限不足，请以管理员/root 权限运行此命令`);
    }
    throw new Error(`更新 hosts 文件失败: ${error.message}`);
  }
}

module.exports = async function(option) {
  try {
    const githubDns = await getGitHubDNS();
    await updateHostsFile(githubDns);
  } catch (error) {
    console.error(color.red(`✗ ${error.message}`));
    process.exit(1);
  }
};
