const fs = require("fs");
const axios = require("axios");
const log = require("npmlog");

module.exports = async function (option) {
  let githubDns = await getGitHost();
  setDns(githubDns);
};

//获取github最新dns信息
async function getGitHost() {
  let res = await axios.get("https://gitlab.com/ineo6/hosts/-/raw/master/next-hosts");
  log.info("get github dns success!");
  return res.data;
}

//读取并更新本地host
async function setDns(githubDns) {
  const hostPath = "C:/windows/system32/drivers/etc/hosts";
  fs.readFile(hostPath, (err, data) => {
    if (err) return err;
    let str = data.toString();
    let reg = /^(\# GitHub Host Start|\# GitHub Host End).*$/gms;
    str = str.replace(reg, githubDns);
    fs.writeFile(hostPath, str, (err) => {
      if (err) {
        log.error("host update fail!");
        log.error(err);
        return err;
      }
      log.info("host update success!");
    });
  });
}
