import { Url } from "../../config.js";
import _ from "lodash";

function wrap(url, obj) {
    return _.template(url)(obj);
}

export const confirmInit = id => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.confirmInit,
            type: "POST",
            data: {
                id
            },
            success(res) {
                if (res.success) {
                    rs(res.result)
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    });
}

export const exportInsList = () => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.exportInsList,
            type: "POST",
            success(res) {
                if (res.success) {
                    rs(res.result)
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    });
}

export const transferAuth = data => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.transferAuth,
            type: "POST",
            data,
            success(res) {
                if (res.success) {
                    rs()
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err)
            }
        });
    });
}

export const getInsLog = id => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.getInsLog,
            type: "POST",
            data: {
                id
            },
            success(res) {
                if (res.success) {
                    rs(res.result)
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    })
}

export const saveColListSet = (list, extendConfig) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.saveColListSet,
            type: "POST",
            data: {
                viewList: list,
                extendConfig
            },
            success(res) {
                if (res.success) {
                    rs()
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    })
}

export const getHeaderList = () => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.getHeaderList,
            type: "POST",
            success(res) {
                if (res.success) {
                    rs(res.result)
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    })
}
export const getMenuList = () => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.getMenuList,
            type: "POST",
            success(res) {
                if (res.success) {
                    rs(res.result)
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    })
}


export const resetUserOwnPassword = (userId, email) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.resetUserOwnPassword,
            type: "POST",
            data: {
                userId,
                email
            },
            success(res) {
                if (res.success) {
                    rs(res.result)
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    })
}

export const resetUserPassword = (userId) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.resetUserPassword,
            type: "POST",
            data: {
                userId,
            },
            success(res) {
                if (res.success) {
                    rs(res.result)
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    })
}

/**
 *  user 用户,
    insInfo 仪器信息,
    insCode 仪器code,
    dep 部门
 */
export const removeUploadedFile = (deletePath) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.removeFile,
            type: "POST",
            data: {
                deletePath
            },
            success(res) {
                if (res.success) {
                    rs(res.result)
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    })
}

export const updateUserInfoFromHRS = (deletePath) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.updateUserInfoFromHRS,
            type: "POST",
            success(res) {
                if (res.success) {
                    rs(res.result)
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    })
}

export const getDeviceByStatus = ({ pageNo, statusList, pageSize, keyword, forStatusList }) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: Url.getDeviceByStatus,
            type: "POST",
            data: {
                statusList,
                pageNo,
                pageSize,
                keyword,
                forStatusList,
            },
            success(res) {
                if (res.success) {
                    rs(res)
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    })
}

export const getList = (type, params) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: wrap(Url.getList, {
                type
            }),
            type: "GET",
            data: params,
            success(res) {
                if (res.success) {
                    rs(res);
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    });
}


export const getItem = (type, id) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: wrap(Url.getItem, {
                type,
                id
            }),
            type: "GET",
            success(res) {
                if (res.success) {
                    rs(res.data);
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    });
}

export const save = (type, item) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: wrap(Url.save, {
                type
            }),
            data: item,
            type: "POST",
            success(res) {
                if (res.success) {
                    rs(res.data);
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    });
}

export const update = (type, id, item) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: wrap(Url.update, {
                type,
                id
            }),
            data: item,
            type: "PATCH",
            success(res) {
                if (res.success) {
                    rs(true);
                } else {
                    rj(res.message)
                }
            },
            error(err) {
                rj(err.message)
            }
        });
    });
}

export const remove = (type, id) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: wrap(Url.delete, {
                type,
                id
            }),
            type: "DELETE",
            success(res) {
                if (res.success) {
                    rs(true);
                } else {
                    rj(res.message);
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    });
}



export const importReport = (data) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: wrap(Url.importReport),
            data,
            type: "POST",
            success(res) {
                if (res.success) {
                    rs();
                } else {
                    rj(res.message);
                }
            },
            error(err) {
                console.log(err.message);
                rj("服务暂不可用")
            }
        });
    });
}

export const importInsList = (data) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: wrap(Url.importInsList),
            data,
            type: "POST",
            success(res) {
                if (res.success) {
                    rs();
                } else {
                    rj(res.message);
                }
            },
            error(err) {
                console.log(err.message);
                rj("服务暂不可用")
            }
        });
    });
}

export const changeApplication = (data) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: wrap(Url.changeApplication, {
                id: data.id
            }),
            data: {
                to: data.to,
                note: data.note,
                filePath: data.filePath,
                confirmChain: data.confirmChain
            },
            type: "POST",
            success(res) {
                if (res.success) {
                    rs(true);
                } else {
                    rj(res.message);
                }
            },
            error(err) {
                console.log(err.message);
                rj("服务暂不可用")
            }
        });
    });
}

export const proveApplication = (data) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: wrap(Url.proveApplication, {
                id: data.id
            }),
            data: {
                note: data.note || "确认状态",
                filePath: data.filePath || []
            },
            type: "POST",
            success(res) {
                if (res.success) {
                    rs(true);
                } else {
                    rj(res.message);
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    });
}

export const rejectApplication = (data) => {
    return new Promise((rs, rj) => {
        $.ajax({
            url: wrap(Url.rejectApplication, {
                id: data.id
            }),
            data: {
                note: data.note || "否决状态",
                filePath: data.filePath || []
            },
            type: "POST",
            success(res) {
                if (res.success) {
                    rs(true);
                } else {
                    rj(res.message);
                }
            },
            error(err) {
                rj(err.message);
            }
        });
    });
}