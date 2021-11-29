import { Flow } from "../../core/flow";
import { Vector2 } from "../../math/vector";
import { TerminalType } from "../../math/constants";
import { NodeCreatorOptions } from "../../core/interfaces";
import { Terminal } from "../../core/terminal";
import { Log as Logger } from '../../utils/logger';

export const Log = (flow: Flow, options: NodeCreatorOptions = {}) => {

    let node = flow.createNode(
        options.name || 'Log',
        options.position || new Vector2(50, 50),
        options.width || 170,
        [{ name: 'Log 1', dataType: 'event' }, { name: 'Log 2', dataType: 'any' }], [],
        options.style || { rowHeight: 10 },
        options.terminalStyle || {},
        options.props ? { ...options.props } : {}
    );

    node.inputs[0].on('event', (terminal, data) => Logger.log(terminal.name, data));
    node.inputs[1].on('data', (terminal, data) => Logger.log(terminal.name, data));

    let addEventButton = node.createButton('Add Event', false, false, null, ({ grow: '.5' }) as any);
    addEventButton.on('click', () => {
        let newTerminal = new Terminal(node, TerminalType.IN, 'event', 'Log ' + (node.inputs.length + 1));
        newTerminal.on('event', (terminal, data) => Logger.log(terminal.name, data));
        node.addTerminal(newTerminal);
    });
    let addDataButton = node.createButton('Add Data', false, false, null, ({ grow: '.5' }) as any);
    addDataButton.on('click', () => {
        let newTerminal = new Terminal(node, TerminalType.IN, 'any', 'Log ' + (node.inputs.length + 1));
        newTerminal.on('data', (terminal, data) => Logger.log(terminal.name, data));
        node.addTerminal(newTerminal);
    });
    node.ui.append(node.createHozLayout([addEventButton, addDataButton], { spacing: 20 }));

    return node;
};
