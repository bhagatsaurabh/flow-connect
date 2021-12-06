import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";

export const ToVector2 = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'To Vector2',
        options.position || new Vector2(50, 50),
        options.width || 100,
        [{ name: 'x', dataType: 'number' }, { name: 'y', dataType: 'number' }],
        [{ name: 'vector2', dataType: 'vector2' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { ...options.props } : {}
    );

    node.on('process', (_, inputs) => node.setOutputs(0,
        new Vector2(
            typeof inputs[0] !== 'undefined' && inputs[0] !== null ? inputs[0] : 0,
            typeof inputs[1] !== 'undefined' && inputs[1] !== null ? inputs[1] : 0
        ))
    );

    return node;
};
