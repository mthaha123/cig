<template>
    <div class='contentbox'>
        <el-row>
            <el-col :span='24'>
                <el-table :data="dataList" v-loading.body="$store.state.email.tableLoading" border style="width: 100%">
                    <el-table-column type="index" width="55">
                    </el-table-column>
                    <el-table-column prop="name" label="名称" width="250">
                    </el-table-column>
                    <el-table-column prop="title" label="邮件抬头">
                    </el-table-column>
                    <el-table-column inline-template :context="_self" label="操作" width="200">
                        <span>
                       <el-button @click="edit(row)" type="success" size="small">编辑</el-button>
                      </span>
                    </el-table-column>
                </el-table>
            </el-col>
        </el-row>
        <el-dialog :title="dialogTitle" size='large' v-model="$store.state.email.dialogFormVisible" :modal-append-to-body='false'>
            <el-form :model="form">
                <el-row>
                    <el-col>
                        <el-form-item label="名称" style='max-width: 400px;' label-width="80px">
                            <el-input v-model="form.name" auto-complete="off"></el-input>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-row>
                    <el-card class="box-card">
                        <div slot="header" class="clearfix">
                            <el-row>
                                <el-col :span='8'>
                                    <el-input v-model="form.title" placeholder="邮件抬头" auto-complete="off"></el-input>
                                </el-col>
                            </el-row>
                        </div>
                        <div class="text item">
                        </div>
                    </el-card>
                </el-row>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click="hideDialog">取 消</el-button>
                <el-button type="primary" @click="submit">确 定</el-button>
            </div>
        </el-dialog>
        <input type="text" v-model='title'>
        <el-button @click="save(row)" type="success" size="small">保存</el-button>
        <div ref='editor' id="editor">
        </div>
    </div>
</template>
<script>
import _ from "lodash";
import { validateDepInfo } from "../../libs/validate.js";

export default {
    computed: {
        dataList() {
            return this.$store.state.email.EmailList.map((current) => {
                return current;
            });
        }
    },
    data() {
        var self = this;
        return {
            serachContent: "",
            dialogTitle: "新建模板集",
            dataList: [],
            pageNo: 1,
            title: "",
            text: "",
            editor: {},
            current: {},
            form: {
                content: ""
            },
            type: "create",
        }
    },
    methods: {
        applyTextEdit: function(text) {
            this.form.content = text;
            this.text = text;
        },
        hideDialog() {
            this.$store.commit('viewEmailDetail', false);
        },
        edit(insInfo) {
            this.current = insInfo;
            this.title = insInfo.title.toString();
            this.editor.txt.html(insInfo.content);
        },
        submit() {

            this.$store.dispatch("editEmail", {
                name: current.name,
                title: this.title,
                content: this.editor.txt.html(),
                _id: current._id,
            }).then(res => {
                this.$message.info("保存成功")
                this.getList(1);
            }, err => {
                this.$message.error("保存失败")
            });

        },
        search() {
            console.log("search")
            this.getList(1);
        },
        save() {
            this.$store.dispatch("editEmail", {
                name: this.current.name,
                title: this.title,
                content: this.editor.txt.html(),
                _id: this.current._id,
            }).then(res => {
                this.$message.info("保存成功")
                this.getList(1);
            }, err => {
                this.$message.error("保存失败")
            });
        },
        getList(page) {
            var self = this;
            this.pageNo = page;
            this.$store.dispatch("getEmailList", {
                pageNo: page - 1,
                keyword: this.serachContent
            });
        },
    },
    mounted() {
        this.getList(1);
        var E = window.wangEditor
        this.editor = new E('#editor')
        this.editor.create()
    },
    components: {

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