import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { clamp } from "../../utils/utils";
import { InputType } from "../../ui/input";

export const Clamp = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'Clamp',
    options.position || new Vector2(50, 50),
    options.width || 150,
    [{ name: 'x', dataType: 'any' }],
    [{ name: '[x]', dataType: 'any' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props ? { min: 0, max: 100, ...options.props } : { min: 0, max: 100 }
  );

  let minInput = node.createInput({ propName: 'min', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .7 } });
  let maxInput = node.createInput({ propName: 'max', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .7 } });
  node.ui.append([
    node.createHozLayout([
      node.createLabel('Min', { style: { grow: .3 } }),
      minInput
    ], { style: { spacing: 10 } }),
    node.createHozLayout([
      node.createLabel('Max', { style: { grow: .3 } }),
      maxInput
    ], { style: { spacing: 10 } })
  ]);

  let process = (input: number | []) => {
    if (typeof input === 'number') {
      node.setOutputs(0, clamp(input, node.props.min, node.props.max));
    } else if (Array.isArray(input)) {
      node.setOutputs(0, input.map(item => clamp(item, node.props.min, node.props.max)));
    }
  }
  minInput.on('change', () => process(node.getInputs()[0]));
  maxInput.on('change', () => process(node.getInputs()[0]));
  node.on('process', (_, inputs) => process(inputs[0]));

  return node;
};
