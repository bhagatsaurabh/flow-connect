import { Flow, SerializedFlow } from "./flow.js";
import { Node, NodeButton, SerializedNode, NodeButtonRenderParams, NodeOptions } from "./node.js";
import { Terminal, TerminalType } from "./terminal.js";
import { TunnelNode } from "./tunnel-node.js";
import { Align } from "../common/enums.js";
import { DataPersistenceProvider } from "../flow-connect.js";

export class SubFlowNode extends Node {
  subFlow: Flow;

  constructor(flow: Flow, options: SubFlowNodeOptions) {
    super();

    this.subFlow = options.subFlow;
    this.subFlow.parentFlow = flow;
  }

  setupIO(): void {
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
    this.subFlow.on("add-input", (_, tunnel: TunnelNode) => {
      let proxyTerminal = Terminal.create(tunnel.outputs[0].name, TerminalType.IN, tunnel.outputs[0].dataType).build(
        this
      );
      tunnel.proxyTerminal = proxyTerminal;
      this.addTerminal(proxyTerminal);
    });
    this.subFlow.on("add-output", (_, tunnel: TunnelNode) => {
      let proxyTerminal = Terminal.create(tunnel.inputs[0].name, TerminalType.OUT, tunnel.inputs[0].dataType).build(
        this
      );
      tunnel.proxyTerminal = proxyTerminal;
      this.addTerminal(proxyTerminal);
    });

    this.subFlow.inputs.forEach((inputNode, idx) => (inputNode.proxyTerminal = this.inputs[idx]));
    this.subFlow.outputs.forEach((outputNode, idx) => (outputNode.proxyTerminal = this.outputs[idx]));

    this.addNodeButton(() => this.flow.flowConnect.render(this.subFlow), SubFlowNode.renderOpenButton, Align.Right);
  }

  process(): void {
    this.subFlow.start();
  }

  private static renderOpenButton(
    context: CanvasRenderingContext2D,
    params: NodeButtonRenderParams,
    nodeButton: NodeButton
  ): void {
    let style = nodeButton.node.style;

    context.strokeStyle = style.expandButtonColor;
    context.beginPath();
    context.moveTo(params.position.x, params.position.y + style.nodeButtonSize / 2);
    context.lineTo(params.position.x, params.position.y + style.nodeButtonSize);
    context.lineTo(params.position.x + style.nodeButtonSize, params.position.y);
    context.lineTo(params.position.x + style.nodeButtonSize, params.position.y + style.nodeButtonSize / 2);
    context.moveTo(params.position.x + style.nodeButtonSize, params.position.y);
    context.lineTo(params.position.x + style.nodeButtonSize / 2, params.position.y);
    context.moveTo(params.position.x, params.position.y + style.nodeButtonSize);
    context.lineTo(params.position.x + style.nodeButtonSize / 2, params.position.y + style.nodeButtonSize);
    context.closePath();

    context.stroke();
  }

  async serialize(persist?: DataPersistenceProvider): Promise<SerializedSubFlowNode> {
    const serializedNode: SerializedNode = await super.serialize(persist);
    const subFlow = await this.subFlow.serialize(persist);

    return { ...serializedNode, subFlow };
  }
}

export interface SubFlowNodeOptions extends NodeOptions {
  subFlow: Flow;
}

interface SerializedSubFlowNode extends SerializedNode {
  subFlow: SerializedFlow;
}
