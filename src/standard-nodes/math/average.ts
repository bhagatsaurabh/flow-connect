import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";

export const Average = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Average', options.position || new Vector2(50, 50), options.width || 120, {
    inputs: [{ name: 'n', dataType: 'any' }],
    outputs: [{ name: 'μ', dataType: 'any' }],
    props: options.props ? { ...options.props } : {},
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  node.on('process', (_, inputs) => {
    if (Array.isArray(inputs[0])) {
      node.setOutputs(0, inputs[0].reduce((acc, curr) => acc += curr, 0) / inputs[0].length);
    }
  });

  return node;
};
