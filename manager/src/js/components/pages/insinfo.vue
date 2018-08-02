<template>
    <div class='contentbox'>
        <el-row type='flex' style='margin-bottom:20px;' justify='space-between'>
            <el-col :span='8'>
                <div class="grid-content">
                    <el-input placeholder="搜索仪器信息名称..." v-model="serachContent" style="width: 300px;">
                        <el-button @click='getList(1)' slot="append" icon="search"></el-button>
                    </el-input>
                </div>
            </el-col>
            <el-col :span='4'>
                <div class="grid-content">
                    <el-select v-model="toConfirmStatus" @change='getList(1)' placeholder="导入状态" :loading="insCodeLoading">
                        <el-option label="全部" value="">
                        </el-option>
                        <el-option label="待我确认的仪器" value="toConfirmStatus">
                        </el-option>
                    </el-select>
                </div>
            </el-col>
            <el-col :span='12'>
                <div class="grid-content tabletool">
                    <el-button style='float:right;' v-if='dictEdit' @click='editcol' type="success">菜单设置</el-button>
                    <el-button style='float:right;' v-if='dictEdit' @click='create' type="success">新建</el-button>
                    <el-button style='float:right;' @click='importDialogView = true' v-if='dictEdit' type="primary">导入</el-button>
                    <el-button style='float:right;' @click='exportList' v-if='dictEdit' type="primary">导出</el-button>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span='24'>
                <el-table :data="dataList" v-loading.body="$store.state.insInfo.tableLoading" border style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column v-for='item in colList' :prop="item.fieldName" :label="item.fieldTitle" :width='item.width' :show-overflow-tooltip=true></el-table-column>
                    <el-table-column v-for='item in extendColList' :prop="item.fieldName" :label="item.fieldTitle" :width='item.width' :show-overflow-tooltip=true></el-table-column>
                    <el-table-column fixed="right" inline-template :context="_self" label="操作" width="380">
                        <span>
                            <el-button v-if='dictEdit' @click="edit(row)" type="success" size="small">编辑</el-button>
                            <el-button  @click="viewLog(row)" type="success" size="small">查看记录</el-button>
                               <el-button v-if='dictEdit' @click="delrow(row)" type="danger" size="small">删除</el-button>
                               <el-button v-if='superAdmin' @click="startTest(row)"  size="small">测试</el-button>
                               <el-button v-if='row.isInit&&canConfirmImport(row.keeper)' @click="confirmImport(row)"  size="small">确认导入</el-button>
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
                <el-pagination @size-change="listsizechange" @current-change="getList" :current-page.sync="pageNo" :page-sizes="[10,15,20]" :page-size="pageSize" layout="sizes, prev, pager, next" :total="$store.state.insInfo.pageItemTotalCount" style='margin-top:20px;height:100px;'>
                </el-pagination>
            </div>
        </el-row>
        <el-dialog :title="dialogTitle" size='small' v-model="$store.state.insInfo.dialogFormVisible" :modal-append-to-body='false'>
            <el-form :model="form">
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="仪器编号" label-width="80px">
                            <el-input v-model="form.code" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="仪器名称" label-width="80px">
                            <el-input v-model="form.name" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="仪器编码" label-width="80px">
                            <el-select v-model="form.insCode" filterable remote placeholder="编码" :remote-method="getInsCodeList" :loading="insCodeLoading">
                                <el-option v-for="item in insCodeOptions" :key='item.value' :label="item.label" :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="部门代码" label-width="80px">
                            <!-- <el-input v-model="form.depCode" auto-complete="off"></el-input> -->
                            <el-select v-model="form.depCode" filterable remote placeholder="部门代码" :remote-method="getDepCodeList" :loading="depLoading" @change="depChangeKeeper">
                                <el-option v-for="item in depOptions" :label="item.label" :key="item.value" :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="资产编号" label-width="80px">
                            <el-input v-model="form.assertNo" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="序号" label-width="80px">
                            <el-input v-model="form.No" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="规格" label-width="80px">
                            <el-input v-model="form.specification" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="型号" label-width="80px">
                            <el-input v-model="form.modelNo" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="校验日期" label-width="80px">
                            <el-date-picker @change="stateDateChange" type="date" placeholder="选择日期" v-model="form.startDate" :picker-options="pickerOption" style="width: 100%;"></el-date-picker>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="校验类别" label-width="80px">
                            <el-select v-model='form.testType' placeholder="请选择">
                                <el-option v-for="item in testTypeList" :label="item.label" :value="item.value"></el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="校验周期" label-width="80px">
                            <el-input style="width:45%;float:left;" v-model='form.period' @blur='stateDateChange' placeholder="请输入">
                            </el-input>
                            <el-select style="width:45%;float:left;" v-model='form.periodUnit' placeholder="请选择">
                                <el-option label="月" value="months">
                                </el-option>
                                <el-option label="周" value="weeks">
                                </el-option>
                                <el-option label="日" value="days">
                                </el-option>
                                <el-option label="年" value="years">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="仪器状态" label-width="80px">
                            <el-select v-model='form.status' placeholder="请选择">
                                <el-option v-for="item in $store.state.common.statusList" :label="item.label" :value="item.statusCode">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="到校日期" label-width="80px">
                            <el-input :disabled="true" v-model="currentEndDate" type='text' auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="保管人" label-width="80px">
                            <el-select v-model="form.keeper" filterable remote placeholder="保管人" :remote-method="getUserList" :loading="userLoading">
                                <el-option v-for="item in userOptions" :label="item.label" :key="item.value" :value="item.value">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-for='row of form.extendFieldsView'>
                    <el-col v-for='col in row' :span='11'>
                        <el-form-item :label="col.fieldTitle" label-width="80px">
                            <el-input v-model="col.userValue" type='text' auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-form-item label="描述" label-width="80px">
                        <el-input v-model="form.description" type='textarea' auto-complete="off"></el-input>
                    </el-form-item>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="hideDialog">取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="编辑扩展字段" size='small' v-model="addExtendView" :modal-append-to-body='false'>
            <el-form :model="addExtend">
                <el-form-item label="字段名称" label-width="80px">
                    <el-input v-model="addExtend.fieldTitle" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="字段值" label-width="80px">
                    <el-input v-model="addExtend.fieldName" auto-complete="off"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitExtend()">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="菜单设置" size='small' v-model="colEidtView" :modal-append-to-body='false'>
            <el-row>
                <el-checkbox v-for="col in colListSet" :label="col.fieldTitle" v-model='col.view' :key="col.view">{{col.fieldTitle}}</el-checkbox>
            </el-row>
            <el-row>
                <el-card class="box-card">
                    <div slot="header" class="clearfix">
                        <span style="line-height: 36px;">扩展列</span>
                        <el-button style="float: right;" @click='addExtendField' type="primary">新增</el-button>
                    </div>
                    <el-table :data="extendFieldsConfig" style="width: 100%">
                        <el-table-column prop="colIndex" label="序号">
                        </el-table-column>
                        <el-table-column prop="fieldTitle" label="列名称">
                        </el-table-column>
                        <el-table-column prop="fieldName" label="列字段">
                        </el-table-column>
                        <el-table-column inline-template :context="_self" label="操作" width="300">
                            <span>
                                <el-button v-if="row.index > 0" @click="moveUp(row.index);" type="success" size="small">上移</el-button>
                                <el-button v-if="row.view" @click="row.view = false; " type="danger" size="small">{{ "关闭显示" }}</el-button>
                                <el-button v-if="!row.view" @click="row.view=true; " type="success" size="small">{{ "显示" }}</el-button>
                                <el-button @click="editExtend(row);" type="success" size="small">编辑</el-button>
                               <el-button @click="delExtend(row)" type="danger" size="small">删除</el-button>
                            </span>
                        </el-table-column>
                    </el-table>
                </el-card>
            </el-row>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="saveColSet()">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="仪器日志" size='small' v-model="insLogView" :modal-append-to-body='false'>
            <el-row>
                <el-table :data="logList" style="width: 100%">
                    <el-table-column prop="createTime" label="检验时间">
                    </el-table-column>
                    <el-table-column prop="startStatus" label="起始状态">
                    </el-table-column>
                    <el-table-column prop="endStatus" label="目标状态">
                    </el-table-column>
                    <el-table-column prop="attachmentCount" label="附件数量">
                    </el-table-column>
                    <el-table-column inline-template :context="_self" label="操作" width="150">
                        <span>
                    <el-button @click="viewTestLog(row);" type="success" size="small">查看</el-button>
                  </span>
                    </el-table-column>
                </el-table>
            </el-row>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="insLogView=false">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="仪器日志" size='small' v-model="insLogDetailView" :modal-append-to-body='false'>
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
                <el-button type="primary" @click="insLogDetailView=false">确 定</el-button>
            </div>
        </el-dialog>
        <el-dialog title="导入设备信息" size='small' v-model="importDialogView" :modal-append-to-body='false'>
            <el-upload class="upload-demo" multiple drag action="/cig/uploadfile" :on-success='handleSuccess' :show-file-list="false">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text"><em>点击上传</em></div>
            </el-upload>
        </el-dialog>
    </div>
</template>
<script>
import _ from "lodash";
import { validateInsInfo } from "../../libs/validate.js";
import moment from "moment";
import path from "path";

export default {
    computed: {
        dataList() {
            return this.$store.state.insInfo.infolist.map((current) => {
                current.periodView = current.period + (function(unit) {
                    switch (unit) {
                        case "days":
                            return "天"
                            break;
                        case "months":
                            return "月"
                            break;
                        case "weeks":
                            return "周"
                            break;
                        case "years":
                            return "年"
                            break;
                        default:
                            return "";
                            break;
                    }
                })(current.periodUnit);
                if (current.depCode)
                    current.depCodeView = current.depCode;
                else
                    current.depCodeView = "";
                current.insCodeView = current.insCode.split("&")[1];

                current.endDate = moment(current.endDate).format("YYYY-MM-DD");
                current.startDate = moment(current.startDate).format("YYYY-MM-DD");

                current.testTypeView = (type => {
                    for (let item of this.testTypeList) {
                        if (item.value == type) {
                            return item.label;
                        }
                    }
                })(current.testType);
                // current.statusView = current.status;

                // current.extendFieldView = (list=>{
                //     let ret = "  ";
                //     for(let item of list){
                //         ret+=`${item.title}:${item.value} | `;
                //     }

                //     return ret.substr(ret,ret.length-2);
                // })(current.extendFields);
                // current.statusView = ((status)=>{
                //     for(let st of this.$store.state.common.statusList){
                //         if(st.statusCode == status){
                //             return st.label;
                //         }
                //     }

                //     return "";

                // })(current.status);

                current.statusView = ((list) => {
                    for (let item of list) {
                        let label;
                        let statusCode = current.toConfirm != "1" ? current.nextStatus : current.status;
                        if (item.statusCode == statusCode) {
                            label = item.label;

                            if (current.toConfirm != "1") {
                                label += "(待确认)";
                            }
                            return label;
                        }
                    }
                })(this.$store.state.common.statusList);
                return _.assign({}, current, current.extendFields);
            })
        },
        currentEndDate: function() {
            // try{
            let startDate = moment(this.form.startDate);
            let period = parseInt(this.form.period);
            let unit = this.form.periodUnit;
            let endDate = startDate.add(period, unit);
            return endDate.format("YYYY-MM-DD");
            // }catch(e){
            //     return "";
            // }
        },
        // depkeeper(){
        //     if(!this.form.depCode)
        //         return "";
        //     let strs = this.form.depCode.split("&");
        //     if(strs.length==4){
        //         return strs[3];
        //     }else{
        //         return "";
        //     }
        // },
        dictEdit() {
            return this.$store.state.common.userAuthList.indexOf("00007") > -1;
        },
        superAdmin() {
            return this.$store.state.common.userAuthList.indexOf("00000") > -1;
        }

    },
    data() {
        var self = this;
        return {
            toConfirmStatus: "",
            colList: [],
            pageSize: 10,
            extendColList: [],
            extendFieldsConfig: [],
            insLogView: false,
            insLogDetailView: false,
            logList: [],
            serachContent: "",
            dialogTitle: "新建模板集",
            // dataList: [],
            pageNo: 1,
            colEidtView: false,
            importDialogView: false,
            importFileId: "",
            form: {},
            type: "create",
            depLoading: false,
            userLoading: false,
            insCodeLoading: false,
            depOptions: [],
            addExtend: {},
            addExtendView: false,
            userOptions: [],
            insCodeOptions: [],
            colListSet: [],
            toPageNo: 1,
            testTypeList: [{
                value: "0",
                label: "内校"
            }, {
                value: "1",
                label: "外校"
            }, {
                value: "2",
                label: "免校"
            }],
            periodList: [{
                value: "0",
                label: "12"
            }],
            statusList: [{
                value: "0",
                label: "Test"
            }],
            pickerOption: {

            },
            addExtendFlag: false,
            authCheckAll: false,
            currentLog: {
                attachmentList: [],
                log: []
            },
        }
    },
    methods: {
        exportList() {
            this.$store.dispatch("exportInsList").then(res => {
                window.open(res);
            }, err => {
                this.$message.error("服务暂不可用");
            });
        },
        stateDateChange(value) {
            try {
                let startDate = moment(value);
                let period = parseInt(this.form.period);
                let unit = this.form.periodUnit;
                let endDate = startDate.add(period, unit);
                return endDate.format("YYYY-MM-DD");
            } catch (e) {
                return "";
            }
        },
        hideDialog() {
            this.$store.commit('viewInsInfoDetail', false);
        },
        getExtendFieldsView(extend) {
            let ret = [];
            let odd = 0;
            let row = [];


            for (let i = 0; i < this.extendFieldsConfig.length; i++) {
                let userValue;
                if (!!!extend) {
                    userValue = "";
                } else userValue = extend[this.extendFieldsConfig[i].fieldName];
                row.push(_.assign({},
                    this.extendFieldsConfig[i], {
                        userValue: userValue
                    }));
                if (row.length == 2) {
                    ret.push(row);
                    row = [];
                }
            }

            if (row.length > 0) {
                ret.push(row);
            }

            return ret;
        },
        listsizechange(val) {
            this.pageSize = val;
            this.getList(val);
        },
        edit(insInfo) {
            this.$store.commit("viewInsInfoDetail", true);
            this.dialogTitle = "编辑仪器信息";
            this.SaveActionName = "editInsInfo";
            this.depOptions = [{
                value: insInfo.depCode,
                label: insInfo.depCode
                // .split("&")[1]
            }]
            this.insCodeOptions = [{
                value: insInfo.insCode,
                label: insInfo.insCode.split("&")[1]
            }]
            if (insInfo.keeper)
                this.userOptions = [{
                    value: insInfo.keeper,
                    label: insInfo.keeper.split("&")[1]
                }]
            else this.userOptions = [];

            insInfo.extendFieldsView = this.getExtendFieldsView(insInfo.extendFields);
            this.form = _.assign({
                code: "",
                name: "",
                insCode: '',
                depCode: '',
                assertNo: "",
                No: "",
                specification: "",
                modelNo: "",
                startDate: "",
                testType: "",
                period: "",
                periodUnit: "days",
                status: "",
                endDate: "",
                keeper: "",
                description: "",
                extendFields: {},
                extendFieldsView: []
            }, insInfo);

        },
        importList() {

        },
        handleSuccess(res, file, fileList) {
            if (res.success) {
                this.$store.dispatch("importList", {
                    importFileId: res.result
                }).then(res => {
                    this.importDialogView = false;
                    this.$alert("导入成功");
                }, err => {
                    this.importDialogView = false;
                    this.$alert(err);
                });
            }
        },
        create() {
            this.$store.commit("viewInsInfoDetail", true);
            this.dialogTitle = "新建仪器信息";
            this.SaveActionName = "createInsInfo";
            this.form = {
                code: "",
                name: "",
                insCode: '',
                depCode: '',
                assertNo: "",
                No: "",
                specification: "",
                modelNo: "",
                startDate: "",
                testType: "",
                period: "",
                periodUnit: "days",
                status: "3",
                endDate: "",
                keeper: "",
                description: "",
                extendFields: [],
                extendFieldsView: [],
            }
        },
        getInsCodeList: _.throttle(function(keyword) {
            if (keyword) {
                this.$store.dispatch("getOptions", { keyword, type: "insCode" }).then(res => {
                    this.insCodeOptions = res.result.map(cur => {
                        return {
                            label: cur.name,
                            value: cur._id + "&" + cur.name
                        }
                    });
                });
            } else {
                this.insCodeOptions = [];
            }
        }, 800),
        getDepCodeList: _.throttle(function(keyword) {
            if (keyword) {
                this.$store.dispatch("getOptions", { keyword, type: "depInfo" }).then(res => {
                    this.depOptions = res.result.map(cur => {
                        return {
                            label: cur.name,
                            value: cur.name, //+"&"+cur.keeper
                            dep: cur
                        }
                    });;
                })
            } else {
                this.depOptions = [];
            }
        }, 800),
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
                this.userOptions = [];
            }
        }, 800),
        submit() {
            let obj = _.assign({}, this.form);

            obj.extendFields = (list => {
                let ret = {};
                for (let row of list) {
                    if (row && row.length) {
                        for (let col of row) {
                            ret[col.fieldName] = col.userValue;
                        }
                    }
                }
                return ret;
            })(obj.extendFieldsView)

            obj.startDate = moment(obj.startDate).format("YYYY-MM-DD HH:mm:ss");
            obj.endDate = moment(this.currentEndDate).format("YYYY-MM-DD HH:mm:ss");

            let ret = validateInsInfo(obj);
            if (ret != "") {
                this.$message.warn(ret);
            } else {
                this.$store.dispatch(this.SaveActionName, obj).then(() => {
                    this.$message.info("保存成功");
                    this.getList();
                }, err => {
                    this.$message.error("保存失败")
                });
            }
        },
        startTest(row) {
            this.$store.dispatch("startTest", row._id).then(() => {
                this.getList();
                this.$message.info("操作成功");
            }, errMsg => {
                this.$message.error(errMsg);
            });
        },
        delExtend(row) {
            for (var i = 0; i < this.extendFieldsConfig.length; i++) {
                if (this.extendFieldsConfig[i] === row) {
                    this.extendFieldsConfig.splice(i, 1);
                }
            }

            this.reIndex();
        },
        canConfirmImport(keeper) {
            if (keeper) {
                let ks = keeper.split("&")
                return ks[0] == this.$store.state.common.userInfo.id;
            }

            return false;
        },
        reIndex() {
            this.extendFieldsConfig = this.extendFieldsConfig.map((cur, index, array) => {
                cur.index = index;
                cur.colIndex = cur.index + 1;
                return cur;
            });
        },
        moveUp(index) {
            if (index > 0) {
                let editItem = this.extendFieldsConfig.splice(index, 1);
                this.extendFieldsConfig.splice(index - 1, 0, editItem.shift());

                this.reIndex();
            }
        },
        editExtend(row) {
            this.addExtend = row;
            this.addExtendView = true;
            this.addExtendFlag = false;
        },
        submitExtend() {
            this.addExtendView = false;
            if (this.addExtendFlag) {
                this.extendFieldsConfig.push(_.assign({ view: false }, this.addExtend));

                this.extendFieldsConfig = this.extendFieldsConfig.map((cur, index, array) => {
                    cur.index = index;
                    cur.colIndex = cur.index + 1;
                    return cur;
                });
            }
        },
        addExtendField() {
            this.addExtendFlag = true;
            this.addExtendView = true;
            this.addExtend = {
                title: "",
                value: "",
            }
        },
        editcol() {
            this.colEidtView = true;
        },
        search() {
            this.getList(1);
        },
        getList(page) {
            var self = this;
            this.pageNo = page || this.pageNo;
            this.$store.dispatch("getInsInfoList", {
                pageNo: this.pageNo - 1,
                keyword: this.serachContent,
                pageSize: this.pageSize,
                myConfirm: this.toConfirmStatus,
            });
        },
        saveColSet() {

            this.$store.dispatch("saveColListSet", {
                colList: this.colListSet,
                extendConfig: this.extendFieldsConfig
            }).then(() => {
                this.$message.info("保存成功");
                this.colEidtView = false;
                window.location.reload();
            }, err => {
                this.$message.error("保存失败");
                this.colEidtView = false;
            });
        },
        confirmImport(row) {
            this.$store.dispatch("confirmInit", row._id).then(() => {
                this.$message.info("保存成功");
                this.getList();
            }, err => {
                this.$message.error(err);
            });
        },
        viewLog(insInfo) {
            this.insLogView = true;
            this.$store.dispatch("getInsLog", insInfo._id).then(res => {
                this.logList = res.map(cur => {
                    cur.attachmentCount = (list => {
                        let total = 0;
                        for (let item of list) {
                            if (item.filePath && item.filePath.length) {
                                total += item.filePath.length
                            }
                        }
                        return total ? total : "";
                    })(cur.log);
                    // cur.startStatusView = ((status)=>{
                    //     for(let st of this.$store.state.common.statusList){
                    //         if(st.statusCode == status){
                    //             return st.label;
                    //         }
                    //     }

                    //     return "";

                    // })(cur.startStatus);

                    // cur.endStatusView = ((status)=>{
                    //     for(let st of this.$store.state.common.statusList){
                    //         if(st.statusCode == status){
                    //             return st.label;
                    //         }
                    //     }

                    //     return "";

                    // })(cur.endStatus);
                    return cur;
                });
            }, err => {
                this.$message.error("服务暂不可用");
            });
        },
        viewTestLog(log) {
            this.insLogDetailView = true;
            this.currentLog = log;
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
            })(log.log);
        },
        init() {
            this.$store.dispatch("getHeaderList").then(res => {
                this.colList = [];
                this.colListSet = res.listHeader.map(cur => {
                    if (cur.view === undefined) {
                        cur.view = false;
                    }

                    return cur;
                });

                // 处理扩展类的index 和 view字段
                res.extendListHeader = res.extendListHeader.map((cur, index, array) => {
                    if (cur.view === undefined) {
                        cur.view = false;
                    }

                    cur.index = cur.index || array.length;

                    return cur;
                })

                // 处理扩展类的index 字段为正常序列
                res.extendListHeader.sort(function(a, b) {
                    return a.index - b.index;
                });

                this.extendFieldsConfig = res.extendListHeader;

                this.reIndex();

                res.listHeader.forEach(cur => {
                    if (cur.view) {
                        this.colList.push(cur);
                    }
                });
                console.log(this.colList)

                this.extendFieldsConfig.forEach(cur => {
                    if (cur.view) {
                        this.extendColList.push(cur);
                    }
                });
                this.getList(1);
            }, err => {
                this.$message.error("服务暂不可用");
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
                    type: "insInfo",
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

                this.$store.dispatch("clearNone")

            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });

        },
        download(row) {
            window.open("/cig/downloadfile?path=" + row.path)
        },
        depChangeKeeper(depCode){
            for (let item of this.depOptions) {
                if (item.dep && item.dep.name === depCode) {
                     this.userOptions = [{
                        value: item.dep.keeper,
                        label: item.dep.keeper.split("&")[1]
                    }]
                    this.form.keeper = item.dep.keeper
                    
                }
            }
        }
    },
    mounted() {
        this.init();
    }
}
</script>
<style lang="sass" scoped>
.contentbox {
    padding: 15px;
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

.tabletool {
    margin-bottom: 10px;
}

.tabletool button {
    float: right;
    margin-left: 20px;
}
</style>