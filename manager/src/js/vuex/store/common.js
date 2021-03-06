import { Url } from "../../../config";
export default {
    state: {
        name: "ssj",
        count: 0,
        userId: "",
        userInfo: {},
        menuList: [],
        userAuthList: [],
        statusRule: [
            "2=>1",
            "1=>3",
            "3=>16",
            "8=>2",
            "1=>7",
            "7=>4",
            "7=>5",
            "7=>6",
            "7=>9",
            "7=>8",
            "7=>12",
            "7=>13",
            "7=>14",
            "7=>3",
            "7=>18",
            "7=>19",
            "7=>20",
            "3=>10",
            "3=>7",
            "10=>16",
            "10=>11",
            "11=>7",
            "11=>16",
            "11=>9",
            "11=>10",
            "16=>8",
            "3=>17",
            "17=>7",
            "17=>16",
        ],
        needProve: [
            /* "3=>16",
            "3=>7",
            "7=>4",
            "7=>5",
            "7=>6",
            "7=>8",
            "7=>9",
            "10=>16",
            "10=>7",
            "11=>7",
            "17=>16",
            "17=>7", */
            "16=>8",
            "7=>3",
            "7=>4",
            "7=>5",
            "7=>6",
            "7=>12",
            "7=>13",
            "7=>14",
            "7=>15",
            "7=>18",
            "7=>19",
            "7=>20",
        ],
        statusList: [{
            statusCode: "1",
            label: "待召回"
        }, {
            statusCode: "2",
            label: "正常使用"
        }, {
            statusCode: "3",
            label: "待校验"
        }, {
            statusCode: "4",
            label: "暂停使用"
        }, {
            statusCode: "5",
            label: "报废"
        }, {
            statusCode: "6",
            label: "功能失效"
        }, {
            statusCode: "7",
            label: "异常"
        }, {
            statusCode: "8",
            label: "校验完毕"
        }, {
            statusCode: "9",
            label: "免检仪器"
        }, {
            statusCode: "10",
            label: "外送中"
        }, {
            statusCode: "11",
            label: "外校已返厂"
        }, {
            statusCode: "12",
            label: "遗失"
        }, {
            statusCode: "13",
            label: "送修中"
        }, {
            statusCode: "14",
            label: "待维修"
        },{
            statusCode: "15",
            label: "限制使用"
        },{
            statusCode:"16",
            label:"检验合格"
        },{
            statusCode:"17",
            label:"厂校中"
        },{
            statusCode:"18",
            label:"退回客户"
        },{
            statusCode:"19",
            label:"退回厂商"
        },{
            statusCode:"20",
            label:"检验不合格"
        }],
        authList: [{
            name: "用户信息",
            code: "00001"
        }, {
            name: "仪器信息",
            code: "00002"
        }, {
            name: "科室信息",
            code: "00003"
        }, {
            name: "仪器代码",
            code: "00004"
        }, {
            name: "仪器列表",
            code: "00006"
        }, {
            name: "计量管理员",
            code: "00008"
        }, {
            name: "菜单设置",
            code: "00009"
        }, {
            name: "字典编辑(管理员)",
            code: "00007"
        }, {
            name: "超级管理员",
            code: "00000"
        }],
        currentMenu: {},
        navpath: "",
        menuAuthConfig: [],
        userInfo: {},
    },
    mutations: {
        pageto(state, page) {
            console.log("pageto:", page);

            state.menuList.forEach(function(current) {
                if (page.split('/').indexOf(current.href.slice(1)) > -1) {
                    state.currentMenu = current;
                }
            });

            state.navpath = page;
        },
        loginsuccess(state, userId) {
            state.userId = userId;
        },
        updateMenuList(state, list) {
            state.menuList = list;
            state.menuList.forEach(function(current) {
                if (window.location.href.split("#")[1].split('/').indexOf(current.href.slice(1)) > -1) {
                    state.currentMenu = current;
                }
            });
        },
        updateAuthList(state, list) {
            state.userAuthList = list;
        },
        updateUserInfo(state, res) {
            state.userInfo = res;
        }
    },
    actions: {
        pageto({ commit }, page) {
            commit("pageto", page)
        },
        getAuthList({ commit }) {
            $.ajax({
                url: Url.getAuthList,
                type: "POST",
                success(res) {
                    if (res.success) {
                        commit("updateAuthList", res.result);
                    }
                }
            })
        },
        checkeLogin({ commit }) {
            return new Promise((rs, rj) => {
                $.ajax({
                    url: Url.checkUserLogin,
                    type: "POST",
                    success(res) {
                        if (res && res.success) {
                            commit("updateUserInfo", res.data)
                            rs(true)
                        } else {
                            rs(false)
                        }
                    },
                    error() {
                        rj()
                    }
                })
            })
        },
        removeAttachFile({ commit }, { path, id }) {
            return new Promise((rs, rj) => {
                $.ajax({
                    url: Url.removeAttachFile,
                    type: "POST",
                    data: { path, id },
                    success(res) {
                        rs(res)
                    },
                    error() {
                        rj()
                    }
                })
            })
        },
        getMenuConfig({ commit }, userId) {
            $.ajax({
                url: Url.getMenuList,
                type: "POST",
                success(res) {
                    if (res.success) {
                        commit("updateMenuList", res.result);
                    }
                }
            })
        },
        login({ commit }, data) {
            return new Promise((rs, rj) => {
                $.ajax({
                    url: Url.login,
                    type: "POST",
                    data,
                    success(res) {
                        if (res.code < 2) {
                            rs(res.code);
                        } else {
                            rj(res.message)
                        }
                    }
                })

            });

        },
        clearNone() {
            return new Promise((rs, rj) => {
                $.ajax({
                    url: "/cig/clearNone",
                    type: "GET",
                    success(res) {
                        if (res.success) {
                            rs();
                        } else {
                            rj(res.message)
                        }
                    }
                })

            });
        },
        resetPassword({ commit }, data) {
            return new Promise((rs, rj) => {
                $.ajax({
                    url: Url.resetPassword,
                    type: "POST",
                    data,
                    success(res) {
                        if (res.success) {
                            rs();
                        } else {
                            rj(res.message)
                        }
                    }
                })

            });
        },
        startTest({ commit }, _id) {
            return new Promise((rs, rj) => {
                $.ajax({
                    url: "/cig/startTest",
                    type: "POST",
                    data: {
                        insId: _id
                    },
                    success(res) {
                        if (res.success) {
                            rs();
                        } else {
                            rj(res.message);
                        }
                    },
                    error(err) {
                        rj("服务暂不可用");
                    }
                })
            });

        }
    }
}