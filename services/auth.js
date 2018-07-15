const { UserModel, AuthModel } = require("../repositories/mongoHelper.js");

module.exports = {
    setAuth: function(userId, array) {
        return new Promise((rs, rj) => {
            UserModel.update({ userId }, { authList: array }, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs();
                }
            })
        }).then(res => {
            return;
        });
    },
    getAuthList: function() {
        return new Promise((rs, rj) => {
            AuthModel.find({}, (err, res) => {
                if (err) {
                    rj(err);
                } else {
                    rs(res);
                }
            });
        }).then(data => {
            return data;
        }, err => {
            console.warn(err);
            return [];
        });
    }
}
