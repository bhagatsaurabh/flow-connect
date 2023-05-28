import { Log } from "../utils/logger.js";
import { uuid } from "../utils/utils.js";
import { Flow, FlowState } from "./flow.js";
import { Serializable } from "../common/interfaces.js";
import { Node } from "./node.js";
import { List } from "../utils/linked-list.js";

// A directed acyclic graph
export class Graph implements Serializable<SerializedGraph> {
  state: FlowState = FlowState.Stopped;
  nodes: GraphNode[][];
  graphNodes: Map<string, GraphNode>;
  dirtyNodes: Map<string, GraphNode>;

  constructor() {
    this.nodes = [];
    this.graphNodes = new Map();
    this.dirtyNodes = new Map();
  }

  add(data: Node) {
    if (!this.nodes[0]) this.nodes.push([]);
    let graphNode = new GraphNode(data);
    this.nodes[0].push(graphNode);
    this.graphNodes.set(data.id, graphNode);
  }
  remove(data: Node) {
    let graphNode = this.graphNodes.get(data.id);
    this.dirtyNodes.delete(graphNode.id);
    this.graphNodes.delete(data.id);
    this.nodes[0].splice(
      this.nodes[0].findIndex((node) => node.id === graphNode.id),
      1
    );
  }
  connect(sourceNode: Node, destinationNode: Node) {
    let startGraphNode = this.graphNodes.get(sourceNode.id);
    let endGraphNode = this.graphNodes.get(destinationNode.id);

    if (!startGraphNode.childs.includes(endGraphNode)) {
      startGraphNode.childs.push(endGraphNode);

      if (endGraphNode.order <= startGraphNode.order) {
        this.updateOrder(endGraphNode, startGraphNode.order + 1);
      }
    }
  }
  disconnect(sourceNode: Node, destinationNode: Node) {
    let sourceGraphNode = this.graphNodes.get(sourceNode.id);
    let destinationGraphNode = this.graphNodes.get(destinationNode.id);

    let connectedEndNodes = new Set<Node>();
    sourceNode.outputs.forEach((terminal) =>
      terminal.connectors.forEach((connector) => connector.endNode && connectedEndNodes.add(connector.endNode))
    );

    if (connectedEndNodes.has(destinationNode)) return;
    sourceGraphNode.childs.splice(sourceGraphNode.childs.indexOf(destinationGraphNode), 1);

    let maxOrderOfConnectedStartNodes = destinationNode.inputs
      .filter((terminal) => terminal.connectors.length > 0)
      .map((terminal) => this.graphNodes.get(terminal.connectors[0].startNode.id).order)
      .reduce((acc, curr) => Math.max(acc, curr), 0);

    this.updateOrder(destinationGraphNode, maxOrderOfConnectedStartNodes);
  }
  updateOrder(root: GraphNode, order: number) {
    this._updateOrder(root, order);
    let queue: GraphNode[] = [];
    queue.push(root);
    while (queue.length !== 0) {
      let currNode = queue.shift();
      currNode.childs.forEach((child) => {
        if (child.order <= currNode.order) {
          this._updateOrder(child, currNode.order + 1);
        }
        if (!queue.includes(child)) queue.push(child);
      });
    }
  }
  private _updateOrder(graphNode: GraphNode, order: number) {
    this.nodes[graphNode.order].splice(this.nodes[graphNode.order].indexOf(graphNode), 1);
    if (!this.nodes[order]) this.nodes[order] = [];
    graphNode.order = order;
    this.nodes[order].push(graphNode);
  }
  canConnect(sourceNode: Node, destinationNode: Node) {
    if (this.graphNodes.get(destinationNode.id).childs.includes(this.graphNodes.get(sourceNode.id))) return false;
    return true;
  }

  async start() {
    if (this.state === FlowState.Stopped) {
      // Full Run
      this.state = FlowState.Running;
      if (this.nodes[0]) {
        try {
          await this.runAll(this.nodes[0]);

          while (this.dirtyNodes.size !== 0) {
            await this.runAll(this.lowestDirty([...this.dirtyNodes.values()]));
          }
        } catch (error) {
          Log.error("Error while executing graph", error);
          this.state = FlowState.Stopped;
          return;
        }
      }
    } else if (this.state === FlowState.Idle) {
      // Partial Run
      this.state = FlowState.Running;
      try {
        while (this.dirtyNodes.size !== 0) {
          await this.runAll(this.lowestDirty([...this.dirtyNodes.values()]));
        }
      } catch (error) {
        Log.error("Error while executing graph", error);
        this.state = FlowState.Stopped;
        return;
      }
    }

    this.state = FlowState.Idle;
  }
  stop() {
    this.state = FlowState.Stopped;
  }
  // Runs selective nodes within the >same order< in async
  async runAll(graphNodes: GraphNode[]) {
    await Promise.all(
      graphNodes.map(
        (graphNode) =>
          new Promise<void>((resolve) => {
            graphNode.flowNode.run();
            this.clearDirty(graphNode);
            resolve();
          })
      )
    );
  }
  setDirty(node: Node | GraphNode) {
    let graphNode = node instanceof Node ? this.graphNodes.get(node.id) : node;
    if (!graphNode) return;

    this.dirtyNodes.set(graphNode.id, graphNode);
  }
  clearDirty(node: Node | GraphNode) {
    let graphNode = node instanceof Node ? this.graphNodes.get(node.id) : node;
    this.dirtyNodes.delete(graphNode.id);
  }
  // Returns all dirty nodes with lowest order
  lowestDirty(graphNodes: GraphNode[]) {
    let lowestOrder = Math.min(...graphNodes.map((graphNode) => graphNode.order));
    return graphNodes.filter((graphNode) => graphNode.order === lowestOrder);
  }
  // Generic BFS graph traversing function
  propagate(root: Node | GraphNode, callback: (node: Node) => void) {
    let start = root instanceof Node ? this.graphNodes.get(root.id) : root;
    let queue = new List<GraphNode>();
    queue.append(start);
    while (queue.length !== 0) {
      let currGNode = queue.removeFirst();
      callback(currGNode.flowNode);
      currGNode.childs.forEach((child) => queue.append(child));
    }
  }
  debugNode(node: GraphNode, indent: string) {
    Log.info(`${indent}[${node.flowNode.name}, ${node.order}]`);
    node.childs.forEach((child) => this.debugNode(child, indent + "  "));
  }
  debugGraph() {
    this.nodes[0].forEach((graphNode) => {
      this.debugNode(graphNode, "");
    });
  }

  serialize(): SerializedGraph {
    let nodeToGraphNodeIds: Record<string, string> = {};
    this.graphNodes.forEach((_graphNode, id) => (nodeToGraphNodeIds[id] = this.graphNodes.get(id).id));

    return {
      nodes: this.nodes.map((groupedNodes) => groupedNodes.map((graphNode) => graphNode.serialize())),
      nodeToGraphNode: nodeToGraphNodeIds,
    };
  }
  static deSerialize(flow: Flow, data: SerializedGraph): Graph {
    let graph = new Graph();

    let serializedGraphNodes: Record<string, SerializedGraphNode> = {};
    let deSerializedGraphNodes: Record<string, GraphNode> = {};

    data.nodes.forEach((serializedGroupedNodes, index) => {
      graph.nodes[index] = serializedGroupedNodes.map((serializedGraphNode) => {
        let graphNode = GraphNode.deSerialize(flow.nodes.get(serializedGraphNode.nodeId), serializedGraphNode);
        deSerializedGraphNodes[graphNode.id] = graphNode;
        serializedGraphNodes[graphNode.id] = serializedGraphNode;
        return graphNode;
      });
    });

    Object.keys(deSerializedGraphNodes).forEach((key) => {
      deSerializedGraphNodes[key].childs = serializedGraphNodes[key].childs.map(
        (childId) => deSerializedGraphNodes[childId]
      );
    });
    Object.keys(data.nodeToGraphNode).forEach((nodeId) => {
      graph.graphNodes.set(nodeId, deSerializedGraphNodes[data.nodeToGraphNode[nodeId]]);
    });

    return graph;
  }
}
export interface SerializedGraph {
  nodes: SerializedGraphNode[][];
  nodeToGraphNode: Record<string, string>;
}

export class GraphNode implements Serializable<SerializedGraphNode> {
  id: string;
  childs: GraphNode[] = [];
  order: number;

  constructor(public flowNode: Node, order?: number, id?: string) {
    this.order = order ? order : 0;
    this.id = id ? id : uuid();
  }

  serialize(): SerializedGraphNode {
    return {
      id: this.id,
      nodeId: this.flowNode.id,
      order: this.order,
      childs: this.childs.map((child) => child.id),
    };
  }
  static deSerialize(node: Node, data: SerializedGraphNode): GraphNode {
    return new GraphNode(node, data.order, data.id);
  }
}
export interface SerializedGraphNode {
  id: string;
  nodeId: string;
  order: number;
  childs: string[];
}
