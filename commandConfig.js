module.exports = [
    {
        command: "api <url>",
        alias: "a",
        description: "根据swagger文档,在src/api目录下生成axios可用的js文件",
        action: (option) => {
            require('./src/modules/generateApiFile/index.js')(option)
        }
    },
    {
        command: "weather [city]",
        alias: "w",
        description: "查看天气预报",
        action: (option) => {
            require('./src/modules/weather/index.js')(option)
        }
    },
    {
        command: "sethost [domain]",
        alias: "sh",
        description: "获取github 最新DNS，更新host",
        action: (option) => {
            require('./src/modules/sethost/index.js')(option)
        }
    },

]
