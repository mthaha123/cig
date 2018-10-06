const EWS = require('node-ews');
let { getTpls } = require("./mail_templates.js");
const co = require("co");
const fse = require("fs-extra");
const path = require("path");
const moment = require("moment");
const fs = require("fs");

// exchange server connection info
let ewsConfig = {
    username: 'calibration',
    password: '1234.com',
    host: 'https://mail.cambridgeig.com',
};

let tpls;
getTpls().then(res => {
    tpls = res;
})

let options = {
    strictSSL: false
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// initialize node-ews
let ews = new EWS(ewsConfig);

// define ews api function
let ewsFunction = 'CreateItem';

let ewsArgsTemplate = {
    "attributes": {
        "MessageDisposition": "SendAndSaveCopy"
    },
    "SavedItemFolderId": {
        "DistinguishedFolderId": {
            "attributes": {
                "Id": "sentitems"
            }
        }
    },
    "Items": {
        "Message": {
            "ItemClass": "IPM.Note",
            "Subject": "",
            "Body": {
                "attributes": {
                    "BodyType": "HTML"
                },
                "$value": ""
            },
            "ToRecipients": {
                "Mailbox": []
            },
            "CcRecipients":{
                "Mailbox":[]
            },
            "IsRead": "false"
        }
    }
};


function send(ewsArgs) {
    return ews.run(ewsFunction, ewsArgs)
        .then(result => {
            console.log(JSON.stringify(result));
        })
        .catch(err => {
            console.log(err.stack);
        });
}



module.exports.sendMail = function (type, userList, deviceList, params,ccRecipients) {
    return co(function* () {
        let template = tpls[type].content;
        if(params){
            for (var key in params) {
                template = template.replace("{" + key + "}", params[key]);
            }

        }
        template = template.replace("{{__devList}}", deviceList.join(" "));

        let args = JSON.parse(JSON.stringify(ewsArgsTemplate));
        if (userList && userList.length) {
            args["Items"]["Message"]["ToRecipients"]["Mailbox"] = userList.map(cur => {
                return {
                    "EmailAddress": cur
                }
            })

            args["Items"]["Message"]["Subject"] = tpls[type].title;

            args["Items"]["Message"]["Body"]["$value"] = template;
        }
        if(ccRecipients &&ccRecipients.length){
            args["Items"]["Message"]["CcRecipients"]["Mailbox"] = ccRecipients.map(cur =>{
                return {
                    "EmailAddress":cur
                }
            })
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
        return send(args);
    })
}