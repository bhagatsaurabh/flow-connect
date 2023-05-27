import { Color, FlowConnect } from "../flow-connect.js";
import { Vector } from "./vector.js";
import { Node, NodeOptions, SerializedNode } from "./node.js";
import { Hooks } from "./hooks.js";
import { Group, SerializedGroup } from "./group.js";
import { Connector, SerializedConnector } from "./connector.js";
import { AVLTree } from "../utils/avl-tree.js";
import {
  Serializable,
  Rules,
  DataPersistenceProvider,
  DataFetchProvider,
  RuleColors,
  SerializedRuleColors,
  FlowRenderers,
} from "../common/interfaces.js";
import { SubFlowNode, SubFlowNodeOptions } from "./subflow-node.js";
import { TunnelNode, SerializedTunnelNode, TunnelNodeOptions } from "./tunnel-node.js";
import { capitalize, uuid } from "../utils/utils.js";
import { Graph } from "./graph.js";
import { Terminal } from "./terminal.js";
import { Log } from "../utils/logger.js";

/** A Flow is a set of Nodes, Connectors and Groups, it can also contain SubFlowNodes thereby creating a tree of Flows.
 *  ![](media://example.png)
 */
export class Flow extends Hooks implements Serializable<SerializedFlow> {
  name: string;
  id: string;
  rules: Rules;
  ruleColors: RuleColors;
  sortedNodes: AVLTree<Node>;
  nodes: Map<string, Node>;
  groups: Group[];
  connectors: Map<string, Connector>;
  floatingConnector: Connector;
  inputs: TunnelNode[];
  outputs: TunnelNode[];
  get state(): FlowState {
    return this.executionGraph.state;
  }
  globalEvents: Hooks = new Hooks();
  parentFlow: Flow = null;

  nodeHitColors: Map<string, Node>;
  groupHitColors: Map<string, Group>;
  listeners: Record<string, number> = {};

  executionGraph: Graph;

  readonly renderers: FlowRenderers = {};

  private constructor(public flowConnect: FlowConnect) {
    super();

    this.nodes = new Map();
    this.groups = [];
    this.connectors = new Map();
    this.nodeHitColors = new Map();
    this.groupHitColors = new Map();
    this.sortedNodes = new AVLTree(
      (a: Node, b: Node) => a.zIndex - b.zIndex,
      (node: Node) => node.id
    );
    this.inputs = [];
    this.outputs = [];
    this.executionGraph = new Graph();

    flowConnect.on("tick", () => {
      if (this.state === FlowState.Running) this.call("tick", this);
    });
  }

  static create(flowConnect: FlowConnect, options: FlowOptions = DefaultFlowOptions()): Flow {
    const flow = new Flow(flowConnect);

    const { name = "New Flow", rules = {}, ruleColors = DefaultRuleColors(), id = uuid() } = options;

    flow.name = name;
    flow.rules = { ...DefaultRules(), ...rules };
    flow.ruleColors = ruleColors;
    flow.id = id;

    return flow;
  }

  transform(): void {
    [...this.nodes.values()].forEach((node) => node.call("transform", node));
    [...this.groups.values()].forEach((group) => group.call("transform", group));
  }
  existsInFlow(flow: Flow): boolean {
    for (let node of [...this.nodes.values()]) {
      if ((node as SubFlowNode).subFlow === flow) return true;
      else if ((node as SubFlowNode).subFlow) {
        return (node as SubFlowNode).subFlow.existsInFlow(flow);
      }
    }
    return false;
  }
  addInput(name: string, dataType: string, position: Vector = Vector.Zero()): TunnelNode {
    return this._addIO("input", name, position, dataType);
  }
  addOutput(name: string, dataType: string, position: Vector): TunnelNode {
    return this._addIO("output", name, position, dataType);
  }
  private _addIO(type: "input" | "output", name: string, position: Vector, dataType: string): TunnelNode {
    const ioNode = this.createNode<TunnelNode, TunnelNodeOptions>("core/tunnel", position, {
      tunnelType: type,
      name: capitalize(type),
      tunnelName: name,
      tunnelDataType: dataType,
    });

    (type === "input" ? this.inputs : this.outputs).push(ioNode);
    this.call(`add-${type}`, this, ioNode);
    return ioNode;
  }
  addSubFlow(subFlow: Flow, position: Vector = Vector.Zero()): SubFlowNode {
    if (subFlow.parentFlow) {
      Log.error("Provided flow is already a sub-flow, a sub-flow cannot have multiple parent flows");
      return null;
    }

    const node = this.createNode<SubFlowNode, SubFlowNodeOptions>("core/subflow", position, {
      name: subFlow.name,
      width: 150,
      subFlow: subFlow,
    });

    return node;
  }
  removeSubFlow(subFlow: Flow): void;
  removeSubFlow(subFlowNode: SubFlowNode): void;
  removeSubFlow(arg1: Flow | SubFlowNode): void {
    let subFlowNode: SubFlowNode = null;
    if (arg1 instanceof Flow) {
      subFlowNode = [...this.nodes.values()]
        .filter((node) => node.type === "core/subflow")
        .find((node) => (node as SubFlowNode).subFlow === arg1) as SubFlowNode;
      this.removeNode(subFlowNode);
    } else if (arg1 instanceof SubFlowNode) {
      subFlowNode = arg1;
    }

    this.removeNode(subFlowNode);
  }

  createNode<T extends Node = Node, O extends NodeOptions = NodeOptions>(
    type: string,
    position: Vector,
    options: O
  ): T {
    const node = Node.create<T>(type, this, position, options);
    this.addNode(node);
    return node;
  }
  private _createNode<T extends Node = Node, O extends NodeOptions = NodeOptions>(
    type: string,
    position: Vector,
    options: O
  ): T {
    const node = Node.create<T>(type, this, position, options, true);
    this.addNode(node);
    return node;
  }
  private addNode(node: Node): void {
    this.nodes.set(node.id, node);
    this.sortedNodes.add(node);
    this.executionGraph.add(node);
  }
  removeNode(nodeOrID: Node | string) {
    let node = typeof nodeOrID === "string" ? this.nodes.get(nodeOrID) : nodeOrID;

    if (!node) return;

    [...node.inputs, ...node.outputs, ...node.inputsUI, ...node.outputsUI]
      .filter((terminal) => terminal.isConnected())
      .forEach((terminal) => terminal.disconnect());

    if (node.group) {
      node.group.nodes.splice(
        node.group.nodes.findIndex((currNode) => currNode.id === node.id),
        1
      );
    }

    this.nodes.delete(node.id);
    this.sortedNodes.remove(node);
    this.executionGraph.remove(node);
  }
  removeConnector(id: string) {
    if (this.connectors.get(id) === this.floatingConnector) this.floatingConnector = null;
    this.connectors.delete(id);
  }
  removeAllFocus() {
    this.nodes.forEach((node) => (node.focused = false));
  }
  render() {
    this.groups.forEach((group) => group.render());
    this.connectors.forEach((connector) => connector.render());
    this.sortedNodes.forEach((node) => node.render());

    this.call("render", this);
  }
  start() {
    if (this.state !== FlowState.Stopped) return;
    this.executionGraph.start();
    this.call("start", this);
  }
  stop() {
    // Bottom-up, all child sub-flows gets stopped first before parent
    // What if FlowState is Running ?
    if (this.state === FlowState.Stopped) return;

    // Bottom-up, sub-flows are stopped from highest order to lowest (order = depth of node in the tree)
    for (let order = this.executionGraph.nodes.length - 1; order >= 0; order -= 1) {
      this.executionGraph.nodes[order]
        .filter((graphNode) => graphNode.flowNode instanceof SubFlowNode)
        .map((graphNode) => graphNode.flowNode)
        .forEach((subFlowNode: SubFlowNode) => subFlowNode.subFlow.stop());
    }
    this.executionGraph.stop();
    this.call("stop", this);
  }

  setFloatingConnector(floatingPos: Vector, fixedEnd: Terminal, type: string) {
    const start = type === "left" ? fixedEnd : null;
    const end = type === "left" ? null : fixedEnd;

    let connector = Connector.create(this, start, end, { floatingTip: floatingPos });
    this.connectors.set(connector.id, connector);
    this.floatingConnector = connector;
  }
  removeFloatingConnector(): Terminal {
    if (!this.floatingConnector) return;

    let terminal = null;
    if (this.floatingConnector.start) terminal = this.floatingConnector.start;
    else terminal = this.floatingConnector.end;

    if (terminal.node.currHitTerminal) {
      terminal.node.currHitTerminal.onExit(null, null);
      terminal.node.currHitTerminal = null;
    }
    this.removeConnector(this.floatingConnector.id);

    return terminal;
  }

  private static async deSerializeState(
    state: Record<string, any>,
    receive?: DataFetchProvider
  ): Promise<Record<string, any>> {
    for (let key in state) {
      if (typeof state[key] === "string" && (state[key] as string).startsWith("raw##")) {
        if (receive) {
          state[key] = await receive((state[key] as string).replace("raw##", ""));
        } else {
          state[key] = null;
        }
      }
    }
    return state;
  }

  async serialize(persist?: DataPersistenceProvider): Promise<SerializedFlow> {
    const nodes = await Promise.all([...this.nodes.values()].map((node) => node.serialize(persist)));
    const inputs = await Promise.all(this.inputs.map((input) => input.serialize()));
    const outputs = await Promise.all(this.outputs.map((output) => output.serialize()));
    const ruleColors: SerializedRuleColors = {};
    Object.keys(this.ruleColors).forEach((key) => (ruleColors[key] = this.ruleColors[key].serialize()));

    return Promise.resolve<SerializedFlow>({
      version: this.flowConnect.version,
      id: this.id,
      name: this.name,
      rules: this.rules,
      ruleColors,
      nodes,
      groups: this.groups.map((group) => group.serialize()),
      connectors: [...this.connectors.values()].map((connector) => connector.serialize()),
      inputs,
      outputs,
    });
  }
  static async deSerialize(flowConnect: FlowConnect, data: SerializedFlow, receive?: DataFetchProvider): Promise<Flow> {
    const ruleColors: RuleColors = {};
    Object.keys(data.ruleColors).forEach((key) => (ruleColors[key] = Color.create(data.ruleColors[key])));

    let flow = Flow.create(flowConnect, {
      name: data.name,
      rules: data.rules,
      ruleColors,
      id: data.id,
    });

    for (let serializedNode of data.nodes) {
      const state = await this.deSerializeState(serializedNode.state, receive);
      flow._createNode(serializedNode.type, Vector.create(serializedNode.position), {
        ...serializedNode,
        state,
        hitColor: Color.create(serializedNode.hitColor),
      });
    }
    for (let sTunnelNode of [...data.inputs, ...data.outputs]) {
      flow._createNode<TunnelNode, TunnelNodeOptions>(sTunnelNode.type, Vector.create(sTunnelNode.position), {
        ...sTunnelNode,
        hitColor: Color.create(sTunnelNode.hitColor),
      });
    }

    data.groups.forEach((serializedGroup) => {
      let group = Group.create(flow, Vector.create(serializedGroup.position), {
        ...serializedGroup,
        hitColor: Color.create(serializedGroup.hitColor),
      });

      serializedGroup.nodes.forEach((nodeId) => group.add(flow.nodes.get(nodeId)));

      flow.groups.push(group);
    });

    data.connectors.forEach((serializedConnector) => {
      let startNode = flow.nodes.get(serializedConnector.startNodeId);
      let startTerminal = startNode.outputs
        .concat(startNode.outputsUI)
        .find((terminal) => terminal.id === serializedConnector.startId);
      let endNode = flow.nodes.get(serializedConnector.endNodeId);
      let endTerminal = endNode.inputs
        .concat(endNode.inputsUI)
        .find((terminal) => terminal.id === serializedConnector.endId);

      let connector = Connector.create(flow, startTerminal, endTerminal, {
        id: serializedConnector.id,
        style: serializedConnector.style,
      });
      flow.connectors.set(serializedConnector.id, connector);
    });

    // flow.executionGraph = Graph.deSerialize(flow, data.executionGraph);

    return Promise.resolve<Flow>(flow);
  }
}

export enum FlowState {
  Running = "Running",
  Idle = "Idle",
  Stopped = "Stopped",
}

export interface FlowOptions {
  name: string;
  rules: Rules;
  ruleColors?: RuleColors;
  id?: string;
}

const DefaultFlowOptions = (): FlowOptions => ({
  name: "New Flow",
  rules: DefaultRules(),
  ruleColors: {},
});

/** Default rules every Flow will have, for e.g. a string output can only be connected to string inputs.
 *  ```javascript
 *  {
 *    string: ['string'],
 *    number: ['number'],
 *    boolean: ['boolean'],
 *    file: ['file'],
 *    event: ['event'], ...
 *  }
 *  ```
 */
const DefaultRules: () => Rules = () => ({
  string: ["string", "any"],
  number: ["number", "audioparam", "any"],
  boolean: ["boolean", "any"],
  array: ["array", "any"],
  file: ["file", "any"],
  event: ["event", "any"],
  vector: ["vector", "any"],
  "array-buffer": ["array-buffer", "any"],
  audio: ["audio", "audioparam"],
  audioparam: ["audioparam"],
  "audio-buffer": ["audio-buffer", "any"],
  any: ["any"],
});

const DefaultRuleColors: () => RuleColors = () => ({
  string: Color.create("#B2F77D"),
  number: Color.create("#C9A185"),
  boolean: Color.create("#EADFC7"),
  array: Color.create("#3484F0"),
  file: Color.create("#EEEFF7"),
  event: Color.create("#9E64E8"),
  vector: Color.create("#DCC68D"),
  "array-buffer": Color.create("#FF6BCE"),
  audio: Color.create("#FFD154"),
  audioparam: Color.create("#FF0F50"),
  "audio-buffer": Color.create("#C3D4C2"),
  any: Color.create("#FFFBF9"),
});

export interface SerializedFlow {
  version: string;
  id: string;
  name: string;
  rules: Rules;
  ruleColors: SerializedRuleColors;
  nodes: SerializedNode[];
  groups: SerializedGroup[];
  connectors: SerializedConnector[];
  inputs: SerializedTunnelNode[];
  outputs: SerializedTunnelNode[];
}
