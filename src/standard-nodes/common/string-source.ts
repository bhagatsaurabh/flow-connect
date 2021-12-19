import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui/input";

export const StringSource = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'String Source',
    options.position || new Vector2(50, 50),
    options.width || 160, [],
    [{ name: 'value', dataType: 'string' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props ? { value: '', ...options.props } : { value: '' }
  );

  let process = () => node.setOutputs(0, node.props.value);

  let input = node.createInput({ value: '', propName: 'value', input: true, output: true, height: 20, style: { type: InputType.Text, grow: .7 } })
  node.ui.append(node.createHozLayout([
    node.createLabel('Value', { style: { grow: .3 } }), input
  ], { spacing: 10 }));

  input.on('change', process);
  node.on('process', process);

  return node;
};
