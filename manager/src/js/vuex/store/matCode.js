import { Url } from "../../../config.js";
import _ from "lodash";
import { getList, save, update } from "../../libs/query";

export default {
    state: {
        pageItemTotalCount: 0,
        matCodeList: [],
        tableLoading: false,
        detail: {},
        detailvisiable: false,
        dialogFormVisible: false,
    },
    mutations: {
        loading(state, view) {
            state.tableLoading = view;
        },
        updateMatCodeList(state, ret) {
            state.matCodeList = ret.result;
            if (ret.hasOwnProperty("total")) {
                state.pageItemTotalCount = ret.total;
            }
        },
        viewMatCodeDetail(state, view) {
            state.dialogFormVisible = view;
        }
    },
    actions: {
        getMatCodeList({ commit }, data) {
            commit("loading", true);
            getList("matCode", {
                pageNo: data.pageNo,
                keyword: data.keyword,
                pageSize: data.pageSize,
            }).then(res => {
                commit("updateMatCodeList", res);
                commit("loading", false);
            });
        },
        createMatCode({ commit }, data) {
            return save("matCode", data).then(res => {
                commit("viewMatCodeDetail", false);
            })
        },
        editMatCode({ commit }, data) {
            return update("matCode", data._id, data).then(res => {
                commit("viewMatCodeDetail", false);
            })
        },
        importMatCodeList({ commit }, { importFileId }) {
            return new Promise((rs, rj) => {
                $.ajax({
                    url: "/cig/importMatCodeList",
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
        exportMatCodeList({ commit }) {
            return new Promise((rs, rj) => {
                $.ajax({
                    url: "/cig/exportMatCodeList",
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
