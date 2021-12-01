import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";
import { InputType } from "../../math/constants";

export const StringSource = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'String Source',
        options.position || new Vector2(50, 50),
        options.width || 160, [],
        [{ name: 'value', dataType: 'string' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { value: '', ...options.props } : { value: '' }
    );

    let input = node.createInput('', 'value', true, true, 20, { type: InputType.Text, grow: '.7' } as any)
    node.ui.append(node.createHozLayout([
        node.createLabel('Value', null, false, false, { grow: '.3' } as any), input
    ], { spacing: 10 }));

    node.on('process', () => node.setOutputs(0, node.props.value));

    return node;
};
