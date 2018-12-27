<template>
    <div class='contentbox'>
        <el-row type='flex' style='margin-bottom:20px;' justify='space-between'>
            <el-col :span='8'>
                <div class="grid-content">
                    <el-input placeholder="搜索仪器编码..." v-model="serachContent" style="width: 300px;">
                        <el-button slot="append" @click='search' icon="search"></el-button>
                    </el-input>
                </div>
            </el-col>
            <el-col :span='6'>
                <el-select v-model="statusList" multiple placeholder="请选择">
                    <el-option label="待处理" value="toUserConfirm">
                    </el-option>
                    <el-option label="加签中" value="toConfirm">
                    </el-option>
                    <el-option label="流程待变更" value="toChange">
                    </el-option>
                </el-select>
            </el-col>
            <el-col :span='6'>
                <el-select v-model="forStatusList" multiple placeholder="请选择">
                    <el-option v-for='item in $store.state.common.statusList' :label="item.label" :value="item.statusCode">
                    </el-option>
                </el-select>
            </el-col>
            <el-col :span='4'>
                <div class="grid-content bg-purple">
                    <el-button style='float:right;margin-left:10px;' @click='getList(1)' type="success">查询</el-button>
                    <el-button style='float:right;' @click='currentImportList = [];importDialogView = true; ' type="danger">导入</el-button>
                </div>
            </el-col>
        </el-row>
        <el-row>
            <el-col :span='24'>
                <el-table :data="dataList" border style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column v-for='item in colList' :prop="item.fieldName" :label="item.fieldTitle" :width='item.width' :show-overflow-tooltip=true></el-table-column>
                    <el-table-column fixed="right" inline-template :context="_self" label="操作" width="100">
                        <span>
                        <el-button @click="edit(row)" type="success" size="small">处理</el-button>
                      </span>
                    </el-table-column>
                </el-table>
                <el-pagination @size-change="listsizechange" @current-change="getList" :current-page.sync="pageNo" :page-sizes="[10,15,20]" :page-size="pageSize" layout="sizes, prev, pager, next" :total="$store.state.insList.pageItemTotalCount" style='margin-top:20px;height:100px;'>
                </el-pagination>
            </el-col>
        </el-row>
        <el-dialog :title="dialogTitle" size='small' v-model="$store.state.insList.dialogFormVisible" :modal-append-to-body='false'>
            <el-form :model="form">
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="校验编号" label-width="80px">
                            <el-input v-model="form._id" disabled auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset="2">
                        <el-form-item label="仪器名称" label-width="80px">
                            <el-input v-model="form.insInfo.name" disabled auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="校验编号" label-width="80px">
                            <el-input v-model="form.code" disabled auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span='11'>
                        <el-form-item label="仪器状态" label-width="80px">
                            <el-input disabled v-model="form.statusView" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                    <el-col :span='11' :offset='2'>
                        <el-form-item label="转换状态" label-width="80px">
                            <el-select @change='changeStatus' :disabled='form.toConfirm != 1' v-model='form.nextDeviceStatus' placeholder="请选择">
                                <el-option v-for="item in targetStatusList" :label="item.label" :value="item.statusCode">
                                </el-option>
                            </el-select>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row v-if='needProve'>
                    <el-form-item label="审批链" label-width="80px">
                        <el-select :disabled=" form.toConfirm == '1'&& form.status != '7'&&form.status !='16' " v-model="form.confirmChain" multiple filterable remote placeholder="请选择" :remote-method="getUserList" :loading="userLoading">
                        <!-- <el-select :disabled="form.toConfirm != '1'||form.statusCode != '7'&&form.statusCode != '16'" v-model="form.confirmChain" multiple filterable remote placeholder="请选择" :remote-method="getUserList" :loading="userLoading"> -->
                            <el-option v-for="item in userOptions" :label="item.label" :key="item.value" :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-row>
                <el-row v-if='needProve'>
                    <el-form-item label="已审批" label-width="80px">
                        <el-select v-model="form.completeChain" disabled multiple filterable remote placeholder="请选择" :remote-method="getUserList" :loading="userLoading">
                            <el-option v-for="item in userOptions" :label="item.label" :key="item.value" :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                </el-row>
                <el-row>
                    <el-form-item label="描述" label-width="80px">
                        <el-input v-model="form.note" type='textarea' auto-complete="off" :rows="8"></el-input>
                    </el-form-item>
                </el-row>
                <el-row>
                    <el-form-item label="附件上传" label-width="80px">
                        <el-upload ref='uploadbox' action="/cig/uploadfile" :on-preview="handlePreview" :on-remove="handleRemove" :on-success='handleSuccess' :default-file-list="fileList">
                            <el-button size="small" type="primary">点击上传</el-button>
                        </el-upload>
                    </el-form-item>
                </el-row>
                <el-row>
                    <el-form-item label="操作记录" label-width="80px">
                        <el-table :data="form.log" style="width: 100%">
                            <el-table-column prop="time" label="操作日期">
                            </el-table-column>
                            <el-table-column prop="message" label="记录">
                            </el-table-column>
                            <el-table-column prop="note" label="备注">
                            </el-table-column>
                            <el-table-column prop="operator" label="操作人">
                            </el-table-column>
                        </el-table>
                    </el-form-item>
                </el-row>
                <el-row>
                    <el-form-item label="附件列表" label-width="80px">
                        <el-table :data="form.attachmentList" style="width: 100%">
                            <el-table-column type="index" width="55">
                            </el-table-column>
                            <el-table-column prop="name" label="名称">
                            </el-table-column>
                            <el-table-column inline-template :context="_self" label="操作" width="150">
                                <span>
                      <el-button @click="download(row)" type="success" size="small">下载</el-button>
                      <el-button @click="deleteFile(row,form._id)" type="danger" size="small">删除</el-button>
                    </span>
                            </el-table-column>
                        </el-table>
                    </el-form-item>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click='hideDialog'>取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
                <el-button type="primary" v-if="form.toConfirm != '1'" @click="reject">否 决</el-button>
            </div>
        </el-dialog>
        <el-dialog title="导入报告信息" size='small' v-model="importDialogView" :modal-append-to-body='false'>
            <el-upload class="upload-demo" drag multiple action="/cig/uploadfile" :on-success='handleReportSuccess' :show-file-list="false">
                <i class="el-icon-upload"></i>
                <div class="el-upload__text"><em>点击上传</em></div>
            </el-upload>
            <div class="">
                <ul>
                    <li v-for='item in currentImportList'>
                        {{item.path}} {{item.success?"上传成功":item.msg}}
                    </li>
                </ul>
            </div>
        </el-dialog>
    </div>
</template>
<script>
import _ from "lodash";
import path from "path";
import moment from "moment";

export default {
    data() {
        var self = this;
        return {
            pageNo: 1,
            pageSize: 10,
            needProve: false,
            totalCount: 1,
            serachContent: "",
            statusList: [],
            userLoading: false,
            importDialogView: false,
            colList: [],
            currentImportList: [],
            userOptions: [],
            form: {
                tostatus: "",
                insInfo: {},
                log: [],
                confirmChain: [],
                completeChain: [],
            },
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
            dialogTitle: "状态申请单",
            attachmentList: [],
            fileList: [],
            changlog: [],
            forStatusList: []
        }
    },
    computed: {
        targetStatusList() {
            if (this.form.toConfirm != "1")
                return this.$store.state.common.statusList;
            let totalList = this.$store.state.common.statusList;
            let statusRule = this.$store.state.common.statusRule;
            if (!!!this.form.deviceStatus) {
                return [];
            }
            let statusCode = this.form.toConfirm != "1" ? this.form.nextDeviceStatus : this.form.deviceStatus;

            let ret = [];
            for (let item of totalList) {
                let trule = `${statusCode}=>${item.statusCode}`;
                if (statusRule.indexOf(trule) > -1) {
                    ret.push(item);
                }
            }

            return ret;
        },
        dataList() {
            // return this.$store.state.insList.deviceStatusList.map(cur => {
            //     let ret = _.assign({}, cur);
            //     ret.depName = ret.insInfo.depCode;

            //     ret.statusName = ((list) => {
            //         for (let item of list) {
            //             let label;
            //             let statusCode = cur.toConfirm != "1" ? cur.nextDeviceStatus : cur.deviceStatus;
            //             if (item.statusCode == statusCode) {
            //                 label = item.label;

            //                 if (cur.toConfirm != "1") {
            //                     label += "(待确认)";
            //                 }
            //                 return label;
            //             }
            //         }
            //     })(this.$store.state.common.statusList);

            //     return ret;
            // });
            return this.$store.state.insList.deviceStatusList.map((originCurrent) => {
                let current = originCurrent.insInfo;
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
                return _.assign({}, current, originCurrent);
            })
        }
    },
    methods: {
        handlePreview() {

        },
        changeStatus(value) {
            // if(this.$store.state.common.needProve.indexOf(this.form.deviceStatus+"=>"+value)>-1){
            //     this.needProve= true;
            // }

        },
        listsizechange(val) {
            this.pageSize = val;
            this.getList(1);
        },

        handleRemove(file, fileList) {
            let key = (function(dict) {
                for (let key in dict) {
                    if (key == file.uid) {
                        return key;
                    }
                }
            })(this.form.uploadFileList);

            this.$store.dispatch("removeUploadedFile", { deletePath: this.form.uploadFileList[key] });
            delete this.form.uploadFileList[key];
        },
        handleSuccess(res, file, fileList) {
            if (res.success) {
                this.form.uploadFileList = this.form.uploadFileList || {};
                let obj = {};
                this.form.uploadFileList[file.uid] = res.result;
            }
            console.log(file, fileList)
        },
        handleReportSuccess(res, file, fileList) {
            if (res.success) {
                let path = res.result;
                this.$store.dispatch("importReport", {
                    importFileId: res.result
                }).then(res => {
                    this.$message.info("导入成功");
                    // this.importDialogView = false;
                    console.log({
                        path: path,
                        success: true
                    })
                    this.currentImportList.push({
                        path: path,
                        success: true
                    })
                    // this.getList();

                }, err => {
                    this.currentImportList.push({
                        path: "",
                        msg: err
                    })
                    // this.$message.error(err);
                });
            }
        },
        handleError() {

        },
        hideDialog() {
            this.$store.commit('viewApplication', false);
        },
        getList(page) {
            var self = this;
            this.pageNo = page || this.pageNo;
            this.$store.dispatch("getAllDeviceInsInfoList", {
                pageNo: this.pageNo - 1,
                statusList: this.statusList || [],
                forStatusList: this.forStatusList || [],
                pageSize: this.pageSize,
                keyword: this.serachContent,
            });
        },
        refresh() {
            this.getList();
        },
        edit(insInfo) {
            this.form = insInfo;
            this.form.uploadFileList = {};
            this.needProve = insInfo.toConfirm != "1" || true;

            // if (insInfo.toConfirm == "1") {
            //     this.form.completeChain = [];
            //     this.form.confirmChain = [];
            // }

            this.form.attachmentList = (function(list) {
                let retArray = [];
                list.forEach(cur => {
                    if (cur.filePath && cur.filePath.length && cur.filePath instanceof Array) {
                        retArray = retArray.concat(cur.filePath.map(function(cf) {
                            return {
                                name: path.basename(cf),
                                path: cf
                            }
                        }));
                    }
                });

                return retArray;

            })(insInfo.log);

            if (insInfo.confirmChain && insInfo.confirmChain.length) {
                this.userOptions = insInfo.confirmChain.map(cur => {
                    let str = cur.split("&");
                    return {
                        label: str[1],
                        value: cur
                    }
                })
            }

            this.$store.commit("viewApplication", true);
        },
        search() {
            this.getList(1);
        },
        submit() {
            let needProve = this.$store.state.common.needProve;
            if (this.form.confirmChain.length == 0) {
                if (needProve.indexOf(`${this.form.deviceStatus}=>${this.form.nextDeviceStatus}`) > -1) {
                    this.$message.error("该状态转换需要增加审批链");
                    return;
                }
            }

            if (this.form.toConfirm != "1") {
                let list = []
                for (let key in this.form.uploadFileList) {
                    list.push(this.form.uploadFileList[key]);
                }
                this.$store.dispatch("proveApplication", {
                    filePath: list,
                    note: this.form.note,
                    _id: this.form._id
                }).then(() => {
                    this.getList()
                }, err => {
                    this.$message.error(err);
                })
            } else {
                let list = []
                for (let key in this.form.uploadFileList) {
                    list.push(this.form.uploadFileList[key]);
                }
                this.$store.dispatch("changeApplication", {
                    filePath: list,
                    note: this.form.note,
                    confirmChain: this.form.confirmChain,
                    to: this.form.nextDeviceStatus,
                    _id: this.form._id
                }).then(() => {
                    this.getList()
                }, err => {
                    alert(err);
                })
            }

        },
        reject() {
            let list = []
            for (let key in this.form.uploadFileList) {
                list.push(this.form.uploadFileList[key]);
            }
            this.$store.dispatch("rejectApplication", {
                filePath: list,
                note: this.form.note,
                _id: this.form._id
            }).then(() => {
                this.getList()
            }, err => {
                this.$message.error(err);
            });
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
        download(row) {
            window.open("/cig/downloadfile?path=" + row.path)
        },
        deleteFile(row, id) {
            let self = this;
            this.$confirm("此操作讲删除该附件，是否确认删除？", "提示").then(() => {
                this.$store.dispatch("removeAttachFile", { path: row.path, id }).then(res => {
                    if (res.success) {
                        self.form = Object.assign({}, self.form, {
                            attachmentList: self.form.attachmentList.filter(function(cur) {
                                return cur.path != row.path;
                            })
                        })

                        self.getList()
                    }
                })
            }, () => {

            })
        },
        init() {
            this.$store.dispatch("getHeaderList").then(res => {
                this.colList = [];

                res.listHeader.forEach(cur => {
                    if (cur.view) {
                        this.colList.push(cur);
                    }
                });
                console.log(this.colList)

                this.getList(1);
            }, err => {
                this.$message.error("服务暂不可用");
            });
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

.tabletool {
    margin-bottom: 10px;
}

.tabletool button {
    float: right;
}
</style>