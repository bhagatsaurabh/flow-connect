import { Vector2 } from "../math/vector";
import { Constant, FlowState, GraphState, NodeState } from "../math/constants";
import { getNewGUID } from "../utils/utils";
import { Flow } from "./flow";
import { Terminal } from './terminal';
import { ConnectorStyle, Serializable, SerializedConnector } from "./interfaces";
import { Node } from "./node";

export class Connector implements Serializable {
  start: Terminal;
  end: Terminal;
  startNode: Node;
  endNode: Node;
  _data: any;
  get data(): any { return this._data; }
  set data(data: any) {
    this._data = data;
    this.end && this.end.call('data', data);
    if (this.flow.state === FlowState.Running && this.flow.executionGraph.state !== GraphState.FullRun) {
      this.flow.executionGraph.setDirtyNode(this.endNode);
    }
  }

  constructor(
    public flow: Flow,
    start: Terminal,
    end: Terminal,
    public floatingTip: Vector2,
    public style: ConnectorStyle = {},
    public id: string = getNewGUID(),
    isDeserialization: boolean = false
  ) {

    this.style = { ...Constant.DefaultConnectorStyle(), ...style };
    this.start = start;
    this.end = end;
    if (this.start) this.startNode = this.start.node;
    if (this.end) this.endNode = this.end.node;
    if (start && end) {
      this.floatingTip = null;
      this.start.connectors.push(this);
      this.end.connectors.push(this);

      if (!isDeserialization) this.flow.executionGraph.connect(this.startNode, this.endNode);
      this.start.call('connect', this.start, this);
      this.end.call('connect', this.end, this);
    };
  }

  completeConnection(destination: Terminal) {
    if (!this.start) {
      this.start = destination;
      this.startNode = this.start.node;
    } else {
      this.end = destination;
      this.endNode = this.end.node;
    }

    if (!this.start.connectors.includes(this)) this.start.connectors.push(this);
    this.end.connectors[0] = this;
    this.floatingTip = null;

    this.startNode.currHitTerminal && this.startNode.currHitTerminal.onExit(null, null);
    this.startNode.currHitTerminal = null;
    this.endNode.currHitTerminal && this.endNode.currHitTerminal.onExit(null, null);
    this.endNode.currHitTerminal = null;

    this.flow.executionGraph.connect(this.startNode, this.endNode);
    this.start.call('connect', this.start, this);
    this.end.call('connect', this.end, this);
  }
  removeConnection() {
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
  }
  canConnect(destination: Terminal): boolean {
    let source = !this.start ? this.end : this.start;

    if (!destination) return false;
    if (source === destination) return false;
    if (source.node === destination.node) return false;
    if (source.type === destination.type) return false;
    if (!this.flow.rules[source.dataType].includes(destination.dataType)) return false;
    if (!this.flow.executionGraph.canConnect(source.node, destination.node)) return false;
    return true;
  }

  render() {
    this.flow.flowConnect.context.save();
    this._render();
    this.flow.flowConnect.context.restore();

    this.flow.flowConnect.offContext.save();
    this._offRender();
    this.flow.flowConnect.offContext.restore();
  }
  _render() {
    let ax, ay, dx, dy;
    if (this.start) {
      if (this.startNode.renderState.nodeState === NodeState.MAXIMIZED)
        [ax, ay] = [this.start.position.x, this.start.position.y];
      else
        [ax, ay] = [this.startNode.position.x + this.startNode.width + this.startNode.style.terminalStripMargin + this.start.style.radius, this.startNode.position.y + this.startNode.style.titleHeight / 2];
    } else
      [ax, ay] = [this.floatingTip.x, this.floatingTip.y];

    if (this.end) {
      if (this.endNode.renderState.nodeState === NodeState.MAXIMIZED)
        [dx, dy] = [this.end.position.x, this.end.position.y];
      else
        [dx, dy] = [this.endNode.position.x - this.endNode.style.terminalStripMargin - this.end.style.radius, this.endNode.position.y + this.endNode.style.titleHeight / 2];
    } else
      [dx, dy] = [this.floatingTip.x, this.floatingTip.y];

    let offset = Vector2.Distance(ax, ay, dx, dy);
    offset *= .2;

    let [bx, by] = [ax + offset, ay];
    let [cx, cy] = [dx - offset, dy];
    let [midx, midy] = [(bx + cx) / 2, (by + cy) / 2];

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
  }
  _offRender() { }

  serialize(): SerializedConnector {
    return {
      id: this.id,
      startId: this.start.id,
      endId: this.end.id,
      startNodeId: this.startNode.id,
      endNodeId: this.endNode.id,
      style: this.style
    }
  }
  static deSerialize(flow: Flow, start: Terminal, end: Terminal, data: SerializedConnector): Connector {
    return new Connector(flow, start, end, null, data.style, data.id, true);
  }
}
