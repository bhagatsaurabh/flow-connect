import { Vector, SerializedVector } from "./vector.js";
import { get, getNewUUID } from "../utils/utils.js";
import { Flow, FlowState } from "./flow.js";
import { Terminal, TerminalType } from './terminal.js';
import { Renderable, RenderResolver, Serializable } from "../common/interfaces.js";
import { Node, NodeState } from "./node.js";
import { Hooks } from './hooks.js';

export class Connector extends Hooks implements Serializable<SerializedConnector>, Renderable {
  renderResolver: RenderResolver<Connector, ConnectorRenderParams> = () => null;

  start: Terminal;
  end: Terminal;
  startNode: Node;
  endNode: Node;
  style: ConnectorStyle;
  id: string;

  _data: any;
  floatingTip: Vector;

  get data(): any { return this._data; }
  set data(data: any) {
    this._data = data;
    this.end && this.end.call('data', this.end, data);
    if (this.flow.state !== FlowState.Stopped) {
      this.flow.executionGraph.setDirty(this.endNode);
    }
  }

  constructor(
    public flow: Flow,
    start: Terminal,
    end: Terminal,
    options: ConnectorOptions = DefaultConnectorOptions()
  ) {
    super();

    this.style = options.style ? { ...DefaultConnectorStyle(), ...options.style } : DefaultConnectorStyle();
    this.id = get(options.id, getNewUUID());
    this.floatingTip = options.floatingTip;

    this.start = start;
    this.end = end;
    if (this.start) this.startNode = this.start.node;
    if (this.end) this.endNode = this.end.node;
    if (start && end) {
      this.floatingTip = null;

      this.start.connectors.push(this);
      if (this.end.connectors.length > 0) {
        this.end.connectors[0].removeConnection();
        this.end.connectors[0] = this;
      } else this.end.connectors.push(this);

      if (!options.isDeserialization) this.flow.executionGraph.connect(this.startNode, this.endNode);
      this.start.onConnect(this);
      this.end.onConnect(this);
    }
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
    this.start.onConnect(this);
    this.end.onConnect(this);
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
    this.flow.removeConnector(this.id);
  }
  setData(data: any) {
    this._data = data;
    this.end && this.end.call('data', this.end, data);
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

    if (!destination) return false;
    if (source === destination) return false;
    if (source.node === destination.node) return false;
    if (source.type === destination.type) return false;
    if (!this.flow.rules[source.dataType].includes(destination.dataType)) return false;      // Directional !!
    if (!this.flow.executionGraph.canConnect(source.node, destination.node)) return false;
    return true;
  }

  render() {
    let context = this.flow.flowConnect.context;
    context.save();
    let flowRenderResolver = this.flow.renderResolver.connector;
    let flowConnectRenderResolver = this.flow.flowConnect.renderResolver.connector;
    ((this.renderResolver && this.renderResolver(this))
      || (flowRenderResolver && flowRenderResolver(this))
      || (flowConnectRenderResolver && flowConnectRenderResolver(this))
      || this._render
    )(context, this.getRenderParams(), this);
    context.restore();

    let offContext = this.flow.flowConnect.offContext;
    offContext.save();
    this._offRender();
    offContext.restore();

    this.call('render', this);
  }
  private _render(context: CanvasRenderingContext2D, params: ConnectorRenderParams, connector: Connector) {
    let ax = params.start.x, ay = params.start.y, dx = params.end.x, dy = params.end.y;

    let offset = Vector.Distance(ax, ay, dx, dy);
    offset *= .2;

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
  private _offRender() { /**/ }
  private getRenderParams(): ConnectorRenderParams {
    let start: SerializedVector, end: SerializedVector;
    if (this.start) {
      if (this.startNode.renderState.nodeState === NodeState.MAXIMIZED)
        start = this.start.position.serialize();
      else {
        start = this.startNode.position.serialize();
        start.x += this.startNode.width + this.startNode.style.terminalStripMargin + this.start.style.radius;
        start.y += this.startNode.style.titleHeight / 2;
      }
    } else
      start = this.floatingTip.serialize();
    if (this.end) {
      if (this.endNode.renderState.nodeState === NodeState.MAXIMIZED)
        end = this.end.position.serialize();
      else {
        end = this.endNode.position.serialize();
        end.x -= (this.endNode.style.terminalStripMargin + this.end.style.radius);
        end.y += this.endNode.style.titleHeight / 2;
      }
    } else
      end = this.floatingTip.serialize();

    return { start, end };
  }

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
    return new Connector(flow, start, end, {
      style: data.style,
      id: data.id,
      isDeserialization: true
    });
  }
}

export interface SerializedConnector {
  startNodeId: string,
  endNodeId: string,
  startId: string,
  endId: string,
  id: string,
  style: ConnectorStyle
}

export interface ConnectorStyle {
  width?: number,
  color?: string,
  border?: boolean,
  borderColor?: string
}
let DefaultConnectorStyle = (): ConnectorStyle => {
  return {
    width: 5,
    color: '#7fff00aa',
    border: true,
    borderColor: 'grey'
  };
};

export interface ConnectorOptions {
  floatingTip?: Vector,
  style?: ConnectorStyle,
  id?: string,
  isDeserialization?: boolean
}
let DefaultConnectorOptions = (): ConnectorOptions => {
  return {
    style: {},
    id: getNewUUID()
  };
}

export interface ConnectorRenderParams {
  start: SerializedVector,
  end: SerializedVector
}
