import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType, Input } from "../../ui/input";
import { Node } from "../../core/node";

export class Buffer extends Node {
  sizeInput: Input;

  static DefaultProps: any = { buffer: [], size: 10 };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Buffer', options.position || new Vector2(50, 50), options.width || 150,
      [{ name: 'data', dataType: 'any' }],
      [{ name: 'buffer', dataType: 'array' }],
      {
        props: options.props ? { ...Buffer.DefaultProps, ...options.props } : Buffer.DefaultProps,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.sizeInput.on('change', () => this.process(this.getInputs()));
    this.on('process', (_, inputs) => this.process(inputs));
  }

  process(inputs: any[]) {
    if (inputs[0] === null || typeof inputs[0] === 'undefined') return;
    if (this.props.size <= 0) this.props.size = 1;
    if (this.props.buffer.length === this.props.size) {
      this.props.buffer.shift();
    } else if (this.props.buffer.length > this.props.size) {
      this.props.buffer.splice(0, this.props.buffer.length - this.props.size + 1);
    }
    this.props.buffer.push(inputs[0]);
    this.setOutputs('buffer', this.props.buffer);
  }
  setupUI() {
    this.sizeInput = this.createInput({ propName: 'size', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .7 } });
    this.ui.append(this.createHozLayout([
      this.createLabel('Size', { style: { grow: .3 } }),
      this.sizeInput
    ], { style: { spacing: 20 } }));
  }
}
