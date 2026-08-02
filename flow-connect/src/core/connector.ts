import { Vector, SerializedVector } from "./vector.js";
import { canConnect, uuid } from "../utils/utils.js";
import { Flow, FlowState } from "./flow.js";
import { Terminal, TerminalType } from "./terminal.js";
import { Renderable, Renderer, Serializable } from "../common/interfaces.js";
import { Node, NodeUIState } from "./node.js";
import { Hooks } from "./hooks.js";

export class Connector extends Hooks implements Serializable<SerializedConnector>, Renderable {
  renderer: Renderer<Connector, ConnectorRenderParams> = () => () => undefined;

  flow?: Flow;
  id?: string;
  start?: Terminal;
  end?: Terminal;
  startNode?: Node;
  endNode?: Node;
  style?: ConnectorStyle;

  _data: any;
  floatingTip?: Vector;

  get data(): any {
    return this._data;
  }
  set data(data: any) {
    this.setData(data);

    if (this.flow?.state !== FlowState.Stopped && this.endNode) {
      this.flow?.executionGraph.setDirty(this.endNode);
    }
  }

  private constructor() {
    super();
  }

  static create(
    flow: Flow,
    start: Terminal,
    end: Terminal,
    options: ConnectorOptions = DefaultConnectorOptions(),
  ): Connector {
    const connector = new Connector();

    const { style = {}, id = uuid(), floatingTip } = options;

    connector.flow = flow;
    connector.style = {
      ...DefaultConnectorStyle(),
      ...(flow.flowConnect.getDefaultStyle("connector") || {}),
      ...style,
    };
    connector.id = id;
    connector.floatingTip = floatingTip;
    connector.start = start;
    connector.end = end;
    connector.startNode = connector.start?.node;
    connector.endNode = connector.end?.node;

    if (start && end) {
      connector.floatingTip = undefined;

      start.connectors.push(connector);
      if (end.connectors.length > 0) {
        end.connectors[0].disconnect();
        end.connectors[0] = connector;
      } else {
        end.connectors.push(connector);
      }

      if (connector.startNode && connector.endNode) {
        flow.executionGraph.connect(connector.startNode, connector.endNode);
      }
      start.onConnect(connector);
      end.onConnect(connector);
    }

    return connector;
  }

  disconnect(): void {
    let [startTerm, endTerm] = [this.start, this.end];
    if (this.id) {
      this.flow?.removeConnector(this.id);
    }
    this.start?.connectors.splice(
      this.start.connectors.findIndex((cntr) => cntr.id === this.id),
      1,
    );
    this.end?.connectors.pop();
    if (startTerm?.node && endTerm?.node) {
      this.flow?.executionGraph.disconnect(startTerm.node, endTerm.node);
    }
    this.start?.onDisconnect(this, startTerm, endTerm);
    this.end?.onDisconnect(this, startTerm, endTerm);
  }
  setData(data: any) {
    this._data = data;
    this.end && this.end.call("data", this.end, data);
  }
  canConnect(other: Terminal): boolean {
    let firstTerminal = !this.start ? this.end : this.start;
    let source, destination;
    if (firstTerminal?.type === TerminalType.IN) {
      source = other;
      destination = firstTerminal;
    } else {
      source = firstTerminal;
      destination = other;
    }

    if (this.flow?.rules && source) {
      return canConnect(source, destination, this.flow.rules, this.flow.executionGraph);
    }
    return false;
  }

  render() {
    let context = this.flow?.flowConnect.context;
    context?.save();
    const scopeFlowConnect = this.flow?.flowConnect.getRegisteredRenderer("connector");
    const scopeFlow = this.flow?.renderers.connector;
    const scopeConnector = this.renderer;
    const renderFn =
      (scopeConnector && scopeConnector(this)) ||
      (scopeFlow && scopeFlow(this)) ||
      (scopeFlowConnect && scopeFlowConnect(this)) ||
      this._render;

    if (context) {
      renderFn(context, this.getRenderParams(), this);
    }
    context?.restore();

    let offContext = this.flow?.flowConnect.offContext;
    offContext?.save();
    this._offRender();
    offContext?.restore();

    this.call("render", this);
  }
  private _render(context: CanvasRenderingContext2D, params: ConnectorRenderParams, connector: Connector) {
    if (!params.start || !params.end) {
      return;
    }

    let ax = params.start.x,
      ay = params.start.y,
      dx = params.end.x,
      dy = params.end.y;

    let offset = Vector.Distance(ax, ay, dx, dy);
    offset *= 0.2;

    let [bx, by] = [ax + offset, ay];
    let [cx, cy] = [dx - offset, dy];
    let [midx, midy] = [(bx + cx) / 2, (by + cy) / 2];

    if (connector.style?.border) {
      if (connector.style.borderColor) {
        context.strokeStyle = connector.style.borderColor;
      }
      if (typeof connector.style.width === "number") {
        context.lineWidth = connector.style.width + 2;
      }
      context.beginPath();
      context.moveTo(ax, ay);
      context.quadraticCurveTo(bx, by, midx, midy);
      context.moveTo(midx, midy);
      context.quadraticCurveTo(cx, cy, dx, dy);
      context.stroke();
    }

    if (connector.style?.color) {
      context.strokeStyle = connector.style.color;
    }
    if (typeof connector.style?.width === "number") {
      context.lineWidth = connector.style.width;
    }
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
  private getRenderParams(): ConnectorRenderParams | undefined {
    if (!this.startNode?.position || !this.endNode?.position) {
      return;
    }
    let start: SerializedVector | undefined, end: SerializedVector | undefined;
    if (this.start) {
      if (this.startNode.renderState.nodeState === NodeUIState.MAXIMIZED) start = this.start.position.serialize();
      else {
        start = this.startNode.position.serialize();
        start.x +=
          (this.startNode.width ?? 0) +
          (this.startNode.style?.terminalStripMargin ?? 0) +
          (this.start.style?.radius ?? 0);
        start.y += (this.startNode.style?.titleHeight ?? 0) / 2;
      }
    } else {
      start = this.floatingTip?.serialize();
    }
    if (this.end) {
      if (this.endNode.renderState.nodeState === NodeUIState.MAXIMIZED) end = this.end.position.serialize();
      else {
        end = this.endNode.position.serialize();
        end.x -= (this.endNode.style?.terminalStripMargin ?? 0) + (this.end.style?.radius ?? 0);
        end.y += (this.endNode.style?.titleHeight ?? 0) / 2;
      }
    } else end = this.floatingTip?.serialize();

    return { start, end };
  }

  serialize(): SerializedConnector {
    return {
      id: this.id,
      startId: this.start?.ui ? this.startNode?.outputsUI.findIndex((term) => this.start === term) : this.start?.id,
      endId: this.end?.ui ? this.endNode?.inputsUI.findIndex((term) => this.end === term) : this.end?.id,
      startNodeId: this.startNode?.id,
      endNodeId: this.endNode?.id,
      style: this.style,
    };
  }
}

export interface SerializedConnector {
  startNodeId?: string;
  endNodeId?: string;
  startId?: string | number;
  endId?: string | number;
  id?: string;
  style?: ConnectorStyle;
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
  start?: SerializedVector;
  end?: SerializedVector;
}
