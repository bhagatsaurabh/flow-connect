import { Vector2 } from "./vector";
import { Color } from "./color";
import { Flow } from "./flow";
import { Node, NodeStyle, SerializedNode } from "./node";
import { Terminal, TerminalStyle } from "./terminal";

export class TunnelNode extends Node {
  private _proxyTerminal: Terminal;
  /** @hidden */
  get proxyTerminal(): Terminal { return this._proxyTerminal; }
  /** @hidden */
  set proxyTerminal(terminal: Terminal) {
    this._proxyTerminal = terminal;
    this._proxyTerminal.on('data', (_, data) => this.outputs[0].setData(data));
  }

  constructor(
    flow: Flow,
    name: string,
    position: Vector2,
    width: number,
    inputs: any[],
    outputs: any[],
    options: TunnelNodeOptions = DefaultTunnelNodeOptions()
  ) {

    super(flow, name, position, width, inputs, outputs, {
      style: options.style,
      terminalStyle: options.terminalStyle,
      state: options.state,
      id: options.id,
      hitColor: options.hitColor
    });

    if (this.inputs.length > 0) {
      this.inputs[0].on('data', (_, data) => this.proxyTerminal.setData(data));
    } else {
      this.outputs[0].on('connect', (_, connector) => {
        if (this.proxyTerminal.connectors.length > 0) {
          connector.data = this.proxyTerminal.connectors[0].data;
        }
      });
    }
  }

  serialize(): SerializedTunnelNode {
    return {
      id: this.id,
      name: this.name,
      position: this.position.serialize(),
      width: this.width,
      state: this.state,
      inputs: this.inputs.map(terminal => terminal.serialize()),
      outputs: this.outputs.map(terminal => terminal.serialize()),
      style: this.style,
      terminalStyle: this.terminalStyle,
      hitColor: this.hitColor.serialize(),
      zIndex: this.zIndex,
      focused: this.focused,
      renderState: this.renderState,
      ui: this.ui.serialize(),
      proxyTerminalId: this.proxyTerminal.id
    }
  }
  static deSerialize(flow: Flow, data: SerializedTunnelNode): TunnelNode {
    return new TunnelNode(flow, data.name, Vector2.deSerialize(data.position), data.width, data.inputs, data.outputs, {
      style: data.style,
      terminalStyle: data.terminalStyle,
      state: data.state,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    });
  }
}

export interface SerializedTunnelNode extends SerializedNode {
  proxyTerminalId: string
}

export interface TunnelNodeOptions {
  style?: NodeStyle,
  terminalStyle?: TerminalStyle,
  state?: Object,
  id?: string,
  hitColor?: Color,
}
/** @hidden */
let DefaultTunnelNodeOptions = (): TunnelNodeOptions => {
  return {
    style: {},
    terminalStyle: {},
    state: {}
  }
}
