import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { Terminal, TerminalType } from "../../core/terminal.js";
import { Node } from "../../core/node.js";
import { Button } from "../../ui/index.js";

export class SyncEvent extends Node {
  addButton: Button;

  constructor(flow: Flow, options: NodeCreatorOptions = {}, events?: number) {
    super(flow, options.name || 'Sync Event', options.position || new Vector(50, 50), options.width || 160,
      [{ name: 'Event 1', dataType: 'event' }, { name: 'Event 2', dataType: 'event' }],
      [{ name: 'synced', dataType: 'event' }],
      {
        state: options.state ? { ...options.state, hold: {} } : { hold: {} },
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    if (events) {
      for (let i = 0; i < events - 2; i++)
        this.addTerminal(new Terminal(this, TerminalType.IN, 'event', 'Event ' + (this.inputs.length + 1)));
    }
    this.inputs.forEach(terminal => terminal.on('event', (inst, data) => this.process(inst, data)));

    this.setupUI();

    this.addButton.on('click', () => {
      let newTerminal = new Terminal(this, TerminalType.IN, 'event', 'Event ' + (this.inputs.length + 1));
      this.addTerminal(newTerminal);
      newTerminal.on('event', (terminal, data) => this.process(terminal, data));
    });
  }

  process(terminal: Terminal, data: any) {
    this.state.hold[terminal.id] = data;

    let hold = [];
    for (let term of this.inputs) {
      if (this.state.hold.hasOwnProperty(term.id)) {
        hold.push(this.state.hold[term.id]);
      }
      else return;
    }

    this.state.hold = {};
    this.outputs[0].emit(hold);
  }
  setupUI() {
    this.addButton = this.createButton('Add', { input: true, output: true, height: 20 });
    this.ui.append(this.addButton);
  }
}
