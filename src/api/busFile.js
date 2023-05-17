import axios from 'axios'
// 查询附件列表 
export function getList(params) {  
return axios({    
    url:`/business/file/list`,    
    method:'get',    
    params  
})}

// 文件上传 
export function postUploadfile(data) {  
return axios({    
    url:`/business/file/uploadFile`,    
    method:'post',    
    data  
})}

// 删除附件 
export function deleteIds(ids,data) {  
return axios({    
    url:`/business/file/${ids}`,    
    method:'delete',    
    data  
})}

// 获取附件详细信息 
export function getId(id,params) {  
return axios({    
    url:`/business/file/${id}`,    
    method:'get',    
    params  
})}
