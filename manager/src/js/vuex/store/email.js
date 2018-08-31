import { Url } from "../../../config.js";
import _ from "lodash";
import { getList, save, update } from "../../libs/query";

export default {
    state: {
        pageItemTotalCount: 0,
        EmailList: [],
        tableLoading: false,
        userSearchList: [],
        userSearchLoading: false,
        dialogFormVisible: false,
    },
    mutations: {
        updateEmailList(state, data) {
            state.EmailList = data.result;
            if (data.hasOwnProperty("total")) {
                state.pageItemTotalCount = data.total;
            }
        },
        loading(state, view) {
            state.tableLoading = view;
        },
        viewEmailDetail(state, view) {
            state.dialogFormVisible = view;
        }
    },
    actions: {
        getEmailList({ commit }, data) {
            commit("loading", true);
            getList("email", {
                pageNo: data.pageNo,
                keyword: data.keyword,
                pageSize: data.pageSize,
            }).then(res => {
                commit("updateEmailList", res);
                commit("loading", false);
            });
        },
        createEmail({ commit }, data) {
            return save("email", data).then(res => {
                commit("viewEmailDetail", false);
            })
        },
        editEmail({ commit }, data) {
            return update("email", data._id, data).then(res => {
                commit("viewEmailDetail", false);
            })
        }
    }
}