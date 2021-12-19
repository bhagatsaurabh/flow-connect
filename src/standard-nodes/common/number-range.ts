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

  let minInput = node.createInput({ propName: 'min', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .3, step: 'any' } });
  let maxInput = node.createInput({ propName: 'max', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .3, step: 'any' } });
  let stepInput = node.createInput({ propName: 'step', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .3, step: 'any' } });
  let loopToggle = node.createToggle({ propName: 'loop', input: true, output: true, height: 10, style: { grow: .2 } });
  node.ui.append([
    node.createHozLayout([
      node.createLabel('Min', { style: { grow: .2 } }), minInput,
      node.createLabel('Max', { style: { grow: .2 } }), maxInput
    ], { spacing: 5 }),
    node.createHozLayout([
      node.createLabel('Step', { style: { grow: .2 } }), stepInput
    ], { spacing: 5 }),
    node.createHozLayout([
      node.createLabel('Loop ?', { style: { grow: .2 } }), loopToggle
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
