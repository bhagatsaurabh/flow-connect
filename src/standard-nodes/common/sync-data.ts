import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Terminal, TerminalType } from "../../core/terminal";

export const SyncData = (flow: Flow, options: NodeCreatorOptions = {}, inputs?: number) => {

  let node = flow.createNode(options.name || 'Sync Data', options.position || new Vector2(50, 50), options.width || 160, {
    inputs: [{ name: 'Data 1', dataType: 'any' }, { name: 'Data 2', dataType: 'any' }],
    outputs: [{ name: 'synced', dataType: 'any' }],
    props: options.props ? { syncType: 'partial', ...options.props, hold: {} } : { syncType: 'partial', hold: {} },
    style: options.style || { rowHeight: 10 },
    terminalStyle: options.terminalStyle || {}
  });

  let eventIds: number[] = [];

  if (inputs) {
    for (let i = 0; i < inputs - 2; i++)
      node.addTerminal(new Terminal(node, TerminalType.IN, 'any', 'Data ' + (node.inputs.length + 1)));
  }

  let syncTypeInput = node.createRadioGroup(['partial', 'full'], node.props.syncType, { propName: 'syncType', height: 20 });
  let addButton = node.createButton('Add', { input: true, output: true, height: 20 });
  node.ui.append([syncTypeInput, addButton]);
  addButton.on('click', () => {
    let newTerminal = new Terminal(node, TerminalType.IN, 'any', 'Data ' + (node.inputs.length + 1));
    node.addTerminal(newTerminal);
    eventIds.push(newTerminal.on('data', process));
  });

  let process = (terminal: Terminal, data: any) => {
    node.props.hold[terminal.id] = data;

    let hold = [];
    for (let term of node.inputs) {
      if (node.props.hold.hasOwnProperty(term.id)) {
        hold.push(node.props.hold[term.id]);
      }
      else return;
    }

    if (node.props.syncType === 'full') node.props.hold = {};
    node.outputs[0].emit(hold);

    for (let terminal of node.inputs) if (terminal.connectors.length > 0 && typeof terminal.getData() === 'undefined') return;
    node.setOutputs(0, node.getInputs());
  }

  for (let terminal of node.inputs) {
    eventIds.push(terminal.on('data', process));
  }

  node.on('process', () => process);

  return node;
};
