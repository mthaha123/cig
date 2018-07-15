import { Url } from "../../../config.js";
import _ from "lodash";
import { getList, save, update, remove, confirmInit, exportInsList, importInsList, getInsLog, getHeaderList, saveColListSet } from "../../libs/query";

export default {
    state: {
        pageItemTotalCount: 0,
        infolist: [],
        tableLoading: false,
        detail: {},
        detailvisiable: false,
        dialogFormVisible: false,

    },
    mutations: {
        updateInsInfoList(state, ret) {
            state.infolist = ret.result;
            if (ret.hasOwnProperty("total")) {
                state.pageItemTotalCount = ret.total;
            }
        },
        viewInsInfoDetail(state, view) {
            state.dialogFormVisible = view;
        }
    },
    actions: {
        getInsInfoList({ commit }, data) {
            commit("loading", true);
            getList("insInfo", {
                pageNo: data.pageNo,
                keyword: data.keyword,
                pageSize: data.pageSize,
                toConfirmStatus: data.myConfirm,
            }).then(res => {
                commit("updateInsInfoList", res);
                commit("loading", false);
            });
        },
        createInsInfo({ commit }, data) {
            return save("insInfo", data).then(res => {
                commit("viewInsInfoDetail", false);
            })
        },
        editInsInfo({ commit }, data) {
            return update("insInfo", data._id, data).then(res => {
                commit("viewInsInfoDetail", false);
            })
        },
        getOptions({ commit }, data) {
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
        getInsLog({ commit }, id) {
            return getInsLog(id);
        },
        importList({ commit }, { importFileId }) {
            return importInsList({
                importFileId
            });
        },
        exportInsList({ commit }) {
            return exportInsList();
        },
        getHeaderList() {
            return getHeaderList();
        },
        saveColListSet({ commit }, { colList, extendConfig }) {
            return saveColListSet(colList, extendConfig);
        },
        confirmInit({ commit }, id) {
            return confirmInit(id);
        },
        removeDict({ commit }, { type, id }) {
            return remove(type, id);
        }
    }
}