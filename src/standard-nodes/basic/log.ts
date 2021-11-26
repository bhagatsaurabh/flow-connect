import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { TerminalType } from "../../math/constants";
import { NodeCreatorOptions } from "../../core/interfaces";
import { Terminal } from "../../core/terminal";
import { Log as Logger } from '../../utils/logger';

export const Log = (flow: Flow, options: NodeCreatorOptions = {}) => {
    let count: number = 2;

    let node = flow.createNode(
        options.name || 'Log',
        options.position || new Vector2(50, 50),
        options.width || 150,
        [{ name: 'Log 1', dataType: 'event' }, { name: 'Log 2', dataType: 'any' }], [],
        options.style || { padding: 10, spacing: 10, rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { ...options.props } : {}
    );

    let addEventButton = node.createButton('Add Event', false, false, null, ({ grow: '.5' }) as any);
    addEventButton.on('click', () => {
        count += 1;
        let newTerminal = new Terminal(node, TerminalType.IN, 'event', 'Log ' + count);
        newTerminal.on('event', (_, data) => Logger.log(data));
        node.addTerminal(newTerminal);
    });
    let addDataButton = node.createButton('Add Data', false, false, null, ({ grow: '.5' }) as any);
    addDataButton.on('click', () => {
        count += 1;
        let newTerminal = new Terminal(node, TerminalType.IN, 'any', 'Log ' + count);
        newTerminal.on('data', (data) => Logger.log(data));
        node.addTerminal(newTerminal);
    });
    node.ui.append(node.createHozLayout([addEventButton, addDataButton]));

    return node;
};
