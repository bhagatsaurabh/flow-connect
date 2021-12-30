import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Terminal, TerminalType } from "../../core/terminal";
import { Log as Logger } from '../../utils/logger';

export const Log = (flow: Flow, options: NodeCreatorOptions = {}) => {

  let node = flow.createNode(options.name || 'Log', options.position || new Vector2(50, 50), options.width || 170, {
    inputs: [{ name: 'Log 1', dataType: 'event' }, { name: 'Log 2', dataType: 'any' }],
    props: options.props ? { ...options.props } : {},
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  node.inputs[0].on('event', (terminal, data) => Logger.log(terminal.name, data));
  node.inputs[1].on('data', (terminal, data) => Logger.log(terminal.name, data));

  let addEventButton = node.createButton('Add Event', { style: { grow: .5 } });
  let addDataButton = node.createButton('Add Data', { style: { grow: .5 } });
  node.ui.append(node.createHozLayout([addEventButton, addDataButton], { style: { spacing: 20 } }));

  let addTerminal = (type: string) => {
    let newTerminal = new Terminal(node, TerminalType.IN, type === 'event' ? type : 'any', 'Log ' + (node.inputs.length + 1));
    newTerminal.on(type, (terminal, data) => Logger.log(terminal.name, data));
    node.addTerminal(newTerminal);
  }
  addEventButton.on('click', () => addTerminal('event'));
  addDataButton.on('click', () => addTerminal('data'));

  return node;
};
