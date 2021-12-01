import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";

export const Property = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'Property',
        options.position || new Vector2(50, 50),
        options.width || 130,
        [{ name: 'object', dataType: 'any' }, { name: 'key', dataType: 'string' }],
        [{ name: 'value', dataType: 'any' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { ...options.props } : {}
    );

    node.on('process', (_, inputs) => {
        if (!inputs[0]) return;
        node.setOutputs(0, inputs[0][inputs[1]]);
    });

    return node;
};
