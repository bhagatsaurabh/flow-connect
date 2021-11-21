(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, function() {
return (self["webpackChunkflow_connect"] = self["webpackChunkflow_connect"] || []).push([[568],{

/***/ 225:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Timer = void 0;
var vector_1 = __webpack_require__(281);
var constants_1 = __webpack_require__(522);
var Timer = function (flow, options) {
    if (options === void 0) { options = {}; }
    var lastTrigger = Number.MIN_VALUE;
    var node = flow.createNode(options.name || 'Timer', options.position || new vector_1.Vector2(50, 50), options.width || 150, [], [{ name: 'timer', dataType: 'event' }], options.style || { padding: 10, spacing: 10, rowHeight: 10 }, options.terminalStyle || {}, options.props ? __assign(__assign({}, options.props), { delay: 1000 }) : { delay: 1000 });
    node.ui.append(node.createInput(node.props.delay, 'delay', false, false, 20, { type: constants_1.InputType.Number }));
    flow.flowConnect.on('tickreset', function () { return lastTrigger = Number.MIN_VALUE; });
    flow.flowConnect.on('tick', function () {
        var current = flow.flowConnect.time;
        if (current - lastTrigger >= node.props.delay) {
            node.outputs[0].emit(null);
            lastTrigger = current;
        }
    });
    return node;
};
exports.Timer = Timer;


/***/ }),

/***/ 577:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StandardNodes = void 0;
var timer = __webpack_require__(225);
var StandardNodes;
(function (StandardNodes) {
    StandardNodes.Timer = timer.Timer;
})(StandardNodes = exports.StandardNodes || (exports.StandardNodes = {}));


/***/ })

},
/******/ __webpack_require__ => { // webpackRuntimeModules
/******/ "use strict";
/******/ 
/******/ var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
/******/ var __webpack_exports__ = (__webpack_exec__(577));
/******/ return __webpack_exports__;
/******/ }
]);
});
//# sourceMappingURL=standard-nodes.js.map