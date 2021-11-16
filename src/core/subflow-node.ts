import { Align, FlowState, TerminalType } from '../math/constants';
import { Vector2 } from '../math/vector';
import { Color } from './color';
import { Flow } from './flow';
import { NodeStyle, SerializedNode, TerminalStyle } from './interfaces';
import { Node, NodeButton } from './node';
import { Terminal } from './terminal';
import { TunnelNode } from './tunnel-node';

export class SubFlowNode extends Node {

  constructor(
    flow: Flow,
    name: string,
    position: Vector2,
    width: number,
    style: NodeStyle = {}, terminalStyle: TerminalStyle = {},
    props: Object = {},
    inputs: any[], outputs: any[],
    public subFlow: Flow,
    id?: string,
    hitColor?: Color
  ) {

    super(flow, name, position, width, inputs ? inputs : [], outputs ? outputs : [], style, terminalStyle, props, id, hitColor);

    this.subFlow.on('add-input', (subFlow, tunnel: TunnelNode) => {
      let proxyTerminal = new Terminal(this, TerminalType.IN, tunnel.outputs[0].dataType, tunnel.outputs[0].name);
      tunnel.proxyTerminal = proxyTerminal;
      this.addTerminal(proxyTerminal);
    });
    this.subFlow.on('add-output', (subFlow, tunnel: TunnelNode) => {
      let proxyTerminal = new Terminal(this, TerminalType.OUT, tunnel.inputs[0].dataType, tunnel.inputs[0].name);
      tunnel.proxyTerminal = proxyTerminal;
      this.addTerminal(proxyTerminal);
    });

    this.subFlow.inputs.forEach((inputNode, index) => inputNode.proxyTerminal = this.inputs[index]);
    this.subFlow.outputs.forEach((outputNode, index) => outputNode.proxyTerminal = this.outputs[index]);

    this.addNodeButton(() => {
      this.flow.flowConnect.render(this.subFlow);
    }, (nodeButton: NodeButton, position: Vector2) => {
      let context = this.context;
      context.strokeStyle = this.style.expandButtonColor;

      context.beginPath();
      context.moveTo(position.x, position.y + this.style.nodeButtonSize / 2);
      context.lineTo(position.x, position.y + this.style.nodeButtonSize);
      context.lineTo(position.x + this.style.nodeButtonSize, position.y);
      context.lineTo(position.x + this.style.nodeButtonSize, position.y + this.style.nodeButtonSize / 2);
      context.moveTo(position.x + this.style.nodeButtonSize, position.y);
      context.lineTo(position.x + this.style.nodeButtonSize / 2, position.y);
      context.moveTo(position.x, position.y + this.style.nodeButtonSize);
      context.lineTo(position.x + this.style.nodeButtonSize / 2, position.y + this.style.nodeButtonSize);
      context.closePath();

      context.stroke();
    }, Align.Right);
  }

  /** @hidden */
  run() {
    if (this.flow.state === FlowState.Stopped) return;

    this.call('process', this);
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
    return new SubFlowNode(flow, data.name, Vector2.deSerialize(data.position), data.width, data.style, data.terminalStyle, data.props, data.inputs, data.outputs, subFlow, data.id, Color.deSerialize(data.hitColor));
  }
}
