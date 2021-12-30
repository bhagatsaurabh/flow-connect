import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";

export const BooleanSource = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Boolean Source', options.position || new Vector2(50, 50), options.width || 130, {
    outputs: [{ name: 'value', dataType: 'boolean' }],
    props: options.props ? { value: false, ...options.props } : { value: false },
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  let process = () => node.setOutputs(0, node.props.value);

  let toggle = node.createToggle({ propName: 'value', input: true, output: true, height: 10, style: { grow: .3 } });
  node.ui.append(node.createHozLayout([
    node.createLabel('Value'),
    toggle
  ], { style: { spacing: 20 } }));

  toggle.on('change', process);
  node.on('process', process);

  return node;
};
