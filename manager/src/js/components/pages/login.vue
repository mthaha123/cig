<template>
    <div class="bg">
        <el-card v-if='loginview' class="box-card">
            <div slot="header" class="clearfix">
                <span style="line-height: 36px;">CIG仪器管理系统</span>
            </div>
            <div class="text item">
                <el-form ref="form" label-width="80px">
                    <el-form-item label="用户名">
                        <el-input v-model="username" required></el-input>
                    </el-form-item>
                    <el-form-item label="密码">
                        <el-input v-model="password" type="password"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="login">登陆</el-button>
                    </el-form-item>
                    <el-form-item>
                        <a id='forgot' @click="resetPwd">忘记密码</a>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
        <el-card v-if='!loginview' class="box-card">
            <div slot="header" class="clearfix">
                <span style="line-height: 36px;">密码重置（首次登陆）</span>
            </div>
            <div class="text item">
                <el-form ref="form" label-width="80px">
                    <el-form-item label="密码">
                        <el-input v-model="newpassword" required type="password"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码">
                        <el-input v-model="passwordconfirm" type="password"></el-input>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="modifypassword">修改</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-card>
        <el-dialog :title="dialogTitle" size='tiny' v-model="resetView">
            <el-form :model="resetform">
                <el-form-item label="用户名" label-width="80px">
                    <el-input v-model="resetform.userId" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" label-width="80px">
                    <el-input v-model="resetform.email" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="resetView = false">取 消</el-button>
                <el-button type="primary" @click="submitReset">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            username: "",
            password: "",
            loginview: true,
            newpassword: "",
            passwordconfirm: "",
            resetView: false,
            resetform: {}
        }
    },
    methods: {
        login() {
            this.$store.dispatch("login", {
                username: this.username,
                password: this.password
            }).then((isFirstLogin) => {
                if (isFirstLogin) {
                    this.passwordconfirm = "";
                    this.newpassword = "";
                    this.loginview = false;
                } else {
                    this.$router.push("/manager");
                }
            }, err => {
                this.$message.error(err);
            })
        },
        resetPwd() {
            this.resetView = true;
        },
        submitReset() {
            this.$store.dispatch("resetOwnPwd", this.resetform).then(data => {
                this.resetView = false;
                this.resetform = {
                    userId: "",
                    email: ""
                };
                alert("密码已重置，请登录邮箱查收");
            }).catch(err => {
                alert("密码重置失败," + err.toString());
            })
        },
        modifypassword() {
            if (this.newpassword.length < 6) {
                this.$message.error("密码最少6位");
                return;
            }

            if (this.passwordconfirm != this.newpassword) {
                this.$message.error("两次密码不一致");
            } else {
                this.$store.dispatch("resetPassword", {
                    password: this.newpassword
                }).then(() => {
                    this.$router.push("/manager");
                }, err => {
                    this.$message.error(err);
                })
            }
        }
    }
}
</script>
<style lang="sass" scoped>
.bg {
    background: url('../../../images/loginbg.jpg') no-repeat center center; // background:url('http://cn.bing.com/az/hprichbg/rb/MountOTemanu_ZH-CN10516512008_1920x1080.jpg') no-repeat;
    background-size: 1920px 1080px;
    height: 100%;
}

.box-card {
    width: 300px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
}

fieldset {
    padding: 5px 20px;
    margin: 0 2px;
}

#forgot {
    float: right;
}

legend {
    display: block;
    width: 40%;
    margin-bottom: 20px;
    font-size: 15px;
    line-height: inherit;
    color: #333;
    border: 1px;
    border-bottom: 0;
    margin-left: 20px;
}

.label-header {
    padding: 5px;
}

fieldset.question {
    border: 1px solid #d5d5d5;
}

.container-table {
    min-height: 873px;
}

.container-table {
    display: table;
}

.vertical-center-row {
    display: table-cell;
    vertical-align: middle;
}

.labletitle {
    text-align: left;
}

.mg1 {
    margin: 10px 0px;
}
</style>