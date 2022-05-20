const axios = require("axios");
const chalk = require("chalk");
const apiconfig = require('./weatherapi.config')

module.exports = async (city) => {
  city = city ? city : '武汉'
  const res = await axios({
    method: "get",
    url: `https://v0.yiketianqi.com/free/day?unescape=1&appid=${apiconfig.appid}&appsecret=${apiconfig.appsecret}`,
    params: {
      format: "json",
      city: city,
    },
  });
  console.log(chalk.bgBlue(res.data.city));
  console.log(chalk.gray(res.data.update_time));
  console.log(chalk.green(`天气情况 -------------------- ${res.data.wea}`));
  console.log(chalk.green(`白天温度 -------------------- ${res.data.tem_day}℃`));
  console.log(
    chalk.green(`夜间温度 -------------------- ${res.data.tem_night}℃`)
  );
  console.log(chalk.green(`空气质量 -------------------- ${res.data.air}`));
  console.log(chalk.green(`湿度 ------------------------ ${res.data.humidity}`));
  console.log(chalk.green(`风向 ------------------------ ${res.data.win}`));
  console.log(
    chalk.green(`风力等级 -------------------- ${res.data.win_speed}`)
  );
};
