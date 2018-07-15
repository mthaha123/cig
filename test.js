const request = require("request");
const fs = require("fs")
request({
 url:"http://172.31.11.30:81/WebSvcBuilderSetup/Hr.asmx/EMPINFO",
 method: "POST",
 form:{
	Badge:"all"
 }
},(err,res)=>{
console.log(err)
	console.log(typeof(res))
	fs.writeFile("data.xml",JSON.stringify(res),{encoding:"utf-8"},(err)=>{
	console.log("complete")
})
})