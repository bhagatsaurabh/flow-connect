import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { NodeCreatorOptions } from "../../core/interfaces";
import { InputType } from "../../math/constants";
import { Log } from "../../utils/logger";

export const JsonSource = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'JSON Source',
        options.position || new Vector2(50, 50),
        options.width || 150, [],
        [{ name: 'value', dataType: 'any' }],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { ...options.props } : {}
    );

    let process = () => {
        if (!input.value || input.value === '') return;
        try {
            let value = JSON.parse(input.value as string);
            node.setOutputs(0, value);
        } catch (error) {
            input.inputEl.style.backgroundColor = 'red';
            Log.error("StandardNode 'JsonSource' json parse error", error);
        }
    }

    let input = node.createInput('', null, true, true, 20, { type: InputType.Text, grow: '.7' } as any);
    input.inputEl.addEventListener('blur', () => process());
    node.ui.append(node.createHozLayout([
        node.createLabel('Value', null, false, false, { grow: '.3' } as any),
        input
    ], { spacing: 20 }));

    node.on('process', () => process());

    return node;
};
