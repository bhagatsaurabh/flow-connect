import { Flow, SerializedFlow } from "./flow.js";
import { Node, NodeButton, SerializedNode, NodeButtonRenderParams, NodeOptions } from "./node.js";
import { Terminal, TerminalType } from "./terminal.js";
import { TunnelNode } from "./tunnel-node.js";
import { Align } from "../common/enums.js";
import { DataPersistenceProvider } from "../flow-connect.js";

export class SubFlowNode extends Node {
  subFlow?: Flow;

  constructor(flow: Flow, options: SubFlowNodeOptions) {
    super();

    this.subFlow = options.subFlow;
    if (this.subFlow) {
      this.subFlow.parentFlow = flow;
    }
  }

  setupIO(): void {
    if (!this.subFlow) {
      return;
    }
    this.subFlow.inputs.forEach((tunnelNode) => {
      const { name, dataType } = tunnelNode.outputs[0];
      this.addTerminal({ type: TerminalType.IN, name, dataType });
    });

    this.subFlow.outputs.forEach((tunnelNode) => {
      const { name, dataType } = tunnelNode.inputs[0];
      this.addTerminal({ type: TerminalType.OUT, name, dataType });
    });
  }

  created(): void {
    if (!this.subFlow) {
      return;
    }
    this.subFlow.on("add-input", (_, tunnel: TunnelNode) => {
      if (!tunnel.outputs[0].dataType || !tunnel.outputs[0].name) {
        return;
      }
      let proxyTerminal = Terminal.create(this, TerminalType.IN, tunnel.outputs[0].dataType, {
        name: tunnel.outputs[0].name,
      });
      tunnel.proxyTerminal = proxyTerminal;
      this.addTerminal(proxyTerminal);
    });
    this.subFlow.on("add-output", (_, tunnel: TunnelNode) => {
      if (!tunnel.inputs[0].dataType || !tunnel.inputs[0].name) {
        return;
      }
      let proxyTerminal = Terminal.create(this, TerminalType.OUT, tunnel.inputs[0].dataType, {
        name: tunnel.inputs[0].name,
      });
      tunnel.proxyTerminal = proxyTerminal;
      this.addTerminal(proxyTerminal);
    });

    this.subFlow.inputs.forEach((inputNode, idx) => (inputNode.proxyTerminal = this.inputs[idx]));
    this.subFlow.outputs.forEach((outputNode, idx) => (outputNode.proxyTerminal = this.outputs[idx]));

    this.addNodeButton(
      () => {
        if (this.subFlow) {
          this.flow?.flowConnect.render(this.subFlow);
        }
      },
      SubFlowNode.renderOpenButton,
      Align.Right,
    );
  }

  process(): void {
    this.subFlow?.start();
  }

  private static renderOpenButton(
    context: CanvasRenderingContext2D,
    params: NodeButtonRenderParams | undefined,
    nodeButton: NodeButton,
  ): void {
    if (!params) {
      return;
    }
    let style = nodeButton.node.style;

    const size = style?.nodeButtonSize ?? 0;
    context.strokeStyle = style?.expandButtonColor ?? "";
    context.beginPath();
    context.moveTo(params.position.x, params.position.y + size / 2);
    context.lineTo(params.position.x, params.position.y + size);
    context.lineTo(params.position.x + size, params.position.y);
    context.lineTo(params.position.x + size, params.position.y + size / 2);
    context.moveTo(params.position.x + size, params.position.y);
    context.lineTo(params.position.x + size / 2, params.position.y);
    context.moveTo(params.position.x, params.position.y + size);
    context.lineTo(params.position.x + size / 2, params.position.y + size);
    context.closePath();

    context.stroke();
  }

  async serialize(persist?: DataPersistenceProvider): Promise<SerializedSubFlowNode> {
    const serializedNode: SerializedNode = await super.serialize(persist);
    const subFlow = await this.subFlow?.serialize(persist);

    return { ...serializedNode, subFlow };
  }
}

export interface SubFlowNodeOptions extends NodeOptions {
  subFlow?: Flow;
}

export interface SerializedSubFlowNode extends SerializedNode {
  subFlow?: SerializedFlow;
}
