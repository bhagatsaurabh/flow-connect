import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";

export const ArrayIndex = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'Array Index',
        options.position || new Vector2(50, 50),
        options.width || 120,
        [{ name: 'data', dataType: 'array' }, { name: 'index', dataType: 'number' }],
        [{ name: 'value', dataType: 'any' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { ...options.props } : {}
    );

    node.on('process', (_, inputs) => {
        if (!inputs || !inputs[0] || typeof inputs[1] !== 'number') return;
        node.setOutputs(0, inputs[0][inputs[1]]);
    });

    return node;
};
