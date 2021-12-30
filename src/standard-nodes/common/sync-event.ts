import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Terminal, TerminalType } from "../../core/terminal";

export const SyncEvent = (flow: Flow, options: NodeCreatorOptions = {}, events?: number) => {

  let node = flow.createNode(options.name || 'Sync Event', options.position || new Vector2(50, 50), options.width || 160, {
    inputs: [{ name: 'Event 1', dataType: 'event' }, { name: 'Event 2', dataType: 'event' }],
    outputs: [{ name: 'synced', dataType: 'event' }],
    props: options.props ? { ...options.props, hold: {} } : { hold: {} },
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  if (events) {
    for (let i = 0; i < events - 2; i++)
      node.addTerminal(new Terminal(node, TerminalType.IN, 'event', 'Event ' + (node.inputs.length + 1)));
  }
  node.inputs.forEach(terminal => terminal.on('event', process));

  let process = (terminal: Terminal, data: any) => {
    node.props.hold[terminal.id] = data;

    let hold = [];
    for (let term of node.inputs) {
      if (node.props.hold.hasOwnProperty(term.id)) {
        hold.push(node.props.hold[term.id]);
      }
      else return;
    }

    node.props.hold = {};
    node.outputs[0].emit(hold);
  }

  let addButton = node.createButton('Add', { input: true, output: true, height: 20 });
  node.ui.append(addButton);

  addButton.on('click', () => {
    let newTerminal = new Terminal(node, TerminalType.IN, 'event', 'Event ' + (node.inputs.length + 1));
    node.addTerminal(newTerminal);
    newTerminal.on('event', (terminal, data) => process(terminal, data));
  });

  return node;
};
