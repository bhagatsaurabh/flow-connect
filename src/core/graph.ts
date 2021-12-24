import { Log } from "../utils/logger";
import { getNewUUID } from "../utils/utils";
import { Flow, FlowState } from "./flow";
import { Serializable } from "../common/interfaces";
import { Node } from "./node";
import { List } from "../utils/linked-list";

/** @hidden */
// A Directed acyclic graph
export class Graph implements Serializable {
  state: FlowState = FlowState.Stopped;
  nodes: GraphNode[][];
  nodeToGraphNode: { [key: string]: GraphNode };
  dirtyNodes: { [key: string]: GraphNode };

  constructor() {
    this.nodes = [];
    this.nodeToGraphNode = {};
    this.dirtyNodes = {};
  }

  add(data: Node) {
    if (!this.nodes[0]) this.nodes.push([]);
    let graphNode = new GraphNode(data);
    this.nodes[0].push(graphNode);
    this.nodeToGraphNode[data.id] = graphNode;
  }
  connect(sourceNode: Node, destinationNode: Node) {
    let startGraphNode = this.nodeToGraphNode[sourceNode.id];
    let endGraphNode = this.nodeToGraphNode[destinationNode.id];

    if (!startGraphNode.childs.includes(endGraphNode)) {
      startGraphNode.childs.push(endGraphNode);

      if (endGraphNode.order <= startGraphNode.order) {
        this.updateOrder(endGraphNode, startGraphNode.order + 1);
      }
    }
  }
  disconnect(sourceNode: Node, destinationNode: Node) {
    let sourceGraphNode = this.nodeToGraphNode[sourceNode.id];
    let destinationGraphNode = this.nodeToGraphNode[destinationNode.id];

    let connectedEndNodes = new Set<Node>();
    sourceNode.outputs
      .forEach(terminal => terminal.connectors
        .forEach(connector => connector.endNode && connectedEndNodes.add(connector.endNode))
      );

    if (connectedEndNodes.has(destinationNode)) return;
    sourceGraphNode.childs.splice(sourceGraphNode.childs.indexOf(destinationGraphNode), 1);

    let maxOrderOfConnectedStartNodes = destinationNode.inputs
      .filter(terminal => terminal.connectors.length > 0)
      .map(terminal => this.nodeToGraphNode[terminal.connectors[0].startNode.id].order)
      .reduce((acc, curr) => Math.max(acc, curr), 0);

    this.updateOrder(destinationGraphNode, maxOrderOfConnectedStartNodes);
  }
  updateOrder(root: GraphNode, order: number) {
    this._updateOrder(root, order);
    let queue: GraphNode[] = [];
    queue.push(root);
    while (queue.length !== 0) {
      let currNode = queue.shift();
      currNode.childs.forEach(child => {
        if (child.order <= currNode.order) {
          this._updateOrder(child, currNode.order + 1);
          if (!queue.includes(child)) queue.push(child);
        }
      });
    }
  }
  _updateOrder(graphNode: GraphNode, order: number) {
    this.nodes[graphNode.order].splice(this.nodes[graphNode.order].indexOf(graphNode), 1);
    if (!this.nodes[order]) this.nodes[order] = [];
    graphNode.order = order;
    this.nodes[order].push(graphNode);
  }
  canConnect(sourceNode: Node, destinationNode: Node) {
    if (this.nodeToGraphNode[destinationNode.id].childs.includes(this.nodeToGraphNode[sourceNode.id])) return false;
    return true;
  }

  async start() {
    if (this.state === FlowState.Stopped) {       // Full Run
      this.state = FlowState.Running;
      if (this.nodes[0]) {
        try {
          // console.log(this.nodes[0]);
          await this.runAll(this.nodes[0]);

          while (Object.values(this.dirtyNodes).length !== 0) {
            // console.log(Object.assign({}, this.dirtyNodes));
            await this.runAll(this.lowestDirty(Object.values(this.dirtyNodes)));
          }
        } catch (error) {
          Log.error('Error while executing graph', error);
          this.state = FlowState.Stopped;
          return;
        }
      }
    } else if (this.state === FlowState.Idle) {   // Partial Run
      this.state = FlowState.Running;
      try {
        while (Object.values(this.dirtyNodes).length !== 0) {
          // console.log(Object.assign({}, this.dirtyNodes));
          await this.runAll(this.lowestDirty(Object.values(this.dirtyNodes)));
        }
      } catch (error) {
        Log.error('Error while executing graph', error);
        this.state = FlowState.Stopped;
        return;
      }
    }

    this.state = FlowState.Idle;
  }
  stop() {
    this.state = FlowState.Stopped;
  }
  // Runs selective nodes within the >same order< in async (how about parallel, future ?)
  async runAll(graphNodes: GraphNode[]) {
    await Promise.all(
      graphNodes.map(
        graphNode => new Promise<void>(resolve => {
          graphNode.flowNode.run();
          this.clearDirty(graphNode);
          resolve();
        })
      )
    );
  }
  setDirty(node: Node | GraphNode) {
    let graphNode = node instanceof Node ? this.nodeToGraphNode[node.id] : node;
    this.dirtyNodes[graphNode.id] = graphNode;
  }
  clearDirty(node: Node | GraphNode) {
    let graphNode = node instanceof Node ? this.nodeToGraphNode[node.id] : node;
    delete this.dirtyNodes[graphNode.id];
  }
  // Returns all dirty nodes with lowest order
  lowestDirty(graphNodes: GraphNode[]) {
    let lowestOrder = Math.min(...graphNodes.map(graphNode => graphNode.order));
    return graphNodes.filter(graphNode => graphNode.order === lowestOrder);
  }
  // Generic graph traversing function that can be used to do some stuff with nodes starting with provided root
  propagate(root: Node | GraphNode, callback: (node: Node) => void) {
    let start = root instanceof Node ? this.nodeToGraphNode[root.id] : root;
    let queue = new List<GraphNode>();
    queue.append(start);
    while (queue.length !== 0) {
      let currGNode = queue.removeFirst();
      callback(currGNode.flowNode);
      currGNode.childs.forEach(child => queue.append(child));
    }
  }
  debugNode(node: GraphNode, indent: string) {
    console.log(`${indent}[${node.flowNode.name}, ${node.order}]`);
    node.childs.forEach(child => this.debugNode(child, indent + '  '));
  }
  debugGraph() {
    this.nodes[0].forEach(graphNode => {
      this.debugNode(graphNode, '');
    });
  }

  serialize(): SerializedGraph {
    let nodeToGraphNode: { [key: string]: string } = {};
    Object.keys(this.nodeToGraphNode).forEach(nodeId => nodeToGraphNode[nodeId] = this.nodeToGraphNode[nodeId].id);

    return {
      nodes: this.nodes.map(groupedNodes => groupedNodes.map(graphNode => graphNode.serialize())),
      nodeToGraphNode: nodeToGraphNode
    };
  }
  static deSerialize(flow: Flow, data: SerializedGraph): Graph {
    let graph = new Graph();

    let serializedGraphNodes: { [key: string]: SerializedGraphNode } = {};
    let deSerializedGraphNodes: { [key: string]: GraphNode } = {};

    data.nodes.forEach((serializedGroupedNodes, index) => {
      graph.nodes[index] = serializedGroupedNodes.map(serializedGraphNode => {
        let graphNode = GraphNode.deSerialize(flow.nodes[serializedGraphNode.nodeId], serializedGraphNode);
        deSerializedGraphNodes[graphNode.id] = graphNode;
        serializedGraphNodes[graphNode.id] = serializedGraphNode;
        return graphNode;
      });
    });

    Object.keys(deSerializedGraphNodes).forEach(key => {
      deSerializedGraphNodes[key].childs = serializedGraphNodes[key].childs.map(childId => deSerializedGraphNodes[childId]);
    });
    Object.keys(data.nodeToGraphNode).forEach(nodeId => {
      graph.nodeToGraphNode[nodeId] = deSerializedGraphNodes[data.nodeToGraphNode[nodeId]];
    })

    return graph;
  }
}

export interface SerializedGraph {
  nodes: SerializedGraphNode[][],
  nodeToGraphNode: { [key: string]: string }
}

/** @hidden */
export class GraphNode implements Serializable {
  id: string;
  childs: GraphNode[] = [];
  order: number;

  constructor(public flowNode: Node, order?: number, id?: string) {
    this.order = order ? order : 0;
    this.id = id ? id : getNewUUID();
  }

  serialize(): SerializedGraphNode {
    return {
      id: this.id,
      nodeId: this.flowNode.id,
      order: this.order,
      childs: this.childs.map(child => child.id)
    };
  }
  static deSerialize(node: Node, data: SerializedGraphNode): GraphNode {
    return new GraphNode(node, data.order, data.id);
  }
}
export interface SerializedGraphNode {
  id: string,
  nodeId: string,
  order: number,
  childs: string[]
}
