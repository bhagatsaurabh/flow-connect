import { Vector } from "./vector.js";
import { Color } from "./color.js";
import { Flow } from "./flow.js";
import { Node, NodeStyle, SerializedNode } from "./node.js";
import { Terminal, TerminalStyle } from "./terminal.js";
import { Container, DataFetchProvider, DataPersistenceProvider } from "../flow-connect.js";

export class TunnelNode extends Node {
  private _proxyTerminal: Terminal;

  get proxyTerminal(): Terminal { return this._proxyTerminal; }
  set proxyTerminal(terminal: Terminal) {
    this._proxyTerminal = terminal;
    this._proxyTerminal.on('data', (_, data) => this.outputs[0].setData(data));
  }

  constructor(
    flow: Flow,
    name: string,
    position: Vector,
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

    this.on('process', () => {
      this.outputs[0].setData(this.proxyTerminal.getData());
    });
  }

  async serialize(persist?: DataPersistenceProvider): Promise<SerializedTunnelNode> {
    const ui = await this.ui.serialize(persist);

    return Promise.resolve<SerializedTunnelNode>({
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
      ui,
      proxyTerminalId: this.proxyTerminal.id
    });
  }
  static async deSerialize(flow: Flow, data: SerializedTunnelNode, receive?: DataFetchProvider): Promise<TunnelNode> {
    const tunnelNode = new TunnelNode(flow, data.name, Vector.deSerialize(data.position), data.width, data.inputs, data.outputs, {
      style: data.style,
      terminalStyle: data.terminalStyle,
      state: data.state,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    });

    const ui = await Container.deSerialize(tunnelNode, data.ui, receive);
    tunnelNode.ui = ui;
    tunnelNode.ui.update();

    return Promise.resolve<TunnelNode>(tunnelNode);
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
let DefaultTunnelNodeOptions = (): TunnelNodeOptions => {
  return {
    style: {},
    terminalStyle: {},
    state: {}
  }
}
