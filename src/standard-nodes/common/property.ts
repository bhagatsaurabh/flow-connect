import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";

export const Property = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Property', options.position || new Vector2(50, 50), options.width || 130, {
    inputs: [{ name: 'object', dataType: 'any' }, { name: 'key', dataType: 'string' }],
    outputs: [{ name: 'value', dataType: 'any' }],
    props: options.props ? { ...options.props } : {},
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  node.on('process', (_, inputs) => {
    if (!inputs[0]) return;
    node.setOutputs(0, inputs[0][inputs[1]]);
  });

  return node;
};
