import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Node } from "../../core/node";
import { InputType, Input, Toggle } from "../../ui/index";

export class NumberRange extends Node {
  minInput: Input;
  maxInput: Input;
  stepInput: Input;
  loopToggle: Toggle;

  static DefaultState = { value: 0, min: 0, max: 100, step: 1, loop: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Number Range', options.position || new Vector2(50, 50), options.width || 200,
      [{ name: 'trigger', dataType: 'event' }, { name: 'reset', dataType: 'event' }],
      [{ name: 'value', dataType: 'number' }],
      {
        state: options.state ? { ...NumberRange.DefaultState, ...options.state } : NumberRange.DefaultState,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.state.startValue = this.state.value;

    this.setupUI();

    this.minInput.on('change', () => this.process());
    this.maxInput.on('change', () => this.process());
    this.stepInput.on('change', () => this.process());
    this.loopToggle.on('change', () => this.process());

    this.inputs[0].on('event', () => this.process());
    this.inputs[1].on('event', () => this.state.value = this.state.min);
  }

  process() {
    let value = this.state.value;
    this.state.value = value + this.state.step;
    if (this.state.value < this.state.min) {
      this.state.value = this.state.min;
      if (this.state.loop) this.state.value = this.state.startValue;
      else return;
    } else if (this.state.value > this.state.max) {
      this.state.value = this.state.max;
      if (this.state.loop) this.state.value = this.state.startValue;
      else return;
    } else {
      this.setOutputs(0, value);
    }
  }
  setupUI() {
    this.minInput = this.createInput({ propName: 'min', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .3, step: 'any' } });
    this.maxInput = this.createInput({ propName: 'max', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .3, step: 'any' } });
    this.stepInput = this.createInput({ propName: 'step', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .3, step: 'any' } });
    this.loopToggle = this.createToggle({ propName: 'loop', input: true, output: true, height: 10, style: { grow: .2 } });
    this.ui.append([
      this.createHozLayout([
        this.createLabel('Min', { style: { grow: .2 } }), this.minInput,
        this.createLabel('Max', { style: { grow: .2 } }), this.maxInput
      ], { style: { spacing: 5 } }),
      this.createHozLayout([
        this.createLabel('Step', { style: { grow: .2 } }), this.stepInput
      ], { style: { spacing: 5 } }),
      this.createHozLayout([
        this.createLabel('Loop ?', { style: { grow: .2 } }), this.loopToggle
      ], { style: { spacing: 10 } })
    ]);
  }
}
