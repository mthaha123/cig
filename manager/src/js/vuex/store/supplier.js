import { Url } from "../../../config.js";
import _ from "lodash";
import { getList, save, update } from "../../libs/query";

export default {
    state: {
        pageItemTotalCount: 0,
        supplierList: [],
        tableLoading: false,
        detail: {},
        detailvisiable: false,
        dialogFormVisible: false,
    },
    mutations: {
        loading(state, view) {
            state.tableLoading = view;
        },
        updateSupplierList(state, ret) {
            state.supplierList = ret.result;
            if (ret.hasOwnProperty("total")) {
                state.pageItemTotalCount = ret.total;
            }
        },
        viewSupplierDetail(state, view) {
            state.dialogFormVisible = view;
        }
    },
    actions: {
        getSupplierList({ commit }, data) {
            commit("loading", true);
            getList("supplier", {
                pageNo: data.pageNo,
                keyword: data.keyword,
                pageSize: data.pageSize,
            }).then(res => {
                commit("updateSupplierList", res);
                commit("loading", false);
            });
        },
        createSupplier({ commit }, data) {
            return save("supplier", data).then(res => {
                commit("viewSupplierDetail", false);
            })
        },
        editSupplier({ commit }, data) {
            return update("supplier", data._id, data).then(res => {
                commit("viewSupplierDetail", false);
            })
        }
    }
}
