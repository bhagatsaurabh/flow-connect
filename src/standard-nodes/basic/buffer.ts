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

    node.ui.append(node.createHozLayout(
        [
            node.createLabel('Size', null, false, false, { grow: '.3' } as any),
            node.createInput(node.props.size, 'size', true, true, 20, { type: InputType.Number, grow: '.7' } as any)
        ],
        { spacing: 20 }
    ));

    node.on('process', (_, inputs) => {
        if (!inputs[0]) return;
        if (node.props.buffer.length === node.props.size) node.props.buffer.shift();
        node.props.buffer.push(inputs[0]);
        node.setOutput('buffer', node.props.buffer);
    });

    return node;
};
