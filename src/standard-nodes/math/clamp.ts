import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp } from "../../utils/utils";
import { Node } from "../../core/node";
import { InputType, Input } from "../../ui/index";

export class Clamp extends Node {
  minInput: Input;
  maxInput: Input;

  static DefaultState = { min: 0, max: 100 };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Clamp', options.position || new Vector2(50, 50), options.width || 150,
      [{ name: 'x', dataType: 'any' }],
      [{ name: '[x]', dataType: 'any' }],
      {
        state: options.state ? { ...Clamp.DefaultState, ...options.state } : Clamp.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.minInput.on('change', () => this.process(this.getInputs()[0]));
    this.maxInput.on('change', () => this.process(this.getInputs()[0]));
    this.on('process', (_, inputs) => this.process(inputs[0]));
  }

  setupUI() {
    this.minInput = this.createInput({ propName: 'min', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .7 } });
    this.maxInput = this.createInput({ propName: 'max', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .7 } });
    this.ui.append([
      this.createHozLayout([
        this.createLabel('Min', { style: { grow: .3 } }),
        this.minInput
      ], { style: { spacing: 10 } }),
      this.createHozLayout([
        this.createLabel('Max', { style: { grow: .3 } }),
        this.maxInput
      ], { style: { spacing: 10 } })
    ]);
  }
  process(input: number | []) {
    if (typeof input === 'number') {
      this.setOutputs(0, clamp(input, this.state.min, this.state.max));
    } else if (Array.isArray(input)) {
      this.setOutputs(0, input.map(item => clamp(item, this.state.min, this.state.max)));
    }
  }
}
