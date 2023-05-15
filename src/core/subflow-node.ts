import { Vector } from './vector.js';
import { Color } from './color.js';
import { Flow, FlowState } from './flow.js';
import { Node, NodeButton, NodeStyle, SerializedNode, NodeButtonRenderParams } from './node.js';
import { Terminal, TerminalType, TerminalStyle } from './terminal.js';
import { TunnelNode } from './tunnel-node.js';
import { Align } from '../common/enums.js';
import { Container, DataFetchProvider, DataPersistenceProvider } from '../flow-connect.js';

export class SubFlowNode extends Node {
  subFlow: Flow;

  constructor(
    flow: Flow,
    subFlow: Flow,
    position: Vector,
    width: number,
    inputs: any[],
    outputs: any[],
    options: SubFlowOptions = DefaultSubFlowOptions()
  ) {

    super(flow, options.name || 'New SubFlow', position, width, inputs ? inputs : [], outputs ? outputs : [], {
      style: options.style,
      terminalStyle: options.terminalStyle,
      state: options.state,
      id: options.id,
      hitColor: options.hitColor
    });

    this.subFlow = subFlow;

    this.subFlow.on('add-input', (_, tunnel: TunnelNode) => {
      let proxyTerminal = new Terminal(this, TerminalType.IN, tunnel.outputs[0].dataType, tunnel.outputs[0].name);
      tunnel.proxyTerminal = proxyTerminal;
      this.addTerminal(proxyTerminal);
    });
    this.subFlow.on('add-output', (_, tunnel: TunnelNode) => {
      let proxyTerminal = new Terminal(this, TerminalType.OUT, tunnel.inputs[0].dataType, tunnel.inputs[0].name);
      tunnel.proxyTerminal = proxyTerminal;
      this.addTerminal(proxyTerminal);
    });

    this.subFlow.inputs.forEach((inputNode, index) => inputNode.proxyTerminal = this.inputs[index]);
    this.subFlow.outputs.forEach((outputNode, index) => outputNode.proxyTerminal = this.outputs[index]);

    this.addNodeButton(
      () => this.flow.flowConnect.render(this.subFlow),
      (context: CanvasRenderingContext2D, params: NodeButtonRenderParams, nodeButton: NodeButton) => {
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
      }, Align.Right
    );
  }

  run() {
    if (this.flow.state === FlowState.Stopped) return;
    this.subFlow.start();
  }
  async serialize(persist?: DataPersistenceProvider): Promise<SerializedNode> {
    const ui = await this.ui.serialize(persist);
    const subFlow = await this.subFlow.serialize(persist);

    return Promise.resolve<SerializedNode>({
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
      subFlow
    });
  }
  static async deSerialize(flow: Flow, data: SerializedNode, receive?: DataFetchProvider): Promise<SubFlowNode> {
    let subFlow = await Flow.deSerialize(flow.flowConnect, data.subFlow, receive);
    const subFlowNode = new SubFlowNode(flow, subFlow, Vector.deSerialize(data.position), data.width, data.inputs, data.outputs, {
      name: data.name,
      style: data.style,
      terminalStyle: data.terminalStyle,
      state: data.state,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    })

    const ui = await Container.deSerialize(subFlowNode, data.ui, receive);
    subFlowNode.ui = ui;
    subFlowNode.ui.update();

    return Promise.resolve<SubFlowNode>(subFlowNode);
  }
}

export interface SubFlowOptions {
  name?: string,
  style?: NodeStyle,
  terminalStyle?: TerminalStyle,
  state?: Object,
  id?: string,
  hitColor?: Color
}
let DefaultSubFlowOptions = (): SubFlowOptions => {
  return {
    style: {},
    terminalStyle: {},
    state: {}
  }
}
