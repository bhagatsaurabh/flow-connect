import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType, Input } from "../../ui/input";
import { Node } from "../../core/node";
import { Toggle } from "../../ui/toggle";

export class NumberRange extends Node {
  minInput: Input;
  maxInput: Input;
  stepInput: Input;
  loopToggle: Toggle;

  static DefaultProps = { value: 0, min: 0, max: 100, step: 1, loop: false };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Number Range', options.position || new Vector2(50, 50), options.width || 200,
      [{ name: 'trigger', dataType: 'event' }, { name: 'reset', dataType: 'event' }],
      [{ name: 'value', dataType: 'number' }],
      {
        props: options.props ? { ...NumberRange.DefaultProps, ...options.props } : NumberRange.DefaultProps,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.props.startValue = this.props.value;

    this.setupUI();

    this.minInput.on('change', () => this.process());
    this.maxInput.on('change', () => this.process());
    this.stepInput.on('change', () => this.process());
    this.loopToggle.on('change', () => this.process());

    this.inputs[0].on('event', () => this.process());
    this.inputs[1].on('event', () => this.props.value = this.props.min);
  }

  process() {
    let value = this.props.value;
    this.props.value = value + this.props.step;
    if (this.props.value < this.props.min) {
      this.props.value = this.props.min;
      if (this.props.loop) this.props.value = this.props.startValue;
      else return;
    } else if (this.props.value > this.props.max) {
      this.props.value = this.props.max;
      if (this.props.loop) this.props.value = this.props.startValue;
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
