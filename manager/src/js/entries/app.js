"use strict";

import { authIgnorePath } from "../../config";
import Vue from "vue"
import store from "../vuex/store"
import vrs from "vuex-router-sync"
import router from "./router";
import VueSweetAlert from 'vue-sweetalert'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-default/index.css';
import "../../../node_modules/medium-editor/dist/css/medium-editor.min.css";
import "../../../node_modules/medium-editor/dist/css/themes/beagle.min.css";
/**
 * 同步router给store
 */
Vue.use(ElementUI);
Vue.use(VueSweetAlert);

router.beforeEach((to, from, next) => {
    store.commit("pageto", to.redirct || to.path);

    if (to.name == "login") {
        next()
        return;
    }
    store.dispatch("checkeLogin").then(function(data) {
        if (data) {
            next()
        } else {
            alert("请重新登录再执行此操作");
            router.replace({ name: "login" })
        }
    }).catch(err => {
        alert("请重新登录再执行此操作");
        router.replace({ name: "login" })
    })

});

new Vue({
    el: '#app',
    router,
    store,
    render: (el) => {
        return el("router-view");
    }
})