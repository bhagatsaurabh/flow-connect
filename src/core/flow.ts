import { Color, FlowConnect } from "../flow-connect.js";
import { Vector } from "./vector.js";
import { Node, NodeButton, NodeButtonRenderParams, NodeOptions, NodeRenderParams, SerializedNode } from "./node.js";
import { Hooks } from "./hooks.js";
import { Group, GroupRenderParams, SerializedGroup } from "./group.js";
import { Connector, ConnectorRenderParams, SerializedConnector } from "./connector.js";
import { AVLTree } from "../utils/avl-tree.js";
import {
  Serializable,
  Rules,
  RenderResolver,
  DataPersistenceProvider,
  DataFetchProvider,
} from "../common/interfaces.js";
import { SubFlowNode, SubFlowNodeOptions } from "./subflow-node.js";
import { TunnelNode, SerializedTunnelNode, TunnelNodeOptions } from "./tunnel-node.js";
import { capitalize, uuid } from "../utils/utils.js";
import { Graph, SerializedGraph } from "./graph.js";
import { Terminal, TerminalRenderParams } from "./terminal.js";
import { Log } from "../utils/logger.js";
import { Container, ContainerRenderParams } from "../ui/container.js";

/** A Flow is a set of Nodes, Connectors and Groups, it can also contain SubFlowNodes thereby creating a tree of Flows.
 *  ![](media://example.png)
 */
export class Flow extends Hooks implements Serializable<SerializedFlow> {
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

  readonly renderResolver: {
    connector?: RenderResolver<Connector, ConnectorRenderParams>;
    node?: RenderResolver<Node, NodeRenderParams>;
    nodeButton?: RenderResolver<NodeButton, NodeButtonRenderParams>;
    uiContainer?: RenderResolver<Container, ContainerRenderParams>;
    group?: RenderResolver<Group, GroupRenderParams>;
    terminal?: RenderResolver<Terminal, TerminalRenderParams>;
  } = {};

  constructor(
    public flowConnect: FlowConnect,
    public name: string,
    public rules: Rules,
    public terminalColors: Record<string, string>,
    public id: string = uuid()
  ) {
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

    this.registerListeners();

    this.flowConnect.on("tick", () => {
      if (this.state === FlowState.Running) this.call("tick", this);
    });
  }

  transform(): void {
    [...this.nodes.values()].forEach((node) => node.call("transform", node));
    [...this.groups.values()].forEach((group) => group.call("transform", group));
  }
  private registerListeners() {
    let id = this.flowConnect.on("transform", () => this.call("transform", this));
    this.listeners["transform"] = id;
  }
  deregisterListeners() {
    this.flowConnect.off("transform", this.listeners["transform"]);
    delete this.listeners["transform"];
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
  addInput(name: string, dataType: string, position: Vector): TunnelNode {
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

    this.inputs.push(ioNode);
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

  async serialize(persist?: DataPersistenceProvider): Promise<SerializedFlow> {
    const nodes = await Promise.all([...this.nodes.values()].map((node) => node.serialize(persist)));
    const inputs = await Promise.all(this.inputs.map((input) => input.serialize()));
    const outputs = await Promise.all(this.outputs.map((output) => output.serialize()));

    return Promise.resolve<SerializedFlow>({
      id: this.id,
      name: this.name,
      rules: this.rules,
      terminalColors: this.terminalColors,
      nodes,
      groups: this.groups.map((group) => group.serialize()),
      connectors: [...this.connectors.values()].map((connector) => connector.serialize()),
      inputs,
      outputs,
    });
  }
  static async deSerialize(flowConnect: FlowConnect, data: SerializedFlow, receive?: DataFetchProvider): Promise<Flow> {
    let flow = new Flow(flowConnect, data.name, data.rules, data.terminalColors, data.id);

    for (let serializedNode of data.nodes) {
      flow._createNode(serializedNode.type, Vector.create(serializedNode.position), {
        name: serializedNode.name,
        type: serializedNode.type,
        width: serializedNode.width,
        style: serializedNode.style,
        state: serializedNode.state,
        id: serializedNode.id,
        hitColor: Color.create(serializedNode.hitColor),
        inputs: serializedNode.inputs,
        outputs: serializedNode.outputs,
      });
    }
    data.groups.forEach((serializedGroup) => {
      let group = Group.create(serializedGroup.name, {
        width: serializedGroup.width,
        height: serializedGroup.height,
        style: serializedGroup.style,
        id: serializedGroup.id,
        hitColor: Color.create(serializedGroup.hitColor),
      }).build(flow, Vector.create(serializedGroup.position));

      serializedGroup.nodes.forEach((nodeId) => group.add(flow.nodes.get(nodeId)));

      flow.groups.push(group);
    });
    for (let serializedInput of [...data.inputs, ...data.outputs]) {
      flow._createNode<TunnelNode, TunnelNodeOptions>(serializedInput.type, Vector.create(serializedInput.position), {
        name: serializedInput.name,
        tunnelType: serializedInput.tunnelType,
        width: serializedInput.width,
        style: serializedInput.style,
        state: serializedInput.state,
        id: serializedInput.id,
        hitColor: Color.create(serializedInput.hitColor),
        inputs: serializedInput.inputs,
        outputs: serializedInput.outputs,
      });
    }

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
  terminalColors: Record<string, string>;
}

export interface SerializedFlow {
  id: string;
  name: string;
  rules: Rules;
  terminalColors: Record<string, string>;
  nodes: SerializedNode[];
  groups: SerializedGroup[];
  connectors: SerializedConnector[];
  inputs: SerializedTunnelNode[];
  outputs: SerializedTunnelNode[];
}
