<template>
    <div>
        
        <el-menu theme="dark" :default-active="navpath" class="el-menu-demo" mode="horizontal" :router="true">
            <el-menu-item v-for='item in $store.state.common.menuList' :index="item.href">{{item.title}}</el-menu-item>
            <div class="userInfoToolbar">
                 <el-button type="danger" @click='logout'>退出登录</el-button>
            </div>
        </el-menu>
        <el-row class="tac">
            <el-col :span="4">
                <el-menu :default-active="$store.state.common.navpath" class="el-menu-vertical-demo" :router="true">
                    <el-menu-item v-for="item in $store.state.common.currentMenu.itemList" :index="item.href"><i class="el-icon-menu"></i>{{item.title}}</el-menu-item>
                </el-menu>
            </el-col>
            <el-col :span="20" class='content-side'>
                <transition name='fade'>
                    <router-view></router-view>
                </transition>
            </el-col>
        </el-row>
    </div>
</template>
<script>
    export default {
        computed:{
            navpath(){
                var menuList = this.$store.state.common.menuList;
                var originPath = this.$store.state.common.navpath;
                var ret = "";

                menuList.forEach(function(current){
                    if(originPath.split('/')[1].indexOf(current.href.slice(1))>-1){
                        ret = current.href;
                    }
                });
                
                return ret;
            }
        },
        methods:{
            pageto(key){
                this.$router.push(key)
            },
            logout(){
                this.$confirm('是否退出登录', '提示', {
                  confirmButtonText: '确定',
                  cancelButtonText: '取消',
                  type: 'warning'
                }).then(() => {
                    this.$store.dispatch("logout"); 
                    this.$router.replace("/login")
                }).catch(() => {

                });
            }
        },
        
        mounted(){
            this.$store.dispatch("getMenuConfig");
            this.$store.dispatch("getAuthList");
        }
    }

</script>
<style lang="sass" scoped>
.userInfoToolbar{
    float: right;
    margin-right: 10px;
    margin-top: 10px;
}
.tac{
    position: fixed;
    height:100%;
    width:100%;

}
.content-side {
    overflow-y: auto;
}
.tac .el-col,
.tac .el-menu.el-menu-vertical-demo{
    height:100%;
}
.fade-enter-active {
    transition: all .6s ease;
}
.fade-leave-active {
  transition: all 0.1s ease;
}
.fade-enter, .fade-leave-active {
  opacity: 0;
}
</style>