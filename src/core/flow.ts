import { FlowConnect } from "../flow-connect.js";
import { Vector } from "./vector.js";
import { Node, NodeButton, NodeButtonRenderParams, NodeRenderParams, NodeStyle, SerializedNode } from "./node.js";
import { Hooks } from './hooks.js';
import { Group, GroupRenderParams, SerializedGroup } from './group.js';
import { Connector, ConnectorRenderParams, SerializedConnector } from './connector.js';
import { AVLTree } from "../utils/avl-tree.js";
import { Serializable, Rules, RenderResolver, DataPersistenceProvider, DataFetchProvider } from '../common/interfaces.js';
import { SubFlowNode } from "./subflow-node.js";
import { TunnelNode, SerializedTunnelNode } from "./tunnel-node.js";
import { getNewUUID } from "../utils/utils.js";
import { Graph, SerializedGraph } from "./graph.js";
import { Terminal, TerminalRenderParams, TerminalStyle } from "./terminal.js";
import { Log } from '../utils/logger.js';
import { Container, ContainerRenderParams } from '../ui/container.js';

/** A Flow is a set of Nodes, Connectors and Groups, it can also contain SubFlowNodes thereby creating a tree of Flows.
 *  ![](media://example.png)
 */
export class Flow extends Hooks implements Serializable<SerializedFlow> {
  sortedNodes: AVLTree<Node>;
  nodes: Map<string, Node>;
  groups: Group[];
  connectors: Map<string, Connector>;
  inputs: TunnelNode[];
  outputs: TunnelNode[];
  get state(): FlowState { return this.executionGraph.state; }
  globalEvents: Hooks = new Hooks();
  parentFlow: Flow = null;

  nodeHitColors: Map<string, Node>;
  groupHitColors: Map<string, Group>;
  listeners: Record<string, number> = {};

  executionGraph: Graph;

  readonly renderResolver: {
    connector?: RenderResolver<Connector, ConnectorRenderParams>,
    node?: RenderResolver<Node, NodeRenderParams>,
    nodeButton?: RenderResolver<NodeButton, NodeButtonRenderParams>,
    uiContainer?: RenderResolver<Container, ContainerRenderParams>
    group?: RenderResolver<Group, GroupRenderParams>,
    terminal?: RenderResolver<Terminal, TerminalRenderParams>,
  } = {};

  constructor(
    public flowConnect: FlowConnect,
    public name: string,
    public rules: Rules,
    public terminalColors: Record<string, string>,
    public id: string = getNewUUID()
  ) {

    super();
    this.nodes = new Map();
    this.groups = [];
    this.connectors = new Map();
    this.nodeHitColors = new Map();
    this.groupHitColors = new Map();
    this.sortedNodes = new AVLTree((a: Node, b: Node) => (a.zIndex - b.zIndex), (node: Node) => node.id);
    this.inputs = [];
    this.outputs = [];
    this.executionGraph = new Graph();

    this.registerListeners();

    this.flowConnect.on('tick', () => {
      if (this.state === FlowState.Running) this.call('tick', this);
    });
  }

  private registerListeners() {
    let id = this.flowConnect.on('transform', () => this.call('transform', this));
    this.listeners['transform'] = id;
  }
  deregisterListeners() {
    this.flowConnect.off('transform', this.listeners['transform']);
    delete this.listeners['transform'];
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
    let flowInput = new TunnelNode(this, 'Input', position, 100, [], [{ name: name, dataType: dataType }]);
    flowInput.on('process', () => {
      flowInput.outputs[0].setData(flowInput.proxyTerminal.getData());
    });

    this.inputs.push(flowInput);
    this.nodes.set(flowInput.id, flowInput);
    this.sortedNodes.add(flowInput);
    this.executionGraph.add(flowInput);

    this.call('add-input', this, flowInput);
    return flowInput;
  }
  addOutput(name: string, dataType: string, position: Vector): TunnelNode {
    let flowOutput = new TunnelNode(this, 'Output', position, 100, [{ name: name, dataType: dataType }], []);

    this.outputs.push(flowOutput);
    this.nodes.set(flowOutput.id, flowOutput);
    this.sortedNodes.add(flowOutput);
    this.executionGraph.add(flowOutput);

    this.call('add-output', this, flowOutput);
    return flowOutput;
  }
  addSubFlow(flow: Flow, position: Vector = Vector.Zero()): SubFlowNode {
    if (flow.parentFlow) {
      Log.error('Provided flow is already a sub-flow, a sub-flow cannot have multiple parent flows');
      return null;
    }
    let subFlowNode = new SubFlowNode(this, flow, position, 150,
      flow.inputs.map(inputNode => { return { name: inputNode.outputs[0].name, dataType: inputNode.outputs[0].dataType } }),
      flow.outputs.map(outputNode => { return { name: outputNode.inputs[0].name, dataType: outputNode.inputs[0].dataType } }),
      { name: flow.name }
    );
    flow.parentFlow = this;

    return subFlowNode;
  }
  createNode(name: string, position: Vector, width: number, options?: NodeOptions): Node {
    options = options ? { ...DefaultNodeOptions(), ...options } : DefaultNodeOptions();

    let inTerminals: any[] = [], outTerminals: any[] = [];
    if (typeof options.inputs !== 'undefined') inTerminals = options.inputs;
    if (typeof options.outputs !== 'undefined') outTerminals = options.outputs;

    return new Node(this, name, position, width, inTerminals, outTerminals, {
      style: options.style,
      terminalStyle: options.terminalStyle,
      state: options.state
    });
  }
  removeNode(nodeOrID: Node | string) {
    let node = typeof nodeOrID === 'string' ? this.nodes.get(nodeOrID) : nodeOrID;

    [...node.inputs, ...node.outputs, ...node.inputsUI, ...node.outputsUI]
      .filter(terminal => terminal.isConnected())
      .forEach(terminal => terminal.disconnect());

    if (node.group) {
      node.group.nodes
        .splice(node.group.nodes.findIndex(currNode => currNode.id === node.id), 1);
    }

    this.nodes.delete(node.id);
    this.sortedNodes.remove(node);
    this.executionGraph.remove(node);
  }
  removeConnector(id: string) {
    if (this.connectors.get(id) === this.flowConnect.floatingConnector) this.flowConnect.floatingConnector = null;
    this.connectors.delete(id);
  }
  removeAllFocus() {
    this.nodes.forEach(node => node.focused = false);
  }
  render() {
    this.groups.forEach(group => group.render());
    this.connectors.forEach(connector => connector.render());
    this.sortedNodes.forEach(node => node.render());

    this.call('render', this);
  }
  start() {
    if (this.state !== FlowState.Stopped) return;
    this.executionGraph.start();
    this.call('start', this);
  }
  stop() {
    // Bottom-up, all child sub-flows gets stopped first before parent
    // What if FlowState is Running ?
    if (this.state === FlowState.Stopped) return;

    // Bottom-up, sub-flows are stopped from highest order to lowest (order = depth of node in the tree)
    for (let order = this.executionGraph.nodes.length - 1; order >= 0; order -= 1) {
      this.executionGraph.nodes[order]
        .filter(graphNode => graphNode.flowNode instanceof SubFlowNode)
        .map(graphNode => graphNode.flowNode)
        .forEach((subFlowNode: SubFlowNode) => subFlowNode.subFlow.stop());
    }
    this.executionGraph.stop();
    this.call('stop', this);
  }

  async serialize(persist?: DataPersistenceProvider): Promise<SerializedFlow> {
    const nodes = await Promise.all([...this.nodes.values()].map(node => node.serialize(persist)));
    const inputs = await Promise.all(this.inputs.map(input => input.serialize()));
    const outputs = await Promise.all(this.outputs.map(output => output.serialize()));

    return Promise.resolve<SerializedFlow>({
      id: this.id,
      name: this.name,
      rules: this.rules,
      terminalColors: this.terminalColors,
      nodes,
      groups: this.groups.map(group => group.serialize()),
      connectors: [...this.connectors.values()].map(connector => connector.serialize()),
      inputs,
      outputs,
      executionGraph: this.executionGraph.serialize(),
    });
  }
  static async deSerialize(flowConnect: FlowConnect, data: SerializedFlow, receive?: DataFetchProvider): Promise<Flow> {
    let flow = new Flow(flowConnect, data.name, data.rules, data.terminalColors, data.id);

    for (let serializedNode of data.nodes) {
      let node;
      if (serializedNode.subFlow) {
        node = await SubFlowNode.deSerialize(flow, serializedNode, receive);
        node.subFlow.parentFlow = flow;
      }
      else {
        node = await Node.deSerialize(flow, serializedNode, receive);
      }
      flow.nodes.set(node.id, node);
      flow.sortedNodes.add(node);
    }
    data.groups.forEach(serializedGroup => {
      let group = Group.deSerialize(flow, serializedGroup);
      flow.groups.push(group);
      group.nodes.forEach(node => node.group = group);
    });
    for (let serializedInput of data.inputs) {
      let input = await TunnelNode.deSerialize(flow, serializedInput, receive);
      flow.inputs.push(input);
      flow.nodes.set(input.id, input);
      flow.sortedNodes.add(input);
    }
    for (let serializedOutput of data.outputs) {
      let output = await TunnelNode.deSerialize(flow, serializedOutput, receive);
      flow.outputs.push(output);
      flow.nodes.set(output.id, output);
      flow.sortedNodes.add(output);
    }

    data.connectors.forEach(serializedConnector => {
      let startNode = flow.nodes.get(serializedConnector.startNodeId);
      let startTerminal = startNode.outputs.concat(startNode.outputsUI).find(terminal => terminal.id === serializedConnector.startId);
      let endNode = flow.nodes.get(serializedConnector.endNodeId);
      let endTerminal = endNode.inputs.concat(endNode.inputsUI).find(terminal => terminal.id === serializedConnector.endId);
      let connector = Connector.deSerialize(flow, startTerminal, endTerminal, serializedConnector);
      flow.connectors.set(serializedConnector.id, connector);
    });

    flow.executionGraph = Graph.deSerialize(flow, data.executionGraph);

    return Promise.resolve<Flow>(flow);
  }
}

export enum FlowState {
  Running = 'Running',
  Idle = 'Idle',
  Stopped = 'Stopped'
}

export interface FlowOptions {
  name: string,
  rules: Rules,
  terminalColors: Record<string, string>
}

export interface SerializedFlow {
  id: string,
  name: string,
  rules: Rules,
  terminalColors: Record<string, string>,
  nodes: SerializedNode[],
  groups: SerializedGroup[],
  connectors: SerializedConnector[],
  inputs: SerializedTunnelNode[],
  outputs: SerializedTunnelNode[],
  executionGraph: SerializedGraph
}

export interface NodeOptions {
  inputs?: any[],
  outputs?: any[],
  style: NodeStyle,
  terminalStyle: TerminalStyle,
  state?: Record<string, any>
}
let DefaultNodeOptions = (): NodeOptions => {
  return {
    style: {},
    terminalStyle: {}
  }
}
