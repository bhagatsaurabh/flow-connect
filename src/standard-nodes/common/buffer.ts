import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";
import { InputType } from "../../math/constants";

export const Buffer = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'Buffer',
        options.position || new Vector2(50, 50),
        options.width || 150,
        [{ name: 'data', dataType: 'any' }], [{ name: 'buffer', dataType: 'array' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { buffer: [], size: 10, ...options.props } : { buffer: [], size: 10 }
    );

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

    let sizeInput = node.createInput(node.props.size, 'size', true, true, 20, { type: InputType.Number, grow: '.7' } as any);
    node.ui.append(node.createHozLayout([
        node.createLabel('Size', null, false, false, { grow: '.3' } as any),
        sizeInput
    ], { spacing: 20 }));

    sizeInput.on('change', () => process(node.getInputs()));
    node.on('process', (_, inputs) => process(inputs));

    return node;
};
