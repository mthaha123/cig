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
                    <el-button style='float:right;' v-if='dictEdit' @click='updateType' type="success">更新</el-button>
                    <el-button style='float:right;' @click='importDialogView = true' v-if='dictEdit' type="primary">导入</el-button>
                    <el-button style='float:right;' @click='exportList' v-if='dictEdit' type="primary">导出</el-button>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span='24'>
                <el-table :data="dataList" v-loading.body="$store.state.materials.tableLoading" border style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column prop="createTime" label="日期" width="180" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="code" label="料号" width="180" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="order" label="采购订单" width="180" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="completeView" label="状态" width="180" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="type" label="类别" width="120" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="num" label="数量" width="120" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="userView" label="领用人" width="120" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="supplier" label="供应商"  width="220" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column prop="description" label="物料描述" :show-overflow-tooltip=true>
                    </el-table-column>
                    <el-table-column inline-template fixed="right" v-if='dictEdit' :context="_self" label="操作" width="300">
                        <span>
                       <el-button @click="edit(row)" v-if='dictEdit' type="success" size="small">编辑</el-button>
                       <el-button @click="delrow(row)" v-if='dictEdit' type="danger" size="small">删除</el-button>
                       <el-button @click="addFile(row)" v-if='row.type=="ESD"' type="success" size="small">导入文件</el-button>
                       <el-button @click="addIns(row)" v-if='row.type=="CAL"' type="success" size="small">添加仪器</el-button>
                      </span>
                    </el-table-column>
                </el-table>
                <el-pagination @size-change="listsizechange" @current-change="getList" :current-page.sync="pageNo" :page-sizes="[10,15,20]" :page-size="pageSize" layout="sizes, prev, pager, next" :total="$store.state.materials.pageItemTotalCount" style='margin-top:20px;height:100px;'>
                </el-pagination>
            </el-col>
        </el-row>
        <el-dialog :title="dialogTitle" size='small' v-model="$store.state.materials.dialogFormVisible" :modal-append-to-body='false'>
            <el-form :model="form">
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="物料编号" label-width="80px">
                            <!-- <el-input v-model="form.code" auto-complete="off"></el-input> -->
                            <!-- <el-select v-model="form.code" filterable remote placeholder="物料编号" :remote-method="getMatCodeList"  @change="codeChangeOther">
                                <el-option v-for="item in codeOptions" :label="item.label" :key="item.value" :value="item.value">
                                </el-option>
                            </el-select> -->
                            <el-autocomplete class="inline-input" v-model="form.code" :fetch-suggestions="querySearch" placeholder="请输入内容" @trigger-on-focus="false" @select="codeChangeOther"></el-autocomplete>
                            
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="采购订单" label-width="80px">
                            <el-input v-model="form.order" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="领用人" label-width="80px">
                            <el-select v-model="form.user" filterable remote placeholder="保管人" :remote-method="getUserList">
                                <el-option v-for="item in userOptions" :label="item.label" :key="item.value" :value="item.value">
                                    <span style="float: left">{{ item.label }}</span>
                                    <span style="float: right; font-size: 13px">{{ item.userId }}</span>
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="数量" label-width="80px">
                            <el-input v-model="form.num" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="状态" label-width="80px">
                            <el-input v-model="form.completeView" auto-complete="off" :disabled=true></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="供应商" label-width="80px">
                            <el-input v-model="form.supplier" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="类别" label-width="80px">
                            <el-select v-model="form.type" placeholder="请选择" style="width: 100%;" :disabled="typeView" >
                                <el-option key="NA" value="NA" label="NA"/>
                                <el-option key="ESD" value="ESD" label="ESD"/>
                                <el-option key="CAL" value="CAL" label="CAL"/>
                                <el-option key="未确认" value="未确认" label="未确认"/>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="创建时间" label-width="80px">
                            <el-date-picker type="date" placeholder="选择日期" v-model="form.createTime" format="yyyy 年 MM 月 dd 日" style="width: 100%;"></el-date-picker>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-form-item label="物料描述" label-width="100px">
                    <el-input type="textarea" :rows="2" v-model="form.description" placeholder="请输入内容"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="hideDialog">取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="导入来料信息" size='tiny' v-model="importDialogView" :modal-append-to-body='false'>
            <el-row>
                <span style="float: left">excel格式</span>
            </el-row>
            <el-row>
                <span style="float: left">序号 日期 料号 采购订单 数量 物料描述 供应商名称 领用人</span>
            </el-row>
            <el-upload class="upload-demo" multiple drag action="/cig/uploadfile" :on-success='handleSuccess' :show-file-list="false">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text"><em>点击上传</em></div>
            </el-upload>
        </el-dialog>
        <el-dialog title="导入文件信息" size='tiny' v-model="importFileView" :modal-append-to-body='false'>
            <el-upload class="upload-demo" multiple action="/cig/uploadfile"  :file-list="fileList" :on-success="importFileSuccess" >
                    <el-button size="small" type="primary">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip">请上传pdf文件</div>
            </el-upload>
            <div slot="footer" class="dialog-footer">
                <el-button @click="hideImportDialog">取 消</el-button>
                <el-button type="primary" @click="importFile">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="添加仪器信息" size='tiny' v-model="addInsView" :modal-append-to-body='false'>
            <el-form :model="form">
                <el-row>
                    <span style="float: left">输入仪器编号，中间"_"隔开</span>
                </el-row>
                <el-input type="textarea" :rows="2" placeholder='输入仪器编号，中间"_"隔开' v-model="form.insLog"></el-input>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="hideInsDialog">取 消</el-button>
                <el-button type="primary" @click="addInsLog">确 定</el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import path from "path";
import { validateMaterials } from "../../libs/validate.js";

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
            typeView: true,
            codeOptions:[],
            userOptions:[],
            importFileView:false,
            fileList:[],
            addInsView:false,
        }
    },
    computed: {
        dataList() {
            return this.$store.state.materials.materialsList.map(cur=>{
                cur.completeView = cur.complete?"完成":"未完成";
                cur.userView = cur.user?cur.user.split("&")[1]:"";
                cur.createTime = moment(cur.createTime).format("YYYY-MM-DD");
                return cur;
            });
        },
        dictEdit() {   
            return this.$store.state.common.userAuthList.indexOf("00007") > -1;
        }
    },
    methods: {
        exportList() {
            this.$store.dispatch("exportMaterialsList").then(res => {
                window.open(res);
            }, err => {
                this.$message.error("服务暂不可用");
            });
        },
        hideDialog() {
            this.$store.commit('viewMaterialsDetail', false);
        },
        hideImportDialog(){
            this.importFileView = false;
        },
        hideInsDialog(){
            this.addInsView = false;
        },
        edit(row) {
            this.$store.commit("viewMaterialsDetail", true);
            this.dialogTitle = "编辑信息";
            this.SaveActionName = "editMaterials";
            this.userOptions = [{
                value: row.user,
                label: row.user?row.user.split("&")[1]:""
            }];
            this.form = _.assign({}, row);
        },
        create() {
            this.$store.commit("viewMaterialsDetail", true);
            this.dialogTitle = "新建来料信息";
            this.SaveActionName = "createMaterials";
            this.typeView = false;
            this.form = {};
            this.form.completeView = "未完成";
            this.form.complete = false;
            this.form.type = "未确认";
        },
        submit() {
            let ret = validateMaterials(this.form);
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
                this.$store.dispatch("importMaterialsList", {
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
                    type: "materials",
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
            this.$store.dispatch("getMaterialsList", {
                pageNo: page - 1,
                keyword: this.serachContent,
                pageSize: this.pageSize,
            });
        },
        querySearch(keyword,cb){
            this.getMatCodeList(keyword);
            cb(this.codeOptions);
        },
        getMatCodeList: _.throttle(function(keyword) {
            if (keyword) {
                this.$store.dispatch("getCodeOptions", { keyword, type: "matCode" }).then(res => {
                    this.codeOptions = res.result.map(cur => {
                        return {
                            label: cur.code,
                            value: cur.code, //+"&"+cur.keeper
                            matCode: cur
                        }
                    });;
                })
            } else {
                this.codeOptions = [];
            }
        }, 500),
        getUserList: _.throttle(function(keyword) {
            if (keyword) {
                this.$store.dispatch("getOptions", { keyword, type: "user" }).then(res => {
                    this.userOptions = res.result.map(cur => {
                        return {
                            label: cur.name,
                            value: cur._id + "&" + cur.name,
                            userId: cur.userId,
                        }
                    });;
                })
            } else {
                this.userOptions = [];
            }
        }, 500),
        codeChangeOther(code){
            this.form.type = code.matCode.type;
            this.form.supplier = code.matCode.supplier;
            this.form.description = code.matCode.description;
            if(code.matCode.type == "NA"){
                this.form.complete = true;
                this.form.completeView = "完成";
            }
        },
        addFile(row){
        //    this.fileList = row.log?[{name:path.basename(row.log.url),url:row.log.url}]:[];
            this.fileList = [];
            if(row.log){
                if(row.log.url){
                    if(row.log.url instanceof Array){
                        for(let i of row.log.url){
                            this.fileList.push({name:path.basename(i),response:{result:i}});
                        }
                    }else{
                        this.fileList.push({name:path.basename(row.log.url),response:{result:row.log.url}});
                    }
                }
            }
            this.form = _.assign({}, row);
            this.importFileView = true; 
        },
        importFile(){
            this.form.log={url:[]}; 
            if(this.fileList){
                for(let file of this.fileList){
                    this.form.log.url.push(file.response.result);
                }
            }
            this.SaveActionName = "editMaterials";
            this.submit();
            this.importFileView = false;
        },
        importFileSuccess(res,file,fileList){
            if (res.success) {
                this.fileList.push(file);
            }
        },
        addIns(row){
            this.form = row;
            this.form.insLog ="";
            if(this.form.log){
                if(row.log.ins){
                    for(let ins of row.log.ins){
                        this.form.insLog +=ins+"_";
                    }
                }
            }
            
            this.addInsView = true;
        },
        addInsLog(){
            this.$store.dispatch("addInsLog", this.form).then(
                res => {
                    this.$message.info("保存成功");
                    this.getList();
                    ths.addInsView = false;
                }, err => {
                    this.$message.error(err)
            });
           
        },
        updateType(){
            this.$store.dispatch("updateType").then(res => {
                    this.$alert("更新了"+res+"条数据");
                    this.getList(1);
                }, err => {
                    this.$alert(err);
                });
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
}

.tabletool {
    margin-bottom: 10px;
}

.tabletool button {
    float: right;
    margin-left: 20px;
}
</style>


                    