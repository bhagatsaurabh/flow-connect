import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui/input";

export const NumberRange = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'Number Range',
    options.position || new Vector2(50, 50),
    options.width || 200,
    [{ name: 'trigger', dataType: 'event' }, { name: 'reset', dataType: 'event' }],
    [{ name: 'value', dataType: 'number' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props
      ? { value: 0, min: 0, max: 100, step: 1, loop: false, ...options.props }
      : { value: 0, min: 0, max: 100, step: 1, loop: false }
  );

  node.props.startValue = node.props.value;

  let process = () => {
    let value = node.props.value;
    node.props.value = value + node.props.step;
    if (node.props.value < node.props.min) {
      node.props.value = node.props.min;
      if (node.props.loop) node.props.value = node.props.startValue;
      else return;
    } else if (node.props.value > node.props.max) {
      node.props.value = node.props.max;
      if (node.props.loop) node.props.value = node.props.startValue;
      else return;
    } else {
      node.setOutputs(0, value);
    }
  };

  let minInput = node.createInput(node.props.min, 'min', true, true, 20, { type: InputType.Number, grow: .3, step: 'any' } as any);
  let maxInput = node.createInput(node.props.max, 'max', true, true, 20, { type: InputType.Number, grow: .3, step: 'any' } as any);
  let stepInput = node.createInput(node.props.step, 'step', true, true, 20, { type: InputType.Number, grow: .3, step: 'any' } as any);
  let loopToggle = node.createToggle('loop', true, true, 10, { grow: .2 } as any);
  node.ui.append([
    node.createHozLayout([
      node.createLabel('Min', null, false, false, { grow: .2 } as any), minInput,
      node.createLabel('Max', null, false, false, { grow: .2 } as any), maxInput
    ], { spacing: 5 }),
    node.createHozLayout([
      node.createLabel('Step', null, false, false, { grow: .2 } as any), stepInput
    ], { spacing: 5 }),
    node.createHozLayout([
      node.createLabel('Loop ?', null, false, false, { grow: .2 } as any), loopToggle
    ], { spacing: 10 })
  ]);

  minInput.on('change', process);
  maxInput.on('change', process);
  stepInput.on('change', process);
  loopToggle.on('change', process);
  node.inputs[0].on('event', process);
  node.inputs[1].on('event', () => node.props.value = node.props.min);

  return node;
};
