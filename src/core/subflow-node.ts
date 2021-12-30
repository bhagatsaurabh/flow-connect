import { Vector2 } from './vector';
import { Color } from './color';
import { Flow, FlowState } from './flow';
import { Node, NodeButton, NodeStyle, SerializedNode } from './node';
import { Terminal, TerminalType, TerminalStyle } from './terminal';
import { TunnelNode } from './tunnel-node';
import { Align } from '../common/enums';

export class SubFlowNode extends Node {
  subFlow: Flow;

  constructor(
    flow: Flow,
    subFlow: Flow,
    position: Vector2,
    width: number,
    inputs: any[],
    outputs: any[],
    options: SubFlowOptions = DefaultSubFlowOptions()
  ) {

    super(flow, options.name || 'New SubFlow', position, width, inputs ? inputs : [], outputs ? outputs : [], {
      style: options.style,
      terminalStyle: options.terminalStyle,
      props: options.props,
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

    this.addNodeButton(() => {
      this.flow.flowConnect.render(this.subFlow);
    }, (_nodeButton: NodeButton, pos: Vector2) => {
      let context = this.context;
      context.strokeStyle = this.style.expandButtonColor;

      context.beginPath();
      context.moveTo(pos.x, pos.y + this.style.nodeButtonSize / 2);
      context.lineTo(pos.x, pos.y + this.style.nodeButtonSize);
      context.lineTo(pos.x + this.style.nodeButtonSize, pos.y);
      context.lineTo(pos.x + this.style.nodeButtonSize, pos.y + this.style.nodeButtonSize / 2);
      context.moveTo(pos.x + this.style.nodeButtonSize, pos.y);
      context.lineTo(pos.x + this.style.nodeButtonSize / 2, pos.y);
      context.moveTo(pos.x, pos.y + this.style.nodeButtonSize);
      context.lineTo(pos.x + this.style.nodeButtonSize / 2, pos.y + this.style.nodeButtonSize);
      context.closePath();

      context.stroke();
    }, Align.Right);
  }

  /** @hidden */
  run() {
    if (this.flow.state === FlowState.Stopped) return;
    this.subFlow.start();
  }
  serialize(): SerializedNode {
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
      subFlow: this.subFlow.serialize()
    };
  }
  static deSerialize(flow: Flow, data: SerializedNode): SubFlowNode {
    let subFlow = Flow.deSerialize(flow.flowConnect, data.subFlow);
    return new SubFlowNode(flow, subFlow, Vector2.deSerialize(data.position), data.width, data.inputs, data.outputs, {
      name: data.name,
      style: data.style,
      terminalStyle: data.terminalStyle,
      props: data.props,
      id: data.id,
      hitColor: Color.deSerialize(data.hitColor)
    });
  }
}

export interface SubFlowOptions {
  name?: string,
  style?: NodeStyle,
  terminalStyle?: TerminalStyle,
  props?: Object,
  id?: string,
  hitColor?: Color
}
let DefaultSubFlowOptions = (): SubFlowOptions => {
  return {
    style: {},
    terminalStyle: {},
    props: {}
  }
}
