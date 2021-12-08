import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";

export const Ceil = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(
    options.name || 'Ceil',
    options.position || new Vector2(50, 50),
    options.width || 120,
    [{ name: 'x', dataType: 'any' }],
    [{ name: '|x|', dataType: 'any' }],
    options.style || { rowHeight: 10 },
    options.terminalStyle || {},
    options.props ? { ...options.props } : {}
  );

  node.on('process', (_, inputs) => {
    if (typeof inputs[0] === 'number') {
      node.setOutputs(0, Math.ceil(inputs[0]));
    } else if (Array.isArray(inputs[0])) {
      node.setOutputs(0, inputs[0].map(item => Math.ceil(item)));
    }
  });

  return node;
};
