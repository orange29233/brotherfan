const fs = require('fs');
const path = require('path');
const process = require('process');
// // 获取命令行参数
// const type = process.argv[2];
// const appendString = process.argv[3];
module.exports = (type,appendString) => {
 
// 获取当前目录下的文件列表
const files = fs.readdirSync(process.cwd());
console.log(type);
console.log(files);

// // 遍历文件列表
// files.forEach(file => {
//   const extname = path.extname(file);
//   const basename = path.basename(file, extname);
//   let newFilename;

//   // 根据类型拼接新文件名
//   if (type === 'b') {
//     newFilename = appendString + basename + extname;
//   } else if (type === 'a') {
//     newFilename = basename + appendString + extname;
//   } else {
//     console.log('无效的类型参数');
//     return;
//   }

//   // 重命名文件
//   fs.renameSync(file, newFilename);
//   console.log(`已将文件 ${file} 重命名为 ${newFilename}`);
// });

}