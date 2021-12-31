import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType, Input } from "../../ui/input";
import { Align } from "../../common/enums";
import { Node } from "../../core/node";
import { Toggle } from "../../ui/toggle";
import { HorizontalLayout } from "../../ui/horizontal-layout";
import { Stack } from "../../ui/stack";

export class ArraySource extends Node {
  arrayInput: Input;
  minInput: Input;
  maxInput: Input;
  numberToggle: Toggle;
  rangeToggle: Toggle;
  stepInput: Input;
  rangeLayout: HorizontalLayout;
  rangeStack: Stack

  static DefaultProps: any = { number: true, range: false, min: 0, max: 100, step: 0.1, value: [] };

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Array Source', options.position || new Vector2(50, 50), options.width || 180, [],
      [{ name: 'array', dataType: 'array' }],
      {
        props: options.props ? { ...ArraySource.DefaultProps, ...options.props } : ArraySource.DefaultProps,
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );


    this.setupUI();

    this.minInput.on('change', () => this.process());
    this.maxInput.on('change', () => this.process());
    this.numberToggle.on('change', () => this.process());
    this.arrayInput.on('change', () => this.process());
    this.stepInput.on('change', () => this.process());
    this.on('process', () => this.process());

    this.watch('number', () => this.numberToggled());
    this.watch('range', () => this.rangeToggled());

    this.numberToggled();
    this.rangeToggled();
  }

  numberToggled() {
    this.rangeLayout.visible = this.props.number;
    if (!this.props.number) this.props.range = false;
  }
  rangeToggled() {
    if (this.props.number && this.props.range) {
      this.arrayInput.visible = false;
      this.rangeStack.visible = true;
    } else {
      this.arrayInput.visible = true;
      this.rangeStack.visible = false;
    }
  }
  process() {
    if (this.props.range) {
      let values = [];
      for (let i = this.props.min; i <= this.props.max; i += this.props.step) values.push(i);
      this.props.value = values;
    } else {
      if (!this.arrayInput.inputEl.validity.patternMismatch) {
        if (!this.arrayInput.value || this.arrayInput.value === '') return;
        let value: any[] = (this.arrayInput.value as string).split(',');
        if (this.props.number) value = value.map(item => Number(item.trim()));
        this.props.value = value;
      }
    }
    this.setOutputs(0, this.props.value);
  }
  setupUI() {
    this.numberToggle = this.createToggle({ propName: 'number', input: true, output: true, height: 10, style: { grow: .2 } });
    this.rangeToggle = this.createToggle({ propName: 'range', input: true, output: true, height: 10, style: { grow: .2 } });
    this.rangeLayout = this.createHozLayout([this.createLabel('Range ?'), this.rangeToggle], { style: { spacing: 10 } });
    this.minInput = this.createInput({
      propName: 'min', height: 20, style: { type: InputType.Number, grow: .4, step: 'any' }
    });
    this.maxInput = this.createInput({
      propName: 'max', height: 20, style: { type: InputType.Number, grow: .4, step: 'any' }
    });
    let rangeInputLayout = this.createHozLayout([
      this.minInput, this.createLabel('to', { style: { grow: .2, align: Align.Center } }), this.maxInput
    ], { style: { spacing: 5 } });
    let stepInput = this.createInput({ propName: 'step', height: 20, style: { type: InputType.Number, step: 'any', grow: .6 } });
    let rangeStack = this.createStack({
      childs: [
        rangeInputLayout,
        this.createHozLayout([
          this.createLabel('Step', { style: { grow: .4 } }),
          stepInput
        ], { style: { spacing: 5 } })
      ], style: { spacing: 10 }
    });
    let arrayInput = this.createInput({ value: '', height: 20, style: { pattern: '^[^,]+(\s*,\s*[^,]+)*$' } });
    this.ui.append([
      this.createHozLayout([this.createLabel('Numbers ?'), this.numberToggle], { style: { spacing: 10 } }),
      this.rangeLayout,
      rangeStack,
      arrayInput
    ]);
  }
}
