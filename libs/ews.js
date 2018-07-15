const EWS = require('node-ews');

// exchange server connection info 
let ewsConfig = {
  username: 'calibration',
  password: '1234.com',
  host: 'https://mail.cambridgeig.com',
};

let options = {
  strictSSL: false
};

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// initialize node-ews 
let ews = new EWS(ewsConfig);

// define ews api function 
let ewsFunction = 'CreateItem';

// define ews api function args 
let ewsArgs = {
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
      "Subject": "Test EWS Email",
      "Body": {
        "attributes": {
          "BodyType": "Text"
        },
        "$value": "This is a test email"
      },
      "ToRecipients": {
        "Mailbox": [{
          "EmailAddress": "jjyyshao@163.com"
        }, {
          "EmailAddress": "snakeshao@163.com"
        }, {
          "EmailAddress": "jjyyshao@sina.com"
        }]
      },
      "IsRead": "false"
    }
  }
};

module.exports = function(content) {

}

// query ews, print resulting JSON to console 
ews.run(ewsFunction, ewsArgs)
  .then(result => {
    console.log(JSON.stringify(result));
  })
  .catch(err => {
    console.log(err.stack);
  });