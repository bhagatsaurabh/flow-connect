import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui/input";

export const NumberSource = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Number Source', options.position || new Vector2(50, 50), options.width || 160, {
    outputs: [{ name: 'value', dataType: 'number' }],
    props: options.props ? { fractional: false, value: 0, ...options.props } : { fractional: false, value: 0 },
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  let process = () => node.setOutputs(0, node.props.fractional ? node.props.value : Math.floor(node.props.value));

  let fractional = node.createToggle({ propName: 'fractional', input: true, output: true, height: 10, style: { grow: .3 } });
  let input = node.createInput({
    value: 0, propName: 'value', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .6, step: node.props.fractional ? 'any' : '' }
  })
  node.ui.append([
    node.createHozLayout([node.createLabel('Fractional ?', { style: { grow: .5 } }), fractional], { style: { spacing: 20 } }),
    node.createHozLayout([node.createLabel('Value', { style: { grow: .4 } }), input], { style: { spacing: 20 } }),
  ]);

  fractional.on('change', (_inst, _oldVal, newVal) => {
    input.style.step = newVal ? 'any' : '';
    if (!newVal) node.props.value = Math.floor(node.props.value);
    process();
  });
  input.on('change', () => {
    if (!node.props.fractional) node.props.value = Math.floor(node.props.value);
    process();
  });
  node.on('process', process);

  return node;
};
