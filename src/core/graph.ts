import { FlowState } from "../math/constants";
import { Log } from "../utils/logger";
import { getNewGUID } from "../utils/utils";
import { Flow } from "./flow";
import { Serializable, SerializedGraph, SerializedGraphNode } from "./interfaces";
import { Node } from "./node";

/** @hidden */
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

/** @hidden */
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

  async start() {
    if (this.state === FlowState.Stopped) {       // Full Run
      this.state = FlowState.Running;
      if (this.nodes[0]) {
        try {
          console.log(this.nodes[0]);
          await this.runAll(this.nodes[0]);

          while (Object.values(this.dirtyNodes).length !== 0) {
            console.log(Object.assign({}, this.dirtyNodes));
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
          console.log(Object.assign({}, this.dirtyNodes));
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
