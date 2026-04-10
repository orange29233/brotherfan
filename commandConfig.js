module.exports = [
  {
    command: 'sethost [domain]',
    alias: 'sh',
    description: '获取 GitHub 最新 DNS，更新 host',
    action: (option) => {
      require('./src/modules/sethost/index.js')(option);
    },
  },
];
