import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";

export const BooleanSource = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'Boolean Source',
        options.position || new Vector2(50, 50),
        options.width || 130, [],
        [{ name: 'value', dataType: 'boolean' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { value: false, ...options.props } : { value: false }
    );

    let process = () => node.setOutputs(0, node.props.value);

    let toggle = node.createToggle('value', true, true, 10, { grow: '.3' } as any);
    node.ui.append(node.createHozLayout([
        node.createLabel('Value', null, false, false),
        toggle
    ], { spacing: 20 }));

    toggle.on('change', process);

    node.on('process', process);

    return node;
};
