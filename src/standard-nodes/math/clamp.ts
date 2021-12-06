import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";
import { clamp } from "../../utils/utils";
import { InputType } from "../../math/constants";

export const Clamp = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'Clamp',
        options.position || new Vector2(50, 50),
        options.width || 150,
        [{ name: 'x', dataType: 'any' }],
        [{ name: '[x]', dataType: 'any' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { min: 0, max: 100, ...options.props } : { min: 0, max: 100 }
    );

    let minInput = node.createInput(node.props.min, 'min', true, true, 20, { type: InputType.Number, grow: .7 } as any);
    let maxInput = node.createInput(node.props.max, 'max', true, true, 20, { type: InputType.Number, grow: .7 } as any);
    node.ui.append([
        node.createHozLayout([
            node.createLabel('Min', null, false, false, { grow: .3 } as any),
            minInput
        ], { spacing: 10 }),
        node.createHozLayout([
            node.createLabel('Max', null, false, false, { grow: .3 } as any),
            maxInput
        ], { spacing: 10 })
    ]);

    let process = (input: number | []) => {
        if (typeof input === 'number') {
            node.setOutputs(0, clamp(input, node.props.min, node.props.max));
        } else if (Array.isArray(input)) {
            node.setOutputs(0, input.map(item => clamp(item, node.props.min, node.props.max)));
        }
    }
    minInput.on('change', () => process(node.getInputs()[0]));
    maxInput.on('change', () => process(node.getInputs()[0]));
    node.on('process', (_, inputs) => process(inputs[0]));

    return node;
};
