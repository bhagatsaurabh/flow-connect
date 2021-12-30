import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";

export const ArrayIndex = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Array Index', options.position || new Vector2(50, 50), options.width || 120, {
    inputs: [{ name: 'data', dataType: 'array' }, { name: 'index', dataType: 'number' }],
    outputs: [{ name: 'value', dataType: 'any' }],
    props: options.props ? { ...options.props } : {},
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  node.on('process', (_, inputs) => {
    if (!inputs || !inputs[0] || typeof inputs[1] !== 'number') return;
    node.setOutputs(0, inputs[0][inputs[1]]);
  });

  return node;
};
