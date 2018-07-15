import { Url } from "../../../config.js";
import _ from "lodash";
import { getList,save,update } from "../../libs/query";

export default {
    state: {
        pageItemTotalCount: 0,
        depList: [],
        tableLoading: false,
        userSearchList: [],
        userSearchLoading: false,
        dialogFormVisible: false,
    },
    mutations: {
        updateDepList(state, ret) {
            state.depList = ret.result;
            if (ret.hasOwnProperty("total")) {
                state.pageItemTotalCount = ret.total;
            }
        },
        loading(state, view) {
            state.tableLoading = view;
        },
        viewDepDetail(state, view) {
            state.dialogFormVisible = view;
        }
    },
    actions: {
        getDepList({ commit }, data) {
            commit("loading", true);
            getList("depInfo", {
                pageNo: data.pageNo,
                keyword: data.keyword,
            }).then(res => {
                commit("updateDepList", res);
                commit("loading", false);
            });
        },
        createDep({ commit }, data) {
            return save("depInfo", data).then(res => {
                commit("viewDepDetail", false);
            })
        },
        editDep({ commit }, data) {
            return update("depInfo", data._id, data).then(res => {
                commit("viewDepDetail", false);
            })
        }
    }
}
