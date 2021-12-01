import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";
import { InputType } from "../../math/constants";
import { normalize } from "../../utils/utils";

export const Normalize = (flow: Flow, options: NodeCreatorOptions = {}, type: 'number' | 'array') => {
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;

    let node = flow.createNode(
        options.name || 'Normalize',
        options.position || new Vector2(50, 50),
        options.width || 150,
        [{ name: 'data', dataType: type }], [{ name: 'normalized', dataType: type }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { min: 0, max: 100, relative: false, ...options.props } : { min: 0, max: 100, relative: false }
    );

    let process = () => {
        let data = node.getInput(0);
        if (!data) return;

        let normalized;
        if (type === 'number') {
            normalized = Number(normalize(data, node.props.min, node.props.max).toFixed(2));
        } else {
            if (node.props.relative) {
                let currMin = Math.min(...data);
                let currMax = Math.max(...data);
                if (currMin < min) min = currMin - (node.props.constant || 0);
                if (currMax > max) max = currMax + (node.props.constant || 0);
                normalized = data.map((item: number) => Number(normalize(item, min, max).toFixed(2)));
            } else {
                normalized = data.map((item: number) => Number(normalize(item, node.props.min, node.props.max).toFixed(2)));
            }
        }
        node.setOutputs('normalized', normalized);
    }

    if (type === 'array') {
        let relativeToggle = node.createToggle('relative', false, false, 10, { grow: '.2' } as any);
        node.ui.append(node.createHozLayout([
            node.createLabel('Relative ?', null, false, false),
            relativeToggle
        ], { spacing: 20 }));
        relativeToggle.on('change', process);
    }
    if (type === 'number' || !node.props.relative) {
        let minInput = node.createInput(node.props.min, 'min', false, false, 20, { type: InputType.Number, grow: '.3' } as any);
        let maxInput = node.createInput(node.props.max, 'max', false, false, 20, { type: InputType.Number, grow: '.3' } as any);
        node.ui.append(node.createHozLayout([
            node.createLabel('Min', null, false, false, { grow: '.2' } as any),
            minInput,
            node.createLabel('Max', null, false, false, { grow: '.2' } as any),
            maxInput
        ], { spacing: 5 }));

        minInput.on('change', process);
        maxInput.on('change', process);
    }
    if (node.props.constant) {
        let constantInput = node.createInput(5, 'constant', true, true, 20, { type: InputType.Number, grow: '.5' } as any);
        node.ui.append(node.createHozLayout([
            node.createLabel('Constant', null, false, false),
            constantInput
        ], { spacing: 20 }));

        constantInput.on('change', process);
    }

    node.on('process', process)

    return node;
};
