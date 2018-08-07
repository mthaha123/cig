<template>
    <div class='contentbox'>
        <el-row type='flex' style='margin-bottom:20px;' justify='space-between'>
            <el-col :span='6'>
                <div class="grid-content">
                    <el-input placeholder="搜索供应商名称..." v-model="serachContent" style="width: 300px;">
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
                <el-table :data="dataList" v-loading.body="$store.state.supplier.tableLoading" border style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column prop="name" label="供应商名称" width="250">
                    </el-table-column>
                    <el-table-column prop="state" label="服务状态" show-overflow-tooltip>
                    </el-table-column>
                    <el-table-column inline-template v-if='dictEdit' :context="_self" label="操作" width="300">
                        <span>
                       <el-button @click="edit(row)" v-if='dictEdit' type="success" size="small">编辑</el-button>
                       <el-button @click="delrow(row)" v-if='dictEdit' type="danger" size="small">删除</el-button>
                      </span>
                    </el-table-column>
                </el-table>
                <el-pagination @size-change="listsizechange" @current-change="getList" :current-page.sync="pageNo" :page-sizes="[10,15,20]" :page-size="pageSize" layout="sizes, prev, pager, next" :total="$store.state.supplier.pageItemTotalCount" style='margin-top:20px;height:100px;'>
                </el-pagination>
            </el-col>
        </el-row>
        <el-dialog :title="dialogTitle" size='tiny' v-model="$store.state.supplier.dialogFormVisible" :modal-append-to-body='false'>
            <el-form :model="form">
                <el-form-item label="供应商名称" label-width="100px">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="服务状态" label-width="100px">
                    <el-select v-model="form.state" placeholder="请选择">
                        <el-option key="true" value="true" label="是"/>
                        <el-option key="false" value="false" label="否"/>
                    </el-select>
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
import { validateSupplier } from "../../libs/validate.js";

export default {
    data() {
        return {
            serachContent: "",
            dialogTitle: "",
            // dataList: [],
            pageSize: 10,
            pageNo: 1,
            dialogFormVisible: false,
            form: {},
            type: "create",
        }
    },
    computed: {
        dataList() {
            return this.$store.state.supplier.supplierList.map((current) => {
                current.state=(current.state?"是":"否");
                return current;
            })
        },
        dictEdit() {   
            return this.$store.state.common.userAuthList.indexOf("00007") > -1;
        }
    },
    methods: {
        hideDialog() {
            this.$store.commit('viewSupplierDetail', false);
        },
        edit(row) {
            this.$store.commit("viewSupplierDetail", true);
            this.dialogTitle = "编辑供应商信息";
            this.SaveActionName = "editSupplier";
            this.form = _.assign({}, row);
        },
        create() {
            this.$store.commit("viewSupplierDetail", true);
            this.dialogTitle = "新建供应商信息";
            this.SaveActionName = "createSupplier";
            this.form = {
                name: "",
                userId: '',
                Email: '',
                role: ""
            }
        },
        submit() {
            let ret = validateSupplier(this.form);
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
                    type: "supplier",
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
        search() {
            this.getList(1);
        },
        getList(page) {
            var self = this;
            this.pageNo = page || this.pageNo;
            this.$store.dispatch("getSupplierList", {
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