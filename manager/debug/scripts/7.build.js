webpackJsonp([7,14],{

/***/ 107:
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
	
	var listToStyles = __webpack_require__(108)
	
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

/***/ 108:
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

/***/ 109:
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

/***/ 124:
/***/ (function(module, exports) {

	"use strict";
	
	module.exports = {
	    validateMaterials: function validateMaterials() {
	        return "";
	    },
	    validateMatCode: function validateMatCode() {
	        return "";
	    },
	    validateUser: function validateUser(user) {
	        return "";
	    },
	    validateInsCode: function validateInsCode() {
	        return "";
	    },
	    validateDepInfo: function validateDepInfo(form) {
	        if (!form.code) {
	            return "部门代码不能为空";
	        };
	        if (!form.name) {
	            return "部门名称不能为空";
	        };
	        if (!form.factory) {
	            return "厂区不能为空";
	        };
	        if (!form.location) {
	            return "位置不能为空";
	        };
	        if (!form.keeper) {
	            return "保管人不能为空";
	        };
	        if (!form.manager) {
	            return "主管不能为空";
	        };
	        if (!form.staff) {
	            return "文员不能为空";
	        };
	        if (!form.proxer) {
	            return "代理人不能为空";
	        };
	        if (!form.seniorManager) {
	            return "高阶主管不能为空";
	        };
	        if (!form.generalManager) {
	            return "最高主管不能为空";
	        };
	
	        return "";
	    },
	    validateInsInfo: function validateInsInfo() {
	        return "";
	    },
	    validateSupplier: function validateSupplier() {
	        return "";
	    }
	};

/***/ }),

/***/ 270:
/***/ (function(module, exports, __webpack_require__) {

	
	/* styles */
	__webpack_require__(271)
	
	var Component = __webpack_require__(109)(
	  /* script */
	  __webpack_require__(273),
	  /* template */
	  __webpack_require__(274),
	  /* scopeId */
	  "data-v-65f19333",
	  /* cssModules */
	  null
	)
	Component.options.__file = "C:\\nodejsProject\\cig\\manager\\src\\js\\components\\pages\\email.vue"
	if (Component.esModule && Object.keys(Component.esModule).some(function (key) {return key !== "default" && key !== "__esModule"})) {console.error("named exports are not supported in *.vue files.")}
	if (Component.options.functional) {console.error("[vue-loader] email.vue: functional components are not supported with templates, they should use render functions.")}
	
	/* hot reload */
	if (false) {(function () {
	  var hotAPI = require("vue-loader/node_modules/vue-hot-reload-api")
	  hotAPI.install(require("vue"), false)
	  if (!hotAPI.compatible) return
	  module.hot.accept()
	  if (!module.hot.data) {
	    hotAPI.createRecord("data-v-65f19333", Component.options)
	  } else {
	    hotAPI.reload("data-v-65f19333", Component.options)
	  }
	})()}
	
	module.exports = Component.exports


/***/ }),

/***/ 271:
/***/ (function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag
	
	// load the styles
	var content = __webpack_require__(272);
	if(typeof content === 'string') content = [[module.id, content, '']];
	if(content.locals) module.exports = content.locals;
	// add the styles to the DOM
	var update = __webpack_require__(107)("9840c2a2", content, false);
	// Hot Module Replacement
	if(false) {
	 // When the styles change, update the <style> tags
	 if(!content.locals) {
	   module.hot.accept("!!../../../../node_modules/_css-loader@0.23.1@css-loader/index.js?sourceMap!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/style-rewriter.js?id=data-v-65f19333&scoped=true!../../../../node_modules/_sass-loader@3.2.3@sass-loader/index.js!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/selector.js?type=styles&index=0!./email.vue", function() {
	     var newContent = require("!!../../../../node_modules/_css-loader@0.23.1@css-loader/index.js?sourceMap!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/style-rewriter.js?id=data-v-65f19333&scoped=true!../../../../node_modules/_sass-loader@3.2.3@sass-loader/index.js!../../../../node_modules/_vue-loader@10.3.0@vue-loader/lib/selector.js?type=styles&index=0!./email.vue");
	     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
	     update(newContent);
	   });
	 }
	 // When the module is disposed, remove the <style> tags
	 module.hot.dispose(function() { update(); });
	}

/***/ }),

/***/ 272:
/***/ (function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(105)();
	// imports
	
	
	// module
	exports.push([module.id, "\n.contentbox[data-v-65f19333] {\n  padding: 15px;\n}\n.tabletool[data-v-65f19333] {\n  margin-bottom: 10px;\n}\n.tabletool button[data-v-65f19333] {\n  float: right;\n  margin-left: 20px;\n}\n", "", {"version":3,"sources":["/./src/js/components/pages/email.vue"],"names":[],"mappings":";AAAA;EACE,cAAc;CAAE;AAElB;EACE,oBAAoB;CAAE;AAExB;EACE,aAAa;EACb,kBAAkB;CAAE","file":"email.vue","sourcesContent":[".contentbox {\n  padding: 15px; }\n\n.tabletool {\n  margin-bottom: 10px; }\n\n.tabletool button {\n  float: right;\n  margin-left: 20px; }\n"],"sourceRoot":"webpack://"}]);
	
	// exports


/***/ }),

/***/ 273:
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _lodash = __webpack_require__(86);
	
	var _lodash2 = _interopRequireDefault(_lodash);
	
	var _validate = __webpack_require__(124);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
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
	    computed: {
	        dataList: function dataList() {
	            return this.$store.state.email.EmailList.map(function (current) {
	                return current;
	            });
	        }
	    },
	    data: function data() {
	        var self = this;
	        return {
	            serachContent: "",
	            dialogTitle: "新建模板集",
	            // dataList: [],
	            pageNo: 1,
	            pageSize: 10,
	            title: "",
	            text: "",
	            editor: {},
	            current: {},
	            form: {
	                content: ""
	            },
	            type: "create"
	        };
	    },
	
	    methods: {
	        applyTextEdit: function applyTextEdit(text) {
	            this.form.content = text;
	            this.text = text;
	        },
	        hideDialog: function hideDialog() {
	            this.$store.commit('viewEmailDetail', false);
	        },
	        edit: function edit(insInfo) {
	            this.current = insInfo;
	            this.title = insInfo.title.toString();
	            this.editor.txt.html(insInfo.content);
	        },
	        listsizechange: function listsizechange(val) {
	            this.pageSize = val;
	            this.getList(1);
	        },
	        submit: function submit() {
	            var _this = this;
	
	            this.$store.dispatch("editEmail", {
	                name: current.name,
	                title: this.title,
	                content: this.editor.txt.html(),
	                _id: current._id
	            }).then(function (res) {
	                _this.$message.info("保存成功");
	                _this.getList(1);
	            }, function (err) {
	                _this.$message.error("保存失败");
	            });
	        },
	        search: function search() {
	            console.log("search");
	            this.getList(1);
	        },
	        save: function save() {
	            var _this2 = this;
	
	            this.$store.dispatch("editEmail", {
	                name: this.current.name,
	                title: this.title,
	                content: this.editor.txt.html(),
	                _id: this.current._id
	            }).then(function (res) {
	                _this2.$message.info("保存成功");
	                _this2.getList(1);
	            }, function (err) {
	                _this2.$message.error("保存失败");
	            });
	        },
	        getList: function getList(page) {
	            var self = this;
	            this.pageNo = page;
	            this.$store.dispatch("getEmailList", {
	                pageNo: page - 1,
	                keyword: this.serachContent,
	                pageSize: this.pageSize
	            });
	        }
	    },
	    mounted: function mounted() {
	        this.getList(1);
	        var E = window.wangEditor;
	        this.editor = new E('#editor');
	        this.editor.create();
	    },
	
	    components: {}
	};

/***/ }),

/***/ 274:
/***/ (function(module, exports, __webpack_require__) {

	module.exports={render:function (){var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
	  return _c('div', {
	    staticClass: "contentbox"
	  }, [_c('el-row', [_c('el-col', {
	    attrs: {
	      "span": 24
	    }
	  }, [_c('el-table', {
	    directives: [{
	      name: "loading",
	      rawName: "v-loading.body",
	      value: (_vm.$store.state.email.tableLoading),
	      expression: "$store.state.email.tableLoading",
	      modifiers: {
	        "body": true
	      }
	    }],
	    staticStyle: {
	      "width": "100%"
	    },
	    attrs: {
	      "data": _vm.dataList,
	      "border": ""
	    }
	  }, [_c('el-table-column', {
	    attrs: {
	      "type": "index",
	      "width": "55"
	    }
	  }), _vm._v(" "), _c('el-table-column', {
	    attrs: {
	      "prop": "name",
	      "label": "名称",
	      "width": "250"
	    }
	  }), _vm._v(" "), _c('el-table-column', {
	    attrs: {
	      "prop": "title",
	      "label": "邮件抬头"
	    }
	  }), _vm._v(" "), _c('el-table-column', {
	    attrs: {
	      "context": _vm._self,
	      "label": "操作",
	      "width": "200"
	    },
	    inlineTemplate: {
	      render: function() {
	        var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;
	          return _c('span', [_c('el-button', {
	            attrs: {
	              "type": "success",
	              "size": "small"
	            },
	            on: {
	              "click": function($event) {
	                _vm.edit(_vm.row)
	              }
	            }
	          }, [_vm._v("编辑")])], 1)
	        
	      },
	      staticRenderFns: []
	    }
	  })], 1), _vm._v(" "), _c('el-pagination', {
	    staticStyle: {
	      "margin-top": "20px",
	      "height": "60px"
	    },
	    attrs: {
	      "current-page": _vm.pageNo,
	      "page-sizes": [10, 15, 20],
	      "page-size": _vm.pageSize,
	      "layout": "sizes, prev, pager, next",
	      "total": _vm.$store.state.email.pageItemTotalCount
	    },
	    on: {
	      "size-change": _vm.listsizechange,
	      "current-change": _vm.getList,
	      "update:currentPage": function($event) {
	        _vm.pageNo = $event
	      }
	    }
	  })], 1)], 1), _vm._v(" "), _c('input', {
	    directives: [{
	      name: "model",
	      rawName: "v-model",
	      value: (_vm.title),
	      expression: "title"
	    }],
	    attrs: {
	      "type": "text"
	    },
	    domProps: {
	      "value": (_vm.title)
	    },
	    on: {
	      "input": function($event) {
	        if ($event.target.composing) { return; }
	        _vm.title = $event.target.value
	      }
	    }
	  }), _vm._v(" "), _c('el-button', {
	    attrs: {
	      "type": "success",
	      "size": "small"
	    },
	    on: {
	      "click": function($event) {
	        _vm.save(_vm.row)
	      }
	    }
	  }, [_vm._v("保存")]), _vm._v(" "), _c('div', {
	    ref: "editor",
	    attrs: {
	      "id": "editor"
	    }
	  })], 1)
	},staticRenderFns: []}
	module.exports.render._withStripped = true
	if (false) {
	  module.hot.accept()
	  if (module.hot.data) {
	     require("vue-loader/node_modules/vue-hot-reload-api").rerender("data-v-65f19333", module.exports)
	  }
	}

/***/ })

});
//# sourceMappingURL=7.build.js.map