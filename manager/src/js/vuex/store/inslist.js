import { Url } from "../../../config.js";
import _ from "lodash";
import { getDeviceByStatus, rejectApplication, importReport, removeUploadedFile, changeApplication, proveApplication } from "../../libs/query.js";

export default {
    state: {
        pageItemTotalCount: 0,
        deviceStatusList: [],
        tableLoading: false,
        dialogFormVisible: false,
    },
    mutations: {
        loading(state, view) {
            state.tableLoading = view;
        },
        updateStatusList(state, ret) {
            state.deviceStatusList = ret.result;
            if (ret.hasOwnProperty("total")) {
                state.pageItemTotalCount = ret.total;
            }
        },
        viewApplication(state, view) {
            state.dialogFormVisible = view;
        }
    },
    actions: {
        getAllDeviceInsInfoList({ commit }, data) {
            commit("loading", true);

            getDeviceByStatus({
                keyword: data.keyword,
                pageNo: data.pageNo,
                statusList: data.statusList,
                pageSize: data.pageSize,
                forStatusList: data.forStatusList,
            }).then(res => {
                commit("updateStatusList", res);
                commit("loading", false);
            }, err => {
                commit("loading", false);
            });
        },
        removeUploadedFile({ commit }, data) {
            removeUploadedFile(data.deletePath).then(res => {

            }, err => {

            })
        },
        changeApplication({ commit }, data) {
            return changeApplication({
                id: data._id,
                to: data.to,
                note: data.note,
                filePath: data.filePath,
                confirmChain: data.confirmChain
            }).then(res => {
                commit("viewApplication", false);
            })
        },
        proveApplication({ commit }, data) {
            return proveApplication({
                id: data._id,
                note: data.note,
                filePath: data.filePath
            }).then(res => {
                commit("viewApplication", false);
            })
        },
        rejectApplication({ commit }, data) {
            return rejectApplication({
                id: data._id,
                note: data.note,
                filePath: data.filePath
            }).then(res => {
                commit("viewApplication", false);
            })
        },
        importReport({ commit }, { importFileId }) {
            return importReport({
                importFileId
            });
        }
    }
}
