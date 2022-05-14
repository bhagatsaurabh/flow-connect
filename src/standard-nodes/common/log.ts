import { Flow } from "../../core/flow.js";
import { Vector } from "../../core/vector.js";
import { NodeCreatorOptions } from "../../common/interfaces.js";
import { Terminal, TerminalType } from "../../core/terminal.js";
import { Log as Logger } from '../../utils/logger.js';
import { Node } from "../../core/node.js";
import { Button } from "../../ui/index.js";

export class Log extends Node {
  addEventButton: Button;
  addDataButton: Button;

  constructor(flow: Flow, options: NodeCreatorOptions = {}) {
    super(flow, options.name || 'Log', options.position || new Vector(50, 50), options.width || 170,
      [{ name: 'Log 1', dataType: 'event' }, { name: 'Log 2', dataType: 'any' }], [],
      {
        state: options.state ? { ...options.state } : {},
        style: options.style || { rowHeight: 10 },
        terminalStyle: options.terminalStyle || {}
      }
    );

    this.inputs[0].on('event', (terminal, data) => Logger.log(terminal.name + ':', data));
    this.inputs[1].on('data', (terminal, data) => Logger.log(terminal.name + ':', data));

    this.setupUI();

    this.addEventButton.on('click', () => this.addNewTerminal('event'));
    this.addDataButton.on('click', () => this.addNewTerminal('data'));
  }

  setupUI() {
    this.addEventButton = this.createButton('Add Event', { style: { grow: .5 } });
    this.addDataButton = this.createButton('Add Data', { style: { grow: .5 } });
    this.ui.append(this.createHozLayout([this.addEventButton, this.addDataButton], { style: { spacing: 20 } }));
  }
  addNewTerminal(type: string) {
    let newTerminal = new Terminal(this, TerminalType.IN, type === 'event' ? type : 'any', 'Log ' + (this.inputs.length + 1));
    newTerminal.on(type, (terminal, data) => Logger.log(terminal.name, data));
    this.addTerminal(newTerminal);
  }
}
