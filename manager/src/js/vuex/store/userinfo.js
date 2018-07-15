import { Url } from "../../../config.js";
import _ from "lodash";
import { getList, save, update, transferAuth, resetUserPassword, resetUserOwnPassword, updateUserInfoFromHRS } from "../../libs/query";

export default {
    state: {
        pageItemTotalCount: 0,
        userList: [],
        tableLoading: false,
        detail: {},
        detailvisiable: false,
        dialogFormVisible: false,
        roleList: [{
            value: "0",
            label: "Administrator"
        }, {
            value: "1",
            label: "EditUser"
        }, {
            value: "2",
            label: "Guest"
        }],
    },
    mutations: {
        loading(state, view) {
            state.tableLoading = view;
        },
        updateUserList(state, ret) {
            state.userList = ret.result;
            if (ret.hasOwnProperty("total")) {
                state.pageItemTotalCount = ret.total;
            }
        },
        viewUserDetail(state, view) {
            state.dialogFormVisible = view;
        }
    },
    actions: {
        getUserList({ commit }, data) {
            commit("loading", true);
            getList("user", {
                pageNo: data.pageNo,
                keyword: data.keyword,
                pageSize: data.pageSize,
            }).then(res => {
                commit("updateUserList", res);
                commit("loading", false);
            });
        },
        createUser({ commit }, data) {
            return save("user", data).then(res => {
                commit("viewUserDetail", false);
            })
        },
        resetOwnPwd({ commit }, { userId, email }) {
            return resetUserOwnPassword(userId, email);
        },
        transferAuth({ commit }, data) {
            return transferAuth(data);
        },
        editUser({ commit }, data) {
            return update("user", data._id, data).then(res => {
                commit("viewUserDetail", false);
            })
        },
        updateUserInfoFromHRS({ commit }) {
            return updateUserInfoFromHRS();
        },
        resetpwd({ commit }, userId) {
            return resetUserPassword(userId);
        }
    }
}