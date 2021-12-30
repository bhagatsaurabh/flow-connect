import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Terminal, TerminalType } from "../../core/terminal";

export const ToArray = (flow: Flow, options: NodeCreatorOptions = {}, inputs: number) => {

  let node = flow.createNode(options.name || 'To Array', options.position || new Vector2(50, 50), options.width || 100, {
    inputs: (inputs && inputs > 0
      ? (new Array(inputs).fill(null).map((_, index) => ({ name: 'In ' + (index + 1), dataType: 'any' })))
      : [{ name: 'In 1', dataType: 'any' }]
    ),
    outputs: [{ name: 'out', dataType: 'array' }],
    props: options.props ? { ...options.props } : {},
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  let addButton = node.createButton('Add', { style: { grow: .5 } });
  node.ui.append(addButton);

  addButton.on('click', () => node.addTerminal(new Terminal(node, TerminalType.IN, 'any', 'In ' + node.inputs.length + 1)));
  node.on('process', (_, inputs) => node.setOutputs(0, [...inputs]));

  return node;
};
