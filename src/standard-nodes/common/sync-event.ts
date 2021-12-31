import { Flow } from "../../core/flow";
import { Vector2 } from "../../core/vector";
import { NodeCreatorOptions } from "../../common/interfaces";
import { Terminal, TerminalType } from "../../core/terminal";
import { Node } from "../../core/node";
import { Button } from "../../ui/button";

export class SyncEvent extends Node {
  addButton: Button;

  constructor(flow: Flow, options: NodeCreatorOptions = {}, events?: number) {
    super(flow, options.name || 'Sync Event', options.position || new Vector2(50, 50), options.width || 160,
      [{ name: 'Event 1', dataType: 'event' }, { name: 'Event 2', dataType: 'event' }],
      [{ name: 'synced', dataType: 'event' }],
      {
        props: options.props ? { ...options.props, hold: {} } : { hold: {} },
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
    this.props.hold[terminal.id] = data;

    let hold = [];
    for (let term of this.inputs) {
      if (this.props.hold.hasOwnProperty(term.id)) {
        hold.push(this.props.hold[term.id]);
      }
      else return;
    }

    this.props.hold = {};
    this.outputs[0].emit(hold);
  }
  setupUI() {
    this.addButton = this.createButton('Add', { input: true, output: true, height: 20 });
    this.ui.append(this.addButton);
  }
}
