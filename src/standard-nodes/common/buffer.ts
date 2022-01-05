import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";
import { InputType, Input } from "../../ui/index";

export class Buffer extends Node {
  sizeInput: Input;

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Buffer', options.position || new Vector2(50, 50), options.width || 150,
      [{ name: 'data', dataType: 'any' }],
      [{ name: 'buffer', dataType: 'array' }],
      {
        state: options.state ? { buffer: [], size: 10, ...options.state } : { buffer: [], size: 10 },
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
    if (this.state.size <= 0) this.state.size = 1;
    if (this.state.buffer.length === this.state.size) {
      this.state.buffer.shift();
    } else if (this.state.buffer.length > this.state.size) {
      this.state.buffer.splice(0, this.state.buffer.length - this.state.size + 1);
    }
    this.state.buffer.push(inputs[0]);
    this.setOutputs('buffer', this.state.buffer);
  }
  setupUI() {
    this.sizeInput = this.createInput({ propName: 'size', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .7 } });
    this.ui.append(this.createHozLayout([
      this.createLabel('Size', { style: { grow: .3 } }),
      this.sizeInput
    ], { style: { spacing: 20 } }));
  }
}
