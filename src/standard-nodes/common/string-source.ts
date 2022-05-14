import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { Node } from "../../core/node.js";
import { InputType, Input } from "../../ui/index.js";

export class StringSource extends Node {
  input: Input;

  static DefaultState = { value: '' };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'String Source', options.position || new Vector(50, 50), options.width || 160, [],
      [{ name: 'value', dataType: 'string' }],
      {
        state: options.state ? { ...StringSource.DefaultState, ...options.state } : StringSource.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.input.on('change', () => this.process());
    this.on('process', () => this.process());
  }

  process = () => this.setOutputs(0, this.state.value);
  setupUI() {
    this.input = this.createInput({ value: '', propName: 'value', input: true, output: true, height: 20, style: { type: InputType.Text, grow: .7 } })
    this.ui.append(this.createHozLayout([
      this.createLabel('Value', { style: { grow: .3 } }), this.input
    ], { style: { spacing: 10 } }));
  }
}
