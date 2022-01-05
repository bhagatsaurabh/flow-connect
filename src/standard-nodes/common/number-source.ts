import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";
import { InputType, Input, Toggle } from "../../ui/index";

export class NumberSource extends Node {
  fractionalToggle: Toggle;
  input: Input;

  static DefaultState = { fractional: false, value: 0 };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Number Source', options.position || new Vector2(50, 50), options.width || 160, [],
      [{ name: 'value', dataType: 'number' }],
      {
        state: options.state ? { ...NumberSource.DefaultState, ...options.state } : NumberSource.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.fractionalToggle.on('change', (_inst, _oldVal, newVal) => {
      this.input.style.step = newVal ? 'any' : '';
      if (!newVal) this.state.value = Math.floor(this.state.value);
      this.process();
    });
    this.input.on('change', () => {
      if (!this.state.fractional) this.state.value = Math.floor(this.state.value);
      this.process();
    });
    this.outputs[0].on('connect', () => this.process());
    this.on('process', () => this.process());
  }

  process() { this.setOutputs(0, this.state.fractional ? this.state.value : Math.floor(this.state.value)); }
  setupUI() {
    this.fractionalToggle = this.createToggle({ propName: 'fractional', input: true, output: true, height: 10, style: { grow: .3 } });
    this.input = this.createInput({
      value: 0, propName: 'value', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .6, step: this.state.fractional ? 'any' : '' }
    })
    this.ui.append([
      this.createHozLayout([this.createLabel('Fractional ?', { style: { grow: .5 } }), this.fractionalToggle], { style: { spacing: 20 } }),
      this.createHozLayout([this.createLabel('Value', { style: { grow: .4 } }), this.input], { style: { spacing: 20 } }),
    ]);
  }
}
