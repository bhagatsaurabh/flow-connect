import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { getRandom } from "../../utils/utils.js";
import { Node } from "../../core/node.js";
import { InputType, Input, Toggle } from "../../ui/index.js";

export class Random extends Node {
  minInput: Input;
  maxInput: Input;
  fractionalToggle: Toggle;

  static DefaultState = { min: 0, max: 100, fractional: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Random', options.position || new Vector(50, 50), options.width || 150,
      [{ name: 'trigger', dataType: 'event' }],
      [{ name: 'value', dataType: 'number' }],
      {
        state: options.state ? { ...Random.DefaultState, ...options.state } : Random.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.setupUI();

    this.minInput.on('change', () => this.process());
    this.maxInput.on('change', () => this.process());
    this.fractionalToggle.on('change', () => this.process());
    this.inputs[0].on('event', () => this.process());
    this.on('process', () => this.process());
  }

  process() {
    let random;
    if (this.state.fractional) random = getRandom(this.state.min, this.state.max)
    else random = Math.floor(getRandom(Math.floor(this.state.min), Math.floor(this.state.max)));

    this.setOutputs(0, random);
  }
  setupUI() {
    this.minInput = this.createInput({ propName: 'min', input: true, output: true, height: 20, style: { type: InputType.Number, grow: 1, step: 'any' } });
    this.maxInput = this.createInput({ propName: 'max', input: true, output: true, height: 20, style: { type: InputType.Number, grow: 1, step: 'any' } });
    this.fractionalToggle = this.createToggle({ propName: 'fractional', input: true, output: true, height: 10, style: { grow: .2 } });
    this.ui.append([
      this.createHozLayout([
        this.createLabel('Min:', { style: { grow: .3 } }),
        this.minInput
      ], { style: { spacing: 20 } }),
      this.createHozLayout([
        this.createLabel('Max:', { style: { grow: .3 } }),
        this.maxInput
      ], { style: { spacing: 20 } }),
      this.createHozLayout([
        this.createLabel('Fractional ?', { style: { grow: .8 } }),
        this.fractionalToggle
      ], { style: { spacing: 10 } })
    ]);
  }
}
