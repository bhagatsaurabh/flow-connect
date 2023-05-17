import { Vector, SerializedVector } from "./vector.js";
import { uuid, canConnect, get, exists } from "../utils/utils.js";
import { Color, SerializedColor } from "./color.js";
import { Connector, ConnectorOptions, ConnectorStyle } from "./connector.js";
import { Hooks } from "./hooks.js";
import { Node } from "./node.js";
import { Events, Renderable, RenderResolver, Serializable } from "../common/interfaces.js";
import { Log } from "../utils/logger.js";
import { Constant } from "../resource/constants.js";

export class Terminal extends Hooks implements Events, Serializable<SerializedTerminal>, Renderable {
  /**
   * Terminals can hold any user-defined reference, using this variable to store a reference to something (and thereby binding it to this terminal) is helpful in special applications
   * for e.g audio connections - terminal can hold a reference to WebAudio Node which can be used to connect said AudioNodes when two terminals are connected,
   * almost all StandardNodes.Audio nodes uses this variable.
   * This can be ignored for other applications where such pattern is not useful or relevant.
   **/
  ref: any;
  connectors: Connector[];
  focus: boolean;
  position: Vector;
  hitColor: Color;
  style: TerminalStyle;
  id: string;
  private _propName: string;
  private watcherId: number;

  get propName(): string {
    return this._propName;
  }
  set propName(propName: string) {
    if (!propName || propName === "") {
      Log.error("Failed to set prop name '" + propName + "', prop name is invalid");
      return;
    }

    let oldPropName = this._propName;
    let newPropName = propName;
    if (exists(this.watcherId)) {
      this.node.unwatch(oldPropName, this.watcherId);
    }
    this._propName = newPropName;
    this.watcherId = this.node.watch(newPropName, (_oldVal: any, newVal: any) => {
      if (this.type === TerminalType.OUT) this.setData(newVal);
    });
  }

  renderResolver: RenderResolver<Terminal, TerminalRenderParams> = () => null;

  constructor(
    public node: Node,
    public type: TerminalType,
    public dataType: string,
    public name: string,
    public options = DefaultTerminalOptions()
  ) {
    super();
    this.hitColor = options.hitColor;
    if (options.propName) this.propName = options.propName;
    this.style = options.style ? { ...DefaultTerminalStyle(), ...options.style } : DefaultTerminalStyle();
    this.id = get(options.id, uuid());
    this.setHitColor(this.hitColor);
    this.connectors = [];
    this.position = Vector.Zero();
    this.focus = false;

    if (this.type === TerminalType.IN) {
      this.on("data", (_inst, data) => {
        if (this.propName) this.node.state[this.propName] = data;
      });
    }
  }

  getData(): any {
    if (this.type === TerminalType.OUT) {
      Log.error("Cannot call 'getData' on output terminal");
      return;
    }
    if (this.connectors.length > 0) return this.connectors[0].data;
    return null;
  }
  setData(data: any) {
    if (this.type === TerminalType.IN) {
      Log.error("Cannot call 'setData' on input terminal");
      return;
    }
    this.connectors.forEach((connector) => (connector.data = data));
  }
  private setHitColor(hitColor: Color) {
    if (!hitColor) {
      hitColor = Color.Random();
      while (this.node.terminals.get(hitColor.rgbaString) || this.node.uiNodes.get(hitColor.rgbaString))
        hitColor = Color.Random();
    }
    this.hitColor = hitColor;
    this.node.terminals.set(this.hitColor.rgbaString, this);
  }
  render() {
    let context = this.node.context;
    context.save();
    let nodeRenderResolver = this.node.renderResolver.terminal;
    let flowRenderResolver = this.node.flow.renderResolver.terminal;
    let flowConnectRenderResolver = this.node.flow.flowConnect.renderResolver.terminal;
    (
      (this.renderResolver && this.renderResolver(this)) ||
      (nodeRenderResolver && nodeRenderResolver(this)) ||
      (flowRenderResolver && flowRenderResolver(this)) ||
      (flowConnectRenderResolver && flowConnectRenderResolver(this)) ||
      this._render
    )(context, this.getRenderParams(), this);
    context.restore();

    this.offUIRender();

    this.call("render", this);
  }
  _render(context: CanvasRenderingContext2D, params: TerminalRenderParams, terminal: Terminal) {
    if (params.focus) {
      context.beginPath();
      context.arc(params.position.x, params.position.y, terminal.style.radius * 3, 0, Constant.TAU);
      context.fillStyle = terminal.style.outerFocusColor;
      context.fill();
    }

    if (terminal.dataType === "event") {
      context.beginPath();
      context.moveTo(params.position.x, params.position.y - terminal.style.radius * 1.3);
      context.lineTo(params.position.x + terminal.style.radius * 1.3, params.position.y);
      context.lineTo(params.position.x, params.position.y + terminal.style.radius * 1.3);
      context.lineTo(params.position.x - terminal.style.radius * 1.3, params.position.y);
      context.lineTo(params.position.x, params.position.y - terminal.style.radius * 1.3);
      context.closePath();
    } else {
      context.beginPath();
      context.arc(params.position.x, params.position.y, terminal.style.radius, 0, Constant.TAU);
    }
    context.fillStyle = params.focus
      ? terminal.style.focusColor
      : terminal.node.flow.terminalColors[terminal.dataType] || terminal.style.color;
    context.strokeStyle = terminal.style.borderColor;
    context.shadowBlur = terminal.style.shadowBlur;
    context.shadowColor = terminal.style.shadowColor;
    context.fill();
    context.stroke();
  }
  getRenderParams(): TerminalRenderParams {
    return {
      focus: this.focus,
      position: this.position.serialize(),
    };
  }
  connect(otherTerminal: Terminal, options?: ConnectorOptions): boolean {
    // Check if already connected
    if (this.type !== otherTerminal.type) {
      let start = this.type === TerminalType.OUT ? this : otherTerminal;
      let end = this.type === TerminalType.IN ? this : otherTerminal;
      if (end.connectors.length > 0 && start.connectors.includes(end.connectors[0])) return false;
    }

    let source, destination;
    if (this.type === TerminalType.IN) {
      source = otherTerminal;
      destination = this;
    } else {
      source = this;
      destination = otherTerminal;
    }

    // Check if these terminals can be connected
    if (canConnect(source, destination, this.node.flow.rules, this.node.flow.executionGraph)) {
      let connector = Connector.create(options).build(this.node.flow, source, destination);
      this.node.flow.connectors.set(connector.id, connector);

      return true;
    } else return false;
  }
  /**
   * Disconnects terminal to terminal connections.
   * If no parameters are passed and the terminal on which this method is called is an output terminal then,
   * all the connections going out from this terminal will be disconnected.
   *
   * @param connector optional connector Id or reference, used only when the terminal on which this method is called is an Output terminal
   * @returns
   */
  disconnect(connector?: string | Connector): boolean {
    if (this.type === TerminalType.IN) {
      this.connectors[0].disconnect();
      return true;
    } else {
      if (typeof connector === "string") {
        let cntr = this.connectors.find((currCntr) => currCntr.id === connector);
        if (!cntr) {
          Log.error("Connector not found while disconnecting", connector);
          return false;
        }
        cntr.disconnect();
      } else if (connector instanceof Connector) {
        if (!this.connectors.find((cntr) => cntr.id === connector.id)) {
          Log.error("Connector cannot be disconnected from the terminal because its not associated with it", connector);
          return false;
        }
        connector.disconnect();
      } else {
        this.connectors.forEach((cntr) => cntr.disconnect());
      }
      return true;
    }
  }
  private offUIRender() {
    let context = this.node.offUIContext;
    context.save();

    context.beginPath();
    context.arc(
      this.position.x,
      this.position.y,
      this.style.radius + this.node.style.terminalStripMargin,
      0,
      Constant.TAU
    );
    context.fillStyle = this.hitColor.rgbaCSSString;
    context.fill();

    context.restore();
  }
  isConnected(): boolean {
    return this.connectors.length > 0;
  }

  onEnter(screenPosition: Vector, realPosition: Vector): void {
    this.call("enter", this, screenPosition, realPosition);

    this.focus = true;
    this.node.flow.flowConnect.cursor = "pointer";
  }
  onExit(screenPosition: Vector, realPosition: Vector): void {
    this.call("exit", this, screenPosition, realPosition);

    this.focus = false;
    this.node.flow.flowConnect.cursor = "unset";
  }
  onDown(screenPosition: Vector, realPosition: Vector): void {
    if (this.connectors.length > 0) {
      if (this.type === TerminalType.IN) {
        const start = this.connectors[0].start;
        this.disconnect();
        this.node.flow.setFloatingConnector(realPosition, start, "left");
        this.node.currHitTerminal = null;
      } else {
        if (this.node.flow.floatingConnector) return;
        this.node.flow.setFloatingConnector(realPosition, this, "left");
      }
    } else {
      if (this.node.flow.floatingConnector) return;
      this.node.flow.setFloatingConnector(realPosition, this, this.type === TerminalType.IN ? "right" : "left");
    }

    this.call("down", this, screenPosition, realPosition);
  }
  onUp(screenPosition: Vector, realPosition: Vector): void {
    this.call("up", this, screenPosition, realPosition);
  }
  onDrag(screenPosition: Vector, realPosition: Vector): void {
    this.call("drag", this, screenPosition, realPosition);
  }
  onClick(screenPosition: Vector, realPosition: Vector): void {
    this.call("click", this, screenPosition, realPosition);
  }
  onOver(screenPosition: Vector, realPosition: Vector): void {
    this.call("over", this, screenPosition, realPosition);
  }
  onContextMenu(): void {
    this.call("rightclick", this);
  }
  onConnect(connector: Connector) {
    this.call("connect", this, connector);
  }
  onDisconnect(connector: Connector, startTerminal?: Terminal, endTerminal?: Terminal) {
    this.call("disconnect", this, connector, startTerminal, endTerminal);
  }

  onEvent(data: any): void {
    if (this.type === TerminalType.IN) {
      this.call("event", this, data);
    }
  }
  emit(data: any) {
    if (this.type === TerminalType.OUT && this.connectors.length !== 0) {
      this.connectors.forEach((connector) => {
        connector.end && connector.end.onEvent(data);
      });
      this.call("emit", this, data);
    }
  }

  serialize(): SerializedTerminal {
    return {
      name: this.name,
      type: this.type,
      dataType: this.dataType,
      propName: this.propName,
      id: this.id,
      style: this.style,
      hitColor: this.hitColor.serialize(),
    };
  }
  static deSerialize(node: Node, data: SerializedTerminal): Terminal {
    return new Terminal(node, data.type, data.dataType, data.name, {
      propName: data.propName,
      style: data.style,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor),
    });
  }
}

export enum TerminalType {
  IN = 1,
  OUT = 2,
}

export interface SerializedTerminal {
  name: string;
  dataType: string;
  type?: TerminalType;
  propName?: string;
  id?: string;
  hitColor?: SerializedColor;
  style?: TerminalStyle;
}

export interface TerminalStyle {
  radius?: number;
  color?: string;
  borderColor?: string;
  shadowColor?: string;
  shadowBlur?: number;
  focusColor?: string;
  outerFocusColor?: string;
}
let DefaultTerminalStyle = () => {
  return {
    radius: 4,
    color: "#888",
    borderColor: "#222",
    shadowBlur: 0,
    shadowColor: "#ccc",
    focusColor: "#00ff00",
    outerFocusColor: "#bbbbbb80",
  };
};

export interface TerminalRenderParams {
  focus: boolean;
  position: SerializedVector;
}

export interface TerminalOptions {
  propName?: string;
  style?: TerminalStyle;
  id?: string;
  hitColor?: Color;
}
const DefaultTerminalOptions = (): TerminalOptions => {
  return {
    style: {},
  };
};
