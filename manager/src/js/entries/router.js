import Vue from "vue"
import VueRouter from "vue-router"

Vue.use(VueRouter);

const routes = [{
    path: '/login',
    name: 'login',
    component(resolve) {
        require(['../components/pages/login.vue'], resolve);
    }
}, {
    path: '/manager',
    name: "manager",
    // redirect: "/manager/userinfo",
    component(resolve) {
        require(['../components/pages/manager.vue'], resolve);
    },
    children: [{
        path: 'userinfo',
        name: 'userinfo',
        component(resolve) {
            require(['../components/pages/userinfo.vue'], resolve);
        },
    }, {
        path: 'insinfo',
        name: 'insinfo',
        component(resolve) {
            require(['../components/pages/insinfo.vue'], resolve);
        },
    }, {
        path: 'depinfo',
        name: 'depinfo',
        component(resolve) {
            require(['../components/pages/depinfo.vue'], resolve);
        },
    }, {
        path: 'inscode',
        name: 'inscode',
        component(resolve) {
            require(['../components/pages/inscode.vue'], resolve);
        },
    }, {
        path: "email",
        name: "email",
        component(resolve) {
            require(['../components/pages/email.vue'], resolve);
        }
    },{
        path: "supplier",
        name: "supplier",
        component(resolve){
            require(['../components/pages/supplier.vue'],resolve);
        }
    },{
        path: "recode",
        name: "recode",
        component(resolve){
            require(['../components/pages/recode.vue'],resolve);
        }
    },{
        path: "confirmLog",
        name: "confirmLog",
        component(resolve){
            require(['../components/pages/confirmLog.vue'],resolve);
        }
    },{
        path: "matCode",
        name: "matCode",
        component(resolve){
            require(['../components/pages/matCode.vue'],resolve);
        }
    },{
        path: "materials",
        name: "materials",
        component(resolve){
            require(['../components/pages/materials.vue'],resolve);
        }
    }]
}, {
    path: '/application',
    name: "application",
    redirect: "/application/insList",
    component(resolve) {
        require(['../components/pages/manager.vue'], resolve);
    },
    children: [{
        path: 'insList',
        name: 'insList',
        component(resolve) {
            require(['../components/pages/inslist.vue'], resolve);
        },
    }]
}, {
    path: "*",
    redirect: "/login"
}]

var router = new VueRouter({
    routes
});


export default router;
