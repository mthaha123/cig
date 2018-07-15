import { Url } from "../../../config.js";
import _ from "lodash";
import { getList, save, update } from "../../libs/query";

export default {
    state: {
        pageItemTotalCount: 0,
        codeList: [],
        tableLoading: false,
        detail: {},
        detailvisiable: false,
        dialogFormVisible: false,
    },
    mutations: {
        loading(state, view) {
            state.tableLoading = view;
        },
        updateInsCodeList(state, ret) {
            state.codeList = ret.result;
            if (ret.hasOwnProperty("total")) {
                state.pageItemTotalCount = ret.total;
            }
        },
        viewInsCodeDetail(state, view) {
            state.dialogFormVisible = view;
        }
    },
    actions: {
        getInsCodeList({ commit }, data) {
            commit("loading", true);
            getList("insCode", {
                pageNo: data.pageNo,
                keyword: data.keyword,
                pageSize: data.pageSize,
            }).then(res => {
                commit("updateInsCodeList", res);
                commit("loading", false);
            });
        },
        createInsCode({ commit }, data) {
            return save("insCode", data).then(res => {
                commit("viewInsCodeDetail", false);
            })
        },
        editInsCode({ commit }, data) {
            return update("insCode", data._id, data).then(res => {
                commit("viewInsCodeDetail", false);
            })
        }
    }
}
