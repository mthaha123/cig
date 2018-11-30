<template>
    <div class='contentbox'>
        <el-row type='flex' style='margin-bottom:20px;' justify='space-between'>
            <el-col :span='6'>
                <div class="grid-content">
                    <el-input placeholder="搜索科室名称..." v-model="serachContent" style="width: 300px;">
                        <el-button @click='getList(1)' slot="append" icon="search"></el-button>
                    </el-input>
                </div>
            </el-col>
            <el-col :span='12'>
                <div class="grid-content tabletool">
                    <el-button style='float:right;' v-if='dictEdit' @click='create' type="success">新建</el-button>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span='24'>
                <el-table :data="dataList" v-loading.body="$store.state.depInfo.tableLoading" border style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column prop="code" label="部门代码" width="250">
                    </el-table-column>
                    <el-table-column prop="name" label="部门名称" width="300">
                    </el-table-column>
                    <el-table-column prop="location" label="位置" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column prop="factory" label="厂区" width='100'>
                    </el-table-column>
                    <el-table-column prop="managerView" label="主管" width='100'>
                    </el-table-column>
                    <el-table-column inline-template :context="_self" v-if='dictEdit' label="操作" width="200">
                        <span>
                       <el-button v-if='dictEdit' @click="edit(row)" type="success" size="small">编辑</el-button>
                       <el-button v-if='removeEdit' @click="delrow(row)" type="danger" size="small">删除</el-button>
                      </span>
                    </el-table-column>
                </el-table>
                <el-pagination @size-change="listsizechange" @current-change="getList" :current-page.sync="pageNo" :page-sizes="[10,15,20]" :page-size="pageSize" layout="sizes, prev, pager, next" :total="$store.state.depInfo.pageItemTotalCount" style='margin-top:20px;height:100px;'>
                </el-pagination>
            </el-col>
        </el-row>
        <el-dialog :title="dialogTitle" size='small' v-model="$store.state.depInfo.dialogFormVisible"  :modal-append-to-body='false'>
            <el-form :model="form">
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="部门代码" label-width="80px">
                            <el-input v-model="form.code" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="部门名称" label-width="80px">
                            <el-input v-model="form.name" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="厂区" label-width="80px">
                            <el-input v-model="form.factory" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="位置" label-width="80px">
                            <el-input v-model="form.location" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="保管人" label-width="80px">
                            <el-select v-model="form.keeper" filterable remote placeholder="保管人" :remote-method="getUserList1" :loading="userLoading">
                                <el-option v-for="item in keeperOptions" :label="item.label" :key="item.value" :value="item.value">
                                    <span style="float: left">{{ item.label }}</span>
                                    <span style="float: right; font-size: 13px">{{ item.userId }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="主管" label-width="80px">
                            <el-select v-model="form.manager" filterable remote placeholder="主管" :remote-method="getUserList2" :loading="userLoading">
                                <el-option v-for="item in managerOptions" :label="item.label" :key="item.value" :value="item.value">
                                    <span style="float: left">{{ item.label }}</span>
                                    <span style="float: right; font-size: 13px">{{ item.userId }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="文员" label-width="80px">
                            <el-select v-model="form.staff" filterable remote placeholder="文员" :remote-method="getUserList3" :loading="userLoading">
                                <el-option v-for="item in staffOptions" :label="item.label" :key="item.value" :value="item.value">
                                    <span style="float: left">{{ item.label }}</span>
                                    <span style="float: right; font-size: 13px">{{ item.userId }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="代理人" label-width="80px">
                            <el-select v-model="form.proxer" filterable remote placeholder="代理人" :remote-method="getUserList4" :loading="userLoading">
                                <el-option v-for="item in proxerOptions" :label="item.label" :key="item.value" :value="item.value">
                                    <span style="float: left">{{ item.label }}</span>
                                    <span style="float: right;font-size: 13px">{{ item.userId }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="高阶主管" label-width="80px">
                            <el-select v-model="form.seniorManager" filterable remote placeholder="高阶主管" :remote-method="getUserList5" :loading="userLoading">
                                <el-option v-for="item in seniorManagerOptions" :label="item.label" :key="item.value" :value="item.value">
                                    <span style="float: left">{{ item.label }}</span>
                                    <span style="float: right; font-size: 13px">{{ item.userId }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="最高主管" label-width="80px">
                            <el-select v-model="form.generalManager" filterable remote placeholder="最高主管" :remote-method="getUserList6" :loading="userLoading">
                                <el-option v-for="item in generalManagerOptions" :label="item.label" :key="item.value" :value="item.value">
                                    <span style="float: left">{{ item.label }}</span>
                                    <span style="float: right;font-size: 13px">{{ item.userId }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="hideDialog">取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import _ from "lodash";
import { validateDepInfo } from "../../libs/validate.js";
export default {
    computed: {
        dataList() {
            return this.$store.state.depInfo.depList.map((current) => {
                current.managerView = current.manager.split("&")[1];
                return current;
            });
        },
        dictEdit() {
            return this.$store.state.common.userAuthList.indexOf("00007") > -1;
        },
        removeEdit(){
            return this.$store.state.common.userAuthList.indexOf("00103") > -1;
        },
    },
    data() {
        var self = this;
        return {
            serachContent: "",
            dialogTitle: "新建模板集",
            // dataList: [],
            userLoading: false,
            keeperOptions: [],
            managerOptions:[],
            staffOptions:[],
            proxerOptions:[],
            seniorManagerOptions:[],
            generalManagerOptions:[],
            pageNo: 1,
            pageSize: 10,
            form: {},
            type: "create",
        }
    },
    methods: {
        hideDialog() {
            this.$store.commit('viewDepDetail', false);
        },
        edit(insInfo) {
            this.$store.commit("viewDepDetail", true);
            this.dialogTitle = "编辑科室信息";
            this.SaveActionName = "editDep";
            this.keeperOptions = [{
                value: insInfo.keeper,
                label: insInfo.keeper?insInfo.keeper.split("&")[1]:""
            }];
            this.managerOptions = [{
                value: insInfo.manager,
                label: insInfo.manager?insInfo.manager.split("&")[1]:""
            }];
            this.staffOptions = [{
                value: insInfo.staff,
                label: insInfo.staff?insInfo.staff.split("&")[1]:""
            }];
            this.proxerOptions = [{
                value: insInfo.proxer,
                label: insInfo.proxer?insInfo.proxer.split("&")[1]:""
            }];
            this.seniorManagerOptions = [{
                value: insInfo.seniorManager,
                label: insInfo.seniorManager?insInfo.seniorManager.split("&")[1]:""
            }];
            this.generalManagerOptions = [{
                value: insInfo.generalManager,
                label: insInfo.generalManager?insInfo.generalManager.split("&")[1]:""
            }]
            this.form = _.assign({}, insInfo);
        },
        create() {
            this.$store.commit("viewDepDetail", true);
            this.dialogTitle = "新建科室信息";
            this.SaveActionName = "createDep";
            this.keeperOptions= [];
            this.managerOptions=[];
            this.staffOptions=[];
            this.proxerOptions=[];
            this.seniorManagerOptions=[];
            this.generalManagerOptions=[];
            this.form = {
                keeper: "",
            }
        },
        getUserList1: _.throttle(function(keyword) {
            if (keyword) {
                keyword = keyword.split("_")[0];
                this.$store.dispatch("getOptions", { keyword, type: "user" }).then(res => {
                    this.keeperOptions = res.result.map(cur => {
                        return {
                            label: cur.name,
                            userId: cur.userId,
                            value: cur._id + "&" + cur.name
                        }
                    });
                })
            } else {
                this.depOptions = [];
            }
        }, 800),
        getUserList2: _.throttle(function(keyword) {
            if (keyword) {
                keyword = keyword.split("_")[0];
                this.$store.dispatch("getOptions", { keyword, type: "user" }).then(res => {
                    this.managerOptions = res.result.map(cur => {
                        return {
                            label: cur.name,
                            userId: cur.userId,
                            value: cur._id + "&" + cur.name
                        }
                    });
                })
            } else {
                this.depOptions = [];
            }
        }, 800),
        getUserList3: _.throttle(function(keyword) {
            if (keyword) {
                keyword = keyword.split("_")[0];
                this.$store.dispatch("getOptions", { keyword, type: "user" }).then(res => {
                    this.staffOptions = res.result.map(cur => {
                        return {
                            label: cur.name,
                            userId: cur.userId,
                            value: cur._id + "&" + cur.name
                        }
                    });
                })
            } else {
                this.depOptions = [];
            }
        }, 800),
        getUserList4: _.throttle(function(keyword) {
            if (keyword) {
                keyword = keyword.split("_")[0];
                this.$store.dispatch("getOptions", { keyword, type: "user" }).then(res => {
                    this.proxerOptions = res.result.map(cur => {
                        return {
                            label: cur.name,
                            userId: cur.userId,
                            value: cur._id + "&" + cur.name
                        }
                    });
                })
            } else {
                this.depOptions = [];
            }
        }, 800),
        getUserList5: _.throttle(function(keyword) {
            if (keyword) {
                keyword = keyword.split("_")[0];
                this.$store.dispatch("getOptions", { keyword, type: "user" }).then(res => {
                    this.seniorManagerOptions = res.result.map(cur => {
                        return {
                            label: cur.name,
                            userId: cur.userId,
                            value: cur._id + "&" + cur.name
                        }
                    });
                })
            } else {
                this.depOptions = [];
            }
        }, 800),
        getUserList6: _.throttle(function(keyword) {
            if (keyword) {
                keyword = keyword.split("_")[0];
                this.$store.dispatch("getOptions", { keyword, type: "user" }).then(res => {
                    this.generalManagerOptions = res.result.map(cur => {
                        return {
                            label: cur.name,
                            userId: cur.userId,
                            value: cur._id + "&" + cur.name
                        }
                    });
                })
            } else {
                this.depOptions = [];
            }
        }, 800),
        submit() {
            let ret = validateDepInfo(this.form);
            if (ret != "") {
                this.$message.info(ret);
            } else {
                this.$store.dispatch(this.SaveActionName, this.form).then(res => {
                    this.$message.info("保存成功")
                    this.getList(1);
                }, err => {
                    this.$message.error("保存失败")
                });
            }
        },
        listsizechange(val) {
            this.pageSize = val;
            this.getList(1);
        },
        delrow(row) {
            console.log(row)
            this.$confirm('此操作将永久删除, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.$store.dispatch("removeDict", {
                    type: "depInfo",
                    id: row._id
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    this.getList(1);
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
        search() {
            console.log("search")
            this.getList(1);
        },
        getList(page) {
            var self = this;
            this.pageNo = page;
            this.$store.dispatch("getDepList", {
                pageNo: page - 1,
                keyword: this.serachContent,
                pageSize: this.pageSize,
            });
        },
    },
    mounted() {
        this.getList(1);
    }
}
</script>
<style lang="sass" scoped>
.contentbox {
    padding: 15px;
}

.tabletool {
    margin-bottom: 10px;
}

.tabletool button {
    float: right;
    margin-left: 20px;
}
</style>