import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";

export const ArraySource = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'Array Source',
        options.position || new Vector2(50, 50),
        options.width || 150, [],
        [{ name: 'array', dataType: 'array' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { number: true, value: [], ...options.props } : { value: [], number: false }
    );

    let process = () => {
        if (!arrayInput.inputEl.validity.patternMismatch) {
            if (!arrayInput.value || arrayInput.value === '') return;
            let value: any[] = (arrayInput.value as string).split(',');
            if (node.props.number) value = value.map(item => Number(item.trim()));
            node.props.value = value;
        }
    };

    let numberToggle = node.createToggle('number', true, true, 10, { grow: '.3' } as any);
    numberToggle.on('change', () => {
        process();
        node.setOutput(0, node.props.value);
    });
    node.ui.append(node.createHozLayout([node.createLabel('Numbers ?', null, false, false), numberToggle], { spacing: 20 }));
    let arrayInput = node.createInput('', null, false, false, 20, { pattern: '^[^,]+(\s*,\s*[^,]+)*$' });
    arrayInput.inputEl.addEventListener('blur', () => process());
    node.ui.append(arrayInput);

    node.on('process', () => node.setOutput(0, node.props.value));

    return node;
};
