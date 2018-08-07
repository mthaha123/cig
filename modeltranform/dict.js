module.exports = {
    test:{
        keywordFields: ["insCode"],
    },
    confirmLog:{
        keywordFields:["insCode","insName","keeper","fromKeeper"],
    },
    supplier:{
        updateFields: ["name"],
        insertFields: ["name", "state"],
        keywordFields: ["name", "state"],
        uniqueList: ["name"],
    },
    insCode: {
        updateFields: ["name"],
        insertFields: ["code", "name"],
        keywordFields: ["code", "name"],
        uniqueList: ["code"],
    },
    user: {
        updateFields: ["name", "Email", "role", {
            name: "authList",
            type: Array,
            default: []
        }],
        insertFields: ["name", "Email", "role", "userId", {
            name: "authList",
            type: Array,
            default: []
        }],
        keywordFields: ["name", "userId"],
        uniqueList: ["userId"],
    },
    depInfo: {
        updateFields: ["name", "factory", "location", "keeper", "manager", 'staff', "proxer", 'seniorManager', 'generalManager'],
        insertFields: ["code", "name", "factory", "location", "keeper", "manager", 'staff', "proxer", 'seniorManager', 'generalManager'],
        keywordFields: ["name", "code"],
        uniqueList: ["code"],
    },
    insInfo: {
        updateFields: ["code", "name", "insCode", "depCode", "assertNo", "No", "specification", "modelNo", "startDate", "factoryLabel", "testType", "period", "periodUnit", "status", "keeper", "endDate", "description", "extendFields"],
        insertFields: ["code", "name", "insCode", "depCode", "assertNo", "No", "specification", "modelNo", "startDate", "factoryLabel", "testType", "period", "periodUnit", "status", "keeper", "endDate", "description", "extendFields"],
        keywordFields: ["name", "code","No","modelNo","depCode","insCode","keeper"],
        uniqueList: ["code"]
    },
    email: {
        updateFields: ["title", "content"],
        insertFields: ["name", "title", "content"],
        keywordFields: ["name"],
        uniqueList: ["name"]
    }
}