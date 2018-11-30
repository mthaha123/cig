<template>
    <div class='contentbox'>
        <el-row type='flex' style='margin-bottom:20px;' justify='space-between'>
            <el-col :span='6'>
                <div class="grid-content">
                    <el-input placeholder="搜索用户名..." v-model="serachContent" style="width: 300px;">
                        <el-button slot="append" @click='search' icon="search"></el-button>
                    </el-input>
                </div>
            </el-col>
            <el-col :span='4'>
                <div class="grid-content">
                    <el-select v-model="inValidStatus" @change='getList(1)' placeholder="导入状态">
                        <el-option label="全部" value="">
                        </el-option>
                        <el-option label="无效员工" value="invalid">
                        </el-option>
                    </el-select>
                </div>
            </el-col>
            <el-col :span='4'>
                <div class="grid-content bg-purple">
                    <el-button style='float:right;' v-if='dictEdit' @click='create' type="success">新建</el-button>
                    <el-button style='float:right;' :disabled='updating' v-if='dictEdit' @click='update' type="success">更新</el-button>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span='24'>
                <el-table :data="dataList" v-loading.body="$store.state.userInfo.tableLoading" border style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column prop="userId" label="工号" width="200">
                    </el-table-column>
                    <el-table-column prop="name" label="姓名" width="200">
                    </el-table-column>
                    <el-table-column prop="Email" label="Email" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column prop="isValid" label="是否有效" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column inline-template v-if='dictEdit' :context="_self" label="操作" width="340">
                        <span>
                        <el-button @click="edit(row)" type="success" size="small">编辑</el-button>
                        <el-button @click="resetPassword(row)" type="danger" size="small">重置密码</el-button>
                        <el-button v-if='removeEdit' type="danger" @click='delrow(row)' size="small">删除</el-button>
                        <el-button type="danger" @click='changeUserAuth(row)' size="small">权限交接</el-button>
                      </span>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-row>
            <div class='flexbox'>
                <div class='tobox'>
                    <span>转到</span>
                    <input type="text" v-model='toPageNo' @keyup.enter='getList(toPageNo)'>
                </div>
                <el-pagination @size-change="listsizechange" @current-change="getList" :current-page.sync="pageNo" :page-sizes="[10,15,20]" :page-size="pageSize" layout="sizes, prev, pager, next" :total="$store.state.userInfo.pageItemTotalCount" style='margin-top:20px;height:100px;'>
                </el-pagination>
            </div>
        </el-row>
        <el-dialog :title="dialogTitle" size='tiny' v-model="$store.state.userInfo.dialogFormVisible" :modal-append-to-body='false'>
            <el-form :model="form">
                <el-form-item label="工号" label-width="80px">
                    <el-input v-model="form.userId" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="姓名" label-width="80px">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="Email" label-width="80px">
                    <el-input v-model="form.Email" auto-complete="off"></el-input>
                </el-form-item>
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span style="line-height: 36px;">权限设置</span>
                        <el-checkbox style='float:right;margin-top:8px;' :indeterminate="isIndeterminate" v-model="authCheckAll" @change="handleCheckAllChange">全选</el-checkbox>
                    </div>
                    <div class="text item">
                        <el-checkbox-group v-model="form.authList" @change="handleCheckedAuthsChange">
                            <el-checkbox v-for="auth in auths" :label="auth.code" :key="auth.code">{{auth.name}}</el-checkbox>
                        </el-checkbox-group>
                    </div>
                </el-card>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click='hideDialog'>取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="权限交接" size='tiny' v-model="authChangeView" :modal-append-to-body='false'>
            <el-form>
                <el-form-item label="工号" label-width="80px">
                    <el-select v-model="transferUser" filterable remote placeholder="请选择" :remote-method="getUserList" :loading="userLoading">
                        <el-option v-for="item in userOptions" :label="item.label" :key="item.value" :value="item.value">
                        </el-option>
                    </el-select>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click='authChangeView = false'>取 消</el-button>
                <el-button type="danger" @click="confirmChangeUserAuth">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import { validateUser } from "../../libs/validate";
import _ from "lodash";
export default {
    data() {
        var self = this;
        return {
            inValidStatus: "",
            authCheckAll: false,
            pageNo: 1,
            transferUser: "",
            currentTransferUser: "",
            userLoading: false,
            authChangeView: false,
            userOptions: [],
            pageSize: 10,
            toPageNo: 1,
            totalCount: 0,
            serachContent: "",
            dialogTitle: "",
            form: {},
            detailType: "create",
            isIndeterminate: false,
            updating: false,
        }
    },
    computed: {
        dictEdit() {
            return this.$store.state.common.userAuthList.indexOf("00007") > -1;
        },
        removeEdit(){
            return this.$store.state.common.userAuthList.indexOf("00101") > -1;
        },
        auths() {
            return this.$store.state.common.authList.map(cur => {
                return cur;
            })
        },
        dataList() {
            if (this.$store.state.userInfo.userList && this.$store.state.userInfo.userList.length) {

                var list = this.$store.state.userInfo.userList.map((cur, index) => {
                    try {
                        let item = {
                            _id: cur._id,
                            role: (cur.role || "").toString(),
                            Email: cur.Email,
                            userId: cur.userId,
                            name: cur.name,
                            authList: cur.authList,
                            isValid: cur.isValid ? '有效':'无效',

                        }

                        let option = { "0": "Administrator", "1": "EditUser", "2": "Guest" };
                        item.roleView = (function(list) {
                            for (let item of list) {
                                if (item.value == cur.role) {
                                    return item.label;
                                }
                            }
                        })(this.$store.state.userInfo.roleList);

                        return item;
                    } catch (err) {
                        debugger;
                        console.log(`${index}error`, err);
                        return {}
                    }
                });
                return list;

            } else {
                return [];
            }
        },
        userRoleList() {
            return this.$store.state.userInfo.roleList;
        },
    },
    methods: {
        confirmChangeUserAuth() {
            if (!!!this.transferUser) {
                this.$message.error("请选择一个用户");
                return;
            }

            this.$confirm(`此次操作将会将权限分配给用户${this.transferUser.split("&")[1]}, 是否继续?`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$store.dispatch("transferAuth", {
                    from: this.currentTransferUser,
                    to: this.transferUser
                }).then(res => {
                    this.authChangeView = false;
                    this.$message.info("权限转交成功");
                }).catch(err => {
                    console.log("auth transfer error", err);
                    this.$message.error("权限转交失败");
                    this.authChangeView = false;
                });
            }).catch(() => {

            });
        },
        changeUserAuth(row) {
            this.transferUser = "";
            this.currentTransferUser = `${row._id}&${row.name}`;
            this.authChangeView = true;
        },
        handleCheckedAuthsChange(value) {
            let checkedCount = value.length;
            this.authCheckAll = checkedCount === this.auths.length;
            this.isIndeterminate = checkedCount > 0 && checkedCount < this.auths.length;
        },
        getUserList: _.throttle(function(keyword) {
            if (keyword) {
                this.$store.dispatch("getOptions", { keyword, type: "user" }).then(res => {
                    this.userOptions = res.result.map(cur => {
                        return {
                            label: cur.name,
                            value: cur._id + "&" + cur.name
                        }
                    });;
                })
            } else {
                this.depOptions = [];
            }
        }, 800),
        handleCheckAllChange(event) {
            this.form.authList = event.target.checked ? this.$store.state.common.authList.map(cur => {
                return cur.code;
            }) : [];
            this.isIndeterminate = false;
        },
        hideDialog() {
            this.$store.commit('viewUserDetail', false);
        },
        edit(userInfo) {
            this.$store.commit("viewUserDetail", true);
            this.dialogTitle = "编辑用户信息";
            this.SaveActionName = "editUser";
            this.form = _.assign({}, userInfo);
            this.isIndeterminate = true;
            this.isIndeterminate = (userInfo.authList.length > 0 && userInfo.authList == this.auths.length);
            this.authCheckAll = (userInfo.authList.length == this.auths.length)
        },
        create() {
            this.$store.commit("viewUserDetail", true);
            this.dialogTitle = "新建用户信息";
            this.SaveActionName = "createUser";
            this.form = {
                name: "",
                userId: '',
                Email: '',
                role: "",
                isLock:"",
                authList: []
            }
        },
        update() {
            this.updating = true;
            this.$store.dispatch("updateUserInfoFromHRS").then(res => {
                this.$message.info("更新成功")
                this.updating = false;
                this.getList();
            }, err => {
                this.$message.error("更新失败")
            });
        },
        submit() {
            let ret = validateUser(this.form);
            if (ret != "") {
                this.$message.warn(ret);
            } else {
                this.$store.dispatch(this.SaveActionName, this.form).then(res => {
                    this.$message.info("保存成功")
                    this.getList();
                }, err => {
                    this.$message.error("保存失败")
                });
            }
        },
        search() {
            this.getList(1);
        },
        listsizechange(val) {
            this.pageSize = val;
            this.getList(1);
        },
        resetPassword(row) {
            this.$confirm('该操作会重置该用户密码, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$store.dispatch("resetpwd", row.userId).then(res => {
                    this.$message.info("重置成功")
                }, err => {
                    this.$message.error(err || "重置失败")
                });
            }).catch(() => {

            });
        },
        delrow(row) {
            console.log(row)
            this.$confirm('此操作将永久删除, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$store.dispatch("removeDict", {
                    type: "user",
                    id: row._id
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    this.getList();
                }, err => {
                    this.$message({
                        type: 'error',
                        message: '删除失败!'
                    });
                })

            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });

        },
        getList(page) {
            var self = this;
            this.pageNo = page || this.pageNo;
            if(this.inValidStatus==="invalid"){
                this.$store.dispatch("getInValidList", {
                    pageNo: this.pageNo - 1,
                    pageSize: this.pageSize,
                    keyword: this.serachContent
                });
            }else{
                this.$store.dispatch("getUserList", {
                    pageNo: this.pageNo - 1,
                    pageSize: this.pageSize,
                    keyword: this.serachContent,
                });
            }
        }
    },
    mounted() {
        this.getList(1);
    }
}
</script>
<style lang="sass" scoped>
.contentbox {
    padding: 15px;
    padding-bottom: 60px;
    overflow-y: scroll;
}

.flexbox {
    display: flex;
    height: 28px;
    .tobox {
        margin-top: 20px;
        text-align: right;

        &>* {
            height: 28px;
            display: inline-block;
        }

        input {
            width: 2em;
            padding: 0px;
        }
    }
    .el-pagination {
        flex: 1;
    }
}


.box-card .el-checkbox {
    margin-left: 0px !important;
    margin-right: 15px !important;
}
</style>