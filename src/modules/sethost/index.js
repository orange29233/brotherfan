const fs = require('fs')
const hostile = require('hostile')
const axios = require('axios')

module.exports =async function (option) {
    // console.log('set host '+ option);
    let githubDns = await getGitHost()
    setDns(githubDns)
}


//获取github最新dns信息
async function getGitHost(){
  let res = await axios.get('https://gitlab.com/ineo6/hosts/-/raw/master/next-hosts')
  console.log('get github dns success!');
  return res.data
}

//读取并更新本地host
async function setDns (githubDns){
    const hostPath = 'C:/windows/system32/drivers/etc/hosts'
    fs.readFile(hostPath,(err,data)=>{
        if(err) return err
        let str = data.toString()
        let reg = /^(\# GitHub Host Start|\# GitHub Host End).*$/gms
        str = str.replace(reg,githubDns)
        fs.writeFile(hostPath,str,(err,)=>{
            if (err) return err 
            console.log('host update success!');
        })
    })
}