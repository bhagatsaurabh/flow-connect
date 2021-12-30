import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { InputType } from "../../ui/input";

export const Buffer = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Buffer', options.position || new Vector2(50, 50), options.width || 150, {
    inputs: [{ name: 'data', dataType: 'any' }],
    outputs: [{ name: 'buffer', dataType: 'array' }],
    props: options.props ? { buffer: [], size: 10, ...options.props } : { buffer: [], size: 10 },
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  let process = (inputs: any[]) => {
    if (inputs[0] === null || typeof inputs[0] === 'undefined') return;
    if (node.props.size <= 0) node.props.size = 1;
    if (node.props.buffer.length === node.props.size) {
      node.props.buffer.shift();
    } else if (node.props.buffer.length > node.props.size) {
      node.props.buffer.splice(0, node.props.buffer.length - node.props.size + 1);
    }
    node.props.buffer.push(inputs[0]);
    node.setOutputs('buffer', node.props.buffer);
  }

  let sizeInput = node.createInput({ propName: 'size', input: true, output: true, height: 20, style: { type: InputType.Number, grow: .7 } });
  node.ui.append(node.createHozLayout([
    node.createLabel('Size', { style: { grow: .3 } }),
    sizeInput
  ], { style: { spacing: 20 } }));

  sizeInput.on('change', () => process(node.getInputs()));
  node.on('process', (_, inputs) => process(inputs));

  return node;
};
