<template>
    <div class='contentbox'>
        <el-row type='flex' style='margin-bottom:20px;' justify='space-between'>
            <el-col :span='6'>
                <div class="grid-content">
                    <el-input placeholder="搜索仪器Code名称..." v-model="serachContent" style="width: 300px;">
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
                <el-table :data="dataList" v-loading.body="$store.state.insCode.tableLoading" border style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column prop="code" label="仪器代码" width="250">
                    </el-table-column>
                    <el-table-column prop="name" label="代码名称" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column inline-template v-if='dictEdit' :context="_self" label="操作" width="300">
                        <span>
                       <el-button @click="edit(row)" v-if='dictEdit' type="success" size="small">编辑</el-button>
                       <el-button @click="delrow(row)" v-if='dictEdit' type="danger" size="small">删除</el-button>
                      </span>
                    </el-table-column>
                </el-table>
                <el-pagination @size-change="listsizechange" @current-change="getList" :current-page.sync="pageNo" :page-sizes="[10,15,20]" :page-size="pageSize" layout="sizes, prev, pager, next" :total="$store.state.insCode.pageItemTotalCount" style='margin-top:20px;height:100px;'>
                </el-pagination>
            </el-col>
        </el-row>
        <el-dialog :title="dialogTitle" size='tiny' v-model="$store.state.insCode.dialogFormVisible">
            <el-form :model="form">
                <el-form-item label="仪器代码" label-width="80px">
                    <el-input v-model="form.code" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="仪器名称" label-width="80px">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
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
import { validateInsCode } from "../../libs/validate.js";

export default {
    computed: {
        dataList() {
            return this.$store.state.insCode.codeList.map((current) => {
                return current;
            })
        },
        dictEdit() {
            return this.$store.state.common.userAuthList.indexOf("00007") > -1;
        }
    },
    data() {
        return {
            serachContent: "",
            dialogTitle: "新建模板集",
            // dataList: [],
            pageSize: 10,
            pageNo: 1,
            dialogFormVisible: false,
            form: {},
            type: "create",
        }
    },
    methods: {
        hideDialog() {
            this.$store.commit('viewInsCodeDetail', false);
        },
        edit(insInfo) {
            this.$store.commit("viewInsCodeDetail", true);
            this.dialogTitle = "编辑仪器代码";
            this.SaveActionName = "editInsCode";
            this.form = _.assign({}, insInfo);
        },
        create() {
            this.$store.commit("viewInsCodeDetail", true);
            this.dialogTitle = "新建仪器代码";
            this.SaveActionName = "createInsCode";
            this.form = {
                name: "",
                userId: '',
                Email: '',
                role: ""
            }
        },
        submit() {
            let ret = validateInsCode(this.form);
            if (ret != "") {
                this.$message.warn(ret);
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
                    type: "insCode",
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
            this.getList(1);
        },
        getList(page) {
            var self = this;
            this.pageNo = page;
            this.$store.dispatch("getInsCodeList", {
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