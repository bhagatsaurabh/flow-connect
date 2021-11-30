import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";
import { InputType } from "../../math/constants";

export const NumberSource = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'Number Source',
        options.position || new Vector2(50, 50),
        options.width || 160, [],
        [{ name: 'value', dataType: 'number' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { fractional: false, value: 0, ...options.props } : { fractional: false, value: 0 }
    );

    let fractional = node.createToggle('fractional', true, true, 10, { grow: '.3' } as any);
    let input = node.createInput(0, 'value', true, true, 20, { type: InputType.Number, grow: '.6', step: node.props.fractional ? 'any' : '' } as any)
    input.inputEl.addEventListener('blur', () => {
        if (node.props.fractional) node.props.value = Math.floor(node.props.value);
    });
    node.ui.append([
        node.createHozLayout([node.createLabel('Fractional ?', null, false, false, { grow: '.5' } as any), fractional], { spacing: 20 }),
        node.createHozLayout([node.createLabel('Value', null, false, false, { grow: '.4' } as any), input], { spacing: 20 }),
    ]);

    node.on('process', () => {
        node.setOutput(0, node.props.fractional ? node.props.value : Math.floor(node.props.value))
    });

    return node;
};
