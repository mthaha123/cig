const userSvc = require("../services/user.js");
const parse = require("co-body");
const authSvc = require("../services/auth.js");
const notify = require("../libs/notify.js");

module.exports = {
    importUser: function*() {
        yield userSvc.import();
        this.body = {
            success: true
        }
    },
    checkoutLogin: function*() {
        if (this.session.userInfo && this.session.userInfo._id) {
            this.body = {
                success: true,
                data: {
                    userId: this.session.userInfo.userId,
                    name: this.session.userInfo.name,
                    id: this.session.userInfo._id
                }
            }
        } else {
            this.body = false;
        }
    },
    login: function*() {
        let { username, password } = yield parse(this);
        let user = yield userSvc.login(username, password);
        if (user) {
            user = user._doc;
            this.session.userInfo = {
                _id: user._id,
                userId: user.userId,
                name: user.name,
                role: user.role,
                authList: user.authList
            }
            if (user.isInit) {
                this.body = {
                    code: 1,
                    message: "请重置密码"
                }
            } else if (user.isLock) {
                this.body = {
                    code: 2,
                    message: "账户已锁定，请联系管理员"
                }
            } else {

                this.body = {
                    code: 0,
                    message: "登录成功"
                }
            }
        } else {
            let errorStatus = this.session.errorStatus || {};
            errorStatus[username] = errorStatus[username] || 0;
            errorStatus[username] += 1;
            this.session.errorStatus = errorStatus;

            if (this.session.errorStatus[username] >= 6) {
                yield userSvc.lockUser(username);
            }
            this.body = {
                code: 2,
                message: "用户不存在或者密码错误"
            }
        }
    },
    resetPassword: function*() {
        let { password } = yield parse(this);

        if (!this.session.userInfo) {
            this.body = {
                success: false,
                message: "请先登陆"
            }
            return;
        }

        if (password.length < 6) {
            this.body = {
                success: false,
                message: "密码至少6位"
            }
            return;
        }

        yield userSvc.resetPassword(this.session.userInfo.userId, password)

        this.body = {
            success: true
        }
    },
    resetUserOwnPassword: function*() {
        let { email, userId } = yield parse(this);
        let user = yield userSvc.validateUserEmail(userId, email);
        if (user) {
            let npwd = userSvc.generateInitPwd();
            yield userSvc.updateUserResetPwd(userId, npwd);
            notify.notifyPwd(npwd, user.Email);
            this.body = {
                success: true
            }
        } else
            this.body = {
                success: false,
                message: "未找到该用户"
            }
    },
    resetUserPassword: function*() {
        let { userId } = yield parse(this);
        // if (!this.session.userInfo) {
        //     this.body = {
        //         success: false,
        //         message: "请先登陆"
        //     }
        // }

        // Administrator 的role 值为0
        if (this.session.userInfo.authList.indexOf("00000")) {
            yield userSvc.resetPassword(userId, "1234", true)
            this.body = {
                success: true
            }
        } else {
            this.body = {
                success: false,
                message: "您没有权限执行此操作"
            }
        }
    },
    setAuth: function*(userId) {
        let { authList } = yield parse(this);
        yield authSvc.setAuth(userId, authList);
        this.body = {
            success: true
        }
    },
    getUserAuthList: function*() {
        this.body = {
            success: true,
            data: this.session.userInfo.authList
        }
    },
    getAuthList: function*() {
        this.body = {
            success: true,
            data: yield authSvc.getAuthList()
        }
    },
    changeUserAuthTo: function*() {
        let { from, to } = yield parse(this);
        if (this.session.userInfo.authList.indexOf("00000")) {
            yield userSvc.changeUserAuthTo(from, to);
        }

        this.body = {
            success: true
        }
    }
}