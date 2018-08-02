webpackJsonp([2,9],{

/***/ 102:
/***/ (function(module, exports, __webpack_require__) {

	/*
	  MIT License http://www.opensource.org/licenses/mit-license.php
	  Author Tobias Koppers @sokra
	  Modified by Evan You @yyx990803
	*/
	
	var hasDocument = typeof document !== 'undefined'
	
	if (true) {
	  if (!hasDocument) {
	    throw new Error(
	    'vue-style-loader cannot be used in a non-browser environment. ' +
	    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
	  ) }
	}
	
	var listToStyles = __webpack_require__(103)
	
	/*
	type StyleObject = {
	  id: number;
	  parts: Array<StyleObjectPart>
	}
	
	type StyleObjectPart = {
	  css: string;
	  media: string;
	  sourceMap: ?string
	}
	*/
	
	var stylesInDom = {/*
	  [id: number]: {
	    id: number,
	    refs: number,
	    parts: Array<(obj?: StyleObjectPart) => void>
	  }
	*/}
	
	var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
	var singletonElement = null
	var singletonCounter = 0
	var isProduction = false
	var noop = function () {}
	
	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())
	
	module.exports = function (parentId, list, _isProduction) {
	  isProduction = _isProduction
	
	  var styles = listToStyles(parentId, list)
	  addStylesToDom(styles)
	
	  return function update (newList) {
	    var mayRemove = []
	    for (var i = 0; i < styles.length; i++) {
	      var item = styles[i]
	      var domStyle = stylesInDom[item.id]
	      domStyle.refs--
	      mayRemove.push(domStyle)
	    }
	    if (newList) {
	      styles = listToStyles(parentId, newList)
	      addStylesToDom(styles)
	    } else {
	      styles = []
	    }
	    for (var i = 0; i < mayRemove.length; i++) {
	      var domStyle = mayRemove[i]
	      if (domStyle.refs === 0) {
	        for (var j = 0; j < domStyle.parts.length; j++) {
	          domStyle.parts[j]()
	        }
	        delete stylesInDom[domStyle.id]
	      }
	    }
	  }
	}
	
	function addStylesToDom (styles /* Array<StyleObject> */) {
	  for (var i = 0; i < styles.length; i++) {
	    var item = styles[i]
	    var domStyle = stylesInDom[item.id]
	    if (domStyle) {
	      domStyle.refs++
	      for (var j = 0; j < domStyle.parts.length; j++) {
	        domStyle.parts[j](item.parts[j])
	      }
	      for (; j < item.parts.length; j++) {
	        domStyle.parts.push(addStyle(item.parts[j]))
	      }
	      if (domStyle.parts.length > item.parts.length) {
	        domStyle.parts.length = item.parts.length
	      }
	    } else {
	      var parts = []
	      for (var j = 0; j < item.parts.length; j++) {
	        parts.push(addStyle(item.parts[j]))
	      }
	      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
	    }
	  }
	}
	
	function createStyleElement () {
	  var styleElement = document.createElement('style')
	  styleElement.type = 'text/css'
	  head.appendChild(styleElement)
	  return styleElement
	}
	
	function addStyle (obj /* StyleObjectPart */) {
	  var update, remove
	  var styleElement = document.querySelector('style[data-vue-ssr-id~="' + obj.id + '"]')
	
	  if (styleElement) {
	    if (isProduction) {
	      // has SSR styles and in production mode.
	      // simply do nothing.
	      return noop
	    } else {
	      // has SSR styles but in dev mode.
	      // for some reason Chrome can't handle source map in server-rendered
	      // style tags - source maps in <style> only works if the style tag is
	      // created and inserted dynamically. So we remove the server rendered
	      // styles and inject new ones.
	      styleElement.parentNode.removeChild(styleElement)
	    }
	  }
	
	  if (isOldIE) {
	    // use singleton mode for IE9.
	    var styleIndex = singletonCounter++
	    styleElement = singletonElement || (singletonElement = createStyleElement())
	    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
	    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
	  } else {
	    // use multi-style-tag mode in all other cases
	    styleElement = createStyleElement()
	    update = applyToTag.bind(null, styleElement)
	    remove = function () {
	      styleElement.parentNode.removeChild(styleElement)
	    }
	  }
	
	  update(obj)
	
	  return function updateStyle (newObj /* StyleObjectPart */) {
	    if (newObj) {
	      if (newObj.css === obj.css &&
	          newObj.media === obj.media &&
	          newObj.sourceMap === obj.sourceMap) {
	        return
	      }
	      update(obj = newObj)
	    } else {
	      remove()
	    }
	  }
	}
	
	var replaceText = (function () {
	  var textStore = []
	
	  return function (index, replacement) {
	    textStore[index] = replacement
	    return textStore.filter(Boolean).join('\n')
	  }
	})()
	
	function applyToSingletonTag (styleElement, index, remove, obj) {
	  var css = remove ? '' : obj.css
	
	  if (styleElement.styleSheet) {
	    styleElement.styleSheet.cssText = replaceText(index, css)
	  } else {
	    var cssNode = document.createTextNode(css)
	    var childNodes = styleElement.childNodes
	    if (childNodes[index]) styleElement.removeChild(childNodes[index])
	    if (childNodes.length) {
	      styleElement.insertBefore(cssNode, childNodes[index])
	    } else {
	      styleElement.appendChild(cssNode)
	    }
	  }
	}
	
	function applyToTag (styleElement, obj) {
	  var css = obj.css
	  var media = obj.media
	  var sourceMap = obj.sourceMap
	
	  if (media) {
	    styleElement.setAttribute('media', media)
	  }
	
	  if (sourceMap) {
	    // https://developer.chrome.com/devtools/docs/javascript-debugging
	    // this makes source maps inside style tags work properly in Chrome
	    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
	    // http://stackoverflow.com/a/26603875
	    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
	  }
	
	  if (styleElement.styleSheet) {
	    styleElement.styleSheet.cssText = css
	  } else {
	    while (styleElement.firstChild) {
	      styleElement.removeChild(styleElement.firstChild)
	    }
	    styleElement.appendChild(document.createTextNode(css))
	  }
	}


/***/ }),

/***/ 103:
/***/ (function(module, exports) {

	/**
	 * Translates the list format produced by css-loader into something
	 * easier to manipulate.
	 */
	module.exports = function listToStyles (parentId, list) {
	  var styles = []
	  var newStyles = {}
	  for (var i = 0; i < list.length; i++) {
	    var item = list[i]
	    var id = item[0]
	    var css = item[1]
	    var media = item[2]
	    var sourceMap = item[3]
	    var part = {
	      id: parentId + ':' + i,
	      css: css,
	      media: media,
	      sourceMap: sourceMap
	    }
	    if (!newStyles[id]) {
	      styles.push(newStyles[id] = { id: id, parts: [part] })
	    } else {
	      newStyles[id].parts.push(part)
	    }
	  }
	  return styles
	}


/***/ }),

/***/ 104:
/***/ (function(module, exports) {

	module.exports = function normalizeComponent (
	  rawScriptExports,
	  compiledTemplate,
	  scopeId,
	  cssModules
	) {
	  var esModule
	  var scriptExports = rawScriptExports = rawScriptExports || {}
	
	  // ES6 modules interop
	  var type = typeof rawScriptExports.default
	  if (type === 'object' || type === 'function') {
	    esModule = rawScriptExports
	    scriptExports = rawScriptExports.default
	  }
	
	  // Vue.extend constructor export interop
	  var options = typeof scriptExports === 'function'
	    ? scriptExports.options
	    : scriptExports
	
	  // render functions
	  if (compiledTemplate) {
	    options.render = compiledTemplate.render
	    options.staticRenderFns = compiledTemplate.staticRenderFns
	  }
	
	  // scopedId
	  if (scopeId) {
	    options._scopeId = scopeId
	  }
	
	  // inject cssModules
	  if (cssModules) {
	    var computed = options.computed || (options.computed = {})
	    Object.keys(cssModules).forEach(function (key) {
	      var module = cssModules[key]
	      computed[key] = function () { return module }
	    })
	  }
	
	  return {
	    esModule: esModule,
	    exports: scriptExports,
	    options: options
	  }
	}


/***/ }),

/***/ 107:
/***/ (function(module, exports, __webpack_require__) {

	
	/* styles */
	__webpack_require__(108)
	
	var Component = __webpack_require__(104)(
	  /* script */
	  __webpack_require__(110),
	  /* template */
	  __webpack_require__(111),
	  /* scopeId */
	  "data-v-fdfdb9f8",
	  /* cssModules */
	  null
	)
	Component.options.__file = "C:\\nodejsProject\\cig\\manager\\src\\js\\components\\pages\\manager.vue"
	if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
	if (Component.options.functional) {console.error("[vue-loader] manager.vue: functional components are not supported with templates, they should use render functions.")}
	
	/* hot reload */
	if (false) {(function () {
	  var hotAPI = require("vue-loader/node_modules/vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  module.hot.accept()
	  if (!module.hot.data) {
	    hotAPI.createRecord("data-v-fdfdb9f8", Component.options)
	  } else {
	    hotAPI.reload("data-v-fdfdb9f8", Component.options)
	  }
	})()}
	
	module.exports = Component.exports


/***/ }),

/***/ 108:
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(109);
	if(typeof content === 'string') content = [[module.id, content, '']];
	if(content.locals) module.exports = content.locals;
	// add the styles to the DOM
	var update = __webpack_require__(102)("b2ff6306", content, false);
	// Hot Module Replacement
	if(false) {
	 // When the styles change, update the <style> tags
	 if(!content.locals) {
	   module.hot.accept("!!../../../../node_modules/_css-loader@0.23.1@css-loader/index.js?sourceMap!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/style-rewriter.js?id=data-v-fdfdb9f8&scoped=true!../../../../node_modules/_sass-loader@3.2.3@sass-loader/index.js!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/selector.js?type=styles&index=0!./manager.vue", function() {
	     var newContent = require("!!../../../../node_modules/_css-loader@0.23.1@css-loader/index.js?sourceMap!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/style-rewriter.js?id=data-v-fdfdb9f8&scoped=true!../../../../node_modules/_sass-loader@3.2.3@sass-loader/index.js!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/selector.js?type=styles&index=0!./manager.vue");
	     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
	     update(newContent);
	   });
	 }
	 // When the module is disposed, remove the <style> tags
	 module.hot.dispose(function() { update(); });
	}

/***/ }),

/***/ 109:
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(100)();
	// imports
	
	
	// module
	exports.push([module.id, "\n.userInfoToolbar[data-v-fdfdb9f8] {\n  float: right;\n  margin-right: 10px;\n  margin-top: 10px;\n}\n.tac[data-v-fdfdb9f8] {\n  position: fixed;\n  height: 100%;\n  width: 100%;\n}\n.content-side[data-v-fdfdb9f8] {\n  overflow-y: auto;\n}\n.tac .el-col[data-v-fdfdb9f8],\n.tac .el-menu.el-menu-vertical-demo[data-v-fdfdb9f8] {\n  height: 100%;\n}\n.fade-enter-active[data-v-fdfdb9f8] {\n  transition: all .6s ease;\n}\n.fade-leave-active[data-v-fdfdb9f8] {\n  transition: all 0.1s ease;\n}\n.fade-enter[data-v-fdfdb9f8], .fade-leave-active[data-v-fdfdb9f8] {\n  opacity: 0;\n}\n", "", {"version":3,"sources":["/./src/js/components/pages/manager.vue"],"names":[],"mappings":";AAAA;EACE,aAAa;EACb,mBAAmB;EACnB,iBAAiB;CAAE;AAErB;EACE,gBAAgB;EAChB,aAAa;EACb,YAAY;CAAE;AAEhB;EACE,iBAAiB;CAAE;AAErB;;EAEE,aAAa;CAAE;AAEjB;EACE,yBAAyB;CAAE;AAE7B;EACE,0BAA0B;CAAE;AAE9B;EACE,WAAW;CAAE","file":"manager.vue","sourcesContent":[".userInfoToolbar {\n  float: right;\n  margin-right: 10px;\n  margin-top: 10px; }\n\n.tac {\n  position: fixed;\n  height: 100%;\n  width: 100%; }\n\n.content-side {\n  overflow-y: auto; }\n\n.tac .el-col,\n.tac .el-menu.el-menu-vertical-demo {\n  height: 100%; }\n\n.fade-enter-active {\n  transition: all .6s ease; }\n\n.fade-leave-active {\n  transition: all 0.1s ease; }\n\n.fade-enter, .fade-leave-active {\n  opacity: 0; }\n"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ }),

/***/ 110:
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	//
	
	exports.default = {
	    computed: {
	        navpath: function navpath() {
	            var menuList = this.$store.state.common.menuList;
	            var originPath = this.$store.state.common.navpath;
	            var ret = "";
	
	            menuList.forEach(function (current) {
	                if (originPath.split('/')[1].indexOf(current.href.slice(1)) > -1) {
	                    ret = current.href;
	                }
	            });
	
	            return ret;
	        }
	    },
	    methods: {
	        pageto: function pageto(key) {
	            this.$router.push(key);
	        },
	        logout: function logout() {
	            var _this = this;
	
	            this.$confirm('是否退出登录', '提示', {
	                confirmButtonText: '确定',
	                cancelButtonText: '取消',
	                type: 'warning'
	            }).then(function () {
	                _this.$store.dispatch("logout");
	                _this.$router.replace("/login");
	            }).catch(function () {});
	        }
	    },
	
	    mounted: function mounted() {
	        this.$store.dispatch("getMenuConfig");
	        this.$store.dispatch("getAuthList");
	    }
	};

/***/ }),

/***/ 111:
/***/ (function(module, exports, __webpack_require__) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
	  return _c('div', [_c('el-menu', {
	    staticClass: "el-menu-demo",
	    attrs: {
	      "theme": "dark",
	      "default-active": _vm.navpath,
	      "mode": "horizontal",
	      "router": true
	    }
	  }, [_vm._l((_vm.$store.state.common.menuList), function(item) {
	    return _c('el-menu-item', {
	      attrs: {
	        "index": item.href
	      }
	    }, [_vm._v(_vm._s(item.title))])
	  }), _vm._v(" "), _c('div', {
	    staticClass: "userInfoToolbar"
	  }, [_c('el-button', {
	    attrs: {
	      "type": "danger"
	    },
	    on: {
	      "click": _vm.logout
	    }
	  }, [_vm._v("退出登录")])], 1)], 2), _vm._v(" "), _c('el-row', {
	    staticClass: "tac"
	  }, [_c('el-col', {
	    attrs: {
	      "span": 4
	    }
	  }, [_c('el-menu', {
	    staticClass: "el-menu-vertical-demo",
	    attrs: {
	      "default-active": _vm.$store.state.common.navpath,
	      "router": true
	    }
	  }, _vm._l((_vm.$store.state.common.currentMenu.itemList), function(item) {
	    return _c('el-menu-item', {
	      attrs: {
	        "index": item.href
	      }
	    }, [_c('i', {
	      staticClass: "el-icon-menu"
	    }), _vm._v(_vm._s(item.title))])
	  }))], 1), _vm._v(" "), _c('el-col', {
	    staticClass: "content-side",
	    attrs: {
	      "span": 20
	    }
	  }, [_c('transition', {
	    attrs: {
	      "name": "fade"
	    }
	  }, [_c('router-view')], 1)], 1)], 1)], 1)
	},staticRenderFns: []}
	module.exports.render._withStripped = true
	if (false) {
	  module.hot.accept()
	  if (module.hot.data) {
	     require("vue-loader/node_modules/vue-hot-reload-api").rerender("data-v-fdfdb9f8", module.exports)
	  }
	}

/***/ })

});
//# sourceMappingURL=2.build.js.map