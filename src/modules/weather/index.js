const axios = require("axios");
const chalk = require("chalk");

module.exports = async () => {
  const  res  = await axios({
    method: "get",
    url: `https://apia.aidioute.cn/weather`,
  });
  const { weather, location } = res.data.data
  console.log(chalk.bgBlue(location.city));
  console.log('');
  console.log(chalk.gray(weather.date));
  console.log(chalk.yellow(`24小时下雨概率${weather.rain24h}%`));
  console.log('');
  console.log(chalk.green(`天气情况 ---------------- ${weather.weather}`));
  console.log(chalk.green(`温度 -------------------- ${weather.temp}℃`));
  console.log(chalk.green(`空气质量(pm2.5) --------- ${weather.aqi}`));
  console.log(chalk.green(`湿度 -------------------- ${weather.SD}`));
  console.log(chalk.green(`风向 -------------------- ${weather.WD}`));
  console.log(chalk.green(`风力等级 ---------------- ${weather.WS}`));
};
