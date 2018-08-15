 <template>
    <div class='contentbox'>
        <el-row type='flex' style='margin-bottom:20px;' justify='space-between'>
            <el-col :span='6'>
                <div class="grid-content">
                    <el-input placeholder="搜索物料编号..." v-model="serachContent" style="width: 300px;">
                        <el-button @click='getList(1)' slot="append" icon="search"></el-button>
                    </el-input>
                </div>
            </el-col>
            <el-col :span='12'>
                <div class="grid-content tabletool">
                    <el-button style='float:right;' v-if='dictEdit' @click='create' type="success">新建</el-button>
                    <el-button style='float:right;' @click='importDialogView = true' v-if='dictEdit' type="primary">导入</el-button>
                    <el-button style='float:right;' @click='exportList' v-if='dictEdit' type="primary">导出</el-button>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span='24'>
                <el-table :data="dataList" v-loading.body="$store.state.matCode.tableLoading" border style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column prop="updateTime" label="时间" width="180" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="code" label="料号" width="180" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="type" label="类别" width="120" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="supplier" label="供应商"  width="220" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="description" label="物料描述" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column inline-template fixed="right" v-if='dictEdit' :context="_self" label="操作" width="300">
                        <span>
                       <el-button @click="edit(row)" v-if='dictEdit' type="success" size="small">编辑</el-button>
                       <el-button @click="delrow(row)" v-if='dictEdit' type="danger" size="small">删除</el-button>
                      </span>
                    </el-table-column>
                </el-table>
                <el-pagination @size-change="listsizechange" @current-change="getList" :current-page.sync="pageNo" :page-sizes="[10,15,20]" :page-size="pageSize" layout="sizes, prev, pager, next" :total="$store.state.matCode.pageItemTotalCount" style='margin-top:20px;height:100px;'>
                </el-pagination>
            </el-col>
        </el-row>
        <el-dialog :title="dialogTitle" size='tiny' v-model="$store.state.matCode.dialogFormVisible" :modal-append-to-body='false'>
            <el-form :model="form">
                <el-form-item label="料号" label-width="100px">
                    <el-input v-model="form.code" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="类别" label-width="100px">
                    <el-select v-model="form.type" placeholder="请选择" style="width: 100%;">
                        <el-option key="NA" value="NA" label="NA"/>
                        <el-option key="ESD" value="ESD" label="ESD"/>
                        <el-option key="cam" value="cam" label="cam"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="供应商" label-width="100px">
                    <el-input v-model="form.supplier" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="更新时间" label-width="100px">
                    <el-date-picker type="date" placeholder="选择日期" v-model="form.updateTime" format="yyyy 年 MM 月 dd 日" style="width: 100%;"></el-date-picker>
                </el-form-item>
                <el-form-item label="物料描述" label-width="100px">
                    <el-input type="textarea" :rows="2" v-model="form.description" placeholder="请输入内容"></el-input>
                </el-form-item>
                
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="hideDialog">取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="导入来料Code信息" size='small' v-model="importDialogView" :modal-append-to-body='false'>
            <el-upload class="upload-demo" multiple drag action="/cig/uploadfile" :on-success='handleSuccess' :show-file-list="false">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text"><em>点击上传</em></div>
            </el-upload>
        </el-dialog>
    </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import { validateMatCode } from "../../libs/validate.js";

export default {
    data() {
        return {
            serachContent: "",
            dialogTitle: "",
            pageSize: 10,
            pageNo: 1,
            dialogFormVisible: false,
            form: {},
            type: "create",
            importDialogView: false,
        }
    },
    computed: {
        dataList() {
            return this.$store.state.matCode.matCodeList.map(cur=>{
                cur.updateTime = moment(cur.updateTime).format('YYYY-MM-DD');
                return cur;
            });
        },
        dictEdit() {   
            return this.$store.state.common.userAuthList.indexOf("00007") > -1;
        }
    },
    methods: {
        exportList() {
            this.$store.dispatch("exportMatCodeList").then(res => {
                window.open(res);
            }, err => {
                this.$message.error("服务暂不可用");
            });
        },
        hideDialog() {
            this.$store.commit('viewMatCodeDetail', false);
        },
        edit(row) {
            this.$store.commit("viewMatCodeDetail", true);
            this.dialogTitle = "编辑信息";
            this.SaveActionName = "editMatCode";
            this.form = _.assign({}, row);
        },
        create() {
            this.$store.commit("viewMatCodeDetail", true);
            this.dialogTitle = "新建供应商信息";
            this.form = {};
            this.SaveActionName = "createMatCode";
        },
        submit() {
            let ret = validateMatCode(this.form);
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
        handleSuccess(res, file, fileList) {
            if (res.success) {
                this.$store.dispatch("importMatCodeList", {
                    importFileId: res.result
                }).then(res => {
                    this.importDialogView = false;
                    this.$alert("导入成功");
                    this.getList(1);
                }, err => {
                    this.importDialogView = false;
                    this.$alert(err);
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
                    type: "matCode",
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
            this.$store.dispatch("getMatCodeList", {
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


                    