import { Vector, SerializedVector } from "./vector.js";
import { canConnect, get, uuid } from "../utils/utils.js";
import { Flow, FlowState } from "./flow.js";
import { Terminal, TerminalType } from "./terminal.js";
import { Renderable, RenderResolver, Serializable } from "../common/interfaces.js";
import { Node, NodeState } from "./node.js";
import { Hooks } from "./hooks.js";

export class Connector extends Hooks implements Serializable<SerializedConnector>, Renderable {
  renderer: RenderResolver<Connector, ConnectorRenderParams> = () => null;

  flow: Flow;
  id: string;
  start: Terminal;
  end: Terminal;
  startNode: Node;
  endNode: Node;
  style: ConnectorStyle;

  _data: any;
  floatingTip: Vector;

  get data(): any {
    return this._data;
  }
  set data(data: any) {
    this.setData(data);

    if (this.flow.state !== FlowState.Stopped) {
      this.flow.executionGraph.setDirty(this.endNode);
    }
  }

  private constructor() {
    super();
  }

  static create(
    flow: Flow,
    start: Terminal,
    end: Terminal,
    options: ConnectorOptions = DefaultConnectorOptions()
  ): Connector {
    const connector = new Connector();

    const { style, id = uuid(), floatingTip } = options;

    connector.flow = flow;
    connector.style = { ...DefaultConnectorStyle(), ...get(style, {}) };
    connector.id = id;
    connector.floatingTip = floatingTip;
    connector.start = start;
    connector.end = end;
    connector.startNode = connector.start?.node;
    connector.endNode = connector.end?.node;

    if (start && end) {
      connector.floatingTip = null;

      start.connectors.push(connector);
      if (end.connectors.length > 0) {
        end.connectors[0].disconnect();
        end.connectors[0] = connector;
      } else {
        end.connectors.push(connector);
      }

      flow.executionGraph.connect(connector.startNode, connector.endNode);
      start.onConnect(connector);
      end.onConnect(connector);
    }

    return connector;
  }

  disconnect(): void {
    let [startTerm, endTerm] = [this.start, this.end];
    this.flow.removeConnector(this.id);
    this.start.connectors.splice(
      this.start.connectors.findIndex((cntr) => cntr.id === this.id),
      1
    );
    this.end.connectors.pop();
    this.flow.executionGraph.disconnect(startTerm.node, endTerm.node);
    this.start.onDisconnect(this, startTerm, endTerm);
    this.end.onDisconnect(this, startTerm, endTerm);
  }
  setData(data: any) {
    this._data = data;
    this.end && this.end.call("data", this.end, data);
  }
  canConnect(other: Terminal): boolean {
    let firstTerminal = !this.start ? this.end : this.start;
    let source, destination;
    if (firstTerminal.type === TerminalType.IN) {
      source = other;
      destination = firstTerminal;
    } else {
      source = firstTerminal;
      destination = other;
    }

    return canConnect(source, destination, this.flow.rules, this.flow.executionGraph);
  }

  render() {
    let context = this.flow.flowConnect.context;
    context.save();
    const scopeFlowConnect = this.flow.flowConnect.renderResolver.connector;
    const scopeFlow = this.flow.renderResolver.connector;
    const scopeConnector = this.renderer;
    const renderFn =
      (scopeConnector && scopeConnector(this)) ||
      (scopeFlow && scopeFlow(this)) ||
      (scopeFlowConnect && scopeFlowConnect(this)) ||
      this._render;
    renderFn(context, this.getRenderParams(), this);
    context.restore();

    let offContext = this.flow.flowConnect.offContext;
    offContext.save();
    this._offRender();
    offContext.restore();

    this.call("render", this);
  }
  private _render(context: CanvasRenderingContext2D, params: ConnectorRenderParams, connector: Connector) {
    let ax = params.start.x,
      ay = params.start.y,
      dx = params.end.x,
      dy = params.end.y;

    let offset = Vector.Distance(ax, ay, dx, dy);
    offset *= 0.2;

    let [bx, by] = [ax + offset, ay];
    let [cx, cy] = [dx - offset, dy];
    let [midx, midy] = [(bx + cx) / 2, (by + cy) / 2];

    if (connector.style.border) {
      context.strokeStyle = connector.style.borderColor;
      context.lineWidth = connector.style.width + 2;
      context.beginPath();
      context.moveTo(ax, ay);
      context.quadraticCurveTo(bx, by, midx, midy);
      context.moveTo(midx, midy);
      context.quadraticCurveTo(cx, cy, dx, dy);
      context.stroke();
    }

    context.strokeStyle = connector.style.color;
    context.lineWidth = connector.style.width;
    context.beginPath();
    context.moveTo(ax, ay);
    context.quadraticCurveTo(bx, by, midx, midy);
    context.moveTo(midx, midy);
    context.quadraticCurveTo(cx, cy, dx, dy);
    context.stroke();
  }
  private _offRender() {
    /**/
  }
  private getRenderParams(): ConnectorRenderParams {
    let start: SerializedVector, end: SerializedVector;
    if (this.start) {
      if (this.startNode.renderState.nodeState === NodeState.MAXIMIZED) start = this.start.position.serialize();
      else {
        start = this.startNode.position.serialize();
        start.x += this.startNode.width + this.startNode.style.terminalStripMargin + this.start.style.radius;
        start.y += this.startNode.style.titleHeight / 2;
      }
    } else start = this.floatingTip.serialize();
    if (this.end) {
      if (this.endNode.renderState.nodeState === NodeState.MAXIMIZED) end = this.end.position.serialize();
      else {
        end = this.endNode.position.serialize();
        end.x -= this.endNode.style.terminalStripMargin + this.end.style.radius;
        end.y += this.endNode.style.titleHeight / 2;
      }
    } else end = this.floatingTip.serialize();

    return { start, end };
  }

  serialize(): SerializedConnector {
    return {
      id: this.id,
      startId: this.start.id,
      endId: this.end.id,
      startNodeId: this.startNode.id,
      endNodeId: this.endNode.id,
      style: this.style,
    };
  }
}

export interface SerializedConnector {
  startNodeId: string;
  endNodeId: string;
  startId: string;
  endId: string;
  id: string;
  style: ConnectorStyle;
}

export interface ConnectorStyle {
  width?: number;
  color?: string;
  border?: boolean;
  borderColor?: string;
}
let DefaultConnectorStyle = (): ConnectorStyle => {
  return {
    width: 5,
    color: "#7fff00aa",
    border: true,
    borderColor: "grey",
  };
};

export interface ConnectorOptions {
  floatingTip?: Vector;
  style?: ConnectorStyle;
  id?: string;
}
let DefaultConnectorOptions = (): ConnectorOptions => {
  return {
    style: {},
    id: uuid(),
  };
};

export interface ConnectorRenderParams {
  start: SerializedVector;
  end: SerializedVector;
}
