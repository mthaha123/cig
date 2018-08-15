import { Url } from "../../../config.js";
import _ from "lodash";
import { getList, save, update } from "../../libs/query";

export default {
    state: {
        pageItemTotalCount: 0,
        materialsList: [],
        tableLoading: false,
        detail: {},
        detailvisiable: false,
        dialogFormVisible: false,
    },
    mutations: {
        loading(state, view) {
            state.tableLoading = view;
        },
        updateMaterialsList(state, ret) {
            state.materialsList = ret.result;
            if (ret.hasOwnProperty("total")) {
                state.pageItemTotalCount = ret.total;
            }
        },
        viewMaterialsDetail(state, view) {
            state.dialogFormVisible = view;
        }
    },
    actions: {
        getMaterialsList({ commit }, data) {
            commit("loading", true);
            getList("materials", {
                pageNo: data.pageNo,
                keyword: data.keyword,
                pageSize: data.pageSize,
            }).then(res => {
                commit("updateMaterialsList", res);
                commit("loading", false);
            });
        },
        createMaterials({ commit }, data) {
            return save("materials", data).then(res => {
                commit("viewMaterialsDetail", false);
            })
        },
        editMaterials({ commit }, data) {
            return update("materials", data._id, data).then(res => {
                commit("viewMaterialsDetail", false);
            })
        },
        addInsLog({commit},data){
            return new Promise((rs, rj) => {
                $.ajax({
                    url: "/cig/materials/addInsLog",
                    data:{form:data},
                    type: "POST",
                    success(res) {
                        if (res.success) {
                            rs();
                        } else {
                            rj(res.message);
                        }
                    },
                    error(err) {
                        console.log(err.message);
                        rj("服务暂不可用")
                    }
                });
            });
        },
        getCodeOptions({ commit }, data) {
            return getList(data.type, {
                pageNo: data.pageNo,
                keyword: data.keyword
            }).then(res => {
                return res;
            }).catch(err => {
                console.warn(err);
                return [];
            })
        },
        importMaterialsList({ commit }, { importFileId }) {
            return new Promise((rs, rj) => {
                $.ajax({
                    url: "/cig/importMaterialsList",
                    data: {"importFileId":importFileId},
                    type: "POST",
                    success(res) {
                        if (res.success) {
                            rs();
                        } else {
                            rj(res.message);
                        }
                    },
                    error(err) {
                        console.log(err.message);
                        rj("服务暂不可用")
                    }
                });
            });
        },
        exportMaterialsList({ commit }) {
            return new Promise((rs, rj) => {
                $.ajax({
                    url: "/cig/exportMaterialsList",
                    type: "POST",
                    success(res) {
                        if (res.success) {
                            rs(res.result)
                        } else {
                            rj(res.message)
                        }
                    },
                    error(err) {
                        rj(err.message);
                    }
                });
            });
        },
    }
}
