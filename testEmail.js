var EWS = require('node-ews');

// exchange server connection info 
var ewsConfig = {
    username: 'myuser@domain.com',
    password: 'mypassword',
    host: 'https://mail.cambridgeig.com'
};

// initialize node-ews 
var ews = new EWS(ewsConfig);

// define ews api function 
var ewsFunction = 'CreateItem';

// define ews api function args 
var ewsArgs = {
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
                "Mailbox": {
                    "EmailAddress": "someone@gmail.com"
                }
            },
            "IsRead": "false"
        }
    }
};

// query ews, print resulting JSON to console 
ews.run(ewsFunction, ewsArgs)
    .then(result => {
        console.log(JSON.stringify(result));
    })
    .catch(err => {
        console.log(err.stack);
    });