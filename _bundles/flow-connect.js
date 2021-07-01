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
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 278:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Color = void 0;
var utils_1 = __webpack_require__(974);
var Color = (function () {
    function Color(rgba) {
        this.rgbaValue = rgba;
        this.hexValue = Color.rgbaToHex(this.rgbaValue);
        this.rgbaString = Color.rgbaToString(this.rgbaValue);
        this.rgbaCSSString = Color.rgbaToCSSString(this.rgbaValue);
    }
    Color.Random = function () {
        return new Color(new Uint8ClampedArray([Math.floor(utils_1.getRandom(0, 255)), Math.floor(utils_1.getRandom(0, 255)), Math.floor(utils_1.getRandom(0, 255)), 255]));
    };
    Color.rgbaToHex = function (rgba) {
        return "#" + Color._componentToHex(rgba[0]) + Color._componentToHex(rgba[1]) + Color._componentToHex(rgba[2]) + Color._componentToHex(rgba[3]);
    };
    Color.hexToRGBA = function (hex) {
        return new Uint8ClampedArray([parseInt(hex.slice(1, 3), 16), parseInt(hex.slice(3, 5), 16), parseInt(hex.slice(5, 7), 16), parseInt(hex.slice(7, 9), 16)]);
    };
    Color._componentToHex = function (c) {
        var hex = c.toString(16);
        return hex.length == 1 ? '0' + hex : hex;
    };
    Color.rgbaToString = function (rgba) {
        return rgba[0] + ":" + rgba[1] + ":" + rgba[2] + ":" + rgba[3];
    };
    Color.rgbaToCSSString = function (rgba) {
        return "rgba(" + rgba[0] + ", " + rgba[1] + ", " + rgba[2] + ", " + utils_1.normalize(rgba[3], 0, 255).toFixed(3) + ")";
    };
    Color.prototype.serialize = function () {
        return {
            rgba: [this.rgbaValue[0], this.rgbaValue[1], this.rgbaValue[2], this.rgbaValue[3]]
        };
    };
    Color.deSerialize = function (data) {
        return new Color(data.rgba);
    };
    return Color;
}());
exports.Color = Color;


/***/ }),

/***/ 907:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


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
exports.Connector = void 0;
var vector_1 = __webpack_require__(281);
var constants_1 = __webpack_require__(522);
var utils_1 = __webpack_require__(974);
var Connector = (function () {
    function Connector(flow, start, end, floatingTip, style, id, isDeserialization) {
        if (style === void 0) { style = {}; }
        if (id === void 0) { id = utils_1.getNewGUID(); }
        if (isDeserialization === void 0) { isDeserialization = false; }
        this.flow = flow;
        this.floatingTip = floatingTip;
        this.style = style;
        this.id = id;
        this.style = __assign(__assign({}, constants_1.Constant.DefaultConnectorStyle()), style);
        this.start = start;
        this.end = end;
        if (this.start)
            this.startNode = this.start.node;
        if (this.end)
            this.endNode = this.end.node;
        if (start && end) {
            this.floatingTip = null;
            this.start.connectors.push(this);
            this.end.connectors.push(this);
            if (!isDeserialization)
                this.flow.executionGraph.connect(this.startNode, this.endNode);
            this.start.call('connect', this.start, this);
            this.end.call('connect', this.end, this);
        }
        ;
    }
    Object.defineProperty(Connector.prototype, "data", {
        get: function () { return this._data; },
        set: function (data) {
            this._data = data;
            this.end && this.end.call('data', data);
            if (this.flow.state === constants_1.FlowState.Running && this.flow.executionGraph.state !== constants_1.GraphState.FullRun) {
                this.flow.executionGraph.setDirtyNode(this.endNode);
            }
        },
        enumerable: false,
        configurable: true
    });
    Connector.prototype.completeConnection = function (destination) {
        if (!this.start) {
            this.start = destination;
            this.startNode = this.start.node;
        }
        else {
            this.end = destination;
            this.endNode = this.end.node;
        }
        if (!this.start.connectors.includes(this))
            this.start.connectors.push(this);
        this.end.connectors[0] = this;
        this.floatingTip = null;
        this.startNode.currHitTerminal && this.startNode.currHitTerminal.onExit(null, null);
        this.startNode.currHitTerminal = null;
        this.endNode.currHitTerminal && this.endNode.currHitTerminal.onExit(null, null);
        this.endNode.currHitTerminal = null;
        this.flow.executionGraph.connect(this.startNode, this.endNode);
        this.start.call('connect', this.start, this);
        this.end.call('connect', this.end, this);
    };
    Connector.prototype.removeConnection = function () {
        if (this.start) {
            this.start.connectors.includes(this) && this.start.connectors.splice(this.start.connectors.indexOf(this), 1);
            if (this.startNode.currHitTerminal) {
                this.startNode.currHitTerminal.onExit(null, null);
                this.startNode.currHitTerminal = null;
            }
        }
        if (this.end) {
            this.end.connectors.includes(this) && this.end.connectors.splice(this.end.connectors.indexOf(this), 1);
            if (this.endNode.currHitTerminal) {
                this.endNode.currHitTerminal.onExit(null, null);
                this.endNode.currHitTerminal = null;
            }
        }
    };
    Connector.prototype.canConnect = function (destination) {
        var source = !this.start ? this.end : this.start;
        if (!destination)
            return false;
        if (source === destination)
            return false;
        if (source.node === destination.node)
            return false;
        if (source.type === destination.type)
            return false;
        if (!this.flow.rules[source.dataType].includes(destination.dataType))
            return false;
        if (!this.flow.executionGraph.canConnect(source.node, destination.node))
            return false;
        return true;
    };
    Connector.prototype.render = function () {
        this.flow.flowConnect.context.save();
        this._render();
        this.flow.flowConnect.context.restore();
        this.flow.flowConnect.offContext.save();
        this._offRender();
        this.flow.flowConnect.offContext.restore();
    };
    Connector.prototype._render = function () {
        var _a, _b, _c, _d, _e, _f;
        var ax, ay, dx, dy;
        if (this.start) {
            if (this.startNode.renderState.nodeState === constants_1.NodeState.MAXIMIZED)
                _a = [this.start.position.x, this.start.position.y], ax = _a[0], ay = _a[1];
            else
                _b = [this.startNode.position.x + this.startNode.width + this.startNode.style.terminalStripMargin + this.start.style.radius, this.startNode.position.y + this.startNode.style.titleHeight / 2], ax = _b[0], ay = _b[1];
        }
        else
            _c = [this.floatingTip.x, this.floatingTip.y], ax = _c[0], ay = _c[1];
        if (this.end) {
            if (this.endNode.renderState.nodeState === constants_1.NodeState.MAXIMIZED)
                _d = [this.end.position.x, this.end.position.y], dx = _d[0], dy = _d[1];
            else
                _e = [this.endNode.position.x - this.endNode.style.terminalStripMargin - this.end.style.radius, this.endNode.position.y + this.endNode.style.titleHeight / 2], dx = _e[0], dy = _e[1];
        }
        else
            _f = [this.floatingTip.x, this.floatingTip.y], dx = _f[0], dy = _f[1];
        var offset = vector_1.Vector2.Distance(ax, ay, dx, dy);
        offset *= .2;
        var _g = [ax + offset, ay], bx = _g[0], by = _g[1];
        var _h = [dx - offset, dy], cx = _h[0], cy = _h[1];
        var _j = [(bx + cx) / 2, (by + cy) / 2], midx = _j[0], midy = _j[1];
        this.flow.flowConnect.context.beginPath();
        this.flow.flowConnect.context.moveTo(ax, ay);
        this.flow.flowConnect.context.quadraticCurveTo(bx, by, midx, midy);
        this.flow.flowConnect.context.moveTo(midx, midy);
        this.flow.flowConnect.context.quadraticCurveTo(cx, cy, dx, dy);
        this.flow.flowConnect.context.strokeStyle = 'grey';
        this.flow.flowConnect.context.lineWidth = this.style.width + 2;
        this.flow.flowConnect.context.stroke();
        this.flow.flowConnect.context.beginPath();
        this.flow.flowConnect.context.moveTo(ax, ay);
        this.flow.flowConnect.context.quadraticCurveTo(bx, by, midx, midy);
        this.flow.flowConnect.context.moveTo(midx, midy);
        this.flow.flowConnect.context.quadraticCurveTo(cx, cy, dx, dy);
        this.flow.flowConnect.context.strokeStyle = this.style.color;
        this.flow.flowConnect.context.lineWidth = this.style.width;
        this.flow.flowConnect.context.stroke();
    };
    Connector.prototype._offRender = function () { };
    Connector.prototype.serialize = function () {
        return {
            id: this.id,
            startId: this.start.id,
            endId: this.end.id,
            startNodeId: this.startNode.id,
            endNodeId: this.endNode.id,
            style: this.style
        };
    };
    Connector.deSerialize = function (flow, start, end, data) {
        return new Connector(flow, start, end, null, data.style, data.id, true);
    };
    return Connector;
}());
exports.Connector = Connector;


/***/ }),

/***/ 894:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Flow = void 0;
var node_1 = __webpack_require__(55);
var hooks_1 = __webpack_require__(417);
var group_1 = __webpack_require__(166);
var connector_1 = __webpack_require__(907);
var binary_search_tree_1 = __webpack_require__(156);
var subflow_node_1 = __webpack_require__(587);
var tunnel_node_1 = __webpack_require__(915);
var utils_1 = __webpack_require__(974);
var constants_1 = __webpack_require__(522);
var graph_1 = __webpack_require__(571);
var Flow = (function (_super) {
    __extends(Flow, _super);
    function Flow(flowConnect, name, rules, terminalTypeColors, id) {
        if (id === void 0) { id = utils_1.getNewGUID(); }
        var _this = _super.call(this) || this;
        _this.flowConnect = flowConnect;
        _this.name = name;
        _this.rules = rules;
        _this.terminalTypeColors = terminalTypeColors;
        _this.id = id;
        _this.listeners = {};
        _this.state = constants_1.FlowState.Stopped;
        _this.nodes = {};
        _this.groups = [];
        _this.connectors = {};
        _this.hitColorToNode = {};
        _this.hitColorToGroup = {};
        _this.sortedNodes = new binary_search_tree_1.BinarySearchTree(function (a, b) { return (a.zIndex - b.zIndex); }, function (node) { return node.id; });
        _this.inputs = [];
        _this.outputs = [];
        _this.executionGraph = new graph_1.Graph();
        _this.registerListeners();
        return _this;
    }
    Flow.prototype.registerListeners = function () {
        var _this = this;
        var id = this.flowConnect.on('transform', function () { return _this.call('transform', _this); });
        this.listeners['transform'] = id;
    };
    Flow.prototype.deregisterListeners = function () {
        this.flowConnect.off('transform', this.listeners['transform']);
        delete this.listeners['transform'];
    };
    Flow.prototype.existsInFlow = function (flow) {
        for (var _i = 0, _a = Object.values(this.nodes); _i < _a.length; _i++) {
            var node = _a[_i];
            if (node.subFlow === flow)
                return true;
            else if (node.subFlow) {
                return node.subFlow.existsInFlow(flow);
            }
        }
        return false;
    };
    Flow.prototype.addInput = function (name, dataType, position) {
        var flowInput = new tunnel_node_1.TunnelNode(this, 'Input', position, 100, [], [{ name: name, dataType: dataType }], {}, {}, {});
        this.inputs.push(flowInput);
        this.nodes[flowInput.id] = flowInput;
        this.sortedNodes.add(flowInput);
        this.executionGraph.add(flowInput);
        this.call('add-input', this, flowInput);
        return flowInput;
    };
    Flow.prototype.addOutput = function (name, dataType, position) {
        var flowOutput = new tunnel_node_1.TunnelNode(this, 'Output', position, 100, [{ name: name, dataType: dataType }], [], {}, {}, {});
        this.outputs.push(flowOutput);
        this.nodes[flowOutput.id] = flowOutput;
        this.sortedNodes.add(flowOutput);
        this.executionGraph.add(flowOutput);
        this.call('add-output', this, flowOutput);
        return flowOutput;
    };
    Flow.prototype.addSubFlow = function (flow, position) {
        var subFlowNode = new subflow_node_1.SubFlowNode(this, flow.name, position, 150, {}, {}, {}, flow.inputs.map(function (inputNode) { return { name: inputNode.outputs[0].name, dataType: inputNode.outputs[0].dataType }; }), flow.outputs.map(function (outputNode) { return { name: outputNode.inputs[0].name, dataType: outputNode.inputs[0].dataType }; }), flow);
        this.nodes[subFlowNode.id] = subFlowNode;
        this.sortedNodes.add(subFlowNode);
        this.executionGraph.add(subFlowNode);
        return subFlowNode;
    };
    Flow.prototype.createNode = function (name, position, width, inputs, outputs, style, terminalStyle, props) {
        if (style === void 0) { style = {}; }
        if (terminalStyle === void 0) { terminalStyle = {}; }
        var inTerminals = [], outTerminals = [];
        if (typeof inputs !== 'undefined')
            inTerminals = inputs;
        if (typeof outputs !== 'undefined')
            outTerminals = outputs;
        var node = new node_1.Node(this, name, position, width, inTerminals, outTerminals, style, terminalStyle, props);
        this.nodes[node.id] = node;
        this.sortedNodes.add(node);
        this.executionGraph.add(node);
        return node;
    };
    Flow.prototype.removeNode = function (nodeOrID) {
    };
    Flow.prototype.removeConnector = function (id) {
        if (this.connectors[id] === this.flowConnect.floatingConnector)
            this.flowConnect.floatingConnector = null;
        delete this.connectors[id];
    };
    Flow.prototype.removeAllFocus = function () {
        Object.values(this.nodes).forEach(function (node) { return node.focused = false; });
    };
    Flow.prototype.render = function () {
        this.groups.forEach(function (group) { return group.render(); });
        Object.values(this.connectors).forEach(function (connector) { return connector.render(); });
        this.sortedNodes.forEach(function (node) { return node.render(); });
    };
    Flow.prototype.start = function () {
        if (this.state === constants_1.FlowState.Running)
            return;
        this.state = constants_1.FlowState.Running;
        this.call('start', this);
        this.executionGraph.start();
    };
    Flow.prototype.stop = function () {
        this.state = constants_1.FlowState.Stopped;
        this.call('stop', this);
        Object.values(this.nodes).forEach(function (node) {
            if (node instanceof subflow_node_1.SubFlowNode) {
                node.subFlow.stop();
            }
        });
    };
    Flow.prototype.serialize = function () {
        return {
            id: this.id,
            name: this.name,
            rules: this.rules,
            terminalTypeColors: this.terminalTypeColors,
            nodes: Object.values(this.nodes).map(function (node) { return node.serialize(); }),
            groups: this.groups.map(function (group) { return group.serialize(); }),
            connectors: Object.values(this.connectors).map(function (connector) { return connector.serialize(); }),
            inputs: this.inputs.map(function (input) { return input.serialize(); }),
            outputs: this.outputs.map(function (output) { return output.serialize(); }),
            executionGraph: this.executionGraph.serialize()
        };
    };
    Flow.deSerialize = function (flowConnect, data) {
        var flow = new Flow(flowConnect, data.name, data.rules, data.terminalTypeColors, data.id);
        data.nodes.forEach(function (serializedNode) {
            var node;
            if (serializedNode.subFlow)
                node = subflow_node_1.SubFlowNode.deSerialize(flow, serializedNode);
            else
                node = node_1.Node.deSerialize(flow, serializedNode);
            flow.nodes[node.id] = node;
            flow.sortedNodes.add(node);
        });
        data.groups.forEach(function (serializedGroup) {
            var group = group_1.Group.deSerialize(flow, serializedGroup);
            flow.groups.push(group);
            group.nodes.forEach(function (node) { return node.group = group; });
        });
        data.inputs.forEach(function (serializedInput) {
            var input = tunnel_node_1.TunnelNode.deSerialize(flow, serializedInput);
            flow.inputs.push(input);
            flow.nodes[input.id] = input;
            flow.sortedNodes.add(input);
        });
        data.outputs.forEach(function (serializedOutput) {
            var output = tunnel_node_1.TunnelNode.deSerialize(flow, serializedOutput);
            flow.outputs.push(output);
            flow.nodes[output.id] = output;
            flow.sortedNodes.add(output);
        });
        data.connectors.forEach(function (serializedConnector) {
            var startNode = flow.nodes[serializedConnector.startNodeId];
            var startTerminal = startNode.outputs.concat(startNode.outputsUI).find(function (terminal) { return terminal.id === serializedConnector.startId; });
            var endNode = flow.nodes[serializedConnector.endNodeId];
            var endTerminal = endNode.inputs.concat(endNode.inputsUI).find(function (terminal) { return terminal.id === serializedConnector.endId; });
            var connector = connector_1.Connector.deSerialize(flow, startTerminal, endTerminal, serializedConnector);
            flow.connectors[serializedConnector.id] = connector;
        });
        flow.executionGraph = graph_1.Graph.deSerialize(flow, data.executionGraph);
        return flow;
    };
    return Flow;
}(hooks_1.Hooks));
exports.Flow = Flow;


/***/ }),

/***/ 571:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Graph = exports.GraphNode = void 0;
var constants_1 = __webpack_require__(522);
var utils_1 = __webpack_require__(974);
var node_1 = __webpack_require__(55);
var GraphNode = (function () {
    function GraphNode(flowNode, order, id) {
        this.flowNode = flowNode;
        this.childs = [];
        this.order = order ? order : 0;
        this.id = id ? id : utils_1.getNewGUID();
    }
    GraphNode.prototype.serialize = function () {
        return {
            id: this.id,
            nodeId: this.flowNode.id,
            order: this.order,
            childs: this.childs.map(function (child) { return child.id; })
        };
    };
    GraphNode.deSerialize = function (node, data) {
        return new GraphNode(node, data.order, data.id);
    };
    return GraphNode;
}());
exports.GraphNode = GraphNode;
var Graph = (function () {
    function Graph() {
        this.state = constants_1.GraphState.Stopped;
        this.nodes = [];
        this.nodeToGraphNode = {};
        this.dirtyNodes = {};
    }
    Graph.prototype.add = function (data) {
        if (!this.nodes[0])
            this.nodes.push([]);
        var graphNode = new GraphNode(data);
        this.nodes[0].push(graphNode);
        this.nodeToGraphNode[data.id] = graphNode;
    };
    Graph.prototype.connect = function (sourceNode, destinationNode) {
        var _this = this;
        var startGraphNode = this.nodeToGraphNode[sourceNode.id];
        var endGraphNode = this.nodeToGraphNode[destinationNode.id];
        if (!startGraphNode.childs.includes(endGraphNode)) {
            startGraphNode.childs.push(endGraphNode);
            if (endGraphNode.order <= startGraphNode.order) {
                this.updateOrder(endGraphNode, startGraphNode.order + 1);
                var queue_1 = [];
                queue_1.push(endGraphNode);
                var _loop_1 = function () {
                    var currNode = queue_1.shift();
                    currNode.childs.forEach(function (child) {
                        if (child.order <= currNode.order) {
                            _this.updateOrder(child, currNode.order + 1);
                            if (!queue_1.includes(child))
                                queue_1.push(child);
                        }
                    });
                };
                while (queue_1.length !== 0) {
                    _loop_1();
                }
            }
        }
    };
    Graph.prototype.updateOrder = function (graphNode, order) {
        this.nodes[graphNode.order].splice(this.nodes[graphNode.order].indexOf(graphNode), 1);
        if (!this.nodes[order])
            this.nodes[order] = [];
        graphNode.order = order;
        this.nodes[order].push(graphNode);
    };
    Graph.prototype.canConnect = function (sourceNode, destinationNode) {
        if (this.nodeToGraphNode[destinationNode.id].childs.includes(this.nodeToGraphNode[sourceNode.id]))
            return false;
        return true;
    };
    Graph.prototype.start = function () {
        if (this.state !== constants_1.GraphState.Stopped)
            return;
        this.state = constants_1.GraphState.FullRun;
        this.nodes.forEach(function (groupedNodes) {
            groupedNodes.forEach(function (graphNode) { return graphNode.flowNode.run(); });
        });
        this.state = constants_1.GraphState.Idle;
    };
    Graph.prototype.stop = function () {
        this.state = constants_1.GraphState.Stopped;
    };
    Graph.prototype.partialRun = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, new Promise(function (resolve, reject) {
                            try {
                                _this.processDirtyNodes();
                                resolve(true);
                            }
                            catch (error) {
                                console.log(error);
                                reject(false);
                            }
                        })];
                    case 1:
                        result = _a.sent();
                        if (!(result && Object.keys(this.dirtyNodes).length > 0)) return [3, 3];
                        return [4, this.partialRun()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2];
                }
            });
        });
    };
    Graph.prototype.setDirtyNode = function (node) {
        var _this = this;
        var graphNode = node instanceof node_1.Node ? this.nodeToGraphNode[node.id] : node;
        if (!this.dirtyNodes[graphNode.id]) {
            this.dirtyNodes[graphNode.id] = graphNode;
            if (this.state === constants_1.GraphState.Idle) {
                this.state = constants_1.GraphState.Running;
                this.partialRun().then(function () { return (_this.state = constants_1.GraphState.Idle); });
            }
        }
    };
    Graph.prototype.clearDirtyNode = function (node) {
        var graphNode = node instanceof node_1.Node ? this.nodeToGraphNode[node.id] : node;
        if (this.dirtyNodes[graphNode.id])
            delete this.dirtyNodes[graphNode.id];
    };
    Graph.prototype.processDirtyNodes = function () {
        var _this = this;
        var dirtyNodes = Object.values(this.dirtyNodes).sort(function (a, b) { return (a.order - b.order); });
        console.log(__spreadArrays(dirtyNodes));
        var queue = dirtyNodes;
        queue.forEach(function (graphNode) {
            graphNode.flowNode.run();
            _this.clearDirtyNode(graphNode);
        });
    };
    Graph.prototype.serialize = function () {
        var _this = this;
        var nodeToGraphNode = {};
        Object.keys(this.nodeToGraphNode).forEach(function (nodeId) { return nodeToGraphNode[nodeId] = _this.nodeToGraphNode[nodeId].id; });
        return {
            nodes: this.nodes.map(function (groupedNodes) { return groupedNodes.map(function (graphNode) { return graphNode.serialize(); }); }),
            nodeToGraphNode: nodeToGraphNode
        };
    };
    Graph.deSerialize = function (flow, data) {
        var graph = new Graph();
        var serializedGraphNodes = {};
        var deSerializedGraphNodes = {};
        data.nodes.forEach(function (serializedGroupedNodes, index) {
            graph.nodes[index] = serializedGroupedNodes.map(function (serializedGraphNode) {
                var graphNode = GraphNode.deSerialize(flow.nodes[serializedGraphNode.nodeId], serializedGraphNode);
                deSerializedGraphNodes[graphNode.id] = graphNode;
                serializedGraphNodes[graphNode.id] = serializedGraphNode;
                return graphNode;
            });
        });
        Object.keys(deSerializedGraphNodes).forEach(function (key) {
            deSerializedGraphNodes[key].childs = serializedGraphNodes[key].childs.map(function (childId) { return deSerializedGraphNodes[childId]; });
        });
        Object.keys(data.nodeToGraphNode).forEach(function (nodeId) {
            graph.nodeToGraphNode[nodeId] = deSerializedGraphNodes[data.nodeToGraphNode[nodeId]];
        });
        return graph;
    };
    return Graph;
}());
exports.Graph = Graph;


/***/ }),

/***/ 166:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Group = void 0;
var vector_1 = __webpack_require__(281);
var constants_1 = __webpack_require__(522);
var utils_1 = __webpack_require__(974);
var color_1 = __webpack_require__(278);
var hooks_1 = __webpack_require__(417);
var Group = (function (_super) {
    __extends(Group, _super);
    function Group(flow, position, width, height, name, style, id, hitColor) {
        if (width === void 0) { width = 0; }
        if (height === void 0) { height = 0; }
        if (style === void 0) { style = {}; }
        if (id === void 0) { id = utils_1.getNewGUID(); }
        var _this = _super.call(this) || this;
        _this.flow = flow;
        _this.width = width;
        _this.height = height;
        _this.style = style;
        _this.id = id;
        _this.hitColor = hitColor;
        _this.nodes = [];
        _this.nodeDeltas = [];
        _this.renderState = constants_1.ViewPort.INSIDE;
        _this.style = __assign(__assign({}, constants_1.Constant.DefaultGroupStyle()), style);
        _this.id = utils_1.getNewGUID();
        _this._position = position;
        if (!_this.style.color || !_this.style.borderColor) {
            var colors = constants_1.Constant.DefaultGroupColors.Random();
            _this.style.borderColor = colors[0];
            _this.style.color = colors[1];
        }
        _this.name = name;
        _this.setHitColor(hitColor);
        _this.computeTextMetrics();
        _this.flow.on('transform', function () { return _this.updateRenderState(); });
        return _this;
    }
    Object.defineProperty(Group.prototype, "name", {
        get: function () { return this._name; },
        set: function (name) {
            if (!name || name.trim() === '')
                this._name = 'No Name';
            else
                this._name = name;
            this.computeTextMetrics();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Group.prototype, "position", {
        get: function () { return this._position; },
        set: function (position) {
            this._position = position;
            this.updateRenderState();
            this.recomputeNodePositions();
        },
        enumerable: false,
        configurable: true
    });
    Group.prototype.setHitColor = function (hitColor) {
        if (!hitColor) {
            hitColor = color_1.Color.Random();
            while (this.flow.hitColorToGroup[hitColor.rgbaString])
                hitColor = color_1.Color.Random();
        }
        this.hitColor = hitColor;
        this.flow.hitColorToGroup[this.hitColor.rgbaString] = this;
    };
    Group.prototype.computeTextMetrics = function () {
        this.flow.flowConnect.context.font = this.style.fontSize + ' ' + this.style.font;
        var metrics = this.flow.flowConnect.context.measureText(this.name);
        this.textWidth = metrics.width;
        metrics = this.flow.flowConnect.context.measureText('M');
        this.flow.flowConnect.context.font = null;
        this.textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        if (typeof this.textHeight === 'undefined') {
            var d = document.createElement("span");
            d.textContent = "M";
            d.style.font = this.style.fontSize + ' ' + this.style.font;
            document.body.appendChild(d);
            this.textHeight = d.offsetHeight;
            document.body.removeChild(d);
        }
    };
    Group.prototype.updateRenderState = function () {
        var realPos = this.position.transform(this.flow.flowConnect.transform);
        this.renderState = utils_1.intersects(0, 0, this.flow.flowConnect.canvasDimensions.width, this.flow.flowConnect.canvasDimensions.height, realPos.x, realPos.y, realPos.x + this.width * this.flow.flowConnect.scale, realPos.y + this.height * this.flow.flowConnect.scale);
    };
    Group.prototype.setContainedNodes = function () {
        var _this = this;
        var groupRealPos = this.position.transform(this.flow.flowConnect.transform);
        this.nodes = Object.keys(this.flow.nodes)
            .map(function (key) { return _this.flow.nodes[key]; })
            .filter(function (node) { return !node.group && node.renderState.viewport === constants_1.ViewPort.INSIDE; })
            .filter(function (node) {
            var nodeRealPos = node.position.transform(_this.flow.flowConnect.transform);
            return utils_1.intersects(groupRealPos.x, groupRealPos.y, groupRealPos.x + _this.width * _this.flow.flowConnect.scale, groupRealPos.y + _this.height * _this.flow.flowConnect.scale, nodeRealPos.x, nodeRealPos.y, nodeRealPos.x + node.width * _this.flow.flowConnect.scale, nodeRealPos.y + node.ui.height * _this.flow.flowConnect.scale) === constants_1.ViewPort.INSIDE;
        });
        this.nodes.forEach(function (node, index) {
            node.group = _this;
            _this.nodeDeltas[index] = node.position.subtract(_this.position);
        });
    };
    Group.prototype.recomputeNodePositions = function () {
        var _this = this;
        this.nodes.forEach(function (node, index) {
            node.position = _this.position.add(_this.nodeDeltas[index]);
        });
    };
    Group.prototype.render = function () {
        if (this.renderState === constants_1.ViewPort.OUTSIDE)
            return;
        this.flow.flowConnect.context.save();
        this._render();
        this.flow.flowConnect.context.restore();
        this.flow.flowConnect.offGroupContext.save();
        this._offRender();
        this.flow.flowConnect.offGroupContext.restore();
    };
    Group.prototype._render = function () {
        this.flow.flowConnect.context.strokeStyle = this.style.borderColor;
        this.flow.flowConnect.context.lineWidth = 2;
        this.flow.flowConnect.context.fillStyle = this.style.color;
        this.flow.flowConnect.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
        this.flow.flowConnect.context.fillRect(this.position.x, this.position.y, this.width, this.height);
        this.flow.flowConnect.context.fillStyle = this.style.titleColor;
        this.flow.flowConnect.context.textBaseline = 'bottom';
        this.flow.flowConnect.context.font = this.style.fontSize + ' ' + this.style.font;
        this.flow.flowConnect.context.fillText(this.name, this.position.x, this.position.y - 10);
    };
    Group.prototype._offRender = function () {
        this.flow.flowConnect.offGroupContext.fillStyle = this.hitColor.rgbaCSSString;
        this.flow.flowConnect.offGroupContext.fillRect(this.position.x, this.position.y, this.width, this.height);
        this.flow.flowConnect.offGroupContext.fillRect(this.position.x, this.position.y - this.textHeight - 10, this.textWidth, this.textHeight + 10);
    };
    Group.prototype.onClick = function (screenPosition, realPosition) {
        var _this = this;
        this.call('click', this, screenPosition, realPosition);
        var thisRealPosition = this.position.transform(this.flow.flowConnect.transform);
        if (screenPosition.y < thisRealPosition.y) {
            this.flow.flowConnect.showGenericInput(thisRealPosition.subtract(0, (10 + this.textHeight) * this.flow.flowConnect.scale), this.name, {
                width: Math.max(this.textWidth, 50) * this.flow.flowConnect.scale + 'px',
                height: this.textHeight * this.flow.flowConnect.scale + 'px',
                fontSize: parseInt(this.style.fontSize.replace('px', '')) * this.flow.flowConnect.scale + 'px',
                fontFamily: this.style.font
            }, {
                type: 'text'
            }, function (value) {
                _this.name = value;
            });
        }
    };
    Group.prototype.serialize = function () {
        return {
            id: this.id,
            hitColor: this.hitColor.serialize(),
            position: this.position.serialize(),
            name: this.name,
            width: this.width,
            height: this.height,
            style: this.style,
            nodes: this.nodes.map(function (node) { return node.id; }),
            nodeDeltas: this.nodeDeltas.map(function (nodeDelata) { return nodeDelata.serialize(); })
        };
    };
    Group.deSerialize = function (flow, data) {
        var group = new Group(flow, vector_1.Vector2.deSerialize(data.position), data.width, data.height, data.name, data.style, data.id, color_1.Color.deSerialize(data.hitColor));
        data.nodes.forEach(function (nodeId) {
            group.nodes.push(flow.nodes[nodeId]);
        });
        data.nodeDeltas.forEach(function (serializedVector) {
            group.nodeDeltas.push(vector_1.Vector2.deSerialize(serializedVector));
        });
        return group;
    };
    return Group;
}(hooks_1.Hooks));
exports.Group = Group;


/***/ }),

/***/ 417:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Hooks = void 0;
var Hooks = (function () {
    function Hooks() {
        this.registeredEvents = {};
        this.lastId = 0;
    }
    Hooks.prototype.on = function (eventKey, callback) {
        if (!this.registeredEvents[eventKey])
            this.registeredEvents[eventKey] = {};
        var id = this.lastId;
        this.registeredEvents[eventKey][id] = callback;
        this.lastId += 1;
        return id;
    };
    Hooks.prototype.call = function (eventKey) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (this.registeredEvents[eventKey]) {
            if (args)
                Object.values(this.registeredEvents[eventKey]).forEach(function (callback) { return callback.apply(void 0, args); });
            else
                Object.values(this.registeredEvents[eventKey]).forEach(function (callback) { return callback(); });
        }
    };
    Hooks.prototype.off = function (eventKey, id) {
        delete this.registeredEvents[eventKey][id];
    };
    return Hooks;
}());
exports.Hooks = Hooks;


/***/ }),

/***/ 676:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(278), exports);
__exportStar(__webpack_require__(907), exports);
__exportStar(__webpack_require__(894), exports);
__exportStar(__webpack_require__(55), exports);
__exportStar(__webpack_require__(900), exports);
__exportStar(__webpack_require__(166), exports);
__exportStar(__webpack_require__(232), exports);
__exportStar(__webpack_require__(417), exports);
__exportStar(__webpack_require__(587), exports);
__exportStar(__webpack_require__(915), exports);


/***/ }),

/***/ 232:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
;
;


/***/ }),

/***/ 55:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Node = exports.NodeButton = void 0;
var vector_1 = __webpack_require__(281);
var constants_1 = __webpack_require__(522);
var index_1 = __webpack_require__(637);
var utils_1 = __webpack_require__(974);
var color_1 = __webpack_require__(278);
var terminal_1 = __webpack_require__(900);
var hooks_1 = __webpack_require__(417);
var NodeButton = (function () {
    function NodeButton(node, callback, _render, align) {
        this.node = node;
        this.callback = callback;
        this._render = _render;
        this.align = align;
        this.deltaX = 0;
        this.setHitColor();
    }
    NodeButton.prototype.setHitColor = function () {
        var color = color_1.Color.Random();
        while (this.node.hitColorToNodeButton[color.rgbaString])
            color = color_1.Color.Random();
        this.hitColor = color;
        this.node.hitColorToNodeButton[this.hitColor.rgbaString] = this;
    };
    NodeButton.prototype.render = function () {
        this.node.context.save();
        this._render(this, this.node.position.add(this.deltaX, this.node.style.titleHeight / 2 - this.node.style.nodeButtonSize / 2));
        this.node.context.restore();
        this.node.offUIContext.save();
        this._offUIRender();
        this.node.offUIContext.restore();
    };
    NodeButton.prototype._offUIRender = function () {
        this.node.offUIContext.fillStyle = this.hitColor.rgbaCSSString;
        this.node.offUIContext.fillRect(this.node.position.x + this.deltaX, this.node.position.y + this.node.style.titleHeight / 2 - this.node.style.nodeButtonSize / 2, this.node.style.nodeButtonSize, this.node.style.nodeButtonSize);
    };
    return NodeButton;
}());
exports.NodeButton = NodeButton;
var Node = (function (_super) {
    __extends(Node, _super);
    function Node(flow, name, position, width, inputs, outputs, style, terminalStyle, props, id, hitColor, ui) {
        var _a, _b;
        if (style === void 0) { style = {}; }
        if (terminalStyle === void 0) { terminalStyle = {}; }
        if (props === void 0) { props = {}; }
        if (id === void 0) { id = utils_1.getNewGUID(); }
        var _this = _super.call(this) || this;
        _this.flow = flow;
        _this.name = name;
        _this.style = style;
        _this.terminalStyle = terminalStyle;
        _this.id = id;
        _this.hitColor = hitColor;
        _this.focused = false;
        _this.inputs = [];
        _this.outputs = [];
        _this.inputsUI = [];
        _this.outputsUI = [];
        _this.nodeButtons = [];
        _this.propObservers = {};
        _this.renderState = { viewport: constants_1.ViewPort.INSIDE, nodeState: constants_1.NodeState.MAXIMIZED, lod: constants_1.LOD.LOD2 };
        _this.group = null;
        _this._width = width;
        _this.style = __assign(__assign({}, constants_1.Constant.DefaultNodeStyle()), style);
        _this._position = position;
        _this.setupProps(props);
        _this.hitColorToUI = {};
        _this.hitColorToTerminal = {};
        _this.hitColorToNodeButton = {};
        _this.zIndex = 0;
        _this.context = flow.flowConnect.context;
        _this.offContext = flow.flowConnect.offContext;
        _this.offUIContext = flow.flowConnect.offUIContext;
        _this.setHitColor(hitColor);
        (_a = _this.inputs).push.apply(_a, inputs.map(function (input) { return new terminal_1.Terminal(_this, constants_1.TerminalType.IN, input.dataType, input.name, input.style ? input.style : __assign({}, terminalStyle), null, input.id ? input.id : null, input.hitColor ? color_1.Color.deSerialize(input.hitColor) : null); }));
        (_b = _this.outputs).push.apply(_b, outputs.map(function (output) { return new terminal_1.Terminal(_this, constants_1.TerminalType.OUT, output.dataType, output.name, output.style ? output.style : __assign({}, terminalStyle), null, output.id ? output.id : null, output.hitColor ? color_1.Color.deSerialize(output.hitColor) : null); }));
        _this.ui = ui ? (ui instanceof index_1.Container ? ui : index_1.Container.deSerialize(_this, ui)) : new index_1.Container(_this, width);
        _this.addNodeButton(function () { return _this.toggleNodeState(); }, function (nodeButton, position) {
            _this.context.fillStyle = _this.style.maximizeButtonColor;
            _this.context.fillRect(position.x, position.y, _this.style.nodeButtonSize, _this.style.nodeButtonSize);
        }, constants_1.Align.Left);
        _this.reflow();
        _this.ui.update();
        _this.flow.on('transform', function () { return _this.updateRenderState(); });
        return _this;
    }
    Object.defineProperty(Node.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (position) {
            this._position = position;
            this.reflow();
            this.ui.update();
            this.updateRenderState();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "zIndex", {
        get: function () {
            return this._zIndex;
        },
        set: function (zIndex) {
            this._zIndex = zIndex;
            if (this.flow.sortedNodes.remove(this)) {
                this.flow.sortedNodes.add(this);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Node.prototype, "width", {
        get: function () {
            return this._width;
        },
        set: function (width) {
            this._width = width;
            this.ui.width = width;
            this.ui.update();
        },
        enumerable: false,
        configurable: true
    });
    Node.prototype.setupProps = function (props) {
        var _this = this;
        var propsTarget = {};
        this.props = new Proxy(propsTarget, {
            set: function (target, prop, value) {
                if (typeof target[prop] === 'undefined') {
                    _this.propObservers[prop] = [];
                }
                var oldValue = target[prop];
                target[prop] = value;
                _this.propObservers[prop].forEach(function (callback) { return callback(oldValue, value); });
                if (_this.registeredEvents['propchange']) {
                    _this.call('propchange', _this, prop, oldValue, value);
                }
                return true;
            }
        });
        Object.keys(props).forEach(function (key) {
            _this.props[key] = props[key];
        });
    };
    Node.prototype.addPropObserver = function (propName, callback) {
        if (typeof this.props[propName] !== 'undefined') {
            this.propObservers[propName].push(callback);
        }
    };
    Node.prototype.removePropObserver = function (propName, callback) {
        if (this.propObservers[propName]) {
            this.propObservers[propName].splice(this.propObservers[propName].indexOf(callback), 1);
        }
    };
    Node.prototype.setHitColor = function (hitColor) {
        if (!hitColor) {
            hitColor = color_1.Color.Random();
            while (this.flow.hitColorToNode[hitColor.rgbaString])
                hitColor = color_1.Color.Random();
        }
        this.hitColor = hitColor;
        this.flow.hitColorToNode[this.hitColor.rgbaString] = this;
    };
    Node.prototype.addTerminal = function (terminal) {
        if (!(terminal instanceof terminal_1.Terminal)) {
            terminal = terminal_1.Terminal.deSerialize(this, terminal);
        }
        if (terminal.type === constants_1.TerminalType.IN)
            this.inputs.push(terminal);
        else
            this.outputs.push(terminal);
        this.reflow();
        this.ui.reflow();
    };
    Node.prototype.addNodeButton = function (callback, render, align) {
        var newNodeButton = new NodeButton(this, callback, render, align);
        var noOfButtons = this.nodeButtons.filter(function (nodeButton) { return nodeButton.align === newNodeButton.align; }).length;
        var deltaX;
        if (align === constants_1.Align.Left)
            deltaX = noOfButtons * (this.style.nodeButtonSize + this.style.nodeButtonSpacing);
        else
            deltaX = this.width - noOfButtons * (this.style.nodeButtonSize + this.style.nodeButtonSpacing) - this.style.nodeButtonSize;
        newNodeButton.deltaX = deltaX;
        this.nodeButtons.push(newNodeButton);
        return newNodeButton;
    };
    Node.prototype.dispose = function () {
        this.flow.removeNode(this.id);
    };
    Node.prototype.reflow = function () {
        var y = this.position.y + this.style.terminalRowHeight / 2 + this.style.padding / 2 + this.style.titleHeight;
        if (this.inputs.length > this.outputs.length) {
            this.recalculateInputTerminals(y);
            y = this.position.y + (this.inputs.length * this.style.terminalRowHeight) / 2 - (this.outputs.length * this.style.terminalRowHeight) / 2 + this.style.terminalRowHeight / 2 + this.style.padding / 2 + this.style.titleHeight;
            this.recalculateOutputTerminals(y);
        }
        else {
            this.recalculateOutputTerminals(y);
            y = this.position.y + (this.outputs.length * this.style.terminalRowHeight) / 2 - (this.inputs.length * this.style.terminalRowHeight) / 2 + this.style.terminalRowHeight / 2 + this.style.padding / 2 + this.style.titleHeight;
            this.recalculateInputTerminals(y);
        }
    };
    Node.prototype.toggleNodeState = function () {
        this.renderState.nodeState = this.renderState.nodeState === constants_1.NodeState.MAXIMIZED ? constants_1.NodeState.MINIMIZED : constants_1.NodeState.MAXIMIZED;
    };
    Node.prototype.updateRenderState = function () {
        var realPos = this.position.transform(this.flow.flowConnect.transform);
        this.renderState.viewport = utils_1.intersects(0, 0, this.flow.flowConnect.canvasDimensions.width, this.flow.flowConnect.canvasDimensions.height, realPos.x, realPos.y, realPos.x + this.width * this.flow.flowConnect.scale, realPos.y + (this.renderState.nodeState === constants_1.NodeState.MAXIMIZED ? this.ui.height : this.style.titleHeight) * this.flow.flowConnect.scale);
        if (this.flow.flowConnect.scale > 0.6)
            this.renderState.lod = constants_1.LOD.LOD2;
        else if (this.flow.flowConnect.scale <= 0.6 && this.flow.flowConnect.scale > .3)
            this.renderState.lod = constants_1.LOD.LOD1;
        else
            this.renderState.lod = constants_1.LOD.LOD0;
        if (this.renderState.viewport === constants_1.ViewPort.INTERSECT) {
            this.ui.updateRenderState();
        }
    };
    Node.prototype.recalculateInputTerminals = function (y) {
        var _this = this;
        this.inputs.forEach(function (terminal) {
            terminal.position.x = _this.position.x - _this.style.terminalStripMargin - terminal.style.radius;
            terminal.position.y = y;
            y += _this.style.terminalRowHeight;
        });
    };
    Node.prototype.recalculateOutputTerminals = function (y) {
        var _this = this;
        this.outputs.forEach(function (terminal) {
            terminal.position.x = _this.position.x + _this.ui.width + _this.style.terminalStripMargin + terminal.style.radius;
            terminal.position.y = y;
            y += _this.style.terminalRowHeight;
        });
    };
    Node.prototype.getHitTerminal = function (hitColor, screenPosition, realPosition) {
        var hitTerminal = null;
        realPosition = realPosition.transform(this.flow.flowConnect.transform);
        var thisRealPosition = this.position.transform(this.flow.flowConnect.transform);
        if ((this.inputs.length + this.inputsUI.length > 0 && realPosition.x < thisRealPosition.x) ||
            (this.outputs.length + this.outputsUI.length > 0 && realPosition.x > thisRealPosition.x + this.ui.width * this.flow.flowConnect.scale)) {
            hitTerminal = this.hitColorToTerminal[hitColor];
        }
        if (this.currHitTerminal && this.currHitTerminal !== hitTerminal) {
            this.currHitTerminal.onExit(screenPosition, realPosition);
            hitTerminal && hitTerminal.onEnter(screenPosition, realPosition);
        }
        return hitTerminal;
    };
    Node.prototype.getHitUINode = function (hitColor) {
        var uiNode = this.hitColorToUI[hitColor];
        if (uiNode instanceof index_1.Container)
            return null;
        return uiNode;
    };
    Node.prototype.getHitNodeButton = function (hitColor) {
        return this.hitColorToNodeButton[hitColor];
    };
    Node.prototype.getInput = function (terminal) {
        if (typeof terminal === 'string') {
            var inputTerminal = this.inputs.find(function (currTerm) { return (currTerm.name === terminal); });
            if (inputTerminal)
                return inputTerminal['getData']();
        }
        else {
            if (this.inputs[terminal])
                return this.inputs[terminal]['getData']();
        }
        return null;
    };
    Node.prototype.setOutput = function (terminal, data) {
        if (typeof terminal === 'string') {
            var outputTerminal = this.outputs.find(function (currTerm) { return (currTerm.name === terminal); });
            if (outputTerminal)
                return outputTerminal['setData'](data);
        }
        else {
            if (this.outputs[terminal])
                this.outputs[terminal]['setData'](data);
        }
    };
    Node.prototype.run = function () {
        if (this.flow.state === constants_1.FlowState.Stopped)
            return;
        this.call('process', this, this.inputs.map(function (terminal) { return terminal.connectors.length > 0 ? terminal.connectors[0].data : null; }));
    };
    Node.prototype.render = function () {
        if (this.renderState.viewport === constants_1.ViewPort.OUTSIDE)
            return;
        if (this.renderState.nodeState === constants_1.NodeState.MAXIMIZED)
            this.ui.render();
        this.context.save();
        this._render();
        this.context.restore();
        this.nodeButtons.forEach(function (nodeButton) { return nodeButton.render(); });
        this.offContext.save();
        this._offRender();
        this.offContext.restore();
    };
    Node.prototype._render = function () {
        var _this = this;
        if (this.renderState.nodeState === constants_1.NodeState.MAXIMIZED) {
            if (this.renderState.lod > 0) {
                this.inputs.forEach(function (terminal) { return terminal.render(); });
                this.outputs.forEach(function (terminal) { return terminal.render(); });
            }
        }
        else {
            this.context.fillStyle = 'green';
            if ((this.inputs.length + this.inputsUI.length) > 0) {
                var radius = this.inputs.length > 0 ? this.inputs[0].style.radius : this.inputsUI[0].style.radius;
                this.context.fillRect(this.position.x - this.style.terminalStripMargin - radius * 2, this.position.y + this.style.titleHeight / 2 - radius, radius * 2, radius * 2);
            }
            if ((this.outputs.length + this.outputsUI.length) > 0) {
                var radius = this.outputs.length > 0 ? this.outputs[0].style.radius : this.outputsUI[0].style.radius;
                this.context.fillRect(this.position.x + this.width + this.style.terminalStripMargin, this.position.y + this.style.titleHeight / 2 - radius, radius * 2, radius * 2);
            }
        }
        this.context.fillStyle = this.style.titleColor;
        this.context.font = this.style.titleFontSize + ' ' + this.style.titleFont;
        this.context.textBaseline = 'middle';
        this.context.fillText(this.name, this.position.x + this.ui.width / 2 - this.context.measureText(this.name).width / 2, this.position.y + this.style.titleHeight / 2);
        if (this.renderState.nodeState === constants_1.NodeState.MAXIMIZED) {
            this.context.fillStyle = this.style.color;
            this.context.font = this.style.fontSize + ' ' + this.style.font;
            this.context.textBaseline = 'middle';
            this.inputs.forEach(function (terminal) {
                _this.context.fillText(terminal.name, terminal.position.x + terminal.style.radius + _this.style.terminalStripMargin + _this.style.padding, terminal.position.y);
            });
            this.outputs.forEach(function (terminal) {
                _this.context.fillText(terminal.name, terminal.position.x - terminal.style.radius - _this.style.terminalStripMargin - _this.style.padding - _this.context.measureText(terminal.name).width, terminal.position.y);
            });
        }
        if (this.focused) {
            this.context.strokeStyle = '#000';
            this.context.lineWidth = 2;
            var inputTerminalsWidth = this.inputs.length === 0 ? (this.inputsUI.length === 0 ? 0 : this.inputsUI[0].style.radius * 2) : this.inputs[0].style.radius * 2;
            inputTerminalsWidth += this.style.terminalStripMargin * 2;
            var outputTerminalsWidth = this.outputs.length === 0 ? (this.outputsUI.length === 0 ? 0 : this.outputsUI[0].style.radius * 2) : this.outputs[0].style.radius * 2;
            outputTerminalsWidth += this.style.terminalStripMargin * 2;
            this.context.strokeRoundRect(this.position.x - inputTerminalsWidth, this.position.y, this.width + inputTerminalsWidth + outputTerminalsWidth, this.renderState.nodeState === constants_1.NodeState.MAXIMIZED ? (this.ui.height + this.style.padding) : this.style.titleHeight, 4);
        }
    };
    Node.prototype._offRender = function () {
        this.offContext.fillStyle = this.hitColor.rgbaCSSString;
        var x = this.position.x;
        var y = this.position.y;
        var inputTerminalsStripWidth = 0, outputTerminalsStripWidth = 0;
        if ((this.inputs.length + this.inputsUI.length) !== 0) {
            var radius = this.inputs.length > 0 ? this.inputs[0].style.radius : this.inputsUI[0].style.radius;
            x -= this.style.terminalStripMargin + radius * 2;
            inputTerminalsStripWidth = radius * 2 + this.style.terminalStripMargin;
        }
        if ((this.outputs.length + this.outputsUI.length) !== 0) {
            var radius = this.outputs.length > 0 ? this.outputs[0].style.radius : this.outputsUI[0].style.radius;
            outputTerminalsStripWidth = radius * 2 + this.style.terminalStripMargin;
        }
        this.offContext.fillRect(x, y, this.ui.width + inputTerminalsStripWidth + outputTerminalsStripWidth, this.renderState.nodeState === constants_1.NodeState.MAXIMIZED ? this.ui.height : this.style.titleHeight);
    };
    Node.prototype.onDown = function (screenPosition, realPosition) {
        this.call('down', this, screenPosition, realPosition);
        var hitColor = color_1.Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);
        this.currHitUINode = this.getHitUINode(hitColor);
        this.currHitUINode && this.currHitUINode.onDown(screenPosition, realPosition);
        var hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
        if (hitTerminal) {
            this.currHitTerminal = hitTerminal;
            this.currHitTerminal.onDown(screenPosition, realPosition);
        }
    };
    Node.prototype.onOver = function (screenPosition, realPosition) {
        this.call('over', this, screenPosition, realPosition);
        var hitColor = color_1.Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);
        var hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
        if (hitTerminal !== this.prevHitTerminal) {
            this.prevHitTerminal && this.prevHitTerminal.onExit(screenPosition, realPosition);
            hitTerminal && hitTerminal.onEnter(screenPosition, realPosition);
        }
        else {
            hitTerminal && (!this.currHitTerminal) && hitTerminal.onOver(screenPosition, realPosition);
        }
        this.prevHitTerminal = hitTerminal;
        var hitUINode = this.getHitUINode(hitColor);
        if (hitUINode !== this.prevHitUINode) {
            this.prevHitUINode && this.prevHitUINode.onExit(screenPosition, realPosition);
            hitUINode && hitUINode.onEnter(screenPosition, realPosition);
        }
        else {
            hitUINode && (!this.currHitUINode) && hitUINode.onOver(screenPosition, realPosition);
        }
        this.prevHitUINode = hitUINode;
    };
    Node.prototype.onEnter = function (screenPosition, realPosition) {
        this.call('enter', this, screenPosition, realPosition);
    };
    Node.prototype.onExit = function (screenPosition, realPosition) {
        this.call('exit', this, screenPosition, realPosition);
        var hitColor = color_1.Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);
        var hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
        hitTerminal && hitTerminal.onExit(screenPosition, realPosition);
        this.prevHitTerminal && this.prevHitTerminal.onExit(screenPosition, realPosition);
        this.prevHitTerminal = null;
        this.currHitTerminal && this.currHitTerminal.onExit(screenPosition, realPosition);
    };
    Node.prototype.onUp = function (screenPosition, realPosition) {
        this.call('up', this, screenPosition, realPosition);
        var hitColor = color_1.Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);
        this.currHitUINode = null;
        var hitUINode = this.getHitUINode(hitColor);
        hitUINode && hitUINode.onUp(screenPosition.clone(), realPosition.clone());
        var hitTerminal = this.getHitTerminal(hitColor, screenPosition, realPosition);
        hitTerminal && hitTerminal.onUp(screenPosition, realPosition);
    };
    Node.prototype.onClick = function (screenPosition, realPosition) {
        this.call('click', this, screenPosition, realPosition);
        var hitColor = color_1.Color.rgbaToString(this.flow.flowConnect.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data);
        if (realPosition.y < this.position.y + this.style.titleHeight * this.flow.flowConnect.scale) {
            var hitNodeButton = this.getHitNodeButton(hitColor);
            hitNodeButton && hitNodeButton.callback();
        }
        else {
            this.currHitTerminal && this.currHitTerminal.onClick(screenPosition, realPosition);
            var hitUINode = this.getHitUINode(hitColor);
            hitUINode && hitUINode.onClick(screenPosition.clone(), realPosition.clone());
        }
    };
    Node.prototype.onDrag = function (screenPosition, realPosition) {
        this.call('drag', this, screenPosition, realPosition);
        this.currHitUINode && this.currHitUINode.draggable && this.currHitUINode.onDrag(screenPosition, realPosition);
    };
    Node.prototype.onContextMenu = function () {
        this.call('rightclick', this);
    };
    Node.prototype.createLabel = function (text, propName, input, output, style) {
        return new index_1.Label(this, text, propName, input, output, style);
    };
    Node.prototype.createImage = function (source, propName, style) {
        return new index_1.Image(this, source, propName, style);
    };
    Node.prototype.createSlider = function (min, max, value, precision, propName, input, output, height, style) {
        return new index_1.Slider(this, min, max, value, precision, propName, input, output, height, style);
    };
    Node.prototype.createHozLayout = function (childs, style) {
        return new index_1.HorizontalLayout(this, childs, style);
    };
    Node.prototype.createButton = function (text, input, output, height, style) {
        return new index_1.Button(this, text, input, output, height, style);
    };
    Node.prototype.createToggle = function (propName, input, output, height, style) {
        return new index_1.Toggle(this, propName, input, output, height, style);
    };
    Node.prototype.createSelect = function (options, propName, input, output, height, style) {
        return new index_1.Select(this, options, propName, input, output, height, style);
    };
    Node.prototype.createSource = function (accept, propName, input, output, height, style) {
        return new index_1.Source(this, accept, propName, input, output, height, style);
    };
    Node.prototype.createDisplay = function (height, render, style) {
        return new index_1.Display(this, height, render, style);
    };
    Node.prototype.createInput = function (value, propName, input, output, height, style) {
        return new index_1.Input(this, value, propName, input, output, height, style);
    };
    Node.prototype.serialize = function () {
        return {
            id: this.id,
            name: this.name,
            position: this.position.serialize(),
            width: this.width,
            props: this.props,
            inputs: this.inputs.map(function (terminal) { return terminal.serialize(); }),
            outputs: this.outputs.map(function (terminal) { return terminal.serialize(); }),
            style: this.style,
            terminalStyle: this.terminalStyle,
            hitColor: this.hitColor.serialize(),
            zIndex: this.zIndex,
            focused: this.focused,
            renderState: this.renderState,
            ui: this.ui.serialize()
        };
    };
    Node.deSerialize = function (flow, data) {
        return new Node(flow, data.name, vector_1.Vector2.deSerialize(data.position), data.width, data.inputs, data.outputs, data.style, data.terminalStyle, data.props, data.id, color_1.Color.deSerialize(data.hitColor), data.ui);
    };
    return Node;
}(hooks_1.Hooks));
exports.Node = Node;


/***/ }),

/***/ 587:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.SubFlowNode = void 0;
var constants_1 = __webpack_require__(522);
var vector_1 = __webpack_require__(281);
var color_1 = __webpack_require__(278);
var flow_1 = __webpack_require__(894);
var node_1 = __webpack_require__(55);
var terminal_1 = __webpack_require__(900);
var SubFlowNode = (function (_super) {
    __extends(SubFlowNode, _super);
    function SubFlowNode(flow, name, position, width, style, terminalStyle, props, inputs, outputs, subFlow, id, hitColor) {
        if (style === void 0) { style = {}; }
        if (terminalStyle === void 0) { terminalStyle = {}; }
        if (props === void 0) { props = {}; }
        var _this = _super.call(this, flow, name, position, width, inputs ? inputs : [], outputs ? outputs : [], style, terminalStyle, props, id, hitColor) || this;
        _this.subFlow = subFlow;
        _this.subFlow.on('add-input', function (subFlow, tunnel) {
            var proxyTerminal = new terminal_1.Terminal(_this, constants_1.TerminalType.IN, tunnel.outputs[0].dataType, tunnel.outputs[0].name);
            tunnel.proxyTerminal = proxyTerminal;
            _this.addTerminal(proxyTerminal);
        });
        _this.subFlow.on('add-output', function (subFlow, tunnel) {
            var proxyTerminal = new terminal_1.Terminal(_this, constants_1.TerminalType.OUT, tunnel.inputs[0].dataType, tunnel.inputs[0].name);
            tunnel.proxyTerminal = proxyTerminal;
            _this.addTerminal(proxyTerminal);
        });
        _this.subFlow.inputs.forEach(function (inputNode, index) { return inputNode.proxyTerminal = _this.inputs[index]; });
        _this.subFlow.outputs.forEach(function (outputNode, index) { return outputNode.proxyTerminal = _this.outputs[index]; });
        _this.addNodeButton(function () {
            _this.flow.flowConnect.render(_this.subFlow);
        }, function (nodeButton, position) {
            _this.context.strokeStyle = _this.style.expandButtonColor;
            _this.context.beginPath();
            _this.context.moveTo(position.x, position.y + _this.style.nodeButtonSize / 2);
            _this.context.lineTo(position.x, position.y + _this.style.nodeButtonSize);
            _this.context.lineTo(position.x + _this.style.nodeButtonSize, position.y);
            _this.context.lineTo(position.x + _this.style.nodeButtonSize, position.y + _this.style.nodeButtonSize / 2);
            _this.context.moveTo(position.x + _this.style.nodeButtonSize, position.y);
            _this.context.lineTo(position.x + _this.style.nodeButtonSize / 2, position.y);
            _this.context.moveTo(position.x, position.y + _this.style.nodeButtonSize);
            _this.context.lineTo(position.x + _this.style.nodeButtonSize / 2, position.y + _this.style.nodeButtonSize);
            _this.context.closePath();
            _this.context.stroke();
        }, constants_1.Align.Right);
        return _this;
    }
    SubFlowNode.prototype.run = function () {
        if (this.flow.state === constants_1.FlowState.Stopped)
            return;
        this.call('process', this);
        this.subFlow.start();
    };
    SubFlowNode.prototype.serialize = function () {
        return {
            id: this.id,
            name: this.name,
            position: this.position.serialize(),
            width: this.width,
            props: this.props,
            inputs: this.inputs.map(function (terminal) { return terminal.serialize(); }),
            outputs: this.outputs.map(function (terminal) { return terminal.serialize(); }),
            style: this.style,
            terminalStyle: this.terminalStyle,
            hitColor: this.hitColor.serialize(),
            zIndex: this.zIndex,
            focused: this.focused,
            renderState: this.renderState,
            ui: this.ui.serialize(),
            subFlow: this.subFlow.serialize()
        };
    };
    SubFlowNode.deSerialize = function (flow, data) {
        var subFlow = flow_1.Flow.deSerialize(flow.flowConnect, data.subFlow);
        return new SubFlowNode(flow, data.name, vector_1.Vector2.deSerialize(data.position), data.width, data.style, data.terminalStyle, data.props, data.inputs, data.outputs, subFlow, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return SubFlowNode;
}(node_1.Node));
exports.SubFlowNode = SubFlowNode;


/***/ }),

/***/ 900:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Terminal = void 0;
var vector_1 = __webpack_require__(281);
var constants_1 = __webpack_require__(522);
var utils_1 = __webpack_require__(974);
var color_1 = __webpack_require__(278);
var connector_1 = __webpack_require__(907);
var hooks_1 = __webpack_require__(417);
var Terminal = (function (_super) {
    __extends(Terminal, _super);
    function Terminal(node, type, dataType, name, style, eventCallback, id, hitColor) {
        if (style === void 0) { style = {}; }
        var _this = _super.call(this) || this;
        _this.node = node;
        _this.type = type;
        _this.dataType = dataType;
        _this.name = name;
        _this.style = style;
        _this.eventCallback = eventCallback;
        _this.id = id;
        _this.hitColor = hitColor;
        _this.style = __assign(__assign({}, constants_1.Constant.DefaultTerminalStyle()), style);
        _this.id = id ? id : utils_1.getNewGUID();
        _this.setHitColor(hitColor);
        _this.connectors = [];
        _this.position = vector_1.Vector2.Zero();
        _this.focus = false;
        if (_this.type === constants_1.TerminalType.IN)
            _this['getData'] = function () {
                if (_this.connectors.length > 0)
                    return _this.connectors[0].data;
                return null;
            };
        else
            _this['setData'] = function (data) {
                _this.connectors.forEach(function (connector) { return connector.data = data; });
            };
        return _this;
    }
    Terminal.prototype.setHitColor = function (hitColor) {
        if (!hitColor) {
            hitColor = color_1.Color.Random();
            while (this.node.hitColorToTerminal[hitColor.rgbaString] || this.node.hitColorToUI[hitColor.rgbaString])
                hitColor = color_1.Color.Random();
        }
        this.hitColor = hitColor;
        this.node.hitColorToTerminal[this.hitColor.rgbaString] = this;
    };
    Terminal.prototype.render = function () {
        this.node.context.save();
        if (this.focus) {
            this.node.context.beginPath();
            this.node.context.arc(this.position.x, this.position.y, this.style.radius * 3, 0, 2 * Math.PI);
            this.node.context.fillStyle = this.style.focusColor;
            this.node.context.fill();
        }
        if (this.dataType === 'event') {
            this.node.context.beginPath();
            this.node.context.moveTo(this.position.x, this.position.y - this.style.radius * 1.3);
            this.node.context.lineTo(this.position.x + this.style.radius * 1.3, this.position.y);
            this.node.context.lineTo(this.position.x, this.position.y + this.style.radius * 1.3);
            this.node.context.lineTo(this.position.x - this.style.radius * 1.3, this.position.y);
            this.node.context.lineTo(this.position.x, this.position.y - this.style.radius * 1.3);
            this.node.context.closePath();
        }
        else {
            this.node.context.beginPath();
            this.node.context.arc(this.position.x, this.position.y, this.style.radius, 0, 2 * Math.PI);
        }
        this.node.context.fillStyle = this.focus ? '#00ff00' : (this.node.flow.terminalTypeColors[this.dataType] || '#888');
        this.node.context.strokeStyle = this.style.borderColor;
        this.node.context.shadowBlur = this.style.shadowBlur;
        this.node.context.shadowColor = this.style.shadowColor;
        this.node.context.fill();
        this.node.context.stroke();
        this.node.context.restore();
        this.offUIRender();
    };
    Terminal.prototype.offUIRender = function () {
        this.node.offUIContext.save();
        this.node.offUIContext.beginPath();
        this.node.offUIContext.arc(this.position.x, this.position.y, this.style.radius + this.node.style.terminalStripMargin, 0, 2 * Math.PI);
        this.node.offUIContext.fillStyle = this.hitColor.rgbaCSSString;
        this.node.offUIContext.fill();
        this.node.offUIContext.restore();
    };
    Terminal.prototype.onEnter = function (screenPosition, realPosition) {
        this.call('enter', this, screenPosition, realPosition);
        this.focus = true;
        this.node.flow.flowConnect.cursor = 'pointer';
    };
    Terminal.prototype.onExit = function (screenPosition, realPosition) {
        this.call('exit', this, screenPosition, realPosition);
        this.focus = false;
        this.node.flow.flowConnect.cursor = 'unset';
    };
    Terminal.prototype.onDown = function (screenPosition, realPosition) {
        this.call('down', this, screenPosition, realPosition);
        if (this.connectors.length > 0) {
            if (this.type === constants_1.TerminalType.IN) {
                this.connectors[0].endNode.currHitTerminal = null;
                this.connectors[0].end = null;
                this.connectors[0].floatingTip = realPosition;
                this.node.flow.flowConnect.floatingConnector = this.connectors[0];
                this.connectors[0].start.call('disconnect', this.connectors[0].start, this.connectors[0]);
                this.call('disconnect', this, this.connectors[0]);
                this.connectors.pop();
            }
            else {
                if (this.node.flow.flowConnect.floatingConnector)
                    return;
                var connector = new connector_1.Connector(this.node.flow, this, null, realPosition, {});
                this.node.flow.connectors[connector.id] = connector;
                this.node.flow.flowConnect.floatingConnector = connector;
            }
        }
        else {
            if (this.node.flow.flowConnect.floatingConnector)
                return;
            var connector = new connector_1.Connector(this.node.flow, this.type === constants_1.TerminalType.IN ? null : this, this.type === constants_1.TerminalType.IN ? this : null, realPosition, {});
            this.node.flow.connectors[connector.id] = connector;
            this.node.flow.flowConnect.floatingConnector = connector;
        }
    };
    Terminal.prototype.onUp = function (screenPosition, realPosition) {
        this.call('up', this, screenPosition, realPosition);
    };
    Terminal.prototype.onDrag = function (screenPosition, realPosition) {
        this.call('drag', this, screenPosition, realPosition);
    };
    Terminal.prototype.onClick = function (screenPosition, realPosition) {
        this.call('click', this, screenPosition, realPosition);
    };
    Terminal.prototype.onOver = function (screenPosition, realPosition) {
        this.call('over', this, screenPosition, realPosition);
    };
    Terminal.prototype.onContextMenu = function () {
        this.call('rightclick', this);
    };
    Terminal.prototype.onEvent = function (data) {
        if (this.type === constants_1.TerminalType.IN && this.eventCallback)
            this.eventCallback(data);
    };
    Terminal.prototype.emit = function (data) {
        if (this.type === constants_1.TerminalType.OUT && this.connectors.length !== 0) {
            this.connectors.forEach(function (connector) {
                connector.end && connector.end.onEvent(data);
            });
        }
    };
    Terminal.prototype.serialize = function () {
        return {
            id: this.id,
            type: this.type,
            dataType: this.dataType,
            name: this.name,
            style: this.style,
            hitColor: this.hitColor.serialize()
        };
    };
    Terminal.deSerialize = function (node, data) {
        return new Terminal(node, data.type, data.dataType, data.name, data.style, null, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return Terminal;
}(hooks_1.Hooks));
exports.Terminal = Terminal;


/***/ }),

/***/ 915:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TunnelNode = void 0;
var vector_1 = __webpack_require__(281);
var color_1 = __webpack_require__(278);
var node_1 = __webpack_require__(55);
var TunnelNode = (function (_super) {
    __extends(TunnelNode, _super);
    function TunnelNode(flow, nodeName, position, width, inputs, outputs, style, terminalStyle, props, id, hitColor) {
        var _this = _super.call(this, flow, nodeName, position, width, inputs, outputs, style, terminalStyle, props, id, hitColor) || this;
        if (_this.inputs.length > 0) {
            _this.inputs[0].on('data', function (data) {
                _this.proxyTerminal['setData'](data);
            });
        }
        else {
            _this.outputs[0].on('connect', function (terminal, connector) {
                if (_this.proxyTerminal.connectors.length > 0) {
                    connector.data = _this.proxyTerminal.connectors[0].data;
                }
            });
        }
        return _this;
    }
    Object.defineProperty(TunnelNode.prototype, "proxyTerminal", {
        get: function () { return this._proxyTerminal; },
        set: function (terminal) {
            var _this = this;
            this._proxyTerminal = terminal;
            this._proxyTerminal.on('data', function (data) {
                _this.outputs[0]['setData'](data);
            });
        },
        enumerable: false,
        configurable: true
    });
    TunnelNode.prototype.serialize = function () {
        return {
            id: this.id,
            name: this.name,
            position: this.position.serialize(),
            width: this.width,
            props: this.props,
            inputs: this.inputs.map(function (terminal) { return terminal.serialize(); }),
            outputs: this.outputs.map(function (terminal) { return terminal.serialize(); }),
            style: this.style,
            terminalStyle: this.terminalStyle,
            hitColor: this.hitColor.serialize(),
            zIndex: this.zIndex,
            focused: this.focused,
            renderState: this.renderState,
            ui: this.ui.serialize(),
            proxyTerminalId: this.proxyTerminal.id
        };
    };
    TunnelNode.deSerialize = function (flow, data) {
        return new TunnelNode(flow, data.name, vector_1.Vector2.deSerialize(data.position), data.width, data.inputs, data.outputs, data.style, data.terminalStyle, data.props, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return TunnelNode;
}(node_1.Node));
exports.TunnelNode = TunnelNode;


/***/ }),

/***/ 184:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FlowConnect = void 0;
var index_1 = __webpack_require__(676);
var vector_1 = __webpack_require__(281);
var constants_1 = __webpack_require__(522);
var utils_1 = __webpack_require__(974);
var FlowConnect = (function (_super) {
    __extends(FlowConnect, _super);
    function FlowConnect(mount, width, height) {
        var _this = _super.call(this) || this;
        _this.canvasDimensions = { top: 0, left: 0, width: 0, height: 0 };
        _this.pointers = [];
        _this.keymap = {};
        _this.touchControls = { 'CreateGroup': false };
        _this.minScale = 0.1;
        _this.maxScale = 5;
        _this.wheelScaleDelta = 1.05;
        _this.pinchScaleDelta = 1.02;
        _this.genericInput = document.createElement('input');
        _this.transform = new DOMMatrix();
        _this.inverseTransform = new DOMMatrix();
        _this.identity = new DOMMatrix();
        _this.prepareCanvas(mount, width, height);
        _this.setupHitCanvas();
        _this.calculateCanvasDimension();
        _this.registerChangeListeners();
        _this.attachStyles();
        _this.polyfill();
        _this.registerEvents();
        _this.setGenericInput();
        return _this;
    }
    Object.defineProperty(FlowConnect.prototype, "cursor", {
        get: function () { return this.canvasElement.style.cursor; },
        set: function (cursor) { this.canvasElement.style.cursor = cursor; },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FlowConnect.prototype, "scale", {
        get: function () { return this.transform.a; },
        enumerable: false,
        configurable: true
    });
    FlowConnect.prototype.registerChangeListeners = function () {
        var _this = this;
        var throttle = false;
        document.addEventListener('scroll', function () {
            if (!throttle) {
                window.requestAnimationFrame(function () {
                    _this.calculateCanvasDimension();
                    throttle = false;
                });
                throttle = true;
            }
        });
        var resizeObserver = new ResizeObserver(function () {
            _this.calculateCanvasDimension();
        });
        resizeObserver.observe(this.canvasElement);
    };
    FlowConnect.prototype.prepareCanvas = function (mount, width, height) {
        if (!mount) {
            this.canvasElement = document.createElement('canvas');
            this.canvasElement.width = document.body.clientWidth;
            this.canvasElement.height = document.body.clientHeight;
            document.body.appendChild(this.canvasElement);
        }
        else if (mount instanceof HTMLDivElement) {
            this.canvasElement = document.createElement('canvas');
            if (width && height) {
                this.canvasElement.width = width;
                this.canvasElement.height = height;
            }
            else {
                this.canvasElement.width = mount.clientWidth;
                this.canvasElement.height = mount.clientHeight;
            }
            mount.appendChild(this.canvasElement);
        }
        else {
            this.canvasElement = mount;
            if (width && height) {
                this.canvasElement.width = width;
                this.canvasElement.height = height;
            }
        }
        this.context = this.canvasElement.getContext('2d');
    };
    FlowConnect.prototype.setupHitCanvas = function () {
        if (typeof OffscreenCanvas !== 'undefined' && typeof OffscreenCanvasRenderingContext2D !== 'undefined') {
            this.offCanvasElement = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
            this.offUICanvasElement = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
            this.offGroupCanvasElement = new OffscreenCanvas(this.canvasDimensions.width, this.canvasDimensions.height);
        }
        else {
            this.offCanvasElement = document.createElement('canvas');
            this.offUICanvasElement = document.createElement('canvas');
            this.offGroupCanvasElement = document.createElement('canvas');
        }
        this.offContext = this.offCanvasElement.getContext('2d');
        this.offUIContext = this.offUICanvasElement.getContext('2d');
        this.offGroupContext = this.offGroupCanvasElement.getContext('2d');
    };
    FlowConnect.prototype.attachStyles = function () {
        this.canvasElement.style.touchAction = 'none';
        var inputStyle = document.createElement('style');
        inputStyle.innerHTML = 'input.flow-connect-input { position: fixed; visibility: hidden; pointer-events: none; z-index: 100; border: none; border-radius: 0; box-sizing: border-box;} input.flow-connect-input:focus { outline: none; }';
        document.getElementsByTagName('head')[0].appendChild(inputStyle);
    };
    FlowConnect.prototype.calculateCanvasDimension = function () {
        var boundingRect = this.canvasElement.getBoundingClientRect();
        this.canvasDimensions = {
            top: Math.round(boundingRect.top - window.scrollY),
            left: Math.round(boundingRect.left - window.scrollX),
            width: Math.round(boundingRect.width),
            height: Math.round(boundingRect.height)
        };
        this.offCanvasElement.width = this.canvasDimensions.width;
        this.offCanvasElement.height = this.canvasDimensions.height;
        this.offUICanvasElement.width = this.canvasDimensions.width;
        this.offUICanvasElement.height = this.canvasDimensions.height;
        this.offGroupCanvasElement.width = this.canvasDimensions.width;
        this.offGroupCanvasElement.height = this.canvasDimensions.height;
    };
    FlowConnect.prototype.polyfill = function () {
        CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius) {
            this.beginPath();
            this.moveTo(x + radius, y);
            this.lineTo(x + width - radius, y);
            this.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.lineTo(x + width, y + height - radius);
            this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.lineTo(x + radius, y + height);
            this.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.lineTo(x, y + radius);
            this.quadraticCurveTo(x, y, x + radius, y);
            this.closePath();
        };
        CanvasRenderingContext2D.prototype.strokeRoundRect = function (x, y, width, height, radius) {
            if (typeof radius === 'undefined')
                radius = 5;
            this.roundRect(x, y, width, height, radius);
            this.stroke();
        };
        CanvasRenderingContext2D.prototype.fillRoundRect = function (x, y, width, height, radius) {
            if (typeof radius === 'undefined')
                radius = 5;
            this.roundRect(x, y, width, height, radius);
            this.fill();
        };
    };
    FlowConnect.prototype.createFlow = function (options) {
        if (options === void 0) { options = { name: 'New Flow', rules: {}, terminalTypeColors: {} }; }
        Object.keys(constants_1.Constant.DefaultRules).forEach(function (key) { return options.rules[key] = constants_1.Constant.DefaultRules[key]; });
        return new index_1.Flow(this, options.name, options.rules, options.terminalTypeColors);
    };
    FlowConnect.prototype.registerEvents = function () {
        var _this = this;
        var dragDelta;
        var prevPanPosition = vector_1.Vector2.Zero();
        var prevPinchDistance = -1;
        window.onkeydown = function (ev) {
            !_this.keymap[ev.key] && (_this.keymap[ev.key] = true);
        };
        window.onkeyup = function (ev) {
            _this.keymap[ev.key] = false;
        };
        this.canvasElement.onpointerdown = function (ev) {
            if (!_this.currFlow)
                return;
            _this.addPointer(ev.pointerId, _this.getRelativePosition(ev));
            if (_this.pointers.length === 1) {
                prevPanPosition = _this.pointers[0].screenPosition;
                _this.currHitNode = _this.getHitNode(_this.pointers[0].screenPosition);
                if (_this.currHitNode) {
                    _this.currHitNode.zIndex = Infinity;
                    if (_this.keymap['Control']) {
                        _this.currHitNode.focused = !_this.currHitNode.focused;
                    }
                    else {
                        _this.currFlow.removeAllFocus();
                        _this.currHitNode.focused = true;
                    }
                    _this.currHitNode.onDown(_this.pointers[0].screenPosition.clone(), _this.pointers[0].realPosition.clone());
                    dragDelta = _this.currHitNode.position.subtract(_this.pointers[0].realPosition);
                }
                else {
                    if (!_this.keymap['Control']) {
                        _this.currFlow.removeAllFocus();
                        _this.currHitGroup = _this.getHitGroup(_this.pointers[0].screenPosition);
                        _this.currHitGroup && (dragDelta = _this.currHitGroup.position.subtract(_this.pointers[0].realPosition));
                    }
                    else if (_this.keymap['Control'] || _this.touchControls['CreateGroup']) {
                        _this.groupStartPoint = _this.pointers[0].realPosition.clone();
                        _this.currGroup = new index_1.Group(_this.currFlow, _this.groupStartPoint.clone(), 0, 0, 'New Group');
                    }
                }
            }
            else {
                _this.currHitNode = null;
                _this.currHitGroup = null;
                _this.currFlow.removeAllFocus();
                if (_this.floatingConnector) {
                    _this.fallbackConnection();
                }
            }
        };
        this.canvasElement.onpointerup = function (ev) {
            if (!_this.currFlow)
                return;
            _this.removePointer(_this.pointers, ev);
            if (_this.pointers.length < 2)
                prevPinchDistance = -1;
            var screenPosition = _this.getRelativePosition(ev);
            var realPosition = screenPosition.transform(_this.inverseTransform);
            if (_this.currHitNode)
                _this.handleGrouping(screenPosition);
            _this.currHitNode = null;
            _this.currHitGroup = null;
            var hitNode = _this.getHitNode(screenPosition);
            hitNode && hitNode.onUp(screenPosition.clone(), realPosition.clone());
            if (_this.currGroup) {
                var newGroup = _this.currGroup;
                _this.currGroup = null;
                if (newGroup.width > 10 && newGroup.height > 10) {
                    _this.currFlow.groups.push(newGroup);
                    newGroup.setContainedNodes();
                }
            }
            if (_this.floatingConnector)
                _this.handleConnection(hitNode, screenPosition, realPosition);
        };
        this.canvasElement.onpointerout = function (ev) {
            if (!_this.currFlow)
                return;
            _this.removePointer(_this.pointers, ev);
            if (_this.pointers.length === 0) {
                if (_this.currHitNode) {
                    var screenPosition = _this.getRelativePosition(ev);
                    _this.handleGrouping(screenPosition);
                }
                _this.currHitNode = null;
                _this.currHitGroup = null;
            }
            if (_this.currGroup) {
                var newGroup = _this.currGroup;
                _this.currGroup = null;
                if (newGroup.width > 10 && newGroup.height > 10) {
                    _this.currFlow.groups.push(newGroup);
                    newGroup.setContainedNodes();
                }
            }
            if (_this.floatingConnector)
                _this.fallbackConnection();
            if (_this.prevHitNode) {
                var screenPosition = _this.getRelativePosition(ev);
                var realPosition = screenPosition.transform(_this.inverseTransform);
                _this.prevHitNode.onExit(screenPosition, realPosition);
                _this.prevHitNode = null;
            }
        };
        this.canvasElement.onpointermove = function (ev) {
            if (!_this.currFlow)
                return;
            var screenPosition = _this.getRelativePosition(ev);
            var realPosition = screenPosition.transform(_this.inverseTransform);
            _this.updatePointer(ev.pointerId, screenPosition, realPosition);
            if (_this.pointers.length === 2) {
                var currPinchDistance = vector_1.Vector2.Distance(_this.pointers[0].screenPosition, _this.pointers[1].screenPosition);
                if (prevPinchDistance > 0) {
                    if (currPinchDistance !== prevPinchDistance) {
                        _this.handleZoom(currPinchDistance > prevPinchDistance, vector_1.Vector2.Midpoint(_this.pointers[0].screenPosition, _this.pointers[1].screenPosition), _this.pinchScaleDelta);
                    }
                }
                prevPinchDistance = currPinchDistance;
            }
            if (_this.currGroup) {
                if (realPosition.x < _this.groupStartPoint.x)
                    _this.currGroup._position.x = realPosition.x;
                _this.currGroup.width = Math.abs(_this.groupStartPoint.x - realPosition.x);
                if (realPosition.y < _this.groupStartPoint.y)
                    _this.currGroup._position.y = realPosition.y;
                _this.currGroup.height = Math.abs(_this.groupStartPoint.y - realPosition.y);
            }
            if (_this.currHitNode) {
                _this.currHitNode.onDrag(screenPosition.clone(), realPosition.clone());
                if ((!_this.currHitNode.currHitUINode || !_this.currHitNode.currHitUINode.draggable) && !_this.currHitNode.currHitTerminal && !_this.floatingConnector) {
                    _this.currHitNode.position = realPosition.add(dragDelta);
                    var hitGroup = _this.getHitGroup(screenPosition);
                    if (hitGroup && hitGroup === _this.currHitNode.group) {
                        var groupRealPos = hitGroup.position.transform(_this.transform);
                        var nodeRealPos = _this.currHitNode.position.transform(_this.transform);
                        var intersection = utils_1.intersects(groupRealPos.x, groupRealPos.y, groupRealPos.x + hitGroup.width * _this.scale, groupRealPos.y + hitGroup.height * _this.scale, nodeRealPos.x, nodeRealPos.y, nodeRealPos.x + _this.currHitNode.width * _this.scale, nodeRealPos.y + _this.currHitNode.ui.height * _this.scale);
                        if (intersection === constants_1.ViewPort.INSIDE) {
                            var nodeIndex = hitGroup.nodes.findIndex(function (node) { return node.id === _this.currHitNode.id; });
                            hitGroup.nodeDeltas[nodeIndex] = _this.currHitNode.position.subtract(hitGroup.position);
                        }
                    }
                }
            }
            else {
                if (_this.currHitGroup) {
                    _this.currHitGroup.position = realPosition.add(dragDelta);
                }
                else if (_this.pointers.length === 1 && !_this.keymap['Control'] && !_this.touchControls['CreateGroup']) {
                    var delta = screenPosition.subtract(prevPanPosition).multiplyInPlace(1 / _this.scale);
                    prevPanPosition = screenPosition;
                    _this.updateTransform(null, null, delta);
                }
            }
            if (_this.floatingConnector)
                _this.floatingConnector.floatingTip = realPosition;
            if (ev.pointerType === 'mouse' && !_this.currHitNode) {
                var hitNode = _this.getHitNode(screenPosition);
                if (hitNode !== _this.prevHitNode) {
                    _this.prevHitNode && _this.prevHitNode.onExit(screenPosition, realPosition);
                    hitNode && hitNode.onEnter(screenPosition, realPosition);
                }
                else {
                    hitNode && (!_this.currHitNode) && hitNode.onOver(screenPosition, realPosition);
                }
                _this.prevHitNode = hitNode;
            }
        };
        this.canvasElement.onclick = function (ev) {
            if (!_this.currFlow)
                return;
            var screenPosition = _this.getRelativePosition(ev);
            var realPosition = screenPosition.transform(_this.inverseTransform);
            var hitNode = _this.getHitNode(screenPosition);
            hitNode && hitNode.onClick(screenPosition.clone(), realPosition.clone());
            if (!hitNode) {
                var hitGroup = _this.getHitGroup(screenPosition);
                hitGroup && hitGroup.onClick(screenPosition.clone(), realPosition.clone());
            }
        };
        this.canvasElement.oncontextmenu = function (ev) {
            if (!_this.currFlow)
                return;
            ev.preventDefault();
            var screenPosition = _this.getRelativePosition(ev);
            var hitNode = _this.getHitNode(screenPosition);
            hitNode && hitNode.onContextMenu();
            if (!_this.keymap['Control'])
                _this.currFlow.removeAllFocus();
            hitNode && (hitNode.focused = true);
        };
        this.canvasElement.onwheel = function (ev) {
            if (!_this.currFlow)
                return;
            _this.handleZoom(ev.deltaY < 0, _this.getRelativePosition(ev), _this.wheelScaleDelta);
        };
    };
    FlowConnect.prototype.setGenericInput = function () {
        var _this = this;
        this.genericInput.className = 'flow-connect-input';
        this.genericInput.style.visibility = 'hidden';
        this.genericInput.style.pointerEvents = 'none';
        this.genericInput.style.padding = '0';
        this.genericInput.onblur = function () {
            _this.genericInput.style.visibility = 'hidden';
            _this.genericInput.style.pointerEvents = 'none';
            _this.genericInput.onchange = null;
        };
        document.body.appendChild(this.genericInput);
    };
    FlowConnect.prototype.showGenericInput = function (position, value, styles, attributes, callback) {
        var _this = this;
        if (document.activeElement === this.genericInput)
            return;
        Object.keys(styles).forEach(function (key) { return _this.genericInput.style[key] = styles[key]; });
        Object.keys(attributes).forEach(function (key) { return _this.genericInput[key] = attributes[key]; });
        this.genericInput.style.left = (position.x + this.canvasDimensions.left) + 'px';
        this.genericInput.style.top = (position.y + this.canvasDimensions.top - 3) + 'px';
        this.genericInput.style.visibility = 'visible';
        this.genericInput.style.pointerEvents = 'all';
        this.genericInput.value = value;
        this.genericInput.onchange = function () { return callback(_this.genericInput.value); };
        this.genericInput.focus();
    };
    FlowConnect.prototype.updatePointer = function (id, screenPosition, realPosition) {
        var pointer = this.pointers.find(function (pointer) { return pointer.id === id; });
        if (pointer) {
            pointer.screenPosition = screenPosition;
            pointer.realPosition = realPosition;
        }
    };
    FlowConnect.prototype.handleZoom = function (zoomIn, origin, scaleDelta) {
        if ((this.transform.a >= this.maxScale && zoomIn) || (this.transform.a <= this.minScale && !zoomIn))
            return;
        this.updateTransform(zoomIn ? scaleDelta : (1 / scaleDelta), origin, null);
    };
    FlowConnect.prototype.handleGrouping = function (screenPosition) {
        var _this = this;
        var hitGroup = this.getHitGroup(screenPosition);
        var intersection;
        if (hitGroup) {
            var groupRealPos = hitGroup.position.transform(this.transform);
            var nodeRealPos = this.currHitNode.position.transform(this.transform);
            intersection = utils_1.intersects(groupRealPos.x, groupRealPos.y, groupRealPos.x + hitGroup.width * this.scale, groupRealPos.y + hitGroup.height * this.scale, nodeRealPos.x, nodeRealPos.y, nodeRealPos.x + this.currHitNode.width * this.scale, nodeRealPos.y + this.currHitNode.ui.height * this.scale);
        }
        if (this.currHitNode.group) {
            if (this.currHitNode.group !== hitGroup) {
                var nodeIndex = this.currHitNode.group.nodes.findIndex(function (node) { return node.id === _this.currHitNode.id; });
                this.currHitNode.group.nodes.splice(nodeIndex, 1);
                this.currHitNode.group.nodeDeltas.splice(nodeIndex, 1);
                this.currHitNode.group = null;
            }
            else {
                if (intersection !== constants_1.ViewPort.INSIDE) {
                    var nodeIndex = this.currHitNode.group.nodes.findIndex(function (node) { return node.id === _this.currHitNode.id; });
                    this.currHitNode.group.nodes.splice(nodeIndex, 1);
                    this.currHitNode.group.nodeDeltas.splice(nodeIndex, 1);
                    this.currHitNode.group = null;
                }
            }
        }
        if (hitGroup) {
            if (intersection === constants_1.ViewPort.INSIDE) {
                this.currHitNode.group = hitGroup;
                hitGroup.nodes.push(this.currHitNode);
                hitGroup.nodeDeltas.push(this.currHitNode.position.subtract(hitGroup.position));
            }
        }
    };
    FlowConnect.prototype.handleConnection = function (hitNode, screenPosition, realPosition) {
        if (!hitNode) {
            this.fallbackConnection();
            return;
        }
        var hitTerminal = hitNode.getHitTerminal(index_1.Color.rgbaToString(this.offUIContext.getImageData(screenPosition.x, screenPosition.y, 1, 1).data), screenPosition.clone(), realPosition.clone());
        if (hitTerminal)
            hitNode.currHitTerminal = hitTerminal;
        if (!hitTerminal) {
            this.fallbackConnection();
            return;
        }
        var destination = hitNode.currHitTerminal;
        if (!this.floatingConnector.canConnect(destination)) {
            this.fallbackConnection();
            hitNode.currHitTerminal = null;
            return;
        }
        else {
            if (destination.type === constants_1.TerminalType.OUT) {
                this.floatingConnector.completeConnection(destination);
                hitNode.currHitTerminal = null;
            }
            else {
                if (destination.connectors.length > 0) {
                    if (destination.connectors[0].start === this.floatingConnector.start) {
                        this.fallbackConnection();
                        hitNode.currHitTerminal = null;
                        return;
                    }
                    var index = destination.connectors[0].start.connectors.indexOf(destination.connectors[0]);
                    var oldConnector = destination.connectors[0].start.connectors.splice(index, 1)[0];
                    delete this.currFlow.connectors[oldConnector.id];
                    oldConnector.start.call('disconnect', oldConnector.start, oldConnector);
                    oldConnector.end.call('disconnect', oldConnector.end, oldConnector);
                    this.floatingConnector.completeConnection(destination);
                    hitNode.currHitTerminal = null;
                }
                else {
                    this.floatingConnector.completeConnection(destination);
                    hitNode.currHitTerminal = null;
                }
            }
            this.floatingConnector = null;
        }
    };
    FlowConnect.prototype.getRelativePosition = function (ev) {
        return new vector_1.Vector2(ev.clientX - this.canvasDimensions.left, ev.clientY - this.canvasDimensions.top);
    };
    FlowConnect.prototype.updateTransform = function (scale, scaleOrigin, translate) {
        if (scale) {
            var realSpaceOrigin = scaleOrigin.transform(this.inverseTransform);
            this.transform
                .translateSelf(realSpaceOrigin.x, realSpaceOrigin.y)
                .scaleSelf(scale, scale)
                .translateSelf(-realSpaceOrigin.x, -realSpaceOrigin.y);
        }
        if (translate) {
            this.transform.translateSelf(translate.x, translate.y);
        }
        this.inverseTransform = this.transform.inverse();
        this.context.setTransform(this.transform);
        this.offContext.setTransform(this.transform);
        this.offUIContext.setTransform(this.transform);
        this.offGroupContext.setTransform(this.transform);
        this.call('transform', this);
    };
    FlowConnect.prototype.fallbackConnection = function () {
        this.floatingConnector.removeConnection();
        this.currFlow.removeConnector(this.floatingConnector.id);
    };
    FlowConnect.prototype.addPointer = function (pointerId, position) {
        this.pointers.push({
            id: pointerId,
            screenPosition: position,
            realPosition: position.transform(this.inverseTransform)
        });
    };
    FlowConnect.prototype.removePointer = function (pointers, ev) {
        pointers.splice(pointers.findIndex(function (pointer) { return pointer.id === ev.pointerId; }), 1);
    };
    FlowConnect.prototype.getHitNode = function (position) {
        var rgbaString = index_1.Color.rgbaToString(this.offContext.getImageData(position.x, position.y, 1, 1).data);
        return this.currFlow.hitColorToNode[rgbaString];
    };
    FlowConnect.prototype.getHitGroup = function (position) {
        var rgbaString = index_1.Color.rgbaToString(this.offGroupContext.getImageData(position.x, position.y, 1, 1).data);
        return this.currFlow.hitColorToGroup[rgbaString];
    };
    FlowConnect.prototype.clear = function () {
        this.context.save();
        this.context.setTransform(this.identity);
        this.context.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
        this.context.restore();
        this.offContext.save();
        this.offContext.setTransform(this.identity);
        this.offContext.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
        this.offContext.restore();
        this.offUIContext.save();
        this.offUIContext.setTransform(this.identity);
        this.offUIContext.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
        this.offUIContext.restore();
        this.offGroupContext.save();
        this.offGroupContext.setTransform(this.identity);
        this.offGroupContext.clearRect(0, 0, this.canvasDimensions.width, this.canvasDimensions.height);
        this.offGroupContext.restore();
    };
    FlowConnect.prototype.top = function () {
        this.render(this.rootFlow);
    };
    FlowConnect.prototype.render = function (flow) {
        if (flow === this.currFlow)
            return;
        if (this.currFlow) {
            window.cancelAnimationFrame(this.frameId);
            this.currFlow.deregisterListeners();
        }
        if (!this.rootFlow || !this.rootFlow.existsInFlow(flow)) {
            this.rootFlow = flow;
        }
        this.currFlow = flow;
        this._render();
    };
    FlowConnect.prototype._render = function () {
        this.clear();
        this.currGroup && this.currGroup.render();
        this.currFlow.render();
        this.call('update', this);
        this.frameId = window.requestAnimationFrame(this._render.bind(this));
    };
    FlowConnect.prototype.fromJson = function (json) {
        var data;
        var flow = null;
        try {
            data = JSON.parse(json);
            flow = index_1.Flow.deSerialize(this, data);
        }
        catch (error) {
            console.log(error);
        }
        return flow;
    };
    FlowConnect.prototype.toJson = function (flow) {
        var serializedFlow = flow.serialize();
        try {
            return JSON.stringify(serializedFlow, null);
        }
        catch (error) {
            console.log(error);
        }
    };
    return FlowConnect;
}(index_1.Hooks));
exports.FlowConnect = FlowConnect;
__exportStar(__webpack_require__(676), exports);
__exportStar(__webpack_require__(81), exports);
__exportStar(__webpack_require__(637), exports);
__exportStar(__webpack_require__(928), exports);


/***/ }),

/***/ 522:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.GraphState = exports.FlowState = exports.UIType = exports.Align = exports.InputType = exports.TerminalType = exports.LOD = exports.NodeState = exports.ViewPort = exports.Constant = void 0;
var vector_1 = __webpack_require__(281);
var Constant = (function () {
    function Constant() {
    }
    Constant.TAU = (Math.PI / 180);
    Constant.DefaultRules = { 'string': ['string'], 'number': ['number'], 'boolean': ['boolean'], 'file': ['file'], 'event': ['event'] };
    Constant.DefaultGroupColors = {
        colors: [
            ['rgba(239, 134, 119, 1)', 'rgba(239, 134, 119, .5)'],
            ['rgba(160, 231, 125, 1)', 'rgba(160, 231, 125, .5)'],
            ['rgba(130, 182, 217, 1)', 'rgba(130, 182, 217, .5)']
        ],
        RED: function () { return Constant.DefaultGroupColors.colors[0]; },
        GREEN: function () { return Constant.DefaultGroupColors.colors[1]; },
        BLUE: function () { return Constant.DefaultGroupColors.colors[2]; },
        Random: function () { return Constant.DefaultGroupColors.colors[Math.floor(Math.random() * (Constant.DefaultGroupColors.colors.length - 1))]; }
    };
    Constant.DefaultNodeStyle = function () {
        return {
            font: 'arial',
            fontSize: '.75rem',
            titleFont: 'arial',
            titleFontSize: '.85rem',
            color: '#000',
            titleColor: '#000',
            maximizeButtonColor: 'darkgrey',
            nodeButtonSize: 10,
            nodeButtonSpacing: 5,
            expandButtonColor: '#000',
            padding: 10,
            spacing: 10,
            rowHeight: 20,
            titleHeight: 29,
            terminalRowHeight: 24,
            terminalStripMargin: 8
        };
    };
    Constant.DefaultConnectorStyle = function () {
        return {
            width: 5,
            color: '#7fff00aa'
        };
    };
    Constant.DefaultGroupStyle = function () {
        return {
            titleColor: '#000',
            fontSize: '16px',
            font: 'arial'
        };
    };
    Constant.DefaultTerminalStyle = function () {
        return {
            radius: 4,
            borderColor: '#222',
            shadowBlur: 0,
            shadowColor: '#ccc',
            focusColor: '#bbbbbb80'
        };
    };
    Constant.DefaultButtonStyle = function () {
        return {
            backgroundColor: '#666',
            padding: 5,
            color: '#fff',
            font: 'arial',
            fontSize: '11px'
        };
    };
    Constant.DefaultContainerStyle = function () {
        return {
            backgroundColor: '#dddddd',
            shadowColor: '#666',
            shadowBlur: 3,
            shadowOffset: new vector_1.Vector2(3, 3),
            borderWidth: 1,
            borderColor: '#444'
        };
    };
    Constant.DefaultDisplayStyle = function () {
        return {
            borderColor: '#000'
        };
    };
    Constant.DefaultHorizontalLayoutStyle = function () {
        return {};
    };
    Constant.DefaultImageStyle = function () {
        return {
            align: 'left'
        };
    };
    Constant.DefaultInputStyle = function () {
        return {
            backgroundColor: '#eee',
            color: '#000',
            fontSize: '11px',
            font: 'arial',
            border: '1px solid black',
            align: 'left',
            type: InputType.Text
        };
    };
    Constant.DefaultLabelStyle = function () {
        return {
            color: '#000',
            fontSize: '11px',
            font: 'arial',
            align: 'left'
        };
    };
    Constant.DefaultSelectStyle = function () {
        return {
            arrowColor: '#000'
        };
    };
    Constant.DefaultSliderStyle = function (height) {
        return {
            color: '#444',
            thumbColor: '#000',
            railHeight: 3,
            thumbRadius: height / 2
        };
    };
    Constant.DefaultSourceStyle = function () {
        return {
            borderColor: '#000'
        };
    };
    Constant.DefaultToggleStyle = function () {
        return {
            backgroundColor: '#999',
            color: '#000'
        };
    };
    return Constant;
}());
exports.Constant = Constant;
var ViewPort;
(function (ViewPort) {
    ViewPort[ViewPort["INSIDE"] = 0] = "INSIDE";
    ViewPort[ViewPort["OUTSIDE"] = 1] = "OUTSIDE";
    ViewPort[ViewPort["INTERSECT"] = 2] = "INTERSECT";
})(ViewPort = exports.ViewPort || (exports.ViewPort = {}));
var NodeState;
(function (NodeState) {
    NodeState[NodeState["MAXIMIZED"] = 0] = "MAXIMIZED";
    NodeState[NodeState["MINIMIZED"] = 1] = "MINIMIZED";
})(NodeState = exports.NodeState || (exports.NodeState = {}));
var LOD;
(function (LOD) {
    LOD[LOD["LOD0"] = 0] = "LOD0";
    LOD[LOD["LOD1"] = 1] = "LOD1";
    LOD[LOD["LOD2"] = 2] = "LOD2";
})(LOD = exports.LOD || (exports.LOD = {}));
var TerminalType;
(function (TerminalType) {
    TerminalType[TerminalType["IN"] = 1] = "IN";
    TerminalType[TerminalType["OUT"] = 2] = "OUT";
})(TerminalType = exports.TerminalType || (exports.TerminalType = {}));
var InputType;
(function (InputType) {
    InputType["Text"] = "text";
    InputType["Number"] = "number";
})(InputType = exports.InputType || (exports.InputType = {}));
var Align;
(function (Align) {
    Align[Align["Left"] = 0] = "Left";
    Align[Align["Right"] = 1] = "Right";
})(Align = exports.Align || (exports.Align = {}));
var UIType;
(function (UIType) {
    UIType[UIType["Button"] = 0] = "Button";
    UIType[UIType["Container"] = 1] = "Container";
    UIType[UIType["Display"] = 2] = "Display";
    UIType[UIType["HorizontalLayout"] = 3] = "HorizontalLayout";
    UIType[UIType["Image"] = 4] = "Image";
    UIType[UIType["Input"] = 5] = "Input";
    UIType[UIType["Label"] = 6] = "Label";
    UIType[UIType["Select"] = 7] = "Select";
    UIType[UIType["Slider"] = 8] = "Slider";
    UIType[UIType["Source"] = 9] = "Source";
    UIType[UIType["Toggle"] = 10] = "Toggle";
})(UIType = exports.UIType || (exports.UIType = {}));
var FlowState;
(function (FlowState) {
    FlowState[FlowState["Running"] = 0] = "Running";
    FlowState[FlowState["Stopped"] = 1] = "Stopped";
})(FlowState = exports.FlowState || (exports.FlowState = {}));
var GraphState;
(function (GraphState) {
    GraphState[GraphState["Running"] = 0] = "Running";
    GraphState[GraphState["FullRun"] = 1] = "FullRun";
    GraphState[GraphState["Idle"] = 2] = "Idle";
    GraphState[GraphState["Stopped"] = 3] = "Stopped";
})(GraphState = exports.GraphState || (exports.GraphState = {}));


/***/ }),

/***/ 81:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(522), exports);
__exportStar(__webpack_require__(281), exports);


/***/ }),

/***/ 281:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Vector2 = void 0;
var constants_1 = __webpack_require__(522);
var Vector2 = (function () {
    function Vector2(xOrDOMPoint, y) {
        var _a, _b;
        if (xOrDOMPoint instanceof DOMPoint)
            _a = [xOrDOMPoint.x, xOrDOMPoint.y], this.x = _a[0], this.y = _a[1];
        else
            _b = [xOrDOMPoint, y], this.x = _b[0], this.y = _b[1];
    }
    Vector2.prototype.toString = function () {
        return '[' + this.x.toFixed(3) + ', ' + this.y.toFixed(3) + ']';
    };
    Vector2.prototype.add = function (arg1, arg2) {
        if (arg1 instanceof Vector2) {
            return new Vector2(this.x + arg1.x, this.y + arg1.y);
        }
        else if (typeof arg2 === 'undefined') {
            return new Vector2(this.x + arg1, this.y + arg1);
        }
        else {
            return new Vector2(this.x + arg1, this.y + arg2);
        }
    };
    Vector2.prototype.addInPlace = function (arg1, arg2) {
        if (arg1 instanceof Vector2) {
            this.x += arg1.x;
            this.y += arg1.y;
        }
        else if (typeof arg2 === 'undefined') {
            this.x += arg1;
            this.y += arg1;
        }
        else {
            this.x += arg1;
            this.y += arg2;
        }
        return this;
    };
    Vector2.prototype.multiply = function (arg1, arg2) {
        if (arg1 instanceof Vector2) {
            return new Vector2(this.x * arg1.x, this.y * arg1.y);
        }
        else if (typeof arg2 === 'undefined') {
            return new Vector2(this.x * arg1, this.y * arg1);
        }
        else {
            return new Vector2(this.x * arg1, this.y * arg2);
        }
    };
    Vector2.prototype.multiplyInPlace = function (arg1, arg2) {
        if (arg1 instanceof Vector2) {
            this.x *= arg1.x;
            this.y *= arg1.y;
        }
        else if (typeof arg2 === 'undefined') {
            this.x *= arg1;
            this.y *= arg1;
        }
        else {
            this.x *= arg1;
            this.y *= arg2;
        }
        return this;
    };
    Vector2.prototype.subtract = function (arg1, arg2) {
        if (arg1 instanceof Vector2) {
            return new Vector2(this.x - arg1.x, this.y - arg1.y);
        }
        else if (typeof arg2 === 'undefined') {
            return new Vector2(this.x - arg1, this.y - arg1);
        }
        else {
            return new Vector2(this.x - arg1, this.y - arg2);
        }
    };
    Vector2.prototype.subtractInPlace = function (arg1, arg2) {
        if (arg1 instanceof Vector2) {
            this.x -= arg1.x;
            this.y -= arg1.y;
        }
        else if (typeof arg2 === 'undefined') {
            this.x -= arg1;
            this.y -= arg1;
        }
        else {
            this.x -= arg1;
            this.y -= arg2;
        }
    };
    Vector2.prototype.rotate = function (pivot, degrees) {
        degrees = degrees * constants_1.Constant.TAU;
        var cosT = Math.cos(degrees);
        var sinT = Math.sin(degrees);
        return new Vector2((cosT * (this.x - pivot.x)) - (sinT * (this.y - pivot.y)) + pivot.x, (sinT * (this.x - pivot.x)) + (cosT * (this.y - pivot.y)) + pivot.y);
    };
    Vector2.prototype.rotateInPlace = function (pivot, degrees) {
        degrees = degrees * constants_1.Constant.TAU;
        var cosT = Math.cos(degrees);
        var sinT = Math.sin(degrees);
        this.tmpX = (cosT * (this.x - pivot.x)) - (sinT * (this.y - pivot.y)) + pivot.x;
        this.tmpY = (sinT * (this.x - pivot.x)) + (cosT * (this.y - pivot.y)) + pivot.y;
        this.x = this.tmpX;
        this.y = this.tmpY;
        return this;
    };
    Vector2.prototype.transform = function (transform) {
        return new Vector2(transform.transformPoint(this));
    };
    Vector2.prototype.transformInPlace = function (transform) {
        var _a;
        var transformedPoint = transform.transformPoint(this);
        _a = [transformedPoint.x, transformedPoint.y], this.x = _a[0], this.y = _a[1];
    };
    Vector2.prototype.max = function () {
        return Math.max(this.x, this.y);
    };
    Vector2.prototype.clone = function () {
        return new Vector2(this.x, this.y);
    };
    Vector2.prototype.clamp = function (minX, maxX, minY, maxY) {
        if (this.x < minX)
            this.x = minX;
        if (this.x > maxX)
            this.x = maxX;
        if (this.y < minY)
            this.y = minY;
        if (this.y > maxY)
            this.y = maxY;
        return this;
    };
    Vector2.Midpoint = function (vector1, vector2) {
        return new Vector2((vector1.x + vector2.x) / 2, (vector1.y + vector2.y) / 2);
    };
    Vector2.Distance = function (vector1OrX1, vector2OrY1, x2, y2) {
        if (vector1OrX1 instanceof Vector2 && vector2OrY1 instanceof Vector2) {
            return Math.sqrt(Math.pow(vector2OrY1.x - vector1OrX1.x, 2) + Math.pow(vector2OrY1.y - vector1OrX1.y, 2));
        }
        else if (typeof vector1OrX1 === 'number' && typeof vector2OrY1 === 'number') {
            return Math.sqrt(Math.pow(x2 - vector1OrX1, 2) + Math.pow(y2 - vector2OrY1, 2));
        }
    };
    Vector2.Zero = function () {
        return new Vector2(0, 0);
    };
    Vector2.One = function () {
        return new Vector2(1, 1);
    };
    Vector2.Bounds = function (vectors) {
        var minVec = new Vector2(Number.MAX_VALUE, Number.MAX_VALUE);
        var maxVec = new Vector2(Number.MIN_VALUE, Number.MIN_VALUE);
        vectors.forEach(function (vector) {
            if (vector.x < minVec.x)
                minVec.x = vector.x;
            if (vector.y < minVec.y)
                minVec.y = vector.y;
            if (vector.x > maxVec.x)
                maxVec.x = vector.x;
            if (vector.y > maxVec.y)
                maxVec.y = vector.y;
        });
        return [minVec, maxVec];
    };
    Vector2.Average = function (vectors) {
        var sumX = 0;
        var sumY = 0;
        vectors.forEach(function (vector) {
            sumX += vector.x;
            sumY += vector.y;
        });
        return new Vector2(sumX / vectors.length, sumY / vectors.length);
    };
    Vector2.Random = function (minX, maxX, minY, maxY) {
        return new Vector2(Math.random() * (maxX - minX) + minX, Math.random() * (maxY - minY) + minY);
    };
    Vector2.Lerp = function (start, end, amount) {
        return new Vector2(start.x + ((end.x - start.x) * amount), start.y + ((end.y - start.y) * amount));
    };
    Vector2.prototype.serialize = function () {
        return { x: this.x, y: this.y };
    };
    Vector2.deSerialize = function (data) {
        return new Vector2(data.x, data.y);
    };
    return Vector2;
}());
exports.Vector2 = Vector2;


/***/ }),

/***/ 124:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fileIcon = void 0;
exports.fileIcon = "data:image/svg+xml;charset=UTF-8,%3c?xml version='1.0' encoding='iso-8859-1'?%3e%3c!-- --%3e%3csvg version='1.1' id='Capa_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' viewBox='0 0 477.867 477.867' style='enable-background:new 0 0 477.867 477.867;' xml:space='preserve'%3e%3cg%3e%3cg%3e%3cpath d='M324.267,119.467c-9.426,0-17.067-7.641-17.067-17.067V0H102.4C74.123,0,51.2,22.923,51.2,51.2v375.467 c0,28.277,22.923,51.2,51.2,51.2h273.067c28.277,0,51.2-22.923,51.2-51.2v-307.2H324.267z'/%3e%3c/g%3e%3c/g%3e%3cg%3e%3cg%3e%3cpolygon points='341.333,10.001 341.333,85.333 416.666,85.333 '/%3e%3c/g%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3cg%3e%3c/g%3e%3c/svg%3e";


/***/ }),

/***/ 283:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Button = void 0;
var terminal_1 = __webpack_require__(900);
var vector_1 = __webpack_require__(281);
var constants_1 = __webpack_require__(522);
var label_1 = __webpack_require__(120);
var ui_node_1 = __webpack_require__(681);
var color_1 = __webpack_require__(278);
var Button = (function (_super) {
    __extends(Button, _super);
    function Button(node, text, input, output, height, style, id, hitColor) {
        if (style === void 0) { style = {}; }
        var _this = _super.call(this, node, vector_1.Vector2.Zero(), constants_1.UIType.Button, false, __assign(__assign({}, constants_1.Constant.DefaultButtonStyle()), style), null, input ?
            (typeof input === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.IN, 'event', '', {}, function () { return _this.call('click', _this); }) :
                new terminal_1.Terminal(node, input.type, input.dataType, input.name, input.style, function () { return _this.call('click', _this); }, input.id, color_1.Color.deSerialize(input.hitColor))) :
            null, output ?
            (typeof output === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.OUT, 'event', '', {}) :
                terminal_1.Terminal.deSerialize(node, output)) :
            null, id, hitColor) || this;
        _this.text = text;
        _this.height = height ? height : (_this.node.style.rowHeight + 2 * _this.style.padding);
        _this.label = new label_1.Label(_this.node, text, null, false, false, {
            fontSize: _this.style.fontSize,
            font: _this.style.font,
            align: 'center',
            color: _this.style.color
        }, _this.height);
        _this.label.on('click', function (_node, position) { return _this.call('click', _this, position); });
        _this.children.push(_this.label);
        return _this;
    }
    Button.prototype.paint = function () {
        this.context.fillStyle = this.style.backgroundColor;
        this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Button.prototype.paintLOD1 = function () {
        this.context.strokeStyle = '#000';
        this.paint();
        this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    };
    Button.prototype.offPaint = function () {
        this.offUIContext.fillStyle = this.hitColor.hexValue;
        this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Button.prototype.reflow = function () {
        this.label.position = this.position;
        this.label.height = this.height;
        this.label.width = this.width;
        if (this.input) {
            this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
            this.input.position.y = this.position.y + this.height / 2;
        }
        if (this.output) {
            this.output.position.x = this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius;
            this.output.position.y = this.position.y + this.height / 2;
        }
    };
    Button.prototype.onPropChange = function () { };
    Button.prototype.onOver = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('over', this, screenPosition, realPosition);
    };
    Button.prototype.onDown = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('down', this, screenPosition, realPosition);
    };
    Button.prototype.onUp = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('up', this, screenPosition, realPosition);
    };
    Button.prototype.onClick = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('click', this, screenPosition, realPosition);
    };
    Button.prototype.onDrag = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('drag', this, screenPosition, realPosition);
    };
    Button.prototype.onEnter = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('enter', this, screenPosition, realPosition);
    };
    Button.prototype.onExit = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('exit', this, screenPosition, realPosition);
    };
    Button.prototype.onContextMenu = function () {
        if (this.disabled)
            return;
        this.call('rightclick', this);
    };
    Button.prototype.serialize = function () {
        return {
            id: this.id,
            type: this.type,
            hitColor: this.hitColor.serialize(),
            height: this.height,
            text: this.text,
            style: this.style,
            propName: this.propName,
            input: this.input ? this.input.serialize() : null,
            output: this.output ? this.output.serialize() : null,
            childs: []
        };
    };
    Button.deSerialize = function (node, data) {
        return new Button(node, data.text, data.input, data.output, data.height, data.style, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return Button;
}(ui_node_1.UINode));
exports.Button = Button;


/***/ }),

/***/ 818:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Container = void 0;
var color_1 = __webpack_require__(278);
var constants_1 = __webpack_require__(522);
var vector_1 = __webpack_require__(281);
var button_1 = __webpack_require__(283);
var display_1 = __webpack_require__(119);
var horizontal_layout_1 = __webpack_require__(104);
var image_1 = __webpack_require__(799);
var input_1 = __webpack_require__(560);
var label_1 = __webpack_require__(120);
var select_1 = __webpack_require__(136);
var slider_1 = __webpack_require__(526);
var source_1 = __webpack_require__(2);
var toggle_1 = __webpack_require__(369);
var ui_node_1 = __webpack_require__(681);
var Container = (function (_super) {
    __extends(Container, _super);
    function Container(node, width, style, id, hitColor) {
        if (style === void 0) { style = {}; }
        var _this = _super.call(this, node, node.position, constants_1.UIType.Container, false, __assign(__assign({}, constants_1.Constant.DefaultContainerStyle()), style), null, null, null, id, hitColor) || this;
        _this.width = typeof width !== 'undefined' ? width : 0;
        _this.height = _this.node.style.padding * 2;
        _this.contentWidth = _this.width - 2 * _this.node.style.padding;
        return _this;
    }
    Container.prototype.paint = function () {
        this.context.shadowColor = this.style.shadowColor;
        this.context.shadowBlur = 3;
        this.context.shadowOffsetX = this.style.shadowOffset.x;
        this.context.shadowOffsetY = this.style.shadowOffset.y;
        this.context.fillStyle = this.style.backgroundColor;
        this.context.strokeStyle = this.style.borderColor;
        this.context.lineWidth = this.style.borderWidth;
        this.context.roundRect(this.position.x, this.position.y + this.node.style.titleHeight, this.width, this.height - this.node.style.titleHeight, 5);
        this.context.stroke();
        this.context.fill();
    };
    Container.prototype.paintLOD1 = function () {
        this.context.fillStyle = this.style.backgroundColor;
        this.context.strokeStyle = this.style.borderColor;
        this.context.lineWidth = this.style.borderWidth;
        this.context.roundRect(this.position.x, this.position.y + this.node.style.titleHeight, this.width, this.height - this.node.style.titleHeight, 5);
        this.context.stroke();
        this.context.fill();
    };
    Container.prototype.offPaint = function () {
        this.offUIContext.fillStyle = this.hitColor.hexValue;
        this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Container.prototype.reflow = function () {
        var _this = this;
        this.position = this.node.position;
        var terminalsDisplayHeight = Math.max(this.node.inputs.length, this.node.outputs.length) * this.node.style.terminalRowHeight + this.node.style.titleHeight;
        var x = this.position.x + this.node.style.padding;
        var y = this.position.y + terminalsDisplayHeight;
        this.children.forEach(function (child) {
            y += _this.node.style.spacing;
            child.width = _this.width - _this.node.style.padding * 2;
            child.position = new vector_1.Vector2(x, y);
            y += child.height;
        });
        this.height = y + this.node.style.padding - this.position.y;
    };
    Container.prototype.onPropChange = function () { };
    Container.prototype.onOver = function (screenPosition, realPosition) {
        this.call('over', this, screenPosition, realPosition);
    };
    Container.prototype.onDown = function (screenPosition, realPosition) {
        this.call('down', this, screenPosition, realPosition);
    };
    Container.prototype.onUp = function (screenPosition, realPosition) {
        this.call('up', this, screenPosition, realPosition);
    };
    Container.prototype.onClick = function (screenPosition, realPosition) {
        this.call('click', this, screenPosition, realPosition);
    };
    Container.prototype.onDrag = function (screenPosition, realPosition) {
        this.call('drag', this, screenPosition, realPosition);
    };
    Container.prototype.onEnter = function (screenPosition, realPosition) {
        this.call('enter', this, screenPosition, realPosition);
    };
    Container.prototype.onExit = function (screenPosition, realPosition) {
        this.call('exit', this, screenPosition, realPosition);
    };
    Container.prototype.onContextMenu = function () { };
    Container.prototype.serialize = function () {
        return {
            id: this.id,
            type: this.type,
            hitColor: this.hitColor.serialize(),
            propName: this.propName,
            input: this.input ? this.input.serialize() : null,
            output: this.output ? this.output.serialize() : null,
            width: this.width,
            style: {
                backgroundColor: this.style.backgroundColor,
                shadowColor: this.style.shadowColor,
                shadowBlur: this.style.shadowBlur,
                shadowOffset: this.style.shadowOffset.serialize(),
                borderWidth: this.style.borderWidth,
                borderColor: this.style.borderColor
            },
            childs: this.children.map(function (child) { return child.serialize(); })
        };
    };
    Container.deSerialize = function (node, data) {
        var _a;
        var uiContainer = new Container(node, data.width, data.style, data.id, color_1.Color.deSerialize(data.hitColor));
        (_a = uiContainer.children).push.apply(_a, data.childs.map(function (serializedChild) {
            switch (serializedChild.type) {
                case constants_1.UIType.Button: return button_1.Button.deSerialize(node, serializedChild);
                case constants_1.UIType.Container: return Container.deSerialize(node, serializedChild);
                case constants_1.UIType.Display: return display_1.Display.deSerialize(node, serializedChild);
                case constants_1.UIType.HorizontalLayout: return horizontal_layout_1.HorizontalLayout.deSerialize(node, serializedChild);
                case constants_1.UIType.Image: return image_1.Image.deSerialize(node, serializedChild);
                case constants_1.UIType.Input: return input_1.Input.deSerialize(node, serializedChild);
                case constants_1.UIType.Label: return label_1.Label.deSerialize(node, serializedChild);
                case constants_1.UIType.Select: return select_1.Select.deSerialize(node, serializedChild);
                case constants_1.UIType.Slider: return slider_1.Slider.deSerialize(node, serializedChild);
                case constants_1.UIType.Source: return source_1.Source.deSerialize(node, serializedChild);
                case constants_1.UIType.Toggle: return toggle_1.Toggle.deSerialize(node, serializedChild);
                default: return;
            }
        }));
        return uiContainer;
    };
    return Container;
}(ui_node_1.UINode));
exports.Container = Container;


/***/ }),

/***/ 119:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Display = void 0;
var color_1 = __webpack_require__(278);
var constants_1 = __webpack_require__(522);
var vector_1 = __webpack_require__(281);
var ui_node_1 = __webpack_require__(681);
var Display = (function (_super) {
    __extends(Display, _super);
    function Display(node, height, render, style, id, hitColor) {
        if (style === void 0) { style = {}; }
        var _this = _super.call(this, node, vector_1.Vector2.Zero(), constants_1.UIType.Display, false, __assign(__assign({}, constants_1.Constant.DefaultDisplayStyle()), style), null, null, null, id, hitColor) || this;
        _this.customRender = render;
        _this.height = height;
        return _this;
    }
    Display.prototype.paint = function () {
        this.context.strokeStyle = this.style.borderColor;
        this.context.lineWidth = 1;
        this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
        this.context.strokeStyle = null;
        this.context.translate(this.position.x, this.position.y);
        this.customRender(this.context, this.width, this.height);
        this.context.resetTransform();
    };
    Display.prototype.paintLOD1 = function () {
        this.context.strokeStyle = this.style.borderColor;
        this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
        this.context.fillStyle = 'lightgrey';
        this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Display.prototype.offPaint = function () {
        this.offUIContext.fillStyle = this.hitColor.hexValue;
        this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Display.prototype.reflow = function () { };
    Display.prototype.onPropChange = function () { };
    Display.prototype.onOver = function (screenPosition, realPosition) {
        this.call('over', this, screenPosition, realPosition);
    };
    Display.prototype.onDown = function (screenPosition, realPosition) {
        this.call('down', this, screenPosition, realPosition);
    };
    Display.prototype.onUp = function (screenPosition, realPosition) {
        this.call('up', this, screenPosition, realPosition);
    };
    Display.prototype.onClick = function (screenPosition, realPosition) {
        this.call('click', this, screenPosition, realPosition);
    };
    Display.prototype.onDrag = function (screenPosition, realPosition) {
        this.call('drag', this, screenPosition, realPosition);
    };
    Display.prototype.onEnter = function (screenPosition, realPosition) {
        this.call('enter', this, screenPosition, realPosition);
    };
    Display.prototype.onExit = function (screenPosition, realPosition) {
        this.call('exit', this, screenPosition, realPosition);
    };
    Display.prototype.onContextMenu = function () {
        this.call('rightclick', this);
    };
    Display.prototype.serialize = function () {
        return {
            id: this.id,
            type: this.type,
            hitColor: this.hitColor.serialize(),
            style: this.style,
            propName: this.propName,
            input: this.input ? this.input.serialize() : null,
            output: this.output ? this.output.serialize() : null,
            height: this.height,
            childs: []
        };
    };
    Display.deSerialize = function (node, data) {
        return new Display(node, data.height, null, data.style, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return Display;
}(ui_node_1.UINode));
exports.Display = Display;


/***/ }),

/***/ 104:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.HorizontalLayout = void 0;
var color_1 = __webpack_require__(278);
var constants_1 = __webpack_require__(522);
var vector_1 = __webpack_require__(281);
var button_1 = __webpack_require__(283);
var container_1 = __webpack_require__(818);
var display_1 = __webpack_require__(119);
var image_1 = __webpack_require__(799);
var input_1 = __webpack_require__(560);
var label_1 = __webpack_require__(120);
var select_1 = __webpack_require__(136);
var slider_1 = __webpack_require__(526);
var source_1 = __webpack_require__(2);
var toggle_1 = __webpack_require__(369);
var ui_node_1 = __webpack_require__(681);
var HorizontalLayout = (function (_super) {
    __extends(HorizontalLayout, _super);
    function HorizontalLayout(node, childs, style, id, hitColor) {
        var _a;
        if (style === void 0) { style = {}; }
        var _this = _super.call(this, node, vector_1.Vector2.Zero(), constants_1.UIType.HorizontalLayout, false, __assign(__assign({}, constants_1.Constant.DefaultHorizontalLayoutStyle()), style), null, null, null, id, hitColor) || this;
        if (childs)
            (_a = _this.children).push.apply(_a, childs);
        return _this;
    }
    HorizontalLayout.prototype.paint = function () { };
    HorizontalLayout.prototype.paintLOD1 = function () { };
    HorizontalLayout.prototype.offPaint = function () {
        this.offUIContext.fillStyle = this.hitColor.hexValue;
        this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    HorizontalLayout.prototype.reflow = function () {
        var _this = this;
        var availableWidth = this.width;
        var x = this.position.x;
        var maxHeight = 0;
        this.children.forEach(function (child) {
            maxHeight = Math.max(maxHeight, child.height);
        });
        this.height = maxHeight;
        this.children.forEach(function (child) {
            var childWidth = child.style.grow ? child.style.grow * _this.width : (1 / _this.children.length) * _this.width;
            if (childWidth > availableWidth)
                childWidth = availableWidth;
            child.width = childWidth;
            if (child.height < _this.height)
                child.height = _this.height;
            child.position = new vector_1.Vector2(x, _this.position.y);
            availableWidth -= childWidth;
            x += childWidth;
        });
    };
    HorizontalLayout.prototype.onPropChange = function () { };
    HorizontalLayout.prototype.onOver = function (screenPosition, realPosition) {
        this.call('over', this, screenPosition, realPosition);
    };
    HorizontalLayout.prototype.onDown = function (screenPosition, realPosition) {
        this.call('down', this, screenPosition, realPosition);
    };
    HorizontalLayout.prototype.onUp = function (screenPosition, realPosition) {
        this.call('up', this, screenPosition, realPosition);
    };
    HorizontalLayout.prototype.onClick = function (screenPosition, realPosition) {
        this.call('click', this, screenPosition, realPosition);
    };
    HorizontalLayout.prototype.onDrag = function (screenPosition, realPosition) {
        this.call('drag', this, screenPosition, realPosition);
    };
    HorizontalLayout.prototype.onEnter = function (screenPosition, realPosition) {
        this.call('enter', this, screenPosition, realPosition);
    };
    HorizontalLayout.prototype.onExit = function (screenPosition, realPosition) {
        this.call('exit', this, screenPosition, realPosition);
    };
    HorizontalLayout.prototype.onContextMenu = function () { };
    HorizontalLayout.prototype.serialize = function () {
        return {
            id: this.id,
            type: this.type,
            hitColor: this.hitColor.serialize(),
            propName: this.propName,
            input: this.input ? this.input.serialize() : null,
            output: this.output ? this.output.serialize() : null,
            style: this.style,
            childs: this.children.map(function (child) { return child.serialize(); })
        };
    };
    HorizontalLayout.deSerialize = function (node, data) {
        var _a;
        var hozLayout = new HorizontalLayout(node, [], data.style, data.id, color_1.Color.deSerialize(data.hitColor));
        (_a = hozLayout.children).push.apply(_a, data.childs.map(function (serializedChild) {
            switch (serializedChild.type) {
                case constants_1.UIType.Button: return button_1.Button.deSerialize(node, serializedChild);
                case constants_1.UIType.Container: return container_1.Container.deSerialize(node, serializedChild);
                case constants_1.UIType.Display: return display_1.Display.deSerialize(node, serializedChild);
                case constants_1.UIType.HorizontalLayout: return HorizontalLayout.deSerialize(node, serializedChild);
                case constants_1.UIType.Image: return image_1.Image.deSerialize(node, serializedChild);
                case constants_1.UIType.Input: return input_1.Input.deSerialize(node, serializedChild);
                case constants_1.UIType.Label: return label_1.Label.deSerialize(node, serializedChild);
                case constants_1.UIType.Select: return select_1.Select.deSerialize(node, serializedChild);
                case constants_1.UIType.Slider: return slider_1.Slider.deSerialize(node, serializedChild);
                case constants_1.UIType.Source: return source_1.Source.deSerialize(node, serializedChild);
                case constants_1.UIType.Toggle: return toggle_1.Toggle.deSerialize(node, serializedChild);
                default: return;
            }
        }));
        return hozLayout;
    };
    return HorizontalLayout;
}(ui_node_1.UINode));
exports.HorizontalLayout = HorizontalLayout;


/***/ }),

/***/ 799:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Image = void 0;
var color_1 = __webpack_require__(278);
var constants_1 = __webpack_require__(522);
var vector_1 = __webpack_require__(281);
var logger_1 = __webpack_require__(645);
var ui_node_1 = __webpack_require__(681);
var Image = (function (_super) {
    __extends(Image, _super);
    function Image(node, sourceString, propName, style, id, hitColor) {
        if (style === void 0) { style = {}; }
        var _this = _super.call(this, node, vector_1.Vector2.Zero(), constants_1.UIType.Image, false, __assign(__assign({}, constants_1.Constant.DefaultImageStyle()), style), propName, null, null, id, hitColor) || this;
        _this.sourceString = sourceString;
        _this.source = document.createElement('img');
        _this.source.onload = function () {
            if (typeof OffscreenCanvas !== 'undefined')
                _this.imageCanvas = new OffscreenCanvas(_this.source.width, _this.source.height);
            else {
                _this.imageCanvas = document.createElement('canvas');
                _this.imageCanvas.width = _this.source.width;
                _this.imageCanvas.height = _this.source.height;
            }
            var imageContext = _this.imageCanvas.getContext('2d');
            imageContext.drawImage(_this.source, 0, 0);
            _this.ratio = _this.source.width / _this.source.height;
            _this.reflow();
            _this.node.ui.update();
        };
        _this.source.onerror = function (error) { return logger_1.Logger.error(error); };
        _this.source.src = sourceString;
        return _this;
    }
    Image.prototype.paint = function () {
        if (this.imageCanvas) {
            var x = this.position.x;
            if (this.source.width < this.node.ui.contentWidth) {
                if (this.style.align === 'center')
                    x += this.node.ui.contentWidth / 2 - this.source.width / 2;
                else if (this.style.align === 'right')
                    x += +(this.node.ui.contentWidth - this.source.width);
            }
            this.context.drawImage(this.imageCanvas, 0, 0, this.source.width, this.source.height, x, this.position.y, this.width, this.height);
        }
    };
    Image.prototype.paintLOD1 = function () {
        if (this.imageCanvas) {
            var x = this.position.x;
            if (this.source.width < this.node.ui.contentWidth) {
                if (this.style.align === 'center')
                    x += this.node.ui.contentWidth / 2 - this.source.width / 2;
                else if (this.style.align === 'right')
                    x += +(this.node.ui.contentWidth - this.source.width);
            }
            this.context.fillStyle = 'lightgrey';
            this.context.strokeStyle = '#000';
            this.context.fillRect(x, this.position.y, this.width, this.height);
            this.context.strokeRect(x, this.position.y, this.width, this.height);
        }
    };
    Image.prototype.offPaint = function () {
        this.offUIContext.fillStyle = this.hitColor.hexValue;
        var x = this.position.x;
        if (this.source.width < this.node.ui.contentWidth) {
            if (this.style.align === 'center')
                x += this.node.ui.contentWidth / 2 - this.source.width / 2;
            else if (this.style.align === 'right')
                x += +(this.node.ui.contentWidth - this.source.width);
        }
        this.offUIContext.fillRect(x, this.position.y, this.width, this.height);
    };
    Image.prototype.reflow = function () {
        if (!this.source.width || !this.source.height)
            return;
        if (this.source.width > this.width) {
            this.height = this.width / this.ratio;
        }
        else {
            this.width = this.source.width;
            this.height = this.source.height;
        }
    };
    Image.prototype.onPropChange = function () { };
    Image.prototype.onOver = function (screenPosition, realPosition) {
        this.call('over', this, screenPosition, realPosition);
    };
    Image.prototype.onDown = function (screenPosition, realPosition) {
        this.call('down', this, screenPosition, realPosition);
    };
    Image.prototype.onUp = function (screenPosition, realPosition) {
        this.call('up', this, screenPosition, realPosition);
    };
    Image.prototype.onClick = function (screenPosition, realPosition) {
        this.call('click', this, screenPosition, realPosition);
    };
    Image.prototype.onDrag = function (screenPosition, realPosition) {
        this.call('drag', this, screenPosition, realPosition);
    };
    Image.prototype.onEnter = function (screenPosition, realPosition) {
        this.call('enter', this, screenPosition, realPosition);
    };
    Image.prototype.onExit = function (screenPosition, realPosition) {
        this.call('exit', this, screenPosition, realPosition);
    };
    Image.prototype.onContextMenu = function () { };
    Image.prototype.serialize = function () {
        return {
            id: this.id,
            type: this.type,
            hitColor: this.hitColor.serialize(),
            style: this.style,
            propName: this.propName,
            input: this.input ? this.input.serialize() : null,
            output: this.output ? this.output.serialize() : null,
            source: this.sourceString,
            childs: []
        };
    };
    Image.deSerialize = function (node, data) {
        return new Image(node, data.source, data.propName, data.style, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return Image;
}(ui_node_1.UINode));
exports.Image = Image;


/***/ }),

/***/ 637:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(681), exports);
__exportStar(__webpack_require__(818), exports);
__exportStar(__webpack_require__(120), exports);
__exportStar(__webpack_require__(799), exports);
__exportStar(__webpack_require__(526), exports);
__exportStar(__webpack_require__(104), exports);
__exportStar(__webpack_require__(283), exports);
__exportStar(__webpack_require__(369), exports);
__exportStar(__webpack_require__(136), exports);
__exportStar(__webpack_require__(2), exports);
__exportStar(__webpack_require__(119), exports);
__exportStar(__webpack_require__(560), exports);


/***/ }),

/***/ 560:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Input = void 0;
var vector_1 = __webpack_require__(281);
var ui_node_1 = __webpack_require__(681);
var label_1 = __webpack_require__(120);
var terminal_1 = __webpack_require__(900);
var constants_1 = __webpack_require__(522);
var color_1 = __webpack_require__(278);
var Input = (function (_super) {
    __extends(Input, _super);
    function Input(node, value, propName, input, output, height, style, id, hitColor) {
        if (style === void 0) { style = {}; }
        var _this = _super.call(this, node, vector_1.Vector2.Zero(), constants_1.UIType.Input, false, __assign(__assign({}, constants_1.Constant.DefaultInputStyle()), style), propName, input ?
            (typeof input === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.IN, style.type === constants_1.InputType.Text ? 'string' : 'number', '', {}) :
                terminal_1.Terminal.deSerialize(node, input)) :
            null, output ?
            (typeof output === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.OUT, style.type === constants_1.InputType.Text ? 'string' : 'number', '', {}) :
                terminal_1.Terminal.deSerialize(node, output)) :
            null, id, hitColor) || this;
        _this.height = height ? height : _this.node.style.rowHeight;
        if (_this.style.type === constants_1.InputType.Number && typeof value === 'string')
            value = parseInt(value);
        _this._value = value;
        _this.label = new label_1.Label(_this.node, _this.value.toString(), null, false, false, {
            fontSize: _this.style.fontSize,
            font: _this.style.font,
            align: _this.style.align,
            color: _this.style.color
        }, _this.height);
        _this.label.on('click', function () {
            if (document.activeElement !== _this.inputEl) {
                _this.inputEl.style.visibility = 'visible';
                _this.inputEl.style.pointerEvents = 'all';
                var realPosition = _this.position.transform(_this.node.flow.flowConnect.transform);
                _this.inputEl.style.top = (realPosition.y + _this.node.flow.flowConnect.canvasDimensions.top + 1) + 'px';
                _this.inputEl.style.left = (realPosition.x + _this.node.flow.flowConnect.canvasDimensions.left + 1) + 'px';
                _this.inputEl.style.width = (_this.width - 1) * _this.node.flow.flowConnect.scale + 'px';
                _this.inputEl.style.height = (_this.height - 1) * _this.node.flow.flowConnect.scale + 'px';
                _this.inputEl.style.fontFamily = _this.style.font;
                _this.inputEl.style.fontSize = parseInt(_this.style.fontSize.replace('px', '')) * _this.node.flow.flowConnect.scale + 'px';
                _this.inputEl.style.color = _this.style.color;
                _this.inputEl.style.backgroundColor = _this.style.backgroundColor;
                _this.inputEl.style.textAlign = _this.style.align;
                _this.inputEl.focus();
            }
        });
        _this.children.push(_this.label);
        _this.inputEl = document.createElement('input');
        _this.inputEl.className = 'flow-connect-input';
        _this.inputEl.spellcheck = false;
        _this.inputEl.type = _this.style.type;
        _this.inputEl.value = _this.value.toString();
        _this.inputEl.onblur = function () {
            _this.inputEl.style.visibility = 'hidden';
            _this.inputEl.style.pointerEvents = 'none';
        };
        _this.inputEl.onchange = function (event) {
            _this.value = event.target.value;
            _this.label.text = _this.value.toString();
        };
        document.body.appendChild(_this.inputEl);
        if (_this.input) {
            _this.input.on('connect', function (terminal, connector) {
                if (connector.data)
                    _this.value = connector.data;
            });
            _this.input.on('data', function (data) {
                if (data)
                    _this.value = data;
            });
        }
        if (_this.output)
            _this.output.on('connect', function (terminal, connector) { return connector.data = _this.value; });
        return _this;
    }
    Object.defineProperty(Input.prototype, "value", {
        get: function () {
            if (this.propName)
                return this.node.props[this.propName];
            return this._value;
        },
        set: function (value) {
            var val;
            if (this.style.type === constants_1.InputType.Number && typeof value === 'string')
                val = parseInt(value);
            else
                val = value;
            if (this.propName)
                this.node.props[this.propName] = val;
            else {
                this._value = val;
                this.label.text = this._value.toString();
                this.inputEl.value = this._value.toString();
            }
        },
        enumerable: false,
        configurable: true
    });
    Input.prototype.paint = function () {
        this.context.strokeStyle = this.style.border;
        this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    };
    Input.prototype.paintLOD1 = function () {
        this.context.strokeStyle = this.style.border;
        this.context.fillStyle = this.style.backgroundColor;
        this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
        this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Input.prototype.offPaint = function () {
        this.offUIContext.fillStyle = this.hitColor.hexValue;
        this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Input.prototype.reflow = function () {
        this.label.position = this.position;
        this.label.height = this.height;
        this.label.width = this.width;
        if (this.input) {
            this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
            this.input.position.y = this.position.y + this.height / 2;
        }
        if (this.output) {
            this.output.position.x = this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius;
            this.output.position.y = this.position.y + this.height / 2;
        }
    };
    Input.prototype.onPropChange = function (oldValue, newValue) {
        var val;
        if (this.style.type === constants_1.InputType.Number && typeof newValue === 'string')
            val = parseInt(newValue);
        else
            val = newValue;
        this._value = val;
        this.label.text = this._value.toString();
        this.inputEl.value = this._value.toString();
        this.output && this.output['setData'](this.value);
    };
    Input.prototype.onOver = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('over', this, screenPosition, realPosition);
    };
    Input.prototype.onDown = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('down', this, screenPosition, realPosition);
    };
    Input.prototype.onUp = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('up', this, screenPosition, realPosition);
    };
    Input.prototype.onClick = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('click', this, screenPosition, realPosition);
    };
    Input.prototype.onDrag = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('drag', this, screenPosition, realPosition);
    };
    Input.prototype.onEnter = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('enter', this, screenPosition, realPosition);
    };
    Input.prototype.onExit = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('exit', this, screenPosition, realPosition);
    };
    Input.prototype.onContextMenu = function () {
        if (this.disabled)
            return;
    };
    Input.prototype.serialize = function () {
        return {
            id: this.id,
            hitColor: this.hitColor.serialize(),
            type: this.type,
            style: this.style,
            propName: this.propName,
            input: this.input ? this.input.serialize() : null,
            output: this.output ? this.output.serialize() : null,
            value: this.value,
            height: this.height,
            childs: []
        };
    };
    Input.deSerialize = function (node, data) {
        return new Input(node, data.value, data.propName, data.input, data.output, data.height, data.style, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return Input;
}(ui_node_1.UINode));
exports.Input = Input;


/***/ }),

/***/ 120:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Label = void 0;
var terminal_1 = __webpack_require__(900);
var vector_1 = __webpack_require__(281);
var constants_1 = __webpack_require__(522);
var ui_node_1 = __webpack_require__(681);
var color_1 = __webpack_require__(278);
var Label = (function (_super) {
    __extends(Label, _super);
    function Label(node, text, propName, input, output, style, height, id, hitColor) {
        if (text === void 0) { text = ''; }
        if (style === void 0) { style = {}; }
        var _this = _super.call(this, node, vector_1.Vector2.Zero(), constants_1.UIType.Label, false, __assign(__assign({}, constants_1.Constant.DefaultLabelStyle()), style), propName, input ?
            (typeof input === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.IN, 'string', '', {}) :
                terminal_1.Terminal.deSerialize(node, input)) :
            null, output ?
            (typeof output === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.OUT, 'string', '', {}) :
                terminal_1.Terminal.deSerialize(node, output)) :
            null, id, hitColor) || this;
        _this._text = _this.propName ? _this.node.props[_this.propName] : text;
        _this.displayText = _this._text;
        _this.reflow();
        if (!height)
            _this.height = _this.textHeight;
        else
            _this.height = height;
        if (_this.input) {
            _this.input.on('connect', function (terminal, connector) {
                if (connector.data)
                    _this.text = connector.data;
            });
            _this.input.on('data', function (data) {
                if (data)
                    _this.text = data;
            });
        }
        if (_this.output)
            _this.output.on('connect', function (terminal, connector) { return connector.data = _this.text; });
        return _this;
    }
    Object.defineProperty(Label.prototype, "text", {
        get: function () {
            if (this.propName)
                return this.node.props[this.propName];
            return this._text;
        },
        set: function (text) {
            if (this.propName) {
                this.node.props[this.propName] = text;
            }
            else {
                this._text = text;
                this.displayText = this._text;
                this.reflow();
            }
        },
        enumerable: false,
        configurable: true
    });
    Label.prototype.paint = function () {
        this.context.fillStyle = this.style.color;
        this.context.font = this.style.fontSize + ' ' + this.style.font;
        this.context.textBaseline = 'top';
        var y = this.position.y + this.height / 2 - this.textHeight / 2;
        var x = this.position.x;
        if (this.style.align === 'left') {
            x += 5;
        }
        else if (this.style.align === 'center') {
            x += this.width / 2 - this.textWidth / 2;
        }
        else if (this.style.align === 'right') {
            x += this.width - this.textWidth - 5;
        }
        this.context.fillText(this.displayText, x, y);
    };
    Label.prototype.paintLOD1 = function () {
        this.context.strokeStyle = '#000';
        this.context.fillStyle = this.style.color;
        this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
        this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Label.prototype.offPaint = function () {
        this.offUIContext.fillStyle = this.hitColor.hexValue;
        this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Label.prototype.reflow = function () {
        this.context.font = this.style.fontSize + ' ' + this.style.font;
        var metrics = this.context.measureText(this.displayText);
        this.context.font = null;
        this.textWidth = metrics.width;
        this.textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
        if (typeof this.textHeight === 'undefined') {
            var d = document.createElement("span");
            d.style.font = this.style.fontSize + ' ' + this.style.font;
            d.textContent = "M";
            document.body.appendChild(d);
            this.textHeight = d.offsetHeight;
            document.body.removeChild(d);
        }
        if (this.input) {
            this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
            this.input.position.y = this.position.y + this.height / 2;
        }
        if (this.output) {
            this.output.position.x = this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius;
            this.output.position.y = this.position.y + this.height / 2;
        }
    };
    Label.prototype.onPropChange = function (oldValue, newValue) {
        this._text = newValue;
        this.displayText = this._text;
        this.reflow();
        this.output && this.output['setData'](this.text);
    };
    Label.prototype.onOver = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('over', this, screenPosition, realPosition);
    };
    Label.prototype.onDown = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('down', this, screenPosition, realPosition);
    };
    Label.prototype.onUp = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('up', this, screenPosition, realPosition);
    };
    Label.prototype.onClick = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('click', this, screenPosition, realPosition);
    };
    Label.prototype.onDrag = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('drag', this, screenPosition, realPosition);
    };
    Label.prototype.onEnter = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('enter', this, screenPosition, realPosition);
    };
    Label.prototype.onExit = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('exit', this, screenPosition, realPosition);
    };
    Label.prototype.onContextMenu = function () {
        if (this.disabled)
            return;
    };
    Label.prototype.serialize = function () {
        return {
            id: this.id,
            type: this.type,
            hitColor: this.hitColor.serialize(),
            style: this.style,
            propName: this.propName,
            input: this.input ? this.input.serialize() : null,
            output: this.output ? this.output.serialize() : null,
            height: this.height,
            text: this.text,
            childs: []
        };
    };
    Label.deSerialize = function (node, data) {
        return new Label(node, data.text, data.propName, data.input, data.output, data.style, data.height, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return Label;
}(ui_node_1.UINode));
exports.Label = Label;


/***/ }),

/***/ 136:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Select = void 0;
var terminal_1 = __webpack_require__(900);
var vector_1 = __webpack_require__(281);
var label_1 = __webpack_require__(120);
var ui_node_1 = __webpack_require__(681);
var constants_1 = __webpack_require__(522);
var color_1 = __webpack_require__(278);
var Select = (function (_super) {
    __extends(Select, _super);
    function Select(node, options, propName, input, output, height, style, id, hitColor) {
        if (options === void 0) { options = []; }
        if (style === void 0) { style = {}; }
        var _this = _super.call(this, node, vector_1.Vector2.Zero(), constants_1.UIType.Select, false, __assign(__assign({}, constants_1.Constant.DefaultSelectStyle()), style), propName, input ?
            (typeof input === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.IN, 'string', '', {}) :
                terminal_1.Terminal.deSerialize(node, input)) :
            null, output ?
            (typeof output === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.OUT, 'string', '', {}) :
                terminal_1.Terminal.deSerialize(node, output)) :
            null, id, hitColor) || this;
        _this.options = options;
        _this.height = height ? height : _this.node.style.rowHeight;
        _this._selected = _this.options.length === 0 ? 'None' : _this.options[0];
        _this.label = new label_1.Label(_this.node, _this.selected, null, false, false, __assign({ align: 'center' }, _this.style), _this.height);
        _this.children.push(_this.label);
        if (_this.input) {
            _this.input.on('connect', function (terminal, connector) {
                if (connector.data)
                    _this.selected = connector.data;
            });
            _this.input.on('data', function (data) {
                if (data)
                    _this.selected = data;
            });
        }
        if (_this.output)
            _this.output.on('connect', function (terminal, connector) { return connector.data = _this.selected; });
        return _this;
    }
    Object.defineProperty(Select.prototype, "selected", {
        get: function () {
            if (this.propName) {
                var value = this.node.props[this.propName];
                value = this.options.length === 0 ? 'None' : (this.options.includes(value) ? value : this.options[0]);
                return value;
            }
            return this._selected;
        },
        set: function (selected) {
            var value = this.options.length === 0 ? 'None' : (this.options.includes(selected) ? selected : this.options[0]);
            if (this.propName)
                this.node.props[this.propName] = value;
            else {
                this._selected = value;
                this.label.text = this.selected;
            }
        },
        enumerable: false,
        configurable: true
    });
    Select.prototype.paint = function () {
        this.context.fillStyle = this.style.arrowColor;
        this.context.beginPath();
        this.context.moveTo(this.position.x, this.position.y + this.height / 2);
        this.context.lineTo(this.position.x + this.width * .15, this.position.y + this.height * .15);
        this.context.lineTo(this.position.x + this.width * .15, this.position.y + this.height * .85);
        this.context.lineTo(this.position.x, this.position.y + this.height / 2);
        this.context.closePath();
        this.context.fill();
        this.context.fillStyle = this.style.arrowColor;
        this.context.beginPath();
        this.context.moveTo(this.position.x + this.width, this.position.y + this.height / 2);
        this.context.lineTo(this.position.x + this.width * .85, this.position.y + this.height * .15);
        this.context.lineTo(this.position.x + this.width * .85, this.position.y + this.height * .85);
        this.context.lineTo(this.position.x + this.width, this.position.y + this.height / 2);
        this.context.closePath();
        this.context.fill();
    };
    Select.prototype.paintLOD1 = function () {
        this.context.fillStyle = this.style.arrowColor;
        this.context.strokeStyle = '#000';
        this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
        this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    };
    Select.prototype.offPaint = function () {
        this.offUIContext.fillStyle = this.hitColor.hexValue;
        this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Select.prototype.reflow = function () {
        this.label.width = this.width * .7;
        this.label.position.x = this.position.x + this.width * .15;
        this.label.position.y = this.position.y + this.height / 2 - this.label.height / 2;
        if (this.input) {
            this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
            this.input.position.y = this.position.y + this.height / 2;
        }
        if (this.output) {
            this.output.position.x = this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius;
            this.output.position.y = this.position.y + this.height / 2;
        }
    };
    Select.prototype.onPropChange = function (oldValue, newValue) {
        var value = this.options.length === 0 ? 'None' : (this.options.includes(newValue) ? newValue : this.options[0]);
        this._selected = value;
        this.label.text = this.selected;
        this.output && this.output['setData'](this.selected);
    };
    Select.prototype.onOver = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('over', this, screenPosition, realPosition);
    };
    Select.prototype.onDown = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('down', this, screenPosition, realPosition);
    };
    Select.prototype.onUp = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('up', this, screenPosition, realPosition);
    };
    Select.prototype.onClick = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('click', this, screenPosition, realPosition);
        if (this.options.length === 0)
            return;
        var direction;
        if (realPosition.x < this.position.x + this.width * .15) {
            direction = -1;
        }
        else if (realPosition.x > this.position.x + this.width * .85) {
            direction = 1;
        }
        else
            return;
        this.selected = this.options[(((this.options.indexOf(this.selected) + direction) % this.options.length) + this.options.length) % this.options.length];
        this.label.text = this.selected;
        this.call('change', this, this.selected);
    };
    Select.prototype.onDrag = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('drag', this, screenPosition, realPosition);
    };
    Select.prototype.onEnter = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('enter', this, screenPosition, realPosition);
    };
    Select.prototype.onExit = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('exit', this, screenPosition, realPosition);
    };
    Select.prototype.onContextMenu = function () {
        if (this.disabled)
            return;
    };
    Select.prototype.serialize = function () {
        return {
            id: this.id,
            type: this.type,
            hitColor: this.hitColor.serialize(),
            style: this.style,
            propName: this.propName,
            input: this.input ? this.input.serialize() : null,
            output: this.output ? this.output.serialize() : null,
            options: this.options,
            height: this.height,
            childs: []
        };
    };
    Select.deSerialize = function (node, data) {
        return new Select(node, data.options, data.propName, data.input, data.output, data.height, data.style, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return Select;
}(ui_node_1.UINode));
exports.Select = Select;


/***/ }),

/***/ 526:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Slider = void 0;
var terminal_1 = __webpack_require__(900);
var vector_1 = __webpack_require__(281);
var utils_1 = __webpack_require__(974);
var ui_node_1 = __webpack_require__(681);
var constants_1 = __webpack_require__(522);
var color_1 = __webpack_require__(278);
var Slider = (function (_super) {
    __extends(Slider, _super);
    function Slider(node, min, max, value, precision, propName, input, output, height, style, id, hitColor) {
        if (precision === void 0) { precision = 0; }
        if (style === void 0) { style = {}; }
        var _this = _super.call(this, node, vector_1.Vector2.Zero(), constants_1.UIType.Slider, true, __assign(__assign({}, constants_1.Constant.DefaultSliderStyle(height)), style), propName, input ?
            (typeof input === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.IN, 'number', '', {}) :
                terminal_1.Terminal.deSerialize(node, input)) :
            null, output ?
            (typeof output === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.OUT, 'number', '', {}) :
                terminal_1.Terminal.deSerialize(node, output)) :
            null, id, hitColor) || this;
        _this.min = min;
        _this.max = max;
        _this.precision = precision;
        _this.height = height ? height : _this.node.style.rowHeight;
        _this.value = parseFloat(value.toFixed(_this.precision));
        if (_this.input) {
            _this.input.on('connect', function (terminal, connector) {
                if (connector.data)
                    _this.value = connector.data;
            });
            _this.input.on('data', function (data) {
                if (data)
                    _this.value = data;
            });
        }
        if (_this.output)
            _this.output.on('connect', function (terminal, connector) { return connector.data = _this.value; });
        return _this;
    }
    Object.defineProperty(Slider.prototype, "value", {
        get: function () {
            if (this.propName)
                return this.node.props[this.propName];
            return this._value;
        },
        set: function (value) {
            value = utils_1.clamp(value, this.min, this.max);
            if (this.propName)
                this.node.props[this.propName] = value;
            else {
                this._value = value;
                this.call('change', this, this.value);
                this.reflow();
            }
        },
        enumerable: false,
        configurable: true
    });
    Slider.prototype.paint = function () {
        this.context.lineWidth = this.style.railHeight;
        this.context.strokeStyle = this.style.color;
        this.context.lineCap = 'butt';
        var start = Math.max(this.position.x, this.position.x + this.thumbFill - 3);
        if (start !== this.position.x) {
            this.context.beginPath();
            this.context.moveTo(this.position.x, this.position.y + this.height / 2);
            this.context.lineTo(start, this.position.y + this.height / 2);
            this.context.stroke();
        }
        start = Math.min(this.position.x + 2 * this.style.thumbRadius + this.thumbFill + 3, this.position.x + this.width);
        if (start !== (this.position.x + this.width)) {
            this.context.beginPath();
            this.context.moveTo(start, this.position.y + this.height / 2);
            this.context.lineTo(this.position.x + this.width, this.position.y + this.height / 2);
            this.context.stroke();
        }
        this.context.fillStyle = this.style.thumbColor;
        this.context.beginPath();
        this.context.arc(this.position.x + this.style.thumbRadius + this.thumbFill, this.position.y + this.height / 2, this.style.thumbRadius, 0, 2 * Math.PI);
        this.context.fill();
    };
    Slider.prototype.paintLOD1 = function () {
        this.context.strokeStyle = '#000';
        this.context.fillStyle = this.style.color;
        this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
        this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Slider.prototype.offPaint = function () {
        this.offUIContext.fillStyle = this.hitColor.hexValue;
        this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Slider.prototype.reflow = function () {
        this.thumbFill = utils_1.denormalize(utils_1.normalize(this.value, this.min, this.max), 0, this.width - 2 * this.style.thumbRadius);
        if (this.input) {
            this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
            this.input.position.y = this.position.y + this.height / 2;
        }
        if (this.output) {
            this.output.position.x = this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius;
            this.output.position.y = this.position.y + this.height / 2;
        }
    };
    Slider.prototype.onPropChange = function (oldValue, newValue) {
        this._value = newValue;
        this.reflow();
        this.call('change', this, this.value);
        this.output && this.output['setData'](this.value);
    };
    Slider.prototype.onOver = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('over', this, screenPosition, realPosition);
    };
    Slider.prototype.onDown = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('down', this, screenPosition, realPosition);
    };
    Slider.prototype.onUp = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('up', this, screenPosition, realPosition);
    };
    Slider.prototype.onClick = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('click', this, screenPosition, realPosition);
    };
    Slider.prototype.onDrag = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('drag', this, screenPosition, realPosition);
        var y = this.position.y + this.height / 2 - this.style.railHeight / 2;
        this.thumbFill = realPosition.clamp(this.position.x + this.style.thumbRadius, this.position.x + this.width - this.style.thumbRadius, y, y).subtract(this.position.x + this.style.thumbRadius, 0).x;
        this.value = parseFloat(utils_1.denormalize(utils_1.normalize(this.thumbFill, 0, this.width - 2 * this.style.thumbRadius), this.min, this.max).toFixed(this.precision));
    };
    Slider.prototype.onEnter = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('enter', this, screenPosition, realPosition);
    };
    Slider.prototype.onExit = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('exit', this, screenPosition, realPosition);
    };
    Slider.prototype.onContextMenu = function () {
        if (this.disabled)
            return;
    };
    Slider.prototype.serialize = function () {
        return {
            id: this.id,
            type: this.type,
            hitColor: this.hitColor.serialize(),
            style: this.style,
            propName: this.propName,
            input: this.input ? this.input.serialize() : null,
            output: this.output ? this.output.serialize() : null,
            min: this.min,
            max: this.max,
            value: this.value,
            precision: this.precision,
            height: this.height,
            childs: []
        };
    };
    Slider.deSerialize = function (node, data) {
        return new Slider(node, data.min, data.max, data.value, data.precision, data.propName, data.input, data.output, data.height, data.style, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return Slider;
}(ui_node_1.UINode));
exports.Slider = Slider;


/***/ }),

/***/ 2:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Source = void 0;
var terminal_1 = __webpack_require__(900);
var vector_1 = __webpack_require__(281);
var icons_1 = __webpack_require__(124);
var image_1 = __webpack_require__(799);
var label_1 = __webpack_require__(120);
var ui_node_1 = __webpack_require__(681);
var constants_1 = __webpack_require__(522);
var color_1 = __webpack_require__(278);
var Source = (function (_super) {
    __extends(Source, _super);
    function Source(node, accept, propName, input, output, height, style, id, hitColor) {
        if (style === void 0) { style = {}; }
        var _this = _super.call(this, node, vector_1.Vector2.Zero(), constants_1.UIType.Source, false, __assign(__assign({}, constants_1.Constant.DefaultSourceStyle()), style), propName, input ?
            (typeof input === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.IN, 'file', '', {}) :
                terminal_1.Terminal.deSerialize(node, input)) :
            null, output ?
            (typeof output === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.OUT, 'file', '', {}) :
                terminal_1.Terminal.deSerialize(node, output)) :
            null, id, hitColor) || this;
        _this.accept = accept;
        _this.height = height ? height : _this.node.style.rowHeight;
        _this.htmlInput = document.createElement('input');
        _this.htmlInput.type = 'file';
        (accept) && (_this.htmlInput.accept = accept);
        _this.htmlInput.onchange = function () {
            if (_this.htmlInput.files.length > 0) {
                _this.file = _this.htmlInput.files[0];
            }
        };
        _this.label = new label_1.Label(_this.node, 'Select', null, false, false, __assign({ align: 'center' }, _this.style), _this.height);
        _this.label.on('click', function () { return _this.htmlInput.click(); });
        _this.fileIcon = new image_1.Image(_this.node, icons_1.fileIcon);
        _this.children.push(_this.label, _this.fileIcon);
        if (_this.input) {
            _this.input.on('connect', function (terminal, connector) {
                if (connector.data)
                    _this.file = connector.data;
            });
            _this.input.on('data', function (data) {
                if (data)
                    _this.file = data;
            });
        }
        if (_this.output)
            _this.output.on('connect', function (terminal, connector) { return connector.data = _this.file; });
        return _this;
    }
    Object.defineProperty(Source.prototype, "file", {
        get: function () {
            if (this.propName)
                return this.node.props[this.propName];
            return this._file;
        },
        set: function (file) {
            if (this.propName)
                this.node.props[this.propName] = file;
            else {
                this._file = file;
                this.label.text = this._file.name.substring(0, this._file.name.toString().lastIndexOf("."));
                this.call('change', this, this._file);
            }
        },
        enumerable: false,
        configurable: true
    });
    Source.prototype.paint = function () {
        this.context.strokeStyle = this.style.borderColor;
        this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
    };
    Source.prototype.paintLOD1 = function () {
        this.context.strokeStyle = this.style.borderColor;
        this.context.fillStyle = this.style.color;
        this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
        this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Source.prototype.offPaint = function () {
        this.offUIContext.fillStyle = this.hitColor.hexValue;
        this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Source.prototype.reflow = function () {
        this.label.width = this.width;
        this.label.height = this.height;
        this.label.position = this.position;
        this.fileIcon.width = this.width * .1;
        this.fileIcon.position.x = this.position.x + 5;
        this.fileIcon.position.y = this.position.y + this.height / 2 - this.fileIcon.height / 2;
        if (this.input) {
            this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
            this.input.position.y = this.position.y + this.height / 2;
        }
        if (this.output) {
            this.output.position.x = this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius;
            this.output.position.y = this.position.y + this.height / 2;
        }
    };
    Source.prototype.onPropChange = function (oldValue, newValue) {
        this._file = newValue;
        this.label.text = this._file.name.substring(0, this._file.name.toString().lastIndexOf("."));
        this.call('change', this, this._file);
        this.output && this.output['setData'](this._file);
    };
    Source.prototype.onOver = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('over', this, screenPosition, realPosition);
    };
    Source.prototype.onDown = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('down', this, screenPosition, realPosition);
    };
    Source.prototype.onUp = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('up', this, screenPosition, realPosition);
    };
    Source.prototype.onClick = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('click', this, screenPosition, realPosition);
    };
    Source.prototype.onDrag = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('drag', this, screenPosition, realPosition);
    };
    Source.prototype.onEnter = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('enter', this, screenPosition, realPosition);
    };
    Source.prototype.onExit = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('exit', this, screenPosition, realPosition);
    };
    Source.prototype.onContextMenu = function () {
        if (this.disabled)
            return;
    };
    Source.prototype.serialize = function () {
        return {
            id: this.id,
            type: this.type,
            hitColor: this.hitColor.serialize(),
            style: this.style,
            propName: this.propName,
            input: this.input ? this.input.serialize() : null,
            output: this.output ? this.output.serialize() : null,
            accept: this.accept,
            height: this.height,
            childs: []
        };
    };
    Source.deSerialize = function (node, data) {
        return new Source(node, data.accept, data.propName, data.input, data.output, data.height, data.style, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return Source;
}(ui_node_1.UINode));
exports.Source = Source;


/***/ }),

/***/ 369:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Toggle = void 0;
var terminal_1 = __webpack_require__(900);
var vector_1 = __webpack_require__(281);
var ui_node_1 = __webpack_require__(681);
var constants_1 = __webpack_require__(522);
var color_1 = __webpack_require__(278);
var Toggle = (function (_super) {
    __extends(Toggle, _super);
    function Toggle(node, propName, input, output, height, style, id, hitColor) {
        if (style === void 0) { style = {}; }
        var _this = _super.call(this, node, vector_1.Vector2.Zero(), constants_1.UIType.Toggle, false, __assign(__assign({}, constants_1.Constant.DefaultToggleStyle()), style), propName, input ?
            (typeof input === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.IN, 'boolean', '', {}) :
                terminal_1.Terminal.deSerialize(node, input)) :
            null, output ?
            (typeof output === 'boolean' ?
                new terminal_1.Terminal(node, constants_1.TerminalType.OUT, 'boolean', '', {}) :
                terminal_1.Terminal.deSerialize(node, output)) :
            null, id, hitColor) || this;
        _this._checked = false;
        _this._checked = _this.propName ? _this.node.props[_this.propName] : false;
        _this.height = height ? height : _this.node.style.rowHeight;
        if (_this.input) {
            _this.input.on('connect', function (terminal, connector) {
                if (connector.data)
                    _this.checked = connector.data;
            });
            _this.input.on('data', function (data) {
                if (typeof data !== 'undefined')
                    _this.checked = data;
            });
        }
        if (_this.output)
            _this.output.on('connect', function (terminal, connector) { return connector.data = _this.checked; });
        return _this;
    }
    Object.defineProperty(Toggle.prototype, "checked", {
        get: function () {
            if (this.propName)
                return this.node.props[this.propName];
            return this._checked;
        },
        set: function (checked) {
            if (this.propName)
                this.node.props[this.propName] = checked;
            else {
                this._checked = checked;
                this.call('change', this, this.checked);
            }
        },
        enumerable: false,
        configurable: true
    });
    Toggle.prototype.paint = function () {
        this.context.strokeStyle = this.style.backgroundColor;
        this.context.lineWidth = this.height * .75;
        this.context.lineCap = 'round';
        this.context.beginPath();
        this.context.moveTo(this.position.x + this.context.lineWidth / 2, this.position.y + this.height / 2);
        this.context.lineTo(this.position.x + this.width - this.context.lineWidth / 2, this.position.y + this.height / 2);
        this.context.stroke();
        this.context.fillStyle = this.style.color;
        this.context.beginPath();
        this.context.arc(this.checked ? this.position.x + this.width - this.height / 2 : this.position.x + this.height / 2, this.position.y + this.height / 2, this.height / 2, 0, 2 * Math.PI);
        this.context.fill();
    };
    Toggle.prototype.paintLOD1 = function () {
        this.context.strokeStyle = this.style.color;
        this.context.fillStyle = this.style.backgroundColor;
        this.context.strokeRect(this.position.x, this.position.y, this.width, this.height);
        this.context.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Toggle.prototype.offPaint = function () {
        this.offUIContext.fillStyle = this.hitColor.hexValue;
        this.offUIContext.fillRect(this.position.x, this.position.y, this.width, this.height);
    };
    Toggle.prototype.reflow = function () {
        if (this.input) {
            this.input.position.x = this.node.position.x - this.node.style.terminalStripMargin - this.input.style.radius;
            this.input.position.y = this.position.y + this.height / 2;
        }
        if (this.output) {
            this.output.position.x = this.node.position.x + this.node.width + this.node.style.terminalStripMargin + this.output.style.radius;
            this.output.position.y = this.position.y + this.height / 2;
        }
    };
    Toggle.prototype.onPropChange = function (oldValue, newValue) {
        this._checked = newValue;
        this.call('change', this, this.checked);
        this.output && this.output['setData'](this.checked);
    };
    Toggle.prototype.onOver = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('over', this, screenPosition, realPosition);
    };
    Toggle.prototype.onDown = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('down', this, screenPosition, realPosition);
    };
    Toggle.prototype.onUp = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('up', this, screenPosition, realPosition);
    };
    Toggle.prototype.onClick = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('click', this, screenPosition, realPosition);
        this.checked = !this.checked;
    };
    Toggle.prototype.onDrag = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('drag', this, screenPosition, realPosition);
    };
    Toggle.prototype.onEnter = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('enter', this, screenPosition, realPosition);
    };
    Toggle.prototype.onExit = function (screenPosition, realPosition) {
        if (this.disabled)
            return;
        this.call('exit', this, screenPosition, realPosition);
    };
    Toggle.prototype.onContextMenu = function () {
        if (this.disabled)
            return;
    };
    Toggle.prototype.serialize = function () {
        return {
            id: this.id,
            type: this.type,
            hitColor: this.hitColor.serialize(),
            style: this.style,
            propName: this.propName,
            input: this.input ? this.input.serialize() : null,
            output: this.output ? this.output.serialize() : null,
            checked: this.checked,
            height: this.height,
            childs: []
        };
    };
    Toggle.deSerialize = function (node, data) {
        return new Toggle(node, data.propName, data.input, data.output, data.height, data.style, data.id, color_1.Color.deSerialize(data.hitColor));
    };
    return Toggle;
}(ui_node_1.UINode));
exports.Toggle = Toggle;


/***/ }),

/***/ 681:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.UINode = void 0;
var color_1 = __webpack_require__(278);
var hooks_1 = __webpack_require__(417);
var constants_1 = __webpack_require__(522);
var utils_1 = __webpack_require__(974);
var UINode = (function (_super) {
    __extends(UINode, _super);
    function UINode(node, position, type, draggable, style, propName, input, output, id, hitColor) {
        if (input === void 0) { input = null; }
        if (output === void 0) { output = null; }
        if (id === void 0) { id = utils_1.getNewGUID(); }
        var _this = _super.call(this) || this;
        _this.node = node;
        _this.type = type;
        _this.style = style;
        _this.propName = propName;
        _this.input = input;
        _this.output = output;
        _this.id = id;
        _this.hitColor = hitColor;
        _this.width = 0;
        _this.height = 0;
        _this.id = utils_1.getNewGUID();
        _this.context = _this.node.context;
        _this.offUIContext = _this.node.offUIContext;
        _this.setHitColor(hitColor);
        _this.position = position;
        _this.children = [];
        _this.draggable = draggable;
        _this.disabled = false;
        if (_this.propName)
            _this.node.addPropObserver(_this.propName, _this.onPropChange.bind(_this));
        if (input) {
            _this.node.inputsUI.push(_this.input);
            _this.input.on('connect', function () { return _this.disabled = true; });
            _this.input.on('disconnect', function () { return _this.disabled = false; });
        }
        if (output)
            _this.node.outputsUI.push(_this.output);
        return _this;
    }
    Object.defineProperty(UINode.prototype, "disabled", {
        get: function () {
            return this._disabled;
        },
        set: function (disabled) {
            this._disabled = disabled;
            this.children.forEach(function (child) { return child.disabled = disabled; });
        },
        enumerable: false,
        configurable: true
    });
    UINode.prototype.append = function (childs) {
        var _a;
        if (Array.isArray(childs)) {
            (_a = this.children).push.apply(_a, childs);
        }
        else {
            this.children.push(childs);
        }
        this.update();
    };
    UINode.prototype.update = function () {
        this.reflow();
        this.children.forEach(function (child) { return child.update(); });
    };
    UINode.prototype.updateRenderState = function () {
        if (this.node.renderState.nodeState === constants_1.NodeState.MINIMIZED)
            return;
        var realPos = this.position.transform(this.node.flow.flowConnect.transform);
        this.renderState = utils_1.intersects(0, 0, this.node.flow.flowConnect.canvasDimensions.width, this.node.flow.flowConnect.canvasDimensions.height, realPos.x, realPos.y, realPos.x + this.width * this.node.flow.flowConnect.scale, realPos.y + this.height * this.node.flow.flowConnect.scale);
        this.children.forEach(function (child) { return child.updateRenderState(); });
    };
    UINode.prototype.setHitColor = function (hitColor) {
        if (!hitColor) {
            hitColor = color_1.Color.Random();
            while (this.node.hitColorToUI[hitColor.rgbaString] || this.node.hitColorToTerminal[hitColor.rgbaString])
                hitColor = color_1.Color.Random();
        }
        this.hitColor = hitColor;
        this.node.hitColorToUI[this.hitColor.rgbaString] = this;
    };
    UINode.prototype.render = function () {
        if (this.renderState === constants_1.ViewPort.OUTSIDE)
            return;
        if (this.node.renderState.lod === constants_1.LOD.LOD1) {
            this.context.save();
            this.paintLOD1();
            this.context.restore();
        }
        else if (this.node.renderState.lod === constants_1.LOD.LOD2) {
            this.context.save();
            this.paint();
            this.context.restore();
            this.offUIContext.save();
            this.offPaint();
            this.offUIContext.restore();
        }
        else {
            if (this.type === constants_1.UIType.Container) {
                this.context.save();
                this.paintLOD1();
                this.context.restore();
            }
        }
        if (this.node.renderState.lod > 0) {
            if (this.input)
                this.input.render();
            if (this.output)
                this.output.render();
        }
        this.children.forEach(function (child) { return child.render(); });
    };
    return UINode;
}(hooks_1.Hooks));
exports.UINode = UINode;


/***/ }),

/***/ 156:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.BinaryTreeNode = exports.BinarySearchTree = void 0;
var BinarySearchTree = (function () {
    function BinarySearchTree(comparator, dataToTreeNodeMapper) {
        this.comparator = comparator;
        this.dataToTreeNodeMapper = dataToTreeNodeMapper;
        this.root = null;
        this.dataRefToTreeNode = {};
    }
    BinarySearchTree.prototype.add = function (data) {
        var newNode = new BinaryTreeNode(data);
        this.dataRefToTreeNode[this.dataToTreeNodeMapper(data)] = newNode;
        if (this.root === null)
            this.root = newNode;
        else
            this._insert(this.root, newNode);
    };
    BinarySearchTree.prototype._insert = function (root, newNode) {
        if (this.comparator(newNode.data, root.data) < 0) {
            if (root.left === null) {
                root.left = newNode;
                newNode.parent = root;
            }
            else
                this._insert(root.left, newNode);
        }
        else {
            if (root.right === null) {
                root.right = newNode;
                newNode.parent = root;
            }
            else
                this._insert(root.right, newNode);
        }
    };
    BinarySearchTree.prototype.remove = function (dataRef) {
        var treeNode = this.dataRefToTreeNode[this.dataToTreeNodeMapper(dataRef)];
        if (!treeNode)
            return false;
        delete this.dataRefToTreeNode[this.dataToTreeNodeMapper(dataRef)];
        if (treeNode.parent) {
            if (treeNode.parent.left === treeNode) {
                if (treeNode.left === null && treeNode.right === null) {
                    treeNode.parent.left = null;
                    return true;
                }
                if (treeNode.left === null) {
                    treeNode.right.parent = treeNode.parent;
                    treeNode.parent.left = treeNode.right;
                    return true;
                }
                else if (treeNode.right === null) {
                    treeNode.left.parent = treeNode.parent;
                    treeNode.parent.left = treeNode.left;
                    return true;
                }
                this._deleteMinNode(treeNode);
            }
            else {
                if (treeNode.left === null && treeNode.right === null) {
                    treeNode.parent.right = null;
                    return true;
                }
                if (treeNode.left === null) {
                    treeNode.right.parent = treeNode.parent;
                    treeNode.parent.right = treeNode.right;
                    return true;
                }
                else if (treeNode.right === null) {
                    treeNode.left.parent = treeNode.parent;
                    treeNode.parent.right = treeNode.left;
                    return true;
                }
                this._deleteMinNode(treeNode);
            }
        }
        else {
            if (treeNode.left === null && treeNode.right === null) {
                this.root = null;
                return true;
            }
            if (treeNode.left === null) {
                treeNode.right.parent = treeNode.parent;
                this.root = treeNode.right;
                return true;
            }
            else if (treeNode.right === null) {
                treeNode.left.parent = treeNode.parent;
                this.root = treeNode.left;
                return true;
            }
            this._deleteMinNode(treeNode);
        }
    };
    BinarySearchTree.prototype._deleteMinNode = function (node) {
        var min = this.findMinNode(node.right);
        node.data = min.data;
        if (min.parent.left === min) {
            min.parent.left = null;
        }
        else {
            min.parent.right = null;
        }
    };
    BinarySearchTree.prototype.findMinNode = function (node) {
        if (node.left === null)
            return node;
        else
            return this.findMinNode(node.left);
    };
    BinarySearchTree.prototype.forEach = function (action) {
        this.action = action;
        this._inorder(this.root);
    };
    BinarySearchTree.prototype._inorder = function (node) {
        if (node !== null) {
            this._inorder(node.left);
            this.action(node.data);
            this._inorder(node.right);
        }
    };
    BinarySearchTree.prototype._reverseInorder = function (node) {
        if (node !== null) {
            this._inorder(node.right);
            this.action(node.data);
            this._inorder(node.left);
        }
    };
    return BinarySearchTree;
}());
exports.BinarySearchTree = BinarySearchTree;
var BinaryTreeNode = (function () {
    function BinaryTreeNode(data) {
        this.data = data;
        this.left = null;
        this.right = null;
        this.parent = null;
    }
    return BinaryTreeNode;
}());
exports.BinaryTreeNode = BinaryTreeNode;


/***/ }),

/***/ 928:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(156), exports);
__exportStar(__webpack_require__(974), exports);
__exportStar(__webpack_require__(645), exports);


/***/ }),

/***/ 645:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel["TRACE"] = "Trace";
    LogLevel["INFO"] = "Info";
    LogLevel["WARN"] = "Warn";
    LogLevel["ERROR"] = "Error";
    LogLevel["DISABLED"] = "Disabled";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
var Logger = (function () {
    function Logger() {
    }
    Logger.log = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.LOG_LEVEL !== LogLevel.TRACE)
            return;
        console.log.apply(this, args);
    };
    Logger.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.LOG_LEVEL !== LogLevel.INFO)
            return;
        console.info.apply(this, args);
    };
    Logger.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.LOG_LEVEL !== LogLevel.WARN)
            return;
        console.warn.apply(this, args);
    };
    Logger.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (this.LOG_LEVEL !== LogLevel.ERROR)
            return;
        console.error.apply(this, args);
    };
    Logger.LOG_LEVEL = LogLevel.DISABLED;
    return Logger;
}());
exports.Logger = Logger;


/***/ }),

/***/ 974:
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.clamp = exports.intersects = exports.getRandom = exports.denormalize = exports.normalize = exports.getNewGUID = void 0;
var constants_1 = __webpack_require__(522);
var getNewGUID = function () {
    var S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + "-" + S4() + "-" + S4() + "-" + S4());
};
exports.getNewGUID = getNewGUID;
var normalize = function (value, min, max) {
    return (value - min) / (max - min);
};
exports.normalize = normalize;
var denormalize = function (normalized, min, max) {
    return (max - min) * normalized + min;
};
exports.denormalize = denormalize;
var getRandom = function (min, max) {
    return Math.random() * max + min;
};
exports.getRandom = getRandom;
var intersects = function (start1X, start1Y, end1X, end1Y, start2X, start2Y, end2X, end2Y) {
    var intersects = !(start2X > end1X || end2X < start1X || start2Y > end1Y || end2Y < start1Y);
    if (intersects) {
        if (!(start2X < start1X || start2Y < start1Y || end2X > end1X || end2Y > end1Y))
            return constants_1.ViewPort.INSIDE;
        else
            return constants_1.ViewPort.INTERSECT;
    }
    else
        return constants_1.ViewPort.OUTSIDE;
};
exports.intersects = intersects;
var clamp = function (value, min, max) {
    return value <= min ? min : (value > max ? max : value);
};
exports.clamp = clamp;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(184);
/******/ })()
;
});
//# sourceMappingURL=flow-connect.js.map