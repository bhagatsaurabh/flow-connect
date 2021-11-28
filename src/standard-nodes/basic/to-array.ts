import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { TerminalType } from "../../math/constants";
import { NodeCreatorOptions } from "../../core/interfaces";
import { Terminal } from "../../core/terminal";

export const ToArray = (flow: Flow, options: NodeCreatorOptions = {}, inputs: number) => {

    let node = flow.createNode(
        options.name || 'To Array',
        options.position || new Vector2(50, 50),
        options.width || 100,
        (inputs && inputs > 0
            ? (new Array(inputs).fill(null).map((_, index) => ({ name: 'In ' + (index + 1), dataType: 'any' })))
            : [{ name: 'In 1', dataType: 'any' }]
        ),
        [{ name: 'out', dataType: 'array' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { ...options.props } : {}
    );

    let addButton = node.createButton('Add', false, false, null, ({ grow: '.5' }) as any);
    addButton.on('click', () => node.addTerminal(new Terminal(node, TerminalType.IN, 'any', 'In ' + node.inputs.length + 1)));
    node.ui.append(addButton);

    node.on('process', () => (node.outputs[0] as any).setData([...node.getInputs()]));

    return node;
};
