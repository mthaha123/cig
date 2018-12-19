var soap=require('soap');
var url = "https://e-hr.ci-g.com/services/hr?wsdl"
var fs = require('fs');
soap.createClient(url,function(err,client){
    if(err){
        console.log(err);
    }
    //返回一个客户端，并且传参调用Java的接口，接收返回的数据
    client.EmpInfo({Badge:'all'},function(error,result){
       //打印接收到的数据
       fs.writeFile("soap.xml",result.return,function(err){
           if(err){
               console.log(err);
           }else{
               console.log('ok');
           }
       })
    });
 })