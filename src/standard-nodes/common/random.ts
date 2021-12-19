import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { getRandom } from "../../utils/utils";
import { InputType } from "../../ui/input";

export const Random = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'Random',
    options.position || new Vector2(50, 50),
    options.width || 150,
    [{ name: 'trigger', dataType: 'event' }],
    [{ name: 'value', dataType: 'number' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props ? { min: 0, max: 100, fractional: false, ...options.props } : { fractional: false, min: 0, max: 100 }
  );

  let process = () => {
    let random;
    if (node.props.fractional) random = getRandom(node.props.min, node.props.max)
    else random = Math.floor(getRandom(Math.floor(node.props.min), Math.floor(node.props.max)));

    node.setOutputs(0, random);
  }

  let minInput = node.createInput({ propName: 'min', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .5, step: 'any' } });
  let maxInput = node.createInput({ propName: 'max', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .5, step: 'any' } });
  let fractional = node.createToggle({ propName: 'fractional', input: true, output: true, height: 10, style: { grow: .2 } });
  node.ui.append([
    node.createHozLayout([
      node.createLabel('Min:'),
      minInput
    ], { spacing: 20 }),
    node.createHozLayout([
      node.createLabel('Max:'),
      maxInput
    ], { spacing: 20 }),
    node.createHozLayout([
      node.createLabel('Fractional ?'),
      fractional
    ], { spacing: 10 })
  ]);

  minInput.on('change', process);
  maxInput.on('change', process);
  fractional.on('change', process);
  node.inputs[0].on('event', process);
  node.on('process', process);

  return node;
};
