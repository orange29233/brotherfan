module.exports = [
  {
    command: 'sethost [domain]',
    alias: 'sh',
    description: '获取 GitHub 最新 DNS，更新 host',
    action: (option) => {
      require('./src/modules/sethost/index.js')(option);
    },
  },
  {
    command: 'generateReport',
    alias: 'gr',
    description: '根据 git log 生成工作报告',
    options: [
      ['-s, --start-date <date>', '开始日期 (YYYY-MM-DD)'],
      ['-e, --end-date <date>', '结束日期 (YYYY-MM-DD)'],
      ['-a, --author <author>', '作者名称'],
    ],
    action: (options) => {
      try {
        require('./src/modules/report/index.js').main(options);
      } catch (err) {
        console.error('执行失败:', err);
        process.exit(1);
      }
    },
  },
];