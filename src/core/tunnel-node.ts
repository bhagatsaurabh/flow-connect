import { DataPersistenceProvider, Flow } from "../flow-connect.js";
import { Node, NodeOptions, SerializedNode } from "./node.js";
import { Terminal, TerminalType } from "./terminal.js";

export class TunnelNode extends Node {
  private tunnelType: "input" | "output";
  private _proxyTerminal: Terminal;

  get proxyTerminal(): Terminal {
    return this._proxyTerminal;
  }
  set proxyTerminal(terminal: Terminal) {
    this._proxyTerminal = terminal;
    this._proxyTerminal.on("data", (_, data) => this.outputs[0].setData(data));
  }

  constructor(_flow: Flow, options: TunnelNodeOptions) {
    super();

    this.tunnelType = options.tunnelType;
  }

  setupIO(options: TunnelNodeOptions): void {
    this.addTerminal({
      type: options.tunnelType === "input" ? TerminalType.OUT : TerminalType.IN,
      name: options.tunnelName,
      dataType: options.tunnelDataType,
    });
  }

  created(): void {
    if (this.tunnelType === "input") {
      this.outputs[0].on("connect", (_, connector) => {
        if (this.proxyTerminal.connectors.length > 0) {
          connector.data = this.proxyTerminal.connectors[0].data;
        }
      });
    } else {
      this.inputs[0].on("data", (_, data) => this.proxyTerminal.setData(data));
    }
  }

  process(): void {
    this.outputs[0].setData(this.proxyTerminal.getData());
  }

  async serialize(persist?: DataPersistenceProvider): Promise<SerializedTunnelNode> {
    const serializedNode = await super.serialize(persist);

    return { ...serializedNode, tunnelType: this.tunnelType };
  }
}

export interface SerializedTunnelNode extends SerializedNode {
  tunnelType: "input" | "output";
}

export interface TunnelNodeOptions extends NodeOptions {
  tunnelType: "input" | "output";
  tunnelName?: string;
  tunnelDataType?: string;
}
