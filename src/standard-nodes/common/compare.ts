import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";

export const Compare = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'Compare',
        options.position || new Vector2(50, 50),
        options.width || 150,
        [{ name: 'x', dataType: 'any' }, { name: 'y', dataType: 'any' }],
        [{ name: 'result', dataType: 'boolean' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { value: '==', ...options.props } : { value: '==' }
    );

    node.ui.append(node.createSelect(
        ['==', '===', '!=', '!==', '<', '<=', '>', '>=', '&&', '||'],
        'value', true, true, 15, { fontSize: '14px' })
    );

    node.on('process', (_, inputs) => {
        if (inputs[0] === null || typeof inputs[0] === 'undefined' || inputs[1] === null || typeof inputs[1] === 'undefined') return;
        let res;
        switch (node.props.value) {
            case '==': { res = inputs[0] == inputs[1]; break; }
            case '===': { res = inputs[0] === inputs[1]; break; }
            case '!=': { res = inputs[0] != inputs[1]; break; }
            case '!==': { res = inputs[0] !== inputs[1]; break; }
            case '<': { res = inputs[0] < inputs[1]; break; }
            case '<=': { res = inputs[0] <= inputs[1]; break; }
            case '>': { res = inputs[0] > inputs[1]; break; }
            case '>=': { res = inputs[0] >= inputs[1]; break; }
            case '&&': { res = inputs[0] && inputs[1]; break; }
            case '||': { res = inputs[0] || inputs[1]; break; }
            default: res = false;
        }
        node.setOutputs(0, res);
    });

    return node;
};
