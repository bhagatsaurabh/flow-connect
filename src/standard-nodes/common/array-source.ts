import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui/input";
import { Align } from "../../common/enums";

export const ArraySource = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Array Source', options.position || new Vector2(50, 50), options.width || 180, {
    outputs: [{ name: 'array', dataType: 'array' }],
    props: options.props
      ? { number: true, range: false, min: 0, max: 100, step: 0.1, value: [], ...options.props }
      : { number: false, range: false, min: 0, max: 100, step: 0.1, value: [] },
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  let process = () => {
    if (node.props.range) {
      let values = [];
      for (let i = node.props.min; i <= node.props.max; i += node.props.step) values.push(i);
      node.props.value = values;
    } else {
      if (!arrayInput.inputEl.validity.patternMismatch) {
        if (!arrayInput.value || arrayInput.value === '') return;
        let value: any[] = (arrayInput.value as string).split(',');
        if (node.props.number) value = value.map(item => Number(item.trim()));
        node.props.value = value;
      }
    }
    node.setOutputs(0, node.props.value);
  };


  let numberToggle = node.createToggle({ propName: 'number', input: true, output: true, height: 10, style: { grow: .2 } });
  let rangeToggle = node.createToggle({ propName: 'range', input: true, output: true, height: 10, style: { grow: .2 } });
  let rangeLayout = node.createHozLayout([node.createLabel('Range ?'), rangeToggle], { style: { spacing: 10 } });
  let minInput = node.createInput({
    propName: 'min', height: 20, style: { type: InputType.Number, grow: .4, step: 'any' }
  });
  let maxInput = node.createInput({
    propName: 'max', height: 20, style: { type: InputType.Number, grow: .4, step: 'any' }
  });
  let rangeInputLayout = node.createHozLayout([
    minInput, node.createLabel('to', { style: { grow: .2, align: Align.Center } }), maxInput
  ], { style: { spacing: 5 } });
  let stepInput = node.createInput({ propName: 'step', height: 20, style: { type: InputType.Number, step: 'any', grow: .6 } });
  let rangeStack = node.createStack({
    childs: [
      rangeInputLayout,
      node.createHozLayout([
        node.createLabel('Step', { style: { grow: .4 } }),
        stepInput
      ], { style: { spacing: 5 } })
    ], style: { spacing: 10 }
  });
  let arrayInput = node.createInput({ value: '', height: 20, style: { pattern: '^[^,]+(\s*,\s*[^,]+)*$' } });
  node.ui.append([
    node.createHozLayout([node.createLabel('Numbers ?'), numberToggle], { style: { spacing: 10 } }),
    rangeLayout,
    rangeStack,
    arrayInput
  ]);

  minInput.on('change', process);
  maxInput.on('change', process);
  numberToggle.on('change', () => process);
  arrayInput.on('change', process);
  stepInput.on('change', process);
  node.on('process', process);

  let numberToggled = () => {
    rangeLayout.visible = node.props.number;
    if (!node.props.number) node.props.range = false;
  };
  let rangeToggled = () => {
    if (node.props.number && node.props.range) {
      arrayInput.visible = false;
      rangeStack.visible = true;
    } else {
      arrayInput.visible = true;
      rangeStack.visible = false;
    }
  }
  node.watch('number', () => numberToggled);
  node.watch('range', rangeToggled);

  numberToggled();
  rangeToggled();

  return node;
};
