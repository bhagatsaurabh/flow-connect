import { GraphState } from "../math/constants";
import { getNewGUID } from "../utils/utils";
import { Flow } from "./flow";
import { Serializable, SerializedGraph, SerializedGraphNode } from "./interfaces";
import { Node } from "./node";

export class GraphNode implements Serializable {
  id: string;
  childs: GraphNode[] = [];
  order: number;

  constructor(public flowNode: Node, order?: number, id?: string) {
    this.order = order ? order : 0;
    this.id = id ? id : getNewGUID();
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

export class Graph implements Serializable {
  state: GraphState = GraphState.Stopped;
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
        let queue: GraphNode[] = [];
        queue.push(endGraphNode);
        while (queue.length !== 0) {
          let currNode = queue.shift();
          currNode.childs.forEach(child => {
            if (child.order <= currNode.order) {
              this.updateOrder(child, currNode.order + 1);
              if (!queue.includes(child)) queue.push(child);
            }
          });
        }
      }
    }
  }
  updateOrder(graphNode: GraphNode, order: number) {
    this.nodes[graphNode.order].splice(this.nodes[graphNode.order].indexOf(graphNode), 1);
    if (!this.nodes[order]) this.nodes[order] = [];
    graphNode.order = order;
    this.nodes[order].push(graphNode);
  }
  canConnect(sourceNode: Node, destinationNode: Node) {
    if (this.nodeToGraphNode[destinationNode.id].childs.includes(this.nodeToGraphNode[sourceNode.id])) return false;
    return true;
  }

  start() {
    if (this.state !== GraphState.Stopped) return;

    this.state = GraphState.FullRun;

    this.nodes.forEach(groupedNodes => {
      groupedNodes.forEach(graphNode => graphNode.flowNode.run());
    });

    this.state = GraphState.Idle;
  }
  stop() {
    this.state = GraphState.Stopped;
  }
  async partialRun() {
    let result = await new Promise<boolean>((resolve, reject) => {
      try {
        this.processDirtyNodes();
        resolve(true);
      } catch (error) {
        console.log(error);
        reject(false);
      }
    });

    if (result && Object.keys(this.dirtyNodes).length > 0)
      await this.partialRun();
  }
  setDirtyNode(node: Node | GraphNode) {
    let graphNode = node instanceof Node ? this.nodeToGraphNode[node.id] : node;
    if (!this.dirtyNodes[graphNode.id]) {
      this.dirtyNodes[graphNode.id] = graphNode;

      if (this.state === GraphState.Idle) {
        this.state = GraphState.Running;

        this.partialRun().then(() => (this.state = GraphState.Idle));
      }
    }
  }
  clearDirtyNode(node: Node | GraphNode) {
    let graphNode = node instanceof Node ? this.nodeToGraphNode[node.id] : node;
    if (this.dirtyNodes[graphNode.id]) delete this.dirtyNodes[graphNode.id];
  }
  processDirtyNodes() {
    let dirtyNodes = Object.values(this.dirtyNodes).sort((a, b) => (a.order - b.order));
    console.log([...dirtyNodes]);

    let queue: GraphNode[] = dirtyNodes;
    queue.forEach(graphNode => {
      graphNode.flowNode.run();
      this.clearDirtyNode(graphNode);
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
