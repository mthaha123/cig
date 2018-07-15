const { ConfigModel } = require("../repositories/mongoHelper");

module.exports.getConfig = key => {
    return new Promise((rs, rj) => {
        ConfigModel.find({ key: key }, function(err, res) {
            if (err) {
                rj(err);
            } else {
                rs(res)
            }
        })
    }).then(function(data) {
        if (data && data.length) {
            return data[0].toObject();
        } else {
            return null;
        }

    }).catch(err => {
        console.log("err get Config:", err.message);
        console.log(err);
        return null;
    });
}

module.exports.saveConfig = (key, value) => {
    return new Promise((rs, rj) => {
        ConfigModel.update({ key }, { value }, (err) => {
            if (err) {
                rj(err);
            } else {
                rs();
            }
        })
    }).catch(err => {
        console.log(`err save config ${key}`, err.message);
        console.log(err);
        return err.message;
    })
}