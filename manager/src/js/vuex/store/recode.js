import { Url } from "../../../config.js";
import _ from "lodash";
import { getList,exportRecList } from "../../libs/query";

export default {
    state: {
        pageItemTotalCount: 0,
        recodeList: [],
        tableLoading: false,
        detail: {},
        detailvisiable: false,
        dialogFormVisible: false,
    },
    mutations: {
        loading(state, view) {
            state.tableLoading = view;
        },
        updateRecodeList(state, ret) {
            state.recodeList = ret.result;
            if (ret.hasOwnProperty("total")) {
                state.pageItemTotalCount = ret.total;
            }
        },
        viewRecodeDetail(state, view) {
            state.dialogFormVisible = view;
        }
    },
    actions: {
        getRecodeList({ commit }, data) {
            commit("loading", true);
            getList("recode", {
                pageNo: data.pageNo,
                keyword: data.keyword,
                pageSize: data.pageSize,
                hasReport:true,
                complete: true,
            }).then(res => {
                commit("updateRecodeList", res);
                commit("loading", false);
            });
        },
        exportRecodeList({ commit }) {
            return exportRecList();
        },
    }
}
