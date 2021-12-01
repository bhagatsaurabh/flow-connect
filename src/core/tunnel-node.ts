import { Vector2 } from "../math/vector";
import { Color } from "./color";
import { Flow } from "./flow";
import { NodeStyle, SerializedTunnelNode, TerminalStyle } from "./interfaces";
import { Node } from "./node";
import { Terminal } from "./terminal";

export class TunnelNode extends Node {
  private _proxyTerminal: Terminal;
  /** @hidden */
  get proxyTerminal(): Terminal { return this._proxyTerminal; }
  /** @hidden */
  set proxyTerminal(terminal: Terminal) {
    this._proxyTerminal = terminal;
    this._proxyTerminal.on('data', (_, data) => {
      (this.outputs[0] as any)['setData'](data);
    });
  }

  constructor(
    flow: Flow,
    name: string,
    position: Vector2,
    width: number,
    inputs: any[], outputs: any[],
    style: NodeStyle, terminalStyle: TerminalStyle,
    props: Object,
    id?: string,
    hitColor?: Color,
  ) {

    super(flow, name, position, width, inputs, outputs, style, terminalStyle, props, id, hitColor);

    if (this.inputs.length > 0) {
      this.inputs[0].on('data', (_, data) => {
        (this.proxyTerminal as any)['setData'](data);
      });
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
      props: this.props,
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
    return new TunnelNode(flow, data.name, Vector2.deSerialize(data.position), data.width, data.inputs, data.outputs, data.style, data.terminalStyle, data.props, data.id, Color.deSerialize(data.hitColor));
  }
}
