module.exports = {
    validateMaterials(){
        return "";
    },
    validateMatCode(){
        return "";
    },
    validateUser(user) {
        return "";
    },
    validateInsCode() {
        return "";
    },
    validateDepInfo(form) {
        if(!form.code){
            return "部门代码不能为空";
        };
        if(!form.name){
            return "部门名称不能为空";
        };
        if(!form.factory){
            return "厂区不能为空";
        };
        if(!form.location){
            return "位置不能为空";
        };
        if(!form.keeper){
            return "保管人不能为空";
        };
        if(!form.manager){
            return "主管不能为空";
        };
        if(!form.staff){
            return "文员不能为空";
        };
        if(!form.proxer){
            return "代理人不能为空";
        };
        if(!form.seniorManager){
            return "高阶主管不能为空";
        };
        if(!form.generalManager){
            return "最高主管不能为空";
        };
        
        return "";
    },
    validateInsInfo() {
        return "";
    },
    validateSupplier(){
        return "";
    }
}
