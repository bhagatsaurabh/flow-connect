import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui/input";

export const ArraySource = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'Array Source',
    options.position || new Vector2(50, 50),
    options.width || 180, [],
    [{ name: 'array', dataType: 'array' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props
      ? { number: true, range: false, min: 0, max: 100, step: 0.1, value: [], ...options.props }
      : { number: false, range: false, min: 0, max: 100, step: 0.1, value: [] }
  );

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


  let numberToggle = node.createToggle('number', true, true, 10, { grow: .2 } as any);
  let rangeToggle = node.createToggle('range', true, true, 10, { grow: .2 } as any);
  let rangeLayout = node.createHozLayout([node.createLabel('Range ?', null, false, false), rangeToggle], { spacing: 10 });
  let minInput = node.createInput(node.props.min, 'min', false, false, 20, { type: InputType.Number, grow: .4, step: 'any' } as any);
  let maxInput = node.createInput(node.props.max, 'max', false, false, 20, { type: InputType.Number, grow: .4, step: 'any' } as any);
  let rangeInputLayout = node.createHozLayout([
    minInput, node.createLabel('to', null, false, false, { type: InputType.Text, grow: .2 } as any), maxInput
  ], { spacing: 5 });
  let stepInput = node.createInput(node.props.step, 'step', false, false, 20, { type: InputType.Number, step: 'any', grow: .6 } as any);
  let rangeStack = node.createStack([
    rangeInputLayout, node.createHozLayout([node.createLabel('Step', null, false, false, { grow: .4 } as any), stepInput], { spacing: 5 })
  ], { spacing: 10 });
  let arrayInput = node.createInput('', null, false, false, 20, { pattern: '^[^,]+(\s*,\s*[^,]+)*$' });
  node.ui.append([
    node.createHozLayout([node.createLabel('Numbers ?', null, false, false), numberToggle], { spacing: 10 }),
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
