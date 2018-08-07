webpackJsonp([1,12],{

/***/ 100:
/***/ (function(module, exports, __webpack_require__) {

	
	/* styles */
	__webpack_require__(101)
	
	var Component = __webpack_require__(107)(
	  /* script */
	  __webpack_require__(108),
	  /* template */
	  __webpack_require__(109),
	  /* scopeId */
	  "data-v-fdd6ef00",
	  /* cssModules */
	  null
	)
	Component.options.__file = "C:\\nodejsProject\\cig\\manager\\src\\js\\components\\pages\\login.vue"
	if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
	if (Component.options.functional) {console.error("[vue-loader] login.vue: functional components are not supported with templates, they should use render functions.")}
	
	/* hot reload */
	if (false) {(function () {
	  var hotAPI = require("vue-loader/node_modules/vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  module.hot.accept()
	  if (!module.hot.data) {
	    hotAPI.createRecord("data-v-fdd6ef00", Component.options)
	  } else {
	    hotAPI.reload("data-v-fdd6ef00", Component.options)
	  }
	})()}
	
	module.exports = Component.exports


/***/ }),

/***/ 101:
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(102);
	if(typeof content === 'string') content = [[module.id, content, '']];
	if(content.locals) module.exports = content.locals;
	// add the styles to the DOM
	var update = __webpack_require__(105)("e8500296", content, false);
	// Hot Module Replacement
	if(false) {
	 // When the styles change, update the <style> tags
	 if(!content.locals) {
	   module.hot.accept("!!../../../../node_modules/_css-loader@0.23.1@css-loader/index.js?sourceMap!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/style-rewriter.js?id=data-v-fdd6ef00&scoped=true!../../../../node_modules/_sass-loader@3.2.3@sass-loader/index.js!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/selector.js?type=styles&index=0!./login.vue", function() {
	     var newContent = require("!!../../../../node_modules/_css-loader@0.23.1@css-loader/index.js?sourceMap!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/style-rewriter.js?id=data-v-fdd6ef00&scoped=true!../../../../node_modules/_sass-loader@3.2.3@sass-loader/index.js!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/selector.js?type=styles&index=0!./login.vue");
	     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
	     update(newContent);
	   });
	 }
	 // When the module is disposed, remove the <style> tags
	 module.hot.dispose(function() { update(); });
	}

/***/ }),

/***/ 102:
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(103)();
	// imports
	
	
	// module
	exports.push([module.id, "\n.bg[data-v-fdd6ef00] {\n  background: url(" + __webpack_require__(104) + ") no-repeat center center;\n  background-size: 1920px 1080px;\n  height: 100%;\n}\n.box-card[data-v-fdd6ef00] {\n  width: 300px;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate3d(-50%, -50%, 0);\n}\nfieldset[data-v-fdd6ef00] {\n  padding: 5px 20px;\n  margin: 0 2px;\n}\n#forgot[data-v-fdd6ef00] {\n  float: right;\n}\nlegend[data-v-fdd6ef00] {\n  display: block;\n  width: 40%;\n  margin-bottom: 20px;\n  font-size: 15px;\n  line-height: inherit;\n  color: #333;\n  border: 1px;\n  border-bottom: 0;\n  margin-left: 20px;\n}\n.label-header[data-v-fdd6ef00] {\n  padding: 5px;\n}\nfieldset.question[data-v-fdd6ef00] {\n  border: 1px solid #d5d5d5;\n}\n.container-table[data-v-fdd6ef00] {\n  min-height: 873px;\n}\n.container-table[data-v-fdd6ef00] {\n  display: table;\n}\n.vertical-center-row[data-v-fdd6ef00] {\n  display: table-cell;\n  vertical-align: middle;\n}\n.labletitle[data-v-fdd6ef00] {\n  text-align: left;\n}\n.mg1[data-v-fdd6ef00] {\n  margin: 10px 0px;\n}\n", "", {"version":3,"sources":["/./src/js/components/pages/login.vue"],"names":[],"mappings":";AAAA;EACE,kEAAuE;EACvE,+BAA+B;EAC/B,aAAa;CAAE;AAEjB;EACE,aAAa;EACb,mBAAmB;EACnB,SAAS;EACT,UAAU;EACV,sCAAsC;CAAE;AAE1C;EACE,kBAAkB;EAClB,cAAc;CAAE;AAElB;EACE,aAAa;CAAE;AAEjB;EACE,eAAe;EACf,WAAW;EACX,oBAAoB;EACpB,gBAAgB;EAChB,qBAAqB;EACrB,YAAY;EACZ,YAAY;EACZ,iBAAiB;EACjB,kBAAkB;CAAE;AAEtB;EACE,aAAa;CAAE;AAEjB;EACE,0BAA0B;CAAE;AAE9B;EACE,kBAAkB;CAAE;AAEtB;EACE,eAAe;CAAE;AAEnB;EACE,oBAAoB;EACpB,uBAAuB;CAAE;AAE3B;EACE,iBAAiB;CAAE;AAErB;EACE,iBAAiB;CAAE","file":"login.vue","sourcesContent":[".bg {\n  background: url(\"../../../images/loginbg.jpg\") no-repeat center center;\n  background-size: 1920px 1080px;\n  height: 100%; }\n\n.box-card {\n  width: 300px;\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate3d(-50%, -50%, 0); }\n\nfieldset {\n  padding: 5px 20px;\n  margin: 0 2px; }\n\n#forgot {\n  float: right; }\n\nlegend {\n  display: block;\n  width: 40%;\n  margin-bottom: 20px;\n  font-size: 15px;\n  line-height: inherit;\n  color: #333;\n  border: 1px;\n  border-bottom: 0;\n  margin-left: 20px; }\n\n.label-header {\n  padding: 5px; }\n\nfieldset.question {\n  border: 1px solid #d5d5d5; }\n\n.container-table {\n  min-height: 873px; }\n\n.container-table {\n  display: table; }\n\n.vertical-center-row {\n  display: table-cell;\n  vertical-align: middle; }\n\n.labletitle {\n  text-align: left; }\n\n.mg1 {\n  margin: 10px 0px; }\n"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ }),

/***/ 104:
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__.p + "images/ae805e72e08a5dba715287732b92029d.jpg";

/***/ }),

/***/ 105:
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
	
	var listToStyles = __webpack_require__(106)
	
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

/***/ 106:
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

/***/ 107:
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

/***/ 108:
/***/ (function(module, exports) {

	"use strict";
	
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
	    data: function data() {
	        return {
	            username: "",
	            password: "",
	            loginview: true,
	            newpassword: "",
	            passwordconfirm: "",
	            resetView: false,
	            resetform: {}
	        };
	    },
	
	    methods: {
	        login: function login() {
	            var _this = this;
	
	            this.$store.dispatch("login", {
	                username: this.username,
	                password: this.password
	            }).then(function (isFirstLogin) {
	                if (isFirstLogin) {
	                    _this.passwordconfirm = "";
	                    _this.newpassword = "";
	                    _this.loginview = false;
	                } else {
	                    _this.$router.push("/manager");
	                }
	            }, function (err) {
	                _this.$message.error(err);
	            });
	        },
	        resetPwd: function resetPwd() {
	            this.resetView = true;
	        },
	        submitReset: function submitReset() {
	            var _this2 = this;
	
	            this.$store.dispatch("resetOwnPwd", this.resetform).then(function (data) {
	                _this2.resetView = false;
	                _this2.resetform = {
	                    userId: "",
	                    email: ""
	                };
	                alert("密码已重置，请登录邮箱查收");
	            }).catch(function (err) {
	                alert("密码重置失败," + err.toString());
	            });
	        },
	        modifypassword: function modifypassword() {
	            var _this3 = this;
	
	            if (this.newpassword.length < 6) {
	                this.$message.error("密码最少6位");
	                return;
	            }
	
	            if (this.passwordconfirm != this.newpassword) {
	                this.$message.error("两次密码不一致");
	            } else {
	                this.$store.dispatch("resetPassword", {
	                    password: this.newpassword
	                }).then(function () {
	                    _this3.$router.push("/manager");
	                }, function (err) {
	                    _this3.$message.error(err);
	                });
	            }
	        }
	    }
	};

/***/ }),

/***/ 109:
/***/ (function(module, exports, __webpack_require__) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
	  return _c('div', {
	    staticClass: "bg"
	  }, [(_vm.loginview) ? _c('el-card', {
	    staticClass: "box-card"
	  }, [_c('div', {
	    staticClass: "clearfix",
	    attrs: {
	      "slot": "header"
	    },
	    slot: "header"
	  }, [_c('span', {
	    staticStyle: {
	      "line-height": "36px"
	    }
	  }, [_vm._v("CIG仪器管理系统")])]), _vm._v(" "), _c('div', {
	    staticClass: "text item"
	  }, [_c('el-form', {
	    ref: "form",
	    attrs: {
	      "label-width": "80px"
	    }
	  }, [_c('el-form-item', {
	    attrs: {
	      "label": "用户名"
	    }
	  }, [_c('el-input', {
	    attrs: {
	      "required": ""
	    },
	    model: {
	      value: (_vm.username),
	      callback: function($$v) {
	        _vm.username = $$v
	      },
	      expression: "username"
	    }
	  })], 1), _vm._v(" "), _c('el-form-item', {
	    attrs: {
	      "label": "密码"
	    }
	  }, [_c('el-input', {
	    attrs: {
	      "type": "password"
	    },
	    model: {
	      value: (_vm.password),
	      callback: function($$v) {
	        _vm.password = $$v
	      },
	      expression: "password"
	    }
	  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
	    attrs: {
	      "type": "primary"
	    },
	    on: {
	      "click": _vm.login
	    }
	  }, [_vm._v("登陆")])], 1), _vm._v(" "), _c('el-form-item', [_c('a', {
	    attrs: {
	      "id": "forgot"
	    },
	    on: {
	      "click": _vm.resetPwd
	    }
	  }, [_vm._v("忘记密码")])])], 1)], 1)]) : _vm._e(), _vm._v(" "), (!_vm.loginview) ? _c('el-card', {
	    staticClass: "box-card"
	  }, [_c('div', {
	    staticClass: "clearfix",
	    attrs: {
	      "slot": "header"
	    },
	    slot: "header"
	  }, [_c('span', {
	    staticStyle: {
	      "line-height": "36px"
	    }
	  }, [_vm._v("密码重置（首次登陆）")])]), _vm._v(" "), _c('div', {
	    staticClass: "text item"
	  }, [_c('el-form', {
	    ref: "form",
	    attrs: {
	      "label-width": "80px"
	    }
	  }, [_c('el-form-item', {
	    attrs: {
	      "label": "密码"
	    }
	  }, [_c('el-input', {
	    attrs: {
	      "required": "",
	      "type": "password"
	    },
	    model: {
	      value: (_vm.newpassword),
	      callback: function($$v) {
	        _vm.newpassword = $$v
	      },
	      expression: "newpassword"
	    }
	  })], 1), _vm._v(" "), _c('el-form-item', {
	    attrs: {
	      "label": "确认密码"
	    }
	  }, [_c('el-input', {
	    attrs: {
	      "type": "password"
	    },
	    model: {
	      value: (_vm.passwordconfirm),
	      callback: function($$v) {
	        _vm.passwordconfirm = $$v
	      },
	      expression: "passwordconfirm"
	    }
	  })], 1), _vm._v(" "), _c('el-form-item', [_c('el-button', {
	    attrs: {
	      "type": "primary"
	    },
	    on: {
	      "click": _vm.modifypassword
	    }
	  }, [_vm._v("修改")])], 1)], 1)], 1)]) : _vm._e(), _vm._v(" "), _c('el-dialog', {
	    attrs: {
	      "title": _vm.dialogTitle,
	      "size": "tiny"
	    },
	    model: {
	      value: (_vm.resetView),
	      callback: function($$v) {
	        _vm.resetView = $$v
	      },
	      expression: "resetView"
	    }
	  }, [_c('el-form', {
	    attrs: {
	      "model": _vm.resetform
	    }
	  }, [_c('el-form-item', {
	    attrs: {
	      "label": "用户名",
	      "label-width": "80px"
	    }
	  }, [_c('el-input', {
	    attrs: {
	      "auto-complete": "off"
	    },
	    model: {
	      value: (_vm.resetform.userId),
	      callback: function($$v) {
	        _vm.$set(_vm.resetform, "userId", $$v)
	      },
	      expression: "resetform.userId"
	    }
	  })], 1), _vm._v(" "), _c('el-form-item', {
	    attrs: {
	      "label": "邮箱",
	      "label-width": "80px"
	    }
	  }, [_c('el-input', {
	    attrs: {
	      "auto-complete": "off"
	    },
	    model: {
	      value: (_vm.resetform.email),
	      callback: function($$v) {
	        _vm.$set(_vm.resetform, "email", $$v)
	      },
	      expression: "resetform.email"
	    }
	  })], 1)], 1), _vm._v(" "), _c('div', {
	    staticClass: "dialog-footer",
	    attrs: {
	      "slot": "footer"
	    },
	    slot: "footer"
	  }, [_c('el-button', {
	    on: {
	      "click": function($event) {
	        _vm.resetView = false
	      }
	    }
	  }, [_vm._v("取 消")]), _vm._v(" "), _c('el-button', {
	    attrs: {
	      "type": "primary"
	    },
	    on: {
	      "click": _vm.submitReset
	    }
	  }, [_vm._v("确 定")])], 1)], 1)], 1)
	},staticRenderFns: []}
	module.exports.render._withStripped = true
	if (false) {
	  module.hot.accept()
	  if (module.hot.data) {
	     require("vue-loader/node_modules/vue-hot-reload-api").rerender("data-v-fdd6ef00", module.exports)
	  }
	}

/***/ })

});
//# sourceMappingURL=1.build.js.map