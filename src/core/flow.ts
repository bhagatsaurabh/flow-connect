import { FlowConnect } from "../flow-connect";
import { Vector2 } from "../math/vector";
import { Node } from "./node";
import { Hooks } from './hooks';
import { Group } from './group';
import { Connector } from './connector';
import { AVLTree } from "../utils/avl-tree";
import { NodeStyle, Serializable, SerializedFlow, TerminalStyle } from './interfaces';
import { SubFlowNode } from "./subflow-node";
import { TunnelNode } from "./tunnel-node";
import { getNewGUID } from "../utils/utils";
import { FlowState } from "../math/constants";
import { Graph } from "./graph";
import { Rules } from "./interfaces";
import { TerminalTypeColors } from "./interfaces";

/** A Flow is a set of [[Node]]s, [[Connector]]s and [[Group]]s, it can also contain [[SubFlowNode]]s thereby creating a tree of Flows.
 *  ![](media://example.png)
 */
export class Flow extends Hooks implements Serializable {
  sortedNodes: AVLTree<Node>;
  nodes: { [id: string]: Node };
  groups: Group[];
  connectors: { [id: string]: Connector };
  inputs: TunnelNode[];
  outputs: TunnelNode[];
  get state(): FlowState { return this.executionGraph.state; }

  /** @hidden */
  hitColorToNode: { [color: string]: Node };
  /** @hidden */
  hitColorToGroup: { [color: string]: Group };
  /** @hidden */
  listeners: { [eventKey: string]: number } = {};
  /** @hidden */
  executionGraph: Graph;

  constructor(
    public flowConnect: FlowConnect,
    public name: string,
    public rules: Rules,
    public terminalTypeColors: TerminalTypeColors,
    public id: string = getNewGUID()
  ) {

    super();
    this.nodes = {};
    this.groups = [];
    this.connectors = {};
    this.hitColorToNode = {};
    this.hitColorToGroup = {};
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
  /** @hidden */
  deregisterListeners() {
    this.flowConnect.off('transform', this.listeners['transform']);
    delete this.listeners['transform'];
  }
  /** @hidden */
  existsInFlow(flow: Flow): boolean {
    for (let node of Object.values(this.nodes)) {
      if ((node as SubFlowNode).subFlow === flow) return true;
      else if ((node as SubFlowNode).subFlow) {
        return (node as SubFlowNode).subFlow.existsInFlow(flow);
      }
    }
    return false;
  }

  addInput(name: string, dataType: string, position: Vector2): TunnelNode {
    let flowInput = new TunnelNode(this, 'Input', position, 100, [], [{ name: name, dataType: dataType }], {}, {}, {});
    flowInput.on('process', () => {
      (flowInput.outputs[0] as any).setData((flowInput.proxyTerminal as any).getData());
    });

    this.inputs.push(flowInput);
    this.nodes[flowInput.id] = flowInput;
    this.sortedNodes.add(flowInput);
    this.executionGraph.add(flowInput);

    this.call('add-input', this, flowInput);
    return flowInput;
  }
  addOutput(name: string, dataType: string, position: Vector2): TunnelNode {
    let flowOutput = new TunnelNode(this, 'Output', position, 100, [{ name: name, dataType: dataType }], [], {}, {}, {});

    this.outputs.push(flowOutput);
    this.nodes[flowOutput.id] = flowOutput;
    this.sortedNodes.add(flowOutput);
    this.executionGraph.add(flowOutput);

    this.call('add-output', this, flowOutput);
    return flowOutput;
  }
  addSubFlow(flow: Flow, position: Vector2): SubFlowNode {
    let subFlowNode = new SubFlowNode(
      this,
      flow.name,
      position,
      150,
      {}, {}, {},
      flow.inputs.map(inputNode => { return { name: inputNode.outputs[0].name, dataType: inputNode.outputs[0].dataType } }),
      flow.outputs.map(outputNode => { return { name: outputNode.inputs[0].name, dataType: outputNode.inputs[0].dataType } }),
      flow
    );
    this.nodes[subFlowNode.id] = subFlowNode;
    this.sortedNodes.add(subFlowNode);
    this.executionGraph.add(subFlowNode);
    return subFlowNode;
  }
  createNode(name: string, position: Vector2, width: number, inputs?: any[], outputs?: any[], style: NodeStyle = {}, terminalStyle: TerminalStyle = {}, props?: { [key: string]: any }): Node {
    let inTerminals: any[] = [], outTerminals: any[] = [];
    if (typeof inputs !== 'undefined') inTerminals = inputs;
    if (typeof outputs !== 'undefined') outTerminals = outputs;
    let node = new Node(
      this,
      name,
      position,
      width,
      inTerminals,
      outTerminals,
      style,
      terminalStyle,
      props
    );

    this.nodes[node.id] = node;
    this.sortedNodes.add(node);
    this.executionGraph.add(node);

    return node;
  }
  removeNode(nodeOrID: Node | string) {
    /*
    if (nodeOrID instanceof Node) nodeOrID = nodeOrID.id;
 
    let queue = [];
    let currentNode;
    queue.push(this.renderTree);
 
    while ((currentNode = queue.shift())) {
      if (currentNode.id == nodeOrID) {
        currentNode.transform.parent.childs.splice(currentNode.transform.parent.childs.indexOf(currentNode.transform), 1);
      } else {
        currentNode.transform.childs.forEach((child) => {
          queue.push(child.node);
        });
      }
    }
    */
  }
  removeConnector(id: string) {
    if (this.connectors[id] === this.flowConnect.floatingConnector) this.flowConnect.floatingConnector = null;
    delete this.connectors[id];
  }
  removeAllFocus() {
    Object.values(this.nodes).forEach(node => node.focused = false);
  }
  render() {
    this.groups.forEach(group => group.render());
    Object.values(this.connectors).forEach(connector => connector.render());
    this.sortedNodes.forEach(node => node.render());
  }
  start() {
    if (this.state !== FlowState.Stopped) return;
    this.flowConnect.startGlobalTime();
    this.executionGraph.start();
    this.call('start', this);
  }
  stop() {
    if (this.state === FlowState.Stopped) return;
    // what if FlowState is Running ?
    this.executionGraph.stop();
    this.flowConnect.stopGlobalTime();
    Object.values(this.nodes).forEach(node => {
      if (node instanceof SubFlowNode) {
        node.subFlow.stop();
        // maybe stop in reverse execution sequence... ?
      }
    });
    this.call('stop', this);
  }

  serialize(): SerializedFlow {
    return {
      id: this.id,
      name: this.name,
      rules: this.rules,
      terminalTypeColors: this.terminalTypeColors,
      nodes: Object.values(this.nodes).map(node => node.serialize()),
      groups: this.groups.map(group => group.serialize()),
      connectors: Object.values(this.connectors).map(connector => connector.serialize()),
      inputs: this.inputs.map(input => input.serialize()),
      outputs: this.outputs.map(output => output.serialize()),
      executionGraph: this.executionGraph.serialize()
    }
  }
  static deSerialize(flowConnect: FlowConnect, data: SerializedFlow): Flow {
    let flow = new Flow(flowConnect, data.name, data.rules, data.terminalTypeColors, data.id);

    data.nodes.forEach(serializedNode => {
      let node;
      if (serializedNode.subFlow) node = SubFlowNode.deSerialize(flow, serializedNode);
      else node = Node.deSerialize(flow, serializedNode);
      flow.nodes[node.id] = node;
      flow.sortedNodes.add(node);
    });

    data.groups.forEach(serializedGroup => {
      let group = Group.deSerialize(flow, serializedGroup);
      flow.groups.push(group);
      group.nodes.forEach(node => node.group = group);
    });

    data.inputs.forEach(serializedInput => {
      let input = TunnelNode.deSerialize(flow, serializedInput);
      flow.inputs.push(input);
      flow.nodes[input.id] = input;
      flow.sortedNodes.add(input);
    });

    data.outputs.forEach(serializedOutput => {
      let output = TunnelNode.deSerialize(flow, serializedOutput);
      flow.outputs.push(output);
      flow.nodes[output.id] = output;
      flow.sortedNodes.add(output);
    });

    data.connectors.forEach(serializedConnector => {
      let startNode = flow.nodes[serializedConnector.startNodeId];
      let startTerminal = startNode.outputs.concat(startNode.outputsUI).find(terminal => terminal.id === serializedConnector.startId);
      let endNode = flow.nodes[serializedConnector.endNodeId];
      let endTerminal = endNode.inputs.concat(endNode.inputsUI).find(terminal => terminal.id === serializedConnector.endId);
      let connector = Connector.deSerialize(flow, startTerminal, endTerminal, serializedConnector);
      flow.connectors[serializedConnector.id] = connector;
    });

    flow.executionGraph = Graph.deSerialize(flow, data.executionGraph);

    return flow;
  }
}
