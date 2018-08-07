import { Url } from "../../../config.js";
import _ from "lodash";
import { getList } from "../../libs/query";

export default {
    state: {
        pageItemTotalCount: 0,
        confirmLogList: [],
        tableLoading: false,
        detail: {},
        detailvisiable: false,
        dialogFormVisible: false,
    },
    mutations: {
        loading(state, view) {
            state.tableLoading = view;
        },
        updateConfirmLogList(state, ret) {
            state.confirmLogList = ret.result;
            if (ret.hasOwnProperty("total")) {
                state.pageItemTotalCount = ret.total;
            }
        },
        viewConfirmLogDetail(state, view) {
            state.dialogFormVisible = view;
        }
    },
    actions: {
        getConfirmLogList({ commit }, data) {
            commit("loading", true);
            getList("confirmLog", {
                pageNo: data.pageNo,
                keyword: data.keyword,
                pageSize: data.pageSize,
            }).then(res => {
                commit("updateConfirmLogList", res);
                commit("loading", false);
            });
        },
    }
}
