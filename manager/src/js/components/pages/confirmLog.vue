<template>
    <div class='contentbox'>
        <el-row type='flex' style='margin-bottom:20px;' justify='space-between'>
            <el-col :span='6'>
                <div class="grid-content">
                    <el-input placeholder="搜索仪器编号..." v-model="serachContent" style="width: 300px;">
                        <el-button @click='getList(1)' slot="append" icon="search"></el-button>
                    </el-input>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span='24'>
                <el-table :data="dataList" v-loading.body="$store.state.confirmLog.tableLoading" border style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column prop="createTime" label="校验时间" width="120" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="insCode" label="仪器编号" width="180" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="insName" label="仪器名称" width="180" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="keeperName" label="目标保管人" width="120" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="fromKeeperName" label="前保管人" width="120" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="confirm" label="确认情况" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column inline-template fixed="right" :context="_self" label="操作" width="300">
                        <span>
                       <el-button @click="viewTestLog(row)" type="success" size="small">查看</el-button>
                       <el-button @click="delrow(row)" v-if="removeEdit" type="danger" size="small">删除</el-button>
                      </span>
                    </el-table-column>
                </el-table>
                <el-pagination @size-change="listsizechange" @current-change="getList" :current-page.sync="pageNo" :page-sizes="[10,15,20]" :page-size="pageSize" layout="sizes, prev, pager, next" :total="$store.state.confirmLog.pageItemTotalCount" style='margin-top:20px;height:100px;'>
                </el-pagination>
            </el-col>
        </el-row>
        <el-dialog title="仪器日志" size='small' v-model="$store.state.confirmLog.dialogFormVisible" :modal-append-to-body='false'>
            <el-row>
                <el-table :data="currentLog.log" style="width: 100%">
                    <el-table-column prop="time" label="操作日期">
                    </el-table-column>
                    <el-table-column prop="message" label="记录">
                    </el-table-column>
                    <el-table-column prop="operator" label="操作人Id">
                    </el-table-column>
                </el-table>
            </el-row>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="hideDialog">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import { validateConfirmLog } from "../../libs/validate.js";
import path from "path";

export default {
    data() {
        return {
            serachContent: "",
            dialogTitle: "",
            // dataList: [],
            pageSize: 10,
            pageNo: 1,
            dialogFormVisible: false,
            currentLog: {},
            type: "create",
        }
    },
    computed: {
        dataList() {
            return this.$store.state.confirmLog.confirmLogList.map((current) => {
                // current.state=(current.state?"是":"否");
                current.createTime = moment(current.createTime).format("YYYY-MM-DD");
                current.updateTime = moment(current.updateTime).format("YYYY-MM-DD");
                switch(current.confirm){
                    case "1" : current.confirm ="确认完成";break;
                    case "2" : current.confirm ="确认失败";break;
                    default : current.confirm = "待确认";
                }
                current.keeperName = current.keeper.split("&")[1];
                current.fromKeeperName = current.fromKeeper.split("&")[1]||"无";
                return current;
            })
        },
        dictEdit() {   
            return this.$store.state.common.userAuthList.indexOf("00007") > -1;
        },
        removeEdit(){
            return this.$store.state.common.userAuthList.indexOf("00113") > -1;
        },
    },
    methods: {
        hideDialog() {
            this.$store.commit('viewConfirmLogDetail', false);
        },
        viewTestLog(row) {
            this.$store.commit("viewConfirmLogDetail", true);
            this.currentLog = row;
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
                    type: "confirmLog",
                    id: row._id
                }).then(() => {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    this.getList(this.pageNo);
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
            this.getList(1);
        },
        getList(page) {
            var self = this;
            this.pageNo = page || this.pageNo;
            this.$store.dispatch("getConfirmLogList", {
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