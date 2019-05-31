const nodemailer = require('nodemailer');
let { getTpls } = require("./mail_templates.js");
const co = require("co");
const fse = require("fs-extra");
const path = require("path");
const moment = require("moment");
const fs = require("fs");

// 开启一个 SMTP 连接池
let transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    secureConnection: true, // use SSL
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: '1181732384@qq.com',
        pass: 'iinjbrtwdwtrgihj' // QQ邮箱需要使用授权码
    }
});

// 设置邮件内容（谁发送什么给谁）
let mailOptions = {
    "from": '1181732384@qq.com', // 发件人
    "to": [], // 收件人
    "cc":[],
    "subject": "", // 主题
    "html": '<b>这是一封来自 Node.js 的测试邮件</b>', // html body
};

// 使用先前创建的传输器的 sendMail 方法传递消息对象
// transporter.sendMail(mailOptions, (error, info) => {
//     if (error) {
//         return console.log(error);
//     }
//     console.log(`Message: ${info.messageId}`);
//     console.log(`sent: ${info.response}`);
// });
function* send(args) {
    return transporter.sendMail(args)
        .then(result => {
            console.log(JSON.stringify(result));
        })
        .catch(err => {
            console.log(err.stack);
        });
}


let tpls;
getTpls().then(res => {
    tpls = res;
})


module.exports.sendMail = function (type, userList, deviceList, params,ccRecipients) {
    return co(function* () {
        let template = tpls[type].content;
        if(params){
            for (var key in params) {
                template = template.replace("{" + key + "}", params[key]);
            }

        }
        template = template.replace("<tr><td>{{__devList}}</td></tr>", deviceList.join(" "));

        let args = JSON.parse(JSON.stringify(mailOptions));
        if (userList && userList.length) {
            args["to"] = userList;

            args["subject"] = tpls[type].title;

            args["html"] = template;
        }
        if(ccRecipients &&ccRecipients.length){
            args["cc"] = ccRecipients;
        }

        console.log("===========sendEmial===========");
        console.log("sendUser:", JSON.stringify(userList));
        console.log("content:", template);
        console.log("title:", tpls[type].title);

        let filePath = path.resolve(__dirname, `../../emaillog/${moment().format("YYYY-MM-DD")}.txt`);
        yield fse.ensureFile(filePath)

        fs.writeFileSync
        fse.outputFileSync(filePath, `\n===========sendEmial ${moment().format("YYYY-MM-DD HH:mm:ss")}===========`, { flag: "a" })
        fse.outputFileSync(filePath, `\nsendUser:${JSON.stringify(userList)}`, { flag: "a" })
        fse.outputFileSync(filePath, `\ncontent:${template}`, { flag: "a" })
        fse.outputFileSync(filePath, `\ntitle:${tpls[type].title}`, { flag: "a" })

        // return "";
        yield send(args);
        return;
    })
}