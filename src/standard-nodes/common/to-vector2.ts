import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Log } from "../../utils/logger";

export const ToVector2 = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'To Vector2', options.position || new Vector2(50, 50), options.width || 100, {
    inputs: [{ name: 'x', dataType: 'any' }, { name: 'y', dataType: 'any' }],
    outputs: [{ name: 'vector2', dataType: 'any' }],
    props: options.props ? { ...options.props } : {},
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  node.on('process', (_, inputs) => {
    if (typeof inputs[0] === 'number' && typeof inputs[1] === 'number') {
      node.setOutputs(0, { x: inputs[0], y: inputs[1] });
    } else if (Array.isArray(inputs[0]) && Array.isArray(inputs[1])) {
      let result = [];
      for (let i = 0; i < inputs[0].length; i++) {
        result.push({ x: inputs[0][i], y: inputs[1][i] });
      }
      node.setOutputs(0, result);
    } else {
      Log.error('Type mismatch: Inputs to standard node \'ToVector2\' should be of same type');
    }
  });

  return node;
};
