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
                <el-table :data="dataList" v-loading.body="$store.state.recode.tableLoading" border style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column prop="createTime" label="校验时间" width="120" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="insCode" label="仪器编号" width="180" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="insName" label="仪器名称" width="180" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="startStatus" label="起始状态" width="120" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="endStatus" label="目标状态" width="120" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="attachmentCount" label="附件数量" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column inline-template fixed="right" :context="_self" label="操作" width="300">
                        <span>
                       <el-button @click="viewTestLog(row)" type="success" size="small">查看</el-button>
                      </span>
                    </el-table-column>
                </el-table>
                <el-pagination @size-change="listsizechange" @current-change="getList" :current-page.sync="pageNo" :page-sizes="[10,15,20]" :page-size="pageSize" layout="sizes, prev, pager, next" :total="$store.state.recode.pageItemTotalCount" style='margin-top:20px;height:100px;'>
                </el-pagination>
            </el-col>
        </el-row>
        <el-dialog title="仪器日志" size='small' v-model="$store.state.recode.dialogFormVisible" :modal-append-to-body='false'>
            <el-row>
                <el-table :data="currentLog.log" style="width: 100%">
                    <el-table-column prop="time" label="操作日期">
                    </el-table-column>
                    <el-table-column prop="message" label="记录">
                    </el-table-column>
                    <el-table-column prop="note" label="备注">
                    </el-table-column>
                    <el-table-column prop="operator" label="操作人">
                    </el-table-column>
                </el-table>
            </el-row>
            <el-row>
                <el-table :data="currentLog.attachmentList" style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column prop="name" label="名称">
                    </el-table-column>
                    <el-table-column inline-template :context="_self" label="操作" width="150">
                        <span>
                      <el-button @click="download(row)" type="success" size="small">下载</el-button>
                    </span>
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
import { validateRecode } from "../../libs/validate.js";
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
            return this.$store.state.recode.recodeList.map((current) => {
                // current.state=(current.state?"是":"否");
                current.createTime = moment(current.createTime).format("YYYY-MM-DD");
                current.attachmentCount = (list => {
                        let total = 0;
                        for (let item of list) {
                            if (item.filePath && item.filePath.length) {
                                total += item.filePath.length
                            }
                        }
                        return total ? total : 0;
                    })(current.log);
                return current;
            })
        },
        // dictEdit() {   
        //     return this.$store.state.common.userAuthList.indexOf("00007") > -1;
        // }
    },
    methods: {
        hideDialog() {
            this.$store.commit('viewRecodeDetail', false);
        },
        viewTestLog(row) {
            this.$store.commit("viewRecodeDetail", true);
            this.currentLog = row;
            this.currentLog.attachmentList = (list => {
                let ret = [];
                for (let item of list) {
                    if (item.filePath && item.filePath.length) {
                        ret = ret.concat(item.filePath.map(cur => {
                            return {
                                name: path.basename(item.filePath),
                                path: item.filePath
                            };
                        }));
                    }
                }

                return ret;
            })(row.log);
        },
        listsizechange(val) {
            this.pageSize = val;
            this.getList(1);
        },
        search() {
            this.getList(1);
        },
        getList(page) {
            var self = this;
            this.pageNo = page || this.pageNo;
            this.$store.dispatch("getRecodeList", {
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